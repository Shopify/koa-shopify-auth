import Shopify from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';

import {Context} from 'koa';

import {NextFunction} from '../types';
import {TEST_COOKIE_NAME, TOP_LEVEL_OAUTH_COOKIE_NAME} from '../index';

import {Routes} from './types';
import {redirectToAuth} from './utilities';

export function verifyToken(routes: Routes) {
  return async function verifyTokenMiddleware(
    ctx: Context,
    next: NextFunction,
  ) {
    let session: Session | undefined;
    session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);

    if (session?.accessToken && (!session?.expires || session?.expires >= new Date())) {
      ctx.cookies.set(TOP_LEVEL_OAUTH_COOKIE_NAME);
      await next();
      return;
    }

    ctx.cookies.set(TEST_COOKIE_NAME, '1');

    redirectToAuth(routes, ctx);
  };
}
