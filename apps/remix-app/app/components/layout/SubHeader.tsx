import { useAtomValue } from 'jotai';
import { boardIdAtom, userListAtom, usernameAtom } from '~/state/store';
import { UserAvatar } from '~/components/elements';
import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { Button } from '~/components/ui';

export const SubHeader = () => {
  const userList = useAtomValue(userListAtom);
  const username = useAtomValue(usernameAtom);
  const boardId = useAtomValue(boardIdAtom);
  let [isOpen, setIsOpen] = useState(false);

  const shareHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    if (!boardId) return;

    setIsOpen(true);

    window.navigator.clipboard.writeText(
      `${window.location.origin}/board/${boardId}`,
    );
  };

  return (
    <div className="p-4 text-white bg-sky-500">
      <div className="flex flex-col flex-wrap justify-center items-center mx-auto min-h-[88px]">
        <div>
          {userList && (
            <div className="flex flex-wrap grow justify-center p-2">
              {userList.map((user) => (
                <UserAvatar key={user} user={user} isMe={username === user} />
              ))}
            </div>
          )}
          <div className="flex items-center">
            <p className="text-sm break-all">Board ID: {boardId}</p>
            <button
              type="button"
              className="pl-2 text-lg text-cyan-800 hover:text-cyan-200 transition-colors duration-200"
              onClick={shareHandler}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V14.75"
                ></path>
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M19.25 9.25V4.75H14.75"
                ></path>
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M19 5L11.75 12.25"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="flex fixed inset-0 justify-center items-center p-4">
          <Dialog.Panel className="p-8 w-full max-w-sm bg-white rounded">
            <Dialog.Title className="mb-2 text-lg">
              Copied Board URL to clipboard!
            </Dialog.Title>
            <Dialog.Description className="mb-4">
              Share the URL and use the board with your family and friends!
            </Dialog.Description>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
