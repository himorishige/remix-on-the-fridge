import type { ActionFunction } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';

import { commitSession, getSession } from '~/session.server';
import { normalizeBoardName } from '~/utils';

export const action: ActionFunction = async ({ context: { env }, request }) => {
  const formData = await request.formData();
  const board = formData.get('board') || '';
  const username = formData.get('username') || '';

  if (
    typeof board !== 'string' ||
    !board ||
    typeof username !== 'string' ||
    !username
  ) {
    return redirect('/');
  }

  try {
    const sessionPromise = getSession(request, env);

    const id = env.BOARD.idFromName(normalizeBoardName(board)).toString();

    const session = await sessionPromise;
    session.set('username', username);

    return redirect(`/board/${id}`, {
      headers: {
        'Set-Cookie': await commitSession(session, env),
      },
    });
  } catch (error) {
    return redirect('/');
  }
};

export const loader = () => redirect('/');

export default () => null;
