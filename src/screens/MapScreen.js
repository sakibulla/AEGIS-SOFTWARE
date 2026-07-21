import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { Typography, Spacing, Radius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { SectionLabel, MeshBadge } from '../components/SwarmUI';
import { BOTS, MAP_ROOMS } from '../constants/mockData';

const { width } = Dimensions.get('window');
const MAP_W = width - Spacing.lg * 2;
const MAP_H = MAP_W * 0.65;

export default function MapScreen() {
  const [selectedBot, setSelectedBot] = useState(null);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Map</Text>
        <MeshBadge label="Pathfinder · SLAM" />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Map Coverage Badge ── */}
        <View style={styles.coverageRow}>
          <View style={styles.coverageBg}>
            <View style={[styles.coverageFill, { width: '78%' }]} />
          </View>
          <Text style={styles.coverageLabel}>78% mapped</Text>
        </View>

        {/* ── SVG Map ── */}
        <View style={styles.mapContainer}>
          <Svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
            {/* Grid background */}
            {Array.from({ length: Math.floor(MAP_W / 20) }).map((_, i) => (
              <Line key={`vg${i}`} x1={i * 20} y1={0} x2={i * 20} y2={MAP_H}
                stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
            ))}
            {Array.from({ length: Math.floor(MAP_H / 20) }).map((_, i) => (
              <Line key={`hg${i}`} x1={0} y1={i * 20} x2={MAP_W} y2={i * 20}
                stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
            ))}

            {/* Rooms */}
            {MAP_ROOMS.map(room => {
              const rx = room.x * MAP_W;
              const ry = room.y * MAP_H;
              const rw = room.w * MAP_W;
              const rh = room.h * MAP_H;
              return (
                <G key={room.id}>
                  <Rect
                    x={rx} y={ry} width={rw} height={rh}
                    fill={colors.bg2} stroke={colors.borderStrong}
                    strokeWidth="1" rx="4"
                  />
                  <SvgText
                    x={rx + rw / 2} y={ry + rh / 2 + 4}
                    fill={colors.textMuted} fontSize="9" textAnchor="middle"
                  >{room.label}</SvgText>
                </G>
              );
            })}

            {/* Bot positions */}
            {BOTS.map(bot => {
              const bx = bot.location.x * MAP_W;
              const by = bot.location.y * MAP_H;
              const isSelected = selectedBot === bot.id;
              return (
                <G key={bot.id} onPress={() => setSelectedBot(isSelected ? null : bot.id)}>
                  {/* Glow ring */}
                  <Circle cx={bx} cy={by} r={isSelected ? 18 : 12}
                    fill={bot.color} opacity="0.12" />
                  {/* Bot dot */}
                  <Circle cx={bx} cy={by} r={6}
                    fill={bot.color} stroke={colors.bg0} strokeWidth="1.5" />
                  {/* Name label */}
                  <SvgText
                    x={bx} y={by - 12}
                    fill={bot.color} fontSize="8" textAnchor="middle" fontWeight="600"
                  >{bot.name.toUpperCase()}</SvgText>
                </G>
              );
            })}
          </Svg>
        </View>

        {/* ── Bot Legend ── */}
        <View style={styles.legendRow}>
          {BOTS.map(bot => (
            <TouchableOpacity
              key={bot.id}
              style={[styles.legendItem, selectedBot === bot.id && { borderColor: bot.color }]}
              onPress={() => setSelectedBot(selectedBot === bot.id ? null : bot.id)}
            >
              <View style={[styles.legendDot, { backgroundColor: bot.color }]} />
              <Text style={[styles.legendLabel, { color: bot.color }]}>{bot.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Selected Bot Detail ── */}
        {selectedBot && (() => {
          const bot = BOTS.find(b => b.id === selectedBot);
          return (
            <View style={styles.section}>
              <View style={styles.botDetail}>
                <View style={styles.botDetailHeader}>
                  <View style={[styles.botDetailIcon, { backgroundColor: bot.color + '22' }]}>
                    <Ionicons name="hardware-chip" size={18} color={bot.color} />
                  </View>
                  <View>
                    <Text style={styles.botDetailName}>{bot.name}</Text>
                    <Text style={styles.botDetailRole}>{bot.role}</Text>
                  </View>
                </View>
                <View style={styles.botDetailTasks}>
                  {bot.tasks.map((t, i) => (
                    <View key={i} style={styles.taskRow}>
                      <View style={[styles.taskDot, { backgroundColor: bot.color }]} />
                      <Text style={styles.taskText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          );
        })()}

        {/* ── Map Stats ── */}
        <View style={styles.section}>
          <SectionLabel>Map statistics</SectionLabel>
          <View style={styles.mapStatsGrid}>
            <MapStat label="Rooms found"  value="5" colors={colors} />
            <MapStat label="Corridors"    value="4" colors={colors} />
            <MapStat label="Exits mapped" value="2" colors={colors} />
            <MapStat label="Update rate"  value="2 Hz" colors={colors} />
          </View>
        </View>

        {/* ── Floor Toggle ── */}
        <View style={styles.section}>
          <SectionLabel>Floor</SectionLabel>
          <View style={styles.floorRow}>
            {['Floor 1', 'Floor 2', 'Floor 3'].map((f, i) => (
              <TouchableOpacity key={f} style={[styles.floorBtn, i === 0 && styles.floorBtnActive]}>
                <Text style={[styles.floorBtnLabel, i === 0 && { color: colors.cyan }]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function MapStat({ label, value, colors }) {
  const styles = getStyles(colors);
  
  return (
    <View style={styles.mapStat}>
      <Text style={styles.mapStatValue}>{value}</Text>
      <Text style={styles.mapStatLabel}>{label}</Text>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg0 },
  scroll:  { flex: 1 },
  content: { paddingBottom: 32 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: colors.textPrimary },

  coverageRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  coverageBg: { flex: 1, height: 4, backgroundColor: colors.bg3, borderRadius: Radius.full, overflow: 'hidden' },
  coverageFill: { height: '100%', backgroundColor: colors.green, borderRadius: Radius.full },
  coverageLabel: { fontSize: Typography.xs, color: colors.green, fontWeight: Typography.bold, width: 70 },

  mapContainer: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    borderRadius: Radius.lg, overflow: 'hidden',
    backgroundColor: colors.bg1, borderWidth: 0.5, borderColor: colors.border,
  },

  legendRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  legendItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 7, borderRadius: Radius.md,
    backgroundColor: colors.bg1, borderWidth: 0.5, borderColor: colors.border,
  },
  legendDot: { width: 7, height: 7, borderRadius: Radius.full },
  legendLabel: { fontSize: Typography.xs, fontWeight: Typography.bold },

  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },

  botDetail: { backgroundColor: colors.bg1, borderWidth: 0.5, borderColor: colors.border, borderRadius: Radius.lg, padding: Spacing.md },
  botDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  botDetailIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  botDetailName: { fontSize: Typography.base, fontWeight: Typography.bold, color: colors.textPrimary },
  botDetailRole: { fontSize: Typography.xs, color: colors.textSecondary },
  botDetailTasks: { gap: 5 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  taskDot: { width: 5, height: 5, borderRadius: Radius.full },
  taskText: { fontSize: Typography.xs, color: colors.textSecondary },

  mapStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  mapStat: {
    width: '47%', backgroundColor: colors.bg1,
    borderWidth: 0.5, borderColor: colors.border,
    borderRadius: Radius.md, padding: Spacing.md,
  },
  mapStatValue: { fontSize: Typography.md, fontWeight: Typography.bold, color: colors.cyan },
  mapStatLabel: { fontSize: Typography.xs, color: colors.textMuted, marginTop: 2 },

  floorRow: { flexDirection: 'row', gap: Spacing.sm },
  floorBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    backgroundColor: colors.bg1, borderWidth: 0.5, borderColor: colors.border, borderRadius: Radius.md,
  },
  floorBtnActive: { backgroundColor: colors.cyanFaint, borderColor: colors.cyanDim },
  floorBtnLabel: { fontSize: Typography.sm, fontWeight: Typography.medium, color: colors.textSecondary },
});
