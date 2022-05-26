import { RateLimiterClient } from 'rate-limiter-do';
import { handleErrors } from './utils';

export interface Message {
  id: string;
  message: string;
  name: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  timestamp: number;
  status: 'pending' | 'assigned' | 'done';
  owner: string;
  assignee: string;
}

export type Session = {
  webSocket: WebSocket;
  blockedMessages: string[];
  quit?: boolean;
  name?: string;
};

export type UserState = {
  id: string;
  name: string;
  online: boolean;
};

export default class BoardDurableObject {
  private sessions: Session[] = [];
  private lastTimestamp: number = 0;
  private usersState: UserState[] = [];
  private tasks: Task[] = [];
  private boardId: string = '';

  constructor(private state: DurableObjectState, private env: Env) {
    this.state.blockConcurrencyWhile(async () => {
      const storedTasksValue = await this.state.storage.get<Task[]>('tasks');
      this.tasks = storedTasksValue || [];

      this.boardId = this.state.id.toString();
    });
  }

  async fetch(request: Request) {
    return handleErrors(request, async () => {
      const url = new URL(request.url);

      if (url.pathname === '/latest') {
        const data = await this.state.storage.list<Message>({
          reverse: true,
          limit: 100,
        });
        const messages = [...data.values()];
        console.log(messages);

        return new Response(JSON.stringify(messages));
      } else if (url.pathname === '/tasks') {
        //
        const stickyId = this.env.STICKY.idFromName(this.state.id.toString());
        const sticky = this.env.STICKY.get(stickyId);

        const stickyResponse = await sticky.fetch('https://.../latest');
        return new Response(JSON.stringify(await stickyResponse.json()));
        //
      } else if (url.pathname === '/usersState') {
        //
        const userStateId = this.env.USER_STATE.idFromName(
          this.state.id.toString(),
        );
        const userState = this.env.USER_STATE.get(userStateId);

        const userStateResponse = await userState.fetch('https://.../latest');
        return new Response(JSON.stringify(await userStateResponse.json()));
        //
      } else if (url.pathname.startsWith('/websocket')) {
        if (request.headers.get('Upgrade') != 'websocket') {
          return new Response('expected websocket', { status: 400 });
        }

        // Get the client's IP address for use with the rate limiter.
        let ip = request.headers.get('CF-Connecting-IP');
        if (!ip) throw new Error('No IP address');

        // To accept the WebSocket request, we create a WebSocketPair (which is like a socketpair,
        // i.e. two WebSockets that talk to each other), we return one end of the pair in the
        // response, and we operate on the other end. Note that this API is not part of the
        // Fetch API standard; unfortunately, the Fetch API / Service Workers specs do not define
        // any way to act as a WebSocket server today.
        const pair = new WebSocketPair();

        // We're going to take pair[1] as our end, and return pair[0] to the client.
        await this.handleSession(pair[1], ip);

        // Now we return the other end of the pair to the client.
        return new Response(null, { status: 101, webSocket: pair[0] });
      }

      return new Response('Not found', { status: 404 });
    });
  }

  private async handleSession(webSocket: WebSocket, ip: string) {
    // Accept our end of the WebSocket. This tells the runtime that we'll be terminating the
    // WebSocket in JavaScript, not sending it elsewhere.
    // @ts-expect-error
    webSocket.accept();

    // Set up our rate limiter client.
    const limiterId = this.env.RATE_LIMITER.idFromName(ip);
    const limiter = new RateLimiterClient(
      () => this.env.RATE_LIMITER.get(limiterId),
      (error: any) => {
        console.log(error);
        webSocket.close(1011, 'Something went wrong');
      },
    );

    // Create our session and add it to the sessions list.
    // We don't send any messages to the client until it has sent us the initial user info
    // message. Until then, we will queue messages in `session.blockedMessages`.
    const session: Session = { webSocket, blockedMessages: [] };
    this.sessions.push(session);

    // Load the last 100 messages from the chat history stored on disk, and send them to the
    // client.
    // let storage = await this.state.storage.list<Message>({
    //   reverse: true,
    //   limit: 100,
    // });
    // let backlog = [...storage.values()];
    // backlog.reverse();
    // backlog.forEach((value) => {
    //   session.blockedMessages.push(JSON.stringify(value));
    // });

    let receivedUserInfo = false;
    webSocket.addEventListener('message', async (msg) => {
      try {
        if (session.quit) {
          // Whoops, when trying to send to this WebSocket in the past, it threw an exception and
          // we marked it broken. But somehow we got another message? I guess try sending a
          // close(), which might throw, in which case we'll try to send an error, which will also
          // throw, and whatever, at least we won't accept the message. (This probably can't
          // actually happen. This is defensive coding.)
          webSocket.close(1011, 'WebSocket broken.');
          return;
        }

        // Check if the user is over their rate limit and reject the message if so.
        if (!limiter.checkLimit()) {
          webSocket.send(
            JSON.stringify({
              error: 'Your IP is being rate-limited, please try again later.',
            }),
          );
          return;
        }

        // I guess we'll use JSON.
        let data = JSON.parse(msg.data);
        console.log('msg data', data);

        if (!receivedUserInfo) {
          // The first message the client sends is the user info message with their name. Save it
          // into their session object.
          session.name = '' + (data.name || 'anonymous');
          // Don't let people use ridiculously long names. (This is also enforced on the client,
          // so if they get here they are not using the intended client.)
          if (session.name.length > 32) {
            webSocket.send(JSON.stringify({ error: 'Name too long.' }));
            webSocket.close(1009, 'Name too long.');
            return;
          }

          // Deliver all the messages we queued up since the user connected.
          session.blockedMessages.forEach((queued) => {
            webSocket.send(queued);
          });
          session.blockedMessages = [];

          const userStateId = this.env.USER_STATE.idFromName(
            this.state.id.toString(),
          );
          const userState = this.env.USER_STATE.get(userStateId);

          const userData: UserState = {
            id: new Date(Date.now()).toISOString(),
            name: session.name,
            online: true,
          };

          await userState.fetch('https://.../add', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: { 'Content-Type': 'application/json' },
          });

          // Save UserState for this user.

          // if (
          //   this.usersState.filter((user) => user.name === session.name)
          //     .length === 0
          // ) {
          //   const sessionData: UserState = {
          //     id: uuid(),
          //     name: session.name || 'anonymous',
          //     online: true,
          //   };
          //   this.usersState = [...this.usersState, sessionData];
          //   await this.state.storage.put('usersState', [
          //     ...this.usersState,
          //     sessionData,
          //   ]);
          // } else {
          //   this.usersState = this.usersState.map((user) => {
          //     if (user.name === session.name) {
          //       return {
          //         ...user,
          //         online: true,
          //       };
          //     }
          //     return user;
          //   });
          //   await this.state.storage.put('usersState', this.usersState);
          // }

          // Broadcast to all other connections that this user has joined.
          this.broadcast({
            joined: session.name,
            usersState: await (
              await userState.fetch('https://.../latest')
            ).json(),
          });

          webSocket.send(JSON.stringify({ ready: true }));

          // Note that we've now received the user info message.
          receivedUserInfo = true;

          return;
        }

        console.log('receiveData', data);

        // message sequence
        if ('message' in data) {
          // Construct sanitized message for storage and broadcast.
          data = { name: session.name, message: '' + data.message };

          // Block people from sending overly long messages. This is also enforced on the client,
          // so to trigger this the user must be bypassing the client code.
          if (data.message.length > 256) {
            webSocket.send(JSON.stringify({ error: 'Message too long.' }));
            return;
          }

          // Add timestamp. Here's where this.lastTimestamp comes in -- if we receive a bunch of
          // messages at the same time (or if the clock somehow goes backwards????), we'll assign
          // them sequential timestamps, so at least the ordering is maintained.
          data.timestamp = Math.max(Date.now(), this.lastTimestamp + 1);
          this.lastTimestamp = data.timestamp;

          // Construct data for storage.
          const messageData: Message = {
            id: new Date(data.timestamp).toISOString(),
            name: session.name || 'anonymous',
            timestamp: this.lastTimestamp,
            message: data.message,
          };

          // Broadcast the message to all other WebSockets.
          this.broadcast({ message: messageData });

          await this.state.storage.put(messageData.id, messageData);

          // end of message sequence
        } else if ('task' in data) {
          // start of task sequence

          const saveData: Task = {
            id: new Date(Date.now()).toISOString(),
            title: data.task.message,
            timestamp: Date.now(),
            status: 'assigned',
            assignee: data.task.assignee,
            owner: data.task.name,
          };

          // Save task.
          const stickyId = this.env.STICKY.idFromName(this.state.id.toString());
          const sticky = this.env.STICKY.get(stickyId);
          const stickyResponse = await sticky.fetch('https://.../add', {
            method: 'POST',
            body: JSON.stringify(saveData),
            headers: { 'Content-Type': 'application/json' },
          });

          this.broadcast({ task: await stickyResponse.json() });

          // end of task sequence
        } else if ('completeTaskId' in data) {
          const stickyId = this.env.STICKY.idFromName(this.state.id.toString());
          const sticky = this.env.STICKY.get(stickyId);
          const stickyResponse = await sticky.fetch('https://.../delete', {
            method: 'POST',
            body: JSON.stringify({ id: data.completeTaskId }),
            headers: { 'Content-Type': 'application/json' },
          });

          this.broadcast({
            completeTask: data.completeTaskId,
            response: await stickyResponse.json(),
          });

          // end of completeTask sequence
        } else if ('ping' in data) {
          webSocket.send(JSON.stringify({ ping: 'pong' }));
        }
      } catch (error) {
        console.log(error);
        webSocket.send(JSON.stringify({ error: 'Something went wrong' }));
      }
    });

    // On "close" and "error" events, remove the WebSocket from the sessions list and broadcast
    // a quit message.
    const closeOrErrorHandler = async () => {
      session.quit = true;
      this.sessions = this.sessions.filter((member) => member !== session);

      // Update usersState

      // const usersState = [
      //   ...this.usersState.map((state) => {
      //     if (state.name === session.name) {
      //       return {
      //         ...state,
      //         online: false,
      //       };
      //     }
      //     return state;
      //   }),
      // ];
      // await this.state.storage.put('usersState', usersState);

      if (session.name) {
        const userStateId = this.env.USER_STATE.idFromName(
          this.state.id.toString(),
        );
        const userState = this.env.USER_STATE.get(userStateId);

        await userState.fetch('https://.../delete', {
          method: 'POST',
          body: JSON.stringify({ id: session.name }),
          headers: { 'Content-Type': 'application/json' },
        });

        this.broadcast({
          quit: session.name,
          usersState: await (
            await userState.fetch('https://.../latest')
          ).json(),
        });
      }
    };
    webSocket.addEventListener('close', closeOrErrorHandler);
    webSocket.addEventListener('error', closeOrErrorHandler);
  }

  // broadcast() broadcasts a message to all clients.
  private broadcast(event: unknown) {
    // Apply JSON if we weren't given a string to start with.
    const message = typeof event !== 'string' ? JSON.stringify(event) : event;

    // Iterate over all the sessions sending them messages.
    const quitters: Session[] = [];
    this.sessions = this.sessions.filter((session) => {
      if (session.name) {
        try {
          session.webSocket.send(message);
          return true;
        } catch (err) {
          // Whoops, this connection is dead. Remove it from the list and arrange to notify
          // everyone below.
          session.quit = true;
          quitters.push(session);
          return false;
        }
      } else {
        // This session hasn't sent the initial user info message yet, so we're not sending them
        // messages yet (no secret lurking!). Queue the message to be sent later.
        session.blockedMessages.push(message);
        return true;
      }
    });

    quitters.forEach((quitter) => {
      if (quitter.name) {
        this.broadcast({ quit: quitter.name });
      }
    });
  }
}
