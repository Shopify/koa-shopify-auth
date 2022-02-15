import {AccessMode} from '../types'

export function isAccessModeOnline(accessMode: AccessMode) {
  return accessMode === AccessMode.Online;
}
