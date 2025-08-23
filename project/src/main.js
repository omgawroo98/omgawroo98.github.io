import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import basicLightbox from 'basiclightbox';
// import 'basiclightbox/dist/basicLightbox.min.css';
import MoveTo from 'moveto';
import { createTimeline, stagger } from 'animejs';

// remove no-js class
document.documentElement.className =
  document.documentElement.className.replace(/\bno-js\b/g, '') + ' js ';

/* Animations
 * -------------------------------------------------- */
const tl = createTimeline({
  easing: 'easeInOutCubic',
  duration: 800,
  autoplay: false
})
  .add({
    targets: '#loader',
    opacity: 0,
    duration: 1000,
    begin() { window.scrollTo(0, 0); }
  })
  .add({
    targets: '#preloader',
    opacity: 0,
    complete() {
      const el = document.querySelector('#preloader');
      if (el) {
        el.style.visibility = 'hidden';
        el.style.display = 'none';
      }
    }
  })
  .add({
    targets: '.s-header',
    translateY: [-100, 0],
    opacity: [0, 1]
  }, '-=200')
  .add({
    targets: ['.s-intro .text-pretitle', '.s-intro .text-huge-title'],
    translateX: [100, 0],
    opacity: [0, 1],
    delay: stagger(400)
  })
  .add({
    targets: '.circles span',
    keyframes: [
      { opacity: [0, .3] },
      { opacity: [.3, .1], delay: stagger(100, { direction: 'reverse' }) }
    ],
    delay: stagger(100, { direction: 'reverse' })
  })
  .add({
    targets: '.intro-social li',
    translateX: [-50, 0],
    opacity: [0, 1],
    delay: stagger(100, { direction: 'reverse' })
  })
  .add({
    targets: '.intro-scrolldown',
    translateY: [100, 0],
    opacity: [0, 1]
  }, '-=800');

/* Preloader
 * -------------------------------------------------- */
function ssPreloader() {
  const preloader = document.querySelector('#preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    const html = document.querySelector('html');
    html?.classList.remove('ss-preload');
    html?.classList.add('ss-loaded');

    document.querySelectorAll('.ss-animated').forEach((item) => {
      item.classList.remove('ss-animated');
    });

    tl.play();
  });
}

/* Mobile Menu
 * ---------------------------------------------------- */
function ssMobileMenu() {
  const toggleButton = document.querySelector('.mobile-menu-toggle');
  const mainNavWrap = document.querySelector('.main-nav-wrap');
  const siteBody = document.body;

  if (!(toggleButton && mainNavWrap)) return;

  toggleButton.addEventListener('click', (event) => {
    event.preventDefault();
    toggleButton.classList.toggle('is-clicked');
    siteBody.classList.toggle('menu-is-open');
  });

  mainNavWrap.querySelectorAll('.main-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 800px)').matches) {
        toggleButton.classList.toggle('is-clicked');
        siteBody.classList.toggle('menu-is-open');
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 801px)').matches) {
      siteBody.classList.remove('menu-is-open');
      toggleButton.classList.remove('is-clicked');
    }
  });
}

/* ScrollSpy
 * ------------------------------------------------------ */
function ssScrollSpy() {
  const sections = document.querySelectorAll('.target-section');
  if (!sections.length) return;

  window.addEventListener('scroll', navHighlight);

  function navHighlight() {
    const scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 50;
      const sectionId = current.getAttribute('id');

      if (!sectionId) return;

      const link = document.querySelector(`.main-nav a[href*="${sectionId}"]`);
      const li = link?.parentElement;

      if (!li) return;

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        li.classList.add('current');
      } else {
        li.classList.remove('current');
      }
    });
  }
}

/* Animate elements in viewport
 * ------------------------------------------------------ */
function ssViewAnimate() {
  const blocks = document.querySelectorAll('[data-animate-block]');
  if (!blocks.length) return;

  window.addEventListener('scroll', viewportAnimation);
  viewportAnimation();

  function viewportAnimation() {
    const scrollY = window.pageYOffset;

    blocks.forEach((current) => {
      const viewportHeight = window.innerHeight;
      const triggerTop = current.offsetTop + viewportHeight * 0.2 - viewportHeight;
      const blockHeight = current.offsetHeight;
      const blockSpace = triggerTop + blockHeight;
      const inView = scrollY > triggerTop && scrollY <= blockSpace;
      const isAnimated = current.classList.contains('ss-animated');

      if (inView && !isAnimated) {
        anime({
          targets: current.querySelectorAll('[data-animate-el]'),
          opacity: [0, 1],
          translateY: [100, 0],
          delay: anime.stagger(400, { start: 200 }),
          duration: 800,
          easing: 'easeInOutCubic',
          begin() {
            current.classList.add('ss-animated');
          }
        });
      }
    });
  }
}

/* Swiper
 * ------------------------------------------------------ */
function ssSwiper() {
  const container = document.querySelector('.swiper-container');
  if (!container) return;

  // using bundle so pagination works without extra module setup
  new Swiper('.swiper-container', {
    slidesPerView: 1,
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      401: { slidesPerView: 1, spaceBetween: 20 },
      801: { slidesPerView: 2, spaceBetween: 32 },
      1201: { slidesPerView: 2, spaceBetween: 80 }
    }
  });
}

/* Lightbox
 * ------------------------------------------------------ */
function ssLightbox() {
  const links = document.querySelectorAll('.folio-list__item-link');
  if (!links.length) return;

  const modals = [];

  links.forEach((link) => {
    const sel = link.getAttribute('href');
    const node = sel ? document.querySelector(sel) : null;
    if (!node) return;

    const instance = basicLightbox.create(node, {
      onShow(inst) {
        const handler = (evt) => {
          if (evt.key === 'Escape' || evt.keyCode === 27) inst.close();
        };
        document.addEventListener('keydown', handler, { once: true });
      }
    });
    modals.push(instance);
  });

  links.forEach((link, i) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      modals[i]?.show();
    });
  });
}

/* Alert boxes
 * ------------------------------------------------------ */
function ssAlertBoxes() {
  document.querySelectorAll('.alert-box').forEach((box) => {
    box.addEventListener('click', (event) => {
      if (event.target.matches('.alert-box__close')) {
        event.stopPropagation();
        event.target.parentElement.classList.add('hideit');
        setTimeout(() => { box.style.display = 'none'; }, 500);
      }
    });
  });
}

/* Smooth scroll
 * ------------------------------------------------------ */
function ssMoveTo() {
  const triggers = document.querySelectorAll('.smoothscroll');
  if (!triggers.length) return;

  const easeFunctions = {
    easeInQuad(t, b, c, d) { t /= d; return c * t * t + b; },
    easeOutQuad(t, b, c, d) { t /= d; return -c * t * (t - 2) + b; },
    easeInOutQuad(t, b, c, d) { t /= d / 2; if (t < 1) return c / 2 * t * t + b; t--; return -c / 2 * (t * (t - 2) - 1) + b; },
    easeInOutCubic(t, b, c, d) { t /= d / 2; if (t < 1) return c / 2 * t * t * t + b; t -= 2; return c / 2 * (t * t * t + 2) + b; }
  };

  const moveTo = new MoveTo({ tolerance: 0, duration: 1200, easing: 'easeInOutCubic', container: window }, easeFunctions);
  triggers.forEach((trigger) => moveTo.registerTrigger(trigger));
}

/* Initialize
 * ------------------------------------------------------ */
(function ssInit() {
  ssPreloader();
  ssMobileMenu();
  ssScrollSpy();
  ssViewAnimate();
  ssSwiper();
  ssLightbox();
  ssAlertBoxes();
  ssMoveTo();
})();
