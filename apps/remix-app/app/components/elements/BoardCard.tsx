import type { Message } from 'board-do';
import { useAtomValue } from 'jotai';
import { usersStateAtom } from '~/state/store';
import { classNames } from '~/utils';
import { IntlDate, UserSelectMenu, UserAvatar } from '~/components/elements';
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
        <UserAvatar user={message.name} isMe={isMe} />
        <div className="flex flex-col grow pl-2">
          <p className="font-medium">{message.name}</p>
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
