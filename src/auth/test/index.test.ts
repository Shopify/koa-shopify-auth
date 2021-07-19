import '../../test/test_helper';
import {AccessMode} from '../../types';

// Mock out the entire Shopify lib responses here so we don't have to deal with cookies and the underlying request
// modules
jest.mock('@shopify/shopify-api');
import Shopify from '@shopify/shopify-api';

import {createMockContext} from '@shopify/jest-koa-mocks';
import querystring from 'querystring';
import crypto from 'crypto';

import createShopifyAuth from '../index';
import createTopLevelOAuthRedirect from '../create-top-level-oauth-redirect';
import {OAuthStartOptions} from '../../types';
import {KOA_USER_AGENT_PREFIX} from '../set-user-agent';

const mockTopLevelOAuthRedirect = jest.fn();
jest.mock('../create-top-level-oauth-redirect', () =>
  jest.fn(() => mockTopLevelOAuthRedirect),
);

const mockRequestStorageAccess = jest.fn();
jest.mock('../create-request-storage-access', () => () =>
  mockRequestStorageAccess,
);

const mockEnableCookies = jest.fn();
jest.mock('../create-enable-cookies', () => () => mockEnableCookies);

const baseUrl = 'https://myapp.com/auth';
const shop = 'test-shop.myshopify.io';

const baseConfig: OAuthStartOptions = {
  accessMode: AccessMode.Offline,
};

function nextFunction() {}

describe('Index', () => {
  beforeEach(() => {
    Shopify.Auth.beginAuth = jest.fn(() => Promise.resolve(`https://${shop}/auth/callback`));

    const session = new Shopify.Session.Session('test_session');
    session.shop = shop;
    session.accessToken = 'test_token';
    Shopify.Utils.loadCurrentSession = jest.fn(() => Promise.resolve(session));
  });

  describe('with the /auth path', () => {
    describe('with no test cookie', () => {
      it('redirects to request storage access', async () => {
        const shopifyAuth = createShopifyAuth(baseConfig);
        const ctx = createMockContext({
          url: baseUrl,
        });

        await shopifyAuth(ctx, nextFunction);

        expect(mockRequestStorageAccess).toHaveBeenCalledWith(ctx);
      });
    });

    describe('with no test cookie but a granted storage access cookie', () => {
      it('redirects to /auth/inline at the top-level', async () => {
        const shopifyAuth = createShopifyAuth(baseConfig);
        const ctx = createMockContext({
          url: baseUrl,
          cookies: {'shopify.granted_storage_access': '1'},
        });

        await shopifyAuth(ctx, nextFunction);

        expect(createTopLevelOAuthRedirect).toHaveBeenCalledWith(
          Shopify.Context.API_KEY,
          '/auth/inline',
        );
        expect(mockTopLevelOAuthRedirect).toHaveBeenCalledWith(ctx);
      });
    });

    describe('with a test cookie but not top-level cookie', () => {
      it('redirects to /auth/inline at the top-level', async () => {
        const shopifyAuth = createShopifyAuth(baseConfig);
        const ctx = createMockContext({
          url: baseUrl,
          cookies: {shopifyTestCookie: '1'},
        });

        await shopifyAuth(ctx, nextFunction);

        expect(createTopLevelOAuthRedirect).toHaveBeenCalledWith(
          Shopify.Context.API_KEY,
          '/auth/inline',
        );
        expect(mockTopLevelOAuthRedirect).toHaveBeenCalledWith(ctx);
      });
    });

    describe('with a test cookie and a top-level cookie', () => {
      it('performs inline oauth', async () => {
        const shopifyAuth = createShopifyAuth(baseConfig);
        const ctx = createMockContext({
          url: `${baseUrl}?shop=${shop}`,
          cookies: {shopifyTestCookie: '1', shopifyTopLevelOAuth: '1'},
        });

        await shopifyAuth(ctx, nextFunction);
        expect(ctx.redirect).toHaveBeenCalledTimes(1);

        const url = new URL((ctx.redirect as jest.Mock).mock.calls[0][0]);
        expect(url.hostname).toEqual(shop);
      });
    });
  });

  describe('with the /auth/inline path', () => {
    it('performs inline oauth', async () => {
      const shopifyAuth = createShopifyAuth(baseConfig);
      const ctx = createMockContext({
        url: `${baseUrl}/inline?shop=${shop}`,
      });

      await shopifyAuth(ctx, nextFunction);
      expect(ctx.redirect).toHaveBeenCalledTimes(1);

      const url = new URL((ctx.redirect as jest.Mock).mock.calls[0][0]);
      expect(url.hostname).toEqual(shop);
    });

    it('throws a 400 when no shop query parameter is given', async () => {
      const shopifyAuth = createShopifyAuth(baseConfig);
      const ctx = createMockContext({
        url: `${baseUrl}/inline`,
      });

      await shopifyAuth(ctx, nextFunction);

      expect(ctx.throw).toHaveBeenCalledWith(400);
    });
  });

  describe('with the /auth/callback path', () => {
    const baseCallbackUrl = 'https://myapp.com/auth/callback';
    const nonce = 'totallyrealnonce';
    const queryData = {
      code: 'def',
      shop: shop,
      state: nonce,
      hmac: 'abc',
    };

    beforeEach(() => {
      Shopify.Auth.validateAuthCallback = jest.fn(() => Promise.resolve());
    });

    it('performs oauth callback', async () => {
      let ctx = createMockContext({
        url: `${baseCallbackUrl}?${querystring.stringify(queryData)}`,
        throw: jest.fn(),
      });

      const shopifyAuth = createShopifyAuth(baseConfig);
      await shopifyAuth(ctx, nextFunction);

      expect(ctx.throw).not.toHaveBeenCalled();
      expect(ctx.state.shopify.shop).toEqual(shop);
    });

    it('performs oauth callback with offline sessions', async () => {
      let ctx = createMockContext({
        url: `${baseCallbackUrl}?${querystring.stringify(queryData)}`,
        throw: jest.fn(),
      });

      const shopifyAuth = createShopifyAuth({...baseConfig, accessMode: AccessMode.Offline});
      await shopifyAuth(ctx, nextFunction);

      expect(ctx.throw).not.toHaveBeenCalled();
      expect(ctx.state.shopify.shop).toEqual(shop);
    });

    it('calls afterAuth with ctx when the token request succeeds', async () => {
      const afterAuth = jest.fn();

      let ctx = createMockContext({
        url: `${baseCallbackUrl}?${querystring.stringify(queryData)}`,
        throw: jest.fn(),
      });

      const shopifyAuth = createShopifyAuth({
        ...baseConfig,
        afterAuth,
      });
      await shopifyAuth(ctx, nextFunction);

      expect(ctx.throw).not.toHaveBeenCalled();
      expect(ctx.state.shopify.shop).toEqual(shop);
      expect(afterAuth).toHaveBeenCalledWith(ctx);
    });

    it('throws a 400 if the OAuth callback is invalid', async () => {
      Shopify.Auth.validateAuthCallback = jest.fn(() => Promise.reject(new Shopify.Errors.InvalidOAuthError));

      const ctx = createMockContext({
        url: baseCallbackUrl,
        throw: jest.fn(),
      });

      const shopifyAuth = createShopifyAuth(baseConfig);
      await shopifyAuth(ctx, nextFunction);

      expect(ctx.throw).toHaveBeenCalledWith(400, '');
    });

    it('retries if the session does not exist', async () => {
      Shopify.Auth.validateAuthCallback = jest.fn(() => Promise.reject(new Shopify.Errors.SessionNotFound));

      const ctx = createMockContext({
        url: `${baseCallbackUrl}?${querystring.stringify(queryData)}`,
        throw: jest.fn(),
      });

      const shopifyAuth = createShopifyAuth(baseConfig);
      await shopifyAuth(ctx, nextFunction);

      expect(ctx.redirect).toHaveBeenCalledTimes(1);
    });

    it('retries if the cookie does not exist', async () => {
      Shopify.Auth.validateAuthCallback = jest.fn(() => Promise.reject(new Shopify.Errors.CookieNotFound));

      const ctx = createMockContext({
        url: `${baseCallbackUrl}?${querystring.stringify(queryData)}`,
        throw: jest.fn(),
      });

      const shopifyAuth = createShopifyAuth(baseConfig);
      await shopifyAuth(ctx, nextFunction);

      expect(ctx.redirect).toHaveBeenCalledTimes(1);
    });

    it('throws a 500 on any other errors', async () => {
      Shopify.Auth.validateAuthCallback = jest.fn(() => Promise.reject(new Shopify.Errors.ShopifyError));

      const ctx = createMockContext({
        url: `${baseCallbackUrl}?${querystring.stringify(queryData)}`,
        throw: jest.fn(),
      });

      const shopifyAuth = createShopifyAuth(baseConfig);
      await shopifyAuth(ctx, nextFunction);

      expect(ctx.throw).toHaveBeenCalledWith(500, '');
    });

  });

  describe('with the /auth/enable_cookies path', () => {
    it('renders the enable_cookies page', async () => {
      const shopifyAuth = createShopifyAuth(baseConfig);
      const ctx = createMockContext({
        url: `${baseUrl}/enable_cookies`,
      });

      await shopifyAuth(ctx, nextFunction);

      expect(mockEnableCookies).toHaveBeenCalledWith(ctx);
    });
  });

  it('always sets the user agent prefix', () => {
    expect(Shopify.Context.USER_AGENT_PREFIX).toBeUndefined();

    const shopifyAuth = createShopifyAuth(baseConfig);
    expect(Shopify.Context.USER_AGENT_PREFIX).toEqual(KOA_USER_AGENT_PREFIX);
  });
});
