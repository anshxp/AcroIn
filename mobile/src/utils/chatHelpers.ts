const normalizeId = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    const normalized = String(value).trim();
    return normalized === '[object Object]' ? '' : normalized;
  }
  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    const nested = candidate._id ?? candidate.id ?? candidate.$oid;
    if (nested !== undefined && nested !== value) return normalizeId(nested);
    if (typeof candidate.toString === 'function') {
      const normalized = candidate.toString();
      if (normalized && normalized !== '[object Object]') return normalized;
    }
  }
  return '';
};

type ChatParticipant = {
  _id?: unknown;
  name?: string;
  email?: string;
  userType?: string;
};

export function getOtherParticipantName(
  chat: { participants?: ChatParticipant[] },
  currentUserId: string
): string {
  const participants = chat.participants || [];
  const normalizedCurrentUserId = normalizeId(currentUserId);
  const other = participants.find((p) => normalizeId(p._id) !== normalizedCurrentUserId);
  if (other?.name) return other.name;
  if (other?.email) return other.email.split('@')[0];
  return 'Conversation';
}

export function getOtherParticipantId(
  chat: { participants?: ChatParticipant[] },
  currentUserId: string
): string | undefined {
  const normalizedCurrentUserId = normalizeId(currentUserId);
  const other = (chat.participants || []).find((p) => normalizeId(p._id) !== normalizedCurrentUserId);
  return normalizeId(other?._id) || undefined;
}
