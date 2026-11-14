'use strict';
/* Проверка разбора и сборки system.cfg без клиента игры: файл должен
   собираться обратно байт в байт, новые ключи — вставать по алфавиту. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parse, serializeCfg } = require('../src/ui/cfg.js');

const sample = fs.readFileSync(path.join(__dirname, 'fixtures', 'system.cfg'), 'utf8');
const crlf = sample.replace(/\r?\n/g, '\r\n');

for (const text of [sample, crlf]) {
  const doc = parse(text);
  const values = new Map(doc.lines.filter(l => l.key).map(l => [l.key, l.value]));
  assert.strictEqual(serializeCfg(doc, values), text, 'файл без правок собирается байт в байт');

  values.set('s_MusicVolume', '0.500000');
  values.set('g_chatlog', '1');
  values.delete('e_beach');
  const out = serializeCfg(doc, values);
  assert.ok(out.includes('s_MusicVolume = "0.500000"'), 'значение меняется');
  assert.ok(!out.includes('e_beach'), 'ключ удаляется');
  const keys = out.split(/\r?\n/).map(t => t.match(/^(\w+) =/)).filter(Boolean).map(m => m[1]);
  assert.ok(keys.indexOf('g_chatlog') > keys.indexOf('g_cfg_video_WATER') && keys.indexOf('g_chatlog') < keys.indexOf('g_client_var'), 'новый ключ встаёт по алфавиту');
  assert.ok(out.startsWith('-- [System-Configuration Ver1.0]'), 'шапка сохраняется');
  assert.strictEqual(/\r\n/.test(out), /\r\n/.test(text), 'переводы строк сохраняются');
}
console.log('selftest: ok');

/* contextBridge кладёт в окно неудаляемые свойства (`api`). Если скрипт окна
   объявит на верхнем уровне то же имя, браузер не выполнит его целиком —
   так v0.1.0 открывалась с мёртвыми кнопками. */
const preload = fs.readFileSync(path.join(__dirname, '..', 'src', 'preload.js'), 'utf8');
const exposed = [...preload.matchAll(/exposeInMainWorld\(\s*['"](\w+)['"]/g)].map(m => m[1]);
assert.ok(exposed.length, 'preload выставляет api');
for (const f of ['boot.js', 'cfg.js', 'app.js']) {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui', f), 'utf8');
  for (const name of exposed) {
    const re = new RegExp(`^(?:const|let|var|class|function\\*?|async function)\\s+${name}\\b`, 'm');
    assert.ok(!re.test(code), `${f}: на верхнем уровне объявлено имя «${name}», занятое preload`);
  }
}
console.log('selftest: имена из preload не перекрыты');
