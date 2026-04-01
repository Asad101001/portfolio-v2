import { useState, useEffect } from 'react';

interface ActivityItem {
  label: string;
  value: string;
  img?: string;
  progress?: number;
  status?: string;
  stars?: string;
  sha?: string;
}

const CONFIG = {
  usernames: {
    letterboxd: 'asad_k',
    lastfm: 'Asad991',
    github: 'Asad101001',
  },
  repo: 'Asad101001/portfolio-v2',
  currently: {
    reading: '1984 George Orwell',
    series: ['Severance', 'Succession', 'Better Call Saul', 'The Boys', 'Invincible', 'Shrinking']
  }
};

export function useActivityHub() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    { label: 'Now Playing', value: 'Loading Last.fm...' },
    { label: 'Latest Commit', value: 'Fetching GitHub...' },
    { label: 'Watching', value: 'Syncing TVmaze...' },
    { label: 'Coding Clock', value: 'Checking PKT...' }
  ]);

  const updateActivity = (index: number, patch: Partial<ActivityItem>) => {
    setActivities(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  useEffect(() => {
    // 1. Fetch Music (Last.fm)
    const fetchMusic = async () => {
      try {
        const apiKey = 'eccfb681fcf620a63fcb300d526544ba';
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${CONFIG.usernames.lastfm}&api_key=${apiKey}&format=json&limit=1`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.recenttracks?.track?.[0]) {
          const track = data.recenttracks.track[0];
          const isNowPlaying = track['@attr']?.nowplaying === 'true';
          updateActivity(0, { 
            value: `${track.name} — ${track.artist['#text']}`,
            status: isNowPlaying ? 'Now Playing 🎧' : 'Last Played',
            img: track.image?.[2]?.['#text']
          });
        }
      } catch (e) {
        updateActivity(0, { value: 'Music offline' });
      }
    };

    // 2. Fetch GitHub (Latest Commit)
    const fetchGitHub = async () => {
      try {
        const resp = await fetch(`https://api.github.com/repos/${CONFIG.repo}/commits/main`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        const data = await resp.json();
        if (data.sha) {
          updateActivity(1, { 
            value: data.commit.message.split('\n')[0],
            sha: data.sha.slice(0, 7),
            status: 'Verified Deployment'
          });
        }
      } catch (e) {
        updateActivity(1, { value: 'Protocol offline' });
      }
    };

    // 3. Fetch TV (TVmaze)
    const fetchTV = async () => {
      const pick = CONFIG.currently.series[Math.floor(Math.random() * CONFIG.currently.series.length)];
      try {
        const resp = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(pick)}`);
        const data = await resp.json();
        if (data) {
          updateActivity(2, { 
            value: data.name, 
            status: 'Currently Consuming',
            img: data.image?.medium
          });
        }
      } catch (e) {
        updateActivity(2, { value: pick });
      }
    };

    // 4. Clock
    const updateClock = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const pkt = new Date(utc + 5 * 3600000);
      const h = pkt.getHours();
      const timeStr = pkt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      const status = (h >= 2 && h < 10) ? 'Likely Dormant 🌙' : 'Fully Operational ⚡';
      updateActivity(3, { value: `${timeStr} PKT`, status });
    };

    fetchMusic();
    fetchGitHub();
    fetchTV();
    updateClock();
    const interval = setInterval(() => {
        fetchMusic();
        updateClock();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return activities;
}
