/* ============================================================
   MOSTBET COLOMBIA — script.js
   Без поп-апов. Только UI-механика страниц.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Шапка: тень при скролле ---------- */
  var hdr = document.getElementById('hdr');
  var up = document.getElementById('up');

  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('is-stuck', y > 8);
    if (up) up.classList.toggle('is-shown', y > 620);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (up) {
    up.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Копирование промокода ---------- */
  document.querySelectorAll('.code').forEach(function (btn) {
    var original = btn.innerHTML;
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-code') || '';

      function done() {
        btn.classList.add('is-done');
        btn.innerHTML = value + ' <em>copiado ✓</em>';
        setTimeout(function () {
          btn.classList.remove('is-done');
          btn.innerHTML = original;
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(fallback);
      } else {
        fallback();
      }

      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  });

  /* ---------- Фильтры бонусов ---------- */
  var filters = document.querySelectorAll('.filter');
  var bonuses = document.querySelectorAll('.bonus');

  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      filters.forEach(function (x) { x.classList.remove('is-on'); });
      f.classList.add('is-on');
      var pick = f.getAttribute('data-f');
      bonuses.forEach(function (card) {
        var cat = card.getAttribute('data-cat');
        card.classList.toggle('is-hidden', !(pick === 'all' || cat === pick));
      });
    });
  });

  /* ---------- FAQ: одновременно открыт один пункт ---------- */
  var faqItems = document.querySelectorAll('.faq details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---------- Оглавление: подсветка активного раздела ---------- */
  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    var targets = [];

    tocLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) { map[id] = link; targets.push(el); }
    });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (l) { l.classList.remove('is-active'); });
          var active = map[en.target.id];
          if (active) active.classList.add('is-active');
        }
      });
    }, { rootMargin: '-96px 0px -70% 0px', threshold: 0 });

    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- Плавное появление блоков ----------
     Важно: .reveal ставит opacity:0, поэтому нужна страховка.
     Если IntersectionObserver не сработает (фоновая вкладка,
     prerender, троттлинг рендера) — блоки открываем вручную. */
  var reveals = [].slice.call(document.querySelectorAll(
    '.card, .step, .bonus, .fig--wide, .band, .codebox, .pros__col, .author, .quote, .formbox, .tbl-wrap'
  ));
  reveals.forEach(function (el) { el.classList.add('reveal'); });

  function sweepReveals() {
    var h = window.innerHeight || document.documentElement.clientHeight;
    reveals = reveals.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < h - 40 && r.bottom > 0) {
        el.classList.add('is-in');
        return false;
      }
      return true;
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: .1 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Подстраховка поверх observer'а: дешёвая проверка по rAF при скролле */
  var sweepQueued = false;
  function queueSweep() {
    if (sweepQueued) return;
    sweepQueued = true;
    window.requestAnimationFrame(function () {
      sweepQueued = false;
      sweepReveals();
    });
  }
  sweepReveals();
  window.addEventListener('scroll', queueSweep, { passive: true });
  window.addEventListener('resize', queueSweep, { passive: true });
  window.addEventListener('load', sweepReveals);

  /* ---------- Форма обратной связи: никуда не отправляется ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var ok = document.getElementById('formOk');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (ok) {
        ok.classList.add('is-shown');
        ok.setAttribute('role', 'status');
      }
      form.reset();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        var label = btn.textContent;
        btn.textContent = 'Mensaje enviado ✓';
        btn.disabled = true;
        setTimeout(function () { btn.textContent = label; btn.disabled = false; }, 4000);
      }
      if (ok && ok.scrollIntoView) ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---------- Партнёрские переходы ---------- */
  /* ЗАМЕНИТЬ ссылку на свою CO-кампанию из партнёрки */
  var OFFER = 'https://xtsplkmost.com/8BPU?sub1=mostbetcolombia-es.com';

  document.querySelectorAll('a[href="/go"], a[href="/go/"]').forEach(function (link) {
    link.setAttribute('rel', 'nofollow noopener');
    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.open(OFFER, '_blank', 'noopener');
    });
  });

});
