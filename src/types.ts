import {Context} from 'koa';
import {AccessMode} from './utilities/access-mode'

export interface AuthConfig {
  myShopifyDomain?: string;
  accessMode?: AccessMode;
  afterAuth?(ctx: Context): void;
}

export interface OAuthStartOptions extends AuthConfig {
  prefix?: string;
}

export interface NextFunction {
  (): any;
}
