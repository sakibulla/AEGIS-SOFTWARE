import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import {
  BotCard, AlertBanner, IncidentRow, SectionLabel, MeshBadge,
} from '../components/SwarmUI';
import { BOTS, ALERTS, INCIDENTS } from '../constants/mockData';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [mode, setMode] = useState('autonomous');

  const onlineCount = BOTS.filter(b => b.status === 'online').length;
  const alertCount  = BOTS.filter(b => b.status === 'alert').length;

  function handleSOS() {
    Alert.alert(
      'Emergency Override',
      'This will contact emergency services and broadcast a DANGER packet to all bots.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm SOS', style: 'destructive', onPress: () => console.log('SOS triggered') },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg0} />

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>A.E.G.I.S.</Text>
          <View style={styles.topBarSub}>
            <MeshBadge />
            <Text style={styles.topBarSubText}>· {onlineCount}/3 bots active</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Alerts')}>
          {alertCount > 0 && <View style={styles.bellBadge}><Text style={styles.bellBadgeText}>{alertCount}</Text></View>}
          <Ionicons name="notifications" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
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
            <StatCard label="Bots online"   value={`${onlineCount}/3`} color={Colors.green} icon="hardware-chip" />
            <StatCard label="Active alerts" value={alertCount}         color={Colors.amber}  icon="warning" />
            <StatCard label="Map coverage"  value="78%"               color={Colors.cyan}   icon="map" />
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
            />
            <ModeBtn
              icon="game-controller"
              label="Manual RC"
              active={mode === 'manual'}
              onPress={() => { setMode('manual'); navigation.navigate('Control'); }}
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
            <Ionicons name="call" size={18} color={Colors.red} />
            <Text style={styles.sosBtnText}>Emergency Override — Contact Services</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────

function StatCard({ label, value, color, icon }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={16} color={color} style={{ marginBottom: 4 }} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Mode Button ─────────────────────────────────────────────────

function ModeBtn({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.modeBtn, active && styles.modeBtnActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={20} color={active ? Colors.cyan : Colors.textSecondary} />
      <Text style={[styles.modeBtnLabel, active && { color: Colors.cyan }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg0 },
  scroll:  { flex: 1 },
  content: { paddingBottom: 32 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  appTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, letterSpacing: 1 },
  topBarSub: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  topBarSubText: { fontSize: Typography.xs, color: Colors.textMuted },
  bellBtn: { padding: 6, position: 'relative' },
  bellBadge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: Colors.amber, borderRadius: Radius.full,
    width: 14, height: 14, alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  bellBadgeText: { fontSize: 9, color: '#000', fontWeight: Typography.bold },

  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },

  statRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1, backgroundColor: Colors.bg1,
    borderWidth: 0.5, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: Typography.lg, fontWeight: Typography.bold },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },

  botGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

  modeRow: { flexDirection: 'row', gap: Spacing.sm },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: Spacing.md,
    backgroundColor: Colors.bg1, borderWidth: 0.5, borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  modeBtnActive: { backgroundColor: Colors.cyanFaint, borderColor: Colors.cyanDim },
  modeBtnLabel: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary },

  incidentList: { gap: Spacing.sm },

  sosBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 14,
    backgroundColor: Colors.redDim, borderWidth: 0.5, borderColor: Colors.red + '55',
    borderRadius: Radius.lg,
  },
  sosBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.red },
});
