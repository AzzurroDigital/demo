/* Telma — app.js (no dependencies) */
(function () {
  'use strict';
  var D = document, $ = function (s) { return D.querySelector(s); }, $$ = function (s) { return [].slice.call(D.querySelectorAll(s)); };
  var EN = D.documentElement.lang === 'en';
  var TOW = '+385997616504';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== CONFIG — fill after the owner confirms ===== */
  /* Hours per weekday (0 = Sunday … 6 = Saturday) as [open, close] in 'HH:MM', or null if closed.
     Leave HOURS = null until confirmed: the open/closed indicator stays hidden. */
  var HOURS = null; /* [POTVRDITI] e.g. {1:['07:30','16:00'],2:[...],...,6:['08:00','13:00'],0:null} */
  var TOW_24_7 = false; /* [POTVRDITI] set true only if towing is 0–24, 7 days */

  /* reveal */
  var OFF = [0, 60, 140, 210];
  $$('.rv').forEach(function (e) { e.style.setProperty('--d', OFF[+(e.getAttribute('data-o') || 0)] + 'ms'); });
  if ('IntersectionObserver' in window && !RM) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .12 });
    $$('.rv').forEach(function (e) { io.observe(e); });
  } else $$('.rv').forEach(function (e) { e.classList.add('in'); });

  /* 0–24 badges only when confirmed */
  $$('.badge').forEach(function (b) { b.hidden = !TOW_24_7; if (TOW_24_7 && !RM) b.classList.add('pulse'); });

  /* language toggle keeps the section */
  $$('.lang a').forEach(function (a) {
    a.addEventListener('click', function () { if (location.hash) a.href = a.getAttribute('href').split('#')[0] + location.hash; });
  });

  /* open / closed, Europe/Zagreb */
  function zagrebNow() {
    var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zagreb', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
    return { d: wd, m: (+o.hour % 24) * 60 + (+o.minute) };
  }
  function toM(s) { var a = s.split(':'); return +a[0] * 60 + +a[1]; }
  var st = $('#status');
  if (st && HOURS) {
    var n = zagrebNow(), h = HOURS[n.d], open = !!(h && n.m >= toM(h[0]) && n.m < toM(h[1]));
    st.hidden = false; st.classList.toggle('open', open);
    var txt = open ? (EN ? 'Open now' : 'Sada otvoreno') : (EN ? 'Closed now' : 'Sada zatvoreno');
    if (!open && TOW_24_7) txt += EN ? ' · Towing available on +385 99 761 6504' : ' · Vučna služba je dostupna na 099 761 6504';
    $('#status-t').textContent = txt;
  }

  /* SMS with location — geolocation only after the tap */
  var btn = $('#geo-sms'), gs = $('#geo-status');
  function val(id) { var e = D.getElementById(id); return e ? e.value.trim() : ''; }
  function openSms(loc) {
    var lines = [EN ? 'I need a tow truck.' : 'Trebam vuču.'];
    if (loc) lines.push((EN ? 'My location: ' : 'Moja lokacija: ') + 'https://maps.google.com/?q=' + loc);
    else lines.push(EN ? 'My location (please describe): ' : 'Moja lokacija (opišite gdje ste): ');
    if (val('s-voz')) lines.push((EN ? 'Vehicle: ' : 'Vozilo: ') + val('s-voz'));
    if (val('s-reg')) lines.push((EN ? 'Plate: ' : 'Registracija: ') + val('s-reg'));
    if (val('s-opis')) lines.push(val('s-opis'));
    var sep = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) ? '&' : '?';
    window.location.href = 'sms:' + TOW + sep + 'body=' + encodeURIComponent(lines.join('\n'));
  }
  if (btn) btn.addEventListener('click', function () {
    if (!('geolocation' in navigator)) { gs.textContent = EN ? 'Location unavailable. Write where you are in the message.' : 'Lokacija nije dostupna. Upišite u poruku gdje se nalazite.'; openSms(null); return; }
    gs.textContent = EN ? 'Getting your location…' : 'Dohvaćam lokaciju…';
    navigator.geolocation.getCurrentPosition(function (p) {
      var loc = p.coords.latitude.toFixed(5) + ',' + p.coords.longitude.toFixed(5);
      gs.textContent = EN ? 'Location added to the message.' : 'Lokacija je dodana u poruku.';
      openSms(loc);
    }, function () {
      gs.textContent = EN ? 'Location not shared. Write where you are in the message.' : 'Lokacija nije podijeljena. Upišite u poruku gdje se nalazite.';
      openSms(null);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  });

  var y = $('#yr'); if (y) y.textContent = new Date().getFullYear();
})();
