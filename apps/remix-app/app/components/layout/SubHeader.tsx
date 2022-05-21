import { useAtomValue } from 'jotai';
import { userListAtom, usernameAtom } from '~/state/store';
import { UserAvatar } from '~/components/elements';

export const SubHeader = () => {
  const userList = useAtomValue(userListAtom);
  const username = useAtomValue(usernameAtom);

  return (
    <div className="text-white bg-sky-500">
      <div className="flex flex-col flex-wrap justify-center items-center mx-auto min-h-[88px]">
        <div>
          {userList && (
            <div className="flex flex-wrap grow justify-center p-2">
              {userList.map((user) => (
                <UserAvatar key={user} user={user} isMe={username === user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
