import type { Message } from 'board-do';
import { useAtomValue } from 'jotai';
import { usersStateAtom } from '~/state/store';
import { IntlDate, UserSelectMenu, UserAvatar } from '~/components/elements';
import type { AddTaskEvent } from '~/components/layout/MessageArea';

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
    <div className="flex flex-row p-2 py-4 pr-0 text-gray-700 border-t border-sky-400">
      <div className="flex items-start pr-2">
        <UserAvatar user={message.name} isMe={isMe} size="small" />
      </div>

      <div className="flex flex-col justify-center w-full">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <div className="flex flex-col grow">
              <p className="text-xs">{message.name}</p>
              <p className="text-xs text-gray-500">
                <IntlDate date={new Date(message.timestamp)} />
              </p>
            </div>
          </div>
          <div className="flex ml-auto">
            <UserSelectMenu
              addTaskHandler={addTaskHandler}
              message={message}
              usersState={usersState}
            />
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs break-all sm:text-sm">{message.message}</p>
        </div>
      </div>
    </div>
  );
};
