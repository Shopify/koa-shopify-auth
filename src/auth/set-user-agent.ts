import Shopify from '@shopify/shopify-api';

export const KOA_USER_AGENT_PREFIX = 'Koa Shopify Auth';

export default function setUserAgent() {
  if (!Shopify.Context.USER_AGENT_PREFIX) {
    Shopify.Context.USER_AGENT_PREFIX = KOA_USER_AGENT_PREFIX;
  } else if (
    !Shopify.Context.USER_AGENT_PREFIX.includes(KOA_USER_AGENT_PREFIX)
  ) {
    Shopify.Context.USER_AGENT_PREFIX = `${Shopify.Context.USER_AGENT_PREFIX} | ${KOA_USER_AGENT_PREFIX}`;
  }
}
