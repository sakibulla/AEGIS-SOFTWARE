import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
  Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { MeshBadge } from '../components/SwarmUI';
import { BOTS, VIDEO_FEEDS } from '../constants/mockData';
import { useStreamUrls, detectionsUrlFor } from '../hooks/useStreamUrls';

const { width } = Dimensions.get('window');
const FEED_W = (width - Spacing.lg * 2 - Spacing.sm) / 2;
const FEED_H = FEED_W * 0.75;

export default function FeedsScreen() {
  const { urls, setUrl, loading: urlsLoading } = useStreamUrls();
  const [expanded, setExpanded] = useState(null);
  const [modalOpen, setModalOpen] = useState(null);
  const [detections, setDetections] = useState({});
  const pollingRef = useRef({});
  const webViewRefs = useRef({});

  const botMap = Object.fromEntries(BOTS.map(b => [b.id, b]));

  // Polling for detections when expanded
  useEffect(() => {
    if (!expanded) {
      // Stop all polling
      Object.values(pollingRef.current).forEach(interval => clearInterval(interval));
      pollingRef.current = {};
      return;
    }

    const feed = VIDEO_FEEDS.find(f => f.id === expanded);
    if (!feed) return;

    const streamUrl = urls[feed.botId];
    if (!streamUrl) return;

    const detectUrl = detectionsUrlFor(streamUrl);
    if (!detectUrl) return;

    // Poll for detections every 1 second
    const interval = setInterval(async () => {
      try {
        const response = await fetch(detectUrl);
        if (!response.ok) return;
        const data = await response.json();
        setDetections(prev => ({
          ...prev,
          [feed.botId]: data.detections || []
        }));
      } catch (error) {
        // Silently continue on error
      }
    }, 1000);

    pollingRef.current[feed.botId] = interval;

    return () => {
      clearInterval(interval);
      delete pollingRef.current[feed.botId];
    };
  }, [expanded, urls]);

  function toggleExpand(id) {
    setExpanded(prev => (prev === id ? null : id));
  }

  function handleReload(feedId) {
    if (webViewRefs.current[feedId]) {
      webViewRefs.current[feedId].reload();
    }
  }

  function handleOpenModal(botId) {
    setModalOpen(botId);
  }

  function handleCloseModal() {
    setModalOpen(null);
  }

  function handleSetUrl(botId, url) {
    setUrl(botId, url || null);
    setModalOpen(null);
  }

  if (urlsLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Feeds</Text>
          <MeshBadge label="Wi-Fi · MJPEG" />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.cyan} />
          <Text style={{ marginTop: Spacing.md, color: Colors.textSecondary }}>
            Loading stream URLs…
          </Text>
        </View>
      </SafeAreaView>
    );
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
          const bot = botMap[feed.botId];
          const streamUrl = urls[feed.botId];

          return (
            <View style={styles.bigFeedWrap}>
              <View style={styles.bigFeedContainer}>
                {streamUrl ? (
                  <>
                    <WebView
                      ref={el => { webViewRefs.current[feed.id] = el; }}
                      source={{
                        html: `
                          <html>
                          <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                              body { margin: 0; padding: 0; background: #000; }
                              img { width: 100%; height: 100%; object-fit: cover; display: block; }
                            </style>
                          </head>
                          <body>
                            <img src="${streamUrl}" alt="Stream" />
                          </body>
                          </html>
                        `
                      }}
                      originWhitelist={['*']}
                      style={{ flex: 1 }}
                    />
                  </>
                ) : (
                  <View style={styles.bigFeedPlaceholder}>
                    <Ionicons name="camera-off" size={48} color={Colors.textMuted} />
                    <Text style={styles.bigFeedText}>No stream URL set</Text>
                  </View>
                )}

                {/* Detections overlay */}
                {streamUrl && detections[feed.botId] && detections[feed.botId].length > 0 && (
                  <View style={styles.detectionsOverlay}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.detectionsScroll}>
                      {detections[feed.botId].map((detection, idx) => (
                        <View key={idx} style={styles.detectionChip}>
                          <Text style={styles.detectionLabel}>
                            {detection.label} ({Math.round(detection.confidence * 100)}%)
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.bigFeedControls}>
                <FeedCtrlBtn icon="contract" label="Collapse" onPress={() => setExpanded(null)} />
                <FeedCtrlBtn icon="settings" label="Set URL" color={Colors.cyan} onPress={() => handleOpenModal(feed.botId)} />
                <FeedCtrlBtn icon="refresh" label="Reload" color={Colors.amber} onPress={() => handleReload(feed.id)} />
              </View>
            </View>
          );
        })()}

        {/* ── Feed grid ── */}
        <View style={styles.section}>
          <View style={styles.feedGrid}>
            {VIDEO_FEEDS.map(feed => {
              const bot = botMap[feed.botId];
              const streamUrl = urls[feed.botId];
              if (expanded === feed.id) return null;

              return (
                <View key={feed.id} style={styles.feedThumbContainer}>
                  <TouchableOpacity
                    style={styles.feedThumb}
                    onPress={() => toggleExpand(feed.id)}
                    activeOpacity={0.85}
                  >
                    {streamUrl ? (
                      <WebView
                        source={{
                          html: `
                            <html>
                            <head>
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <style>
                                body { margin: 0; padding: 0; background: #000; }
                                img { width: 100%; height: 100%; object-fit: cover; display: block; }
                              </style>
                            </head>
                            <body>
                              <img src="${streamUrl}" alt="Stream" />
                            </body>
                            </html>
                          `
                        }}
                        originWhitelist={['*']}
                        style={{ width: FEED_W, height: FEED_H }}
                        scrollEnabled={false}
                      />
                    ) : (
                      <FeedPlaceholder bot={bot} width={FEED_W} height={FEED_H} />
                    )}
                  </TouchableOpacity>

                  {/* Settings gear icon */}
                  <TouchableOpacity
                    style={styles.feedSettingsBtn}
                    onPress={() => handleOpenModal(feed.botId)}
                  >
                    <Ionicons name="settings" size={18} color={Colors.cyan} />
                  </TouchableOpacity>

                  {/* Live badge */}
                  {streamUrl && (
                    <View style={styles.feedLiveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveLabel}>LIVE</Text>
                    </View>
                  )}
                </View>
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
              <Text style={styles.integrationTitle}>Connect YOLO streams</Text>
              <Text style={styles.integrationSub}>
                Run{' '}
                <Text style={{ color: Colors.cyan, fontFamily: 'monospace' }}>yolo_server.py</Text>
                {' '}from{' '}
                <Text style={{ color: Colors.cyan, fontFamily: 'monospace' }}>aegis-yolo-server/</Text>
                . Get the{' '}
                <Text style={{ color: Colors.cyan, fontFamily: 'monospace' }}>/video_feed</Text>
                {' '}URL from startup output. Tap the gear icon on a feed to paste the URL.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Per-bot status ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STREAM STATUS</Text>
          {VIDEO_FEEDS.map(feed => {
            const bot = botMap[feed.botId];
            const streamUrl = urls[feed.botId];
            return (
              <TouchableOpacity
                key={feed.id}
                style={styles.streamRow}
                onPress={() => handleOpenModal(feed.botId)}
                activeOpacity={0.7}
              >
                <View style={[styles.streamDot, { backgroundColor: bot.color }]} />
                <Text style={styles.streamName}>{bot.name}</Text>
                <Text style={styles.streamUrl} numberOfLines={1}>
                  {streamUrl || 'Tap to set URL'}
                </Text>
                <View style={[
                  styles.streamStatus,
                  { backgroundColor: streamUrl ? Colors.greenDim : Colors.bg3 }
                ]}>
                  <Text style={[
                    styles.streamStatusLabel,
                    { color: streamUrl ? Colors.green : Colors.textMuted }
                  ]}>
                    {streamUrl ? 'SET' : 'EMPTY'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* ── URL Modal ── */}
      <URLModal
        visible={modalOpen !== null}
        botId={modalOpen}
        botName={modalOpen ? botMap[modalOpen]?.name : ''}
        currentUrl={modalOpen ? urls[modalOpen] : ''}
        onSave={(url) => handleSetUrl(modalOpen, url)}
        onCancel={handleCloseModal}
      />
    </SafeAreaView>
  );
}

// ─── FeedPlaceholder ─────────────────────────────────────────────

function FeedPlaceholder({ bot, width, height }) {
  return (
    <View style={[styles.feedPH, { width, height }]}>
      {/* Scanline effect overlay */}
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.scanline, { top: `${i * 17}%` }]} />
      ))}

      <View style={[styles.feedCamIcon, { backgroundColor: bot.color + '18' }]}>
        <Ionicons name="camera-off" size={22} color={Colors.textMuted} />
      </View>
      <Text style={[styles.feedBotName, { color: bot.color }]}>
        {bot.name.toUpperCase()}
      </Text>
      <Text style={styles.feedStatus}>No stream URL set</Text>
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

// ─── URLModal ─────────────────────────────────────────────────────

function URLModal({ visible, botId, botName, currentUrl, onSave, onCancel }) {
  const [inputUrl, setInputUrl] = useState(currentUrl);

  React.useEffect(() => {
    setInputUrl(currentUrl);
  }, [currentUrl, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set Stream URL</Text>
          <Text style={styles.modalSubtitle}>{botName}</Text>

          <TextInput
            style={styles.modalInput}
            placeholder="http://192.168.1.45:8000/video_feed"
            placeholderTextColor={Colors.textMuted}
            value={inputUrl}
            onChangeText={setInputUrl}
            multiline
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnCancel]}
              onPress={onCancel}
            >
              <Text style={[styles.modalBtnText, { color: Colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnSave]}
              onPress={() => onSave(inputUrl.trim() || null)}
            >
              <Text style={[styles.modalBtnText, { color: Colors.bg0 }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  bigFeedContainer: {
    width: width - Spacing.lg * 2,
    height: (width - Spacing.lg * 2) * 0.6,
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
    position: 'relative',
  },
  bigFeedPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg1,
    gap: Spacing.md,
  },
  bigFeedText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  detectionsOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    maxHeight: 40,
  },
  detectionsScroll: {
    flexGrow: 0,
  },
  detectionChip: {
    backgroundColor: Colors.bg0 + 'cc',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginRight: Spacing.xs,
    borderWidth: 0.5,
    borderColor: Colors.cyan,
  },
  detectionLabel: {
    fontSize: Typography.xs,
    color: Colors.cyan,
    fontWeight: Typography.medium,
  },
  bigFeedControls: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  ctrlBtn: {
    flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10,
    backgroundColor: Colors.bg1, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.md,
  },
  ctrlLabel: { fontSize: 10, fontWeight: Typography.medium },

  feedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  feedThumbContainer: {
    position: 'relative',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  feedThumb: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  feedSettingsBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg0 + 'dd',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  feedLiveBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.bg0 + 'cc',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.red,
  },

  feedPH: {
    backgroundColor: Colors.bg1, borderRadius: Radius.md, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 0.5, borderColor: Colors.border, position: 'relative',
  },
  scanline: { position: 'absolute', left: 0, right: 0, height: 0.5, backgroundColor: Colors.border },
  feedCamIcon: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  feedBotName: { fontWeight: Typography.bold, letterSpacing: 0.5, fontSize: 9 },
  feedStatus: { fontSize: 9, color: Colors.textMuted },
  liveDot: { width: 5, height: 5, borderRadius: Radius.full, backgroundColor: Colors.red },
  liveLabel: { fontSize: 8, color: Colors.red, fontWeight: Typography.bold },

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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.bg1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  modalInput: {
    backgroundColor: Colors.bg0,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    minHeight: 60,
    marginBottom: Spacing.lg,
    fontFamily: 'monospace',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 0.5,
  },
  modalBtnCancel: {
    backgroundColor: Colors.bg0,
    borderColor: Colors.border,
  },
  modalBtnSave: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
  },
  modalBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
});
