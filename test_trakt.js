import handler from './api/current-show.js';

const req = { query: {} };
const res = {
  setHeader: () => {},
  status: (code) => ({
    json: (data) => {
      console.log('Status:', code);
      console.log('Data:', JSON.stringify(data, null, 2));
    }
  })
};

// We don't have process.env.TRAKT_CLIENT_ID locally unless we set it.
// Let's just run it to see what happens.
handler(req, res).catch(console.error);
