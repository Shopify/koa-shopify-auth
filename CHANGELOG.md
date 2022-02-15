# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.1.5] - 2022-02-15

### Fixed

- Replace deprecated metafields API request used for oauth token check with longer lived call to the shop endpoint [144](https://github.com/Shopify/koa-shopify-auth/pull/144)

## [4.1.4] - 2021-07-19

### Fixed

- Retry OAuth if cookie / session has expired on callback [112](https://github.com/Shopify/koa-shopify-auth/pull/112)

## [4.1.3] - 2021-04-22

### Fixed

- Fix authentication error if the Shopify session ended before its expiration date [94](https://github.com/Shopify/koa-shopify-auth/pull/94)

## [4.1.2] - 2021-03-30

### Fixed

- Remove `samesite=none` setting from `cookie-options`. [83](https://github.com/Shopify/koa-shopify-auth/pull/83)

## [4.1.1] - 2021-03-26

### Added

- Bumped `@shopify/shopify-api` version to v1.2.1 to include the new API version (`April21`). [80](https://github.com/Shopify/koa-shopify-auth/pull/80)

## [4.1.0] - 2021-03-23

### Added

- Add `returnHeader` option to `verifyRequest`, which allows using the middleware on XHR requests. [78](https://github.com/Shopify/koa-shopify-auth/pull/78)

## [4.0.3] - 2021-03-16

### Fixed

- Fix bad import path for type AccessMode. [63](https://github.com/Shopify/koa-shopify-auth/pull/63)

## [4.0.2] - 2021-03-03

### Fixed

- Ensure both `shopifyAuth` and `verifyRequest` work in offline mode. [59](https://github.com/Shopify/koa-shopify-auth/pull/59)

## [4.0.1] - 2021-02-26

### Fixed

- Sets the `USER_AGENT_PREFIX` on `Shopify.Context` for usage tracking data. [55](https://github.com/Shopify/koa-shopify-auth/pull/55)

## [4.0.0] - 2021-02-25

### Added

- [Feature] Start using the new Shopify library instead of implementing all of the server-side functions. [54](https://github.com/Shopify/koa-shopify-auth/pull/54)
- Sets the `USER_AGENT_PREFIX` on `Shopify.Context` for usage tracking data. [51](https://github.com/Shopify/koa-shopify-auth/pull/51)

## [3.2.0] - 2020-12-01

- [Feature] Add missing associated user data to the session [23](https://github.com/Shopify/koa-shopify-auth/pull/23)
- Fix inconsistency in authentication path prefix to remove trailing slash [29](https://github.com/Shopify/koa-shopify-auth/pull/29)

## [3.1.72] - 2020-10-16

- Removes `safe-compare` as a dependency, preferring Node's `crypto.timingSafeEqual` [1470](https://github.com/Shopify/quilt/pull/1470) | [2](https://github.com/Shopify/koa-shopify-auth/issues/2)

## [3.1.71] - 2020-10-16

- Bad release (misaligned tags). Please use `3.1.72` instead.

## [3.1.70] - 2020-09-08

- No changes from 3.1.68
- Moved to standalone repository

## [3.1.69] - 2020-09-08

- Bad release. Please use 3.1.70 instead.

## [3.1.68] - 2020-08-26

- Wrap `encodeURI` values in double quotes [1613](https://github.com/Shopify/quilt/pull/1613)

## [3.1.67] - 2020-08-26

- URI encode `config` on redirection page [1612](https://github.com/Shopify/quilt/pull/1612)

## [3.1.65] - 2020-07-06

- Include `prefix` when redirect to the root endpoint [1498](https://github.com/Shopify/quilt/pull/1498)

## [3.1.63] - 2020-05-25

### Fixed

- Protect against reflected XSS vulnerability [1455](https://github.com/Shopify/quilt/pull/1455)

## [3.1.62] - 2015-05-20

### Fixed

- Include `prefix` when we redirect to the `/auth` path.

## [3.1.61] - 2020-05-01

- Fixes ITP 2.3 and Safari 13.1 enable cookies loop [1413](https://github.com/Shopify/quilt/pull/1413)

## [3.1.56] - 2020-02-03

- Package now forces cookies.secure to be true [1255](https://github.com/Shopify/quilt/pull/1255)
- Package sets cookies to samesite:none and secure [1251](https://github.com/Shopify/quilt/pull/1251)

## [3.1.54] - 2020-01-24

- Updated redirect script to use App Bridge [1242](https://github.com/Shopify/quilt/pull/1242)

## [3.1.37] - 2019-09-23

### Fixed

- No longer errors out on fresh installs with no session [1022](https://github.com/Shopify/quilt/pull/1022)

## [3.1.36] - 2019-08-30

### Fixed

- Package no longer allows sessions from one shop to bleed over into another [940](https://github.com/Shopify/quilt/pull/940)

## [3.1.32] - 2019-08-15

### Fixed

- Package now lists missing '@shopify/network' dependency [862](https://github.com/Shopify/quilt/pull/862)

## [3.1.31] - 2019-08-13

### Fixed

- Installation no longer fails if accessToken is invalid [#844](https://github.com/Shopify/quilt/pull/844)

## [3.1.14] - 2019-02-05

### Fixed

- OAuth route no longer rejects uppercase shop domains [#493](https://github.com/Shopify/quilt/pull/493)

## [3.1.11] - 2019-01-10

### Fixed

- HMAC validation no longer breaks when params are unsorted [#451](https://github.com/Shopify/quilt/pull/451)

## [3.1.10] - 2019-01-09

- Start of Changelog
