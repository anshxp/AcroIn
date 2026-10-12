import assert from 'node:assert/strict';
import test from 'node:test';
import { canDeleteChatMessage, isChatParticipant } from '../utils/chatAuthorization.js';

const participant = '507f1f77bcf86cd799439011';
const otherParticipant = '507f1f77bcf86cd799439012';
const sender = { _id: participant };
const chat = { participants: [participant, otherParticipant] };
const message = { sender: participant };

test('recognizes scalar and populated chat participant identifiers', () => {
  assert.equal(isChatParticipant(chat, participant), true);
  assert.equal(isChatParticipant({ participants: [sender] }, participant), true);
  assert.equal(isChatParticipant(chat, '[object Object]'), false);
  assert.equal(isChatParticipant({ participants: null }, participant), false);
});

test('allows a participant to delete their own message', () => {
  assert.equal(canDeleteChatMessage({ id: participant, userType: 'student' }, chat, message), true);
});

test('blocks a message author who is not a current chat participant', () => {
  assert.equal(canDeleteChatMessage({ id: participant, userType: 'student' }, { participants: [otherParticipant] }, message), false);
});

test('blocks a participant from deleting another users message', () => {
  assert.equal(canDeleteChatMessage({ id: otherParticipant, userType: 'faculty' }, chat, message), false);
});

test('allows an administrator to delete messages', () => {
  assert.equal(canDeleteChatMessage({ id: otherParticipant, userType: 'admin' }, chat, message), true);
});
