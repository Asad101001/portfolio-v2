import { useState, useEffect } from 'react';

export function useGitHubCommits() {
  const [latestCommit, setLatestCommit] = useState({
    sha: 'a1b2c3d',
    message: 'feat: portfolio — latest build',
    timeAgo: '',
    status: 'loading'
  });

  useEffect(() => {
    const REPO = 'Asad101001/portfolio-v2';
    const GITHUB_API = `https://api.github.com/repos/${REPO}/commits/main`;

    const fetchCommits = async () => {
      try {
        const resp = await fetch(GITHUB_API, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
        if (!resp.ok) throw new Error('GitHub API ' + resp.status);
        const data = await resp.json();
        const sha = (data.sha || '').slice(0, 7);
        const msg = (data.commit && data.commit.message ? data.commit.message : '').split('\n')[0].slice(0, 52);
        const when = data.commit && data.commit.author ? timeAgo(data.commit.author.date) : '';
        setLatestCommit({
          sha,
          message: msg,
          timeAgo: when,
          status: 'success'
        });
      } catch (e) {
        setLatestCommit(prev => ({ ...prev, status: 'error' }));
      }
    };

    const timeAgo = (dateStr: string) => {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return diff + 's ago';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      return Math.floor(diff / 86400) + 'd ago';
    };

    fetchCommits();
  }, []);

  return latestCommit;
}
