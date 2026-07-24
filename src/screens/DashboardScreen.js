import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
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
          <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Alerts')} activeOpacity={0.7}>
            {alertCount > 0 && <View style={styles.notificationBadge}><Text style={styles.notificationBadgeText}>{alertCount}</Text></View>}
            <Text style={styles.notificationBtnText}>Notifications</Text>
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

        {/* ── Project Demo Video ── */}
        <View style={styles.section}>
          <SectionLabel 
            action={responsive.isDesktop ? "Watch on YouTube →" : undefined}
            onAction={() => Linking.openURL('https://www.youtube.com/watch?v=Inbc1NvTbIw')}
          >
            Project Demo
          </SectionLabel>
          <ProjectVideo colors={colors} responsive={responsive} />
        </View>

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

// ─── Project Video ───────────────────────────────────────────────

function ProjectVideo({ colors, responsive }) {
  const [showVideo, setShowVideo] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const styles = getVideoStyles(colors, responsive);
  
  const videoId = 'Inbc1NvTbIw';
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const handleOpenYouTube = () => {
    Linking.openURL(youtubeUrl).catch(err => console.error('Failed to open URL:', err));
  };

  if (!showVideo) {
    return (
      <TouchableOpacity style={styles.videoPlaceholder} onPress={() => setShowVideo(true)} activeOpacity={0.8}>
        <View style={styles.playIconContainer}>
          <Ionicons name="play-circle" size={80} color={colors.cyan} />
        </View>
        <Text style={styles.videoPlaceholderTitle}>A.E.G.I.S. Project Demo</Text>
        <Text style={styles.videoPlaceholderSub}>Autonomous Emergency Guardian & Intervention Swarm</Text>
        <View style={styles.videoStats}>
          <View style={styles.videoStatItem}>
            <Ionicons name="hardware-chip" size={16} color={colors.green} />
            <Text style={styles.videoStatText}>3 Bot Swarm</Text>
          </View>
          <View style={styles.videoStatItem}>
            <Ionicons name="videocam" size={16} color={colors.cyan} />
            <Text style={styles.videoStatText}>Live Demo</Text>
          </View>
        </View>
        <Text style={styles.videoTapToWatch}>Tap to watch video</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.videoContainer}>
      {/* Video Header */}
      <View style={styles.videoHeader}>
        <View style={styles.videoHeaderLeft}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>DEMO</Text>
          </View>
          <Text style={styles.videoTitle}>Project Showcase</Text>
        </View>
        <TouchableOpacity onPress={() => setShowVideo(false)} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <View style={styles.videoPlayerWrapper}>
        {Platform.OS === 'web' ? (
          <iframe
            src={embedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#000',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title="AEGIS Project Demo Video"
          />
        ) : (
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />
        )}
      </View>

      {/* Video Footer */}
      <View style={styles.videoFooter}>
        <View style={styles.videoInfo}>
          <Ionicons name="information-circle" size={18} color={colors.cyan} />
          <Text style={styles.videoInfoText}>
            Watch the A.E.G.I.S. robot swarm navigate, detect, and respond autonomously
          </Text>
        </View>
        <TouchableOpacity style={styles.youtubeBtn} onPress={handleOpenYouTube} activeOpacity={0.7}>
          <Ionicons name="logo-youtube" size={20} color="#FF0000" />
          <Text style={styles.youtubeBtnText}>Watch on YouTube</Text>
          <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getVideoStyles = (colors, responsive) => {
  const typo = getResponsiveTypography(responsive.deviceType);
  const space = getResponsiveSpacing(responsive.deviceType);
  
  // Better aspect ratio for video (16:9)
  const videoHeight = responsive.isDesktop ? 540 : responsive.isTablet ? 432 : 220;

  return StyleSheet.create({
    videoContainer: {
      backgroundColor: colors.bg1,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: Radius.lg,
      overflow: 'hidden',
      ...Platform.select({
        web: {
          boxShadow: `0 4px 20px ${colors.bg0}80`,
        },
        default: {
          shadowColor: colors.bg0,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
      }),
    },
    
    videoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: space.md,
      backgroundColor: colors.bg2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    videoHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      flex: 1,
    },
    liveIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.cyanFaint,
      paddingHorizontal: space.sm,
      paddingVertical: 4,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.cyanDim,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.cyan,
    },
    liveText: {
      fontSize: typo.xs,
      fontWeight: Typography.bold,
      color: colors.cyan,
      letterSpacing: 0.5,
    },
    videoTitle: {
      fontSize: typo.sm,
      fontWeight: Typography.medium,
      color: colors.textPrimary,
    },
    closeBtn: {
      padding: space.xs,
      borderRadius: Radius.md,
      backgroundColor: colors.bg1,
    },

    videoPlayerWrapper: {
      height: videoHeight,
      backgroundColor: '#000',
      position: 'relative',
    },
    webview: {
      flex: 1,
      backgroundColor: '#000',
    },

    videoFooter: {
      padding: space.md,
      backgroundColor: colors.bg2,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: space.md,
    },
    videoInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space.sm,
      paddingVertical: space.xs,
    },
    videoInfoText: {
      flex: 1,
      fontSize: typo.xs,
      color: colors.textSecondary,
      lineHeight: typo.xs * 1.5,
    },
    youtubeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
      paddingVertical: space.md,
      paddingHorizontal: space.lg,
      backgroundColor: colors.bg1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
    },
    youtubeBtnText: {
      fontSize: typo.sm,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },

    // Placeholder styles
    videoPlaceholder: {
      height: videoHeight,
      backgroundColor: colors.bg1,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.md,
      padding: space.xl,
      ...Platform.select({
        web: {
          boxShadow: `0 4px 20px ${colors.bg0}80`,
        },
        default: {
          shadowColor: colors.bg0,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
      }),
    },
    playIconContainer: {
      width: responsive.isDesktop ? 100 : 80,
      height: responsive.isDesktop ? 100 : 80,
      borderRadius: responsive.isDesktop ? 50 : 40,
      backgroundColor: colors.cyanFaint,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.cyan,
    },
    videoPlaceholderTitle: {
      fontSize: responsive.isDesktop ? typo.xl : typo.lg,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginTop: space.sm,
    },
    videoPlaceholderSub: {
      fontSize: typo.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: responsive.isDesktop ? 400 : 280,
    },
    videoStats: {
      flexDirection: 'row',
      gap: space.lg,
      marginTop: space.sm,
    },
    videoStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      paddingHorizontal: space.md,
      paddingVertical: space.xs,
      backgroundColor: colors.bg2,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    videoStatText: {
      fontSize: typo.xs,
      fontWeight: Typography.medium,
      color: colors.textSecondary,
    },
    videoTapToWatch: {
      fontSize: typo.xs,
      color: colors.cyan,
      textAlign: 'center',
      marginTop: space.md,
      fontWeight: Typography.bold,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
  });
};

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
    notificationBtn: { 
      paddingHorizontal: space.md,
      paddingVertical: space.sm,
      backgroundColor: colors.bg1,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },
    notificationBtnText: {
      fontSize: typo.sm,
      fontWeight: Typography.medium,
      color: colors.textPrimary,
    },
    notificationBadge: {
      position: 'absolute', 
      top: -6, 
      right: -6,
      backgroundColor: colors.amber, 
      borderRadius: Radius.full,
      minWidth: 18, 
      height: 18, 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingHorizontal: 5,
      zIndex: 1,
      borderWidth: 2,
      borderColor: colors.bg0,
    },
    notificationBadgeText: { 
      fontSize: 10, 
      color: '#000', 
      fontWeight: Typography.bold 
    },

    section: { paddingHorizontal: space.lg, paddingTop: space.xl },

    statRow: { 
      flexDirection: responsive.isSmallDevice ? 'column' : 'row', 
      gap: space.sm,
      width: '100%',
    },
    statCard: {
      flex: responsive.isSmallDevice ? undefined : 1,
      width: responsive.isSmallDevice ? '100%' : undefined,
      minWidth: responsive.isSmallDevice ? undefined : 0,
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
