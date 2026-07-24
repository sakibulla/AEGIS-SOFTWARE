import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, Radius, getResponsiveTypography, getResponsiveSpacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { SectionLabel, MeshBadge } from '../components/SwarmUI';
import { BOTS, MAP_ROOMS } from '../constants/mockData';
import { useResponsive } from '../utils/responsive';

export default function MapScreen() {
  const [selectedBot, setSelectedBot] = useState(null);
  const { colors } = useTheme();
  const responsive = useResponsive();
  const styles = getStyles(colors, responsive);

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
            <MapStat label="Coverage" value="78%" colors={colors} responsive={responsive} />
            <MapStat label="Rooms" value={MAP_ROOMS.length} colors={colors} responsive={responsive} />
            <MapStat label="Status" value="Active" colors={colors} responsive={responsive} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MapStat({ label, value, colors, responsive }) {
  return (
    <View style={[getStyles(colors, responsive).statCard, { backgroundColor: colors.bg1 }]}>
      <Text style={[getStyles(colors, responsive).statValue, { color: colors.cyan }]}>{value}</Text>
      <Text style={getStyles(colors, responsive).statLabel}>{label}</Text>
    </View>
  );
}

const getStyles = (colors, responsive) => {
  const typo = getResponsiveTypography(responsive.deviceType);
  const space = getResponsiveSpacing(responsive.deviceType);

  const mapHeight = responsive.isDesktop ? 500 : responsive.isTablet ? 400 : 300;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg0 },
    header: {
      flexDirection: responsive.isSmallDevice ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: responsive.isSmallDevice ? 'flex-start' : 'center',
      paddingHorizontal: space.lg,
      paddingVertical: space.md,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      gap: responsive.isSmallDevice ? space.sm : 0,
    },
    headerTitle: {
      fontSize: typo.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      letterSpacing: 1,
    },
    scroll: { flex: 1 },
    content: { 
      paddingBottom: space.xxl,
      maxWidth: responsive.isDesktop ? 1200 : '100%',
      alignSelf: 'center',
      width: '100%',
    },

    mapContainer: {
      paddingHorizontal: space.lg,
      paddingTop: space.xl,
      paddingBottom: space.lg,
    },
    mapPlaceholder: {
      backgroundColor: colors.bg1,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: Radius.lg,
      paddingVertical: mapHeight / 3,
      alignItems: 'center',
      justifyContent: 'center',
      height: mapHeight,
    },
    mapPlaceholderText: {
      fontSize: typo.md,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      marginTop: space.md,
    },
    mapPlaceholderSub: {
      fontSize: typo.sm,
      color: colors.textSecondary,
      marginTop: space.sm,
    },

    section: { paddingHorizontal: space.lg, paddingTop: space.xl },

    botList: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      gap: space.sm 
    },
    botButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingHorizontal: responsive.isDesktop ? space.lg : space.md,
      paddingVertical: responsive.isDesktop ? space.md : space.sm,
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
      fontSize: typo.sm,
      fontWeight: Typography.medium,
      color: colors.textSecondary,
    },

    statRow: { 
      flexDirection: responsive.isSmallDevice ? 'column' : 'row', 
      gap: space.sm 
    },
    statCard: {
      flex: responsive.isSmallDevice ? 0 : 1,
      width: responsive.isSmallDevice ? '100%' : 'auto',
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: Radius.md,
      padding: responsive.isDesktop ? space.lg : space.md,
      alignItems: 'center',
    },
    statValue: {
      fontSize: typo.lg,
      fontWeight: Typography.bold,
    },
    statLabel: {
      fontSize: typo.xs,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: space.sm,
    },
  });
};
