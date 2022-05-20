import { Link } from '@remix-run/react';
import { useAtom } from 'jotai';
import { userListAtom, usernameAtom } from '~/state/store';
import { UserAvatar } from '../elements';

export const Header = () => {
  const [userList] = useAtom(userListAtom);
  const [username] = useAtom(usernameAtom);

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
      </div>
    </header>
  );
};
