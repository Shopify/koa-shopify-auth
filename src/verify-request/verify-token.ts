import Shopify from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';

import {Context} from 'koa';

import {AccessMode, NextFunction} from '../types';
import {TEST_COOKIE_NAME, TOP_LEVEL_OAUTH_COOKIE_NAME} from '../index';

import {Routes} from './types';
import {redirectToAuth} from './utilities';
import {DEFAULT_ACCESS_MODE} from '../auth';
import { HttpResponseError } from '@shopify/shopify-api/dist/error';

export const REAUTH_HEADER = 'X-Shopify-API-Request-Failure-Reauthorize';
export const REAUTH_URL_HEADER = 'X-Shopify-API-Request-Failure-Reauthorize-Url';

export function verifyToken(routes: Routes, accessMode: AccessMode = DEFAULT_ACCESS_MODE, returnHeader = false) {
  return async function verifyTokenMiddleware(
    ctx: Context,
    next: NextFunction,
  ) {
    let session: Session | undefined;
    session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res, accessMode === 'online');

    if (session) {
      const scopesChanged = !Shopify.Context.SCOPES.equals(session.scope);

      if (!scopesChanged && session.accessToken && (!session.expires || session.expires >= new Date())) {
        try {
          // make a request to make sure oauth has succeeded, retry otherwise
          const client = new Shopify.Clients.Rest(session.shop, session.accessToken)
          await client.get({ path: "metafields" }) 

          ctx.cookies.set(TOP_LEVEL_OAUTH_COOKIE_NAME);
          await next();
          return;
        } catch(e) {
          if (e instanceof HttpResponseError && e.code == 401){
              // only catch 401 errors
          } else {
            throw e
          }
        }
      }
    }

    ctx.cookies.set(TEST_COOKIE_NAME, '1');

    if (returnHeader) {
      ctx.response.status = 403;
      ctx.response.set(REAUTH_HEADER, '1');

      let shop: string|undefined = undefined;
      if (session) {
        shop = session.shop;
      } else if (Shopify.Context.IS_EMBEDDED_APP) {
        const authHeader: string|undefined = ctx.req.headers.authorization;
        const matches = authHeader?.match(/Bearer (.*)/);
        if (matches) {
          const payload = Shopify.Utils.decodeSessionToken(matches[1]);
          shop = payload.dest.replace('https://', '');
        }
      }

      if (shop) {
        ctx.response.set(REAUTH_URL_HEADER, `${routes.authRoute}?shop=${shop}`);
      }
      return;
    } else {
      redirectToAuth(routes, ctx);
    }
  };
}
