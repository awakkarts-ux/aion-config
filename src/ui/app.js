'use strict';
/* ---------------- справочник параметров ---------------- */
const ANIM = [
  { key: 'g_blend_time', title: 'Переход в анимацию', desc: 'Время плавного входа в следующее движение. Меньше — резче и быстрее.', presets: ['0.1', '0.05', '0.01', '0.0001'], max: '0.0001' },
  { key: 'g_blendout_time', title: 'Выход из анимации', desc: 'Время плавного выхода из движения в стойку. Меньше — персонаж раньше освобождается после умения.', presets: ['0.1', '0.05', '0.01', '0.0001'], max: '0.0001' },
  { key: 'g_chainSkillIndicateDelay', title: 'Подсветка цепочки', desc: 'Задержка, с которой появляется подсветка следующего умения в цепочке.', presets: ['0.1', '0.01', '0.001'], max: '0.001' },
  { key: 'g_chainSkillChangeCooltimeDelay', title: 'Смена умения в цепочке', desc: 'Задержка перед сменой иконки цепочного умения на следующее.', presets: ['0.1', '0.01', '0.001'], max: '0.001' },
];
const GFX_TOGGLES = [
  { key: 'e_beach', title: 'Пляжи и прибой', desc: 'Пена и волны у берега.' },
  { key: 'e_weather_fx_enable', title: 'Погодные эффекты', desc: 'Дождь, снег, туман.' },
  { key: 'r_WaterReflections', title: 'Отражения в воде', desc: 'Сильно влияет на FPS у воды.' },
  { key: 'e_particles_fullfx', title: 'Полные эффекты частиц', desc: 'Все частицы умений и окружения.', float: true },
  { key: 'r_DetailTextures', title: 'Детальные текстуры', desc: 'Мелкая детализация поверхностей вблизи.' },
  { key: 'r_FSAA', title: 'Сглаживание (FSAA)', desc: 'Убирает «лесенки» по краям.' },
  { key: 'g_chatlog', title: 'Лог чата в файл', desc: 'Клиент пишет Chat.log в папку игры. Нужен DPS-метрам.' },
  { key: 'g_blade_fx', title: 'Следы от оружия', desc: 'Светящийся шлейф за клинком при ударах.' },
  { key: 'g_uiFX', title: 'Эффекты интерфейса', desc: 'Анимация и свечение элементов интерфейса.' },
  { key: 'ca_UseFacialAnimation', title: 'Мимика персонажей', desc: 'Анимация лиц. Выключение помогает в массовых боях.' },
  { key: 'ca_UsePhysics', title: 'Физика персонажей', desc: 'Колыхание волос, плащей и одежды.' },
  { key: 'e_vegetation_wind', title: 'Ветер в траве и деревьях', desc: 'Колыхание растительности.' },
  { key: 'g_showFPS', title: 'Показывать FPS', desc: 'Счётчик кадров в игре.' },
  { key: 'sys_AdaptiveCharLOD', title: 'Упрощать дальних персонажей', desc: 'Дальние модели рисуются проще. Помогает в массовых боях.', float: true },
];
const GFX_LEVELS = {
  GENERAL: 'Общий пресет', TEXTURE: 'Текстуры', SHADOW: 'Тени', SHADER: 'Шейдеры', EFFECT: 'Эффекты', SKILLFX: 'Эффекты умений',
  BACKGROUND: 'Фон', ENTITY_DIST: 'Дальность персонажей', TERRAIN_DIST: 'Дальность ландшафта', ENV_TEX: 'Текстуры окружения',
  WATER: 'Вода', GLOW: 'Свечение', GLARE: 'Блики', FSAA: 'Сглаживание', MODEL_CACHE: 'Кэш моделей',
  BUMP: 'Рельеф', CAMERA: 'Камера', DOF: 'Глубина резкости', LOWEST: 'Минимум', SUNSHAFT: 'Солнечные лучи', WEATHERLAYER: 'Погода',
};
const SOUND = [
  ['s_MasterVolume', 'Общая громкость'], ['s_MusicVolume', 'Музыка'], ['s_SFXVolume_FX', 'Эффекты и умения'],
  ['s_SFXVolume_ENV', 'Окружение'], ['s_SFXVolume_WEATHER', 'Погода'], ['s_SFXVolume_UI', 'Интерфейс'],
  ['s_SFXVolume_COMMENT_NPC', 'Реплики NPC'], ['s_SFXVolume_COMMENT_QUEST', 'Озвучка заданий'],
  ['s_SFXVolume_COMMENT_SYSTEM', 'Системные голоса'], ['s_SFXVolume_COMMENT_GOSSIP', 'Фоновые разговоры'],
];
const WINDOW = [
  { key: 'r_Fullscreen', title: 'Полный экран', type: 'toggle', desc: 'Выключено — игра в окне.' },
  { key: 'g_maxfps', title: 'Ограничение FPS', type: 'int', desc: 'Максимум кадров в секунду. Работает вместе с защитой system.cfg от перезаписи.' },
  { key: 'r_Width', title: 'Ширина', type: 'int', desc: 'Разрешение по горизонтали, px.' },
  { key: 'r_Height', title: 'Высота', type: 'int', desc: 'Разрешение по вертикали, px.' },
  { key: 'r_MaximizeWindow', title: 'Развёрнутое окно', type: 'seg', options: [['0', 'нет'], ['1', 'да'], ['2', 'да (2)']], desc: 'Как клиент открывает окно при запуске.' },
  { key: 'r_WindowWidth', title: 'Ширина обычного окна', type: 'int', desc: 'Когда окно не развёрнуто.' },
  { key: 'r_WindowHeight', title: 'Высота обычного окна', type: 'int', desc: 'Когда окно не развёрнуто.' },
  { key: 'g_ThirdPersonRange', title: 'Дальность камеры', type: 'range', min: 1, max: 15, step: 0.1, digits: 6, desc: 'Расстояние от камеры до персонажа.' },
  { key: 'g_cam_rot_ratio', title: 'Скорость поворота камеры мышью', type: 'range', min: 0.02, max: 1, step: 0.01, digits: 6, desc: '' },
  { key: 'g_cam_key_rot', title: 'Поворот камеры клавишами', type: 'int', desc: 'Скорость поворота с клавиатуры.' },
];

/* ---------------- состояние ---------------- */
const S = {
  dir: null,            // FileSystemDirectoryHandle или null (режим загрузки)
  cfgDoc: null, cfgOrig: new Map(), cfg: new Map(),
  ovrExists: false, ovrOrigText: '', anim: {}, animOrig: {}, extra: '', extraOrig: '',
  animTarget: 'cfg', readOnly: false, readOnlyOrig: false,
  eol: '\r\n',
};

function loadTexts(cfgText, ovrText) {
  S.cfgDoc = parse(cfgText); S.eol = S.cfgDoc.eol;
  S.cfgOrig = new Map(); for (const l of S.cfgDoc.lines) if (l.key) S.cfgOrig.set(l.key, l.value);
  S.cfg = new Map(S.cfgOrig);
  S.ovrExists = ovrText !== null; S.ovrOrigText = ovrText || '';
  S.anim = {}; const extra = [];
  if (ovrText) for (const t of ovrText.split(/\r?\n/)) {
    const m = t.match(KV);
    if (m && ANIM.some(a => a.key === m[1])) S.anim[m[1]] = m[2];
    else if (t.trim() !== '') extra.push(t);
  }
  S.animOrig = { ...S.anim }; S.extra = S.extraOrig = extra.join('\n');
  // куда писать параметры анимаций: туда, где они уже есть, иначе — как выбрал раньше (по умолчанию system.cfg)
  let pref = null; try { pref = localStorage.getItem('animTarget'); } catch {}
  S.animTarget = ANIM.some(a => S.cfgOrig.has(a.key)) ? 'cfg' : Object.keys(S.anim).length ? 'ovr' : (pref || 'cfg');
  // Classic читает только system.cfg: строки из system.ovr переносим, если пользователь сам не выбирал ovr
  if (S.animTarget === 'ovr' && pref !== 'ovr') setAnimTarget('cfg');
  renderAll(); show('anim');
}
function buildOvr() {
  const body = [];
  for (const a of ANIM) if (S.anim[a.key] !== undefined) body.push(`${a.key} = "${S.anim[a.key]}"`);
  const extra = S.extra.split(/\r?\n/).filter(t => t.trim() !== '');
  if (!body.length && !extra.length) return '';
  return body.concat(extra).join(S.eol) + S.eol;
}
const buildCfg = () => serializeCfg(S.cfgDoc, S.cfg);
const getA = k => S.animTarget === 'cfg' ? S.cfg.get(k) : S.anim[k];
function setA(k, v) {
  if (S.animTarget === 'cfg') { if (v === undefined) S.cfg.delete(k); else S.cfg.set(k, v); }
  else { if (v === undefined) delete S.anim[k]; else S.anim[k] = v; }
}
const animChanged = k => S.cfg.get(k) !== S.cfgOrig.get(k) || S.anim[k] !== S.animOrig[k];
function setAnimTarget(t) {
  if (t === S.animTarget) return;
  const vals = Object.fromEntries(ANIM.map(a => [a.key, getA(a.key)]));
  for (const a of ANIM) setA(a.key, undefined);
  S.animTarget = t; try { localStorage.setItem('animTarget', t); } catch {}
  for (const a of ANIM) if (vals[a.key] !== undefined) setA(a.key, vals[a.key]);
}
const cfgChanged = k => S.cfg.get(k) !== S.cfgOrig.get(k);
const ovrDirty = () => buildOvr() !== (S.ovrExists ? normalizeOvr(S.ovrOrigText) : '');
function normalizeOvr(t) { // сравниваем по содержимому, а не по шапке и пробелам
  const save = { anim: S.anim, extra: S.extra };
  S.anim = { ...S.animOrig }; S.extra = S.extraOrig; const r = buildOvr(); S.anim = save.anim; S.extra = save.extra; return r;
}
function isDirty() { return buildCfg() !== serializeCfg(S.cfgDoc, S.cfgOrig) || ovrDirty() || S.readOnly !== S.readOnlyOrig; }

/* ---------------- отрисовка ---------------- */
const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function cardHead(title, key, desc) {
  const c = el('div', 'card');
  c.append(el('div', 'card__head', `<div><div class="card__title">${esc(title)}</div><div class="card__key">${esc(key)}</div></div>`));
  if (desc) c.append(el('div', 'card__desc', esc(desc)));
  return c;
}
function sw(on, onChange) {
  const b = el('button', 'sw' + (on ? ' is-on' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', on);
  b.onclick = () => { const v = !b.classList.contains('is-on'); b.classList.toggle('is-on', v); b.setAttribute('aria-checked', v); onChange(v); };
  return b;
}
const fmt = (v, digits) => digits ? Number(v).toFixed(digits) : String(Math.round(v));

function renderAnim() {
  const tg = $('#anim-target'); tg.innerHTML = '';
  for (const [t, label] of [['cfg', 'system.cfg'], ['ovr', 'system.ovr']]) {
    const b = el('button', S.animTarget === t ? 'is-on' : '', label); b.type = 'button';
    b.onclick = () => { setAnimTarget(t); update(); renderAnim(); renderAll2(); }; tg.append(b);
  }
  $('#anim-target-note').innerHTML = S.animTarget === 'cfg'
    ? 'Строки допишутся прямо в <code>system.cfg</code>. Клиент Classic читает только его — включи справа защиту от перезаписи, иначе игра сотрёт их при запуске.'
    : 'Строки запишутся в отдельный <code>system.ovr</code>. Его читают только старые клиенты; Classic 2023 его игнорирует.';
  const ro = $('#ro-switch'); ro.innerHTML = '';
  ro.append(sw(S.readOnly, v => { S.readOnly = v; update(); renderAnim(); }));
  $('#ro-card').classList.toggle('is-changed', S.readOnly !== S.readOnlyOrig);
  const g = $('#anim-grid'); g.innerHTML = '';
  for (const a of ANIM) {
    const val = getA(a.key), on = val !== undefined;
    const c = cardHead(a.title, a.key, a.desc);
    if (animChanged(a.key)) c.classList.add('is-changed');
    c.querySelector('.card__head').append(sw(on, v => { setA(a.key, v ? a.max : undefined); update(); renderAnim(); }));
    const row = el('div', 'row');
    const seg = el('div', 'seg');
    for (const p of a.presets) {
      const b = el('button', val === p ? 'is-on' : '', p); b.type = 'button';
      b.onclick = () => { setA(a.key, p); update(); renderAnim(); }; seg.append(b);
    }
    const inp = el('input', 'mono'); inp.type = 'text'; inp.style.width = '110px';
    inp.value = on ? val : ''; inp.placeholder = 'своё';
    inp.onchange = () => { const v = inp.value.trim().replace(/"/g, ''); setA(a.key, v === '' ? undefined : v); update(); renderAnim(); };
    row.append(seg, inp); c.append(row);
    if (!on) row.style.opacity = '.5';
    g.append(c);
  }
  $('#ovr-extra').value = S.extra;
}

function renderGfx() {
  const t = $('#gfx-toggles'); t.innerHTML = '';
  for (const it of GFX_TOGGLES) {
    const has = S.cfg.has(it.key);
    const on = has ? Number(S.cfg.get(it.key)) > 0 : null;
    const c = cardHead(it.title, it.key, it.desc + (has ? '' : ' Сейчас строки нет — клиент берёт своё значение.'));
    if (cfgChanged(it.key)) c.classList.add('is-changed');
    c.querySelector('.card__head').append(sw(!!on, v => {
      S.cfg.set(it.key, it.float ? (v ? '1.000000' : '0.000000') : (v ? '1' : '0')); update(); renderGfx();
    }));
    t.append(c);
  }
  const lv = $('#gfx-levels'), mrt = $('#gfx-mrt'); lv.innerHTML = ''; mrt.innerHTML = '';
  for (const k of [...S.cfg.keys()].filter(k => /^g_cfg_video_/i.test(k) && k !== 'g_cfg_video_screen_res')) {
    const isMrt = /^g_cfg_video_MRT_/.test(k); const name = k.replace(/^g_cfg_video_(MRT_)?/, '');
    const c = cardHead(GFX_LEVELS[name] || name, k, '');
    if (cfgChanged(k)) c.classList.add('is-changed');
    const row = el('div', 'row');
    const st = el('div', 'step');
    const minus = el('button', '', '−'), plus = el('button', '', '+'); minus.type = plus.type = 'button';
    const inp = el('input'); inp.type = 'text'; inp.value = S.cfg.get(k);
    const set = v => { S.cfg.set(k, String(v)); update(); renderGfx(); };
    minus.onclick = () => set(Math.max(-2, (parseInt(S.cfg.get(k)) || 0) - 1));
    plus.onclick = () => set(Math.min(9, (parseInt(S.cfg.get(k)) || 0) + 1));
    inp.onchange = () => { const n = parseInt(inp.value); if (!isNaN(n)) set(n); else inp.value = S.cfg.get(k); };
    st.append(minus, inp, plus);
    const pips = el('span', 'pips'); const n = parseInt(S.cfg.get(k));
    for (let i = 1; i <= 6; i++) pips.append(el('i', i <= n ? 'on' : ''));
    row.append(st, n < 0 ? el('span', 'muted', 'свои настройки') : pips);
    c.append(row); (isMrt ? mrt : lv).append(c);
  }
}

function rangeRow(key, min, max, step, digits, toUi, fromUi, suffix) {
  const row = el('div', 'slider');
  const r = el('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step;
  const out = el('output');
  const paint = () => { r.style.setProperty('--p', ((r.value - min) / (max - min) * 100) + '%'); out.textContent = (digits === 0 ? Math.round(r.value) : Number(r.value).toFixed(digits > 2 ? 2 : digits)) + (suffix || ''); };
  r.value = toUi(Number(S.cfg.get(key) ?? 0)); paint();
  r.oninput = paint;
  r.onchange = () => { S.cfg.set(key, fromUi(Number(r.value))); update(); r.closest('.card').classList.toggle('is-changed', cfgChanged(key)); };
  row.append(r, out); return row;
}

function renderSound() {
  const g = $('#sound-grid'); g.innerHTML = '';
  for (const [k, title] of SOUND) {
    if (!S.cfg.has(k)) continue;
    const c = cardHead(title, k, '');
    if (cfgChanged(k)) c.classList.add('is-changed');
    c.append(rangeRow(k, 0, 100, 1, 0, v => v * 100, v => (v / 100).toFixed(6), '%'));
    g.append(c);
  }
}

function renderWindow() {
  const g = $('#window-grid'); g.innerHTML = '';
  for (const it of WINDOW) {
    const has = S.cfg.has(it.key);
    const c = cardHead(it.title, it.key, it.desc + (has ? '' : ' (строки нет — будет добавлена)'));
    if (cfgChanged(it.key)) c.classList.add('is-changed');
    if (it.type === 'toggle') {
      c.querySelector('.card__head').append(sw(Number(S.cfg.get(it.key)) > 0, v => { S.cfg.set(it.key, v ? '1' : '0'); update(); renderWindow(); }));
    } else if (it.type === 'int') {
      const inp = el('input', 'mono'); inp.type = 'number'; inp.value = S.cfg.get(it.key) ?? '';
      inp.onchange = () => { const n = parseInt(inp.value); if (isNaN(n)) { if (!has) S.cfg.delete(it.key); } else S.cfg.set(it.key, String(n)); update(); renderWindow(); };
      const row = el('div', 'row'); row.append(inp); c.append(row);
    } else if (it.type === 'seg') {
      const seg = el('div', 'seg');
      for (const [v, label] of it.options) { const b = el('button', S.cfg.get(it.key) === v ? 'is-on' : '', label); b.type = 'button'; b.onclick = () => { S.cfg.set(it.key, v); update(); renderWindow(); }; seg.append(b); }
      c.append(seg);
    } else if (it.type === 'range') {
      c.append(rangeRow(it.key, it.min, it.max, it.step, 2, v => v, v => v.toFixed(it.digits)));
    }
    g.append(c);
  }
}

function renderAll2() {
  const body = $('#all-body'); body.innerHTML = '';
  const q = lc($('#all-search').value.trim());
  for (const [k, v] of S.cfg) {
    if (q && !lc(k).includes(q) && !lc(v).includes(q)) continue;
    const tr = el('tr', (cfgChanged(k) ? 'is-changed ' : '') + (S.cfgOrig.has(k) ? '' : 'is-new'));
    const td1 = el('td', '', esc(k)), td2 = el('td'), td3 = el('td');
    const inp = el('input', 'mono'); inp.type = 'text'; inp.value = v;
    inp.onchange = () => { S.cfg.set(k, inp.value.replace(/"/g, '')); update(); tr.classList.toggle('is-changed', cfgChanged(k)); };
    const del = el('button', 'btn btn--sm btn--ghost btn--danger', 'Убрать'); del.type = 'button';
    del.onclick = () => { S.cfg.delete(k); update(); renderAll2(); };
    td2.append(inp); td3.append(del); tr.append(td1, td2, td3); body.append(tr);
  }
  const removed = [...S.cfgOrig.keys()].filter(k => !S.cfg.has(k));
  for (const k of removed) {
    if (q && !lc(k).includes(q)) continue;
    const tr = el('tr', 'is-changed'); tr.style.opacity = '.55';
    const back = el('button', 'btn btn--sm', 'Вернуть'); back.type = 'button';
    back.onclick = () => { S.cfg.set(k, S.cfgOrig.get(k)); update(); renderAll2(); };
    const td3 = el('td'); td3.append(back);
    tr.append(el('td', '', esc(k) + ' <span class="muted">— будет убран</span>'), el('td', 'muted', esc(S.cfgOrig.get(k))), td3);
    body.append(tr);
  }
}

function renderFiles() {
  const cfgText = buildCfg();
  $('#cfg-preview').innerHTML = cfgText.split(/\r?\n/).map(t => {
    const m = t.match(KV);
    if (!m) return `<span class="cmt">${esc(t)}</span>`;
    if (!S.cfgOrig.has(m[1])) return `<span class="add">${esc(t)}</span>`;
    return S.cfgOrig.get(m[1]) !== m[2] ? `<span class="chg">${esc(t)}</span>` : esc(t);
  }).join('\n');
  const changed = [...S.cfg.keys()].filter(cfgChanged).length + [...S.cfgOrig.keys()].filter(k => !S.cfg.has(k)).length;
  $('#cfg-stat').textContent = changed ? `изменено строк: ${changed}` : 'без изменений';
  const ovr = buildOvr();
  $('#ovr-preview').innerHTML = ovr ? ovr.split(/\r?\n/).map(t => /^\s*--/.test(t) ? `<span class="cmt">${esc(t)}</span>` : `<span class="${S.ovrExists ? 'chg' : 'add'}">${esc(t)}</span>`).join('\n')
    : '<span class="cmt">-- пусто: файл не будет создан' + (S.ovrExists ? ' (существующий удалится)' : '') + '</span>';
  $('#ovr-stat').textContent = !ovr ? (S.ovrExists ? 'будет удалён' : 'не будет создан') : (S.ovrExists ? (ovrDirty() ? 'будет обновлён' : 'без изменений') : 'будет создан');
}

function update() {
  const has = !!S.cfgDoc;
  const dirty = has && isDirty();
  $('#dirty').hidden = !dirty;
  $('#save-btn').disabled = !dirty;
  const cnt = (keys) => keys.filter(k => cfgChanged(k)).length;
  const badges = {
    anim: ANIM.filter(a => animChanged(a.key)).length + (S.extra !== S.extraOrig ? 1 : 0) + (S.readOnly !== S.readOnlyOrig ? 1 : 0),
    gfx: cnt([...new Set([...GFX_TOGGLES.map(t => t.key), ...[...S.cfg.keys()].filter(k => /^g_cfg_video_/.test(k))])]),
    sound: cnt(SOUND.map(s => s[0])),
    window: cnt(WINDOW.map(w => w.key)),
    all: [...new Set([...S.cfg.keys(), ...S.cfgOrig.keys()])].filter(k => S.cfg.get(k) !== S.cfgOrig.get(k)).length,
  };
  for (const [k, n] of Object.entries(badges)) { const b = document.querySelector(`[data-badge="${k}"]`); if (b) b.textContent = has && n ? n : ''; }
  if (document.querySelector('.view.is-active')?.dataset.view === 'files') renderFiles();
}
function renderAll() { renderAnim(); renderGfx(); renderSound(); renderWindow(); renderAll2(); renderFiles(); update(); }

function show(view) {
  if (!S.cfgDoc && view !== 'guide') view = 'start';
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('is-active', v.dataset.view === view));
  document.querySelectorAll('.nav').forEach(n => n.classList.toggle('is-active', n.dataset.view === view));
  if (view === 'files') renderFiles();
}

/* ---------------- окно-вопрос в стиле программы ---------------- */
function ask(title, text, ok = 'Да', { danger = false, cancel = 'Отмена' } = {}) {
  return new Promise(resolve => {
    const wrap = el('div', 'modal');
    wrap.innerHTML = `<div class="modal__box" role="dialog" aria-modal="true"><b>${esc(title)}</b><p>${text}</p><div class="row"></div></div>`;
    const row = wrap.querySelector('.row');
    const no = el('button', 'btn btn--ghost', esc(cancel)), yes = el('button', 'btn ' + (danger ? 'btn--danger-solid' : 'btn--primary'), esc(ok));
    const done = v => { wrap.remove(); document.removeEventListener('keydown', key); resolve(v); };
    const key = e => { if (e.key === 'Escape') done(false); if (e.key === 'Enter') done(true); };
    no.onclick = () => done(false); yes.onclick = () => done(true);
    wrap.onmousedown = e => { if (e.target === wrap) done(false); };
    document.addEventListener('keydown', key);
    row.append(no, yes); document.body.append(wrap); yes.focus();
  });
}

/* ---------------- папка игры (через основной процесс) ---------------- */
function applyLoaded(res) {
  if (!res) return false;
  if (res.error) { toast(res.error, true); return false; }
  if (res.canceled) return false;
  S.dir = res.dir; S.readOnly = S.readOnlyOrig = !!res.readOnly; loadTexts(res.cfg, res.ovr);
  const name = $('#folder-name'); name.innerHTML = ''; const bdi = document.createElement('bdi'); bdi.textContent = res.dir; name.append(bdi);
  $('#folder-btn').title = res.dir + '\nНажми, чтобы выбрать другую папку';
  $('#folder-dot').className = 'dot ok';
  $('#folder-mode').textContent = (res.readOnly ? 'system.cfg защищён от перезаписи' : 'system.cfg без защиты') + (res.ovr === null ? '' : ' · есть system.ovr');
  $('#restore-btn').disabled = !res.hasBackup;
  if (res.autoFound) { $('#found-path').textContent = res.dir; $('#foundbar').hidden = false; }
  else if (res.autoFound === false || res.written) $('#foundbar').hidden = true;
  return true;
}
async function pickDir() {
  if (S.cfgDoc && isDirty() && !(await ask('Открыть другую папку?', 'Несохранённые правки пропадут.', 'Открыть'))) return;
  try { const r = await api.game.pick(); if (applyLoaded(r)) $('#foundbar').hidden = true; } catch (e) { toast('Не удалось открыть папку: ' + cleanErr(e), true); }
}
async function save() {
  if (!S.cfgDoc || $('#save-btn').disabled) return;
  if (await api.game.running()) {
    const go = await ask('Игра запущена', 'При выходе клиент перезапишет <code>system.cfg</code> своими значениями, и правки графики и звука пропадут. <code>system.ovr</code> он не трогает, но прочитает его только при следующем запуске.<br><br>Лучше закрыть игру и сохранить потом.', 'Всё равно сохранить', { danger: true });
    if (!go) return;
  }
  try {
    const res = await api.game.save({ dir: S.dir, cfg: buildCfg(), ovr: buildOvr(), readOnly: S.readOnly });
    applyLoaded(res);
    let files = (res.written || []).join('\n');
    if (res.readOnly) files += '\nsystem.cfg защищён от перезаписи (только чтение).';
    toast('Сохранено и проверено на диске:\n' + files, false, { label: 'Показать в папке', run: () => api.game.reveal(S.dir) }, 9000);
  } catch (e) { toast('Ошибка записи: ' + cleanErr(e), true); }
}
async function restore() {
  if (!S.dir) return;
  if (!(await ask('Вернуть как было?', 'Файлы <code>system.cfg</code> и <code>system.ovr</code> вернутся к виду до первого сохранения из этой программы.', 'Вернуть', { danger: true }))) return;
  try { applyLoaded(await api.game.restore(S.dir)); toast('Файлы возвращены как было.'); }
  catch (e) { toast('Не получилось: ' + cleanErr(e), true); }
}
const cleanErr = e => String(e && e.message || e).replace(/^Error invoking remote method '[^']+': (Error: )?/, '');

let toastT;
function toast(msg, err, action, ms) {
  const t = $('#toast'); t.innerHTML = '';
  const text = el('span', 'toast__text'); text.textContent = msg; t.append(text);
  if (action) { const b = el('button', 'btn btn--sm', esc(action.label)); b.onclick = () => { action.run(); t.classList.remove('show'); }; t.append(b); }
  t.classList.toggle('err', !!err); t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms || 4200);
}

/* ---------------- иконки меню ---------------- */
const IC = {
  anim: '<path d="M4 12h3l2-6 4 12 2-6h5"/>',
  gfx: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 8a5 5 0 0 1 0 8"/>',
  window: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9h18"/>',
  all: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  files: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
  guide: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
};
document.querySelectorAll('[data-ic]').forEach(s => s.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[s.dataset.ic]}</svg>`);

/* ---------------- обновления (как в Aion UI Builder) ---------------- */
async function initUpdates() {
  const check = $('#app-check-update'), button = $('#app-update');
  const info = await api.update.info();
  $('#app-version').textContent = `v${info.version}`;
  api.update.onStatus(s => {
    if (s.state === 'available') {
      button.hidden = false; button.disabled = false; button.textContent = `Обновить до v${s.version}`; button.dataset.state = 'available';
    } else if (s.state === 'downloading') {
      button.hidden = false; button.disabled = true; button.textContent = `Загрузка ${Math.round(s.percent || 0)}%`;
    } else if (s.state === 'ready') {
      button.hidden = false; button.disabled = false; button.textContent = 'Перезапустить и обновить'; button.dataset.state = 'ready';
    } else if (s.state === 'current' && check.dataset.manual) {
      delete check.dataset.manual; toast(`Установлена последняя версия (v${info.version}).`);
    } else if (s.state === 'error') {
      if (check.dataset.manual) { delete check.dataset.manual; toast('Не удалось проверить обновления: ' + (s.message || 'нет связи'), true); }
      if (button.dataset.state !== 'available' && button.dataset.state !== 'downloading') return;
      button.hidden = false; button.disabled = false; button.textContent = 'Повторить обновление'; button.dataset.state = 'available';
      toast(`Обновление не скачалось: ${s.message || 'нет связи'}`, true);
    }
  });
  check.onclick = async () => {
    check.disabled = true; check.textContent = 'Проверка…'; check.dataset.manual = '1';
    try { const r = await api.update.check(); if (r && r.dev) { delete check.dataset.manual; toast('Обновления проверяются только в установленной версии.'); } }
    catch (e) { /* ошибку покажет событие error */ }
    setTimeout(() => { check.disabled = false; check.textContent = 'Проверить обновления'; }, 1200);
  };
  button.onclick = async () => {
    if (button.dataset.state === 'ready') {
      if (S.cfgDoc && isDirty() && !(await ask('Обновить сейчас?', 'Есть несохранённые правки — они пропадут при перезапуске.', 'Обновить', { danger: true }))) return;
      button.disabled = true; button.textContent = 'Устанавливаю…'; return api.update.install();
    }
    // состояние ставим до загрузки: download() завершается уже после события «ready»
    button.disabled = true; button.textContent = 'Загрузка…'; button.dataset.state = 'downloading';
    try { await api.update.download(); } catch (e) { /* покажет событие error */ }
  };
}

/* ---------------- события ---------------- */
document.querySelectorAll('.nav').forEach(n => n.onclick = () => show(n.dataset.view));
$('#folder-btn').onclick = pickDir; $('#pick-btn').onclick = pickDir; $('#found-other').onclick = pickDir;
$('#found-ok').onclick = () => { $('#foundbar').hidden = true; api.game.confirm(); };
document.querySelectorAll('[data-reveal]').forEach(b => b.onclick = () => S.dir && api.game.reveal(S.dir));
$('#save-btn').onclick = save; $('#restore-btn').onclick = restore;
$('#ovr-extra').oninput = e => { S.extra = e.target.value; update(); };
$('#all-search').oninput = renderAll2;
$('#add-btn').onclick = () => {
  const k = $('#new-key').value.trim(), v = $('#new-val').value.trim().replace(/"/g, '');
  if (!/^[A-Za-z0-9_.]+$/.test(k)) { toast('Имя параметра — латиница, цифры, _ и точка.', true); return; }
  S.cfg.set(k, v); $('#new-key').value = $('#new-val').value = ''; update(); renderAll2(); toast(`Добавлено: ${k}`);
};
document.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => {
  const p = b.dataset.preset;
  for (const a of ANIM) {
    if (p === 'off') setA(a.key, undefined);
    else if (p === 'max') setA(a.key, a.max);
    else if (p === 'blend') { if (/blend/.test(a.key)) setA(a.key, a.max); }
  }
  update(); renderAnim(); renderAll2();
});
document.querySelectorAll('[data-download]').forEach(b => b.onclick = async () => {
  if (b.dataset.download === 'cfg') { if (await api.file.export('system.cfg', buildCfg())) toast('Копия сохранена.'); }
  else { const t = buildOvr(); if (!t) return toast('system.ovr пустой — сохранять нечего.'); if (await api.file.export('system.ovr', t)) toast('Копия сохранена.'); }
});
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } });

$('#w-min').onclick = () => api.window.minimize();
$('#w-max').onclick = () => api.window.toggle();
$('#w-close').onclick = async () => {
  if (S.cfgDoc && isDirty() && !(await ask('Закрыть программу?', 'Есть несохранённые правки.', 'Закрыть без сохранения', { danger: true }))) return;
  api.window.close();
};
document.querySelector('.titlebar .drag').ondblclick = () => api.window.toggle();

(async function init() {
  show('start'); update();
  initUpdates().catch(() => {});
  try { const res = await api.game.init(); if (res) applyLoaded(res); } catch (e) { toast('Не удалось прочитать папку игры: ' + cleanErr(e), true); }
})();
