const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><div id="lastfm-tracks"></div>`);
const document = dom.window.document;
global.document = document;

var container = document.getElementById('lastfm-tracks');
function timeAgo(ts) {
  if (!ts) return '';
  var diff = Math.floor(Date.now() / 1000) - parseInt(ts, 10);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return Math.floor(diff / 60)  + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 86400 * 10) return Math.floor(diff / 86400) + 'd ago';
  if (diff < 86400 * 30) return Math.floor(diff / (86400 * 7)) + 'w ago';
  return Math.floor(diff / (86400 * 30)) + 'mo ago';
}
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function _artistImage(name) {
  return Promise.resolve('data:image/svg...');
}

function render(tracks) {
  container.innerHTML = '';
  tracks.forEach(function(t) {
    var nowPlaying = t['@attr'] && t['@attr'].nowplaying === 'true';
    var art = '';
    if (t.image) {
      for (var si = t.image.length - 1; si >= 0; si--) {
        if (t.image[si]['#text'] && t.image[si]['#text'].indexOf('2a96cbd8b46e442fc41c2b86b821562f') === -1) {
          art = t.image[si]['#text']; break;
        }
      }
    }
    var ts = t.date && t.date.uts ? t.date.uts : null;
    var a  = document.createElement('a');
    a.className = 'lastfm-track'; a.href = t.url || '#'; a.target = '_blank'; a.rel = 'noopener noreferrer';
    
    var imgContainer = document.createElement('div');
    imgContainer.className = 'lastfm-track-art-wrap';
    
    if (art) {
      imgContainer.innerHTML = '<img class="lastfm-track-art" src="' + art + '" alt="" crossorigin="anonymous" loading="lazy" decoding="async" fetchpriority="low" />';
    } else {
      imgContainer.innerHTML = '<div class="lastfm-track-art lastfm-track-art--placeholder">🎵</div>';
      _artistImage(t.artist && t.artist['#text'] ? t.artist['#text'] : '').then(function(u) {
          var img = document.createElement('img');
          img.className = 'lastfm-track-art';
          img.src = u;
          imgContainer.innerHTML = '';
          imgContainer.appendChild(img);
      }).catch(function(){});
    }

    var timeHTML = nowPlaying
      ? '<span class="lastfm-now-playing"><span class="lastfm-eq"><span></span><span></span><span></span><span></span></span>&nbsp;now</span>'
      : '<span class="lastfm-track-time">' + timeAgo(ts) + '</span>';
    
    a.appendChild(imgContainer);
    var info = document.createElement('div');
    info.className = 'lastfm-track-info';
    info.innerHTML = '<div class="lastfm-track-name">' + escHtml(t.name || '') + '</div>' +
        '<div class="lastfm-track-artist">' + escHtml(t.artist && t.artist['#text'] ? t.artist['#text'] : '') + '</div>';
    a.appendChild(info);
    a.insertAdjacentHTML('beforeend', timeHTML);

    container.appendChild(a);
  });
}

const data = {"recenttracks":{"track":[{"artist":{"mbid":"94d863a4-b7e5-4db5-a62d-54bc014dab39","#text":"Taha G"},"streamable":"0","image":[{"size":"small","#text":"https:\/\/lastfm.freetls.fastly.net\/i\/u\/34s\/9f7e4a636e11a979044f6170c352c2df.jpg"},{"size":"medium","#text":"https:\/\/lastfm.freetls.fastly.net\/i\/u\/64s\/9f7e4a636e11a979044f6170c352c2df.jpg"},{"size":"large","#text":"https:\/\/lastfm.freetls.fastly.net\/i\/u\/174s\/9f7e4a636e11a979044f6170c352c2df.jpg"},{"size":"extralarge","#text":"https:\/\/lastfm.freetls.fastly.net\/i\/u\/300x300\/9f7e4a636e11a979044f6170c352c2df.jpg"}],"mbid":"","album":{"mbid":"","#text":"Dil Kay Isharay"},"name":"Dil Kay Isharay","url":"https:\/\/www.last.fm\/music\/Taha+G\/_\/Dil+Kay+Isharay","date":{"uts":"1785054455","#text":"26 Jul 2026, 08:27"}},{"artist":{"mbid":"","#text":"Taha G"},"streamable":"0","image":[{"size":"small","#text":"https:\/\/lastfm.freetls.fastly.net\/i\/u\/34s\/2a96cbd8b46e442fc41c2b86b821562f.png"}],"mbid":"","album":{"mbid":"7cf45b0b-0156-4585-88a6-e11048bb0262","#text":"Bonafide"},"name":"Bonafide","url":"https:\/\/www.last.fm\/music\/Taha+G\/_\/Bonafide","date":{"uts":"1785054263","#text":"26 Jul 2026, 08:24"}}],"@attr":{"user":"Asad991","totalPages":"3755","page":"1","total":"15020","perPage":"4"}}};

try {
  render(data.recenttracks.track);
  console.log("Rendered correctly!");
  console.log(container.innerHTML.substring(0, 500));
} catch(e) {
  console.error("Render error:", e);
}
