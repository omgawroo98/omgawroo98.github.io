// src/scripts/main.js
import anime from 'animejs'

// --- Guard against SSR and duplicate HMR inits
if (typeof window !== 'undefined' && !window.__omarInit) {
    window.__omarInit = true;

    // remove no-js class
    document.documentElement.className =
        document.documentElement.className.replace(/\bno-js\b/g, '') + ' js ';

    (async function main() {
        // --------------- Helpers
        const $ = (sel, root = document) => root.querySelector(sel);
        const $$ = (sel, root = document) => root.querySelectorAll(sel);

        const has = {
            preloader: () => !!$('#preloader'),
            swiper: () => !!$('.swiper-container'),
            folio: () => $$('.folio-list__item-link').length > 0,
            alerts: () => $$('.alert-box').length > 0,
            moveTo: () => $$('.smoothscroll').length > 0,
            animateBlocks: () => $$('[data-animate-block]').length > 0,
        };

        // --------- Anime.js (normalize module shape + names)
        const animeMod = await import('animejs/lib/anime.es.js');

        // --------------- PRELOADER + INTRO
        const introTimeline = anime.timeline({
            easing: 'easeInOutCubic',
            duration: 850,
            autoplay: false
        })
            .add({
                targets: '#loader',
                opacity: 0,
                duration: 500,
                begin: function (anim) {
                    window.scrollTo(0, 0);
                }
            })
            .add({
                targets: '#preloader',
                duration: 500,
                opacity: 0,
                complete: function (anim) {
                    document.querySelector("#preloader").style.visibility = "hidden";
                    document.querySelector("#preloader").style.display = "none";
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
                delay: anime.stagger(400)
            })
            .add({
                targets: '.circles span',
                keyframes: [
                    { opacity: [0, .3] },
                    { opacity: [.3, .1], delay: anime.stagger(100, { direction: 'reverse' }) }
                ],
                delay: anime.stagger(100, { direction: 'reverse' })
            })
            .add({
                targets: '.intro-social li',
                translateX: [-50, 0],
                opacity: [0, 1],
                delay: anime.stagger(100, { direction: 'reverse' })
            })
            .add({
                targets: '.intro-scrolldown',
                translateY: [100, 0],
                opacity: [0, 1]
            }, '-=800');

        function startPreloaderSequence() {
            console.log("this is running!")
            if (!has.preloader()) {
                document.documentElement.classList.remove('ss-preload');
                document.documentElement.classList.add('ss-loaded');
                return;
            }

            const MIN_SHOW_MS = 500;
            const t0 = performance.now();

            const run = () => {
                const elapsed = performance.now() - t0;
                const delay = Math.max(0, MIN_SHOW_MS - elapsed);
                setTimeout(() => {

                    document.documentElement.classList.remove('ss-preload');
                    document.documentElement.classList.add('ss-loaded');
                    $$('.ss-animated').forEach(el => el.classList.remove('ss-animated'));
                    introTimeline.play();
                }, delay);
            };

            if (document.readyState === 'complete') queueMicrotask(run);
            else window.addEventListener('load', run, { once: true });
        }

        // --------------- MOBILE MENU
        function initMobileMenu() {
            const toggle = $('.mobile-menu-toggle');
            const wrap = $('.main-nav-wrap');
            const body = document.body;
            if (!(toggle && wrap)) return;

            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                toggle.classList.toggle('is-clicked');
                body.classList.toggle('menu-is-open');
            }, { passive: false });

            wrap.querySelectorAll('.main-nav a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.matchMedia('(max-width: 800px)').matches) {
                        toggle.classList.remove('is-clicked');
                        body.classList.remove('menu-is-open');
                    }
                });
            });

            window.addEventListener('resize', () => {
                if (window.matchMedia('(min-width: 801px)').matches) {
                    body.classList.remove('menu-is-open');
                    toggle.classList.remove('is-clicked');
                }
            });
        }

        // --------------- SCROLLSPY (IO)
        function initScrollSpy() {
            const sections = $$('.target-section');
            if (!sections.length) return;

            const map = new Map();
            sections.forEach(sec => {
                const id = sec.getAttribute('id');
                const li = document.querySelector(`.main-nav a[href*="${id}"]`)?.parentElement;
                if (li) map.set(sec, li);
            });

            const io = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        const li = map.get(entry.target);
                        if (!li) return;
                        if (entry.isIntersecting) li.classList.add('current');
                        else li.classList.remove('current');
                    });
                },
                { rootMargin: '-52% 0px -46% 0px', threshold: 0.01 }
            );

            sections.forEach(sec => io.observe(sec));
        }

        // --------------- VIEW ANIMATIONS (IO + Anime)
        function initViewAnimate() {
            const blocks = $$('[data-animate-block]');
            if (!blocks.length) return;

            const io = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        const block = entry.target;
                        if (block.classList.contains('ss-animated')) return;

                        const targets = block.querySelectorAll('[data-animate-el]');
                        anime({
                            targets: targets,
                            opacity: [0, 1],
                            translateY: [100, 0],
                            delay: anime.stagger(400, { start: 200 }),
                            duration: 800,
                            easing: 'easeInOutCubic',
                            begin() {
                                block.classList.add('ss-animated');
                            },
                            complete() {
                                io.unobserve(block);
                            }
                        });
                    });
                },
                { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
            );

            blocks.forEach(b => io.observe(b));
        }

        // --------------- SWIPER (lazy import)
        async function initSwiper() {
            if (!has.swiper()) return;
            const { default: Swiper } = await import('swiper/bundle');
            // CSS for Swiper should be included globally (legacy/vendor CSS) or:
            // await import('swiper/css/bundle');
            // eslint-disable-next-line no-new
            new Swiper('.swiper-container', {
                slidesPerView: 1,
                pagination: { el: '.swiper-pagination', clickable: true },
                breakpoints: {
                    401: { slidesPerView: 1, spaceBetween: 20 },
                    801: { slidesPerView: 2, spaceBetween: 32 },
                    1201: { slidesPerView: 2, spaceBetween: 80 },
                },
            });
        }

        // --------------- LIGHTBOX (robust import)
        async function initLightbox() {
            const links = document.querySelectorAll('.folio-list__item-link');
            if (!links.length) return;

            let mod;
            try {
                mod = await import('basiclightbox');
            } catch (e) {
                console.error('[lightbox] failed to import basiclightbox', e);
                return;
            }
            const bl = mod?.default ?? mod;
            if (!bl?.create) {
                console.error('[lightbox] module does not expose .create', mod);
                return;
            }

            const modals = [];
            links.forEach(link => {
                const sel = link.getAttribute('href');
                if (!sel || !sel.startsWith('#')) { modals.push(null); return; }
                const target = document.querySelector(sel);
                if (!target) { console.warn('[lightbox] missing modal target:', sel); modals.push(null); return; }
                const instance = bl.create(target, {
                    onShow(inst) {
                        const onKey = (e) => e.key === 'Escape' && inst.close();
                        document.addEventListener('keydown', onKey, { once: true });
                    },
                });
                modals.push(instance);
            });

            links.forEach((link, i) => {
                link.addEventListener('click', e => {
                    const inst = modals[i];
                    if (!inst) return;
                    e.preventDefault();
                    inst.show();
                });
            });
        }

        // --------------- ALERT BOXES
        function initAlertBoxes() {
            if (!has.alerts()) return;
            $$('.alert-box').forEach(box => {
                box.addEventListener('click', e => {
                    if (e.target.matches('.alert-box__close')) {
                        e.stopPropagation();
                        e.target.parentElement.classList.add('hideit');
                        setTimeout(() => (box.style.display = 'none'), 500);
                    }
                });
            });
        }

        // --------------- SMOOTH SCROLL (MoveTo)
        async function initMoveTo() {
            if (!has.moveTo()) return;
            const { default: MoveTo } = await import('moveto');
            const ease = {
                easeInQuad(t, b, c, d) { t /= d; return c * t * t + b; },
                easeOutQuad(t, b, c, d) { t /= d; return -c * t * (t - 2) + b; },
                easeInOutQuad(t, b, c, d) { t /= d / 2; if (t < 1) return (c / 2) * t * t + b; t--; return (-c / 2) * (t * (t - 2) - 1) + b; },
                easeInOutCubic(t, b, c, d) { t /= d / 2; if (t < 1) return (c / 2) * t * t * t + b; t -= 2; return (c / 2) * (t * t * t + 2) + b; },
            };
            const triggers = $$('.smoothscroll');
            const moveTo = new MoveTo({ tolerance: 0, duration: 1200, easing: 'easeInOutCubic', container: window }, ease);
            triggers.forEach(t => moveTo.registerTrigger(t));
        }

        // --------------- INIT (order matters: preloader first)
        function init() {
            startPreloaderSequence();
            initMobileMenu();
            initScrollSpy();
            initViewAnimate();
            initSwiper();
            initLightbox();
            initAlertBoxes();
            initMoveTo();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
    })();
}
