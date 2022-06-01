import { Fragment, useEffect, useRef, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { SelectorIcon, FilterIcon, CheckIcon } from '~/components/icons';
import { useAtomValue } from 'jotai';
import { newTaskAtom } from '~/state/store';
import type { Task } from 'board-do';
import { TaskCard } from '~/components/elements';
import type ReconnectingWebSocket from 'reconnecting-websocket';
import html2canvas from 'html2canvas';
import { Button } from '../ui';
import { DownloadIcon } from '../icons/DownloadIcon';

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
  const [latestTasksStore, setLatestTasksStore] = useState(latestTasks);

  const target = useRef<HTMLDivElement>(null);

  const onClickExport = () => {
    if (target.current) {
      html2canvas(target.current, {
        backgroundColor: 'rgba(186, 230, 253, 1)',
        useCORS: true,
      }).then((canvas) => {
        const targetImgUri = canvas.toDataURL('img/png');
        saveAsImage(targetImgUri);
      });
    }
  };

  const saveAsImage = (uri: string) => {
    const downloadLink = document.createElement('a');

    if (typeof downloadLink.download === 'string') {
      downloadLink.href = uri;
      downloadLink.download = 'sticky-notes.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      window.open(uri);
    }
  };

  const [people, setPeople] = useState([
    'all',
    ...latestTasksStore.map(({ assignee }) => assignee),
    ...newTasks.map(({ assignee }) => assignee),
  ]);
  const [selected, setSelected] = useState(people[0]);

  const completeTaskHandler = (params: CompleteTaskEvent) => {
    params.event.preventDefault();

    if (latestTasksStore.some(({ id }) => id === params.taskId)) {
      setLatestTasksStore((previousArray) =>
        previousArray.filter(({ id }) => id !== params.taskId),
      );
    }

    if (socket) {
      socket.send(JSON.stringify({ completeTaskId: params.taskId }));
    }
  };

  useEffect(() => {
    const target = [
      'all',
      ...latestTasksStore.map(({ assignee }) => assignee),
      ...newTasks.map(({ assignee }) => assignee),
    ];
    const result = [...new Set(target)];

    setPeople(result);
  }, [latestTasksStore, newTasks]);

  return (
    <>
      <div className="flex justify-between items-center p-2 pt-5 pr-4 w-full">
        <Listbox value={selected} onChange={setSelected}>
          <div className="relative pr-4 w-full">
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
        <Button type="button" onClick={onClickExport}>
          <DownloadIcon />
          <span className="ml-1">export</span>
        </Button>
      </div>
      <div ref={target}>
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
          {latestTasksStore
            .filter((task) => task.assignee === selected || selected === 'all')
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                completeTaskHandler={completeTaskHandler}
              />
            ))}
        </div>
      </div>
    </>
  );
};
