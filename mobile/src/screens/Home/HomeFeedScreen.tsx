import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput as RNTextInput,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, EmptyState, LoadingSpinner, ErrorBanner } from '../../components/ui';
import { usePosts, useLikePost, useUnlikePost, useAddComment } from '../../hooks/useApi';
import { useAuthStore } from '../../stores/authStore';
import { getAuthUserId } from '../../utils/authIds';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import type { Post } from '../../types';

const { width } = Dimensions.get('window');

export default function HomeFeedScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts();
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const commentMutation = useAddComment();
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const authUserId = getAuthUserId(user);

  const handleLike = (post: Post) => {
    const isLiked = post.likes.includes(authUserId);
    if (isLiked) {
      unlikeMutation.mutate(post._id);
    } else {
      likeMutation.mutate(post._id);
    }
  };

  const handleComment = (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    commentMutation.mutate(
      { postId, content: text },
      {
        onSuccess: () => {
          setCommentText((prev) => ({ ...prev, [postId]: '' }));
        },
      }
    );
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderPost = ({ item: post }: { item: Post }) => {
    const isLiked = post.likes.includes(authUserId);
    const showComments = expandedComments.has(post._id);

    return (
      <View style={[styles.postCard, shadows.card]}>
        {/* Author Header */}
        <View style={styles.postHeader}>
          <Avatar
            name={post.author?.name || 'User'}
            imageUrl={post.author?.profileImage}
            size={44}
          />
          <View style={styles.postAuthorInfo}>
            <Text style={styles.postAuthorName}>{post.author?.name || 'Unknown'}</Text>
            <View style={styles.postMeta}>
              {post.author?.designation && (
                <Text style={styles.postDesignation}>{post.author.designation}</Text>
              )}
              {post.author?.department && (
                <Text style={styles.postDepartment}> · {post.author.department}</Text>
              )}
            </View>
            <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
          </View>
          {post.scope && (
            <Badge
              label={post.scope === 'campus' ? 'Campus' : 'Dept'}
              variant="info"
              size="sm"
            />
          )}
        </View>

        {/* Content */}
        <Text style={styles.postContent}>{post.content}</Text>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postImages}>
            {post.images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Engagement Stats */}
        <View style={styles.engagementRow}>
          <Text style={styles.engagementText}>
            {post.likes.length > 0 ? `${post.likes.length} like${post.likes.length !== 1 ? 's' : ''}` : ''}
          </Text>
          <Text style={styles.engagementText}>
            {post.comments.length > 0
              ? `${post.comments.length} comment${post.comments.length !== 1 ? 's' : ''}`
              : ''}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLike(post)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.actionText, isLiked && { color: colors.error }]}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => toggleComments(post._id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {showComments && (
          <View style={styles.commentsSection}>
            {post.comments.slice(0, 5).map((comment) => (
              <View key={comment._id} style={styles.commentItem}>
                <Avatar
                  name={comment.author?.name || 'User'}
                  imageUrl={comment.author?.profileImage}
                  size={32}
                />
                <View style={styles.commentBubble}>
                  <Text style={styles.commentAuthor}>{comment.author?.name || 'User'}</Text>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                  <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
                </View>
              </View>
            ))}

            {/* Add Comment */}
            <View style={styles.addCommentRow}>
              <Avatar name={user?.name || 'U'} size={32} />
              <RNTextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor={colors.inputPlaceholder}
                value={commentText[post._id] || ''}
                onChangeText={(t) => setCommentText((prev) => ({ ...prev, [post._id]: t }))}
                returnKeyType="send"
                onSubmitEditing={() => handleComment(post._id)}
              />
              <TouchableOpacity
                onPress={() => handleComment(post._id)}
                disabled={!commentText[post._id]?.trim()}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={commentText[post._id]?.trim() ? colors.accent : colors.gray[300]}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.headerTitle}>
            {user?.name?.split(' ')[0] || 'Home'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {(user?.userType === 'faculty' || user?.userType === 'admin') && (
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.navigate('CreatePost')}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('NotificationsTab')}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Avatar name={user?.name || 'U'} size={36} />
        </View>
      </View>

      {/* Content */}
      <FlatList
        style={styles.feed}
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
            <Text style={styles.infoText}>
              This feed shows official announcements from faculty and CDC. Stay updated with placement drives, research opportunities, and important notices.
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading && !refreshing ? (
            <LoadingSpinner message="Loading feed..." />
          ) : error ? (
            <ErrorBanner message="Failed to load posts. Ensure the backend is running." />
          ) : (
            <EmptyState
              icon="newspaper-outline"
              title="No posts available"
              subtitle="No posts available from backend. Check back later for announcements."
            />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: spacing.md }} color={colors.accent} />
          ) : (
            <View style={{ height: 20 }} />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  greeting: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.textPrimary,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.blue[50],
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    gap: spacing.xs,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  feed: { flex: 1, paddingHorizontal: spacing.md },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.sm,
  },
  postAuthorInfo: { flex: 1 },
  postAuthorName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  postMeta: { flexDirection: 'row', flexWrap: 'wrap' },
  postDesignation: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  postDepartment: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  postTime: { fontSize: typography.sizes.xs, color: colors.textTertiary, marginTop: 2 },
  postContent: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    lineHeight: 21,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  postImages: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  postImage: {
    width: width * 0.65,
    height: 180,
    borderRadius: radii.md,
    marginRight: spacing.xs,
    backgroundColor: colors.gray[200],
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  engagementText: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: 6,
  },
  actionText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  commentsSection: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  commentItem: { flexDirection: 'row', gap: spacing.xs },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: radii.md,
    padding: spacing.xs,
  },
  commentAuthor: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  commentContent: { fontSize: typography.sizes.sm, color: colors.textPrimary, marginTop: 2 },
  commentTime: { fontSize: 10, color: colors.textTertiary, marginTop: 4 },
  addCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
});
