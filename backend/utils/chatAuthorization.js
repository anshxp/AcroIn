const normalizeIdentifier = (value) => {
  if (typeof value === 'string' || typeof value === 'number') {
    const normalized = String(value).trim();
    return normalized && normalized !== '[object Object]' ? normalized : '';
  }
  if (!value || typeof value !== 'object') return '';
  if (value._id !== undefined) return normalizeIdentifier(value._id);
  if (value.id !== undefined) return normalizeIdentifier(value.id);
  if (typeof value.toHexString === 'function') return normalizeIdentifier(value.toHexString());
  return '';
};

export const isChatParticipant = (chat, userId) => {
  const normalizedUserId = normalizeIdentifier(userId);
  if (!normalizedUserId || !Array.isArray(chat?.participants)) return false;
  return chat.participants.some((participant) => normalizeIdentifier(participant) === normalizedUserId);
};

export const canDeleteChatMessage = (user, chat, message) => {
  if (user?.userType === 'admin') return true;
  const userId = normalizeIdentifier(user?.id);
  const senderId = normalizeIdentifier(message?.sender);
  return Boolean(userId && senderId && userId === senderId && isChatParticipant(chat, userId));
};

export const canDeleteChat = (user, chat) => (
  user?.userType === 'admin' || isChatParticipant(chat, user?.id)
);
