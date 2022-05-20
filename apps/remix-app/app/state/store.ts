import type { Message } from 'board-do';
import { atom } from 'jotai';

export const usernameAtom = atom<string | null>(null);
export const newMessageAtom = atom<Message[]>([]);
export const socketAtom = atom<WebSocket | null>(null);
export const userListAtom = atom<string[]>([]);
export const inputValueAtom = atom<string>('');
