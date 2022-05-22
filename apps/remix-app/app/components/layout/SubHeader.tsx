import { useAtomValue } from 'jotai';
import { usernameAtom, usersStateAtom } from '~/state/store';
import { UserAvatar } from '~/components/elements';

export const SubHeader = () => {
  const username = useAtomValue(usernameAtom);
  const usersState = useAtomValue(usersStateAtom);

  return (
    <div className="text-white bg-sky-500">
      <div className="flex flex-col flex-wrap justify-center items-center mx-auto min-h-[88px]">
        <div>
          {usersState && (
            <div className="flex flex-wrap grow justify-center p-2">
              {usersState.map((state) => (
                <UserAvatar
                  key={state.id}
                  user={state.name}
                  isMe={username === state.name}
                  isOnline={state.online}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
