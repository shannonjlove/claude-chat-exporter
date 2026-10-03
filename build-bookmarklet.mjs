// Builds the claude-chat-exporter bookmarklet URL, replicating docs/index.html assembly exactly.
import { readFileSync, writeFileSync } from 'fs';

const core = readFileSync(new URL('./claude-chat-exporter.js', import.meta.url), 'utf8');

// djb2 — must stay byte-identical to the page's hash() and the shim's h().
function hash(s) { var h = 5381, i = s.length; while (i) h = (h * 33) ^ s.charCodeAt(--i); return (h >>> 0).toString(16); }

const RAW  = "https://raw.githubusercontent.com/agarwalvishal/claude-chat-exporter/main/claude-chat-exporter.js";
const PAGE = "https://agarwalvishal.github.io/claude-chat-exporter/";

const SHIM = [
  '(function(){',
    'try{',
      'var B="'+hash(core)+'",U=' + JSON.stringify(RAW) + ',P=' + JSON.stringify(PAGE) + ';',
      'function h(s){var x=5381,i=s.length;while(i)x=(x*33)^s.charCodeAt(--i);return(x>>>0).toString(16);}',
      'fetch(U,{cache:"no-cache"}).then(function(r){return r.text();}).then(function(t){',
        'if(h(t)!==B){',
          'var d=document.createElement("div");',
          'd.textContent="\\u26A0\\uFE0F Claude Chat Exporter: update available \\u2014 click to re-grab";',
          'd.style.cssText="position:fixed;top:10px;right:10px;z-index:10001;background:#d97757;color:#1a1a1a;padding:8px 12px;border-radius:6px;font:12px/1.4 monospace;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.3);max-width:300px";',
          'var prev=window.__claudeChatExporterNotice;if(prev)prev.remove();',
          'document.body.appendChild(d);',
          'window.__claudeChatExporterNotice=d;',
          'var c=function(){d.remove();if(window.__claudeChatExporterNotice===d)delete window.__claudeChatExporterNotice;};',
          'd.onclick=function(){window.open(P,"_blank");c();};',
          'setTimeout(c,15000);',
        '}',
      '}).catch(function(e){try{console.debug("[claude-chat-exporter] update check failed:",e);}catch(_){}});',
    '}catch(e){}',
  '})();'
].join('');

const full = "(function(){" + SHIM + "\n" + core + "\n})();";
const href = "javascript:" + encodeURIComponent(full);

// self-check: decode the URI before inspecting the embedded shim.
// encodeURIComponent turns the shim's quotes into %22 in href.
const decoded = decodeURIComponent(href.slice("javascript:".length));
const reBaked = new RegExp('var B="([0-9a-f]+)"');
const baked = decoded.match(reBaked)?.[1];
const recomputed = hash(core);
console.log("baked hash :", baked);
console.log("recomputed :", recomputed);
console.log("hash match :", baked === recomputed);
console.log("length     :", href.length, "chars");

writeFileSync(new URL('./bookmarklet.txt', import.meta.url), href, 'utf8');
writeFileSync(new URL('./hash.txt', import.meta.url), recomputed, 'utf8');
console.log("wrote bookmarklet.txt (" + href.slice(0,60) + "...)");
