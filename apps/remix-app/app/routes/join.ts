import type { ActionFunction } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';

import { commitSession, getSession } from '~/session.server';
import { normalizeRoomName } from '~/utils';

export const action: ActionFunction = async ({ context: { env }, request }) => {
  const formData = await request.formData();
  const room = formData.get('room') || '';
  const username = formData.get('username') || '';

  if (
    typeof room !== 'string' ||
    !room ||
    typeof username !== 'string' ||
    !username
  ) {
    return redirect('/');
  }

  try {
    const sessionPromise = getSession(request, env);

    const id = env.BOARD.idFromName(normalizeRoomName(room)).toString();

    const session = await sessionPromise;
    session.set('username', username);

    return redirect(`/room/${id}`, {
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
