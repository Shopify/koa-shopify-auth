import '../../test/test_helper';

import {createMockContext} from '@shopify/jest-koa-mocks';
import {fetch} from '@shopify/jest-dom-mocks';
import {StatusCode} from '@shopify/network';
import Shopify from '@shopify/shopify-api';
import jwt from 'jsonwebtoken';

import verifyRequest from '../verify-request';
import {clearSession} from '../utilities';
import {TEST_COOKIE_NAME, TOP_LEVEL_OAUTH_COOKIE_NAME} from '../../index';
import { clear } from 'console';

const TEST_SHOP = 'testshop.myshopify.io';
const TEST_USER = '1';

describe('verifyRequest', () => {
  afterEach(fetch.restore);

  describe('when there is an accessToken and shop in session', () => {
    let jwtToken: string;
    const jwtSessionId = Shopify.Auth.getJwtSessionId(TEST_SHOP, TEST_USER);

    beforeEach(async () => {
      const jwtPayload = {
        iss: `https://${TEST_SHOP}/admin`,
        dest: `https://${TEST_SHOP}`,
        aud: Shopify.Context.API_KEY,
        sub: TEST_USER,
        exp: (Date.now() + 3600000) / 1000,
        nbf: 1234,
        iat: 1234,
        jti: '4321',
        sid: 'abc123',
      };

      jwtToken = jwt.sign(jwtPayload, Shopify.Context.API_SECRET_KEY, { algorithm: 'HS256' });

      const session = new Shopify.Session.Session(jwtSessionId);
      session.shop = TEST_SHOP;
      session.expires = new Date(jwtPayload.exp * 1000);
      session.accessToken = 'test_token';
      await Shopify.Utils.storeSession(session);
    });

    it('calls next', async () => {
      const verifyRequestMiddleware = verifyRequest();
      const ctx = createMockContext({
        url: appUrl(TEST_SHOP),
        headers: { authorization: `Bearer ${jwtToken}` }
      } as any);
      const next = jest.fn();

      fetch.mock(metaFieldsUrl(TEST_SHOP), StatusCode.Ok);
      await verifyRequestMiddleware(ctx, next);

      expect(next).toHaveBeenCalled();
    });

    it('calls next when there is no shop in the query', async () => {
      const verifyRequestMiddleware = verifyRequest();
      const ctx = createMockContext({
        url: appUrl(),
        headers: { authorization: `Bearer ${jwtToken}` }
      });
      const next = jest.fn();

      fetch.mock(metaFieldsUrl(TEST_SHOP), StatusCode.Ok);
      await verifyRequestMiddleware(ctx, next);

      expect(next).toHaveBeenCalled();
    });

    it('clears the top level oauth cookie', async () => {
      const verifyRequestMiddleware = verifyRequest();
      const ctx = createMockContext({
        url: appUrl(TEST_SHOP),
        headers: { authorization: `Bearer ${jwtToken}` }
      });
      const next = jest.fn();

      fetch.mock(metaFieldsUrl(TEST_SHOP), StatusCode.Ok);
      await verifyRequestMiddleware(ctx, next);

      expect(ctx.cookies.set).toHaveBeenCalledWith(TOP_LEVEL_OAUTH_COOKIE_NAME);
    });

    it('redirects to the given authRoute if the token is invalid', async () => {
      const authRoute = '/my-auth-route';

      const verifyRequestMiddleware = verifyRequest({authRoute});
      const next = jest.fn();
      const ctx = createMockContext({
        url: appUrl(TEST_SHOP),
        redirect: jest.fn(),
        headers: { authorization: `Bearer ${jwtToken}` },
      });

      await expireJwtSession(jwtSessionId);
      await verifyRequestMiddleware(ctx, next);

      expect(ctx.redirect).toHaveBeenCalledWith(
        `${authRoute}?shop=${TEST_SHOP}`,
      );
    });

    it('redirects to the given authRoute if the shop in session does not match the one in the query param', async () => {
      const authRoute = '/my-auth-route';

      const verifyRequestMiddleware = verifyRequest({authRoute});
      const next = jest.fn();
      const ctx = createMockContext({
        url: appUrl('some_other_shop.myshopify.io'),
        redirect: jest.fn(),
        headers: { authorization: `Bearer ${jwtToken}` }
      });

      fetch.mock(metaFieldsUrl(TEST_SHOP), StatusCode.Ok);
      await verifyRequestMiddleware(ctx, next);

      expect(ctx.redirect).toHaveBeenCalledWith(
        `${authRoute}?shop=some_other_shop.myshopify.io`,
      );
    });
  });

  describe('when there is no session', () => {
    it('sets the test cookie', async () => {
      const verifyRequestMiddleware = verifyRequest();
      const ctx = createMockContext({});
      const next = jest.fn();

      await verifyRequestMiddleware(ctx, next);

      expect(ctx.cookies.set).toHaveBeenCalledWith(TEST_COOKIE_NAME, '1');
    });

    it('redirects to /auth if shop is present on query', async () => {
      const shop = 'myshop.com';

      const verifyRequestMiddleware = verifyRequest();
      const next = jest.fn();
      const ctx = createMockContext({
        url: appUrl(shop),
        redirect: jest.fn(),
      });

      await verifyRequestMiddleware(ctx, next);

      expect(ctx.redirect).toHaveBeenCalledWith(`/auth?shop=${shop}`);
    });

    it('redirects to /auth if shop is not present on query', async () => {
      const verifyRequestMiddleware = verifyRequest();
      const next = jest.fn();
      const ctx = createMockContext({
        url: appUrl(),
        redirect: jest.fn(),
      });

      await verifyRequestMiddleware(ctx, next);

      expect(ctx.redirect).toHaveBeenCalledWith(`/auth`);
    });

    it('redirects to the given authRoute if shop is present on query', async () => {
      const shop = 'myshop.com';
      const authRoute = '/my-auth-route';

      const verifyRequestMiddleware = verifyRequest({authRoute});
      const next = jest.fn();
      const ctx = createMockContext({
        url: appUrl(shop),
        redirect: jest.fn(),
      });

      await verifyRequestMiddleware(ctx, next);

      expect(ctx.redirect).toHaveBeenCalledWith(`${authRoute}?shop=${shop}`);
    });

    it('redirects to the given fallbackRoute if shop is not present on query', async () => {
      const fallbackRoute = '/somewhere-on-the-app';
      const verifyRequestMiddleware = verifyRequest({fallbackRoute});

      const next = jest.fn();
      const ctx = createMockContext({
        redirect: jest.fn(),
      });

      await verifyRequestMiddleware(ctx, next);

      expect(ctx.redirect).toHaveBeenCalledWith(fallbackRoute);
    });

    it('does not fail to clear the current session', async() => {
      const jwtPayload = {
        iss: `https://${TEST_SHOP}/admin`,
        dest: `https://${TEST_SHOP}`,
        aud: Shopify.Context.API_KEY,
        sub: TEST_USER,
        exp: (Date.now() + 3600000) / 1000,
        nbf: 1234,
        iat: 1234,
        jti: '4321',
        sid: 'abc123',
      };

      const jwtToken = jwt.sign(jwtPayload, Shopify.Context.API_SECRET_KEY, { algorithm: 'HS256' });

      const ctx = createMockContext({
        url: appUrl('some_other_shop.myshopify.io'),
        redirect: jest.fn(),
        headers: { authorization: `Bearer ${jwtToken}` }
      });

      expect(await clearSession(ctx)).toBeUndefined();
    });
  });
});

function metaFieldsUrl(shop: string) {
  return `https://${shop}/admin/metafields.json`;
}

function appUrl(shop?: string) {
  return shop == null ? '/foo' : `/foo?shop=${shop}`;
}

async function expireJwtSession(sessionId: string) {
  const session = await Shopify.Context.SESSION_STORAGE.loadSession(sessionId);
  session.expires = new Date(Date.now() - 60000);
  await Shopify.Utils.storeSession(session);
}
