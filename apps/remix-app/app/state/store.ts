import type { Message } from 'board-do';
import { atom } from 'jotai';

export const boardIdAtom = atom<string | null>(null);
export const usernameAtom = atom<string | null>(null);
export const newMessageAtom = atom<Message[]>([]);
export const socketAtom = atom<WebSocket | null>(null);
export const userListAtom = atom<string[]>([]);

// input form
export const inputValueAtom = atom<string>('');
