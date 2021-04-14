import {isAccessModeOnline, AccessMode} from '../access-mode';

describe('Access mode utility functions',()=>{
  it('Checks whether given access mode is online',()=>{
    const accessMode = AccessMode.Online;
    
    expect(isAccessModeOnline(accessMode)).toBeTruthy();
  });
});