'use strict';
/* Загружается первым. Если основной скрипт окна упадёт, показываем ошибку
   на экране, а не оставляем окно с неработающими кнопками. */
(function () {
  function show(msg) {
    var box = document.getElementById('fatal');
    if (!box) {
      box = document.createElement('div');
      box.id = 'fatal';
      box.className = 'fatal';
      (document.body || document.documentElement).appendChild(box);
    }
    box.textContent = 'Ошибка в программе — пришли этот текст разработчику:\n' + msg;
  }
  window.addEventListener('error', function (e) { show((e.message || 'ошибка') + (e.filename ? '\n' + e.filename.split('/').pop() + ':' + e.lineno : '')); });
  window.addEventListener('unhandledrejection', function (e) { show(String(e.reason && e.reason.stack || e.reason)); });
})();
