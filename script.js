(function () {
  'use strict';

  var hero        = document.getElementById('hero');
  var heroBgImg   = document.getElementById('heroBgImg');
  var heroContent = document.getElementById('heroContent');
  var cardWrap    = hero ? hero.querySelector('.hero__card-wrap') : null;
  var heroScroll  = hero ? hero.querySelector('.hero__scroll') : null;
  var nav         = document.getElementById('nav');
  var burger      = document.getElementById('burger');
  var tickerTrack = document.getElementById('tickerTrack');

  /* ─── 1. ENTRY ANIMATIONS ──────────────────────────── */
  if (hero) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('hero--ready');
        if (heroScroll) {
          setTimeout(function () { heroScroll.style.opacity = '1'; }, 1400);
        }
      });
    });
  }

  /* ─── 2. NAV scroll ────────────────────────────────── */
  function updateNav() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 20);
  }
  if (nav) {
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ─── 3. MOBILE NAV DRAWER ─────────────────────────── */
  var drawer = null;

  function buildDrawer() {
    if (drawer) return;
    drawer = document.createElement('div');
    drawer.className = 'nav__drawer';
    drawer.innerHTML =
      '<a href="#diagnostico">Diagnóstico</a>' +
      '<a href="#solucoes">Soluções</a>' +
      '<a href="#depoimentos">Resultados</a>' +
      '<a href="#contato" class="nav__cta">Conversar</a>';
    document.body.appendChild(drawer);

    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger) {
    burger.addEventListener('click', function () {
      buildDrawer();
      var open = drawer.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', function (e) {
      if (drawer && drawer.classList.contains('is-open')) {
        if (!drawer.contains(e.target) && !burger.contains(e.target)) {
          closeDrawer();
        }
      }
    });
  }

  /* ─── 4. PARALLAX — mouse move on hero ─────────────── */
  if (hero && heroBgImg && cardWrap && window.matchMedia('(hover: hover)').matches) {
    var px = 0, py = 0, tx = 0, ty = 0, rafId = null;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tickParallax() {
      px = lerp(px, tx, 0.055);
      py = lerp(py, ty, 0.055);
      heroBgImg.style.transform = 'scale(1.06) translate(' + (-px * 12) + 'px,' + (-py * 7) + 'px)';
      cardWrap.style.transform = 'perspective(900px) rotateY(' + (px * 3) + 'deg) rotateX(' + (-py * 2) + 'deg)';
      rafId = null;
      if (Math.abs(tx - px) > 0.002 || Math.abs(ty - py) > 0.002) {
        rafId = requestAnimationFrame(tickParallax);
      }
    }

    function scheduleParallax() { if (!rafId) rafId = requestAnimationFrame(tickParallax); }

    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      scheduleParallax();
    });

    hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; scheduleParallax(); });
  }

  /* ─── 5. SCROLL PARALLAX — hero content ────────────── */
  if (hero && heroContent) {
    var lastScroll = -1;
    function onHeroScroll() {
      var s = window.scrollY;
      if (s === lastScroll) return;
      lastScroll = s;
      var heroH = hero.offsetHeight;
      if (s > heroH) return;
      var p = s / heroH;
      heroContent.style.transform = 'translateY(' + (p * 36) + 'px)';
      heroContent.style.opacity = String(Math.max(0, 1 - p * 1.5));
    }
    window.addEventListener('scroll', onHeroScroll, { passive: true });
  }

  /* ─── 6. COUNT-UP ───────────────────────────────────── */
  var statEls = document.querySelectorAll('.hero__stat-number[data-target]');

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function runCount(el) {
    var target   = parseFloat(el.dataset.target) || 0;
    var prefix   = el.dataset.prefix  || '';
    var suffix   = el.dataset.suffix  || '';
    var duration = 1800;
    var start    = null;

    function frame(ts) {
      if (!start) start = ts;
      var elapsed  = ts - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = easeOutQuart(progress);
      var value    = Math.round(eased * target);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window && statEls.length) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCount(entry.target); countObs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    statEls.forEach(function (el) { countObs.observe(el); });
  }

  /* ─── 7. TICKER ─────────────────────────────────────── */
  if (tickerTrack) {
    function calibrate() {
      var list = tickerTrack.firstElementChild;
      if (!list) return;
      var w = list.scrollWidth;
      if (!w) return;
      var dur = Math.max(28, w / 90);
      tickerTrack.style.animationDuration = dur.toFixed(1) + 's';
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(calibrate);
    } else { window.addEventListener('load', calibrate); }
    window.addEventListener('resize', calibrate, { passive: true });
  }

})();

/* ─── 8. DIAGNÓSTICO ────────────────────────────────── */
(function () {
  var pills = document.querySelectorAll('.diag__pill');
  var cards = document.querySelectorAll('.sol-card');
  if (!pills.length || !cards.length) return;

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var target = pill.dataset.target;
      pills.forEach(function (p) { p.classList.remove('is-active'); });
      pill.classList.add('is-active');

      cards.forEach(function (card) {
        if (card.id === target) card.classList.add('is-highlighted');
        else card.classList.remove('is-highlighted');
      });

      var targetCard = document.getElementById(target);
      if (targetCard) {
        var navH = document.getElementById('nav') ? document.getElementById('nav').offsetHeight : 72;
        var top = targetCard.getBoundingClientRect().top + window.scrollY - navH - 32;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.diag__pill') && !e.target.closest('.sol-card')) {
      pills.forEach(function (p) { p.classList.remove('is-active'); });
      cards.forEach(function (c) { c.classList.remove('is-highlighted'); });
    }
  });
})();

/* ─── 9. REVEAL on scroll ───────────────────────────── */
(function () {
  var revealEls = document.querySelectorAll(
    '.sol-card, .diag__pill, .solucoes__combo, .depo__card, .contato__card, .contato__whatsapp, .contato__badge-brasil, .contato__form-wrapper'
  );
  if (!revealEls.length || !('IntersectionObserver' in window)) return;

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  revealEls.forEach(function (el, i) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition =
      'opacity 0.6s cubic-bezier(0.16,1,0.3,1) ' + (i * 0.05) + 's, ' +
      'transform 0.6s cubic-bezier(0.16,1,0.3,1) ' + (i * 0.05) + 's';
    obs.observe(el);
  });
})();

/* ─── 10. WA FLOAT ──────────────────────────────────── */
(function () {
  var waFloat = document.querySelector('.wa-float');
  if (!waFloat) return;
  waFloat.style.opacity = '0';
  waFloat.style.transition = 'opacity 0.5s ease, transform 0.25s ease, box-shadow 0.25s ease';
  setTimeout(function () { waFloat.style.opacity = '1'; }, 2500);
})();

/* ─── 11. MÁSCARA DE TELEFONE ───────────────────────── */
function mascaraTelefone(input) {
  var valor = input.value.replace(/\D/g, '');
  if (valor.length > 11) valor = valor.slice(0, 11);
  if (valor.length > 10) {
    valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (valor.length > 6) {
    valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (valor.length > 2) {
    valor = valor.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
  } else if (valor.length > 0) {
    valor = valor.replace(/^(\d{0,2}).*/, '($1');
  }
  input.value = valor;
}

var telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', function () {
    mascaraTelefone(this);
  });
  telefoneInput.addEventListener('paste', function () {
    setTimeout(function () { mascaraTelefone(telefoneInput); }, 0);
  });
}

/* ─── 12. FORMULÁRIO ────────────────────────────────── */
var form = document.getElementById('contatoForm');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    document.querySelectorAll('.form__input.error, .form__select.error, .form__textarea.error')
      .forEach(function (el) { el.classList.remove('error'); });

    var isValid = true;
    var requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(function (field) {
      if (field.type === 'checkbox') {
        if (!field.checked) isValid = false;
      } else if (!field.value.trim()) {
        field.classList.add('error');
        isValid = false;
      }
    });

    var emailField = document.getElementById('email');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.classList.add('error');
      isValid = false;
    }

    var telefoneField = document.getElementById('telefone');
    if (telefoneField) {
      var telefoneNumeros = telefoneField.value.replace(/\D/g, '');
      if (telefoneNumeros.length !== 11) {
        telefoneField.classList.add('error');
        isValid = false;
      }
    }

    if (!isValid) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    var nome     = document.getElementById('nome').value.trim();
    var email    = document.getElementById('email').value.trim();
    var telefone = document.getElementById('telefone').value.trim();
    var empresa  = document.getElementById('empresa').value.trim();
    var cargoEl  = document.getElementById('cargo');
    var cargo    = cargoEl.options[cargoEl.selectedIndex].text;
    var tamanhoEl = document.getElementById('tamanho');
    var tamanho  = tamanhoEl.options[tamanhoEl.selectedIndex].text;
    var mensagem = document.getElementById('mensagem').value.trim();

    var agora = new Date();
    var data  = agora.toLocaleDateString('pt-BR');
    var hora  = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    var texto =
      'Bem Vindo a JM-Analytics %0A%0A' +
      'DADOS DO CONTATO%0A' +
      '• Nome: ' + nome + '%0A' +
      '• Telefone: ' + telefone + '%0A' +
      '• E-mail: ' + email + '%0A%0A' +
      'DADOS DA EMPRESA%0A' +
      '• Empresa: ' + empresa + '%0A' +
      '• Cargo: ' + cargo + '%0A' +
      '• Tamanho: ' + tamanho + '%0A%0A' +
      'MENSAGEM%0A' +
      mensagem + '%0A%0A' +
      '---%0A' 

    var urlWA = 'https://wa.me/5521969181327?text=' + texto;

    var submitBtn = form.querySelector('.form__submit');
    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Redirecionando...';
    submitBtn.disabled = true;

    setTimeout(function () {
      window.open(urlWA, '_blank');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
    }, 1000);
  });

  form.querySelectorAll('.form__input, .form__select, .form__textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      this.classList.remove('error');
    });
  });
}