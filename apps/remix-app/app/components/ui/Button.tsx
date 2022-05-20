import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<'button'>, 'className'>;

export const Button: React.FC<Props> = (props) => {
  return (
    <button
      {...props}
      className="py-2 px-6 text-lg text-white bg-blue-500 hover:bg-blue-600 rounded border-0 focus:outline-none"
    >
      {props.children}
    </button>
  );
};
