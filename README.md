# DEPRECATED `@shopify/koa-shopify-auth`

NOTE: this repo is no longer maintained. Prefer the [official Node API](https://github.com/Shopify/shopify-api-node).

If you're still wanting to use Koa, see [simple-koa-shopify-auth](https://github.com/TheSecurityDev/simple-koa-shopify-auth) for a potential community solution.

![Build Status](https://github.com/Shopify/koa-shopify-auth/workflows/CI/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md) [![npm version](https://badge.fury.io/js/%40shopify%2Fkoa-shopify-auth.svg)](https://badge.fury.io/js/%40shopify%2Fkoa-shopify-auth)

Middleware to authenticate a [Koa](http://koajs.com/) application with [Shopify](https://www.shopify.ca/).

Sister module to [`@shopify/shopify-express`](https://www.npmjs.com/package/@shopify/shopify-express), but simplified.

Features you might know from the express module like the webhook middleware and proxy will be presented as their [own packages instead](https://github.com/Shopify/quilt/blob/master/packages/koa-shopify-graphql-proxy/README.md).

## Warning: versions prior to 3.1.68 vulnerable to reflected XSS

Versions prior to 3.1.68 are vulnerable to a reflected XSS attack. Please update to the latest version to protect your app.

## Installation

This package builds upon the [Shopify Node Library](https://github.com/Shopify/shopify-node-api), so your app will have access to all of the library's features as well as the Koa-specific middlewares this package provides.

```bash
$ yarn add @shopify/koa-shopify-auth
```

## Usage

This package exposes `shopifyAuth` by default, and `verifyRequest` as a named export. To make it ready for use, you need to initialize the Shopify Library and then use that to initialize this package:

```js
import shopifyAuth, {verifyRequest} from '@shopify/koa-shopify-auth';
import Shopify, {ApiVersion} from '@shopify/shopify-api';

// Initialize the library
Shopify.Context.initialize({
  API_KEY: 'Your API_KEY',
  API_SECRET_KEY: 'Your API_SECRET_KEY',
  SCOPES: ['Your scopes'],
  HOST_NAME: 'Your HOST_NAME (omit the https:// part)',
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // More information at https://github.com/Shopify/shopify-node-api/blob/main/docs/issues.md#notes-on-session-handling
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});
```

### shopifyAuth

Returns an authentication middleware taking up (by default) the routes `/auth` and `/auth/callback`.

```js
app.use(
  shopifyAuth({
    // if specified, mounts the routes off of the given path
    // eg. /shopify/auth, /shopify/auth/callback
    // defaults to ''
    prefix: '/shopify',
    // set access mode, default is 'online'
    accessMode: 'offline',
    // callback for when auth is completed
    afterAuth(ctx) {
      const {shop, accessToken} = ctx.state.shopify;

      console.log('We did it!', accessToken);

      ctx.redirect('/');
    },
  }),
);
```

#### `/auth`

This route starts the oauth process. It expects a `?shop` parameter and will error out if one is not present. To install it in a store just go to `/auth?shop=myStoreSubdomain`.

### `/auth/callback`

You should never have to manually go here. This route is purely for shopify to send data back during the oauth process.

### `verifyRequest`

Returns a middleware to verify requests before letting them further in the chain.

**Note**: if you're using a prefix for `shopifyAuth`, that prefix needs to be present in the paths for `authRoute` and `fallbackRoute` below.

```javascript
app.use(
  verifyRequest({
    // path to redirect to if verification fails
    // defaults to '/auth'
    authRoute: '/foo/auth',
    // path to redirect to if verification fails and there is no shop on the query
    // defaults to '/auth'
    fallbackRoute: '/install',
    // which access mode is being used
    // defaults to 'online'
    accessMode: 'offline',
    // if false, redirect the user to OAuth. If true, send back a 403 with the following headers:
    //  - X-Shopify-API-Request-Failure-Reauthorize: '1'
    //  - X-Shopify-API-Request-Failure-Reauthorize-Url: '<auth_url_path>'
    // defaults to false
    returnHeader: true,
  }),
);
```

### Migrating from cookie-based authentication to session tokens

Versions prior to v4 of this package used cookies to store session information for your app. However, internet browsers have been moving to block 3rd party cookies, which creates issues for embedded apps.

If you have an app using this package, you can migrate from cookie-based authentication to session tokens by performing a few steps:

- Upgrade your `@shopify/koa-shopify-auth` dependency to v4+
- Update your server as per the [Usage](#usage) instructions to properly initialize the `@shopify/shopify-api` library
- If you are using `accessMode: 'offline'` in `shopifyAuth`, make sure to pass the same value in `verifyRequest`
- Install `@shopify/app-bridge-utils` in your frontend app
- In your frontend app, replace `fetch` calls with `authenticatedFetch` from App Bridge Utils

**Note**: the backend steps need to be performed to fully migrate your app to v4, even if your app is not embedded.

You can learn more about session tokens in our [authentication tutorial](https://shopify.dev/tutorials/authenticate-your-app-using-session-tokens). Go to the **frontend** changes section under **Setup** for instructions and examples on how to update your frontend code.

### Example app

This example will enable you to quickly set up the backend for a working development app. Please read the [Gotchas](#gotchas) session below to make sure you are ready for production use.

```javascript
import 'isomorphic-fetch';

import Koa from 'koa';
import Router from 'koa-router';
import shopifyAuth, {verifyRequest} from '@shopify/koa-shopify-auth';
import Shopify, {ApiVersion} from '@shopify/shopify-api';

// Loads the .env file into process.env. This is usually done using actual environment variables in production
import dotenv from 'dotenv';
dotenv.config();

const port = parseInt(process.env.PORT, 10) || 8081;

// initializes the library
Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SHOPIFY_APP_SCOPES,
  HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/^https:\/\//, ''),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // More information at https://github.com/Shopify/shopify-node-api/blob/main/docs/issues.md#notes-on-session-handling
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

const app = new Koa();
const router = new Router();
app.keys = [Shopify.Context.API_SECRET_KEY];

// Sets up shopify auth
app.use(
  shopifyAuth({
    async afterAuth(ctx) {
      const {shop, accessToken} = ctx.state.shopify;
      ACTIVE_SHOPIFY_SHOPS[shop] = true;

      // Your app should handle the APP_UNINSTALLED webhook to make sure merchants go through OAuth if they reinstall it
      const response = await Shopify.Webhooks.Registry.register({
        shop,
        accessToken,
        path: '/webhooks',
        topic: 'APP_UNINSTALLED',
        webhookHandler: async (topic, shop, body) =>
          delete ACTIVE_SHOPIFY_SHOPS[shop],
      });

      if (!response['APP_UNINSTALLED'].success) {
        console.log(
          `Failed to register APP_UNINSTALLED webhook: ${response['APP_UNINSTALLED'].result}`,
        );
      }

      // Redirect to app with shop parameter upon auth
      ctx.redirect(`/?shop=${shop}`);
    },
  }),
);

router.get('/', async (ctx) => {
  const shop = ctx.query.shop;

  // If this shop hasn't been seen yet, go through OAuth to create a session
  if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
    ctx.redirect(`/auth?shop=${shop}`);
  } else {
    // Load app skeleton. Don't include sensitive information here!
    ctx.body = '🎉';
  }
});

router.post('/webhooks', async (ctx) => {
  try {
    await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
    console.log(`Webhook processed, returned status code 200`);
  } catch (error) {
    console.log(`Failed to process webhook: ${error}`);
  }
});

// Everything else must have sessions
router.get('(.*)', verifyRequest(), async (ctx) => {
  // Your application code goes here
});

app.use(router.allowedMethods());
app.use(router.routes());
app.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);
});
```

## Gotchas

### Session

The provided `MemorySessionStorage` class may not be scalable for production use. You can implement your own strategy by creating a class that implements a few key methods. Learn more about [how the Shopify Library handles sessions](https://github.com/Shopify/shopify-node-api/blob/main/docs/issues.md#notes-on-session-handling).

### Testing locally

By default this app requires that you use a `myshopify.com` host in the `shop` parameter. You can modify this to test against a local/staging environment via the `myShopifyDomain` option to `shopifyAuth` (e.g. `myshopify.io`).
