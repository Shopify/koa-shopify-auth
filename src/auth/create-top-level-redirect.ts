import querystring from 'querystring';

import {Context} from 'koa';

import redirectionPage from './redirection-page';

export default function createTopLevelRedirect(apiKey: string, path: string) {
  return function topLevelRedirect(ctx: Context) {
    const {query} = ctx;
    const {shop, host} = query;

    const params = {shop};
    const queryString = querystring.stringify(params);

    ctx.body = redirectionPage({
      origin: shop,
      redirectTo: `https://${ctx.host}${path}?${queryString}`,
      apiKey,
      host,
    });
  };
}
