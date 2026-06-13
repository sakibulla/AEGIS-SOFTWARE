import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { MeshBadge } from '../components/SwarmUI';
import { BOTS, VIDEO_FEEDS } from '../constants/mockData';

const { width } = Dimensions.get('window');
const FEED_W = (width - Spacing.lg * 2 - Spacing.sm) / 2;
const FEED_H = FEED_W * 0.75;

export default function FeedsScreen() {
  const [expanded, setExpanded] = useState(null);
  const [recording, setRecording] = useState({});

  const botMap = Object.fromEntries(BOTS.map(b => [b.id, b]));

  function toggleExpand(id) {
    setExpanded(prev => (prev === id ? null : id));
  }

  function toggleRec(id) {
    setRecording(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Feeds</Text>
        <MeshBadge label="Wi-Fi · MJPEG" />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Expanded feed ── */}
        {expanded && (() => {
          const feed = VIDEO_FEEDS.find(f => f.id === expanded);
          const bot  = botMap[feed.botId];
          return (
            <View style={styles.bigFeedWrap}>
              <FeedPlaceholder
                bot={bot} large width={width - Spacing.lg * 2} height={(width - Spacing.lg * 2) * 0.6}
                recording={!!recording[feed.id]}
              />
              <View style={styles.bigFeedControls}>
                <FeedCtrlBtn icon="contract" label="Collapse" onPress={() => setExpanded(null)} />
                <FeedCtrlBtn icon={recording[feed.id] ? 'stop-circle' : 'radio-button-on'}
                  label={recording[feed.id] ? 'Stop REC' : 'Record'}
                  color={recording[feed.id] ? Colors.red : Colors.green}
                  onPress={() => toggleRec(feed.id)}
                />
                <FeedCtrlBtn icon="scan" label="AI Scan" color={Colors.cyan} onPress={() => {}} />
                <FeedCtrlBtn icon="share-outline" label="Share" onPress={() => {}} />
              </View>
            </View>
          );
        })()}

        {/* ── Feed grid ── */}
        <View style={styles.section}>
          <View style={styles.feedGrid}>
            {VIDEO_FEEDS.map(feed => {
              const bot = botMap[feed.botId];
              if (expanded === feed.id) return null;
              return (
                <TouchableOpacity
                  key={feed.id}
                  style={styles.feedThumb}
                  onPress={() => toggleExpand(feed.id)}
                  activeOpacity={0.85}
                >
                  <FeedPlaceholder
                    bot={bot} width={FEED_W} height={FEED_H}
                    recording={!!recording[feed.id]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Integration note ── */}
        <View style={styles.section}>
          <View style={styles.integrationCard}>
            <View style={styles.integrationIcon}>
              <Ionicons name="code-slash" size={18} color={Colors.cyan} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.integrationTitle}>Connect OpenCV streams</Text>
              <Text style={styles.integrationSub}>
                Point your Flask server to expose{' '}
                <Text style={{ color: Colors.cyan, fontFamily: 'monospace' }}>/video/{'<bot_id>'}</Text>
                {' '}as an MJPEG stream. Edit{' '}
                <Text style={{ color: Colors.cyan, fontFamily: 'monospace' }}>AegisService.js</Text>
                {' '}with your server IP.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Per-bot status ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STREAM STATUS</Text>
          {VIDEO_FEEDS.map(feed => {
            const bot = botMap[feed.botId];
            return (
              <View key={feed.id} style={styles.streamRow}>
                <View style={[styles.streamDot, { backgroundColor: bot.color }]} />
                <Text style={styles.streamName}>{bot.name}</Text>
                <Text style={styles.streamUrl}>
                  {feed.streamUrl ? feed.streamUrl : 'Not connected'}
                </Text>
                <View style={[
                  styles.streamStatus,
                  { backgroundColor: feed.streamUrl ? Colors.greenDim : Colors.bg3 }
                ]}>
                  <Text style={[
                    styles.streamStatusLabel,
                    { color: feed.streamUrl ? Colors.green : Colors.textMuted }
                  ]}>
                    {feed.streamUrl ? 'LIVE' : 'OFFLINE'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── FeedPlaceholder ─────────────────────────────────────────────

function FeedPlaceholder({ bot, width, height, recording, large }) {
  return (
    <View style={[styles.feedPH, { width, height }]}>
      {/* Scanline effect overlay */}
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.scanline, { top: `${i * 17}%` }]} />
      ))}

      <View style={[styles.feedCamIcon, { backgroundColor: bot.color + '18' }]}>
        <Ionicons name="videocam" size={large ? 32 : 22} color={bot.color} />
      </View>
      <Text style={[styles.feedBotName, { color: bot.color, fontSize: large ? 12 : 9 }]}>
        {bot.name.toUpperCase()}
      </Text>
      <Text style={styles.feedStatus}>Connecting…</Text>

      {/* REC dot */}
      {recording && (
        <View style={styles.recDot}>
          <Text style={styles.recLabel}>● REC</Text>
        </View>
      )}

      {/* Live badge */}
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveLabel}>LIVE</Text>
      </View>
    </View>
  );
}

function FeedCtrlBtn({ icon, label, color = Colors.textSecondary, onPress }) {
  return (
    <TouchableOpacity style={styles.ctrlBtn} onPress={onPress}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.ctrlLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg0 },
  scroll:  { flex: 1 },
  content: { paddingBottom: 32 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },

  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },

  bigFeedWrap: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  bigFeedControls: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  ctrlBtn: {
    flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10,
    backgroundColor: Colors.bg1, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.md,
  },
  ctrlLabel: { fontSize: 10, fontWeight: Typography.medium },

  feedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  feedThumb: { borderRadius: Radius.md, overflow: 'hidden' },

  feedPH: {
    backgroundColor: Colors.bg1, borderRadius: Radius.md, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 0.5, borderColor: Colors.border, position: 'relative',
  },
  scanline: { position: 'absolute', left: 0, right: 0, height: 0.5, backgroundColor: Colors.border },
  feedCamIcon: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  feedBotName: { fontWeight: Typography.bold, letterSpacing: 0.5 },
  feedStatus: { fontSize: 9, color: Colors.textMuted },
  recDot: { position: 'absolute', top: 7, right: 8 },
  recLabel: { fontSize: 9, color: Colors.red, fontWeight: Typography.bold },
  liveBadge: { position: 'absolute', bottom: 6, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3 },
  liveDot: { width: 5, height: 5, borderRadius: Radius.full, backgroundColor: Colors.red },
  liveLabel: { fontSize: 8, color: Colors.textSecondary, fontWeight: Typography.bold },

  integrationCard: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.cyanFaint, borderWidth: 0.5, borderColor: Colors.cyanDim,
    borderRadius: Radius.lg, padding: Spacing.md,
  },
  integrationIcon: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center',
  },
  integrationTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.cyan, marginBottom: 3 },
  integrationSub:   { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 16 },

  sectionLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: Spacing.sm },

  streamRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  streamDot:   { width: 8, height: 8, borderRadius: Radius.full },
  streamName:  { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary, width: 80 },
  streamUrl:   { flex: 1, fontSize: Typography.xs, color: Colors.textMuted, fontFamily: 'monospace' },
  streamStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  streamStatusLabel: { fontSize: 9, fontWeight: Typography.bold },
});
