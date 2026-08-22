import type { AuthResponse, User } from '../types';

/** Decode JWT payload to read the User._id without verifying (client-side ID only). */
export function extractAuthUserIdFromToken(token: string): string | undefined {
  try {
    const segment = token.split('.')[1];
    if (!segment) return undefined;

    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);

    const decodeBase64 = (value: string): string => {
      if (typeof globalThis.atob === 'function') {
        return globalThis.atob(value);
      }
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let output = '';
      let i = 0;
      while (i < value.length) {
        const enc1 = chars.indexOf(value.charAt(i++));
        const enc2 = chars.indexOf(value.charAt(i++));
        const enc3 = chars.indexOf(value.charAt(i++));
        const enc4 = chars.indexOf(value.charAt(i++));
        const chr1 = (enc1 << 2) | (enc2 >> 4);
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const chr3 = ((enc3 & 3) << 6) | enc4;
        output += String.fromCharCode(chr1);
        if (enc3 !== 64) output += String.fromCharCode(chr2);
        if (enc4 !== 64) output += String.fromCharCode(chr3);
      }
      return output;
    };

    const json = decodeBase64(padded);
    const payload = JSON.parse(json) as { id?: string };
    return payload.id;
  } catch {
    return undefined;
  }
}

/** User._id from JWT — chats, notifications, post likes. */
export function getAuthUserId(user: User | null | undefined): string {
  return user?.authUserId || user?.id || user?._id || '';
}

/** Student/Faculty document _id — profile, projects, skills. */
export function getProfileId(user: User | null | undefined): string {
  return user?.profileId || user?._id || user?.id || '';
}

export function buildUserFromAuthResponse(response: AuthResponse): User | null {
  if (!response.token || !response.user) return null;

  const profileId = String(response.user._id || '');
  const authUserId =
    String(response.user.authUserId || '') ||
    extractAuthUserIdFromToken(response.token) ||
    profileId;

  const resolvedName =
    response.user.name ||
    `${response.user.firstname || ''} ${response.user.lastName || ''}`.trim() ||
    'User';

  return {
    id: authUserId,
    authUserId,
    profileId,
    _id: profileId,
    email: response.user.email,
    name: resolvedName,
    userType: response.user.userType || 'student',
    role: response.user.role,
    firstname: response.user.firstname,
    lastName: response.user.lastName,
    department: response.user.department,
    designation: response.user.designation,
  };
}
