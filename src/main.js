'use strict';

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

/* Где обычно стоит клиент: проверяем при первом запуске, если папка не выбрана. */
const GUESSES = ['C', 'D', 'E', 'F', 'G'].flatMap((d) => [
  `${d}:\\Aion Empire\\classic`,
  `${d}:\\Games\\Aion Classic`,
  `${d}:\\Aion Classic`,
  `${d}:\\4game\\Aion Classic`,
]);

const BK_CFG = 'system.cfg.editor-backup';
const BK_OVR = 'system.ovr.editor-backup';
const BK_NONE = 'system.ovr.editor-backup-none';

let win = null;

/* ---------------- настройки программы ---------------- */
const configPath = () => path.join(app.getPath('userData'), 'config.json');
function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}
const getConfig = () => readJson(configPath(), {});
const setConfig = (patch) => writeJson(configPath(), Object.assign(getConfig(), patch));

/* ---------------- файлы игры ---------------- */
const hasCfg = (dir) => !!dir && fs.existsSync(path.join(dir, 'system.cfg'));
const readOrNull = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);

/** Запись через временный файл: при сбое старый файл остаётся целым.
    Защиту «только чтение» снимаем на время записи. */
function writeAtomic(file, text) {
  setReadOnly(file, false);
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, text, 'utf8');
  fs.renameSync(tmp, file);
}

/** Папка клиента из Aion UI Builder, если он установлен: там часто уже указан нужный путь. */
function builderRoot() {
  const p = path.join(app.getPath('appData'), 'Aion UI Builder', 'config.json');
  return readJson(p, {}).clientRoot || null;
}

function findGameDir() {
  const saved = getConfig().gameDir;
  if (hasCfg(saved)) return saved;
  const candidates = [builderRoot(), ...GUESSES].filter(Boolean);
  return candidates.find(hasCfg) || null;
}

/** «Только чтение»: на Windows это атрибут файла, Node меняет его через chmod. */
const isReadOnly = (file) => { try { return (fs.statSync(file).mode & 0o200) === 0; } catch { return false; } };
const setReadOnly = (file, on) => { if (fs.existsSync(file)) fs.chmodSync(file, on ? 0o444 : 0o666); };

function load(dir) {
  const cfgFile = path.join(dir, 'system.cfg');
  return {
    dir,
    cfg: fs.readFileSync(cfgFile, 'utf8'),
    ovr: readOrNull(path.join(dir, 'system.ovr')),
    hasBackup: fs.existsSync(path.join(dir, BK_CFG)),
    readOnly: isReadOnly(cfgFile),
  };
}

/** Запущен ли клиент: при выходе он перезапишет system.cfg. */
function gameRunning() {
  if (process.platform !== 'win32') return Promise.resolve(false);
  return new Promise((resolve) => {
    execFile('tasklist', ['/FO', 'CSV', '/NH'], { windowsHide: true }, (err, out) => {
      if (err) return resolve(false);
      resolve(/"aion\.bin"/i.test(out) || /"aionclassic\.bin"/i.test(out));
    });
  });
}

ipcMain.handle('game:init', () => {
  const saved = getConfig().gameDir;
  const confirmed = !!getConfig().gameDirConfirmed && saved && hasCfg(saved);
  const dir = findGameDir();
  if (!dir) return null;
  setConfig({ gameDir: dir });
  // папку нашли сами — пусть пользователь увидит путь и подтвердит его
  return Object.assign(load(dir), { autoFound: !confirmed });
});
ipcMain.handle('game:confirm', () => setConfig({ gameDirConfirmed: true }));

ipcMain.handle('game:pick', async () => {
  const res = await dialog.showOpenDialog(win, {
    title: 'Папка игры (где лежит system.cfg)',
    defaultPath: getConfig().gameDir || undefined,
    properties: ['openDirectory'],
  });
  if (res.canceled || !res.filePaths[0]) return { canceled: true };
  const dir = res.filePaths[0];
  if (!hasCfg(dir)) return { error: `В папке «${path.basename(dir)}» нет system.cfg. Выбери корневую папку клиента.` };
  setConfig({ gameDir: dir, gameDirConfirmed: true });
  return load(dir);
});

ipcMain.handle('game:reload', (_e, dir) => (hasCfg(dir) ? load(dir) : { error: 'system.cfg пропал из папки.' }));
ipcMain.handle('game:running', () => gameRunning());
ipcMain.handle('game:reveal', (_e, dir) => {
  if (!hasCfg(dir)) return null;
  const ovr = path.join(dir, 'system.ovr');
  shell.showItemInFolder(fs.existsSync(ovr) ? ovr : path.join(dir, 'system.cfg'));
  return true;
});

ipcMain.handle('game:save', (_e, { dir, cfg, ovr, readOnly }) => {
  if (!hasCfg(dir)) throw new Error('В папке нет system.cfg.');
  if (typeof cfg !== 'string' || typeof ovr !== 'string') throw new Error('Неверные данные.');
  const cfgFile = path.join(dir, 'system.cfg');
  const ovrFile = path.join(dir, 'system.ovr');
  // резервные копии — один раз, до первой правки из программы
  if (!fs.existsSync(path.join(dir, BK_CFG))) {
    fs.copyFileSync(cfgFile, path.join(dir, BK_CFG));
    setReadOnly(path.join(dir, BK_CFG), false);
    if (fs.existsSync(ovrFile)) fs.copyFileSync(ovrFile, path.join(dir, BK_OVR));
    else fs.writeFileSync(path.join(dir, BK_NONE), 'system.ovr не существовал до первой правки\r\n', 'utf8');
  }
  writeAtomic(cfgFile, cfg);
  if (ovr) writeAtomic(ovrFile, ovr);
  else if (fs.existsSync(ovrFile)) { setReadOnly(ovrFile, false); fs.rmSync(ovrFile); }
  setReadOnly(cfgFile, !!readOnly);
  // перечитываем с диска: отчитываемся о том, что реально лежит в папке
  const res = load(dir);
  if (res.cfg !== cfg) throw new Error(`system.cfg не записался: ${cfgFile}`);
  if (ovr && res.ovr !== ovr) throw new Error(`system.ovr не записался: ${ovrFile}`);
  if (res.readOnly !== !!readOnly) throw new Error(`Не удалось ${readOnly ? 'поставить' : 'снять'} «только чтение» у ${cfgFile}`);
  setConfig({ gameDirConfirmed: true });
  res.written = ovr ? [cfgFile, ovrFile] : [cfgFile];
  res.removedOvr = !ovr && res.ovr === null;
  return res;
});

ipcMain.handle('game:restore', (_e, dir) => {
  const bk = path.join(dir, BK_CFG);
  if (!fs.existsSync(bk)) throw new Error('Резервной копии нет.');
  writeAtomic(path.join(dir, 'system.cfg'), fs.readFileSync(bk, 'utf8'));
  const bkOvr = path.join(dir, BK_OVR);
  const ovrFile = path.join(dir, 'system.ovr');
  if (fs.existsSync(bkOvr)) writeAtomic(ovrFile, fs.readFileSync(bkOvr, 'utf8'));
  else if (fs.existsSync(path.join(dir, BK_NONE)) && fs.existsSync(ovrFile)) { setReadOnly(ovrFile, false); fs.rmSync(ovrFile); }
  return load(dir); // после возврата system.cfg снова без защиты
});

ipcMain.handle('file:export', async (_e, { name, text }) => {
  const res = await dialog.showSaveDialog(win, { defaultPath: name });
  if (res.canceled || !res.filePath) return false;
  fs.writeFileSync(res.filePath, text, 'utf8');
  return true;
});

/* ---------------- обновления (как в Aion UI Builder) ---------------- */
function setupAutoUpdates() {
  if (!app.isPackaged) return;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.logger = null;
  const send = (s) => win?.webContents.send('update:status', s);
  autoUpdater.on('checking-for-update', () => send({ state: 'checking' }));
  autoUpdater.on('update-available', (info) => send({ state: 'available', version: info.version }));
  autoUpdater.on('update-not-available', (info) => send({ state: 'current', version: info.version }));
  autoUpdater.on('download-progress', (p) => send({ state: 'downloading', percent: p.percent }));
  autoUpdater.on('update-downloaded', (info) => send({ state: 'ready', version: info.version }));
  autoUpdater.on('error', (error) => send({ state: 'error', message: error.message }));
  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 2500);
  setInterval(check, 3 * 60 * 60 * 1000);
}
ipcMain.handle('update:info', () => ({ version: app.getVersion(), packaged: app.isPackaged }));
ipcMain.handle('update:check', async () => {
  if (!app.isPackaged) return { dev: true };
  await autoUpdater.checkForUpdates();
  return {};
});
ipcMain.handle('update:download', () => autoUpdater.downloadUpdate());
// тихая установка поверх и сразу запуск новой версии
ipcMain.handle('update:install', () => setImmediate(() => autoUpdater.quitAndInstall(true, true)));

/* ---------------- окно ---------------- */
ipcMain.handle('window:minimize', () => win?.minimize());
ipcMain.handle('window:toggle', () => {
  if (!win) return false;
  if (win.isMaximized()) win.unmaximize(); else win.maximize();
  return win.isMaximized();
});
ipcMain.handle('window:close', () => win?.close());

function createWindow() {
  const bounds = getConfig().bounds || {};
  win = new BrowserWindow({
    width: bounds.width || 1280,
    height: bounds.height || 820,
    x: bounds.x, y: bounds.y,
    minWidth: 1100,
    minHeight: 640,
    show: false,
    frame: false,
    backgroundColor: '#0b0b0c',
    icon: path.join(__dirname, '..', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, 'ui', 'index.html'));
  win.once('ready-to-show', () => win.show());
  const tell = () => win.webContents.send('window:state', win.isMaximized());
  win.on('maximize', tell);
  win.on('unmaximize', tell);
  win.on('close', () => { if (!win.isMaximized()) setConfig({ bounds: win.getBounds() }); });
  // ссылки — во внешний браузер, внутри окна ничего постороннего не открываем
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    createWindow();
    setupAutoUpdates();
  });
  app.on('window-all-closed', () => app.quit());
}
