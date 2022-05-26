import type { KeyboardEventHandler } from 'react';
import { useRef } from 'react';
import { Fragment } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useLocation } from '@remix-run/react';
import type { Message, Task, UserState } from 'board-do';

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
  usernameAtom,
  usersStateAtom,
} from '~/state/store';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Tab, Listbox, Transition } from '@headlessui/react';
import { classNames } from '~/utils';
import { CheckIcon, SelectorIcon } from '~/components/icons';
import { FilterIcon } from '~/components/icons/FilterIcon';

export type AddTaskEvent = {
  message: Message & {
    assignee: string;
  };
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

export type CompleteTaskEvent = {
  taskId: string;
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

type LoaderData = {
  loaderCalls: number;
  latestMessages: Message[];
  latestTasks: Task[];
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
    latestTasks,
    username,
    usersState,
  } = useLoaderData() as LoaderData;

  console.log('---', usersState);

  const [newMessages, setNewMessages] = useAtom(newMessageAtom);
  const [newTasks, setNewTasks] = useAtom(newTaskAtom);
  const setUsersState = useUpdateAtom(usersStateAtom);
  // const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<ReconnectingWebSocket | null>(null);
  const setUsername = useUpdateAtom(usernameAtom);
  const setBoardId = useUpdateAtom(boardIdAtom);
  const setBoardLoaderCalls = useUpdateAtom(boardLoaderCallsAtom);

  const [inputValue, setInputValue] = useState('');

  // for japanese composition
  const [composing, setComposition] = useState(false);
  const startComposition = () => setComposition(true);
  const endComposition = () => setComposition(false);

  const inputRef = useRef<HTMLInputElement>(null);

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
    setUsersState(usersState);

    const socket = new ReconnectingWebSocket(
      `${
        window.location.protocol.startsWith('https') ? 'wss' : 'ws'
      }://${hostname}/board/${boardId}/websocket`,
    );

    let pingPongTimer: any = null;

    const checkConnection = () => {
      setTimeout(() => {
        socket.send(JSON.stringify({ ping: 'ping' }));
        pingPongTimer = setTimeout(() => {
          console.log('再接続を試みます');
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
      console.log('data', data);
      if (data.error) {
        console.error(data.error);
        return;
      } else if (data.joined) {
        console.log(`${data.joined} joined`);
        setUsersState(data.usersState);
      } else if (data.quit) {
        console.log(`${data.quit} quit`);
        setUsersState(data.usersState);
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
      } else if (data.completeTask) {
        console.log(data.completeTask);
        setNewTasks((previousValue) => [
          ...previousValue.filter(({ id }) => id !== data.completeTask),
        ]);
      } else if (data.ping) {
        console.log('pong');
        if (pingPongTimer) {
          clearTimeout(pingPongTimer);
          pingPongTimer = null;
        }
        return checkConnection();
      }
    });

    return () => {
      socket.close();
    };
  }, [
    boardId,
    username,
    locationKey,
    usersState,
    setNewMessages,
    setNewTasks,
    setUsersState,
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
        inputRef.current?.focus();
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
      inputRef.current?.focus();
    }
  };

  const addTaskHandler = (params: AddTaskEvent) => {
    params.event.preventDefault();

    if (socket) {
      socket.send(JSON.stringify({ task: params.message }));
    }
  };

  const completeTaskHandler = (params: CompleteTaskEvent) => {
    params.event.preventDefault();

    if (socket) {
      socket.send(JSON.stringify({ completeTaskId: params.taskId }));
    }
  };

  const people = usersState.map(({ name }) => ({ name }));
  const [selected, setSelected] = useState({ name: 'all' });
  console.log(selected);

  return (
    <>
      <main className="grid grid-cols-1 min-h-[calc(100vh_-_88px_-_52px)] bg-sky-100 sm:grid-cols-3">
        <div className="">
          <div className="">
            <div className="flex items-center px-2 pt-4 pb-2 mx-auto">
              <div className="pr-2 w-4/5">
                <Input
                  type="text"
                  name="message"
                  ref={inputRef}
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
          </div>
          <div className="grid overflow-auto p-2 h-full max-h-60 sm:max-h-full lg:grid-cols-1">
            <div className="">
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
        </div>
        <div className="col-span-2">
          <div className="p-2 pt-5">
            <Listbox value={selected} onChange={setSelected}>
              <div className="relative">
                <Listbox.Button className="relative py-2 pr-10 pl-3 w-full text-left bg-white rounded-lg focus-visible:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 shadow-md cursor-default sm:text-sm">
                  <span className="block truncate">
                    <span className="flex items-center text-gray-700">
                      <span className="mr-2 text-amber-600">
                        <FilterIcon />
                      </span>
                      {selected.name}
                    </span>
                  </span>
                  <span className="flex absolute inset-y-0 right-0 items-center pr-2 pointer-events-none">
                    <SelectorIcon
                      className="w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="overflow-auto absolute z-10 py-1 mt-1 w-full max-h-60 text-base bg-white rounded-md focus:outline-none ring-1 ring-black/5 shadow-lg sm:text-sm">
                    {people.map((person, personIdx) => (
                      <Listbox.Option
                        key={personIdx}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active
                              ? 'bg-amber-100 text-amber-900'
                              : 'text-gray-700'
                          }`
                        }
                        value={person}
                      >
                        {() => (
                          <>
                            <span
                              className={`block truncate ${
                                selected.name === person.name
                                  ? 'font-medium'
                                  : 'font-normal'
                              }`}
                            >
                              {person.name}
                            </span>
                            {selected.name === person.name ? (
                              <span className="flex absolute inset-y-0 left-0 items-center pl-3 text-amber-600">
                                <CheckIcon
                                  className="w-5 h-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
          <div className="grid gap-2 p-2 sm:grid-cols-2 xl:grid-cols-3">
            {newTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                completeTaskHandler={completeTaskHandler}
              />
            ))}
            {latestTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                completeTaskHandler={completeTaskHandler}
              />
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
      <main className="flex items-center min-h-[calc(100vh_-_68px_-_52px)] bg-sky-300">
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
