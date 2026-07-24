import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, Radius, getResponsiveTypography, getResponsiveSpacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import {
  BotCard, AlertBanner, IncidentRow, SectionLabel, MeshBadge,
} from '../components/SwarmUI';
import { BOTS, ALERTS, INCIDENTS } from '../constants/mockData';
import { useResponsive, getGridColumns } from '../utils/responsive';

export default function DashboardScreen({ navigation }) {
  const [mode, setMode] = useState('autonomous');
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const responsive = useResponsive();

  const styles = getStyles(colors, responsive);

  const onlineCount = BOTS.filter(b => b.status === 'online').length;
  const alertCount  = BOTS.filter(b => b.status === 'alert').length;

  function handleSOS() {
    if (typeof alert === 'function') {
      alert('SOS triggered - Emergency services contacted');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>A.E.G.I.S.</Text>
          <View style={styles.topBarSub}>
            <MeshBadge />
            <Text style={styles.topBarSubText}>· {onlineCount}/3 bots active</Text>
          </View>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme} activeOpacity={0.7}>
            <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Alerts')}>
            {alertCount > 0 && <View style={styles.bellBadge}><Text style={styles.bellBadgeText}>{alertCount}</Text></View>}
            <Ionicons name="notifications" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Active Alerts ── */}
        {ALERTS.length > 0 && (
          <View style={styles.section}>
            {ALERTS.map(a => <AlertBanner key={a.id} alert={a} />)}
          </View>
        )}

        {/* ── Swarm Stat Cards ── */}
        <View style={styles.section}>
          <View style={styles.statRow}>
            <StatCard label="Bots online"   value={`${onlineCount}/3`} color={colors.green} icon="hardware-chip" responsive={responsive} />
            <StatCard label="Active alerts" value={alertCount}         color={colors.amber}  icon="warning" responsive={responsive} />
            <StatCard label="Map coverage"  value="78%"               color={colors.cyan}   icon="map" responsive={responsive} />
          </View>
        </View>

        {/* ── Bot Cards ── */}
        <View style={styles.section}>
          <SectionLabel action="All telemetry →" onAction={() => {}}>Swarm Status</SectionLabel>
          <View style={styles.botGrid}>
            {BOTS.map(bot => (
              <BotCard
                key={bot.id}
                bot={bot}
                onPress={() => navigation.navigate('BotDetail', { botId: bot.id })}
                responsive={responsive}
              />
            ))}
          </View>
        </View>

        {/* ── Control Mode ── */}
        <View style={styles.section}>
          <SectionLabel>Bot control mode</SectionLabel>
          <View style={styles.modeRow}>
            <ModeBtn
              icon="cpu"
              label="Autonomous"
              active={mode === 'autonomous'}
              onPress={() => setMode('autonomous')}
              colors={colors}
            />
            <ModeBtn
              icon="game-controller"
              label="Manual RC"
              active={mode === 'manual'}
              onPress={() => { setMode('manual'); navigation.navigate('Control'); }}
              colors={colors}
            />
          </View>
        </View>

        {/* ── Incident Log ── */}
        <View style={styles.section}>
          <SectionLabel action="Full log →" onAction={() => {}}>Recent incidents</SectionLabel>
          <View style={styles.incidentList}>
            {INCIDENTS.slice(0, 4).map(inc => (
              <IncidentRow key={inc.id} incident={inc} />
            ))}
          </View>
        </View>

        {/* ── SOS ── */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sosBtn} onPress={handleSOS} activeOpacity={0.8}>
            <Ionicons name="call" size={18} color={colors.red} />
            <Text style={styles.sosBtnText}>Emergency Override — Contact Services</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────

function StatCard({ label, value, color, icon, responsive }) {
  const { colors } = useTheme();
  const styles = getStyles(colors, responsive);
  const iconSize = responsive.isDesktop ? 20 : responsive.isTablet ? 18 : 16;

  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={iconSize} color={color} style={{ marginBottom: 4 }} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Mode Button ─────────────────────────────────────────────────

function ModeBtn({ icon, label, active, onPress, colors }) {
  const responsive = useResponsive();
  const styles = getStyles(colors, responsive);
  const iconSize = responsive.isDesktop ? 24 : 20;

  return (
    <TouchableOpacity
      style={[styles.modeBtn, active && styles.modeBtnActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={iconSize} color={active ? colors.cyan : colors.textSecondary} />
      <Text style={[styles.modeBtnLabel, active && { color: colors.cyan }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const getStyles = (colors, responsive) => {
  const typo = getResponsiveTypography(responsive.deviceType);
  const space = getResponsiveSpacing(responsive.deviceType);
  const columns = getGridColumns(responsive.deviceType, { mobile: 1, tablet: 2, desktop: 3 });

  return StyleSheet.create({
    safe:    { flex: 1, backgroundColor: colors.bg0 },
    scroll:  { flex: 1 },
    content: { 
      paddingBottom: space.xxl,
      maxWidth: responsive.isDesktop ? 1400 : '100%',
      alignSelf: 'center',
      width: '100%',
    },

    topBar: {
      flexDirection: responsive.isSmallDevice ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: responsive.isSmallDevice ? 'flex-start' : 'center',
      paddingHorizontal: space.lg,
      paddingVertical: space.md,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      gap: responsive.isSmallDevice ? space.sm : 0,
    },
    appTitle: { fontSize: typo.xl, fontWeight: Typography.bold, color: colors.textPrimary, letterSpacing: 1 },
    topBarSub: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
    topBarSubText: { fontSize: typo.xs, color: colors.textMuted },
    topBarActions: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: space.sm,
      alignSelf: responsive.isSmallDevice ? 'flex-end' : 'center',
    },
    themeBtn: { padding: space.xs },
    bellBtn: { padding: space.xs, position: 'relative' },
    bellBadge: {
      position: 'absolute', top: 2, right: 2,
      backgroundColor: colors.amber, borderRadius: Radius.full,
      width: 14, height: 14, alignItems: 'center', justifyContent: 'center', zIndex: 1,
    },
    bellBadgeText: { fontSize: 9, color: '#000', fontWeight: Typography.bold },

    section: { paddingHorizontal: space.lg, paddingTop: space.xl },

    statRow: { 
      flexDirection: responsive.isSmallDevice ? 'column' : 'row', 
      gap: space.sm 
    },
    statCard: {
      flex: responsive.isSmallDevice ? 0 : 1,
      width: responsive.isSmallDevice ? '100%' : 'auto',
      backgroundColor: colors.bg1,
      borderWidth: 0.5, 
      borderColor: colors.border,
      borderRadius: Radius.md, 
      padding: responsive.isDesktop ? space.lg : space.md,
      alignItems: 'center',
    },
    statValue: { fontSize: typo.lg, fontWeight: Typography.bold },
    statLabel: { fontSize: typo.xs, color: colors.textMuted, textAlign: 'center', marginTop: 2 },

    botGrid: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      gap: space.sm,
    },

    modeRow: { 
      flexDirection: responsive.isSmallDevice ? 'column' : 'row', 
      gap: space.sm 
    },
    modeBtn: {
      flex: responsive.isSmallDevice ? 0 : 1,
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: space.sm, 
      paddingVertical: responsive.isDesktop ? space.lg : space.md,
      backgroundColor: colors.bg1, 
      borderWidth: 0.5, 
      borderColor: colors.border,
      borderRadius: Radius.md,
    },
    modeBtnActive: { backgroundColor: colors.cyanFaint, borderColor: colors.cyanDim },
    modeBtnLabel: { fontSize: typo.sm, fontWeight: Typography.medium, color: colors.textSecondary },

    incidentList: { gap: space.sm },

    sosBtn: {
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: space.sm, 
      paddingVertical: responsive.isDesktop ? space.lg : space.md,
      backgroundColor: colors.redDim, 
      borderWidth: 0.5, 
      borderColor: colors.red + '55',
      borderRadius: Radius.lg,
    },
    sosBtnText: { fontSize: typo.base, fontWeight: Typography.bold, color: colors.red },
  });
};
