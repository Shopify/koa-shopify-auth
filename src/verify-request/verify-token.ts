import Shopify from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';

import {Context} from 'koa';

import {AccessMode, NextFunction} from '../types';
import {TEST_COOKIE_NAME, TOP_LEVEL_OAUTH_COOKIE_NAME} from '../index';

import {Routes} from './types';
import {redirectToAuth} from './utilities';
import {DEFAULT_ACCESS_MODE} from '../auth';

export function verifyToken(routes: Routes, accessMode: AccessMode = DEFAULT_ACCESS_MODE) {
  return async function verifyTokenMiddleware(
    ctx: Context,
    next: NextFunction,
  ) {
    let session: Session | undefined;
    session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res, accessMode === 'online');

    if (session) {
      const scopesChanged = !Shopify.Context.SCOPES.equals(session.scope);

      if (!scopesChanged && session.accessToken && (!session.expires || +(new Date(session.expires)) >= +(new Date()))) {
        ctx.cookies.set(TOP_LEVEL_OAUTH_COOKIE_NAME);
        await next();
        return;
      }
    }

    ctx.cookies.set(TEST_COOKIE_NAME, '1');

    redirectToAuth(routes, ctx);
  };
}
