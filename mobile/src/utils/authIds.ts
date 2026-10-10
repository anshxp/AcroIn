import type { AuthResponse, User } from '../types';

const normalizeAuthIdentifier = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    const normalized = String(value).trim();
    return normalized && normalized !== '[object Object]' ? normalized : '';
  }

  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    const nested = candidate._id ?? candidate.id ?? candidate.$oid;
    if (nested !== undefined && nested !== value) return normalizeAuthIdentifier(nested);

    if (typeof candidate.toString === 'function' && candidate.toString !== Object.prototype.toString) {
      const normalized = candidate.toString().trim();
      return normalized && normalized !== '[object Object]' ? normalized : '';
    }
  }

  return '';
};

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
    const payload = JSON.parse(json) as { id?: unknown };
    return normalizeAuthIdentifier(payload.id) || undefined;
  } catch {
    return undefined;
  }
}

/** User._id from JWT — chats, notifications, post likes. */
export function getAuthUserId(user: User | null | undefined): string {
  return normalizeAuthIdentifier(user?.authUserId) || normalizeAuthIdentifier(user?.id) || normalizeAuthIdentifier(user?._id);
}

/** Student/Faculty document _id — profile, projects, skills. */
export function getProfileId(user: User | null | undefined): string {
  return normalizeAuthIdentifier(user?.profileId) || normalizeAuthIdentifier(user?._id) || normalizeAuthIdentifier(user?.id);
}

export function buildUserFromAuthResponse(response: AuthResponse): User | null {
  if (!response.token || !response.user) return null;

  const profileId = normalizeAuthIdentifier(response.user.profileId) || normalizeAuthIdentifier(response.user._id);
  const authUserId =
    normalizeAuthIdentifier(response.user.authUserId) ||
    extractAuthUserIdFromToken(response.token) ||
    normalizeAuthIdentifier(response.user.id) ||
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
