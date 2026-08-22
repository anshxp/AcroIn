import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EmptyState, LoadingSpinner, ErrorBanner } from './Feedback';
import { Button } from './Button';
import { spacing } from '../../theme';

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isEmpty: boolean;
  emptyIcon?: React.ComponentProps<typeof EmptyState>['icon'];
  emptyTitle: string;
  emptySubtitle?: string;
  onRetry?: () => void;
  loadingMessage?: string;
  children: React.ReactNode;
}

export function QueryState({
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  onRetry,
  loadingMessage,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (isError) {
    return (
      <View style={styles.wrap}>
        <ErrorBanner message={errorMessage || 'Failed to load data'} />
        {onRetry ? (
          <View style={styles.retry}>
            <Button title="Retry" onPress={onRetry} variant="secondary" />
          </View>
        ) : null}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState icon={emptyIcon} title={emptyTitle} subtitle={emptySubtitle} />
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, gap: spacing.sm },
  retry: { marginTop: spacing.sm },
});
