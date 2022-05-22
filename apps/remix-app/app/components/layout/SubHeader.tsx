import { useAtomValue } from 'jotai';
import { usernameAtom, usersStateAtom } from '~/state/store';
import { UserAvatar } from '~/components/elements';

export const SubHeader = () => {
  const username = useAtomValue(usernameAtom);
  const usersState = useAtomValue(usersStateAtom);

  return (
    <div className="">
      <div className="flex flex-col flex-wrap justify-center items-center mx-auto">
        <div>
          <div className="flex flex-wrap grow justify-center">
            {usersState.map((state) => (
              <UserAvatar
                key={state.id}
                user={state.name}
                isMe={username === state.name}
                state={state.online ? 'online' : 'offline'}
                showName={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
