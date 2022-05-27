import { Fragment, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { SelectorIcon, FilterIcon, CheckIcon } from '~/components/icons';
import { useAtomValue } from 'jotai';
import { newTaskAtom } from '~/state/store';
import type { Task } from 'board-do';
import { TaskCard } from '~/components/elements';
import type ReconnectingWebSocket from 'reconnecting-websocket';

type Props = {
  socket: ReconnectingWebSocket | null;
  latestTasks: Task[];
};

export type CompleteTaskEvent = {
  taskId: string;
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

export const StickyArea: React.FC<Props> = ({ socket, latestTasks }) => {
  const newTasks = useAtomValue(newTaskAtom);

  const [people, setPeople] = useState([
    'all',
    ...latestTasks.map(({ assignee }) => assignee),
    ...newTasks.map(({ assignee }) => assignee),
  ]);
  const [selected, setSelected] = useState(people[0]);

  const completeTaskHandler = (params: CompleteTaskEvent) => {
    params.event.preventDefault();
    console.log(params.taskId);

    if (socket) {
      socket.send(JSON.stringify({ completeTaskId: params.taskId }));
    }
  };

  useEffect(() => {
    const target = [
      'all',
      ...latestTasks.map(({ assignee }) => assignee),
      ...newTasks.map(({ assignee }) => assignee),
    ];
    const result = [...new Set(target)];

    setPeople(result);
  }, [latestTasks, newTasks]);

  return (
    <>
      <div className="p-2 pt-5">
        <Listbox value={selected} onChange={setSelected}>
          <div className="relative">
            <Listbox.Button className="relative py-2 pr-10 pl-3 w-full text-left bg-white rounded-lg focus-visible:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 shadow-md cursor-default sm:text-sm">
              <span className="block truncate">
                <span className="flex items-center text-gray-700">
                  <span className="mr-2 text-amber-600">
                    <FilterIcon />
                  </span>
                  {selected}
                </span>
              </span>
              <span className="flex absolute inset-y-0 right-0 items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="overflow-auto absolute z-10 py-1 mt-1 w-full max-h-60 text-base bg-white rounded-md focus:outline-none ring-1 ring-black/5 shadow-lg sm:text-sm">
                {people.map((person, personIdx) => (
                  <Listbox.Option
                    key={personIdx}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-amber-100 text-amber-900' : 'text-gray-700'
                      }`
                    }
                    value={person}
                  >
                    {() => (
                      <>
                        <span
                          className={`block truncate ${
                            selected === person ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {person}
                        </span>
                        {selected === person ? (
                          <span className="flex absolute inset-y-0 left-0 items-center pl-3 text-amber-600">
                            <CheckIcon className="w-5 h-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>
      {latestTasks.length === 0 && newTasks.length === 0 ? (
        <div className="p-3 text-center">
          <p className="text-gray-500">No stickies</p>
        </div>
      ) : null}
      <div className="grid gap-2 p-2 sm:grid-cols-2 xl:grid-cols-3">
        {newTasks
          .filter((task) => task.assignee === selected || selected === 'all')
          .map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              completeTaskHandler={completeTaskHandler}
            />
          ))}
        {latestTasks
          .filter((task) => task.assignee === selected || selected === 'all')
          .map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              completeTaskHandler={completeTaskHandler}
            />
          ))}
      </div>
    </>
  );
};
