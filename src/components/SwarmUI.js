import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

// ─── StatusPip ────────────────────────────────────────────────────

export function StatusPip({ status }) {
  const pulse = useRef(new Animated.Value(1)).current;

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
    online:  { bg: Colors.greenDim, color: Colors.green,  label: 'ONLINE' },
    alert:   { bg: Colors.amberDim, color: Colors.amber,  label: 'ALERT'  },
    offline: { bg: Colors.bg3,      color: Colors.textMuted, label: 'OFFLINE' },
  }[status] || { bg: Colors.bg3, color: Colors.textMuted, label: '—' };

  return (
    <View style={[styles.pip, { backgroundColor: config.bg }]}>
      <Animated.View style={[styles.pipDot, { backgroundColor: config.color, opacity: status === 'alert' ? pulse : 1 }]} />
      <Text style={[styles.pipLabel, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

// ─── BotCard ──────────────────────────────────────────────────────

export function BotCard({ bot, onPress }) {
  const borderColor = bot.status === 'online' ? Colors.greenDim
    : bot.status === 'alert' ? Colors.amberDim
    : Colors.border;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.botCard, { borderColor, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={styles.botCardHeader}>
        <View style={[styles.botIcon, { backgroundColor: bot.color + '22' }]}>
          <Ionicons name={iconMap[bot.icon] || 'hardware-chip'} size={18} color={bot.color} />
        </View>
        <StatusPip status={bot.status} />
      </View>
      <Text style={styles.botName}>{bot.name}</Text>
      <Text style={styles.botRole}>{bot.role}</Text>
      <View style={styles.botStatRow}>
        <Ionicons name="battery-half" size={12} color={Colors.textMuted} />
        <Text style={styles.botStat}>{bot.battery}%</Text>
        {bot.mapCoverage != null && (
          <>
            <Text style={styles.botStatSep}>·</Text>
            <Ionicons name="map" size={12} color={Colors.textMuted} />
            <Text style={styles.botStat}>{bot.mapCoverage}% mapped</Text>
          </>
        )}
      </View>
      <View style={styles.botTaskRow}>
        {bot.tasks.slice(0, 1).map((t, i) => (
          <Text key={i} style={styles.botTask} numberOfLines={1}>{t}</Text>
        ))}
      </View>
    </Pressable>
  );
}

// ─── AlertBanner ─────────────────────────────────────────────────

export function AlertBanner({ alert }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const isWarning = alert.severity === 'warning';
  const color = isWarning ? Colors.amber : Colors.red;
  const bg    = isWarning ? Colors.amberDim : Colors.redDim;

  return (
    <View style={[styles.alertBanner, { backgroundColor: bg, borderColor: color + '55' }]}>
      <Animated.View style={[styles.alertDot, { backgroundColor: color, opacity: pulse }]} />
      <View style={styles.alertBody}>
        <Text style={[styles.alertTitle, { color }]}>{alert.title}</Text>
        <Text style={styles.alertDetail}>{alert.detail}</Text>
      </View>
      <Text style={[styles.alertTime, { color: color + '99' }]}>{alert.time}</Text>
    </View>
  );
}

// ─── IncidentRow ─────────────────────────────────────────────────

export function IncidentRow({ incident }) {
  const cfg = {
    warning: { color: Colors.amber, bg: Colors.amberDim },
    success: { color: Colors.green, bg: Colors.greenDim },
    info:    { color: Colors.cyan,  bg: Colors.cyanFaint },
  }[incident.severity] || { color: Colors.textSecondary, bg: Colors.bg2 };

  return (
    <View style={styles.incidentRow}>
      <View style={[styles.incIcon, { backgroundColor: cfg.bg }]}>
        <Ionicons name={iconMap[incident.icon] || 'information-circle'} size={14} color={cfg.color} />
      </View>
      <View style={styles.incBody}>
        <Text style={styles.incTitle}>{incident.title}</Text>
        <Text style={styles.incSub}>{incident.sub}</Text>
      </View>
      <Text style={styles.incTime}>{incident.time}</Text>
    </View>
  );
}

// ─── SectionLabel ────────────────────────────────────────────────

export function SectionLabel({ children, action, onAction }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── MeshBadge ───────────────────────────────────────────────────

export function MeshBadge({ label = 'ESP-NOW', active = true }) {
  return (
    <View style={[styles.meshBadge, { borderColor: active ? Colors.cyanDim : Colors.border }]}>
      <View style={[styles.meshDot, { backgroundColor: active ? Colors.green : Colors.textMuted }]} />
      <Text style={[styles.meshLabel, { color: active ? Colors.cyan : Colors.textMuted }]}>{label}</Text>
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

const styles = StyleSheet.create({
  pip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full },
  pipDot: { width: 5, height: 5, borderRadius: Radius.full },
  pipLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.5 },

  botCard: {
    flex: 1,
    backgroundColor: Colors.bg1,
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  botCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  botIcon: { width: 34, height: 34, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  botName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 2 },
  botRole: { fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  botStatRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  botStat: { fontSize: Typography.xs, color: Colors.textMuted },
  botStatSep: { fontSize: Typography.xs, color: Colors.textMuted },
  botTaskRow: { marginTop: 6 },
  botTask: { fontSize: 10, color: Colors.textSecondary },

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
  alertDetail: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },
  alertTime: { fontSize: Typography.xs },

  incidentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg1,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  incIcon: { width: 30, height: 30, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  incBody: { flex: 1 },
  incTitle: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary },
  incSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },
  incTime: { fontSize: Typography.xs, color: Colors.textMuted },

  sectionLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  sectionAction: { fontSize: Typography.xs, color: Colors.cyan },

  meshBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 0.5 },
  meshDot: { width: 5, height: 5, borderRadius: Radius.full },
  meshLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.4 },
});
