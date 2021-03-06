import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Cookie from 'js-cookie';
import steem from 'steem';
import Raven from 'raven-js';
import Logger from 'js-logger';
import { AppContainer } from 'react-hot-loader';
import { LocaleProvider, message } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import { history } from './routes';
import pkg from '../package.json';
import getStore from './store';
import AppHost from './AppHost';

Logger.useDefaults();

const store = getStore();

if (window.ga) {
  window.ga('set', 'appVersion', pkg.version);
}

const logPageView = () => {
  if (window.ga) {
    window.ga('set', 'page', window.location.pathname);
    window.ga('send', 'pageview');
  }
};

if (process.env.SENTRY_PUBLIC_DSN) {
  Raven.config(process.env.SENTRY_PUBLIC_DSN).install();
}

// redirect to lp if not visited before, not logged in and not accessing a subpage
if (!Cookie.get('session') && !Cookie.get('lp_visited') && !window.location.pathname.replace('/', '')) {
   // window.location.href = process.env.KNACKSTEEM_LANDING_URL;
}

steem.api.setOptions({ transport: 'http' });
if (process.env.STEEMJS_URL) {
  steem.api.setOptions({ url: process.env.STEEMJS_URL });
}

message.config({
  top: 62,
  duration: 3,
});

const render = (Component) => {
  ReactDOM.render(
    <Provider store={store}>
      <LocaleProvider locale={enUS}>
        {process.env.NODE_ENV !== 'production' ?
          <AppContainer>
            <Component
              history={history}
              onUpdate={logPageView}
            />
          </AppContainer>
          :
          <Component
            history={history}
            onUpdate={logPageView}
          />
        }
      </LocaleProvider>
    </Provider>,
    document.getElementById('app'),
  );
};

render(AppHost);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./AppHost', () => { render(AppHost); });
}
