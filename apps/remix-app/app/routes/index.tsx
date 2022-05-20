import type { LoaderFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';
import { Button, Input } from '~/components/ui';

import { getSession } from '~/session.server';

type LoaderData = {
  loaderCalls: number;
  username?: string;
};

export const loader: LoaderFunction = async ({ context: { env }, request }) => {
  const sessionPromise = getSession(request, env);

  const counter = env.COUNTER.get(env.COUNTER.idFromName('index'));
  const loaderCalls = await counter
    .fetch('https://.../increment')
    .then((response) => response.text())
    .then((text) => Number.parseInt(text, 10));

  const session = await sessionPromise;
  const username = (session.get('username') || undefined) as string | undefined;

  return json<LoaderData>({ loaderCalls, username });
};

export default function Index() {
  const { loaderCalls, username } = useLoaderData() as LoaderData;

  return (
    <main>
      <Form method="post" id="username-form">
        <label>
          Choose a Username:
          <br />
          <Input
            name="username"
            placeholder="username"
            required
            maxLength={32}
            defaultValue={username}
          />
        </label>
        <button disabled type="submit" style={{ display: 'none' }} />
      </Form>
      <p>then</p>
      <p>
        <Button type="submit" form="username-form" formAction="/new">
          Create a Private Board
        </Button>
      </p>
      <p>or</p>
      <label>
        Enter a Public Board:
        <br />
        <Input
          form="username-form"
          name="board"
          type="text"
          autoCapitalize="off"
          placeholder="board-name"
        />
      </label>
      <Button type="submit" form="username-form" formAction="/join">
        GO!
      </Button>

      <hr />
      <footer>
        <p>index loader invocations: {loaderCalls}</p>
      </footer>
    </main>
  );
}
