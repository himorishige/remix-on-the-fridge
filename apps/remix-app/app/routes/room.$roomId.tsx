import type { FC, KeyboardEventHandler } from 'react';
import { useEffect, useState } from 'react';
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useLocation } from '@remix-run/react';
import type { Message } from 'board-do';

import { commitSession, getSession } from '~/session.server';
import { BoardCard } from '~/components/elements';
import { Input } from '~/components/ui';

type LoaderData = {
  loaderCalls: number;
  latestMessages: Message[];
  roomId: string;
  username: string;
};

export let action: ActionFunction = async ({ context: { env }, request }) => {
  let formData = await request.formData();
  let username = formData.get('username') || '';

  if (!username) {
    throw json(null, { status: 401 });
  }

  let session = await getSession(request, env);
  session.set('username', username);

  let url = new URL(request.url);
  return redirect(url.pathname, {
    headers: { 'Set-Cookie': await commitSession(session, env) },
  });
};

export let loader: LoaderFunction = async ({
  context: { env },
  params: { roomId },
  request,
}) => {
  roomId = roomId?.trim();
  let session = await getSession(request, env);
  let username = session.get('username') as string | undefined;

  if (!roomId) {
    return redirect('/');
  }

  if (!username) {
    throw json(null, { status: 401 });
  }

  let chatRoom = env.BOARD.get(env.BOARD.idFromString(roomId));
  let latestMessages = chatRoom
    .fetch('https://.../latest')
    .then((response) => {
      if (response.status !== 200) {
        throw new Error(
          'Something went wrong loading latest messages\n' + response.text(),
        );
      }
      return response;
    })
    .then((response) => {
      return response.json<Message[]>();
    });

  // let userList = chatRoom
  //   .fetch('https://.../users')
  //   .then((response) => {
  //     if (response.status !== 200) {
  //       throw new Error(
  //         'Something went wrong loading latest messages\n' + response.text(),
  //       );
  //     }
  //     return response;
  //   })
  //   .then((response) => response.json<Session[]>());

  let counter = env.COUNTER.get(env.COUNTER.idFromName(`room.${roomId}`));
  let loaderCalls = counter
    .fetch('https://.../increment')
    .then((response) => response.text())
    .then((text) => Number.parseInt(text, 10));

  return json<LoaderData>({
    roomId,
    loaderCalls: await loaderCalls,
    latestMessages: await latestMessages,
    username,
  });
};

export default function Room() {
  let { key: locationKey } = useLocation();
  let { loaderCalls, roomId, latestMessages, username } =
    useLoaderData() as LoaderData;

  console.log(latestMessages);

  let [newMessages, setNewMessages] = useState<Message[]>([]);
  let [socket, setSocket] = useState<WebSocket | null>(null);
  const [userList, setUserList] = useState<string[]>([]);

  useEffect(() => {
    let hostname = window.location.host;
    if (!hostname) return;

    let socket = new WebSocket(
      `${
        window.location.protocol.startsWith('https') ? 'wss' : 'ws'
      }://${hostname}/room/${roomId}/websocket`,
    );
    socket.addEventListener('open', () => {
      console.log('WebSocket opened');
      socket.send(JSON.stringify({ name: username }));
    });

    socket.addEventListener('message', (event) => {
      let data = JSON.parse(event.data);
      console.log('data', data);
      if (data.error) {
        console.error(data.error);
        return;
      } else if (data.joined) {
        console.log(`${data.joined} joined`);
        setUserList(data.loginUsers);
      } else if (data.quit) {
        console.log(`${data.quit} quit`);
        setUserList(data.loginUsers);
      } else if (data.ready) {
        setSocket(socket);
      } else if (data.message) {
        setNewMessages((previousValue) => [data, ...previousValue]);
      }
    });

    return () => {
      socket.close();
    };
  }, [roomId, username, locationKey, setNewMessages]);

  let handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      let input = event.currentTarget;
      let message = input.value;
      input.value = '';
      if (socket) {
        socket.send(JSON.stringify({ message }));
      }
    }
  };

  return (
    <main>
      <dl>
        <dt>Board ID</dt>
        <dd style={{ wordBreak: 'break-all' }}>{roomId}</dd>
        <dt>Visits</dt>
        <dd>{loaderCalls}</dd>
      </dl>
      <hr />
      {userList.map((user) => (
        <UserItem key={user} user={user} />
      ))}
      <hr />
      <label>
        Send a message:
        <br />
        <Input
          type="text"
          name="message"
          onKeyDown={handleKeyDown}
          disabled={!socket}
        />
      </label>
      <hr />
      <div className="flex flex-wrap -m-4">
        {newMessages.map((message) => (
          <BoardCard key={`${message.timestamp}`} message={message} />
        ))}
        {latestMessages.map((message) => (
          <BoardCard key={`${message.timestamp}`} message={message} />
        ))}
      </div>
    </main>
  );
}

const UserItem: FC<{ user: string }> = ({ user }) => {
  return (
    <div key={user}>
      <img
        src={`https://avatars.dicebear.com/api/pixel-art/${user}.svg`}
        alt={user}
        className="overflow-hidden w-12 h-12 rounded-full"
      />
    </div>
  );
};

export function CatchBoundary() {
  return (
    <main>
      <Form method="post">
        <input type="text" name="username" placeholder="username" />
        <button>Go!</button>
      </Form>
    </main>
  );
}
