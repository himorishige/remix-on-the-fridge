import { useAtomValue } from 'jotai';
import {
  boardIdAtom,
  boardLoaderCallsAtom,
  userListAtom,
  usernameAtom,
} from '~/state/store';
import { UserAvatar } from '~/components/elements';
import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { Button } from '~/components/ui';

export const SubHeader = () => {
  const userList = useAtomValue(userListAtom);
  const username = useAtomValue(usernameAtom);
  const boardId = useAtomValue(boardIdAtom);
  const loaderCalls = useAtomValue(boardLoaderCallsAtom);
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
      <div className="flex flex-col flex-wrap justify-center items-center mx-auto">
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
              icon
            </button>
          </div>
          <p className="text-sm break-all">Visit: {loaderCalls}</p>
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
              Share the URL and use the board together!
            </Dialog.Description>

            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};