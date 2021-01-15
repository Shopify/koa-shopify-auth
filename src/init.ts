import Shopify from '@shopify/shopify-api';

export default function initializeShopify(context: typeof Shopify.Context) {
  Shopify.Context.initialize(context);
}
