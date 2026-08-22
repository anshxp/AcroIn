import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { getAuthUserId } from '../../utils/authIds';
import { useChats, useSendMessage } from '../../hooks/useApi';
import { colors, spacing, radii, typography } from '../../theme';

export default function ChatWindowScreen({ route, navigation }: any) {
  const { chatId, participantName } = route.params;
  const { user } = useAuthStore();
  const authUserId = getAuthUserId(user);
  const { data: chats } = useChats(authUserId);
  const sendMut = useSendMessage();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const chat = chats?.find((c: any) => c._id === chatId);
  const messages = chat?.messages || [];

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, [messages.length]);

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    sendMut.mutate({ chatId, content: text });
    setMessage('');
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Avatar name={participantName || 'Chat'} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={s.headerName}>{participantName || 'Chat'}</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={s.messagesContainer} showsVerticalScrollIndicator={false}>
          {messages.map((msg: any) => {
            const isMine = msg.sender === authUserId;
            return (
              <View key={msg._id} style={[s.messageBubble, isMine ? s.myMessage : s.theirMessage]}>
                {msg.tag && <Text style={s.messageTag}>{msg.tag}</Text>}
                <Text style={[s.messageText, isMine && s.myMessageText]}>{msg.content}</Text>
                <Text style={[s.messageTime, isMine && s.myMessageTime]}>{formatTime(msg.createdAt)}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.inputPlaceholder}
            value={message}
            onChangeText={setMessage}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline
          />
          <TouchableOpacity onPress={handleSend} style={[s.sendBtn, !message.trim() && s.sendBtnDisabled]} disabled={!message.trim()}>
            <Ionicons name="send" size={20} color={message.trim() ? colors.textInverse : colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  headerName: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  messagesContainer: { padding: spacing.md, gap: spacing.xs },
  messageBubble: { maxWidth: '78%', padding: spacing.sm, borderRadius: radii.lg, marginBottom: 4 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: colors.gray[100], borderBottomLeftRadius: 4 },
  messageTag: { fontSize: 10, fontWeight: typography.weights.bold, color: colors.accent, marginBottom: 2 },
  messageText: { fontSize: typography.sizes.md, color: colors.textPrimary, lineHeight: 20 },
  myMessageText: { color: colors.textInverse },
  messageTime: { fontSize: 10, color: colors.textTertiary, marginTop: 4, alignSelf: 'flex-end' },
  myMessageTime: { color: 'rgba(255,255,255,0.6)' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.xs },
  input: { flex: 1, backgroundColor: colors.gray[50], borderRadius: radii.xl, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: typography.sizes.md, color: colors.textPrimary, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: colors.gray[200] },
});
