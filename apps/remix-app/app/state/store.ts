import type { Message } from 'board-do';
import { atom } from 'jotai';

export const boardIdAtom = atom<string | null>(null);
export const boardLoaderCallsAtom = atom<number>(0);
export const usernameAtom = atom<string | null>(null);
export const newMessageAtom = atom<Message[]>([]);
export const userListAtom = atom<string[]>([]);
