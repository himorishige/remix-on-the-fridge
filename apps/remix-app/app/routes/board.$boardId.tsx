import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useLocation } from '@remix-run/react';
import type { Message, Task, UserState } from 'board-do';
import { commitSession, getSession } from '~/session.server';
import { Button, Input } from '~/components/ui';
import { useUpdateAtom } from 'jotai/utils';
import {
  boardIdAtom,
  boardLoaderCallsAtom,
  newMessageAtom,
  newTaskAtom,
  usernameAtom,
  usersStateAtom,
} from '~/state/store';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { StickyArea } from '~/components/layout';
import { MessageArea } from '~/components/layout/MessageArea';
import toast, { Toaster } from 'react-hot-toast';

type LoaderData = {
  loaderCalls: number;
  latestMessages: Message[];
  latestTasks?: Task[];
  boardId: string;
  username: string;
  usersState: UserState[];
};

export const action: ActionFunction = async ({ context: { env }, request }) => {
  const formData = await request.formData();
  const username = formData.get('username') || '';

  if (!username) {
    // throw json(null, { status: 401 });
    // for OG image response
    throw json(null, { status: 200 });
  }

  const session = await getSession(request, env);
  session.set('username', username);

  const url = new URL(request.url);
  return redirect(url.pathname, {
    headers: { 'Set-Cookie': await commitSession(session, env) },
  });
};

export const loader: LoaderFunction = async ({
  context: { env },
  params: { boardId },
  request,
}) => {
  boardId = boardId?.trim();
  const session = await getSession(request, env);
  const username = session.get('username') as string | undefined;

  if (!boardId) {
    return redirect('/');
  }

  if (!username) {
    // throw json(null, { status: 401 });
    // for OG image response
    throw json(null, { status: 200 });
  }

  const board = env.BOARD.get(env.BOARD.idFromString(boardId));
  const latestMessages = board
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

  const latestTasks = board
    .fetch('https://.../tasks')
    .then((response) => {
      if (response.status !== 200) {
        throw new Error(
          'Something went wrong loading latest tasks\n' + response.text(),
        );
      }
      return response;
    })
    .then((response) => {
      return response.json<Task[]>();
    });

  const usersState = board
    .fetch('https://.../usersState')
    .then((response) => {
      if (response.status !== 200) {
        throw new Error(
          'Something went wrong loading latest usersState\n' + response.text(),
        );
      }
      return response;
    })
    .then((response) => {
      return response.json<UserState[]>();
    });

  const counter = env.COUNTER.get(env.COUNTER.idFromName(`board.${boardId}`));
  const loaderCalls = counter
    .fetch('https://.../increment')
    .then((response) => response.text())
    .then((text) => Number.parseInt(text, 10));

  return json<LoaderData>({
    boardId,
    loaderCalls: await loaderCalls,
    latestMessages: await latestMessages,
    latestTasks: await latestTasks,
    usersState: await usersState,
    username,
  });
};

export default function Board() {
  const { key: locationKey } = useLocation();
  const {
    loaderCalls,
    boardId,
    latestMessages,
    username,
    latestTasks = [],
    usersState,
  } = useLoaderData() as LoaderData;

  const setNewMessages = useUpdateAtom(newMessageAtom);
  const setNewTasks = useUpdateAtom(newTaskAtom);
  const setUsersState = useUpdateAtom(usersStateAtom);
  const setUsername = useUpdateAtom(usernameAtom);
  const setBoardId = useUpdateAtom(boardIdAtom);
  const setBoardLoaderCalls = useUpdateAtom(boardLoaderCallsAtom);

  const [socket, setSocket] = useState<ReconnectingWebSocket | null>(null);

  const notify = useCallback(
    (message: string) =>
      toast.success(message, {
        position: 'bottom-center',
      }),
    [],
  );

  useEffect(() => {
    console.log('Board mounted');
    // store global state(Jotai)
    setUsername(username);
    setBoardId(boardId);
    setBoardLoaderCalls(loaderCalls);
    setNewMessages([]);
    setNewTasks([]);
    setUsersState(usersState);

    return () => {
      setUsersState([]);
      setBoardId(null);
      setNewMessages([]);
      setNewTasks([]);
    };
  }, [
    boardId,
    loaderCalls,
    setBoardId,
    setBoardLoaderCalls,
    setNewMessages,
    setNewTasks,
    setUsername,
    setUsersState,
    username,
    usersState,
  ]);

  // initialize
  useEffect(() => {
    const hostname = window.location.host;
    if (!hostname) return;

    console.log('init');

    const socket = new ReconnectingWebSocket(
      `${
        window.location.protocol.startsWith('https') ? 'wss' : 'ws'
      }://${hostname}/board/${boardId}/websocket`,
    );

    let reconnectTimer: any = null;
    let pingPongTimer: any = null;

    const checkConnection = () => {
      reconnectTimer = setTimeout(() => {
        socket.send(JSON.stringify({ ping: 'ping' }));
        pingPongTimer = setTimeout(() => {
          console.log('try to reconnect...');
          pingPongTimer = null;
          socket.reconnect();
        }, 1000);
      }, 30000);
    };

    socket.addEventListener('open', () => {
      console.log('WebSocket opened');
      socket.send(JSON.stringify({ name: username }));
      checkConnection();
    });

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        console.error(data.error);
        return;
      } else if (data.joined) {
        console.log(`${data.joined} joined`);
        setUsersState(data.usersState);
        notify(`${data.joined} joined`);
      } else if (data.quit) {
        console.log(`${data.quit} quit`);
        setUsersState(data.usersState);
        notify(`${data.quit} quit`);
      } else if (data.ready) {
        setSocket(socket);
      } else if (data.message) {
        setNewMessages((previousValue) => [data.message, ...previousValue]);
      } else if (data.task) {
        setNewTasks((previousValue) => [data.task, ...previousValue]);
      } else if (data.completeTask) {
        setNewTasks((previousValue) => [
          ...previousValue.filter(({ id }) => id !== data.completeTask),
        ]);
      } else if (data.ping) {
        if (pingPongTimer) {
          clearTimeout(pingPongTimer);
          pingPongTimer = null;
        }
        return checkConnection();
      }
    });

    return () => {
      console.log('Board unmounted');

      clearTimeout(reconnectTimer);
      reconnectTimer = null;
      socket.close();
    };
  }, [
    boardId,
    setNewMessages,
    setNewTasks,
    setUsersState,
    username,
    locationKey,
    notify,
  ]);

  return (
    <>
      <div className="p-2 bg-sky-700">
        <main className="grid grid-cols-1 min-h-[calc(100vh_-_64px_-_68px)] bg-sky-200 rounded-lg sm:grid-cols-3">
          <MessageArea
            latestMessages={latestMessages}
            username={username}
            socket={socket}
          />
          <div className="col-span-2">
            <StickyArea latestTasks={latestTasks} socket={socket} />
          </div>
        </main>
        <Toaster />
      </div>
    </>
  );
}

export function CatchBoundary() {
  return (
    <>
      <main className="flex items-center min-h-[calc(100vh_-_68px_-_52px)] bg-sky-200">
        <div className="flex flex-col p-8 mx-auto max-w-lg h-full bg-white rounded-lg border border-sky-400 sm:w-4/5">
          <h2 className="mb-3 text-xl font-semibold text-gray-700">
            Choose a Username:
          </h2>
          <Form method="post" id="username-form">
            <Input
              name="username"
              placeholder="Choose a Username"
              required
              maxLength={32}
            />
          </Form>
          <div className="mt-4">
            <Button type="submit" full="true" form="username-form">
              Go!
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
