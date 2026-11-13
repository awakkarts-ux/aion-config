'use strict';
/* Разбор и сборка system.cfg / system.ovr. Общий для окна программы и для
   tools/selftest.js, поэтому без зависимостей от DOM. */
const KV = /^\s*([A-Za-z0-9_.]+)\s*=\s*"([^"]*)"\s*$/;
function parse(text) {
  const eol = /\r\n/.test(text) ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/).map(t => { const m = t.match(KV); return m ? { key: m[1], value: m[2] } : { raw: t }; });
  return { eol, lines };
}
const lc = s => s.toLowerCase();
function serializeCfg(doc, values) {
  const out = []; const seen = new Set();
  for (const l of doc.lines) {
    if (l.raw !== undefined) { out.push(l.raw); continue; }
    if (!values.has(l.key)) continue;
    seen.add(l.key); out.push(`${l.key} = "${values.get(l.key)}"`);
  }
  // новые ключи вставляем по алфавиту среди строк-параметров, как делает клиент
  for (const [k, v] of values) {
    if (seen.has(k)) continue;
    const line = `${k} = "${v}"`;
    let idx = -1, lastKv = -1;
    for (let i = 0; i < out.length; i++) { const m = out[i].match(KV); if (!m) continue; lastKv = i; if (idx < 0 && lc(m[1]) > lc(k)) idx = i; }
    if (idx < 0) idx = lastKv >= 0 ? lastKv + 1 : out.length;
    out.splice(idx, 0, line);
  }
  return out.join(doc.eol);
}


if (typeof module !== 'undefined') module.exports = { KV, parse, serializeCfg };
