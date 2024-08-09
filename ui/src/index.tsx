import './index.css';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  ApolloProvider,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import type { ThemeConfig } from '@chakra-ui/react';
import {
  ChakraProvider,
  extendTheme,
  withDefaultColorScheme,
} from '@chakra-ui/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import React from 'react';
import { createRoot } from 'react-dom/client';

import { ErrorBoundary } from 'react-error-boundary';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { get_csrf_token, csrf_header } from './components/auth/auth_utils.ts';
import { SessionProvider } from './components/auth/session.tsx';

import AppErrorFallback from './components/error/AppErrorFallback.tsx';
import { messages as enMessages } from './i18n/locales/en/messages.ts';
import { messages as frMessages } from './i18n/locales/fr/messages.ts';

import ExcelParser from './pages/ExcelParser.tsx';
import NavWrapper from './pages/NavWrapper.tsx';
import SignIn from './pages/SignIn.tsx';
import TermsAndConditions from './pages/TermsAndConditions.tsx';

//  _   _
// | |_| |__   ___ _ __ ___   ___
// | __| '_ \ / _ \ '_ ` _ \ / _ \
// | |_| | | |  __/ | | | | |  __/
//  \__|_| |_|\___|_| |_| |_|\___|

const themeConfig: ThemeConfig = {
  useSystemColorMode: true,
  initialColorMode: 'light',
};

const theme = extendTheme(
  themeConfig,
  withDefaultColorScheme({ colorScheme: 'blue' }),
  {
    styles: {
      global: {
        p: {
          fontSize: { base: '12px', sm: '14px', md: '16px', lg: '16px' },
          fontFamily: 'sans-serif',
        },
        header: {
          fontSize: { base: '20px', sm: '24px', md: '30px', lg: '30px' },
        },
        '.menu': {
          fontSize: {
            base: '18px',
            sm: '15px',
            md: '17px',
            lg: '17px',
            xl: '18px',
          },
          fontFamily: 'sans-serif',
          color: '#333333',
        },
        '.translationButton': {
          fontSize: { base: '12px', sm: '12px', md: '14px' },
        },
      },
    },
  },
);

//  _ _  ___
// (_) |( _ ) _ __
// | | |/ _ \| '_ \
// | | | (_) | | | |
// |_|_|\___/|_| |_|

i18n.load({
  en: enMessages,
  fr: frMessages,
});

i18n.activate('en');

//                     _
//  _ __ ___ _ __   __| | ___ _ __
// | '__/ _ \ '_ \ / _` |/ _ \ '__|
// | | |  __/ | | | (_| |  __/ |
// |_|  \___|_| |_|\__,_|\___|_|

const container = document.getElementById('root');
const root = createRoot(container!);

const auth_base_url = '/api/auth';

const csrfMiddleware = setContext(async () => {
  const csrf_token = await get_csrf_token(auth_base_url);
  return { headers: { [csrf_header]: csrf_token } };
});
const httpLink = new HttpLink({ uri: '/api/graphql' });
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([csrfMiddleware, httpLink]),
});

root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={AppErrorFallback}>
      <BrowserRouter>
        <SessionProvider authBaseURL={auth_base_url}>
          <I18nProvider i18n={i18n}>
            <ApolloProvider client={client}>
              <ChakraProvider theme={theme}>
                <Routes>
                  <Route path="/" element={<NavWrapper />}>
                    <Route path="" element={<ExcelParser />} />
                    <Route path="signin" element={<SignIn />} />
                    <Route
                      path="termsAndConditions"
                      element={<TermsAndConditions />}
                    />
                  </Route>
                </Routes>
              </ChakraProvider>
            </ApolloProvider>
          </I18nProvider>
        </SessionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
