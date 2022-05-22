import { classNames } from '~/utils';

type Size = 'small' | 'medium' | 'large';

type Props = {
  user: string;
  isMe?: boolean;
  state?: 'online' | 'offline' | 'none';
  showName?: boolean;
  size?: Size;
};

const sizes: Record<Size, string> = {
  small: 'w-8 h-8',
  medium: 'w-10 h-10',
  large: 'w-12 h-12',
} as const;

export const UserAvatar: React.FC<Props> = ({
  user,
  isMe = false,
  state = 'none',
  showName = false,
  size = 'medium',
}) => {
  return (
    <div className="flex flex-col justify-center items-center p-1">
      <div className="flex relative flex-col justify-center items-center">
        {state === 'online' && (
          <>
            <div className="absolute top-0 right-0">
              <span className="flex relative w-3 h-3">
                <span className="inline-flex absolute w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
                <span className="inline-flex relative w-3 h-3 bg-green-500 rounded-full"></span>
              </span>
            </div>
          </>
        )}

        {state === 'offline' && (
          <div
            className={classNames(
              'absolute bg-blue-300 rounded-full opacity-70',
              sizes[size],
            )}
          ></div>
        )}
        <div
          className={classNames(
            `flex justify-center items-center rounded-full`,
            sizes[size],
            isMe ? 'bg-orange-200' : 'bg-indigo-100',
          )}
        >
          <img
            src={`https://avatars.dicebear.com/api/pixel-art/${user}.svg`}
            alt={user}
            title={user}
            className={classNames('overflow-hidden rounded-full', sizes[size])}
          />
        </div>
      </div>
      {showName && (
        <div>
          <span
            className={classNames(
              'text-xs',
              state === 'offline' && 'text-gray-200',
            )}
          >
            {user}
          </span>
        </div>
      )}
    </div>
  );
};
