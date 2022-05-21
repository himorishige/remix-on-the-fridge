import type { Task } from 'board-do';
import { classNames } from '~/utils';
import { Button } from '~/components/ui';
import { IntlDate } from '~/components/elements';
import { CheckIcon } from '~/components/icons';
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
          <div
            className={classNames(
              `flex justify-center items-center w-12 h-12 rounded-full`,
              isMe ? 'bg-indigo-300' : 'bg-indigo-100',
            )}
          >
            <img
              src={`https://avatars.dicebear.com/api/pixel-art/${task.owner}.svg`}
              alt={task.owner}
              className="overflow-hidden w-12 h-12 rounded-full"
            />
          </div>
          &rarr;
          <div
            className={classNames(
              `flex justify-center items-center w-12 h-12 rounded-full`,
              isMe ? 'bg-indigo-300' : 'bg-indigo-100',
            )}
          >
            <img
              src={`https://avatars.dicebear.com/api/pixel-art/${task.assignee}.svg`}
              alt={task.assignee}
              className="overflow-hidden w-12 h-12 rounded-full"
            />
          </div>
        </div>
        <div className="flex flex-col grow pl-2">
          <p className="text-lg font-medium">{task.assignee}</p>
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
