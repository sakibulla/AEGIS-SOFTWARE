import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, Radius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// ─── StatusPip ────────────────────────────────────────────────────

export function StatusPip({ status }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();

  useEffect(() => {
    if (status === 'alert') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.2, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [status]);

  const config = {
    online:  { bg: colors.greenDim, color: colors.green,  label: 'ONLINE' },
    alert:   { bg: colors.amberDim, color: colors.amber,  label: 'ALERT'  },
    offline: { bg: colors.bg3,      color: colors.textMuted, label: 'OFFLINE' },
  }[status] || { bg: colors.bg3, color: colors.textMuted, label: '—' };

  return (
    <View style={[styles(colors).pip, { backgroundColor: config.bg }]}>
      <Animated.View style={[styles(colors).pipDot, { backgroundColor: config.color, opacity: status === 'alert' ? pulse : 1 }]} />
      <Text style={[styles(colors).pipLabel, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

// ─── BotCard ──────────────────────────────────────────────────────

export function BotCard({ bot, onPress }) {
  const { colors } = useTheme();

  const borderColor = bot.status === 'online' ? colors.greenDim
    : bot.status === 'alert' ? colors.amberDim
    : colors.border;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles(colors).botCard, { borderColor, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={styles(colors).botCardHeader}>
        <View style={[styles(colors).botIcon, { backgroundColor: bot.color + '22' }]}>
          <Ionicons name={iconMap[bot.icon] || 'hardware-chip'} size={18} color={bot.color} />
        </View>
        <StatusPip status={bot.status} />
      </View>
      <Text style={styles(colors).botName}>{bot.name}</Text>
      <Text style={styles(colors).botRole}>{bot.role}</Text>
      <View style={styles(colors).botStatRow}>
        <Ionicons name="battery-half" size={12} color={colors.textMuted} />
        <Text style={styles(colors).botStat}>{bot.battery}%</Text>
        {bot.mapCoverage != null && (
          <>
            <Text style={styles(colors).botStatSep}>·</Text>
            <Ionicons name="map" size={12} color={colors.textMuted} />
            <Text style={styles(colors).botStat}>{bot.mapCoverage}% mapped</Text>
          </>
        )}
      </View>
      <View style={styles(colors).botTaskRow}>
        {bot.tasks.slice(0, 1).map((t, i) => (
          <Text key={i} style={styles(colors).botTask} numberOfLines={1}>{t}</Text>
        ))}
      </View>
    </Pressable>
  );
}

// ─── AlertBanner ─────────────────────────────────────────────────

export function AlertBanner({ alert }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const isWarning = alert.severity === 'warning';
  const color = isWarning ? colors.amber : colors.red;
  const bg    = isWarning ? colors.amberDim : colors.redDim;

  return (
    <View style={[styles(colors).alertBanner, { backgroundColor: bg, borderColor: color + '55' }]}>
      <Animated.View style={[styles(colors).alertDot, { backgroundColor: color, opacity: pulse }]} />
      <View style={styles(colors).alertBody}>
        <Text style={[styles(colors).alertTitle, { color }]}>{alert.title}</Text>
        <Text style={styles(colors).alertDetail}>{alert.detail}</Text>
      </View>
      <Text style={[styles(colors).alertTime, { color: color + '99' }]}>{alert.time}</Text>
    </View>
  );
}

// ─── IncidentRow ─────────────────────────────────────────────────

export function IncidentRow({ incident }) {
  const { colors } = useTheme();

  const cfg = {
    warning: { color: colors.amber, bg: colors.amberDim },
    success: { color: colors.green, bg: colors.greenDim },
    info:    { color: colors.cyan,  bg: colors.cyanFaint },
  }[incident.severity] || { color: colors.textSecondary, bg: colors.bg2 };

  return (
    <View style={styles(colors).incidentRow}>
      <View style={[styles(colors).incIcon, { backgroundColor: cfg.bg }]}>
        <Ionicons name={iconMap[incident.icon] || 'information-circle'} size={14} color={cfg.color} />
      </View>
      <View style={styles(colors).incBody}>
        <Text style={styles(colors).incTitle}>{incident.title}</Text>
        <Text style={styles(colors).incSub}>{incident.sub}</Text>
      </View>
      <Text style={styles(colors).incTime}>{incident.time}</Text>
    </View>
  );
}

// ─── SectionLabel ────────────────────────────────────────────────

export function SectionLabel({ children, action, onAction }) {
  const { colors } = useTheme();

  return (
    <View style={styles(colors).sectionLabelRow}>
      <Text style={styles(colors).sectionLabel}>{children}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles(colors).sectionAction, { color: colors.cyan }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── MeshBadge ───────────────────────────────────────────────────

export function MeshBadge({ label = 'ESP-NOW', active = true }) {
  const { colors } = useTheme();

  return (
    <View style={[styles(colors).meshBadge, { borderColor: active ? colors.cyanDim : colors.border }]}>
      <View style={[styles(colors).meshDot, { backgroundColor: active ? colors.green : colors.textMuted }]} />
      <Text style={[styles(colors).meshLabel, { color: active ? colors.cyan : colors.textMuted }]}>{label}</Text>
    </View>
  );
}

// ─── Icon map (Ionicons names for each AEGIS icon key) ─────────────

const iconMap = {
  'map-search':    'map',
  'shield-check':  'shield-checkmark',
  'flame':         'flame',
  'alert-triangle':'warning',
  'first-aid-kit': 'medkit',
  'map-2':         'map',
  'eye':           'eye',
  'camera':        'videocam',
  'chart-bar':     'bar-chart',
};

// ─── Styles ──────────────────────────────────────────────────────

const styles = (colors) => StyleSheet.create({
  pip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full },
  pipDot: { width: 5, height: 5, borderRadius: Radius.full },
  pipLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.5 },

  botCard: {
    flex: 1,
    backgroundColor: colors.bg1,
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  botCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  botIcon: { width: 34, height: 34, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  botName: { fontSize: Typography.base, fontWeight: Typography.bold, color: colors.textPrimary, marginBottom: 2 },
  botRole: { fontSize: Typography.xs, color: colors.textSecondary, marginBottom: Spacing.sm },
  botStatRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  botStat: { fontSize: Typography.xs, color: colors.textMuted },
  botStatSep: { fontSize: Typography.xs, color: colors.textMuted },
  botTaskRow: { marginTop: 6 },
  botTask: { fontSize: 10, color: colors.textSecondary },

  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
  },
  alertDot: { width: 8, height: 8, borderRadius: Radius.full },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: Typography.sm, fontWeight: Typography.bold },
  alertDetail: { fontSize: Typography.xs, color: colors.textSecondary, marginTop: 1 },
  alertTime: { fontSize: Typography.xs },

  incidentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: colors.bg1,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  incIcon: { width: 30, height: 30, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  incBody: { flex: 1 },
  incTitle: { fontSize: Typography.sm, fontWeight: Typography.medium, color: colors.textPrimary },
  incSub: { fontSize: Typography.xs, color: colors.textSecondary, marginTop: 1 },
  incTime: { fontSize: Typography.xs, color: colors.textMuted },

  sectionLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  sectionAction: { fontSize: Typography.xs },

  meshBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 0.5 },
  meshDot: { width: 5, height: 5, borderRadius: Radius.full },
  meshLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.4 },
});
