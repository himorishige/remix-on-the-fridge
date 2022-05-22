import type { Message } from 'board-do';
import { useAtomValue } from 'jotai';
import { usersStateAtom } from '~/state/store';
import { classNames } from '~/utils';
import { IntlDate, UserSelectMenu } from '~/components/elements';
import type { AddTaskEvent } from '~/routes/board.$boardId';

type Props = {
  message: Message;
  isMe: boolean;
  addTaskHandler: (params: AddTaskEvent) => void;
};

export const BoardCard: React.FC<Props> = ({
  message,
  isMe,
  addTaskHandler,
}) => {
  const usersState = useAtomValue(usersStateAtom);

  return (
    <div className="flex flex-col p-4 h-full text-gray-700 bg-white rounded-lg border border-sky-400">
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
        <UserSelectMenu
          addTaskHandler={addTaskHandler}
          message={message}
          usersState={usersState}
        />
      </div>
    </div>
  );
};
