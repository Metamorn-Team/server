import { MAJOR, MINOR } from 'src/constants/version';

export const checkAppVersion = (version: string | string[] | undefined) => {
    if (typeof version !== 'string') return false;

    const versionArr = version.split('.');
    if (versionArr[0] !== MAJOR || versionArr[1] !== MINOR) return false;

    return true;
};
