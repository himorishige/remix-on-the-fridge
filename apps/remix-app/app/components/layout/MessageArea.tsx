import React, { useRef, useState } from 'react';
import { Button, Input } from '~/components/ui';
import { BoardCard } from '~/components/elements';
import { useAtomValue } from 'jotai';
import { newMessageAtom } from '~/state/store';
import type ReconnectingWebSocket from 'reconnecting-websocket';
import type { Message } from 'board-do';

type Props = {
  socket: ReconnectingWebSocket | null;
  latestMessages: Message[];
  username: string;
};

export type AddTaskEvent = {
  message: {
    name: string;
    assignee: string;
    message: string;
  };
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

export const MessageArea: React.FC<Props> = ({
  socket,
  latestMessages,
  username,
}) => {
  const newMessages = useAtomValue(newMessageAtom);

  // for japanese composition
  const [composing, setComposition] = useState(false);
  const startComposition = () => setComposition(true);
  const endComposition = () => setComposition(false);

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const keyDownHandler: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
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

  return (
    <>
      <div className="lg:grid-cols-1">
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
        <div className="flex p-2">
          <div className="w-full">
            {latestMessages.length === 0 && newMessages.length === 0 ? (
              <div className="text-center">
                <p className="text-gray-500">No messages</p>
              </div>
            ) : null}
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
    </>
  );
};
