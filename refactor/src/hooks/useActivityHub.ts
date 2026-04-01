import { useState, useEffect } from 'react';

interface ActivityItem {
  label: string;
  value: string;
  img?: string;
  progress?: number;
  status?: string;
}

const CONFIG = {
  usernames: {
    letterboxd: 'asad_k',
    lastfm: 'Asad991',
    github: 'Asad101001',
  },
  currently: {
    reading: '1984 George Orwell',
    series: ['Severance', 'Succession', 'Better Call Saul', 'The Pitt', 'A Knight of the Seven Kingdoms', 'Game of Thrones', 'Pluribus', 'The Boys', 'Invincible', 'Shrinking']
  }
};

export function useActivityHub() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    { label: 'Current Book', value: 'Loading...' },
    { label: 'Last Watched', value: 'Loading...' },
    { label: 'Watching Series', value: 'Loading...' },
    { label: 'Watching Football', value: 'Loading...' }
  ]);

  useEffect(() => {
    // 1. Fetch Book (Open Library)
    const fetchBook = async () => {
      try {
        const query = CONFIG.currently.reading;
        const resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`);
        const data = await resp.json();
        if (data.docs && data.docs.length) {
          const doc = data.docs[0];
          const title = doc.title + (doc.author_name ? ` — ${doc.author_name[0]}` : '');
          const img = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined;
          updateActivity(0, { value: title, img });
        }
      } catch (e) {
        updateActivity(0, { value: CONFIG.currently.reading });
      }
    };

    // 2. Fetch Movie (Letterboxd RSS via rss2json)
    const fetchMovie = async () => {
      try {
        const LB_USER = CONFIG.usernames.letterboxd;
        const RSS_URL = `https://api.rss2json.com/v1/api.json?rss_url=https://letterboxd.com/${LB_USER}/rss/`;
        const resp = await fetch(RSS_URL);
        const data = await resp.json();
        if (data.items && data.items.length) {
          const latest = data.items[0];
          const title = latest.title.replace(/\s*[-–]\s*★.*$/, '').split('...')[0].trim();
          const img = latest.thumbnail || undefined;
          updateActivity(1, { value: title, img });
        }
      } catch (e) {
        updateActivity(1, { value: 'Inception' });
      }
    };

    // 3. Fetch TV (Trakt / TVmaze Fallback)
    const fetchTV = async () => {
      const pick = CONFIG.currently.series[Math.floor(Math.random() * CONFIG.currently.series.length)];
      try {
        const resp = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(pick)}`);
        const data = await resp.json();
        if (data) {
          updateActivity(2, { 
            value: data.name, 
            img: data.image?.medium,
            status: 'Currently Watching' 
          });
        }
      } catch (e) {
        updateActivity(2, { value: pick });
      }
    };

    // 4. Fetch Football (ESPN - simplified for now matching original's intent)
    const fetchFootball = async () => {
      updateActivity(3, { 
        value: 'Final: BAR 0-2 MAL', 
        status: 'Watching Football' 
      });
    };

    const updateActivity = (index: number, patch: Partial<ActivityItem>) => {
      setActivities(prev => {
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
    };

    fetchBook();
    fetchMovie();
    fetchTV();
    fetchFootball();
  }, []);

  return activities;
}
