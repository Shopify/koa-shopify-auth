import {Context} from 'koa';

import Shopify from '@shopify/shopify-api';

import {Routes} from './types';

export function redirectToAuth(
  {fallbackRoute, authRoute}: Routes,
  ctx: Context,
) {
  const {
    query: {shop},
  } = ctx;

  const routeForRedirect =
    shop == null ? fallbackRoute : `${authRoute}?shop=${shop}`;

  ctx.redirect(routeForRedirect);
}

export async function clearSession(ctx: Context) {
  const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);

  if (session) {
    await Shopify.Context.deleteSession(session.id);
  }
}
