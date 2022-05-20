import { hydrateRoot } from 'react-dom/client';
import { RemixBrowser } from '@remix-run/react';
import { LocaleContextProvider } from '~/providers/LocaleProvider';

const locales = window.navigator.languages as string[];

hydrateRoot(
  document,
  <LocaleContextProvider locales={locales}>
    <RemixBrowser />
  </LocaleContextProvider>,
);
