'use strict';
/**
 * Иконка Aion Config: графитовый квадрат со скруглением, три «ползунка»
 * настроек и ручки с тёплым градиентом из шапки программы.
 * Пишет icon.png (256×256) и icon.ico (внутри тот же PNG). Без библиотек.
 *   node tools/make-icon.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const S = 256, SS = 4; // сглаживание: 4×4 выборки на пиксель
const px = Buffer.alloc(S * S * 4);
const lerp = (a, b, t) => a + (b - a) * t;
const grad = (t) => { // #ff5a3c → #e0457b → #9b5cff
  const st = [[255, 90, 60], [224, 69, 123], [155, 92, 255]];
  const k = t < 0.55 ? 0 : 1, u = k === 0 ? t / 0.55 : (t - 0.55) / 0.45;
  return st[k].map((c, i) => lerp(c, st[k + 1][i], Math.min(1, Math.max(0, u))));
};
const inRound = (x, y, x0, y0, x1, y1, r) => {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
};
const rows = [{ y: 82, k: 0.68 }, { y: 128, k: 0.32 }, { y: 174, k: 0.55 }];

function sample(x, y) {
  if (!inRound(x, y, 8, 8, 248, 248, 56)) return null;
  let c = [21, 21, 22];
  // тёплое зарево в углу, как --aura
  const glow = Math.max(0, 1 - Math.hypot(x - 20, y - 20) / 200) * 0.18;
  c = c.map((v, i) => lerp(v, [255, 90, 60][i], glow));
  for (const r of rows) {
    const x0 = 52, x1 = 204, kx = lerp(x0, x1, r.k);
    if (inRound(x, y, x0, r.y - 6, x1, r.y + 6, 6)) c = x <= kx ? grad((x - x0) / (x1 - x0)) : [47, 47, 50];
    if ((x - kx) ** 2 + (y - r.y) ** 2 <= 17 ** 2) c = [237, 237, 238];
  }
  return c;
}
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
  let r = 0, g = 0, b = 0, a = 0;
  for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
    const c = sample(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS);
    if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
  }
  const i = (y * S + x) * 4;
  if (a) { px[i] = r / a; px[i + 1] = g / a; px[i + 2] = b / a; px[i + 3] = (a / (SS * SS)) * 255; }
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; }
  return (crc ^ 0xffffffff) >>> 0;
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) { raw[y * (S * 4 + 1)] = 0; px.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 6;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);

const head = Buffer.alloc(6 + 16);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head[6] = 0; head[7] = 0; head[8] = 0; head[9] = 0; head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
const root = path.join(__dirname, '..');
fs.writeFileSync(path.join(root, 'icon.png'), png);
fs.writeFileSync(path.join(root, 'icon.ico'), Buffer.concat([head, png]));
console.log('icon.png, icon.ico');
