import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useMatches,
} from '@remix-run/react';
import type { PropsWithChildren } from 'react';
import { Footer, Header } from '~/components/layout';
import styles from '~/styles/app.css';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Remix on the fridge',
  viewport: 'width=device-width,initial-scale=1',
});

type LoaderData = {
  loaderCalls: number;
};

export const links = () => {
  return [{ rel: 'stylesheet', href: styles }];
};

export const loader: LoaderFunction = async ({ context: { env } }) => {
  const counter = env.COUNTER.get(env.COUNTER.idFromName('root'));
  const counterResponse = await counter.fetch('https://.../increment');
  const loaderCalls = Number.parseInt(await counterResponse.text());

  return json<LoaderData>({ loaderCalls });
};

const Document = ({ children }: PropsWithChildren<{}>) => {
  const matches = useMatches();
  const root = matches.find((match) => match.id === 'root');
  const data = root?.data as LoaderData | undefined;

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        {children}
        <Footer loaderCalls={data?.loaderCalls} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export const CatchBoundary = () => {
  const { status, statusText } = useCatch();

  return (
    <Document>
      <main>
        <h1>{status}</h1>
        {statusText && <p>{statusText}</p>}
      </main>
    </Document>
  );
};

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.log(error);

  return (
    <Document>
      <main>
        <h1>Oops, looks like something went wrong 😭</h1>
      </main>
    </Document>
  );
};
