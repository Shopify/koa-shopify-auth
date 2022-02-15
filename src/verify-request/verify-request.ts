import compose from 'koa-compose';

import {loginAgainIfDifferentShop} from './login-again-if-different-shop';
import {verifyToken} from './verify-token';
import {Options, Routes} from './types';
import {DEFAULT_ACCESS_MODE} from '../auth';

export default function verifyRequest(givenOptions: Options = {}) {
  const {accessMode, returnHeader} = {
    accessMode: DEFAULT_ACCESS_MODE,
    returnHeader: false,
    ...givenOptions,
  };
  const routes: Routes = {
    authRoute: '/auth',
    fallbackRoute: '/auth',
    ...givenOptions,
  };

  return compose([
    loginAgainIfDifferentShop(routes, accessMode),
    verifyToken(routes, accessMode, returnHeader),
  ]);
}
