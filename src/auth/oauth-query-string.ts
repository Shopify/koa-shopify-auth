import querystring from 'querystring';

import {Context} from 'koa';
import nonce from 'nonce';

import {OAuthStartOptions} from '../types';

import getCookieOptions from './cookie-options';
import getHost from './../lib/get-host';

const createNonce = nonce();

export default function oAuthQueryString(
  ctx: Context,
  options: OAuthStartOptions,
  callbackPath: string,
) {
  const host = getHost(ctx);
  const {cookies} = ctx;
  const {scopes = [], apiKey, accessMode} = options;

  const requestNonce = createNonce();
  cookies.set('shopifyNonce', requestNonce, getCookieOptions(ctx));

  /* eslint-disable @typescript-eslint/camelcase */
  const redirectParams = {
    state: requestNonce,
    scope: scopes.join(', '),
    client_id: apiKey,
    redirect_uri: `https://${host}${callbackPath}`,
  };
  /* eslint-enable @typescript-eslint/camelcase */

  if (accessMode === 'online') {
    redirectParams['grant_options[]'] = 'per-user';
  }

  return querystring.stringify(redirectParams);
}
