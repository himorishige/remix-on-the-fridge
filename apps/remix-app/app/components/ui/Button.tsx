import type { ComponentProps } from 'react';
import { classNames } from '~/utils';

type Props = Omit<ComponentProps<'button'>, 'className'> & { full?: string };

export const Button: React.FC<Props> = (props) => {
  return (
    <button
      {...props}
      className={classNames(
        'py-2 px-6 text-lg text-white bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 rounded border-0 focus:outline-none',
        props.full ? 'w-full' : '',
      )}
    >
      {props.children}
    </button>
  );
};
