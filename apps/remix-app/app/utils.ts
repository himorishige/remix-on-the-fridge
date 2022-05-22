import type { Task } from 'board-do';

export const normalizeBoardName = (board: string) => {
  return board
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/_/g, '-')
    .toLowerCase();
};

export const timestampToLocalString = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

export const classNames = (...classes: unknown[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const isPending = (status: Task['status']) => {
  return status === 'pending';
};

export const isAssigned = (status: Task['status']) => {
  return status === 'assigned';
};

export const isCompleted = (status: Task['status']) => {
  return status === 'done';
};
