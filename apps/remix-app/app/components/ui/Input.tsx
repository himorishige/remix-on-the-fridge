import type { ComponentPropsWithRef } from 'react';
import React from 'react';

type Props = Omit<ComponentPropsWithRef<'input'>, 'className'>;

export const Input: React.FC<Props> = React.forwardRef(function Input(
  props,
  ref,
) {
  return (
    <input
      ref={ref}
      {...props}
      className="py-1 px-3 w-full text-base leading-8 text-gray-700 bg-white rounded border border-sky-300 focus:border-indigo-500 outline-none focus:ring-2 focus:ring-indigo-200 transition-colors duration-200 ease-in-out"
    />
  );
});
