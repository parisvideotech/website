#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TABLE_PREFIX = 'wp_nop5ztopme_';

const SQL_PATH = process.env.SQL_PATH || path.resolve(ROOT, '..',
  'u233250906_pvt.parisvideotech-com.20260507063113.sql',
  'u233250906_pvt.sql');
const UPLOADS = process.env.UPLOADS || path.resolve(ROOT, '..',
  'u233250906.parisvideotech-com.20260507063113',
  'domains', 'parisvideotech.com', 'public_html', 'wp-content', 'uploads');
const OUT_MDX = path.join(ROOT, 'src', 'content', 'meetups');
const OUT_IMG = path.join(ROOT, 'public', 'images', 'meetups');

function unescapeMySQL(s) {
  return s.replace(/\\(.)/g, (_, ch) => {
    if (ch === 'n') return '\n';
    if (ch === 'r') return '\r';
    if (ch === 't') return '\t';
    if (ch === '0') return '\0';
    if (ch === 'Z') return '\x1a';
    return ch;
  });
}

function splitRows(blob) {
  const rows = [];
  let depth = 0, inS = false, esc = false, buf = '';
  for (let i = 0; i < blob.length; i++) {
    const c = blob[i];
    if (esc) { buf += c; esc = false; continue; }
    if (inS) { buf += c; if (c === '\\') esc = true; else if (c === "'") inS = false; continue; }
    if (c === "'") { buf += c; inS = true; continue; }
    if (c === '(') { if (depth === 0) buf = ''; else buf += c; depth++; continue; }
    if (c === ')') { depth--; if (depth === 0) { rows.push(buf); buf = ''; } else buf += c; continue; }
    if (depth > 0) buf += c;
  }
  return rows;
}

function parseRow(row) {
  const fields = [];
  let inS = false, esc = false, buf = '', quoted = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (esc) { buf += c; esc = false; continue; }
    if (inS) {
      if (c === '\\') { buf += c; esc = true; }
      else if (c === "'") inS = false;
      else buf += c;
      continue;
    }
    if (c === "'") { inS = true; quoted = true; continue; }
    if (c === ',') {
      fields.push(quoted ? unescapeMySQL(buf) : (buf.trim() === 'NULL' ? null : buf.trim()));
      buf = ''; quoted = false;
      continue;
    }
    buf += c;
  }
  fields.push(quoted ? unescapeMySQL(buf) : (buf.trim() === 'NULL' ? null : buf.trim()));
  return fields;
}

function findStatementEnd(sql, start) {
  let inS = false, esc = false;
  for (let i = start; i < sql.length; i++) {
    const c = sql[i];
    if (esc) { esc = false; continue; }
    if (inS) { if (c === '\\') esc = true; else if (c === "'") inS = false; continue; }
    if (c === "'") { inS = true; continue; }
    if (c === ';') return i;
  }
  return -1;
}

function extractRows(sql, tableName) {
  const fullName = TABLE_PREFIX + tableName;
  const prefixRe = new RegExp('INSERT INTO `' + fullName + '`(?:\\s*\\([^)]+\\))?\\s+VALUES\\s+', 'g');
  const all = [];
  let m;
  while ((m = prefixRe.exec(sql)) !== null) {
    const start = prefixRe.lastIndex;
    const end = findStatementEnd(sql, start);
    if (end === -1) break;
    const blob = sql.slice(start, end);
    for (const r of splitRows(blob)) all.push(parseRow(r));
    prefixRe.lastIndex = end + 1;
  }
  return all;
}

function decodeHtmlEntities(s) {
  if (!s) return s;
  const named = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
    '&nbsp;': ' ', '&hellip;': '...', '&ldquo;': '"', '&rdquo;': '"',
    '&lsquo;': "'", '&rsquo;': "'", '&mdash;': '-', '&ndash;': '-',
  };
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&[a-zA-Z]+;/g, (m) => (named[m] !== undefined ? named[m] : m));
}

const VOID_TAGS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

function autoCloseVoidTags(html) {
  let s = html;
  for (const tag of VOID_TAGS) {
    const re = new RegExp('<(' + tag + ')((?:\\s[^>]*?)?)\\s*>', 'gi');
    s = s.replace(re, (match, t, attrs) => {
      if (attrs.trimEnd().endsWith('/')) return match;
      return '<' + t + attrs + ' />';
    });
  }
  return s;
}

// Supprime les shortcodes WP non geres (et tout ce qu'ils contiennent).
function stripShortcodes(html) {
  let s = html.replace(/\[([a-z_][a-z0-9_-]*)\b[^\]]*\][\s\S]*?\[\/\1\]/gi, '');
  s = s.replace(/\[(slideshare|pdfviewer|caption|embed|gallery|playlist|audio|video|youtube|vimeo)\b[^\]]*\]/gi, '');
  return s;
}

// MDX n'accepte pas les commentaires HTML <!-- ... -->. On les supprime tous.
function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}
// Supprime les <style>...</style> et <script>...</script> inline (vestiges Elementor).
// Necessaire car les { } CSS sont interpretes comme JSX par MDX.
function stripStyleAndScript(html) {
  let s = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  return s;
}
// Echappe les { et } restants pour eviter qu'ils soient interpretes comme JSX par MDX.
// On les passe en entites HTML qui rendront le caractere brut a l'affichage.
function escapeCurlyBraces(html) {
  return html.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
}
// Repare le HTML pour MDX : retire les balises de fermeture orphelines
// et ferme les balises ouvertes laissees en suspens.
// Approche stack-based simple, suffit pour 95% des cas du HTML WordPress.
// Supprime les attributs style="..." inline (vestiges Word/Outlook/Elementor).
// Notre design system couvre la typographie. MDX 3 accepte techniquement
// style="..." en mode HTML mais on prefere s'en debarrasser pour eliminer
// toute friction potentielle avec le parseur.
function stripInlineStyleAttr(html) {
  return html.replace(/\s+style\s*=\s*"[^"]*"/gi, '')
             .replace(/\s+style\s*=\s*'[^']*'/gi, '');
}

function repairHtml(html) {
  const VOID = new Set(VOID_TAGS);
  // Match <tag>, </tag>, <tag ... /> et <tag ...>
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?>/g;
  const stack = [];
  const parts = [];
  let lastIdx = 0;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    const full = m[0];
    const tagName = m[1].toLowerCase();
    const isClose = full.startsWith('</');
    const isSelfClose = !isClose && (VOID.has(tagName) || /\/\s*>$/.test(full));

    parts.push(html.slice(lastIdx, m.index));

    if (isSelfClose) {
      parts.push(full);
    } else if (isClose) {
      const idx = stack.lastIndexOf(tagName);
      if (idx !== -1) {
        // Fermer les balises ouvertes entre stack[idx+1..top] avant
        for (let i = stack.length - 1; i > idx; i--) {
          parts.push('</' + stack[i] + '>');
        }
        parts.push(full);
        stack.length = idx;
      }
      // Sinon : balise orpheline, on l'omet
    } else {
      stack.push(tagName);
      parts.push(full);
    }

    lastIdx = m.index + full.length;
  }
  parts.push(html.slice(lastIdx));
  // Fermer les balises encore ouvertes en fin
  while (stack.length > 0) {
    parts.push('</' + stack.pop() + '>');
  }
  return parts.join('');
}

function cleanContent(html) {
  if (!html) return '';
  let s = decodeHtmlEntities(html);
  s = stripShortcodes(s);
  s = stripHtmlComments(s);
  s = stripStyleAndScript(s);
  s = stripInlineStyleAttr(s);
  s = autoCloseVoidTags(s);
  s = repairHtml(s);
  s = escapeCurlyBraces(s);
  // On collapse tout le whitespace en un seul espace : evite que MDX
  // interprete des sauts de ligne comme separateurs de paragraphes markdown
  // dans du HTML inline migre depuis WordPress.
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function extractYouTubeUrl(content) {
  if (!content) return { url: null, cleanedContent: content };
  const re = /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;
  const m = content.match(re);
  if (!m) return { url: null, cleanedContent: content };
  const url = 'https://www.youtube.com/watch?v=' + m[1];
  const cleaned = content.replace(/<figure[^>]*wp-block-embed[^>]*>[\s\S]*?<\/figure>/g, '');
  return { url, cleanedContent: cleaned.trim() };
}

function yamlString(s) {
  if (s === null || s === undefined) return '""';
  const e = String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return '"' + e + '"';
}

function yamlArray(arr) {
  if (!arr || arr.length === 0) return '[]';
  return '[' + arr.map((v) => yamlString(v)).join(', ') + ']';
}

console.log('=== Migration WordPress vers MDX ===');
if (!fs.existsSync(SQL_PATH)) { console.error('SQL introuvable'); process.exit(1); }

const sql = fs.readFileSync(SQL_PATH, 'utf8');
console.log('SQL: ' + (sql.length / 1024 / 1024).toFixed(1) + ' Mo');

const postsRows = extractRows(sql, 'posts');
const articles = [];
const attachments = new Map();
for (const r of postsRows) {
  const id = parseInt(r[0], 10);
  if (r[20] === 'post' && r[7] === 'publish') {
    articles.push({ id, date: r[2], content: r[4] || '', title: r[5] || '', excerpt: r[6] || '', slug: r[11] });
  } else if (r[20] === 'attachment') {
    attachments.set(id, { guid: r[18] });
  }
}
console.log('Articles: ' + articles.length + ' / Attachments: ' + attachments.size);

const postmetaRows = extractRows(sql, 'postmeta');
const thumb = new Map();
for (const r of postmetaRows) {
  if (r[2] === '_thumbnail_id' && r[3]) thumb.set(parseInt(r[1], 10), parseInt(r[3], 10));
}

const termsRows = extractRows(sql, 'terms');
const taxonomyRows = extractRows(sql, 'term_taxonomy');
const relRows = extractRows(sql, 'term_relationships');
const termName = new Map();
for (const r of termsRows) termName.set(parseInt(r[0], 10), r[1]);
const tagTtId = new Map();
for (const r of taxonomyRows) {
  if (r[2] === 'post_tag') tagTtId.set(parseInt(r[0], 10), parseInt(r[1], 10));
}
const tagsByPost = new Map();
for (const r of relRows) {
  const pid = parseInt(r[0], 10);
  const tid = tagTtId.get(parseInt(r[1], 10));
  if (tid !== undefined) {
    const n = termName.get(tid);
    if (n) {
      if (!tagsByPost.has(pid)) tagsByPost.set(pid, []);
      tagsByPost.get(pid).push(n);
    }
  }
}

fs.mkdirSync(OUT_MDX, { recursive: true });
fs.mkdirSync(OUT_IMG, { recursive: true });

let written = 0, coversOk = 0;
for (const a of articles.sort((x, y) => x.id - y.id)) {
  let coverPath = null, coverAlt = null;
  const tid = thumb.get(a.id);
  if (tid !== undefined) {
    const att = attachments.get(tid);
    if (att && att.guid) {
      const m = att.guid.match(/\/wp-content\/uploads\/(.+)$/);
      if (m) {
        const src = path.join(UPLOADS, m[1]);
        const ext = path.extname(m[1]).toLowerCase();
        const destName = a.slug + ext;
        const dest = path.join(OUT_IMG, destName);
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, dest);
            coverPath = '/images/meetups/' + destName;
            coverAlt = decodeHtmlEntities(a.title);
            coversOk++;
          } catch (e) {}
        }
      }
    }
  }

  const tags = (tagsByPost.get(a.id) || []).map(decodeHtmlEntities);
  const title = decodeHtmlEntities(a.title).trim();
  const excerpt = decodeHtmlEntities(a.excerpt).trim();
  let content = cleanContent(a.content);
  const yt = extractYouTubeUrl(content);
  if (yt.url) content = cleanContent(yt.cleanedContent);

  let summary = excerpt;
  if (!summary) {
    const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    summary = plain.slice(0, 250);
    if (plain.length > 250) summary += '...';
  }
  if (summary.length > 280) summary = summary.slice(0, 277) + '...';
  if (summary.length < 10) summary = title;

  const isoDate = new Date(a.date.replace(' ', 'T') + 'Z').toISOString();

  const lines = ['---'];
  lines.push('title: ' + yamlString(title));
  lines.push('date: ' + yamlString(isoDate));
  lines.push('status: past');
  lines.push('summary: ' + yamlString(summary));
  if (coverPath) {
    lines.push('cover: ' + yamlString(coverPath));
    lines.push('cover_alt: ' + yamlString(coverAlt));
  }
  lines.push('speakers: []');
  if (yt.url) lines.push('youtube_url: ' + yamlString(yt.url));
  lines.push('tags: ' + yamlArray(tags));
  lines.push('legacy_wp_id: ' + a.id);
  lines.push('---');
  lines.push('');
  // Wrapper dans une div pour que MDX traite le contenu HTML legacy comme un bloc opaque,
  // sans essayer de parser des paragraphes markdown a l'interieur (qui plantent
  // quand du HTML inline chevauche des sauts de ligne).
  lines.push('<div class="legacy-content">');
  lines.push(content);
  lines.push('</div>');
  lines.push('');

  fs.writeFileSync(path.join(OUT_MDX, a.slug + '.mdx'), lines.join('\n'), 'utf8');
  written++;
}

console.log('MDX ecrits: ' + written);
console.log('Covers: ' + coversOk);
