import { Link } from '@remix-run/react';
import { useAtomValue } from 'jotai';
import {
  boardIdAtom,
  boardLoaderCallsAtom,
  userListAtom,
  usernameAtom,
} from '~/state/store';
import { UserAvatar } from '../elements';

export const Header = () => {
  const userList = useAtomValue(userListAtom);
  const username = useAtomValue(usernameAtom);
  const boardId = useAtomValue(boardIdAtom);
  const loaderCalls = useAtomValue(boardLoaderCallsAtom);

  return (
    <header className="text-white bg-sky-600">
      <div className="container flex flex-col flex-wrap justify-between items-center py-5 mx-auto">
        <Link to="/" className="flex items-center font-medium">
          <span className="text-xl">Remix on the fridge</span>
        </Link>
        {userList && (
          <div className="flex flex-wrap grow p-2">
            {userList.map((user) => (
              <UserAvatar key={user} user={user} isMe={username === user} />
            ))}
          </div>
        )}
        <p className="break-all">{boardId}</p>
        <p className="break-all">{loaderCalls}</p>
      </div>
    </header>
  );
};
