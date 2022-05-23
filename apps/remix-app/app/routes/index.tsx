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
  const { username } = useLoaderData() as LoaderData;

  return (
    <main className="flex items-center min-h-[calc(100vh_-_66px_-_52px)] bg-sky-300">
      <div className="flex flex-col p-8 mx-auto max-w-lg h-full bg-white rounded-lg border border-sky-400 sm:w-4/5">
        <h2 className="mb-3 text-xl font-semibold text-gray-700">
          Choose a Username:
        </h2>
        <Form method="post" id="username-form">
          <Input
            name="username"
            placeholder="Choose a Username"
            required
            maxLength={32}
            defaultValue={username}
          />
          <button disabled type="submit" style={{ display: 'none' }} />
        </Form>
        <div className="mt-4">
          <Button
            type="submit"
            form="username-form"
            formAction="/new"
            full="true"
          >
            Create a Private Board
          </Button>
        </div>
      </div>
      {/* <label>
        Enter a Public Room:
        <br />
        <input
          form="username-form"
          name="board"
          type="text"
          autoCapitalize="off"
          placeholder="board-name"
        />
      </label>
      <button type="submit" form="username-form" formAction="/join">
        GO!
      </button> */}
    </main>
  );
}
