import type { Message } from 'board-do';

type Props = {
  message: Message;
};

export const BoardCard: React.FC<Props> = ({ message }) => {
  return (
    <div
      className="p-4 w-full md:w-1/2 lg:w-1/3"
      key={`${message.timestamp}${message.name}${message.message}`}
    >
      <div className="p-6 rounded-lg border border-gray-200">
        <div className="inline-flex justify-center items-center mb-4 w-12 h-12 text-indigo-500 bg-indigo-100 rounded-full">
          <img
            src={`https://avatars.dicebear.com/api/pixel-art/${message.name}.svg`}
            alt={message.name}
            className="overflow-hidden w-12 h-12 rounded-full"
          />
        </div>
        <h2 className="mb-2 text-lg font-medium text-gray-900">
          {message.name}
        </h2>
        <p className="text-base leading-relaxed">{message.message}</p>
      </div>
    </div>
  );
};
