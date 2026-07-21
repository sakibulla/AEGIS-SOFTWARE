import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable,
  Vibration, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, Radius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { StatusPip } from '../components/SwarmUI';
import { BOTS } from '../constants/mockData';
import { sendBotCommand } from '../services/AegisService';

export default function ControlScreen() {
  const { colors } = useTheme();
  const [selectedBot, setSelectedBot] = useState(BOTS[0].id);
  const [mode, setMode] = useState('manual');       // 'manual' | 'autonomous'
  const [activeDir, setActiveDir] = useState(null);
  const [speed, setSpeed] = useState(50);
  const intervalRef = useRef(null);

  const styles = getStyles(colors);
  const bot = BOTS.find(b => b.id === selectedBot);

  function startMove(dir) {
    setActiveDir(dir);
    Vibration.vibrate(30);
    sendBotCommand(selectedBot, 'move', { direction: dir, speed }).catch(() => {});
    intervalRef.current = setInterval(() => {
      sendBotCommand(selectedBot, 'move', { direction: dir, speed }).catch(() => {});
    }, 150);
  }

  function stopMove() {
    setActiveDir(null);
    clearInterval(intervalRef.current);
    sendBotCommand(selectedBot, 'stop').catch(() => {});
  }

  function switchMode(m) {
    setMode(m);
    sendBotCommand(selectedBot, m === 'manual' ? 'mode_manual' : 'mode_autonomous').catch(() => {});
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bot Control</Text>
        <View style={[styles.modePill, { backgroundColor: mode === 'manual' ? colors.cyanFaint : colors.greenDim }]}>
          <Text style={[styles.modePillText, { color: mode === 'manual' ? colors.cyan : colors.green }]}>
            {mode === 'manual' ? 'MANUAL RC' : 'AUTONOMOUS'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Bot Selector ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT BOT</Text>
          <View style={styles.botSelectorRow}>
            {BOTS.map(b => (
              <TouchableOpacity
                key={b.id}
                style={[styles.botSel, selectedBot === b.id && { borderColor: b.color, backgroundColor: b.color + '18' }]}
                onPress={() => setSelectedBot(b.id)}
              >
                <View style={[styles.botSelDot, { backgroundColor: b.color }]} />
                <Text style={[styles.botSelName, selectedBot === b.id && { color: b.color }]}>{b.name}</Text>
                <StatusPip status={b.status} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Mode Toggle ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTROL MODE</Text>
          <View style={styles.modeRow}>
            <ModeToggle icon="game-controller" label="Manual RC" active={mode === 'manual'} color={colors.cyan} onPress={() => switchMode('manual')} colors={colors} />
            <ModeToggle icon="cpu" label="Autonomous" active={mode === 'autonomous'} color={colors.green} onPress={() => switchMode('autonomous')} colors={colors} />
          </View>
        </View>

        {/* ── RC D-Pad ── */}
        {mode === 'manual' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DIRECTIONAL CONTROL</Text>
            <View style={styles.dpadWrap}>

              {/* Speed display */}
              <View style={styles.speedDisplay}>
                <Text style={styles.speedValue}>{speed}%</Text>
                <Text style={styles.speedLabel}>SPEED</Text>
              </View>

              {/* D-Pad */}
              <View style={styles.dpad}>
                {/* Forward */}
                <View style={styles.dpadRow}>
                  <DPadBtn icon="arrow-up" dir="forward" active={activeDir === 'forward'} color={bot.color} onStart={startMove} onStop={stopMove} colors={colors} />
                </View>
                {/* Left / Stop / Right */}
                <View style={styles.dpadRow}>
                  <DPadBtn icon="arrow-back" dir="left" active={activeDir === 'left'} color={bot.color} onStart={startMove} onStop={stopMove} colors={colors} />
                  <DPadBtn icon="stop" dir="stop" active={activeDir === 'stop'} color={colors.red} onStart={() => { stopMove(); setActiveDir('stop'); }} onStop={() => setActiveDir(null)} colors={colors} />
                  <DPadBtn icon="arrow-forward" dir="right" active={activeDir === 'right'} color={bot.color} onStart={startMove} onStop={stopMove} colors={colors} />
                </View>
                {/* Backward */}
                <View style={styles.dpadRow}>
                  <DPadBtn icon="arrow-down" dir="backward" active={activeDir === 'backward'} color={bot.color} onStart={startMove} onStop={stopMove} colors={colors} />
                </View>
              </View>

              {/* Speed slider */}
              <View style={styles.speedSliderWrap}>
                <Text style={styles.speedSliderLabel}>Speed</Text>
                <View style={styles.speedBtns}>
                  {[25, 50, 75, 100].map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.speedBtn, speed === s && { backgroundColor: bot.color + '30', borderColor: bot.color }]}
                      onPress={() => setSpeed(s)}
                    >
                      <Text style={[styles.speedBtnLabel, speed === s && { color: bot.color }]}>{s}%</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Quick Commands ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUICK COMMANDS</Text>
          <View style={styles.cmdGrid}>
            <CmdBtn icon="home" label="Return to base" color={colors.cyan} onPress={() => sendBotCommand(selectedBot, 'return_base').catch(() => {})} colors={colors} />
            <CmdBtn icon="scan" label="AI scan now" color={colors.green} onPress={() => sendBotCommand(selectedBot, 'ai_scan').catch(() => {})} colors={colors} />
            <CmdBtn icon="map" label="Share map" color={colors.pathfinder} onPress={() => sendBotCommand(selectedBot, 'share_map').catch(() => {})} colors={colors} />
            <CmdBtn icon="warning" label="Emergency ping" color={colors.red} onPress={() => sendBotCommand(selectedBot, 'emergency_ping').catch(() => {})} colors={colors} />
          </View>
        </View>

        {/* ── Telemetry ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LIVE TELEMETRY</Text>
          <View style={styles.telemetryCard}>
            <TelRow label="Battery"    value={`${bot.battery}%`}    color={bot.battery > 30 ? colors.green : colors.red} colors={colors} />
            <TelRow label="Status"     value={bot.status.toUpperCase()} color={bot.status === 'online' ? colors.green : colors.amber} colors={colors} />
            <TelRow label="Role"       value={bot.role} colors={colors} />
            <TelRow label="Comm link"  value="ESP-NOW + Wi-Fi" color={colors.cyan} colors={colors} />
            <TelRow label="Firmware"   value="v1.0.0 (ESP-IDF)" colors={colors} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function DPadBtn({ icon, dir, active, color, onStart, onStop, colors }) {
  const styles = getStyles(colors);
  
  return (
    <Pressable
      onPressIn={() => onStart(dir)}
      onPressOut={onStop}
      style={[styles.dpadBtn, active && { backgroundColor: color + '30', borderColor: color }]}
    >
      <Ionicons name={icon} size={22} color={active ? color : colors.textSecondary} />
    </Pressable>
  );
}

function ModeToggle({ icon, label, active, color, onPress, colors }) {
  const styles = getStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.modeToggle, active && { borderColor: color, backgroundColor: color + '18' }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={active ? color : colors.textSecondary} />
      <Text style={[styles.modeToggleLabel, active && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function CmdBtn({ icon, label, color, onPress, colors }) {
  const styles = getStyles(colors);

  return (
    <TouchableOpacity style={styles.cmdBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.cmdIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.cmdLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function TelRow({ label, value, color, colors }) {
  const styles = getStyles(colors);

  return (
    <View style={styles.telRow}>
      <Text style={styles.telLabel}>{label}</Text>
      <Text style={[styles.telValue, { color: color || colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg0 },
  scroll:  { flex: 1 },
  content: { paddingBottom: 40 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: colors.textPrimary },
  modePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  modePillText: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.5 },

  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  sectionLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: Spacing.sm },

  botSelectorRow: { gap: Spacing.sm },
  botSel: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10, paddingHorizontal: Spacing.md,
    backgroundColor: colors.bg1, borderWidth: 0.5, borderColor: colors.border, borderRadius: Radius.md,
  },
  botSelDot: { width: 8, height: 8, borderRadius: Radius.full },
  botSelName: { flex: 1, fontSize: Typography.sm, fontWeight: Typography.medium, color: colors.textSecondary },

  modeRow: { flexDirection: 'row', gap: Spacing.sm },
  modeToggle: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, backgroundColor: colors.bg1,
    borderWidth: 0.5, borderColor: colors.border, borderRadius: Radius.md,
  },
  modeToggleLabel: { fontSize: Typography.sm, fontWeight: Typography.medium, color: colors.textSecondary },

  dpadWrap: {
    backgroundColor: colors.bg1, borderWidth: 0.5, borderColor: colors.border,
    borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', gap: Spacing.lg,
  },
  speedDisplay: { alignItems: 'center' },
  speedValue: { fontSize: Typography.xxl, fontWeight: Typography.bold, color: colors.textPrimary },
  speedLabel: { fontSize: Typography.xs, color: colors.textMuted, letterSpacing: 0.8 },

  dpad: { gap: 6 },
  dpadRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dpadBtn: {
    width: 64, height: 64, borderRadius: Radius.md,
    backgroundColor: colors.bg2, borderWidth: 0.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  speedSliderWrap: { width: '100%', gap: Spacing.sm },
  speedSliderLabel: { fontSize: Typography.xs, color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  speedBtns: { flexDirection: 'row', gap: Spacing.sm },
  speedBtn: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    backgroundColor: colors.bg2, borderWidth: 0.5, borderColor: colors.border, borderRadius: Radius.sm,
  },
  speedBtnLabel: { fontSize: Typography.xs, fontWeight: Typography.medium, color: colors.textSecondary },

  cmdGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cmdBtn: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, backgroundColor: colors.bg1, borderWidth: 0.5, borderColor: colors.border, borderRadius: Radius.md },
  cmdIcon: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  cmdLabel: { flex: 1, fontSize: Typography.xs, fontWeight: Typography.medium, color: colors.textSecondary },

  telemetryCard: { backgroundColor: colors.bg1, borderWidth: 0.5, borderColor: colors.border, borderRadius: Radius.lg, overflow: 'hidden' },
  telRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 11,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  telLabel: { fontSize: Typography.sm, color: colors.textSecondary },
  telValue: { fontSize: Typography.sm, fontWeight: Typography.medium },
});
