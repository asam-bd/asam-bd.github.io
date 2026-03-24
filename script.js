import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, get, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDVvulc_Nc0zkcS9G1qRi1HCksULHe1isI",
  authDomain: "arparasadaralimm-be89e.firebaseapp.com",
  databaseURL: "https://arparasadaralimm-be89e-default-rtdb.firebaseio.com",
  projectId: "arparasadaralimm-be89e",
  storageBucket: "arparasadaralimm-be89e.firebasestorage.app",
  messagingSenderId: "583486628552",
  appId: "1:583486628552:web:9ac007bab064add34f3bfd"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const esc = (s='') => String(s)
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#39;');

function hidePreloader() {
  const el = document.getElementById('preloader');
  if (!el) return;
  el.classList.add('done');
  setTimeout(() => el.classList.add('gone'), 700);
}
document.addEventListener('DOMContentLoaded', () => setTimeout(hidePreloader, 1200));
window.addEventListener('load', () => setTimeout(hidePreloader, 700));
setTimeout(hidePreloader, 3000);

// STARS
const starsContainer = document.getElementById('heroStars');
if (starsContainer) {
  for(let i=0;i<120;i++){
    const s = document.createElement('div');
    const types = ['star star-big','star star-med','star star-sm'];
    s.className = types[Math.floor(Math.random()*3)];
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*4}s;animation-duration:${2+Math.random()*3}s`;
    starsContainer.appendChild(s);
  }
}

// NAVBAR
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const cur = window.scrollY;
  if (navbar) {
    navbar.classList.toggle('scrolled', cur > 80);
    if(cur > 350){
      navbar.style.transform = cur > lastScroll ? 'translateY(-100%)' : 'translateY(0)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
  }
  lastScroll = cur;
  document.getElementById('scrollTop')?.classList.toggle('show', cur > 400);
});

// SIDEBAR / HAMBURGER
const hamburger  = document.getElementById('hamburger');
const navMenu    = document.getElementById('navMenu');
const navOverlay = document.getElementById('navOverlay');

function openSidebar() {
  hamburger.classList.add('active');
  navMenu.classList.add('open');
  navOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  hamburger.setAttribute('aria-label', 'মেনু বন্ধ করুন');
}

function closeSidebar() {
  hamburger.classList.remove('active');
  navMenu.classList.remove('open');
  navOverlay.classList.remove('show');
  document.body.style.overflow = '';
  hamburger.setAttribute('aria-label', 'মেনু খুলুন');
}

hamburger?.addEventListener('click', () => {
  navMenu.classList.contains('open') ? closeSidebar() : openSidebar();
});

// Close button inside sidebar
document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);

// Click outside (overlay) closes sidebar
navOverlay?.addEventListener('click', closeSidebar);

// Close on nav-link click
navMenu?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});

// Dropdown toggle on mobile
document.querySelectorAll('.has-dd > .nav-link').forEach(link => {
  link.addEventListener('click', e => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      link.closest('.has-dd').classList.toggle('open');
    }
  });
});

// Escape key closes sidebar
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) closeSidebar();
});

// THEME — sync both desktop + sidebar toggle buttons
function applyTheme(isDark) {
  const icon = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('themeToggle').innerHTML         = icon;
  const st = document.getElementById('themeToggleSidebar');
  if (st) st.innerHTML = icon;
}
const themeToggle = document.getElementById('themeToggle');
themeToggle?.addEventListener('click', () => {
  applyTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
});
document.getElementById('themeToggleSidebar')?.addEventListener('click', () => {
  applyTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
});

// LANGUAGE — sync both desktop + sidebar toggle buttons
let currentLang = 'bn';
function applyLang(lang) {
  currentLang = lang;
  const label = lang === 'bn' ? 'EN' : 'বাং';
  const el  = document.getElementById('langToggle');
  const sel = document.getElementById('langToggleSidebar');
  if (el?.querySelector('.lang-txt'))  el.querySelector('.lang-txt').textContent  = label;
  if (sel?.querySelector('.lang-txt-s')) sel.querySelector('.lang-txt-s').textContent = label;
  document.documentElement.setAttribute('data-lang', lang);
}
document.getElementById('langToggle')?.addEventListener('click', () => {
  applyLang(currentLang === 'bn' ? 'en' : 'bn');
});
document.getElementById('langToggleSidebar')?.addEventListener('click', () => {
  applyLang(currentLang === 'bn' ? 'en' : 'bn');
});

// ══════════════════════════════
// CUSTOM CURSOR
// ══════════════════════════════
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only on non-touch devices
  if (window.matchMedia('(hover:none) and (pointer:coarse)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Ring follows with smooth lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover glow on interactive elements
  const interactiveSelector = 'a, button, [role="button"], input, select, textarea, label[for], .nav-link, .btn-primary, .btn-outline, .btn-glow, .photo-item, .teacher-card, .feat-card, .about-card, .tab-btn, .filter-btn, .g-tab, .cal-nav-btn, .scroll-top, .hamburger, .sidebar-close';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelector)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveSelector)) document.body.classList.remove('cursor-hover');
  });

  // Click burst
  document.addEventListener('mousedown', () => {
    document.body.classList.add('cursor-click');
  });
  document.addEventListener('mouseup', () => {
    document.body.classList.remove('cursor-click');
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '';
  });
})();

// COUNTERS
let counted = false;
function resetCounters(){
  counted = false;
}
function animateCounters(){
  if(counted) return;
  document.querySelectorAll('.c-num[data-target]').forEach(el => {
    const target = +el.getAttribute('data-target') || 0;
    let current = 0;
    const step = Math.max(target / 60, 1);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current);
      if(current >= target) clearInterval(timer);
    }, 25);
  });
  counted = true;
}

// AOS
function triggerAOS(){
  document.querySelectorAll('[data-aos]').forEach(el => {
    const r = el.getBoundingClientRect();
    if(r.top < window.innerHeight - 80) el.classList.add('visible');
  });
  const hero = document.querySelector('.hero');
  if(hero){
    const heroBottom = hero.getBoundingClientRect().bottom;
    if(heroBottom < window.innerHeight + 100) animateCounters();
  }
}
window.addEventListener('scroll', triggerAOS);
setTimeout(triggerAOS, 300);

// TABS
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-tab');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+id)?.classList.add('active');
  });
});

// GALLERY TABS
document.querySelectorAll('.g-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-gtab');
    document.querySelectorAll('.g-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.g-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(id)?.classList.add('active');
  });
});

// FILTERS
function bindTeacherFilters(){
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.onclick = () => {
      const filter = btn.getAttribute('data-filter');
      btn.closest('.filter-bar').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.teacher-card[data-dept]').forEach(card => {
        card.classList.toggle('hidden', filter !== 'all' && card.getAttribute('data-dept') !== filter);
      });
    };
  });
}
bindTeacherFilters();

function bindGalleryFilters(){
  document.querySelectorAll('[data-gfilter]').forEach(btn => {
    btn.onclick = () => {
      const filter = btn.getAttribute('data-gfilter');
      btn.closest('.filter-bar').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.photo-item[data-cat]').forEach(item => {
        item.classList.toggle('hidden', filter !== 'all' && item.getAttribute('data-cat') !== filter);
      });
    };
  });
}
bindGalleryFilters();

// LIGHTBOX
function bindLightbox(){
  document.querySelectorAll('.photo-item').forEach(item => {
    item.onclick = () => {
      const img = item.querySelector('img');
      if (!img) return;
      document.getElementById('lbImg').src = img.src;
      document.getElementById('lightbox').classList.add('open');
      document.body.style.overflow = 'hidden';
    };
  });
}
bindLightbox();

document.getElementById('lbClose')?.addEventListener('click', () => {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
});
document.getElementById('lightbox')?.addEventListener('click', e => {
  if(e.target === e.currentTarget){
    e.currentTarget.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// TOAST
function showToast(msg, type='success'){
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toastMsg').textContent = msg;
  t.className = `toast toast-${type} show`;
  t.querySelector('i').className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  setTimeout(() => t.classList.remove('show'), 3500);
}

// FIREBASE LOADERS

// TICKER
onValue(ref(db, 'ticker'), (snap) => {
  const data = snap.val();
  if (!data) return;
  const items = Object.values(data).filter(i => i && i.active);
  const move = document.querySelector('.ticker-move');
  if (!move || !items.length) return;
  move.innerHTML = [...items, ...items].map(i => `<span>${esc(i.text || '')}</span>`).join('');
});

// HERO
onValue(ref(db, 'hero'), (snap) => {
  const d = snap.val();
  if (!d) return;
  const titleEl = document.querySelector('.hero-title');
  const mottoEl = document.querySelector('.hero-motto');
  const descEl  = document.querySelector('.hero-desc');

  if (d.titleBn && titleEl) titleEl.textContent = d.titleBn;
  if (d.mottoBn && mottoEl) mottoEl.textContent = d.mottoBn;
  if (d.descBn  && descEl)  descEl.textContent  = d.descBn;

  const boxes = document.querySelectorAll('.c-num[data-target]');
  [d.students, d.teachers, d.passRate, d.years].forEach((val, i) => {
    if (boxes[i] && val !== undefined) boxes[i].setAttribute('data-target', val);
  });
  resetCounters();
  triggerAOS();
});

onValue(ref(db, 'stats'), (snap) => {
  const data = snap.val();
  if (!data) return;
  const boxes = document.querySelectorAll('.c-num[data-target]');
  const keys = ['students','teachers','passRate','years'];
  keys.forEach((key, i) => {
    if (data[key] !== undefined && boxes[i]) boxes[i].setAttribute('data-target', data[key]);
  });
});

// ABOUT
onValue(ref(db, 'aboutCards'), (snap) => {
  const d = snap.val();
  if (!d) return;
  const cards = Array.isArray(d) ? d : Object.values(d);
  const container = document.querySelector('.about-grid');
  if (!container) return;

  container.innerHTML = cards.map(c => `
    <div class="about-card" data-aos>
      <div class="ac-icon"><i class="${esc(c.icon || 'fas fa-star')}"></i></div>
      <h3>${esc(c.titleBn || '')}</h3>
      <p>${esc(c.descBn || '')}</p>
    </div>
  `).join('');

  triggerAOS();
});

// PRINCIPAL
onValue(ref(db, 'principal'), (snap) => {
  const d = snap.val();
  if (!d) return;

  const pName = document.querySelector('.p-name strong');
  const pDes  = document.querySelector('.p-name span');
  const pMsg  = document.querySelector('.p-body blockquote');
  const pImg  = document.querySelector('.p-img');

  if (d.name && pName) pName.textContent = d.name;
  if (d.designation && pDes) pDes.textContent = d.designation;
  if (d.message && pMsg) pMsg.textContent = d.message;
  if (d.photo && pImg) pImg.src = d.photo;
});

// FEATURES
onValue(ref(db, 'features'), (snap) => {
  const d = snap.val();
  if (!d) return;
  const cards = Array.isArray(d) ? d : Object.values(d);
  const container = document.querySelector('.features-wrap');
  if (!container) return;

  container.innerHTML = cards.map(c => `
    <div class="feat-card" data-aos>
      <div class="feat-icon"><i class="${esc(c.icon || 'fas fa-star')}"></i></div>
      <h3>${esc(c.title || '')}</h3>
      <p>${esc(c.desc || '')}</p>
    </div>
  `).join('');

  triggerAOS();
});

// TEACHERS
onValue(ref(db, 'teachers'), (snap) => {
  const d = snap.val();
  if (!d) return;
  const teachers = Object.values(d);
  const grid = document.querySelector('.teachers-grid');
  if (!grid) return;

  grid.innerHTML = teachers.map(t => {
    const initials = encodeURIComponent((t.name || 'T').substring(0, 2));
    const fallback = `https://ui-avatars.com/api/?name=${initials}&background=059669&color=fff&size=200`;
    const src = (t.photo && t.photo.startsWith('http')) ? esc(t.photo) : fallback;
    return `
    <div class="teacher-card" data-dept="${esc(t.dept || 'general')}" data-aos>
      <div class="t-photo">
        <img src="${src}" alt="${esc(t.name || '')}"
          onerror="this.onerror=null;this.src='${fallback}'">
      </div>
      <div class="t-info">
        <h4>${esc(t.name || '')}</h4>
        <span class="t-role">${esc(t.role || '')}</span>
        <span class="t-subject">${esc(t.subject || '')}</span>
        ${t.qualification ? `<p>${esc(t.qualification)}</p>` : ''}
      </div>
    </div>`;
  }).join('');

  bindTeacherFilters();
  triggerAOS();
});

// EVENTS
onValue(ref(db, 'events'), (snap) => {
  const d = snap.val();
  if (!d) return;
  const evList = Object.values(d);
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  timeline.innerHTML = evList.map(ev => `
    <div class="tl-item" data-aos>
      <div class="tl-date">
        <span class="tl-day">${esc(ev.day || '')}</span>
        <span class="tl-month">${esc(ev.month || '')}</span>
      </div>
      <div class="tl-dot"></div>
      <div class="tl-content">
        <h4>${esc(ev.title || '')}</h4>
        ${ev.time  ? `<p><i class="fas fa-clock"></i> ${esc(ev.time)}</p>` : ''}
        ${ev.place ? `<p><i class="fas fa-map-marker-alt"></i> ${esc(ev.place)}</p>` : ''}
        ${ev.desc  ? `<p style="color:var(--text-mid);margin-top:8px">${esc(ev.desc)}</p>` : ''}
      </div>
    </div>
  `).join('');

  triggerAOS();
});

// NOTICES
onValue(ref(db, 'notices'), (snap) => {
  const data = snap.val();
  if (!data) return;
  const list = document.querySelector('.notice-list');
  if (!list) return;

  const items = Object.entries(data)
    .map(([id, v]) => ({ id, ...v }))
    .filter(n => n.active)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const tagMap = {
    urgent:  { cls: 'urgent-tag',  txt: '🔴 জরুরি' },
    normal:  { cls: 'normal-tag',  txt: '🟢 সাধারণ' },
    academic:{ cls: 'academic-tag',txt: '🔵 একাডেমিক' },
    event:   { cls: 'event-tag',   txt: '🟡 ইভেন্ট' }
  };

  list.innerHTML = items.map(n => {
    const tag = tagMap[n.type] || tagMap.normal;
    return `
      <div class="notice-item${n.type === 'urgent' ? ' urgent' : ''}" data-aos>
        <span class="n-tag ${tag.cls}">${tag.txt}</span>
        <div class="n-date"><i class="fas fa-calendar"></i> ${esc(n.dateDisplay || n.date || '')}</div>
        <h4>${esc(n.title || '')}</h4>
        <p>${esc(n.body || '')}</p>
        ${n.link ? `<a href="${esc(n.link)}" target="_blank" class="n-link">বিস্তারিত <i class="fas fa-arrow-right"></i></a>` : ''}
      </div>`;
  }).join('');

  triggerAOS();
});

// GALLERY
onValue(ref(db, 'gallery'), (snap) => {
  const d = snap.val();
  if (!d) return;
  const photos = Object.values(d);
  const photoGrid = document.querySelector('#photos .photo-grid');
  if (!photoGrid) return;

  photoGrid.innerHTML = photos.map(p => `
    <div class="photo-item" data-cat="${esc(p.cat || 'other')}" data-aos="zoom">
      <img src="${esc(p.url || '')}" alt="${esc(p.title || '')}" onerror="this.parentElement.style.display='none'">
      <div class="photo-overlay">
        <h4>${esc(p.title || '')}</h4>
        <p>${esc(p.desc || '')}</p>
      </div>
    </div>
  `).join('');

  bindLightbox();
  bindGalleryFilters();
  triggerAOS();
});

// VIDEOS
onValue(ref(db, 'videos'), (snap) => {
  const d = snap.val();
  if (!d) return;
  const videos = Object.values(d).filter(v => v.active !== false);
  const container = document.querySelector('#videos .video-grid');
  if (!container) return;

  container.innerHTML = videos.map(v => `
    <div class="vid-item" data-aos>
      <div class="vid-thumb">
        ${v.ytId
          ? `<img src="https://img.youtube.com/vi/${esc(v.ytId)}/mqdefault.jpg" alt="${esc(v.title || '')}">
             <a href="https://www.youtube.com/watch?v=${esc(v.ytId)}" target="_blank" class="play-btn"><i class="fas fa-play"></i></a>`
          : `<div class="play-btn"><i class="fas fa-play"></i></div>`
        }
      </div>
      <h4>${esc(v.title || '')}</h4>
    </div>
  `).join('');

  triggerAOS();
});

// MERIT
onValue(ref(db, 'merit'), (snap) => {
  const d = snap.val();
  if (!d) return;
  const items = Array.isArray(d) ? d : Object.values(d);
  const container = document.querySelector('.merit-cards');
  if (!container) return;

  const medals = ['🥇','🥈','🥉'];
  const classes = ['gold','silver','bronze'];

  container.innerHTML = items.map((m, i) => `
    <div class="merit-item ${classes[i] || ''}" data-aos>
      <div class="merit-rank">${medals[i] || (i+1)+'ম'}</div>
      <h4>${esc(m.name || '')}</h4>
      <p>GPA: ${esc(m.gpa || '')}</p>
      <p>${esc(m.class || '')}</p>
    </div>
  `).join('');

  triggerAOS();
});

// RESULT STATS
onValue(ref(db, 'resultStats'), (snap) => {
  const d = snap.val();
  if (!d) return;
  const cards = document.querySelectorAll('.stats-row .stat-card h3');
  if (cards[0] && d.total) cards[0].textContent = d.total;
  if (cards[1] && d.pass) cards[1].textContent = d.pass;
  if (cards[2] && d.gpa5) cards[2].textContent = d.gpa5;
  if (cards[3] && d.teachers) cards[3].textContent = d.teachers;
});

// ADMISSION INFO
onValue(ref(db, 'admission'), (snap) => {
  const d = snap.val();
  if (!d) return;

  const rows = document.querySelectorAll('.info-row');
  const fields = ['startDate','endDate','examDate','resultDate','fee'];
  const icons = ['fa-calendar-check','fa-calendar-times','fa-pen','fa-list-ol','fa-money-bill'];
  const labels = ['আবেদন শুরু','আবেদন শেষ','ভর্তি পরীক্ষা','ফলাফল','ভর্তি ফি'];

  fields.forEach((field, idx) => {
    if (d[field] && rows[idx]) {
      rows[idx].innerHTML = `<i class="fas ${icons[idx]}"></i><div><strong>${labels[idx]}</strong><p>${esc(d[field])}</p></div>`;
    }
  });

  if (d.year) {
    const admTitle = document.querySelector('#admission .sec-title');
    if (admTitle) admTitle.textContent = `ভর্তি কার্যক্রম ${d.year}`;
  }
});

// FEES
onValue(ref(db, 'fees'), (snap) => {
  const d = snap.val();
  if (!d) return;
  const tbody = document.getElementById('feesTableBody');
  if (!tbody) return;

  tbody.innerHTML = Object.values(d).map(r =>
    `<tr>
      <td>${esc(r.className || '')}</td>
      <td>${esc(r.admissionFee || '')}</td>
      <td>${esc(r.monthlyFee || '')}</td>
      <td>${esc(r.examFee || '')}</td>
    </tr>`
  ).join('');
});

// CONTACT
onValue(ref(db, 'contact'), (snap) => {
  const d = snap.val();
  if (!d) return;

  const cards = document.querySelectorAll('.c-card p');
  if (d.address && cards[0]) cards[0].innerHTML = esc(d.address).replace(/\n/g, '<br>');
  if (d.phone && cards[1]) cards[1].innerHTML = esc(d.phone).replace(/\n/g, '<br>');
  if (d.email && cards[2]) cards[2].innerHTML = esc(d.email).replace(/\n/g, '<br>');
  if (d.hours && cards[3]) cards[3].innerHTML = esc(d.hours).replace(/\n/g, '<br>');

  const fc = document.querySelectorAll('.f-contact li');
  if (fc.length >= 4) {
    if (d.addressShort) fc[0].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${esc(d.addressShort)}`;
    if (d.phoneShort) fc[1].innerHTML = `<i class="fas fa-phone"></i> ${esc(d.phoneShort)}`;
    if (d.emailShort) fc[2].innerHTML = `<i class="fas fa-envelope"></i> ${esc(d.emailShort)}`;
    if (d.hoursShort) fc[3].innerHTML = `<i class="fas fa-clock"></i> ${esc(d.hoursShort)}`;
  }

  if (d.callNumber) {
    const b = document.querySelector('.call-btn');
    if (b) b.href = `tel:${d.callNumber}`;
  }
  if (d.whatsapp) {
    const b = document.querySelector('.wa-btn');
    if (b) b.href = `https://wa.me/${d.whatsapp}`;
  }
});

// SITE INFO (legacy node)
onValue(ref(db, 'siteInfo'), (snap) => {
  const d = snap.val();
  if (!d) return;

  if (d.eiin) {
    const sub = document.querySelector('.nav-logo-sub');
    if (sub) sub.textContent = `EIIN: ${d.eiin} | Est. ${d.established || '1985'}`;
  }

  if (d.footerText) {
    const ft = document.querySelector('.f-bottom p');
    if (ft) ft.innerHTML = esc(d.footerText);
  }

  if (d.facebook) {
    const a = document.querySelector('.f-social a:nth-child(1)');
    if (a) a.href = d.facebook;
  }
  if (d.youtube) {
    const a = document.querySelector('.f-social a:nth-child(2)');
    if (a) a.href = d.youtube;
  }
  if (d.whatsapp) {
    const a = document.querySelector('.f-social a:nth-child(3)');
    if (a) a.href = `https://wa.me/${d.whatsapp}`;
  }
  if (d.instagram) {
    const a = document.querySelector('.f-social a:nth-child(4)');
    if (a) a.href = d.instagram;
  }
});

// SITE SETTINGS (new — controls title, favicon, nav icon, etc.)
onValue(ref(db, 'siteSettings'), (snap) => {
  const d = snap.val();
  if (!d) return;

  // Page <title>
  if (d.nameBn) {
    const enPart = d.nameEn ? ` | ${d.nameEn}` : '';
    document.title = `${d.nameBn}${enPart}`;
  }

  // Meta description
  if (d.metaDesc) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = d.metaDesc;
  }

  // Favicon
  if (d.faviconUrl) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = d.faviconUrl;
  }

  // Navbar logo icon
  if (d.navIcon) {
    const iconEl = document.querySelector('.nav-logo-icon');
    if (iconEl) iconEl.textContent = d.navIcon;
    // Hero mosque icon too
    const heroMosque = document.querySelector('.pl-mosque');
    if (heroMosque) heroMosque.textContent = d.navIcon;
    const footerIcon = document.querySelector('.f-logo span');
    if (footerIcon) footerIcon.textContent = d.navIcon;
  }

  // Navbar site name
  if (d.nameBn) {
    const nameEl = document.querySelector('.nav-logo-name');
    if (nameEl) nameEl.textContent = d.nameBn;
    const fLogoName = document.querySelector('.f-logo h3');
    if (fLogoName) fLogoName.textContent = d.nameBn;
  }

  // Tagline / EIIN sub
  if (d.tagline) {
    const sub = document.querySelector('.nav-logo-sub');
    if (sub) sub.textContent = d.tagline;
  } else if (d.eiin) {
    const sub = document.querySelector('.nav-logo-sub');
    if (sub) sub.textContent = `EIIN: ${d.eiin} | Est. ${d.established || '1985'}`;
  }

  // Footer text
  if (d.footerText) {
    const ft = document.querySelector('.f-bottom p');
    if (ft) ft.innerHTML = esc(d.footerText);
  }

  // Social links
  const socials = [d.facebook, d.youtube, d.whatsapp ? `https://wa.me/${d.whatsapp}` : null, d.instagram];
  document.querySelectorAll('.f-social a').forEach((a, i) => {
    if (socials[i]) a.href = socials[i];
  });
});

// RESULT SEARCH
document.getElementById('resultForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const roll = document.getElementById('inputRoll').value.trim();
  const classVal = document.getElementById('inputClass').value;
  const examVal = document.getElementById('inputExam').value;
  const classText = document.getElementById('inputClass').selectedOptions[0]?.text || '';
  const examText = document.getElementById('inputExam').selectedOptions[0]?.text || '';
  const output = document.getElementById('resultOutput');

  if (!roll || !classVal || !examVal) {
    showToast('সব ঘর পূরণ করুন।', 'error');
    return;
  }

  output.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-mid)"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--emerald)"></i><p style="margin-top:12px">ফলাফল খোঁজা হচ্ছে...</p></div>`;

  // Normalize roll: remove leading zeros for numeric rolls, keep as-is otherwise
  const normalizedRoll = /^\d+$/.test(roll) ? String(parseInt(roll, 10)) : roll;

  try {
    // Try both with and without leading zeros to be safe
    let student = null;
    const paths = [...new Set([
      `results/${classVal}/${examVal}/${normalizedRoll}`,
      `results/${classVal}/${examVal}/${roll}`
    ])];

    for (const path of paths) {
      const snap = await get(ref(db, path));
      if (snap.val()) { student = snap.val(); break; }
    }

    if (!student) {
      showToast('ফলাফল পাওয়া যায়নি।', 'error');
      output.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-mid)">
        <i class="fas fa-search" style="font-size:36px;opacity:.3;margin-bottom:12px;display:block"></i>
        <p style="font-size:15px;font-weight:600">ফলাফল পাওয়া যায়নি</p>
        <p style="font-size:13px;margin-top:6px">রোল নম্বর, শ্রেণি ও পরীক্ষা সঠিকভাবে দিন।</p>
      </div>`;
      return;
    }

    const getGrade = m => m>=80?'A+':m>=70?'A':m>=60?'A-':m>=50?'B':m>=40?'C':'F';
    const getGP    = m => m>=80?5:m>=70?4:m>=60?3.5:m>=50?3:m>=40?2:0;

    const subjects = student.subjects || [];
    const rows = subjects.map(s =>
      `<tr><td>${esc(s.name)}</td><td>${s.full || 100}</td><td>${s.marks}</td><td>${getGrade(s.marks)}</td></tr>`
    ).join('');

    // Auto-calculate GPA if not stored, using simple average of grade points
    let displayGpa = student.gpa || '';
    if (!displayGpa && subjects.length > 0) {
      const totalGP = subjects.reduce((sum, s) => sum + getGP(s.marks), 0);
      displayGpa = (totalGP / subjects.length).toFixed(2);
    }

    output.innerHTML = `
      <div class="res-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
          <h3 style="font-size:18px;font-weight:800">📊 পরীক্ষার ফলাফল</h3>
          <button class="btn-glow" onclick="window.print()"><i class="fas fa-print"></i> প্রিন্ট</button>
        </div>
        <div class="res-info">
          <p><strong>নাম:</strong> ${esc(student.name || '')}</p>
          <p><strong>রোল:</strong> ${esc(roll)}</p>
          <p><strong>শ্রেণি:</strong> ${esc(classText)}</p>
          <p><strong>পরীক্ষা:</strong> ${esc(examText)}</p>
        </div>
        <table class="res-table">
          <thead><tr><th>বিষয়</th><th>পূর্ণমান</th><th>প্রাপ্ত</th><th>গ্রেড</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="res-gpa">GPA: ${esc(displayGpa || 'N/A')}</div>
      </div>
    `;
    output.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('ফলাফল পাওয়া গেছে!');
  } catch (err) {
    console.error(err);
    showToast('ডেটা লোড করতে সমস্যা হয়েছে।', 'error');
    output.innerHTML = '';
  }
});

// CONTACT FORM SAVE
document.getElementById('contactForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const name = document.getElementById('cfName').value.trim();
  const email = document.getElementById('cfEmail').value.trim();
  const subject = document.getElementById('cfSubject').value.trim();
  const message = document.getElementById('cfMessage').value.trim();

  if (!name || !email || !subject || !message) {
    showToast('সব ঘর পূরণ করুন।', 'error');
    return;
  }

  try {
    const now = new Date();
    const dateText = now.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    await push(ref(db, 'contactMessages'), {
      name,
      email,
      subject,
      message,
      createdAt: Date.now(),
      dateText
    });

    showToast('মেসেজ সফলভাবে পাঠানো হয়েছে!');
    document.getElementById('contactForm').reset();
  } catch (err) {
    console.error(err);
    showToast('মেসেজ পাঠাতে সমস্যা হয়েছে।', 'error');
  }
});

// ADMISSION FORM SAVE
document.getElementById('admissionForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const data = {
    studentName: document.getElementById('adName').value.trim(),
    dob: document.getElementById('adDob').value,
    gender: document.getElementById('adGender').value,
    applyClass: document.getElementById('adClass').value,
    fatherName: document.getElementById('adFather').value.trim(),
    motherName: document.getElementById('adMother').value.trim(),
    phone: document.getElementById('adPhone').value.trim(),
    address: document.getElementById('adAddress').value.trim()
  };

  if (!data.studentName || !data.dob || !data.gender || !data.applyClass || !data.fatherName || !data.motherName || !data.phone || !data.address) {
    showToast('সব ঘর পূরণ করুন।', 'error');
    return;
  }

  try {
    const now = new Date();
    const dateText = now.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    await push(ref(db, 'admissionApplications'), {
      ...data,
      createdAt: Date.now(),
      dateText,
      status: 'new'
    });

    showToast('আবেদন সফলভাবে জমা হয়েছে!');
    document.getElementById('admissionForm').reset();
  } catch (err) {
    console.error(err);
    showToast('আবেদন জমা দিতে সমস্যা হয়েছে।', 'error');
  }
});

// SCROLL TOP
document.getElementById('scrollTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// RIPPLE
document.querySelectorAll('.btn-glow,.btn-primary,.btn-outline').forEach(btn => {
  btn.addEventListener('click', function(e){
    const ripple = document.createElement('span');
    const r = this.getBoundingClientRect();
    const size = Math.max(r.width,r.height);
    ripple.style.cssText = `
      position:absolute;
      width:${size}px;
      height:${size}px;
      left:${e.clientX-r.left-size/2}px;
      top:${e.clientY-r.top-size/2}px;
      background:rgba(255,255,255,.3);
      border-radius:50%;
      transform:scale(0);
      animation:rippleAnim .6s ease;
      pointer-events:none;
    `;
    this.style.position='relative';
    this.style.overflow='hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// CALENDAR
const bnMonths = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const calEvents = {14:'event',15:'event',21:'holiday'};
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();

function renderCal(){
  const title = document.getElementById('calTitle');
  const daysEl = document.getElementById('calDays');
  if (!title || !daysEl) return;

  title.textContent = `${bnMonths[calMonth]} ${calYear}`;
  const firstDay = new Date(calYear,calMonth,1).getDay();
  const days = new Date(calYear,calMonth+1,0).getDate();
  const today = new Date();

  let html = '';
  const startOffset = (firstDay + 1) % 7;

  for(let i=0;i<startOffset;i++) html += '<div class="cal-day empty"></div>';

  for(let d=1;d<=days;d++){
    let cls = 'cal-day';
    if(d===today.getDate()&&calMonth===today.getMonth()&&calYear===today.getFullYear()) cls+=' today';
    else if(calEvents[d]) cls+=' '+calEvents[d];
    html += `<div class="${cls}">${d}</div>`;
  }

  daysEl.innerHTML = html;
}
document.getElementById('calPrev')?.addEventListener('click', () => {
  calMonth--;
  if(calMonth<0){ calMonth=11; calYear--; }
  renderCal();
});
document.getElementById('calNext')?.addEventListener('click', () => {
  calMonth++;
  if(calMonth>11){ calMonth=0; calYear++; }
  renderCal();
});
renderCal();
