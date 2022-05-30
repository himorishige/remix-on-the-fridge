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

export const meta: MetaFunction = ({ data }) => {
  return {
    charset: 'utf-8',
    title: 'sticky notes on the fridge powered by Remix',
    viewport: 'width=device-width,initial-scale=1',
    'og:title': 'sticky notes on the fridge powered by Remix',
    'og:url': data?.domain,
    'og:image': `${data?.domain}/ogp-on-the-fridge.png`,
    'og:site_name': 'on the fridge powered by Remix',
  };
};

type LoaderData = {
  loaderCalls: number;
  domain: string;
};

export const links = () => {
  return [{ rel: 'stylesheet', href: styles }];
};

const getHostname = async (headers: Headers): Promise<string> => {
  const host = headers.get('X-Forwarded-Host') ?? headers.get('host');
  if (!host) {
    throw new Error('Could not determine domain URL.');
  }
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const domain = `${protocol}://${host}`;
  return domain;
};

export const loader: LoaderFunction = async ({ context: { env }, request }) => {
  const domain = await getHostname(request.headers);
  const counter = env.COUNTER.get(env.COUNTER.idFromName('root'));
  const counterResponse = await counter.fetch('https://.../increment');
  const loaderCalls = Number.parseInt(await counterResponse.text());

  return json<LoaderData>({ loaderCalls, domain });
};

const Document = ({ children }: PropsWithChildren<{}>) => {
  const matches = useMatches();
  const root = matches.find((match) => match.id === 'root');
  const data = root?.data as LoaderData | undefined;

  return (
    <html lang="en">
      <head>
        <Meta />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
        <link rel="icon alternate" href="/favicon.png" type="image/png"></link>
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
      <div className="p-2 bg-sky-700">
        <main className="flex flex-col justify-center items-center min-h-[calc(100vh_-_68px_-_64px)] text-sky-700 bg-sky-200 rounded-lg">
          <h1 className="text-3xl">{status}</h1>
          {statusText && <p className="text-xl">{statusText}</p>}
        </main>
      </div>
    </Document>
  );
};

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.log(error);

  return (
    <Document>
      <div className="p-2 bg-sky-700">
        <main className="flex flex-col justify-center items-center min-h-[calc(100vh_-_68px_-_64px)] text-sky-700 bg-sky-200 rounded-lg">
          <h1 className="text-3xl">Oops, looks like something went wrong 😭</h1>
        </main>
      </div>
    </Document>
  );
};
