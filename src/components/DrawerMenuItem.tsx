import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/use-theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export interface DrawerMenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'default' | 'highlighted';
  showChevron?: boolean;
}

export function DrawerMenuItem({
  icon,
  title,
  subtitle,
  onPress,
  variant = 'default',
  showChevron = true,
}: DrawerMenuItemProps) {
  const theme = useTheme();

  const isHighlighted = variant === 'highlighted';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isHighlighted
            ? theme.colors.text
            : theme.colors.background,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          marginHorizontal: theme.spacing.lg,
          marginVertical: theme.spacing.xs,
          borderRadius: theme.radii.lg,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.leftContent}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isHighlighted
                ? 'rgba(255, 255, 255, 0.2)'
                : theme.colors.muted,
              padding: theme.spacing.sm,
              borderRadius: theme.radii.md,
            },
          ]}>
          <IconSymbol
            name={icon as any}
            size={24}
            color={isHighlighted ? theme.colors.warning : theme.colors.text}
          />
        </View>

        <View style={styles.textContainer}>
          <ThemedText
            style={[
              styles.title,
              {
                color: isHighlighted ? theme.colors.background : theme.colors.text,
              },
            ]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText
              style={[
                styles.subtitle,
                {
                  color: isHighlighted
                    ? 'rgba(255, 255, 255, 0.7)'
                    : theme.colors.textMuted,
                },
              ]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>

      {showChevron && (
        <IconSymbol
          name="chevron.right"
          size={20}
          color={isHighlighted ? theme.colors.background : theme.colors.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
