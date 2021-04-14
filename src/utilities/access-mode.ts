export enum AccessMode {
  Online = 'online',
  Offline = 'offline',
}

export function isAccessModeOnline(accessMode: AccessMode) {
  return accessMode === AccessMode.Online;
}
