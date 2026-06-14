import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'aegis_stream_urls';

// Initialize with null URLs for all three bots
const DEFAULT_URLS = {
  pathfinder: null,
  guardian: null,
  warden: null,
};

/**
 * Custom React hook to manage per-bot video stream URLs
 * Persists URLs to AsyncStorage and restores them on mount
 * 
 * @returns {Object} { urls, setUrl, loading }
 *   - urls: Object with bot IDs as keys and stream URLs as values
 *   - setUrl: Function to update a bot's URL (botId, url)
 *   - loading: Boolean indicating if URLs are being loaded from storage
 */
export const useStreamUrls = () => {
  const [urls, setUrls] = useState(DEFAULT_URLS);
  const [loading, setLoading] = useState(true);

  // Load URLs from AsyncStorage on mount
  useEffect(() => {
    const loadUrls = async () => {
      try {
        setLoading(true);
        const storedUrls = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (storedUrls) {
          try {
            const parsedUrls = JSON.parse(storedUrls);
            setUrls(parsedUrls);
          } catch (parseError) {
            console.warn('Failed to parse stored URLs, using defaults', parseError);
            setUrls(DEFAULT_URLS);
          }
        } else {
          setUrls(DEFAULT_URLS);
        }
      } catch (error) {
        console.warn('Failed to load URLs from AsyncStorage', error);
        setUrls(DEFAULT_URLS);
      } finally {
        setLoading(false);
      }
    };

    loadUrls();
  }, []);

  /**
   * Update a bot's URL and persist to AsyncStorage
   * 
   * @param {string} botId - The bot identifier (pathfinder, guardian, warden)
   * @param {string|null} url - The stream URL or null to clear
   */
  const setUrl = async (botId, url) => {
    try {
      const updatedUrls = { ...urls, [botId]: url };
      setUrls(updatedUrls);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUrls));
    } catch (error) {
      console.error('Failed to save URL to AsyncStorage', error);
      // Revert the state if save fails
      setUrls(urls);
    }
  };

  return { urls, setUrl, loading };
};

/**
 * Helper function to convert a video feed URL to a detections URL
 * 
 * @param {string} streamUrl - The stream URL ending in "/video_feed"
 * @returns {string} The same URL with "/detections" instead of "/video_feed"
 * 
 * @example
 * detectionsUrlFor("http://192.168.1.45:8000/video_feed")
 * // Returns: "http://192.168.1.45:8000/detections"
 */
export const detectionsUrlFor = (streamUrl) => {
  if (!streamUrl) {
    return null;
  }
  return streamUrl.replace('/video_feed', '/detections');
};
