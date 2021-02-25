import '../../test/test_helper';

import Shopify from '@shopify/shopify-api';
import setUserAgent, {KOA_USER_AGENT_PREFIX} from '../set-user-agent';

describe('setUserAgent', () => {
  it('sets the user agent if it is empty', () => {
    expect(Shopify.Context.USER_AGENT_PREFIX).toBeUndefined();

    setUserAgent();
    expect(Shopify.Context.USER_AGENT_PREFIX).toEqual(KOA_USER_AGENT_PREFIX);

    setUserAgent();
    expect(Shopify.Context.USER_AGENT_PREFIX).toEqual(KOA_USER_AGENT_PREFIX);
  });

  it('sets the user agent if it is set', () => {
    expect(Shopify.Context.USER_AGENT_PREFIX).toBeUndefined();

    const testPrefix = 'Test user agent';
    Shopify.Context.USER_AGENT_PREFIX = testPrefix;
    Shopify.Context.initialize(Shopify.Context);

    setUserAgent();
    expect(Shopify.Context.USER_AGENT_PREFIX).toEqual(`${testPrefix} | ${KOA_USER_AGENT_PREFIX}`);

    setUserAgent();
    expect(Shopify.Context.USER_AGENT_PREFIX).toEqual(`${testPrefix} | ${KOA_USER_AGENT_PREFIX}`);
  });
});
