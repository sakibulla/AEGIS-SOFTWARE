import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'aegis_stream_urls';

/**
 * Custom hook for managing stream URLs for each bot
 * Persists URLs to AsyncStorage
 */
export const useStreamUrls = () => {
  const [urls, setUrlsState] = useState({});
  const [loading, setLoading] = useState(true);

  // Load URLs from AsyncStorage on mount
  useEffect(() => {
    const loadUrls = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUrlsState(JSON.parse(stored));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading stream URLs:', error);
        setLoading(false);
      }
    };
    loadUrls();
  }, []);

  /**
   * Set URL for a specific bot and persist to AsyncStorage
   * @param {string} botId - Bot identifier (e.g., 'pathfinder', 'guardian', 'warden')
   * @param {string} url - Stream URL (e.g., 'http://192.168.1.100:8000/video_feed')
   */
  const setUrl = async (botId, url) => {
    try {
      const updated = { ...urls, [botId]: url };
      setUrlsState(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error(`Error setting URL for ${botId}:`, error);
      throw error;
    }
  };

  /**
   * Helper: Convert video_feed URL to detections URL
   * Converts: http://192.168.1.100:8000/video_feed
   * To: http://192.168.1.100:8000/detections
   * @param {string} streamUrl - The stream URL
   * @returns {string} The detections endpoint URL
   */
  const detectionsUrlFor = (streamUrl) => {
    if (!streamUrl) return null;
    return streamUrl.replace('/video_feed', '/detections');
  };

  return {
    urls,
    setUrl,
    loading,
    detectionsUrlFor,
  };
};
