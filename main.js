/**
 * PBG — Pollack Badawi Group LLC
 * main.js — Content loader, interactions, animations
 *
 * HOW IT WORKS:
 * 1. Loads content.json
 * 2. Renders all sections dynamically
 * 3. Handles nav, scroll animations, modals, contact form
 */

/* ============================================================
   HELPERS
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const html = String.raw;

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================================
   CONTENT LOADER
   ============================================================ */

async function loadContent() {
  try {
    const res = await fetch('./content.json');
    if (!res.ok) throw new Error('content.json not found');
    return await res.json();
  } catch (e) {
    console.error('[PBG] Failed to load content.json:', e.message);
    return null;
  }
}

/* ============================================================
   RENDER — NAV
   ============================================================ */

function renderNav(data) {
  // Logo is now a static img tag in HTML — no JS needed for it.
  const links     = $('#nav-links');
  const mobileMenu = $('#mobile-menu-links');
  const navCta    = $('#nav-cta');

  if (links && data.nav?.links) {
    links.innerHTML = data.nav.links
      .map(l => html`
        <li>
          <a href="${esc(l.href)}" class="nav-link" data-section="${esc(l.href)}">
            ${esc(l.label)}
          </a>
        </li>
      `).join('');
  }

  if (mobileMenu && data.nav?.links) {
    mobileMenu.innerHTML = data.nav.links
      .map(l => html`
        <a href="${esc(l.href)}" class="mobile-nav-link">${esc(l.label)}</a>
      `).join('');
  }

  if (navCta) {
    navCta.textContent = 'Get Started';
    navCta.href = '#contact';
  }
}

/* ============================================================
   RENDER — HERO
   ============================================================ */

function renderHero(data) {
  const h = data.hero;
  const pillarsEl    = $('#hero-pillars');
  const headlineEl   = $('#hero-headline');
  const taglineEl    = $('#hero-tagline');
  const descEl       = $('#hero-desc');
  const actionsEl    = $('#hero-actions');

  if (pillarsEl && h.pillars) {
    pillarsEl.innerHTML = h.pillars.map((p, i) => html`
      <span class="hero-pillar">
        ${esc(p)}
        ${i < h.pillars.length - 1 ? '<span class="hero-dot">·</span>' : ''}
      </span>
    `).join('');
  }

  // Hero headline is now the official logo image inside index.html for SEO.


  if (taglineEl) taglineEl.textContent = h.subheadline || '';
  if (descEl)    descEl.textContent    = h.description  || '';

  if (actionsEl) {
    actionsEl.innerHTML = html`
      <a href="${esc(h.cta_primary?.href  || '#contact')}" class="btn btn-primary">
        ${esc(h.cta_primary?.label  || 'Get Started')}
      </a>
      <a href="${esc(h.cta_secondary?.href || '#openings')}" class="btn btn-outline">
        ${esc(h.cta_secondary?.label || 'View Openings')}
      </a>
    `;
  }

  // Trigger entrance animations after a short delay
  setTimeout(() => {
    $$('.hero-pillar').forEach(el => el.classList.add('visible'));
  }, 100);

  setTimeout(() => {
    ['#hero-headline', '#hero-tagline', '#hero-desc', '#hero-actions'].forEach(sel => {
      const el = $(sel);
      if (el) el.classList.add('visible');
    });
    const vis = $('#hero-visual');
    if (vis) vis.classList.add('visible');
  }, 200);

  // Start word-cycle showcase
  initShowcase();
}

/* ============================================================
   HERO SHOWCASE — Word cycle animation
   ============================================================ */

const SHOWCASE_WORDS = [
  { text: 'Associates',       sub: 'Law Firm'         },
  { text: 'Partners',         sub: 'Lateral Moves'    },
  { text: 'General Counsel',  sub: 'In-House'         },
  { text: 'Senior Counsel',   sub: 'Corporate'        },
  { text: 'Judicial Clerks',  sub: 'Federal & State'  },
  { text: 'Directors',        sub: 'Legal Ops'        },
];

const SHOWCASE_INTERVAL = 3200; // ms per word

function initShowcase() {
  const track    = $('#hero-word-track');
  const dotsEl   = $('#hero-showcase-dots');
  const progress = $('#hero-showcase-progress');
  if (!track || !dotsEl || !progress) return;

  const words = SHOWCASE_WORDS;
  let current = 0;
  let timer   = null;
  let progTimer = null;

  // Build word slides
  track.innerHTML = words.map((w, i) => html`
    <div class="hero-word${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="${esc(w.text)}">
      <span class="hero-word-text">${esc(w.text)}</span>
      <span class="hero-word-sub">${esc(w.sub)}</span>
    </div>
  `).join('');

  // Build dots
  dotsEl.innerHTML = words.map((_, i) => html`
    <li class="hero-showcase-dot${i === 0 ? ' active' : ''}" data-dot="${i}"></li>
  `).join('');

  const slides = $$('.hero-word', track);
  const dots   = $$('.hero-showcase-dot', dotsEl);

  // Animate progress bar for current slide
  function animateProgress() {
    clearInterval(progTimer);
    progress.style.transition = 'none';
    progress.style.width = '0%';

    // Force reflow to restart transition
    progress.getBoundingClientRect();
    progress.style.transition = `width ${SHOWCASE_INTERVAL}ms linear`;
    progress.style.width = '100%';
  }

  // Advance to next word
  function advance() {
    const prev = current;
    current = (current + 1) % words.length;

    // Exit current
    slides[prev].classList.remove('active');
    slides[prev].classList.add('exit');
    dots[prev].classList.remove('active');

    // After exit transition clears, reset the old slide
    setTimeout(() => {
      slides[prev].classList.remove('exit');
    }, 450);

    // Enter next
    slides[current].classList.add('active');
    dots[current].classList.add('active');

    animateProgress();
  }

  // Kick off
  animateProgress();
  timer = setInterval(advance, SHOWCASE_INTERVAL);

  // Pause on hover
  const showcase = track.closest('.hero-showcase');
  if (showcase) {
    showcase.addEventListener('mouseenter', () => {
      clearInterval(timer);
      clearInterval(progTimer);
    });
    showcase.addEventListener('mouseleave', () => {
      animateProgress();
      timer = setInterval(advance, SHOWCASE_INTERVAL);
    });

    // Click dots to jump
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(timer);
        const prev = current;
        if (prev === i) return;

        slides[prev].classList.remove('active');
        slides[prev].classList.add('exit');
        dots[prev].classList.remove('active');
        setTimeout(() => slides[prev].classList.remove('exit'), 450);

        current = i;
        slides[current].classList.add('active');
        dots[current].classList.add('active');

        animateProgress();
        timer = setInterval(advance, SHOWCASE_INTERVAL);
      });
    });
  }
}

/* ============================================================
   RENDER — WHY PBG
   ============================================================ */

function renderWhyPBG(data) {
  const d = data.whyPBG;
  if (!d) return;

  setTextContent('#whypbg-heading',    d.heading);
  setTextContent('#whypbg-subheading', d.subheading);
  setTextContent('#whypbg-body',       d.body);
  setTextContent('#whypbg-nalsc',      d.nalsc_note);

  const statsEl = $('#whypbg-stats');
  if (statsEl && d.stats) {
    statsEl.innerHTML = d.stats.map(s => html`
      <div class="stat-item reveal">
        <span class="stat-value">${esc(s.value)}</span>
        <span class="stat-label">${esc(s.label)}</span>
      </div>
    `).join('');
  }
}

/* ============================================================
   RENDER — TEAM
   ============================================================ */

function renderTeam(data) {
  const grid = $('#team-grid');
  if (!grid || !data.team) return;

  grid.innerHTML = data.team.map((member, i) => html`
    <article
      class="team-card reveal reveal-delay-${(i % 2) + 1}"
      data-member="${i}"
      role="button"
      tabindex="0"
      aria-label="View full bio for ${esc(member.name)}"
    >
      <div class="team-card-inner">
        <div class="team-photo-wrap">
          <img
            src="${esc(member.photo)}"
            alt="${esc(member.name)}"
            loading="lazy"
          />
        </div>
        <div class="team-info">
          <h3 class="team-name">${esc(member.name)}</h3>
          <p class="team-title">${esc(member.title)}</p>
          <p class="team-bio-short">${esc(member.bio_short)}</p>
          <div class="team-contact">
            ${member.office ? `<span>📞 ${esc(member.office)} (Office)</span>` : ''}
            ${member.mobile ? `<span>📱 ${esc(member.mobile)} (Mobile)</span>` : ''}
          </div>
          <div class="team-actions">
            <button class="team-badge" data-member="${i}">
              <span>👤</span> Full Bio
            </button>
            ${member.linkedin ? html`
              <a
                href="${esc(member.linkedin)}"
                class="team-badge"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile for ${esc(member.name)}"
                onclick="event.stopPropagation()"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                LinkedIn
              </a>
            ` : ''}
            ${member.email ? html`
              <a
                href="mailto:${esc(member.email)}"
                class="team-badge"
                aria-label="Email ${esc(member.name)}"
                onclick="event.stopPropagation()"
              >
                <span>✉</span> Email
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    </article>
  `).join('');

  // Click handlers for bio modal
  $$('[data-member]').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = parseInt(el.dataset.member, 10);
      const member = data.team[idx];
      if (member) openBioModal(member);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
}

/* ============================================================
   RENDER — PARTNER WITH US
   ============================================================ */

function renderPartner(data) {
  const d = data.partner;
  if (!d) return;

  setTextContent('#partner-heading',    d.heading);
  setTextContent('#partner-subheading', d.subheading);

  const grid = $('#partner-grid');
  if (!grid || !d.columns) return;

  grid.innerHTML = d.columns.map((col, i) => html`
    <div class="glass-card partner-card reveal reveal-delay-${i + 1}">
      <span class="partner-icon" role="img" aria-label="${esc(col.heading)}">
        ${col.icon || '⚖️'}
      </span>
      <h3 class="partner-heading">${esc(col.heading)}</h3>
      <p class="partner-body">${esc(col.body)}</p>
      <a href="#contact" class="btn btn-primary btn-sm">
        ${esc(col.cta || 'Get in Touch')}
      </a>
    </div>
  `).join('');
}

/* ============================================================
   RENDER — CURRENT OPENINGS
   ============================================================ */

function renderOpenings(data) {
  const d = data.openings;
  if (!d) return;

  setTextContent('#openings-heading',    d.heading);
  setTextContent('#openings-subheading', d.subheading);

  const list = $('#openings-list');
  if (!list) return;

  const jobs = d.jobs || [];

  if (jobs.length === 0) {
    list.innerHTML = html`
      <div class="openings-empty">
        <p>${esc(d.empty_message)}</p>
      </div>
    `;
    return;
  }

  list.innerHTML = jobs.map((job, i) => html`
    <article class="job-card reveal reveal-delay-${Math.min(i + 1, 5)}">
      <div class="job-main">
        <div class="job-meta">
          <span class="job-tag type">${esc(job.type)}</span>
          <span class="job-tag location">📍 ${esc(job.location)}</span>
          ${job.class_years ? html`<span class="job-tag years">⚖️ ${esc(job.class_years)}</span>` : ''}
        </div>
        <h3 class="job-title">${esc(job.title)}</h3>
        ${job.firm ? `<p class="job-firm">${esc(job.firm)}</p>` : ''}
        <p class="job-desc">${esc(job.description)}</p>
      </div>
      <div class="job-action">
        <a href="${esc(job.apply_url || '#contact')}" class="btn btn-primary btn-sm">
          Apply Now
        </a>
      </div>
    </article>
  `).join('');
}

/* ============================================================
   RENDER — WE'RE HIRING (CAREERS)
   ============================================================ */

function renderCareers(data) {
  const d = data.careers;
  if (!d) return;

  setTextContent('#careers-heading',    d.heading);
  setTextContent('#careers-subheading', d.subheading);
  const bodyEl = $('#careers-body');
  if (bodyEl) bodyEl.textContent = d.body || '';

  const ctaEl = $('#careers-cta');
  if (ctaEl) ctaEl.textContent = d.cta || 'Express Interest';

  // Feature cards
  const features = [
    { icon: '🤝', title: 'Collaborative Culture', desc: 'Work alongside experienced legal professionals who love what they do.' },
    { icon: '⚖️', title: 'Legal Industry Focus', desc: 'Deep specialization — every placement matters and has purpose.' },
    { icon: '📈', title: 'Growth Opportunities', desc: 'Build your career in a boutique firm with growing national reach.' },
    { icon: '🏛️', title: 'DC-Based & Remote Friendly', desc: 'Headquartered at the iconic Watergate building in Washington, DC.' },
  ];

  const featEl = $('#careers-features');
  if (featEl) {
    featEl.innerHTML = features.map((f, i) => html`
      <div class="careers-feature reveal reveal-delay-${i + 1}">
        <div class="careers-feature-icon">${f.icon}</div>
        <div>
          <p class="careers-feature-title">${esc(f.title)}</p>
          <p class="careers-feature-desc">${esc(f.desc)}</p>
        </div>
      </div>
    `).join('');
  }
}

/* ============================================================
   RENDER — CONTACT
   ============================================================ */

function renderContact(data) {
  const d = data.contact;
  if (!d) return;

  setTextContent('#contact-heading',    d.heading);
  setTextContent('#contact-subheading', d.subheading);

  const detailsEl = $('#contact-details');
  if (detailsEl) {
    const items = [
      { icon: '📍', label: 'Address', value: `${d.address_line1}<br>${d.address_line2}<br>${d.address_city}`, isHtml: true },
      { icon: '📞', label: 'Phone',   value: `<a href="tel:${d.phone_main}">${esc(d.phone_main)}</a>`, isHtml: true },
      { icon: '✉',  label: 'Email',   value: `<a href="mailto:${d.email_general}">${esc(d.email_general)}</a>`, isHtml: true },
    ];

    detailsEl.innerHTML = items.map(item => html`
      <div class="contact-detail-item">
        <div class="contact-detail-icon">${item.icon}</div>
        <div class="contact-detail-text">
          <span class="contact-detail-label">${esc(item.label)}</span>
          <span class="contact-detail-value">${item.isHtml ? item.value : esc(item.value)}</span>
        </div>
      </div>
    `).join('');
  }

  // Wire up form
  const form = $('#contact-form');
  if (form && d.formspree_id && d.formspree_id !== 'YOUR_FORMSPREE_ID') {
    form.action = `https://formspree.io/f/${d.formspree_id}`;
  }

  setupContactForm();
}

/* ============================================================
   RENDER — FOOTER
   ============================================================ */

function renderFooter(data) {
  const d = data.footer;
  const c = data.contact;
  const n = data.nav;

  setTextContent('#footer-tagline',  d?.tagline);
  setTextContent('#footer-nalsc',    d?.nalsc_note);
  setTextContent('#footer-copyright', `© ${new Date().getFullYear()} ${d?.copyright || 'Pollack Badawi Group LLC.'}`);

  const navLinksEl = $('#footer-nav-links');
  if (navLinksEl && n?.links) {
    navLinksEl.innerHTML = n.links.map(l => html`
      <li><a href="${esc(l.href)}" class="footer-nav-link">${esc(l.label)}</a></li>
    `).join('');
  }

  const contactEl = $('#footer-contact-list');
  if (contactEl && c) {
    contactEl.innerHTML = html`
      <li class="footer-contact-item">
        <strong>Address</strong>
        ${esc(c.address_line1)}<br>
        ${esc(c.address_line2)}<br>
        ${esc(c.address_city)}
      </li>
      <li class="footer-contact-item">
        <strong>Phone</strong>
        <a href="tel:${esc(c.phone_main)}">${esc(c.phone_main)}</a>
      </li>
      <li class="footer-contact-item">
        <strong>Email</strong>
        <a href="mailto:${esc(c.email_general)}">${esc(c.email_general)}</a>
      </li>
    `;
  }

  const linkedinEl = $('#footer-linkedin');
  if (linkedinEl && c?.linkedin) {
    linkedinEl.href = c.linkedin;
  }
}

/* ============================================================
   TEAM BIO MODAL
   ============================================================ */

let modalOpen = false;

function openBioModal(member) {
  const overlay = $('#modal-overlay');
  if (!overlay) return;

  const contacts = [
    member.office && `📞 ${member.office} (Office)`,
    member.mobile && `📱 ${member.mobile} (Mobile)`,
    member.email  && `<a href="mailto:${esc(member.email)}" style="color:var(--clr-accent)">${esc(member.email)}</a>`,
  ].filter(Boolean);

  overlay.innerHTML = html`
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-name">
      <div class="modal-header">
        <h2 class="modal-title" id="modal-name">Meet ${esc(member.name)}</h2>
        <button class="modal-close" id="modal-close-btn" aria-label="Close modal">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-profile">
          <img
            src="${esc(member.photo)}"
            alt="${esc(member.name)}"
            class="modal-photo"
          />
          <div>
            <p class="modal-meta-name">${esc(member.name)}</p>
            <p class="modal-meta-title">${esc(member.title)}</p>
            <div class="modal-meta-contacts">
              ${contacts.map(c => `<span>${c}</span>`).join('')}
              ${member.linkedin ? html`
                <a href="${esc(member.linkedin)}" target="_blank" rel="noopener noreferrer"
                   style="color:var(--clr-accent)">
                  LinkedIn Profile →
                </a>
              ` : ''}
            </div>
          </div>
        </div>
        <div class="modal-bio">
          ${member.bio_full
            ? member.bio_full.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')
            : `<p>${esc(member.bio_short)}</p>`}
        </div>
      </div>
      <div class="modal-footer">
        ${member.linkedin ? html`
          <a href="${esc(member.linkedin)}" target="_blank" rel="noopener noreferrer"
             class="btn btn-ghost">LinkedIn →</a>
        ` : ''}
        ${member.email ? html`
          <a href="mailto:${esc(member.email)}" class="btn btn-primary btn-sm">Send Email</a>
        ` : ''}
        <button class="btn btn-ghost modal-close-action">Close</button>
      </div>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalOpen = true;

  // Close handlers
  const closeModal = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    modalOpen = false;
  };

  $('#modal-close-btn', overlay)?.addEventListener('click', closeModal);
  $$('.modal-close-action', overlay).forEach(el => el.addEventListener('click', closeModal));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Focus trap
  setTimeout(() => {
    $('#modal-close-btn', overlay)?.focus();
  }, 50);
}

/* ============================================================
   NAV — SCROLL BEHAVIOR
   ============================================================ */

function setupNav() {
  const nav = $('#site-nav');
  const hamburger = $('#nav-hamburger');
  const mobileMenu = $('#mobile-menu');

  // Scroll: transparent → frosted
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    updateActiveNavLink();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    $$('.mobile-nav-link', mobileMenu).forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (mobileMenu?.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger?.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger?.classList.remove('open');
    }
  });
}

function updateActiveNavLink() {
  const sections = $$('section[id], div[id]').filter(el =>
    $$('.nav-link').some(l => l.getAttribute('href') === `#${el.id}`)
  );

  let current = '';
  const offset = 120;

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= offset && rect.bottom > offset) {
      current = sec.id;
    }
  });

  $$('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* ============================================================
   SCROLL REVEAL (INTERSECTION OBSERVER)
   ============================================================ */

function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  $$('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });

  // Re-run after dynamic content loads
  return observer;
}

function observeNew(observer) {
  $$('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)')
    .forEach(el => observer.observe(el));
}

/* ============================================================
   CONTACT FORM
   ============================================================ */

function setupContactForm() {
  const form = $('#contact-form');
  const status = $('#form-status');
  const fileInput = $('#file-input');
  const fileLabel = $('#file-label-text');

  if (!form) return;

  // File input display
  if (fileInput && fileLabel) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      fileLabel.textContent = file
        ? `📎 ${file.name}`
        : '📎 Attach resume or document';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    if (status) {
      status.className = '';
      status.style.display = 'none';
    }

    try {
      const formData = new FormData(form);
      const action = form.action;

      if (!action || action.includes('YOUR_FORMSPREE_ID')) {
        // Dev mode: simulate success
        await new Promise(r => setTimeout(r, 800));
        showFormStatus(status, 'success', '✓ Message received! (Note: configure your Formspree ID in content.json to enable real submissions.)');
        form.reset();
        if (fileLabel) fileLabel.textContent = '📎 Attach resume or document';
      } else {
        const res = await fetch(action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          showFormStatus(status, 'success', '✓ Thank you! We\'ll be in touch shortly.');
          form.reset();
          if (fileLabel) fileLabel.textContent = '📎 Attach resume or document';
        } else {
          throw new Error('Server error');
        }
      }
    } catch (err) {
      showFormStatus(status, 'error', '✕ Something went wrong. Please email us directly.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    }
  });
}

function showFormStatus(el, type, message) {
  if (!el) return;
  el.textContent = message;
  el.className = type;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ============================================================
   ESC KEY — close modal
   ============================================================ */

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOpen) {
    const overlay = $('#modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      modalOpen = false;
    }
  }
});

/* ============================================================
   UTILITY
   ============================================================ */

function setTextContent(selector, text) {
  const el = $(selector);
  if (el && text !== undefined && text !== null) el.textContent = text;
}

/* ============================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const targetId = link.getAttribute('href').slice(1);
  if (!targetId) return;

  const target = document.getElementById(targetId);
  if (!target) return;

  e.preventDefault();
  const offset = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-height') || '72', 10);
  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top, behavior: 'smooth' });
});

/* ============================================================
   BOOT
   ============================================================ */

async function init() {
  // Setup nav immediately (before content loads)
  setupNav();

  const data = await loadContent();
  if (!data) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                  font-family:sans-serif;color:#fff;background:#1c2d3a;text-align:center;padding:2rem;">
        <div>
          <h1 style="font-size:2rem;margin-bottom:1rem">⚠️ content.json not found</h1>
          <p style="color:#8ca0b5">Make sure content.json is in the same folder as index.html.<br>
          If running locally, use a local server (e.g. <code>npx serve .</code>)</p>
        </div>
      </div>
    `;
    return;
  }

  // Render all sections
  renderNav(data);
  renderHero(data);
  renderWhyPBG(data);
  renderTeam(data);
  renderPartner(data);
  renderOpenings(data);
  renderCareers(data);
  renderContact(data);
  renderFooter(data);

  // Page title
  if (data.site?.title) document.title = data.site.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && data.site?.description) metaDesc.content = data.site.description;

  // Scroll animations (run after render)
  const observer = setupScrollReveal();

  // Re-observe after a tick (for newly rendered elements)
  setTimeout(() => observeNew(observer), 100);
}

// Run on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
