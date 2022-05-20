import type { ActionFunction } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';

import { commitSession, getSession } from '~/session.server';

export const action: ActionFunction = async ({ context: { env }, request }) => {
  try {
    const sessionPromise = getSession(request, env);

    const formData = await request.formData();
    const username = formData.get('username') || '';

    if (typeof username !== 'string' || !username) {
      return redirect('/');
    }

    const id = env.BOARD.newUniqueId().toString();

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
