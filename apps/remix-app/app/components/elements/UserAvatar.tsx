import { classNames } from '~/utils';

type Props = {
  user: string;
  isMe: boolean;
  isOnline?: boolean;
};

export const UserAvatar: React.FC<Props> = ({ user, isMe, isOnline }) => {
  return (
    <div className="flex flex-col justify-center items-center p-1">
      <div className="flex relative flex-col justify-center items-center">
        {isOnline && (
          <>
            <div className="absolute top-0 right-0">
              <span className="flex relative w-3 h-3">
                <span className="inline-flex absolute w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
                <span className="inline-flex relative w-3 h-3 bg-green-500 rounded-full"></span>
              </span>
            </div>
          </>
        )}

        {!isOnline && (
          <div className="absolute w-10 h-10 bg-blue-300 rounded-full opacity-70"></div>
        )}
        <div
          className={classNames(
            `flex justify-center items-center w-10 h-10 rounded-full`,
            isMe ? 'bg-orange-200' : 'bg-indigo-100',
          )}
        >
          <img
            src={`https://avatars.dicebear.com/api/pixel-art/${user}.svg`}
            alt={user}
            title={user}
            className="overflow-hidden w-10 h-10 rounded-full"
          />
        </div>
      </div>
      <div>
        <span className={classNames('text-xs', !isOnline && 'text-gray-200')}>
          {user}
        </span>
      </div>
    </div>
  );
};
