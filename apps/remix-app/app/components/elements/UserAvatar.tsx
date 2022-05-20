import { classNames } from '~/utils';

type Props = {
  user: string;
  isMe: boolean;
  isWriting?: boolean;
};

export const UserAvatar: React.FC<Props> = ({ user, isMe, isWriting }) => {
  return (
    <div className="relative p-1">
      {isWriting && (
        <div className="absolute right-0">
          <span className="flex relative w-3 h-3">
            <span className="inline-flex absolute w-full h-full bg-sky-400 rounded-full opacity-75 animate-ping"></span>
            <span className="inline-flex relative w-3 h-3 bg-sky-500 rounded-full"></span>
          </span>
        </div>
      )}
      <div
        className={classNames(
          `flex justify-center items-center w-10 h-10 rounded-full`,
          isMe ? 'bg-indigo-300' : 'bg-indigo-100',
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
  );
};
