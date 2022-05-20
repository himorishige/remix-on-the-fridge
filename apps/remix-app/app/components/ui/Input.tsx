import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<'input'>, 'className'>;

export const Input: React.FC<Props> = (props) => {
  return (
    <input
      {...props}
      className="py-1 px-3 w-full text-base leading-8 text-gray-700 bg-white rounded border border-gray-300 focus:border-indigo-500 outline-none focus:ring-2 focus:ring-indigo-200 transition-colors duration-200 ease-in-out"
    />
  );
};
