import type { Task } from 'board-do';
import { classNames } from '~/utils';
import { IntlDate } from './IntlDate';

type Props = {
  task: Task;
};

export const TaskCard: React.FC<Props> = ({ task }) => {
  const isMe = false;
  return (
    <div className="w-full text-gray-700">
      <div className="flex flex-col p-4 h-full bg-white border-y border-y-sky-400">
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <div
              className={classNames(
                `flex justify-center items-center w-8 h-8 rounded-full`,
                isMe ? 'bg-indigo-300' : 'bg-indigo-100',
              )}
            >
              <img
                src={`https://avatars.dicebear.com/api/pixel-art/${task.owner}.svg`}
                alt={task.owner}
                className="overflow-hidden w-8 h-8 rounded-full"
              />
            </div>
            →
            <div
              className={classNames(
                `flex justify-center items-center w-8 h-8 rounded-full`,
                isMe ? 'bg-indigo-300' : 'bg-indigo-100',
              )}
            >
              <img
                src={`https://avatars.dicebear.com/api/pixel-art/${task.assignee}.svg`}
                alt={task.assignee}
                className="overflow-hidden w-8 h-8 rounded-full"
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
          {task.status} toTask
        </div>
      </div>
    </div>
  );
};
