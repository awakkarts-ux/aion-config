'use strict';

const { contextBridge, ipcRenderer } = require('electron');

const call = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('api', {
  game: {
    init: () => call('game:init'),
    pick: () => call('game:pick'),
    reload: (dir) => call('game:reload', dir),
    save: (payload) => call('game:save', payload),
    restore: (dir) => call('game:restore', dir),
    running: () => call('game:running'),
    reveal: (dir) => call('game:reveal', dir),
    confirm: () => call('game:confirm'),
  },
  file: {
    export: (name, text) => call('file:export', { name, text }),
  },
  update: {
    info: () => call('update:info'),
    check: () => call('update:check'),
    download: () => call('update:download'),
    install: () => call('update:install'),
    onStatus: (fn) => ipcRenderer.on('update:status', (_e, s) => fn(s)),
  },
  window: {
    minimize: () => call('window:minimize'),
    toggle: () => call('window:toggle'),
    close: () => call('window:close'),
    onState: (fn) => ipcRenderer.on('window:state', (_e, max) => fn(max)),
  },
});
