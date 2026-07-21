import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, Radius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { SectionLabel, MeshBadge } from '../components/SwarmUI';
import { BOTS, MAP_ROOMS } from '../constants/mockData';

const { width } = Dimensions.get('window');
const MAP_W = width - Spacing.lg * 2;

export default function MapScreen() {
  const [selectedBot, setSelectedBot] = useState(null);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Map</Text>
        <MeshBadge label="Pathfinder · SLAM" />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Map Placeholder for Web */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={colors.textMuted} />
            <Text style={styles.mapPlaceholderText}>Map View</Text>
            <Text style={styles.mapPlaceholderSub}>
              {selectedBot ? `${selectedBot.name} location` : 'Select a bot to view'}
            </Text>
          </View>
        </View>

        {/* Bot Selector */}
        <View style={styles.section}>
          <SectionLabel>Bot Locations</SectionLabel>
          <View style={styles.botList}>
            {BOTS.map((bot) => (
              <TouchableOpacity
                key={bot.id}
                style={[
                  styles.botButton,
                  selectedBot?.id === bot.id && styles.botButtonActive,
                ]}
                onPress={() => setSelectedBot(bot)}
              >
                <View
                  style={[
                    styles.botButtonDot,
                    { backgroundColor: bot.color },
                  ]}
                />
                <Text
                  style={[
                    styles.botButtonLabel,
                    selectedBot?.id === bot.id && { color: colors.cyan },
                  ]}
                >
                  {bot.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Map Stats */}
        <View style={styles.section}>
          <SectionLabel>Map Coverage</SectionLabel>
          <View style={styles.statRow}>
            <MapStat label="Coverage" value="78%" colors={colors} />
            <MapStat label="Rooms" value={MAP_ROOMS.length} colors={colors} />
            <MapStat label="Status" value="Active" colors={colors} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MapStat({ label, value, colors }) {
  return (
    <View style={[getStyles(colors).statCard, { backgroundColor: colors.bg1 }]}>
      <Text style={[getStyles(colors).statValue, { color: colors.cyan }]}>{value}</Text>
      <Text style={getStyles(colors).statLabel}>{label}</Text>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg0 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      letterSpacing: 1,
    },
    scroll: { flex: 1 },
    content: { paddingBottom: 32 },

    mapContainer: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
    },
    mapPlaceholder: {
      backgroundColor: colors.bg1,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: Radius.lg,
      paddingVertical: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mapPlaceholderText: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      marginTop: Spacing.md,
    },
    mapPlaceholderSub: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      marginTop: Spacing.sm,
    },

    section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },

    botList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    botButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.bg1,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: Radius.full,
    },
    botButtonActive: {
      borderColor: colors.cyan,
      backgroundColor: colors.cyanFaint,
    },
    botButtonDot: {
      width: 8,
      height: 8,
      borderRadius: Radius.full,
    },
    botButtonLabel: {
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
      color: colors.textSecondary,
    },

    statRow: { flexDirection: 'row', gap: Spacing.sm },
    statCard: {
      flex: 1,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: Radius.md,
      padding: Spacing.md,
      alignItems: 'center',
    },
    statValue: {
      fontSize: Typography.lg,
      fontWeight: Typography.bold,
    },
    statLabel: {
      fontSize: Typography.xs,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: Spacing.sm,
    },
  });
