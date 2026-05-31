'use strict';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth <= 680;

/* =====================================================
   LENIS — inertia scroll
===================================================== */
const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  mouseMultiplier: 0.85,
  smoothTouch: false,
});

gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* =====================================================
   HEADER scroll state
===================================================== */
const siteHeader = document.getElementById('siteHeader');
const pageTop    = document.getElementById('pageTop');

lenis.on('scroll', ({ scroll }) => {
  siteHeader?.classList.toggle('scrolled', scroll > 80);
  pageTop?.classList.toggle('show', scroll > 400);
});

/* =====================================================
   HAMBURGER
===================================================== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('open', open);
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
    });
  });
}

/* =====================================================
   SMOOTH ANCHOR SCROLL (Lenis)
===================================================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -72, duration: 2.0 });
  });
});

if (prefersReduced) {
  // ReducedMotion: skip opening, reveal everything immediately
  const opening = document.getElementById('opening');
  if (opening) opening.style.display = 'none';
  document.querySelectorAll('.reveal-text').forEach(el => el.classList.add('is-revealed'));
  document.querySelectorAll('.slit-wrap').forEach(el => gsap.set(el, { clipPath: 'inset(0%)' }));
} else {
  /* =====================================================
     OPENING — カーテン開き
  ===================================================== */
  const opening = document.getElementById('opening');

  lenis.stop();

  const openingTl = gsap.timeline({
    onComplete: () => {
      if (opening) opening.style.display = 'none';
    }
  });

  openingTl
    .from('.opening__en',          { opacity: 0, y: 12, duration: 1.0, ease: 'power2.out' }, 0.3)
    .from('.opening__rule',        { scaleX: 0,  duration: 0.9, ease: 'power2.inOut', transformOrigin: 'center' }, 1.1)
    .from('.opening__ja',          { opacity: 0, y: 8,  duration: 0.8, ease: 'power2.out' }, 1.6)
    .to('.opening__text',          { opacity: 0, duration: 0.45, ease: 'power2.in' }, 2.55)
    .to('.opening__panel--top',    { yPercent: -100, duration: 1.0, ease: 'expo.inOut' }, 2.7)
    .to('.opening__panel--bottom', { yPercent: 100,  duration: 1.0, ease: 'expo.inOut' }, 2.7)
    .call(() => lenis.start(), null, 2.7)
    // Hero content フェードイン — カーテンが開くと同時に
    .from('.hero__eyebrow', { opacity: 0, y: 16, duration: 1.2, ease: 'power3.out' }, 2.85)
    .from('.hero__title',   { opacity: 0, y: 24, duration: 1.4, ease: 'power3.out' }, 3.05)
    .from('.hero__desc',    { opacity: 0, y: 20, duration: 1.2, ease: 'power3.out' }, 3.3)
    .from('.hero__cta',     { opacity: 0, y: 16, duration: 1.0, ease: 'power3.out' }, 3.5);

  /* =====================================================
     HERO PARALLAX
  ===================================================== */
  gsap.to('#heroPhoto', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });

  /* =====================================================
     SLIT REVEAL — スリット開き
  ===================================================== */
  const slitWraps = document.querySelectorAll('.slit-wrap[data-slit]');

  slitWraps.forEach(wrap => {
    gsap.fromTo(wrap,
      { clipPath: 'inset(44% 0 44% 0)' },
      {
        clipPath: 'inset(0% 0 0% 0)',
        ease: 'expo.inOut',
        duration: 1.6,
        scrollTrigger: {
          trigger: wrap,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      }
    );

    const nearbyRule = wrap.closest('[class*="__"]')
      ?.parentElement
      ?.querySelector('.gold-rule-thin');
    if (nearbyRule) {
      ScrollTrigger.create({
        trigger: wrap,
        start: 'top 78%',
        onEnter: () => nearbyRule.classList.add('flash'),
        once: true,
      });
    }

    // パララックス — デスクトップのみ（モバイルはパフォーマンス優先で無効）
    if (!isMobile) {
      const img = wrap.querySelector('img');
      if (img) {
        gsap.fromTo(img,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: wrap,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.8,
            },
          }
        );
      }
    }
  });

  /* =====================================================
     STUDIO WIDE PHOTO — slit + gold flash
  ===================================================== */
  const studioPhoto = document.getElementById('studioPhoto');
  const studioFlash = document.querySelector('.studio__gold-flash');
  const studioImg   = studioPhoto?.querySelector('img');

  if (studioPhoto) {
    gsap.fromTo(studioPhoto,
      { clipPath: 'inset(40% 0 40% 0)' },
      {
        clipPath: 'inset(0% 0 0% 0)',
        ease: 'expo.inOut',
        duration: 2.0,
        scrollTrigger: {
          trigger: studioPhoto,
          start: 'top 80%',
          toggleActions: 'play none none none',
          onEnter: () => {
            setTimeout(() => studioFlash?.classList.add('is-flashing'), 600);
          },
        },
      }
    );

    if (studioImg && !isMobile) {
      gsap.fromTo(studioImg,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: studioPhoto,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
        }
      );
    }
  }

  /* =====================================================
     TEXT REVEAL — フェードアップ
  ===================================================== */
  const reveals = document.querySelectorAll('.reveal-text');

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || '0');
      setTimeout(() => {
        entry.target.classList.add('is-revealed');
        const rule = entry.target.querySelector('.gold-rule-thin');
        if (rule) setTimeout(() => rule.classList.add('flash'), 400);
      }, delay);
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });

  reveals.forEach(el => revealObs.observe(el));
}

/* =====================================================
   FAQ ACCORDION
===================================================== */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* =====================================================
   CONTACT FORM
===================================================== */
const contactForm = document.getElementById('contactForm');
const formThanks  = document.getElementById('formThanks');

if (contactForm && formThanks) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    contactForm.querySelectorAll('[required]').forEach(f => {
      if (!f.value.trim()) valid = false;
    });
    if (!valid) return;
    contactForm.style.display = 'none';
    formThanks.classList.add('show');
  });
}
