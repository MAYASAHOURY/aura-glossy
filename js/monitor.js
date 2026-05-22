/* ============================================================
   Aura Glossy — Lightweight Error Monitor
   Catches all JS errors + promise rejections.
   Stores in localStorage rolling log + Firestore (auth users).
   Access logs: auraMonitor.getLogs() in browser console.
   ============================================================ */
(function () {
  'use strict';

  var MAX_LOCAL  = 50;   // max errors kept in localStorage
  var STORAGE_KEY = 'aura_errors';

  /* ── Read / write local log ──────────────────────────────── */
  function readLog() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function writeLog(entries) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_LOCAL))); }
    catch {}
  }

  /* ── Capture one error ───────────────────────────────────── */
  function capture(type, message, source, line, stack) {
    var entry = {
      type    : type,
      message : String(message || 'Unknown error').slice(0, 300),
      source  : String(source  || location.pathname).slice(0, 200),
      line    : line || 0,
      stack   : String(stack   || '').slice(0, 600),
      url     : location.href.slice(0, 200),
      ts      : new Date().toISOString()
    };

    // 1. Console (always)
    console.error('[Aura Monitor]', entry.type, '—', entry.message, '\nat', entry.source + ':' + entry.line);

    // 2. Local rolling log
    var log = readLog();
    log.push(entry);
    writeLog(log);

    // 3. Firestore (only when user is authenticated, best-effort)
    try {
      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
        var user = firebase.auth().currentUser;
        if (user) {
          firebase.firestore().collection('errors').add(
            Object.assign({}, entry, { uid: user.uid })
          ).catch(function () {});
        }
      }
    } catch (_) {}
  }

  /* ── Global error handler ────────────────────────────────── */
  var _origOnError = window.onerror;
  window.onerror = function (msg, src, line, col, err) {
    capture('js-error', msg, src, line, err ? err.stack : '');
    if (typeof _origOnError === 'function') _origOnError(msg, src, line, col, err);
    return false;
  };

  /* ── Unhandled promise rejections ────────────────────────── */
  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason;
    var msg    = reason instanceof Error ? reason.message : String(reason);
    var stack  = reason instanceof Error ? reason.stack   : '';
    capture('unhandled-rejection', msg, location.pathname, 0, stack);
  });

  /* ── Public API ──────────────────────────────────────────── */
  window.auraMonitor = {
    capture  : capture,
    getLogs  : readLog,
    clearLogs: function () { localStorage.removeItem(STORAGE_KEY); }
  };
})();
