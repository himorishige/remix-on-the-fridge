import type { KeyboardEventHandler } from 'react';
import { useCallback } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useLocation } from '@remix-run/react';
import type { Message, Task } from 'board-do';

import { commitSession, getSession } from '~/session.server';
import { BoardCard, TaskCard } from '~/components/elements';
import { Button, Input } from '~/components/ui';
import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import {
  boardIdAtom,
  boardLoaderCallsAtom,
  newMessageAtom,
  newTaskAtom,
  userListAtom,
  usernameAtom,
} from '~/state/store';
import { SubHeader } from '~/components/layout';

type AddTaskEvent = {
  message: Message & {
    assignee: string;
  };
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

type LoaderData = {
  loaderCalls: number;
  latestMessages: Message[];
  latestTasks: Task[];
  boardId: string;
  username: string;
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
  // duplicated username
  // .then((data) => {
  //   if (data.find((message) => message.name === username)) {
  //     throw json(null, { status: 401 });
  //   }
  //   return data;
  // });

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
    username,
  });
};

export default function Board() {
  const { key: locationKey } = useLocation();
  const { loaderCalls, boardId, latestMessages, latestTasks, username } =
    useLoaderData() as LoaderData;

  const [newMessages, setNewMessages] = useAtom(newMessageAtom);
  const [newTasks, setNewTasks] = useAtom(newTaskAtom);
  // const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const setUserList = useUpdateAtom(userListAtom);
  const setUsername = useUpdateAtom(usernameAtom);
  const setBoardId = useUpdateAtom(boardIdAtom);
  const setBoardLoaderCalls = useUpdateAtom(boardLoaderCallsAtom);

  const [inputValue, setInputValue] = useState('');

  // for japanese composition
  const [composing, setComposition] = useState(false);
  const startComposition = () => setComposition(true);
  const endComposition = () => setComposition(false);

  // initialize
  useEffect(() => {
    const hostname = window.location.host;
    if (!hostname) return;

    console.log('init');

    // store global state(Jotai)
    setUsername(username);
    setBoardId(boardId);
    setBoardLoaderCalls(loaderCalls);
    setNewMessages([]);
    setNewTasks([]);

    const socket = new WebSocket(
      `${
        window.location.protocol.startsWith('https') ? 'wss' : 'ws'
      }://${hostname}/board/${boardId}/websocket`,
    );
    socket.addEventListener('open', () => {
      console.log('WebSocket opened');
      socket.send(JSON.stringify({ name: username }));
    });

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
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
        console.log(data.message);
        setNewMessages((previousValue) => [data.message, ...previousValue]);
      } else if (data.task) {
        console.log(data.task);
        setNewTasks((previousValue) => [data.task, ...previousValue]);
      } else if (data.closeMessage) {
        console.log(data.closeMessage);
        setNewMessages((previousValue) => [
          ...previousValue.filter(({ id }) => id !== data.closeMessage),
        ]);
      }
    });

    return () => {
      socket.close();
    };
  }, [
    boardId,
    username,
    locationKey,
    setNewMessages,
    setNewTasks,
    setUserList,
    setSocket,
    setUsername,
    setBoardId,
    setBoardLoaderCalls,
    loaderCalls,
  ]);

  const keyDownHandler: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter' && !composing) {
      event.preventDefault();

      if (socket) {
        socket.send(JSON.stringify({ message: inputValue }));
        setInputValue('');
      }
    }
  };

  const sendMessageHandler: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();

    if (socket) {
      socket.send(JSON.stringify({ message: inputValue }));
      setInputValue('');
    }
  };

  const addTaskHandler = useCallback(
    (params: AddTaskEvent) => {
      params.event.preventDefault();

      console.log(params);

      if (socket) {
        socket.send(JSON.stringify({ task: params.message }));
      }
    },
    [socket],
  );

  return (
    <>
      <SubHeader />
      <main className="grid grid-cols-3 gap-4 min-h-[calc(100vh_-_68px_-_52px_-_120px)] bg-sky-200">
        <div className="col-span-2 p-4">
          <div className="flex items-center pt-4 pb-8">
            <div className="pr-2 w-4/5">
              <Input
                type="text"
                name="message"
                placeholder="Input your message"
                onKeyDown={keyDownHandler}
                onCompositionStart={startComposition}
                onCompositionEnd={endComposition}
                disabled={!socket}
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value);
                }}
              />
            </div>
            <div className="flex justify-end w-1/5">
              <Button
                type="button"
                onClick={sendMessageHandler}
                disabled={!socket || !inputValue}
                full="true"
              >
                Send
              </Button>
            </div>
          </div>

          <div className="grid gap-2 -m-2 md:grid-cols-2 lg:grid-cols-3">
            {newMessages.map((message) => (
              <BoardCard
                key={`${message.id}`}
                message={message}
                isMe={username === message.name}
                addTaskHandler={addTaskHandler}
              />
            ))}
            {latestMessages.map((message) => (
              <BoardCard
                key={`${message.id}`}
                message={message}
                isMe={username === message.name}
                addTaskHandler={addTaskHandler}
              />
            ))}
          </div>
        </div>
        <div className="h-full text-gray-700 bg-sky-100">
          <h2 className="text-lg">Tasks</h2>
          <div className="flex flex-col flex-wrap gap-2">
            {newTasks.map((task) => (
              <TaskCard key={`${task.id}`} task={task} />
            ))}
            {latestTasks.map((task) => (
              <TaskCard key={`${task.id}`} task={task} />
            ))}
          </div>
        </div>
      </main>
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
