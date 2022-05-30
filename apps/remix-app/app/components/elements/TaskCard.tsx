import type { Task } from 'board-do';
import { Button } from '~/components/ui';
import { IntlDate, UserAvatar } from '~/components/elements';
import { CheckIcon, DoubleArrowRight } from '~/components/icons';
import type { CompleteTaskEvent } from '~/components/layout/StickyArea';

type Props = {
  task: Task;
  completeTaskHandler: (params: CompleteTaskEvent) => void;
};

export const TaskCard: React.FC<Props> = ({ task, completeTaskHandler }) => {
  const isMe = false;
  return (
    <div className="flex flex-col p-4 h-full text-gray-700 bg-yellow-200/75 rounded-md corner_box corner_box_outer">
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          <UserAvatar user={task.owner} isMe={isMe} />
          <DoubleArrowRight className="w-4 h-4 text-yellow-600" />
          <UserAvatar user={task.assignee} isMe={isMe} />
        </div>
        <div className="flex flex-col grow pl-2">
          <p className="text-sm font-medium sm:text-base">{task.assignee}</p>
          <p className="text-xs text-gray-400">
            <IntlDate date={new Date(task.timestamp)} />
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm break-all sm:text-base">{task.title}</p>
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
