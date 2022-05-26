import { useAtomValue } from 'jotai';
import { usernameAtom, usersStateAtom } from '~/state/store';
import { UserAvatar } from '~/components/elements';

export const SubHeader = () => {
  const username = useAtomValue(usernameAtom);
  const usersState = useAtomValue(usersStateAtom);

  return (
    <div className="">
      <div className="flex flex-col flex-wrap justify-end items-center mx-auto">
        <div>
          <div className="flex flex-wrap grow justify-end scale-75 sm:scale-100">
            {usersState.map((state, index) => (
              <UserAvatar
                key={`${state.id}-${index}`}
                user={state.name}
                isMe={username === state.name}
                state={state.online ? 'online' : 'offline'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
