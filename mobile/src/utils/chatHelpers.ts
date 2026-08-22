type ChatParticipant = {
  _id?: string;
  name?: string;
  email?: string;
  userType?: string;
};

export function getOtherParticipantName(
  chat: { participants?: ChatParticipant[] },
  currentUserId: string
): string {
  const participants = chat.participants || [];
  const other = participants.find((p) => String(p._id) !== String(currentUserId));
  if (other?.name) return other.name;
  if (other?.email) return other.email.split('@')[0];
  return 'Conversation';
}

export function getOtherParticipantId(
  chat: { participants?: ChatParticipant[] },
  currentUserId: string
): string | undefined {
  const other = (chat.participants || []).find((p) => String(p._id) !== String(currentUserId));
  return other?._id ? String(other._id) : undefined;
}
