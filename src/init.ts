import Shopify from '@shopify/shopify-api';

export default function initializeShopify(context: typeof Shopify.Context) {
  context.USER_AGENT_PREFIX = `${context.USER_AGENT_PREFIX} | Koa Shopify Auth`;
  Shopify.Context.initialize(context);
}
