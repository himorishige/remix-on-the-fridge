import type { KeyboardEventHandler } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useLocation } from '@remix-run/react';
import type { Message } from 'board-do';

import { commitSession, getSession } from '~/session.server';
import { BoardCard } from '~/components/elements';
import { Button, Input } from '~/components/ui';
import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import {
  boardIdAtom,
  boardLoaderCallsAtom,
  inputValueAtom,
  newMessageAtom,
  socketAtom,
  userListAtom,
  usernameAtom,
} from '~/state/store';

type LoaderData = {
  loaderCalls: number;
  latestMessages: Message[];
  boardId: string;
  username: string;
};

export let action: ActionFunction = async ({ context: { env }, request }) => {
  const formData = await request.formData();
  const username = formData.get('username') || '';

  if (!username) {
    throw json(null, { status: 401 });
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
    throw json(null, { status: 401 });
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

  const counter = env.COUNTER.get(env.COUNTER.idFromName(`board.${boardId}`));
  const loaderCalls = counter
    .fetch('https://.../increment')
    .then((response) => response.text())
    .then((text) => Number.parseInt(text, 10));

  return json<LoaderData>({
    boardId,
    loaderCalls: await loaderCalls,
    latestMessages: await latestMessages,
    username,
  });
};

export default function Board() {
  const { key: locationKey } = useLocation();
  const { loaderCalls, boardId, latestMessages, username } =
    useLoaderData() as LoaderData;

  console.log(latestMessages);

  const [newMessages, setNewMessages] = useAtom(newMessageAtom);
  const [socket, setSocket] = useAtom(socketAtom);
  const setUserList = useUpdateAtom(userListAtom);
  const setUsername = useUpdateAtom(usernameAtom);
  const setBoardId = useUpdateAtom(boardIdAtom);
  const setBoardLoaderCalls = useUpdateAtom(boardLoaderCallsAtom);

  const [inputValue, setInputValue] = useAtom(inputValueAtom);

  // for japanese composition
  const [composing, setComposition] = useState(false);
  const startComposition = () => setComposition(true);
  const endComposition = () => setComposition(false);

  // initialize
  useEffect(() => {
    const hostname = window.location.host;
    if (!hostname) return;

    console.log('effect');

    // store global state(Jotai)
    setUsername(username);
    setBoardId(boardId);
    setBoardLoaderCalls(loaderCalls);

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
        setNewMessages((previousValue) => [data, ...previousValue]);
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

  return (
    <main className="p-4">
      <div className="flex items-center pb-8">
        <div className="pr-2 w-4/5">
          <Input
            type="text"
            name="message"
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
      <div className="flex flex-wrap -m-2">
        {newMessages.map((message) => (
          <BoardCard
            key={`${message.timestamp}`}
            message={message}
            isMe={username === message.name}
          />
        ))}
        {latestMessages.map((message) => (
          <BoardCard
            key={`${message.timestamp}`}
            message={message}
            isMe={username === message.name}
          />
        ))}
      </div>
    </main>
  );
}

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
