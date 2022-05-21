import type { Message } from 'board-do';
import { classNames, timestampToLocalString } from '~/utils';
import { IntlDate } from './IntlDate';

type Props = {
  message: Message;
  isMe: boolean;
};

export const BoardCard: React.FC<Props> = ({ message, isMe }) => {
  return (
    <div
      className="p-2 w-full text-gray-700 md:w-1/2 lg:w-1/3"
      key={`${message.timestamp}${message.name}${message.message}`}
    >
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
          {message.status} toTask
        </div>
      </div>
    </div>
  );
};
