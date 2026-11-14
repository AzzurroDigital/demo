/* Crnković servis i instalacije — app.js (no dependencies) */
(function () {
  'use strict';
  var D = document, $ = function (s, c) { return (c || D).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || D).querySelectorAll(s)); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE = '+385992143166', MAIL = 'serviscrnkovic@gmail.com';

  /* reveal on scroll, uneven stagger */
  var OFF = [0, 70, 160, 230, 340];
  $$('.rv').forEach(function (e) { e.style.setProperty('--d', OFF[+(e.getAttribute('data-o') || 0)] + 'ms'); });
  if ('IntersectionObserver' in window && !RM) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    $$('.rv').forEach(function (e) { io.observe(e); });
  } else { $$('.rv').forEach(function (e) { e.classList.add('in'); }); }

  /* header hide/show + dock */
  var top = $('#top'), dock = $('#dock'), hero = $('#hero'), ly = 0, tk = false, mnav = $('#mnav'), burger = $('#burger');
  window.addEventListener('scroll', function () {
    if (tk) return; tk = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (!top.contains(D.activeElement) && !mnav.classList.contains('on')) {
        if (y > ly + 6 && y > 160) top.classList.add('h'); else if (y < ly - 6) top.classList.remove('h');
      }
      if (dock) dock.classList.toggle('on', y > hero.offsetHeight - 120);
      ly = y; tk = false;
    });
  }, { passive: true });
  top.addEventListener('focusin', function () { top.classList.remove('h'); });

  /* mobile menu */
  burger.addEventListener('click', function () {
    var on = mnav.classList.toggle('on'); burger.setAttribute('aria-expanded', on);
  });
  $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { mnav.classList.remove('on'); burger.setAttribute('aria-expanded', 'false'); }); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mnav.classList.contains('on')) { mnav.classList.remove('on'); burger.setAttribute('aria-expanded', 'false'); burger.focus(); } });

  /* brand switcher (tabs) */
  var tabs = $$('[role=tab]');
  function selTab(i, focus) {
    tabs.forEach(function (t, j) {
      var on = i === j, p = D.getElementById(t.getAttribute('aria-controls'));
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      p.hidden = !on; if (on) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); }
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selTab(i); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length;
      if (e.key === 'ArrowRight') { e.preventDefault(); selTab((i + 1) % n, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); selTab((i + n - 1) % n, true); }
      else if (e.key === 'Home') { e.preventDefault(); selTab(0, true); }
      else if (e.key === 'End') { e.preventDefault(); selTab(n - 1, true); }
    });
  });

  /* form: brand links */
  var form = $('#upit-form');
  function syncBrand() {
    var v = (form.querySelector('input[name=marka]:checked') || {}).value;
    $('#bl-vaillant').hidden = v !== 'Vaillant';
    $('#bl-centrometal').hidden = v !== 'Centrometal';
  }
  function setRadio(name, val) {
    var r = form.querySelector('input[name="' + name + '"][value="' + val + '"]');
    if (r) { r.checked = true; }
  }
  $$('input[name=marka]', form).forEach(function (r) { r.addEventListener('change', syncBrand); });
  $$('input[name=usluga]', form).forEach(function (r) {
    r.addEventListener('change', function () {
      if (r.value === 'Ovlašteni Vaillant servis') setRadio('marka', 'Vaillant');
      if (r.value === 'Ovlašteni Centrometal servis') setRadio('marka', 'Centrometal');
      syncBrand();
    });
  });
  /* links that preselect service / brand */
  $$('[data-usluga],[data-marka]').forEach(function (a) {
    a.addEventListener('click', function () {
      var u = a.getAttribute('data-usluga'), m = a.getAttribute('data-marka');
      if (u) { setRadio('usluga', u); if (u.indexOf('Vaillant') > -1) setRadio('marka', 'Vaillant'); if (u.indexOf('Centrometal') > -1) setRadio('marka', 'Centrometal'); }
      if (m) setRadio('marka', m);
      syncBrand();
    });
  });
  syncBrand();

  /* validation + compose */
  function val(id) { return D.getElementById(id).value.trim(); }
  function setErr(id, msg) {
    var f = D.getElementById(id), e = D.getElementById(id + '-err');
    if (f) f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (e) e.textContent = msg || '';
  }
  function validate() {
    var ok = true, first = null;
    var u = form.querySelector('input[name=usluga]:checked');
    $('#usluga-err').textContent = u ? '' : 'Odaberite uslugu.';
    if (!u) { ok = false; first = first || form.querySelector('input[name=usluga]'); }
    if (!val('f-mjesto')) { setErr('f-mjesto', 'Upišite mjesto.'); ok = false; first = first || D.getElementById('f-mjesto'); } else setErr('f-mjesto', '');
    var tel = val('f-tel').replace(/[\s\/-]/g, '');
    if (!tel) { setErr('f-tel', 'Upišite broj telefona da vam se možemo javiti.'); ok = false; first = first || D.getElementById('f-tel'); }
    else if (!/^\+?\d{6,15}$/.test(tel)) { setErr('f-tel', 'Broj telefona nije ispravan. Primjer: 091 234 5678'); ok = false; first = first || D.getElementById('f-tel'); }
    else setErr('f-tel', '');
    $('#status').textContent = ok ? '' : 'Provjerite označena polja.';
    if (first) first.focus();
    return ok;
  }
  function compose() {
    var g = function (n) { var r = form.querySelector('input[name=' + n + ']:checked'); return r ? r.value : ''; };
    var lines = [
      'Usluga: ' + g('usluga'),
      g('vrsta') && 'Vrsta posla: ' + g('vrsta'),
      g('marka') && 'Marka opreme: ' + g('marka'),
      val('f-model') && 'Model: ' + val('f-model'),
      val('f-mjesto') && 'Mjesto: ' + val('f-mjesto'),
      val('f-opis') && 'Opis: ' + val('f-opis'),
      val('f-ime') && 'Ime: ' + val('f-ime'),
      val('f-tel') && 'Tel: ' + val('f-tel')
    ];
    return lines.filter(Boolean).join('\n');
  }
  $('#btn-sms').addEventListener('click', function () {
    if (!validate()) return;
    var sep = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) ? '&' : '?';
    window.location.href = 'sms:' + PHONE + sep + 'body=' + encodeURIComponent(compose());
  });
  $('#btn-mail').addEventListener('click', function () {
    if (!validate()) return;
    var u = (form.querySelector('input[name=usluga]:checked') || {}).value || '';
    window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Upit: ' + u) + '&body=' + encodeURIComponent(compose());
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  var y = $('#yr'); if (y) y.textContent = new Date().getFullYear();
})();
