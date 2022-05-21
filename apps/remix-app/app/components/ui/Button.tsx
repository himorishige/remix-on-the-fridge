import type { ComponentProps } from 'react';
import { classNames } from '~/utils';

type Props = Omit<ComponentProps<'button'>, 'className'> & {
  secondary?: string;
  full?: string;
};

export const Button: React.FC<Props> = (props) => {
  return (
    <button
      {...props}
      className={classNames(
        'font-medium py-2 px-4 text-white bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 rounded border-0 focus:outline-none flex items-center justify-center',
        props.full ? 'w-full' : '',
        props.secondary
          ? 'bg-cyan-500 hover:bg-cyan-600'
          : 'bg-blue-500 hover:bg-blue-600',
      )}
    >
      {props.children}
    </button>
  );
};
