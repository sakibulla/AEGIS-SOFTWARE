import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Typography, Spacing, Radius, Shadows, getResponsiveTypography, getResponsiveSpacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { VIDEO_FEEDS, BOTS } from '../constants/mockData';
import { useStreamUrls } from '../hooks/useStreamUrls';
import { useResponsive } from '../utils/responsive';

export default function FeedsScreen() {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const { urls, setUrl, loading: urlsLoading, detectionsUrlFor } = useStreamUrls();
  const [expandedBot, setExpandedBot] = useState(null);
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [detections, setDetections] = useState({});
  const [detectionLoading, setDetectionLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const styles = getStyles(colors, responsive);

  // Poll detections every 1s when a feed is expanded
  useEffect(() => {
    if (!expandedBot) return;

    const streamUrl = urls[expandedBot];
    if (!streamUrl) return;

    const pollDetections = async () => {
      try {
        setDetectionLoading(prev => ({ ...prev, [expandedBot]: true }));
        const detUrl = detectionsUrlFor(streamUrl);
        const response = await fetch(detUrl, { timeout: 5000 });
        const data = await response.json();
        setDetections(prev => ({ ...prev, [expandedBot]: data.detections || [] }));
      } catch (error) {
        console.warn(`Error polling detections for ${expandedBot}:`, error);
      } finally {
        setDetectionLoading(prev => ({ ...prev, [expandedBot]: false }));
      }
    };

    pollDetections();
    const interval = setInterval(pollDetections, 1000);
    return () => clearInterval(interval);
  }, [expandedBot, urls]);

  const handleSetUrl = async (botId) => {
    try {
      await setUrl(botId, tempUrl);
      setUrlModalVisible(false);
      setTempUrl('');
    } catch (error) {
      alert('Error saving URL. Please try again.');
    }
  };

  const openUrlModal = (botId) => {
    setTempUrl(urls[botId] || '');
    setExpandedBot(botId);
    setUrlModalVisible(true);
  };

  const getBotInfo = (botId) => {
    return BOTS.find(bot => bot.id === botId);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const renderFeedCard = (feed) => {
    if (!feed || !feed.botId) return null;
    
    const botInfo = getBotInfo(feed.botId);
    const streamUrl = urls[feed.botId];
    const isExpanded = expandedBot === feed.botId;

    return (
      <View
        key={feed.id}
        style={[
          styles.feedCard,
          isExpanded && styles.feedCardExpanded,
        ]}
      >
        {/* Card Header */}
        <TouchableOpacity
          style={styles.feedHeader}
          onPress={() => setExpandedBot(isExpanded ? null : feed.botId)}
          activeOpacity={0.7}
        >
          <View style={styles.feedHeaderLeft}>
            <Text style={styles.feedName}>{feed.label}</Text>
            {streamUrl ? (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>● LIVE</Text>
              </View>
            ) : (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineBadgeText}>○ NO STREAM</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => openUrlModal(feed.botId)}
            activeOpacity={0.6}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Feed Content */}
        {streamUrl ? (
          <View style={styles.feedContent}>
            <Image
              source={{ uri: streamUrl }}
              style={styles.feedImage}
              onError={() => console.warn(`Failed to load stream: ${streamUrl}`)}
            />
          </View>
        ) : (
          <View style={styles.placeholderFeed}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>No stream URL set</Text>
            <Text style={styles.placeholderSubtext}>Tap ⚙ to add URL</Text>
          </View>
        )}

        {/* Expanded Controls & Detections */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Control Buttons */}
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setExpandedBot(null)}
              >
                <Text style={styles.controlButtonText}>Collapse</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => openUrlModal(feed.botId)}
              >
                <Text style={styles.controlButtonText}>Set URL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => onRefresh()}
              >
                <Text style={styles.controlButtonText}>Reload</Text>
              </TouchableOpacity>
            </View>

            {/* Detections */}
            {streamUrl && (
              <View style={styles.detectionsSection}>
                <Text style={styles.detectionsTitle}>Real-time Detections</Text>
                {detectionLoading[feed.botId] ? (
                  <ActivityIndicator color={colors.cyan} size="small" />
                ) : (detections[feed.botId] || []).length > 0 ? (
                  <View style={styles.detectionChips}>
                    {detections[feed.botId].map((det, idx) => (
                      <View key={idx} style={styles.detectionChip}>
                        <Text style={styles.detectionLabel}>
                          {det.label} {(det.confidence * 100).toFixed(0)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noDetectionsText}>No objects detected</Text>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderStreamStatusList = () => {
    return (
      <View style={styles.statusSection}>
        <Text style={styles.statusTitle}>Stream Status</Text>
        {VIDEO_FEEDS && VIDEO_FEEDS.length > 0 ? (
          VIDEO_FEEDS.map((feed) => {
            if (!feed) return null;
            const streamUrl = urls[feed.botId];
            return (
              <View key={feed.id} style={styles.statusItem}>
                <Text style={styles.statusLabel}>{feed.label}</Text>
                <Text style={styles.statusUrl}>
                  {streamUrl || 'Tap to set URL'}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    streamUrl ? styles.setBadge : styles.emptyBadge,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {streamUrl ? 'SET' : 'EMPTY'}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.statusLabel}>No feeds available</Text>
        )}
      </View>
    );
  };

  const renderInfoCard = () => {
    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📺 Stream Setup</Text>
        <Text style={styles.infoText}>
          Each robot runs a vision server. To connect:
        </Text>
        <Text style={styles.infoStep}>
          1. Start the server on each robot (see docs)
        </Text>
        <Text style={styles.infoStep}>
          2. Note the IP and port (e.g., 192.168.1.100:8000)
        </Text>
        <Text style={styles.infoStep}>
          3. Tap ⚙ and paste the /video_feed URL
        </Text>
        <Text style={styles.infoStep}>
          4. URLs persist automatically
        </Text>
      </View>
    );
  };

  if (urlsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.cyan} size="large" />
        <Text style={styles.loadingText}>Loading streams...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.cyan}
        />
      }
    >
      {/* Feed Cards */}
      {VIDEO_FEEDS.map((feed) => renderFeedCard(feed))}

      {/* Stream Status List */}
      {renderStreamStatusList()}

      {/* Info Card */}
      {renderInfoCard()}

      {/* URL Modal */}
      <Modal
        visible={urlModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUrlModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Stream URL</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="http://192.168.1.100:8000/video_feed"
              placeholderTextColor={colors.textMuted}
              value={tempUrl}
              onChangeText={setTempUrl}
              editable={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setUrlModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => handleSetUrl(expandedBot)}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (colors, responsive) => {
  const typo = getResponsiveTypography(responsive.deviceType);
  const space = getResponsiveSpacing(responsive.deviceType);
  
  // Feed height based on device
  const feedHeight = responsive.isDesktop ? 400 : responsive.isTablet ? 320 : 250;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg0,
      paddingHorizontal: space.md,
      paddingVertical: space.md,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.bg0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: space.md,
      fontSize: typo.base,
    },

    // Feed Cards
    feedCard: {
      backgroundColor: colors.bg1,
      borderRadius: Radius.md,
      marginBottom: space.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadows.card,
      maxWidth: responsive.isDesktop ? 900 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    feedCardExpanded: {
      borderColor: colors.cyan,
      borderWidth: 2,
    },
    feedHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: space.md,
      paddingVertical: space.md,
      backgroundColor: colors.bg2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    feedHeaderLeft: {
      flexDirection: responsive.isSmallDevice ? 'column' : 'row',
      alignItems: responsive.isSmallDevice ? 'flex-start' : 'center',
      gap: space.md,
    },
    feedName: {
      fontSize: typo.md,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
    liveBadge: {
      backgroundColor: colors.greenDim,
      paddingHorizontal: space.sm,
      paddingVertical: space.xs,
      borderRadius: Radius.sm,
    },
    liveBadgeText: {
      fontSize: typo.xs,
      color: colors.green,
      fontWeight: Typography.bold,
    },
    offlineBadge: {
      backgroundColor: colors.redDim,
      paddingHorizontal: space.sm,
      paddingVertical: space.xs,
      borderRadius: Radius.sm,
    },
    offlineBadgeText: {
      fontSize: typo.xs,
      color: colors.red,
      fontWeight: Typography.bold,
    },
    settingsButton: {
      padding: space.sm,
    },
    settingsIcon: {
      fontSize: typo.lg,
    },

    // Feed Content
    feedContent: {
      height: feedHeight,
      backgroundColor: '#000',
      overflow: 'hidden',
    },
    feedImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    loadingOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.bg2,
    },
    placeholderFeed: {
      height: feedHeight,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.bg2,
    },
    placeholderIcon: {
      fontSize: responsive.isDesktop ? 64 : 48,
      marginBottom: space.md,
    },
    placeholderText: {
      fontSize: typo.md,
      color: colors.textSecondary,
      marginBottom: space.xs,
    },
    placeholderSubtext: {
      fontSize: typo.sm,
      color: colors.textMuted,
    },

    // Expanded Section
    expandedSection: {
      paddingHorizontal: space.md,
      paddingVertical: space.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.bg1,
    },
    controlButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: space.md,
      flexWrap: 'wrap',
      gap: space.sm,
    },
    controlButton: {
      paddingHorizontal: space.md,
      paddingVertical: space.sm,
      backgroundColor: colors.bg2,
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: colors.cyan,
    },
    controlButtonText: {
      fontSize: typo.sm,
      color: colors.cyan,
      fontWeight: Typography.bold,
    },

    // Detections
    detectionsSection: {
      marginTop: space.md,
    },
    detectionsTitle: {
      fontSize: typo.sm,
      fontWeight: Typography.bold,
      color: colors.textSecondary,
      marginBottom: space.sm,
    },
    detectionChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space.sm,
    },
    detectionChip: {
      backgroundColor: colors.bg2,
      borderRadius: Radius.md,
      paddingHorizontal: space.md,
      paddingVertical: space.xs,
      borderWidth: 1,
      borderColor: colors.cyan,
    },
    detectionLabel: {
      fontSize: typo.xs,
      color: colors.cyan,
      fontWeight: Typography.medium,
    },
    noDetectionsText: {
      fontSize: typo.sm,
      color: colors.textMuted,
    },

    // Status Section
    statusSection: {
      marginVertical: space.lg,
      paddingHorizontal: space.md,
      maxWidth: responsive.isDesktop ? 900 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    statusTitle: {
      fontSize: typo.md,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      marginBottom: space.md,
    },
    statusItem: {
      backgroundColor: colors.bg1,
      borderRadius: Radius.md,
      padding: space.md,
      marginBottom: space.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusLabel: {
      fontSize: typo.sm,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      marginBottom: space.xs,
    },
    statusUrl: {
      fontSize: typo.xs,
      color: colors.textMuted,
      marginBottom: space.sm,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: space.md,
      paddingVertical: space.xs,
      borderRadius: Radius.sm,
    },
    setBadge: {
      backgroundColor: colors.greenDim,
    },
    emptyBadge: {
      backgroundColor: colors.amberDim,
    },
    statusBadgeText: {
      fontSize: typo.xs,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },

    // Info Card
    infoCard: {
      backgroundColor: colors.bg2,
      borderRadius: Radius.md,
      padding: space.md,
      marginVertical: space.lg,
      borderLeftWidth: 4,
      borderLeftColor: colors.cyan,
      maxWidth: responsive.isDesktop ? 900 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    infoTitle: {
      fontSize: typo.md,
      fontWeight: Typography.bold,
      color: colors.cyan,
      marginBottom: space.sm,
    },
    infoText: {
      fontSize: typo.sm,
      color: colors.textSecondary,
      marginBottom: space.md,
    },
    infoStep: {
      fontSize: typo.xs,
      color: colors.textMuted,
      marginBottom: space.xs,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: space.md,
    },
    modalContent: {
      backgroundColor: colors.bg1,
      borderRadius: Radius.lg,
      padding: space.lg,
      width: responsive.isDesktop ? 500 : responsive.isTablet ? 400 : '100%',
      maxWidth: '90%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: typo.md,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      marginBottom: space.md,
    },
    modalInput: {
      backgroundColor: colors.bg3,
      borderRadius: Radius.sm,
      paddingHorizontal: space.md,
      paddingVertical: space.md,
      fontSize: typo.sm,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: space.lg,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: space.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: space.md,
      borderRadius: Radius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButton: {
      backgroundColor: colors.bg2,
    },
    saveButton: {
      backgroundColor: colors.cyanFaint,
      borderColor: colors.cyan,
    },
    modalButtonText: {
      fontSize: typo.sm,
      fontWeight: Typography.bold,
      color: colors.textSecondary,
    },
    saveButtonText: {
      color: colors.cyan,
    },
  });
};
