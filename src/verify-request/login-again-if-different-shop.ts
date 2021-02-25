import {Context} from 'koa';

import Shopify from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';

import {NextFunction} from '../types';

import {Routes} from './types';
import {clearSession, redirectToAuth} from './utilities';

export function loginAgainIfDifferentShop(routes: Routes) {
  return async function loginAgainIfDifferentShopMiddleware(
    ctx: Context,
    next: NextFunction,
  ) {
    const {query} = ctx;
    let session: Session | undefined;
    session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);

    if (session && query.shop && session.shop !== query.shop) {
      await clearSession(ctx);
      redirectToAuth(routes, ctx);
      return;
    }

    await next();
  };
}
