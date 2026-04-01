import { useState, useEffect } from 'react';

const CONFIG = {
  usernames: {
    lastfm: 'Asad991',
  },
  apiKey: 'eccfb681fcf620a63fcb300d526544ba',
};

export function useLastFm() {
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${CONFIG.usernames.lastfm}&api_key=${CONFIG.apiKey}&format=json&limit=4`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.recenttracks && data.recenttracks.track) {
          setRecentTracks(Array.isArray(data.recenttracks.track) ? data.recenttracks.track : [data.recenttracks.track]);
        }
      } catch (e) {
        console.warn('[Last.fm] Recent tracks error', e);
      }
    };

    const fetchTopArtists = async () => {
      try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${CONFIG.usernames.lastfm}&api_key=${CONFIG.apiKey}&format=json&period=7day&limit=3`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.topartists && data.topartists.artist) {
          setTopArtists(Array.isArray(data.topartists.artist) ? data.topartists.artist : [data.topartists.artist]);
        }
      } catch (e) {
        console.warn('[Last.fm] Top artists error', e);
      }
    };

    const load = async () => {
      setLoading(true);
      await Promise.allSettled([fetchRecent(), fetchTopArtists()]);
      setLoading(false);
    };

    load();
    const interval = setInterval(fetchRecent, 60000); // Update recent every minute
    return () => clearInterval(interval);
  }, []);

  return { recentTracks, topArtists, loading };
}
