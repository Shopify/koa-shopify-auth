import {Context} from 'koa';

export enum AccessMode {
  Online = 'online',
  Offline = 'offline',
}

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
