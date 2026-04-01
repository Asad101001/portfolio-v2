import { useState, useEffect } from 'react';

interface SocialDataItem {
  title: string;
  subtitle?: string;
  img?: string;
  stars?: string;
  type: 'movie' | 'tv' | 'music' | 'football';
  data?: any;
}

const CONFIG = {
  usernames: {
    letterboxd: 'asad_k',
    lastfm: 'Asad991',
  },
  currently: {
    series: ['Severance', 'Succession', 'Better Call Saul', 'The Boys', 'Invincible', 'Shrinking'],
    players: [
      { name: 'Lamine Yamal', club: 'FC Barcelona', img: 'https://img.resfu.com/players/lamine-yamal_226727.png' },
      { name: 'Pedri', club: 'FC Barcelona', img: 'https://img.resfu.com/players/pedri_107936.png' },
      { name: 'Nuno Mendes', club: 'PSG', img: 'https://img.resfu.com/players/nuno-mendes_162386.png' }
    ]
  }
};

export function useSocialData() {
  const [movie, setMovie] = useState<SocialDataItem>({ title: 'Dune: Part Two', stars: '★★★★★', type: 'movie' });
  const [tv, setTv] = useState<SocialDataItem>({ title: CONFIG.currently.series[0], subtitle: 'Currently Watching', type: 'tv' });
  const [track, setTrack] = useState<SocialDataItem>({ title: 'Loading...', type: 'music' });
  const [players] = useState<SocialDataItem>({ title: 'Barca & PSG core', type: 'football', data: CONFIG.currently.players });

  useEffect(() => {
    // Letterboxd via RSS
    const fetchMovie = async () => {
      try {
        const RSS_URL = `https://api.rss2json.com/v1/api.json?rss_url=https://letterboxd.com/${CONFIG.usernames.letterboxd}/rss/`;
        const resp = await fetch(RSS_URL);
        const data = await resp.json();
        if (data.items?.length) {
          const latest = data.items[0];
          const rawTitle = latest.title;
          const starsStr = rawTitle.match(/\s*[-–]\s*(★+½?)\s*$/)?.[1] || '';
          setMovie({
            title: rawTitle.replace(/\s*[-–]\s*★.*$/, '').split('...')[0].trim(),
            stars: starsStr,
            img: latest.thumbnail,
            type: 'movie'
          });
        }
      } catch (e) {
        console.warn('[Social] Movie fetch failed');
      }
    };

    // TVmaze for a random series from watchlist
    const fetchTV = async () => {
      const pick = CONFIG.currently.series[Math.floor(Math.random() * CONFIG.currently.series.length)];
      try {
        const resp = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(pick)}`);
        const data = await resp.json();
        if (data) {
          setTv({ 
            title: data.name, 
            subtitle: 'Stream queue updated',
            img: data.image?.medium,
            type: 'tv'
          });
        }
      } catch (e) {
        setTv({ title: pick, subtitle: 'Watchlist stream', type: 'tv' });
      }
    };

    // Last.fm for current track
    const fetchTrack = async () => {
      try {
        const apiKey = 'eccfb681fcf620a63fcb300d526544ba';
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${CONFIG.usernames.lastfm}&api_key=${apiKey}&format=json&limit=1`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.recenttracks?.track?.[0]) {
          const track = data.recenttracks.track[0];
          setTrack({
            title: track.name,
            subtitle: track.artist['#text'],
            img: track.image?.[2]?.['#text'],
            type: 'music'
          });
        }
      } catch (e) {
        setTrack({ title: 'Offline Session', subtitle: 'Analog focus', type: 'music' });
      }
    };

    fetchMovie();
    fetchTV();
    fetchTrack();
  }, []);

  return { movie, tv, track, players };
}
