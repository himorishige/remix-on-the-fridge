import { Menu, Transition } from '@headlessui/react';
import type { Message, UserState } from 'board-do';
import { Fragment } from 'react';
import type { AddTaskEvent } from '~/routes/board.$boardId';
import { ArrowDown, UserAddIcon } from '~/components/icons';
import { UserAvatar } from './UserAvatar';

type Props = {
  addTaskHandler: (params: AddTaskEvent) => void;
  message: Message;
  usersState: UserState[];
};

export const UserSelectMenu: React.FC<Props> = ({
  addTaskHandler,
  message,
  usersState,
}) => {
  return (
    <div className="text-right">
      <Menu as="div" className="inline-block relative text-left">
        <div>
          <Menu.Button className="inline-flex justify-center py-2 px-4 w-full text-sm font-medium text-white bg-sky-500 hover:bg-sky-700 rounded focus:outline-none">
            <UserAddIcon className="w-4 h-4" />
            <ArrowDown className="ml-1 w-4 h-4" />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 z-50 mt-2 min-w-[224px] bg-white rounded-md divide-y divide-gray-100 focus:outline-none shadow-lg origin-top-right">
            <div className="p-1 ">
              {usersState.map((user) => (
                <Menu.Item key={user.id}>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-sky-500 text-white' : 'text-gray-700'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      onClick={(event) =>
                        addTaskHandler({
                          message: {
                            ...message,
                            assignee: user.name,
                          },
                          event,
                        })
                      }
                    >
                      <UserAvatar user={user.name} size="small" />
                      <span className="text-sm">{user.name}</span>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
