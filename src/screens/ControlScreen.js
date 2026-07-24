import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, Radius, getResponsiveTypography, getResponsiveSpacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { StatusPip } from '../components/SwarmUI';
import { BOTS } from '../constants/mockData';
import { sendBotCommand } from '../services/AegisService';
import { useResponsive } from '../utils/responsive';

export default function ControlScreen() {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const [selectedBot, setSelectedBot] = useState(BOTS[0].id);
  const [mode, setMode] = useState('manual');       // 'manual' | 'autonomous'
  const [activeDir, setActiveDir] = useState(null);
  const [speed, setSpeed] = useState(50);
  const intervalRef = useRef(null);

  const styles = getStyles(colors, responsive);
  const bot = BOTS.find(b => b.id === selectedBot);

  function startMove(dir) {
    setActiveDir(dir);
    // Vibration is not available on web
    intervalRef.current = setInterval(() => {
      // Send command would go here
    }, 150);
  }

  function stopMove() {
    setActiveDir(null);
    clearInterval(intervalRef.current);
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
            <ModeToggle icon="game-controller" label="Manual RC" active={mode === 'manual'} color={colors.cyan} onPress={() => switchMode('manual')} colors={colors} responsive={responsive} />
            <ModeToggle icon="cpu" label="Autonomous" active={mode === 'autonomous'} color={colors.green} onPress={() => switchMode('autonomous')} colors={colors} responsive={responsive} />
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
                  <DPadBtn icon="arrow-up" dir="forward" active={activeDir === 'forward'} color={bot.color} onStart={startMove} onStop={stopMove} colors={colors} responsive={responsive} />
                </View>
                {/* Left / Stop / Right */}
                <View style={styles.dpadRow}>
                  <DPadBtn icon="arrow-back" dir="left" active={activeDir === 'left'} color={bot.color} onStart={startMove} onStop={stopMove} colors={colors} responsive={responsive} />
                  <DPadBtn icon="stop" dir="stop" active={activeDir === 'stop'} color={colors.red} onStart={() => { stopMove(); setActiveDir('stop'); }} onStop={() => setActiveDir(null)} colors={colors} responsive={responsive} />
                  <DPadBtn icon="arrow-forward" dir="right" active={activeDir === 'right'} color={bot.color} onStart={startMove} onStop={stopMove} colors={colors} responsive={responsive} />
                </View>
                {/* Backward */}
                <View style={styles.dpadRow}>
                  <DPadBtn icon="arrow-down" dir="backward" active={activeDir === 'backward'} color={bot.color} onStart={startMove} onStop={stopMove} colors={colors} responsive={responsive} />
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
            <CmdBtn icon="home" label="Return to base" color={colors.cyan} onPress={() => sendBotCommand(selectedBot, 'return_base').catch(() => {})} colors={colors} responsive={responsive} />
            <CmdBtn icon="scan" label="AI scan now" color={colors.green} onPress={() => sendBotCommand(selectedBot, 'ai_scan').catch(() => {})} colors={colors} responsive={responsive} />
            <CmdBtn icon="map" label="Share map" color={colors.pathfinder} onPress={() => sendBotCommand(selectedBot, 'share_map').catch(() => {})} colors={colors} responsive={responsive} />
            <CmdBtn icon="warning" label="Emergency ping" color={colors.red} onPress={() => sendBotCommand(selectedBot, 'emergency_ping').catch(() => {})} colors={colors} responsive={responsive} />
          </View>
        </View>

        {/* ── Telemetry ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LIVE TELEMETRY</Text>
          <View style={styles.telemetryCard}>
            <TelRow label="Battery"    value={`${bot.battery}%`}    color={bot.battery > 30 ? colors.green : colors.red} colors={colors} responsive={responsive} />
            <TelRow label="Status"     value={bot.status.toUpperCase()} color={bot.status === 'online' ? colors.green : colors.amber} colors={colors} responsive={responsive} />
            <TelRow label="Role"       value={bot.role} colors={colors} responsive={responsive} />
            <TelRow label="Comm link"  value="ESP-NOW + Wi-Fi" color={colors.cyan} colors={colors} responsive={responsive} />
            <TelRow label="Firmware"   value="v1.0.0 (ESP-IDF)" colors={colors} responsive={responsive} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function DPadBtn({ icon, dir, active, color, onStart, onStop, colors, responsive }) {
  const styles = getStyles(colors, responsive);
  const iconSize = responsive.isDesktop ? 26 : responsive.isTablet ? 24 : 22;
  
  return (
    <Pressable
      onPressIn={() => onStart(dir)}
      onPressOut={onStop}
      style={[styles.dpadBtn, active && { backgroundColor: color + '30', borderColor: color }]}
    >
      <Ionicons name={icon} size={iconSize} color={active ? color : colors.textSecondary} />
    </Pressable>
  );
}

function ModeToggle({ icon, label, active, color, onPress, colors, responsive }) {
  const styles = getStyles(colors, responsive);
  const iconSize = responsive.isDesktop ? 24 : 20;

  return (
    <TouchableOpacity
      style={[styles.modeToggle, active && { borderColor: color, backgroundColor: color + '18' }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={iconSize} color={active ? color : colors.textSecondary} />
      <Text style={[styles.modeToggleLabel, active && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function CmdBtn({ icon, label, color, onPress, colors, responsive }) {
  const styles = getStyles(colors, responsive);
  const iconSize = responsive.isDesktop ? 20 : 18;

  return (
    <TouchableOpacity style={styles.cmdBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.cmdIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={iconSize} color={color} />
      </View>
      <Text style={styles.cmdLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function TelRow({ label, value, color, colors, responsive }) {
  const styles = getStyles(colors, responsive);

  return (
    <View style={styles.telRow}>
      <Text style={styles.telLabel}>{label}</Text>
      <Text style={[styles.telValue, { color: color || colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const getStyles = (colors, responsive) => {
  const typo = getResponsiveTypography(responsive.deviceType);
  const space = getResponsiveSpacing(responsive.deviceType);
  
  // D-pad size based on device
  const dpadBtnSize = responsive.isDesktop ? 80 : responsive.isTablet ? 72 : 64;

  return StyleSheet.create({
    safe:    { flex: 1, backgroundColor: colors.bg0 },
    scroll:  { flex: 1 },
    content: { 
      paddingBottom: space.xxl * 2,
      maxWidth: responsive.isDesktop ? 1200 : '100%',
      alignSelf: 'center',
      width: '100%',
    },

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
    headerTitle: { fontSize: typo.lg, fontWeight: Typography.bold, color: colors.textPrimary },
    modePill: { 
      paddingHorizontal: responsive.isDesktop ? space.md : 10, 
      paddingVertical: responsive.isDesktop ? 6 : 4, 
      borderRadius: Radius.full 
    },
    modePillText: { fontSize: typo.xs, fontWeight: Typography.bold, letterSpacing: 0.5 },

    section: { paddingHorizontal: space.lg, paddingTop: space.xl },
    sectionLabel: { fontSize: typo.xs, fontWeight: Typography.bold, color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: space.sm },

    botSelectorRow: { gap: space.sm },
    botSel: {
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: space.sm, 
      paddingVertical: responsive.isDesktop ? space.md : 10, 
      paddingHorizontal: space.md,
      backgroundColor: colors.bg1, 
      borderWidth: 0.5, 
      borderColor: colors.border, 
      borderRadius: Radius.md,
    },
    botSelDot: { width: 8, height: 8, borderRadius: Radius.full },
    botSelName: { flex: 1, fontSize: typo.sm, fontWeight: Typography.medium, color: colors.textSecondary },

    modeRow: { 
      flexDirection: responsive.isSmallDevice ? 'column' : 'row', 
      gap: space.sm 
    },
    modeToggle: {
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
    modeToggleLabel: { fontSize: typo.sm, fontWeight: Typography.medium, color: colors.textSecondary },

    dpadWrap: {
      backgroundColor: colors.bg1, 
      borderWidth: 0.5, 
      borderColor: colors.border,
      borderRadius: Radius.lg, 
      padding: space.lg, 
      alignItems: 'center', 
      gap: space.lg,
    },
    speedDisplay: { alignItems: 'center' },
    speedValue: { fontSize: typo.xxl, fontWeight: Typography.bold, color: colors.textPrimary },
    speedLabel: { fontSize: typo.xs, color: colors.textMuted, letterSpacing: 0.8 },

    dpad: { gap: responsive.isDesktop ? 8 : 6 },
    dpadRow: { flexDirection: 'row', justifyContent: 'center', gap: responsive.isDesktop ? 8 : 6 },
    dpadBtn: {
      width: dpadBtnSize, 
      height: dpadBtnSize, 
      borderRadius: Radius.md,
      backgroundColor: colors.bg2, 
      borderWidth: 0.5, 
      borderColor: colors.border,
      alignItems: 'center', 
      justifyContent: 'center',
    },

    speedSliderWrap: { width: '100%', gap: space.sm },
    speedSliderLabel: { fontSize: typo.xs, color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
    speedBtns: { flexDirection: 'row', gap: space.sm },
    speedBtn: {
      flex: 1, 
      paddingVertical: responsive.isDesktop ? space.sm : 8, 
      alignItems: 'center',
      backgroundColor: colors.bg2, 
      borderWidth: 0.5, 
      borderColor: colors.border, 
      borderRadius: Radius.sm,
    },
    speedBtnLabel: { fontSize: typo.xs, fontWeight: Typography.medium, color: colors.textSecondary },

    cmdGrid: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      gap: space.sm 
    },
    cmdBtn: { 
      width: responsive.isDesktop ? '48%' : '47%', 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: space.sm, 
      padding: space.md, 
      backgroundColor: colors.bg1, 
      borderWidth: 0.5, 
      borderColor: colors.border, 
      borderRadius: Radius.md 
    },
    cmdIcon: { 
      width: responsive.isDesktop ? 36 : 32, 
      height: responsive.isDesktop ? 36 : 32, 
      borderRadius: Radius.sm, 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    cmdLabel: { flex: 1, fontSize: typo.xs, fontWeight: Typography.medium, color: colors.textSecondary },

    telemetryCard: { 
      backgroundColor: colors.bg1, 
      borderWidth: 0.5, 
      borderColor: colors.border, 
      borderRadius: Radius.lg, 
      overflow: 'hidden' 
    },
    telRow: {
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      paddingHorizontal: space.md, 
      paddingVertical: responsive.isDesktop ? space.md : 11,
      borderBottomWidth: 0.5, 
      borderBottomColor: colors.border,
    },
    telLabel: { fontSize: typo.sm, color: colors.textSecondary },
    telValue: { fontSize: typo.sm, fontWeight: Typography.medium },
  });
};
