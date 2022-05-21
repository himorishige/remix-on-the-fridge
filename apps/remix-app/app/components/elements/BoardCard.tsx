import type { Message } from 'board-do';
import { useAtomValue } from 'jotai';
import { usernameAtom } from '~/state/store';
import { classNames } from '~/utils';
import { Button } from '../ui';
import { IntlDate } from './IntlDate';

type Event = {
  message: Message & { assignee: string };
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

type Props = {
  message: Message;
  isMe: boolean;
  addTaskHandler: (params: Event) => void;
};

export const BoardCard: React.FC<Props> = ({
  message,
  isMe,
  addTaskHandler,
}) => {
  const username = useAtomValue(usernameAtom);

  return (
    <div className="p-2 w-full text-gray-700">
      <div className="flex flex-col p-4 h-full bg-white rounded-lg border border-sky-400">
        <div className="flex items-center mb-4">
          <div
            className={classNames(
              `flex justify-center items-center w-12 h-12 rounded-full`,
              isMe ? 'bg-indigo-300' : 'bg-indigo-100',
            )}
          >
            <img
              src={`https://avatars.dicebear.com/api/pixel-art/${message.name}.svg`}
              alt={message.name}
              className="overflow-hidden w-12 h-12 rounded-full"
            />
          </div>
          <div className="flex flex-col grow pl-2">
            <p className="text-lg font-medium">{message.name}</p>
            <p className="text-xs text-gray-400">
              <IntlDate date={new Date(message.timestamp)} />
            </p>
          </div>
        </div>
        <div>
          <p>{message.message}</p>
        </div>
        <div className="flex justify-end items-center pt-4 mt-auto">
          <Button
            onClick={(event) =>
              addTaskHandler({
                message: { ...message, assignee: username || 'anonymous' },
                event,
              })
            }
          >
            <svg
              width={18}
              height={18}
              fill="none"
              viewBox="0 0 22 24"
              className="mr-1"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M11.25 19.25H7.75C6.64543 19.25 5.75 18.3546 5.75 17.25V6.75C5.75 5.64543 6.64543 4.75 7.75 4.75H14L18.25 9V11.25"
              />
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17 14.75V19.25"
              />
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19.25 17L14.75 17"
              />
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M18 9.25H13.75V5"
              />
            </svg>
            <span className="text-sm">Convert to Task</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
