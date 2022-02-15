import {AccessMode} from '../types';

export interface Routes {
  authRoute: string;
  fallbackRoute: string;
}

type VerifyRequestOptions = {
  accessMode: AccessMode;
  returnHeader: boolean;
};

export type Options = Partial<VerifyRequestOptions> & Partial<Routes>;
