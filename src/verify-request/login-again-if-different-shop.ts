import {Context} from 'koa';

import Shopify from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';

import {AccessMode, NextFunction} from '../types';
import {isAccessModeOnline} from '../utilities'

import {Routes} from './types';
import {clearSession, redirectToAuth} from './utilities';
import {DEFAULT_ACCESS_MODE} from '../auth';

export function loginAgainIfDifferentShop(routes: Routes, accessMode: AccessMode = DEFAULT_ACCESS_MODE) {
  return async function loginAgainIfDifferentShopMiddleware(
    ctx: Context,
    next: NextFunction,
  ) {
    const {query} = ctx;
    let session: Session | undefined;
    session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res, isAccessModeOnline(accessMode));

    if (session && query.shop && session.shop !== query.shop) {
      await clearSession(ctx, accessMode);
      redirectToAuth(routes, ctx);
      return;
    }

    await next();
  };
}
