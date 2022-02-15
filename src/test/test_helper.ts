import Shopify, {ApiVersion} from '@shopify/shopify-api';
import {MemorySessionStorage} from '@shopify/shopify-api/dist/auth/session';

beforeEach(() => {
  // We want to reset the Context object on every run so that tests start with a consistent state
  Shopify.Context.initialize({
    API_KEY: 'test_key',
    API_SECRET_KEY: 'test_secret_key',
    SCOPES: ['test_scope'],
    HOST_NAME: 'test_host_name',
    API_VERSION: ApiVersion.Unstable,
    IS_EMBEDDED_APP: true,
    SESSION_STORAGE: new MemorySessionStorage(),
  });
  Shopify.Context.USER_AGENT_PREFIX = undefined;
});
