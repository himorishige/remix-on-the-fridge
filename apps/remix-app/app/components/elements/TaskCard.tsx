import type { Task } from 'board-do';
import { classNames } from '~/utils';
import { Button } from '~/components/ui';
import { IntlDate, UserAvatar } from '~/components/elements';
import { CheckIcon, DoubleArrowRight } from '~/components/icons';
import type { CompleteTaskEvent } from '~/routes/board.$boardId';

type Props = {
  task: Task;
  completeTaskHandler: (params: CompleteTaskEvent) => void;
};

export const TaskCard: React.FC<Props> = ({ task, completeTaskHandler }) => {
  const isMe = false;
  return (
    <div className="flex flex-col p-4 h-full text-gray-700 bg-white rounded-lg border border-sky-400">
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          <UserAvatar user={task.owner} isMe={isMe} />
          <DoubleArrowRight className="w-4 h-4" />
          <UserAvatar user={task.assignee} isMe={isMe} />
        </div>
        <div className="flex flex-col grow pl-2">
          <p className="font-medium">{task.assignee}</p>
          <p className="text-xs text-gray-400">
            <IntlDate date={new Date(task.timestamp)} />
          </p>
        </div>
      </div>
      <div>
        <p>{task.title}</p>
      </div>
      <div className="flex justify-end items-center pt-4 mt-auto">
        <Button
          onClick={(event) =>
            completeTaskHandler({
              taskId: task.id,
              event,
            })
          }
        >
          <CheckIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
