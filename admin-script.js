import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase, ref, set, push, update, remove, get, onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

/* ─── Firebase Config ─── */
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
const auth = getAuth(app);
const db   = getDatabase(app);

/* ─── Helpers ─── */
const $    = id  => document.getElementById(id);
const val  = id  => ($( id)?.value ?? '').trim();
const setV = (id, v='') => { if($(id)) $(id).value = v ?? ''; };
const show = el  => el?.classList.remove('hidden');
const hide = el  => el?.classList.add('hidden');
const esc  = (s='') => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const cfm  = (msg='এটি মুছতে চান?') => window.confirm(msg);

function toast(msg, type='success'){
  const t = $('toast'); if(!t) return;
  $('toastMsg').textContent = msg;
  t.className = `toast ${type} show`;
  t.querySelector('i').className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ─── Caches ─── */
let teachersCache   = {};
let noticesCache    = {};
let tickerCache     = {};
let messagesCache   = {};
let admissionsCache = {};
let meritCache      = {};
let aboutCardsCache = {};
let feesCache       = {};
let photosCache     = {};
let videosCache     = {};
let eventsCache     = {};

/* ═══════════════════════════════════
   LOGIN / AUTH
═══════════════════════════════════ */
$('loginBtn')?.addEventListener('click', async () => {
  $('loginError').textContent = '';
  const email = val('lEmail'), pass = val('lPass');
  if(!email || !pass){ $('loginError').textContent = 'ইমেইল ও পাসওয়ার্ড দিন'; return; }
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch(e) {
    $('loginError').textContent = 'লগইন ব্যর্থ — ইমেইল/পাসওয়ার্ড চেক করুন';
  }
});
$('lPass')?.addEventListener('keydown', e => { if(e.key==='Enter') $('loginBtn').click(); });
$('logoutBtn')?.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, user => {
  if(user){
    hide($('loginWrap')); show($('app'));
    $('adminEmail').textContent = user.email;
    $('adminAvatar').textContent = user.email?.[0]?.toUpperCase() || 'A';
    initAdmin();
  } else {
    show($('loginWrap')); hide($('app'));
  }
});

/* ═══════════════════════════════════
   NAVIGATION
═══════════════════════════════════ */
const panelMeta = {
  dashboard:    ['Dashboard',          'সাইট পরিচালনা করুন'],
  siteSettings: ['Site Settings',      'Title, Description, Favicon, Icon সেটিং'],
  hero:         ['Hero Section',       'মূল পেজের শীর্ষ সেকশন'],
  ticker:       ['Ticker',             'Scrolling notice bar'],
  about:        ['About & Principal',  'প্রতিষ্ঠান পরিচিতি ও অধ্যক্ষের বাণী'],
  teachers:     ['Teachers',           'শিক্ষক তালিকা'],
  notices:      ['Notices',            'নোটিশ বোর্ড'],
  results:      ['Results & Merit',    'ফলাফল ও মেধাতালিকা'],
  admission:    ['Admission Info',     'ভর্তি তথ্য'],
  fees:         ['Fees',               'ফি কাঠামো'],
  gallery:      ['Gallery & Videos',   'ছবি ও ভিডিও'],
  events:       ['Events',             'আসন্ন অনুষ্ঠান'],
  contact:      ['Contact Info',       'যোগাযোগ তথ্য'],
  messages:     ['Contact Messages',   'ওয়েবসাইট থেকে আসা মেসেজ'],
  admissions:   ['Admission Apps',     'ভর্তি আবেদন সমূহ'],
};

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = btn.dataset.panel;
    $('panel-'+panel)?.classList.add('active');
    const meta = panelMeta[panel] || [panel, ''];
    $('pageTitle').textContent = meta[0];
    $('pageDesc').textContent  = meta[1];
  });
});

/* ═══════════════════════════════════
   INIT
═══════════════════════════════════ */
function initAdmin(){
  loadSiteSettings();
  loadHero();
  loadTicker();
  loadPrincipal();
  loadAboutCards();
  loadTeachers();       // ← Fixed
  loadNotices();
  loadMerit();
  loadResultStats();
  loadAdmissionInfo();
  loadFees();
  loadPhotos();
  loadVideos();
  loadEvents();
  loadContact();
  loadMessages();
  loadAdmissionApps();

  bindSiteSettings();
  bindHero();
  bindTicker();
  bindPrincipal();
  bindAboutCards();
  bindTeachers();
  bindNotices();
  bindMerit();
  bindResultStats();
  bindAdmission();
  bindFees();
  bindGallery();
  bindEvents();
  bindContact();
}

/* ═══════════════════════════════════
   SITE SETTINGS
═══════════════════════════════════ */
function loadSiteSettings(){
  get(ref(db,'siteSettings')).then(s => {
    const d = s.val() || {};
    // Try legacy siteInfo too
    get(ref(db,'siteInfo')).then(s2 => {
      const d2 = s2.val() || {};
      const merged = { ...d2, ...d };
      setV('siteNameBn',    merged.nameBn || merged.titleBn || '');
      setV('siteNameEn',    merged.nameEn || '');
      setV('siteMetaDesc',  merged.metaDesc || '');
      setV('siteFaviconUrl',merged.faviconUrl || '');
      setV('siteNavIcon',   merged.navIcon || '🕌');
      setV('siteEiin',      merged.eiin || '');
      setV('siteEstablished',merged.established || '1985');
      setV('siteTagline',   merged.tagline || '');
      setV('siteFooterText',merged.footerText || '');
      setV('siteFacebook',  merged.facebook || '');
      setV('siteYoutube',   merged.youtube || '');
      setV('siteWhatsapp',  merged.whatsapp || '');
      setV('siteInstagram', merged.instagram || '');
      if(merged.faviconUrl) prevFavicon(merged.faviconUrl);
    });
  });
}
function bindSiteSettings(){
  $('saveSiteSettingsBtn')?.addEventListener('click', async () => {
    const data = {
      nameBn:      val('siteNameBn'),
      nameEn:      val('siteNameEn'),
      metaDesc:    val('siteMetaDesc'),
      faviconUrl:  val('siteFaviconUrl'),
      navIcon:     val('siteNavIcon'),
      eiin:        val('siteEiin'),
      established: val('siteEstablished'),
      tagline:     val('siteTagline'),
      footerText:  val('siteFooterText'),
      facebook:    val('siteFacebook'),
      youtube:     val('siteYoutube'),
      whatsapp:    val('siteWhatsapp'),
      instagram:   val('siteInstagram'),
    };
    // Save to both nodes for backward compat
    await Promise.all([
      set(ref(db,'siteSettings'), data),
      set(ref(db,'siteInfo'), {
        eiin: data.eiin, established: data.established,
        facebook: data.facebook, youtube: data.youtube,
        whatsapp: data.whatsapp, instagram: data.instagram,
        footerText: data.footerText
      })
    ]);
    toast('Site Settings সেভ হয়েছে!');
  });
}

/* Favicon preview */
window.prevFavicon = function(url){
  const img = $('faviconPreview');
  if(!img) return;
  if(url){ img.src = url; img.style.display = 'block'; }
  else    { img.style.display = 'none'; }
};

/* ═══════════════════════════════════
   HERO
═══════════════════════════════════ */
function loadHero(){
  get(ref(db,'hero')).then(s => {
    const d = s.val() || {};
    setV('heroTitleBn',  d.titleBn);
    setV('heroTitleEn',  d.titleEn);
    setV('heroMottoBn',  d.mottoBn);
    setV('heroMottoEn',  d.mottoEn);
    setV('heroDescBn',   d.descBn);
    setV('heroDescEn',   d.descEn);
    setV('heroStudents', d.students ?? '');
    setV('heroTeachers', d.teachers ?? '');
    setV('heroPassRate', d.passRate ?? '');
    setV('heroYears',    d.years ?? '');
  });
}
function bindHero(){
  $('saveHeroBtn')?.addEventListener('click', async () => {
    const data = {
      titleBn:  val('heroTitleBn'),
      titleEn:  val('heroTitleEn'),
      mottoBn:  val('heroMottoBn'),
      mottoEn:  val('heroMottoEn'),
      descBn:   val('heroDescBn'),
      descEn:   val('heroDescEn'),
      students: Number(val('heroStudents')) || 0,
      teachers: Number(val('heroTeachers')) || 0,
      passRate: Number(val('heroPassRate')) || 0,
      years:    Number(val('heroYears'))    || 0,
    };
    await set(ref(db,'hero'), data);
    await update(ref(db,'stats'), {
      students: data.students, teachers: data.teachers,
      passRate: data.passRate, years: data.years
    });
    toast('Hero Section সেভ হয়েছে!');
  });
}

/* ═══════════════════════════════════
   TICKER
═══════════════════════════════════ */
function loadTicker(){
  onValue(ref(db,'ticker'), snap => {
    tickerCache = snap.val() || {};
    renderTicker();
  });
}
function renderTicker(){
  const list  = $('tickerList');
  const items = Object.entries(tickerCache);
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো ticker নেই</p></div>'; return; }
  list.innerHTML = items.map(([id,t]) => `
    <div class="list-item">
      <span class="tag ${t.active?'active':'inactive'}">${t.active?'Active':'Inactive'}</span>
      <h4>${esc(t.text||'')}</h4>
      <div class="list-actions">
        <button class="btn ghost" data-tt="${id}">${t.active?'Deactivate':'Activate'}</button>
        <button class="btn danger" data-td="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-tt]').forEach(b => b.onclick = async () => {
    const id = b.dataset.tt;
    await update(ref(db,`ticker/${id}`), { active: !tickerCache[id].active });
    toast('Ticker আপডেট হয়েছে');
  });
  list.querySelectorAll('[data-td]').forEach(b => b.onclick = async () => {
    if(!cfm('Ticker delete করতে চান?')) return;
    await remove(ref(db,`ticker/${b.dataset.td}`));
    toast('Ticker মুছে গেছে');
  });
}
function bindTicker(){
  $('addTickerBtn')?.addEventListener('click', async () => {
    const text = val('tickerInput');
    if(!text) return toast('Ticker message লিখুন','error');
    await push(ref(db,'ticker'), { text, active: true });
    setV('tickerInput','');
    toast('Ticker যোগ হয়েছে!');
  });
  $('tickerInput')?.addEventListener('keydown', e => { if(e.key==='Enter') $('addTickerBtn').click(); });
}

/* ═══════════════════════════════════
   PRINCIPAL
═══════════════════════════════════ */
function loadPrincipal(){
  get(ref(db,'principal')).then(s => {
    const d = s.val() || {};
    setV('principalName',    d.name);
    setV('principalDesig',   d.designation);
    setV('principalPhoto',   d.photo);
    setV('principalMessage', d.message);
  });
}
function bindPrincipal(){
  $('savePrincipalBtn')?.addEventListener('click', async () => {
    await set(ref(db,'principal'), {
      name:        val('principalName'),
      designation: val('principalDesig'),
      photo:       val('principalPhoto'),
      message:     val('principalMessage'),
    });
    toast('Principal সেভ হয়েছে!');
  });
}

/* ═══════════════════════════════════
   ABOUT CARDS
═══════════════════════════════════ */
function loadAboutCards(){
  onValue(ref(db,'aboutCards'), snap => {
    aboutCardsCache = snap.val() || {};
    renderAboutCards();
  });
}
function renderAboutCards(){
  const list  = $('aboutCardList');
  const items = Object.entries(aboutCardsCache);
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো card নেই</p></div>'; return; }
  list.innerHTML = items.map(([id,c]) => `
    <div class="list-item">
      <h4><i class="${esc(c.icon||'fas fa-star')}"></i> ${esc(c.titleBn||'')}</h4>
      <p>${esc(c.descBn||'')}</p>
      <div class="list-actions">
        <button class="btn ghost" data-ace="${id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn danger" data-acd="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-ace]').forEach(b => b.onclick = () => {
    const c = aboutCardsCache[b.dataset.ace];
    setV('aboutCardEditId', b.dataset.ace);
    setV('aboutCardIcon',    c.icon);
    setV('aboutCardTitleBn', c.titleBn);
    setV('aboutCardDescBn',  c.descBn);
  });
  list.querySelectorAll('[data-acd]').forEach(b => b.onclick = async () => {
    if(!cfm()) return;
    await remove(ref(db,`aboutCards/${b.dataset.acd}`));
    toast('Card মুছে গেছে');
  });
}
function bindAboutCards(){
  $('saveAboutCardBtn')?.addEventListener('click', async () => {
    const data = { icon: val('aboutCardIcon'), titleBn: val('aboutCardTitleBn'), descBn: val('aboutCardDescBn') };
    if(!data.titleBn) return toast('Title দিন','error');
    const editId = val('aboutCardEditId');
    if(editId) await update(ref(db,`aboutCards/${editId}`), data);
    else       await push(ref(db,'aboutCards'), data);
    clearAboutCard();
    toast('Card সেভ হয়েছে!');
  });
  $('clearAboutCardBtn')?.addEventListener('click', clearAboutCard);
}
function clearAboutCard(){ setV('aboutCardEditId',''); setV('aboutCardIcon',''); setV('aboutCardTitleBn',''); setV('aboutCardDescBn',''); }

/* ═══════════════════════════════════
   TEACHERS  ← BUG FIXED
═══════════════════════════════════ */
function loadTeachers(){
  // FIX: use onValue (real-time) so list always syncs
  onValue(ref(db,'teachers'), snap => {
    teachersCache = snap.val() || {};
    const count = Object.keys(teachersCache).length;
    $('dashTeacherCount').textContent  = count;
    $('teacherCountBadge').textContent = count;
    renderTeachers();
  });
}
function renderTeachers(){
  const list  = $('teacherList');
  const items = Object.entries(teachersCache);
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো শিক্ষক নেই। উপরের ফর্মে যোগ করুন।</p></div>'; return; }
  list.innerHTML = items.map(([id,t]) => `
    <div class="list-item">
      ${t.photo ? `<img src="${esc(t.photo)}" class="teacher-photo-prev" onerror="this.style.display='none'" alt="">` : ''}
      <span class="tag ${t.dept==='islamic'?'academic':t.dept==='science'?'event':'normal'}">${esc(t.dept||'general')}</span>
      <h4>${esc(t.name||'')}</h4>
      <p><strong>পদবি:</strong> ${esc(t.role||'')} | <strong>বিষয়:</strong> ${esc(t.subject||'')}</p>
      <p>${esc(t.qualification||'')}</p>
      <div class="list-actions">
        <button class="btn ghost" data-te="${id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn danger" data-td="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-te]').forEach(b => b.onclick = () => {
    const t = teachersCache[b.dataset.te]; if(!t) return;
    setV('teacherEditId',      b.dataset.te);
    setV('teacherName',        t.name);
    setV('teacherRole',        t.role);
    setV('teacherSubject',     t.subject);
    setV('teacherDept',        t.dept || 'general');
    setV('teacherQualification', t.qualification);
    setV('teacherPhoto',       t.photo || '');
    window.scrollTo({top:0, behavior:'smooth'});
  });
  list.querySelectorAll('[data-td]').forEach(b => b.onclick = async () => {
    if(!cfm('Teacher delete করতে চান?')) return;
    await remove(ref(db,`teachers/${b.dataset.td}`));
    toast('Teacher মুছে গেছে');
  });
}
function bindTeachers(){
  $('saveTeacherBtn')?.addEventListener('click', async () => {
    const name = val('teacherName');
    if(!name) return toast('Teacher-এর নাম দিন','error');
    const data = {
      name,
      role:          val('teacherRole'),
      subject:       val('teacherSubject'),
      dept:          val('teacherDept'),
      qualification: val('teacherQualification'),
      photo:         val('teacherPhoto'),
    };
    const editId = val('teacherEditId');
    if(editId) await update(ref(db,`teachers/${editId}`), data);
    else       await push(ref(db,'teachers'), data);
    clearTeacher();
    toast('Teacher সেভ হয়েছে!');
  });
  $('clearTeacherBtn')?.addEventListener('click', clearTeacher);
}
function clearTeacher(){
  setV('teacherEditId',''); setV('teacherName',''); setV('teacherRole','');
  setV('teacherSubject',''); setV('teacherDept','general');
  setV('teacherQualification',''); setV('teacherPhoto','');
}

/* ═══════════════════════════════════
   NOTICES
═══════════════════════════════════ */
function loadNotices(){
  onValue(ref(db,'notices'), snap => {
    noticesCache = snap.val() || {};
    $('dashNoticeCount').textContent = Object.keys(noticesCache).length;
    renderNotices();
  });
}
function renderNotices(){
  const list  = $('noticeList');
  const items = Object.entries(noticesCache).sort((a,b) => (b[1].date||'').localeCompare(a[1].date||''));
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো নোটিশ নেই</p></div>'; return; }
  list.innerHTML = items.map(([id,n]) => `
    <div class="list-item">
      <span class="tag ${n.type||'normal'}">${n.type||'normal'}</span>
      <span class="tag ${n.active?'active':'inactive'}" style="margin-left:4px">${n.active?'Active':'Hidden'}</span>
      <h4>${esc(n.title||'')}</h4>
      <p>${esc(n.body||'').substring(0,100)}${(n.body||'').length>100?'…':''}</p>
      <p style="font-size:11px;color:var(--text-mid)">${esc(n.dateDisplay||n.date||'')}</p>
      <div class="list-actions">
        <button class="btn ghost" data-ne="${id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn danger" data-nd="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-ne]').forEach(b => b.onclick = () => {
    const n = noticesCache[b.dataset.ne]; if(!n) return;
    setV('noticeEditId', b.dataset.ne); setV('noticeTitle', n.title);
    setV('noticeBody',   n.body);       setV('noticeType', n.type||'normal');
    setV('noticeDate',   n.date||'');   setV('noticeDateDisplay', n.dateDisplay||'');
    setV('noticeLink',   n.link||'');   $('noticeActive').checked = !!n.active;
    window.scrollTo({top:0, behavior:'smooth'});
  });
  list.querySelectorAll('[data-nd]').forEach(b => b.onclick = async () => {
    if(!cfm('Notice delete করতে চান?')) return;
    await remove(ref(db,`notices/${b.dataset.nd}`));
    toast('Notice মুছে গেছে');
  });
}
function bindNotices(){
  $('saveNoticeBtn')?.addEventListener('click', async () => {
    const title = val('noticeTitle'), body = val('noticeBody');
    if(!title||!body) return toast('Title ও Body দিন','error');
    const data = {
      title, body,
      type:        val('noticeType'),
      date:        val('noticeDate'),
      dateDisplay: val('noticeDateDisplay'),
      link:        val('noticeLink'),
      active:      $('noticeActive').checked,
    };
    const editId = val('noticeEditId');
    if(editId) await update(ref(db,`notices/${editId}`), data);
    else       await push(ref(db,'notices'), data);
    clearNotice();
    toast('Notice সেভ হয়েছে!');
  });
  $('clearNoticeBtn')?.addEventListener('click', clearNotice);
}
function clearNotice(){
  setV('noticeEditId',''); setV('noticeTitle',''); setV('noticeBody','');
  setV('noticeType','normal'); setV('noticeDate',''); setV('noticeDateDisplay','');
  setV('noticeLink',''); $('noticeActive').checked = true;
}

/* ═══════════════════════════════════
   MERIT LIST
═══════════════════════════════════ */
function loadMerit(){
  onValue(ref(db,'merit'), snap => {
    meritCache = snap.val() || {};
    renderMerit();
  });
}
function renderMerit(){
  const list  = $('meritList');
  const items = Object.entries(meritCache).sort((a,b) => (a[1].rank||99) - (b[1].rank||99));
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো মেধাবী শিক্ষার্থী নেই</p></div>'; return; }
  const medals = ['🥇','🥈','🥉'];
  list.innerHTML = items.map(([id,m]) => `
    <div class="list-item">
      <h4>${medals[(m.rank||1)-1] || (m.rank+'ম')} ${esc(m.name||'')}</h4>
      <p>GPA: ${esc(m.gpa||'')} | ${esc(m.class||'')}</p>
      <div class="list-actions">
        <button class="btn ghost" data-me="${id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn danger" data-md="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-me]').forEach(b => b.onclick = () => {
    const m = meritCache[b.dataset.me];
    setV('meritEditId', b.dataset.me); setV('meritName', m.name);
    setV('meritGpa', m.gpa); setV('meritClass', m.class); setV('meritRank', m.rank);
  });
  list.querySelectorAll('[data-md]').forEach(b => b.onclick = async () => {
    if(!cfm()) return;
    await remove(ref(db,`merit/${b.dataset.md}`));
    toast('মেধাবী শিক্ষার্থী মুছে গেছে');
  });
}
function bindMerit(){
  $('saveMeritBtn')?.addEventListener('click', async () => {
    const name = val('meritName');
    if(!name) return toast('নাম দিন','error');
    const data = { name, gpa: val('meritGpa'), class: val('meritClass'), rank: Number(val('meritRank'))||1 };
    const editId = val('meritEditId');
    if(editId) await update(ref(db,`merit/${editId}`), data);
    else       await push(ref(db,'merit'), data);
    clearMerit(); toast('Merit সেভ হয়েছে!');
  });
  $('clearMeritBtn')?.addEventListener('click', clearMerit);
}
function clearMerit(){ setV('meritEditId',''); setV('meritName',''); setV('meritGpa',''); setV('meritClass',''); setV('meritRank',''); }

/* ─── Result Stats ─── */
function loadResultStats(){
  get(ref(db,'resultStats')).then(s => {
    const d = s.val() || {};
    setV('rsTotal', d.total); setV('rsPass', d.pass);
    setV('rsGpa5', d.gpa5);  setV('rsTeachers', d.teachers);
  });
}
function bindResultStats(){
  $('saveResultStatsBtn')?.addEventListener('click', async () => {
    await set(ref(db,'resultStats'), {
      total: val('rsTotal'), pass: val('rsPass'),
      gpa5:  val('rsGpa5'),  teachers: val('rsTeachers'),
    });
    toast('Result Stats সেভ হয়েছে!');
  });
}

/* ─── Result Entry per student ─── */
$('loadResultBtn')?.addEventListener('click', async () => {
  const cls  = val('resultClass');
  const exam = val('resultExam');
  const roll = val('resultRoll').trim();
  if(!roll) return toast('রোল নম্বর দিন','error');

  // Normalize roll: strip leading zeros for numeric rolls
  const normalizedRoll = /^\d+$/.test(roll) ? String(parseInt(roll, 10)) : roll;

  // Try normalized first, then original
  let student = null;
  const paths = [...new Set([
    `results/${cls}/${exam}/${normalizedRoll}`,
    `results/${cls}/${exam}/${roll}`
  ])];
  for (const path of paths) {
    const snap = await get(ref(db, path));
    if (snap.val()) { student = snap.val(); break; }
  }

  showResultEntryForm(cls, exam, normalizedRoll, student);
});

function showResultEntryForm(cls, exam, roll, existing){
  const area = $('resultEntryArea');
  const subj = existing?.subjects || [];
  area.innerHTML = `
    <div style="background:var(--input-bg);border:1.5px solid var(--border);border-radius:10px;padding:16px;margin-top:8px">
      <div class="grid two" style="margin-bottom:12px">
        <div class="field"><label>শিক্ষার্থীর নাম</label><input id="reStudentName" value="${esc(existing?.name||'')}" type="text"></div>
        <div class="field"><label>GPA</label><input id="reGpa" value="${esc(existing?.gpa||'')}" type="text"></div>
      </div>
      <h4 style="font-size:13px;font-weight:600;margin-bottom:10px">বিষয় ও নম্বর</h4>
      <div id="reSubjects">${subj.map((s,i) => subjectRow(s.name, s.full||100, s.marks, i)).join('')}</div>
      <button class="btn ghost" id="reAddSubBtn" style="margin-bottom:12px"><i class="fas fa-plus"></i> বিষয় যোগ করুন</button>
      <br>
      <button class="btn primary" id="reSaveBtn"><i class="fas fa-save"></i> Result সেভ করুন</button>
    </div>`;
  $('reAddSubBtn').onclick = () => {
    const idx = $('reSubjects').querySelectorAll('.re-row').length;
    $('reSubjects').insertAdjacentHTML('beforeend', subjectRow('','100','',idx));
  };
  $('reSaveBtn').onclick = async () => {
    const studentName = val('reStudentName').trim();
    if (!studentName) return toast('শিক্ষার্থীর নাম দিন', 'error');

    const rows = $('reSubjects').querySelectorAll('.re-row');
    const subjects = Array.from(rows).map(r => ({
      name:  r.querySelector('.re-subname').value.trim(),
      full:  Number(r.querySelector('.re-full').value)||100,
      marks: Number(r.querySelector('.re-marks').value)||0,
    })).filter(s => s.name);

    if (subjects.length === 0) return toast('অন্তত একটি বিষয় যোগ করুন', 'error');

    // Auto-calculate GPA if field is empty
    const getGP = m => m>=80?5:m>=70?4:m>=60?3.5:m>=50?3:m>=40?2:0;
    let gpa = val('reGpa').trim();
    if (!gpa && subjects.length > 0) {
      const totalGP = subjects.reduce((sum, s) => sum + getGP(s.marks), 0);
      gpa = (totalGP / subjects.length).toFixed(2);
    }

    // Normalize roll: store as plain string (strip leading zeros for numeric)
    const normalizedRoll = /^\d+$/.test(roll) ? String(parseInt(roll, 10)) : roll;

    const data = { name: studentName, gpa, subjects };
    await set(ref(db,`results/${cls}/${exam}/${normalizedRoll}`), data);
    toast(`Result সেভ হয়েছে! (GPA: ${gpa})`);
  };
}
function subjectRow(name,full,marks,idx){
  return `<div class="re-row" style="display:grid;grid-template-columns:1fr 80px 80px auto;gap:8px;margin-bottom:8px;align-items:center">
    <input class="re-subname" type="text" placeholder="বিষয়ের নাম" value="${esc(name)}" style="padding:7px 10px;border:1.5px solid var(--border);border-radius:7px;font-size:13px;background:var(--card-bg)">
    <input class="re-full" type="number" placeholder="পূর্ণমান" value="${esc(full)}" style="padding:7px 10px;border:1.5px solid var(--border);border-radius:7px;font-size:13px;background:var(--card-bg)">
    <input class="re-marks" type="number" placeholder="প্রাপ্ত" value="${esc(marks)}" style="padding:7px 10px;border:1.5px solid var(--border);border-radius:7px;font-size:13px;background:var(--card-bg)">
    <button onclick="this.closest('.re-row').remove()" style="padding:7px 10px;border:none;border-radius:7px;background:#fee2e2;color:#dc2626;cursor:pointer;font-size:12px"><i class="fas fa-times"></i></button>
  </div>`;
}

/* ═══════════════════════════════════
   ADMISSION INFO
═══════════════════════════════════ */
function loadAdmissionInfo(){
  get(ref(db,'admission')).then(s => {
    const d = s.val() || {};
    setV('admYear',       d.year);
    setV('admFee',        d.fee);
    setV('admStartDate',  d.startDate);
    setV('admEndDate',    d.endDate);
    setV('admExamDate',   d.examDate);
    setV('admResultDate', d.resultDate);
  });
}
function bindAdmission(){
  $('saveAdmissionBtn')?.addEventListener('click', async () => {
    await set(ref(db,'admission'), {
      year:       val('admYear'),
      fee:        val('admFee'),
      startDate:  val('admStartDate'),
      endDate:    val('admEndDate'),
      examDate:   val('admExamDate'),
      resultDate: val('admResultDate'),
    });
    toast('Admission Info সেভ হয়েছে!');
  });
}

/* ═══════════════════════════════════
   FEES
═══════════════════════════════════ */
function loadFees(){
  onValue(ref(db,'fees'), snap => {
    feesCache = snap.val() || {};
    renderFees();
  });
}
function renderFees(){
  const list  = $('feeList');
  const items = Object.entries(feesCache);
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো ফি তথ্য নেই</p></div>'; return; }
  list.innerHTML = items.map(([id,f]) => `
    <div class="list-item">
      <h4>${esc(f.className||'')}</h4>
      <p>ভর্তি ফি: ${esc(f.admissionFee||'')} | মাসিক: ${esc(f.monthlyFee||'')} | পরীক্ষা: ${esc(f.examFee||'')}</p>
      <div class="list-actions">
        <button class="btn ghost" data-fe="${id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn danger" data-fd="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-fe]').forEach(b => b.onclick = () => {
    const f = feesCache[b.dataset.fe];
    setV('feeEditId', b.dataset.fe); setV('feeClass', f.className);
    setV('feeAdmission', f.admissionFee); setV('feeMonthly', f.monthlyFee); setV('feeExam', f.examFee);
  });
  list.querySelectorAll('[data-fd]').forEach(b => b.onclick = async () => {
    if(!cfm()) return;
    await remove(ref(db,`fees/${b.dataset.fd}`));
    toast('ফি তথ্য মুছে গেছে');
  });
}
function bindFees(){
  $('saveFeeBtn')?.addEventListener('click', async () => {
    const className = val('feeClass');
    if(!className) return toast('শ্রেণির নাম দিন','error');
    const data = { className, admissionFee: val('feeAdmission'), monthlyFee: val('feeMonthly'), examFee: val('feeExam') };
    const editId = val('feeEditId');
    if(editId) await update(ref(db,`fees/${editId}`), data);
    else       await push(ref(db,'fees'), data);
    clearFee(); toast('ফি তথ্য সেভ হয়েছে!');
  });
  $('clearFeeBtn')?.addEventListener('click', clearFee);
}
function clearFee(){ setV('feeEditId',''); setV('feeClass',''); setV('feeAdmission',''); setV('feeMonthly',''); setV('feeExam',''); }

/* ═══════════════════════════════════
   GALLERY (Photos + Videos)
═══════════════════════════════════ */
function loadPhotos(){
  onValue(ref(db,'gallery'), snap => {
    photosCache = snap.val() || {};
    renderPhotos();
  });
}
function renderPhotos(){
  const list  = $('photoList');
  const items = Object.entries(photosCache);
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো ছবি নেই</p></div>'; return; }
  list.innerHTML = items.map(([id,p]) => `
    <div class="list-item">
      <h4>${esc(p.title||'')} <small style="color:var(--text-mid)">[${esc(p.cat||'')}]</small></h4>
      <p>${esc(p.desc||'')}</p>
      <div class="list-actions">
        <button class="btn ghost" data-ppe="${id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn danger" data-ppd="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-ppe]').forEach(b => b.onclick = () => {
    const p = photosCache[b.dataset.ppe];
    setV('photoEditId', b.dataset.ppe); setV('photoUrl', p.url);
    setV('photoTitle', p.title); setV('photoCat', p.cat); setV('photoDesc', p.desc);
  });
  list.querySelectorAll('[data-ppd]').forEach(b => b.onclick = async () => {
    if(!cfm()) return;
    await remove(ref(db,`gallery/${b.dataset.ppd}`)); toast('ছবি মুছে গেছে');
  });
}

function loadVideos(){
  onValue(ref(db,'videos'), snap => {
    videosCache = snap.val() || {};
    renderVideos();
  });
}
function renderVideos(){
  const list  = $('videoList');
  const items = Object.entries(videosCache);
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো ভিডিও নেই</p></div>'; return; }
  list.innerHTML = items.map(([id,v]) => `
    <div class="list-item">
      <span class="tag ${v.active!==false?'active':'inactive'}">${v.active!==false?'Active':'Hidden'}</span>
      <h4>${esc(v.title||'')} <small>ID: ${esc(v.ytId||'')}</small></h4>
      <div class="list-actions">
        <button class="btn ghost" data-ve="${id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn danger" data-vd="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-ve]').forEach(b => b.onclick = () => {
    const v = videosCache[b.dataset.ve];
    setV('videoEditId', b.dataset.ve); setV('videoYtId', v.ytId);
    setV('videoTitle', v.title); $('videoActive').checked = v.active !== false;
  });
  list.querySelectorAll('[data-vd]').forEach(b => b.onclick = async () => {
    if(!cfm()) return;
    await remove(ref(db,`videos/${b.dataset.vd}`)); toast('ভিডিও মুছে গেছে');
  });
}

function bindGallery(){
  $('savePhotoBtn')?.addEventListener('click', async () => {
    const url = val('photoUrl');
    if(!url) return toast('Photo URL দিন','error');
    const data = { url, title: val('photoTitle'), cat: val('photoCat'), desc: val('photoDesc') };
    const editId = val('photoEditId');
    if(editId) await update(ref(db,`gallery/${editId}`), data);
    else       await push(ref(db,'gallery'), data);
    clearPhoto(); toast('Photo সেভ হয়েছে!');
  });
  $('clearPhotoBtn')?.addEventListener('click', clearPhoto);

  $('saveVideoBtn')?.addEventListener('click', async () => {
    const ytId = val('videoYtId');
    if(!ytId) return toast('YouTube ID দিন','error');
    const data = { ytId, title: val('videoTitle'), active: $('videoActive').checked };
    const editId = val('videoEditId');
    if(editId) await update(ref(db,`videos/${editId}`), data);
    else       await push(ref(db,'videos'), data);
    clearVideo(); toast('Video সেভ হয়েছে!');
  });
  $('clearVideoBtn')?.addEventListener('click', clearVideo);
}
function clearPhoto(){ setV('photoEditId',''); setV('photoUrl',''); setV('photoTitle',''); setV('photoCat','campus'); setV('photoDesc',''); }
function clearVideo(){ setV('videoEditId',''); setV('videoYtId',''); setV('videoTitle',''); $('videoActive').checked=true; }

/* ═══════════════════════════════════
   EVENTS
═══════════════════════════════════ */
function loadEvents(){
  onValue(ref(db,'events'), snap => {
    eventsCache = snap.val() || {};
    renderEvents();
  });
}
function renderEvents(){
  const list  = $('eventList');
  const items = Object.entries(eventsCache);
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো ইভেন্ট নেই</p></div>'; return; }
  list.innerHTML = items.map(([id,e]) => `
    <div class="list-item">
      <h4>${esc(e.day||'')} ${esc(e.month||'')} — ${esc(e.title||'')}</h4>
      <p>${esc(e.time||'')} ${e.place?'| '+esc(e.place):''}</p>
      <div class="list-actions">
        <button class="btn ghost" data-evte="${id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn danger" data-evtd="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-evte]').forEach(b => b.onclick = () => {
    const e = eventsCache[b.dataset.evte];
    setV('eventEditId', b.dataset.evte); setV('eventTitle', e.title);
    setV('eventDay', e.day); setV('eventMonth', e.month);
    setV('eventTime', e.time); setV('eventPlace', e.place); setV('eventDesc', e.desc);
  });
  list.querySelectorAll('[data-evtd]').forEach(b => b.onclick = async () => {
    if(!cfm()) return;
    await remove(ref(db,`events/${b.dataset.evtd}`)); toast('Event মুছে গেছে');
  });
}
function bindEvents(){
  $('saveEventBtn')?.addEventListener('click', async () => {
    const title = val('eventTitle');
    if(!title) return toast('শিরোনাম দিন','error');
    const data = {
      title, day: val('eventDay'), month: val('eventMonth'),
      time: val('eventTime'), place: val('eventPlace'), desc: val('eventDesc'),
    };
    const editId = val('eventEditId');
    if(editId) await update(ref(db,`events/${editId}`), data);
    else       await push(ref(db,'events'), data);
    clearEvent(); toast('Event সেভ হয়েছে!');
  });
  $('clearEventBtn')?.addEventListener('click', clearEvent);
}
function clearEvent(){ setV('eventEditId',''); setV('eventTitle',''); setV('eventDay',''); setV('eventMonth',''); setV('eventTime',''); setV('eventPlace',''); setV('eventDesc',''); }

/* ═══════════════════════════════════
   CONTACT
═══════════════════════════════════ */
function loadContact(){
  get(ref(db,'contact')).then(s => {
    const d = s.val() || {};
    setV('contactAddress',      d.address);
    setV('contactPhone',        d.phone);
    setV('contactEmail',        d.email);
    setV('contactHours',        d.hours);
    setV('contactAddressShort', d.addressShort);
    setV('contactPhoneShort',   d.phoneShort);
    setV('contactEmailShort',   d.emailShort);
    setV('contactHoursShort',   d.hoursShort);
    setV('contactCallNumber',   d.callNumber);
    setV('contactWhatsapp',     d.whatsapp);
  });
}
function bindContact(){
  $('saveContactBtn')?.addEventListener('click', async () => {
    await set(ref(db,'contact'), {
      address:      val('contactAddress'),
      phone:        val('contactPhone'),
      email:        val('contactEmail'),
      hours:        val('contactHours'),
      addressShort: val('contactAddressShort'),
      phoneShort:   val('contactPhoneShort'),
      emailShort:   val('contactEmailShort'),
      hoursShort:   val('contactHoursShort'),
      callNumber:   val('contactCallNumber'),
      whatsapp:     val('contactWhatsapp'),
    });
    toast('Contact Info সেভ হয়েছে!');
  });
}

/* ═══════════════════════════════════
   MESSAGES & ADMISSION APPS
═══════════════════════════════════ */
function loadMessages(){
  onValue(ref(db,'contactMessages'), snap => {
    messagesCache = snap.val() || {};
    const count = Object.keys(messagesCache).length;
    $('msgCount').textContent      = count;
    $('dashMsgCount').textContent  = count;
    $('msgCountBadge').textContent = count;
    renderMessages();
  });
}
function renderMessages(){
  const list  = $('messageList');
  const items = Object.entries(messagesCache).sort((a,b) => (b[1].createdAt||0) - (a[1].createdAt||0));
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো মেসেজ নেই</p></div>'; return; }
  list.innerHTML = items.map(([id,m]) => `
    <div class="msg-card">
      <h4><i class="fas fa-envelope" style="color:var(--primary)"></i> ${esc(m.subject||'No subject')}</h4>
      <div class="msg-meta">
        <span><strong>নাম:</strong> ${esc(m.name||'')}</span>
        <span><strong>ইমেইল:</strong> ${esc(m.email||'')}</span>
        <span><strong>তারিখ:</strong> ${esc(m.dateText||'')}</span>
      </div>
      <p style="font-size:13px;background:var(--bg);padding:10px;border-radius:6px">${esc(m.message||'')}</p>
      <div class="list-actions" style="margin-top:10px">
        <button class="btn danger" data-msgd="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-msgd]').forEach(b => b.onclick = async () => {
    if(!cfm('এই মেসেজ delete করতে চান?')) return;
    await remove(ref(db,`contactMessages/${b.dataset.msgd}`)); toast('মেসেজ মুছে গেছে');
  });
}

function loadAdmissionApps(){
  onValue(ref(db,'admissionApplications'), snap => {
    admissionsCache = snap.val() || {};
    const count = Object.keys(admissionsCache).length;
    $('admCount').textContent      = count;
    $('dashAdmCount').textContent  = count;
    $('admCountBadge').textContent = count;
    renderAdmissionApps();
  });
}
function renderAdmissionApps(){
  const list  = $('admissionList');
  const items = Object.entries(admissionsCache).sort((a,b) => (b[1].createdAt||0) - (a[1].createdAt||0));
  if(!items.length){ list.innerHTML = '<div class="list-item"><p>কোনো ভর্তি আবেদন নেই</p></div>'; return; }
  list.innerHTML = items.map(([id,a]) => `
    <div class="msg-card">
      <h4><i class="fas fa-user-plus" style="color:var(--primary)"></i> ${esc(a.studentName||'')}</h4>
      <div class="msg-meta">
        <span><strong>শ্রেণি:</strong> ${esc(a.applyClass||'')}</span>
        <span><strong>জন্ম তারিখ:</strong> ${esc(a.dob||'')}</span>
        <span><strong>লিঙ্গ:</strong> ${esc(a.gender||'')}</span>
        <span><strong>পিতার নাম:</strong> ${esc(a.fatherName||'')}</span>
        <span><strong>মাতার নাম:</strong> ${esc(a.motherName||'')}</span>
        <span><strong>ফোন:</strong> ${esc(a.phone||'')}</span>
        <span><strong>তারিখ:</strong> ${esc(a.dateText||'')}</span>
      </div>
      <p style="font-size:13px"><strong>ঠিকানা:</strong> ${esc(a.address||'')}</p>
      <div class="list-actions" style="margin-top:10px">
        <button class="btn danger" data-admd="${id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-admd]').forEach(b => b.onclick = async () => {
    if(!cfm('এই আবেদন delete করতে চান?')) return;
    await remove(ref(db,`admissionApplications/${b.dataset.admd}`)); toast('আবেদন মুছে গেছে');
  });
}

/* ═══════════════════════════════════
   BULK RESULT UPLOAD
═══════════════════════════════════ */

// ── Shared helpers ──
const _getGP   = m => m>=80?5:m>=70?4:m>=60?3.5:m>=50?3:m>=40?2:0;
const _calcGPA = subjects => subjects.length
  ? (subjects.reduce((s,x) => s + _getGP(x.marks), 0) / subjects.length).toFixed(2)
  : '0.00';

// Normalize roll string
const _normRoll = r => /^\d+$/.test(r) ? String(parseInt(r,10)) : r;

// ── Tab switching ──
$('bulkTabCsvBtn')?.addEventListener('click', () => {
  $('bulkTabCsv').style.display    = 'block';
  $('bulkTabManual').style.display = 'none';
  $('bulkTabCsvBtn').classList.add('bulk-tab-active');
  $('bulkTabManualBtn').classList.remove('bulk-tab-active');
  $('bulkSharedActions').style.display = 'none';
});
$('bulkTabManualBtn')?.addEventListener('click', () => {
  $('bulkTabCsv').style.display    = 'none';
  $('bulkTabManual').style.display = 'block';
  $('bulkTabManualBtn').classList.add('bulk-tab-active');
  $('bulkTabCsvBtn').classList.remove('bulk-tab-active');
  $('bulkSharedActions').style.display = 'none';
});

// ══════════════════════════════
//  CSV TAB
// ══════════════════════════════

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const delim = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g,''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delim).map(c => c.trim().replace(/^"|"$/g,''));
    if (cells.every(c => !c)) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = cells[idx] || ''; });
    rows.push(obj);
  }
  return { headers, rows };
}

function csvRowsToStudents(headers, rows) {
  const subjectCols = headers.slice(2);
  const students = [], errors = [];
  rows.forEach((row, i) => {
    const lineNo = i + 2;
    const roll = row[headers[0]]?.trim();
    const name = row[headers[1]]?.trim();
    if (!roll || !name) { errors.push(`লাইন ${lineNo}: রোল বা নাম খালি।`); return; }
    const subjects = [];
    subjectCols.forEach(col => {
      const marksRaw = row[col]?.trim();
      if (!marksRaw) return;
      const marks = Number(marksRaw);
      if (isNaN(marks)) { errors.push(`লাইন ${lineNo}, "${col}": "${marksRaw}" সংখ্যা নয়।`); return; }
      const [subName, fullRaw] = col.split('|');
      const full = fullRaw ? Number(fullRaw) : 100;
      subjects.push({ name: subName.trim(), full: isNaN(full)?100:full, marks });
    });
    students.push({ roll: _normRoll(roll), name, gpa: _calcGPA(subjects), subjects });
  });
  return { students, errors };
}

const subjectSets = {
  default:   ['বাংলা|100','ইংরেজি|100','গণিত|100','বিজ্ঞান|100','সমাজ বিজ্ঞান|100','ইসলাম শিক্ষা|100'],
  dakhil:    ['বাংলা|100','ইংরেজি|100','গণিত|100','বিজ্ঞান|100','সমাজ বিজ্ঞান|100','ইসলাম শিক্ষা|100','কুরআন মজীদ|100','আকাইদ ও ফিকহ|100'],
  alim:      ['বাংলা|100','ইংরেজি|100','আরবি|100','হাদিস|100','তাফসীর|100','ফিকহ|100','মানতিক|100'],
  ibtedayi:  ['বাংলা|100','ইংরেজি|100','গণিত|100','কুরআন|100','আকাইদ|100'],
};

function getDefaultSubjects(cls) {
  if (cls==='class9'||cls==='class10') return subjectSets.dakhil;
  if (cls==='class11'||cls==='class12') return subjectSets.alim;
  if (cls.startsWith('ibtedayi')) return subjectSets.ibtedayi;
  return subjectSets.default;
}

function generateTemplate(cls) {
  const subjects = getDefaultSubjects(cls);
  const headers  = ['roll','name',...subjects];
  const ex1 = ['101','মোহাম্মদ রাহিম',...subjects.map(()=>'75')];
  const ex2 = ['102','ফাতেমা খানম',  ...subjects.map(()=>'82')];
  return [headers,ex1,ex2].map(r=>r.join(',')).join('\n');
}

$('bulkDownloadTplBtn')?.addEventListener('click', () => {
  const cls = val('bulkClass');
  const csv = generateTemplate(cls);
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `result_template_${cls}.csv`;
  a.click(); URL.revokeObjectURL(url);
});

// Current pending students for upload (shared between CSV & manual)
let _pendingStudents = [];

$('bulkFileInput')?.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const { headers, rows } = parseCSV(text);
  if (!headers.length || !rows.length) { toast('CSV ফাইল খালি বা format ঠিক নেই।','error'); return; }
  const { students, errors } = csvRowsToStudents(headers, rows);
  _pendingStudents = students;
  renderCSVPreview(students, errors, headers.slice(2));
  e.target.value = '';
});

function renderCSVPreview(students, errors, subjectCols) {
  const area = $('bulkPreviewArea');

  let html = '';
  if (errors.length) {
    html += `<div style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:10px;padding:14px;margin-bottom:12px">
      <p style="font-weight:700;color:#dc2626;margin-bottom:6px"><i class="fas fa-exclamation-triangle"></i> ${errors.length}টি সমস্যা:</p>
      ${errors.map(e=>`<p style="font-size:12px;color:#dc2626;margin:2px 0">• ${e}</p>`).join('')}
    </div>`;
  }
  if (!students.length) {
    area.innerHTML = html + `<p style="color:var(--text-mid);font-size:13px">কোনো valid data পাওয়া যায়নি।</p>`;
    $('bulkSharedActions').style.display = 'none';
    return;
  }

  const subH = subjectCols.map(c=>`<th style="padding:7px 10px">${c.split('|')[0]}</th>`).join('');
  const rows = students.map(s => {
    const cells = subjectCols.map(col => {
      const sub = s.subjects.find(x=>x.name===col.split('|')[0].trim());
      return `<td style="text-align:center">${sub?sub.marks:'-'}</td>`;
    }).join('');
    return `<tr><td>${s.roll}</td><td>${s.name}</td>${cells}<td style="text-align:center;font-weight:700;color:var(--primary)">${s.gpa}</td></tr>`;
  }).join('');

  html += `<div style="background:var(--input-bg);border:1.5px solid var(--border);border-radius:10px;padding:12px;margin-bottom:4px">
    <p style="font-weight:600;margin-bottom:8px"><i class="fas fa-eye" style="color:var(--primary)"></i> Preview — ${students.length}জন</p>
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:12.5px">
        <thead><tr style="background:var(--primary);color:#fff">
          <th style="padding:7px 10px;text-align:left">রোল</th>
          <th style="padding:7px 10px;text-align:left">নাম</th>
          ${subH}
          <th style="padding:7px 10px">GPA</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;

  area.innerHTML = html;
  // Show shared upload button
  $('bulkSharedActions').style.display = 'block';
  $('bulkProgressWrap').style.display  = 'none';
  $('bulkProgressBar').style.width     = '0%';
  $('bulkUploadConfirmBtn').style.display = '';
  $('bulkUploadConfirmBtn').disabled   = false;
  $('bulkUploadConfirmBtn').innerHTML  = `<i class="fas fa-cloud-upload-alt"></i> Firebase-এ Upload করুন (${students.length}জন)`;
}

// ══════════════════════════════
//  MANUAL TABLE TAB
// ══════════════════════════════

$('manualBuildTableBtn')?.addEventListener('click', () => {
  const raw = $('manualSubjectList').value.trim();
  if (!raw) { toast('বিষয়ের নাম লিখুন','error'); return; }

  // Parse subject list: "বাংলা|100, ইংরেজি, গণিত|80"
  const parsedSubjects = raw.split(',').map(s => {
    const [name, fullRaw] = s.trim().split('|');
    const full = fullRaw ? Number(fullRaw.trim()) : 100;
    return { name: name.trim(), full: isNaN(full)?100:full };
  }).filter(s => s.name);

  if (!parsedSubjects.length) { toast('বিষয় parse করা যায়নি','error'); return; }

  buildManualTable(parsedSubjects, 10); // start with 10 rows
});

function buildManualTable(subjects, initialRows) {
  const area = $('manualTableArea');

  const subHeaders = subjects.map(s =>
    `<th>${s.name}${s.full!==100?`<br><span style="font-weight:400;font-size:11px">(/${s.full})</span>`:''}</th>`
  ).join('');

  const makeRow = (idx) => {
    const subInputs = subjects.map(s =>
      `<td><input class="m-marks" type="number" min="0" max="${s.full}" placeholder="0" data-full="${s.full}"></td>`
    ).join('');
    return `<tr>
      <td><input class="m-roll" type="text" placeholder="${idx+1}"></td>
      <td><input class="m-name" type="text" placeholder="নাম"></td>
      ${subInputs}
      <td style="text-align:center;font-weight:700;color:var(--primary)" class="m-gpa">-</td>
      <td><button class="del-row-btn" title="Row মুছুন"><i class="fas fa-times"></i></button></td>
    </tr>`;
  };

  let rows = '';
  for (let i=0;i<initialRows;i++) rows += makeRow(i);

  area.innerHTML = `
    <div style="overflow-x:auto;margin-bottom:10px">
      <table class="manual-tbl" id="manualTbl">
        <thead><tr>
          <th>রোল</th><th>নাম</th>${subHeaders}<th>GPA</th><th></th>
        </tr></thead>
        <tbody id="manualTblBody">${rows}</tbody>
      </table>
    </div>
    <div class="action-row" style="margin-bottom:4px">
      <button class="btn ghost" id="manualAddRowBtn"><i class="fas fa-plus"></i> Row যোগ করুন</button>
      <button class="btn ghost" id="manualPreviewBtn"><i class="fas fa-eye"></i> Preview ও Save করুন</button>
    </div>`;

  bindManualTableEvents(subjects);
}

function bindManualTableEvents(subjects) {
  // Live GPA update on marks change
  $('manualTblBody').addEventListener('input', e => {
    if (!e.target.classList.contains('m-marks')) return;
    const row = e.target.closest('tr');
    const markInputs = Array.from(row.querySelectorAll('.m-marks'));
    const validSubs = markInputs.map((inp,i) => ({
      marks: Number(inp.value)||0, full: Number(inp.dataset.full)||100
    })).filter((_,i) => markInputs[i].value !== '');
    if (validSubs.length) {
      row.querySelector('.m-gpa').textContent = _calcGPA(validSubs.map(s=>s));
    }
  });

  // Delete row
  $('manualTblBody').addEventListener('click', e => {
    if (e.target.closest('.del-row-btn')) {
      const row = e.target.closest('tr');
      if ($('manualTblBody').querySelectorAll('tr').length > 1) row.remove();
      else toast('অন্তত একটি row থাকতে হবে','error');
    }
  });

  // Add row
  $('manualAddRowBtn').onclick = () => {
    const tbody = $('manualTblBody');
    const idx = tbody.querySelectorAll('tr').length;
    const subInputs = subjects.map(s =>
      `<td><input class="m-marks" type="number" min="0" max="${s.full}" placeholder="0" data-full="${s.full}"></td>`
    ).join('');
    tbody.insertAdjacentHTML('beforeend', `<tr>
      <td><input class="m-roll" type="text" placeholder="${idx+1}"></td>
      <td><input class="m-name" type="text" placeholder="নাম"></td>
      ${subInputs}
      <td style="text-align:center;font-weight:700;color:var(--primary)" class="m-gpa">-</td>
      <td><button class="del-row-btn" title="Row মুছুন"><i class="fas fa-times"></i></button></td>
    </tr>`);
  };

  // Preview & prepare for upload
  $('manualPreviewBtn').onclick = () => {
    const rows = Array.from($('manualTblBody').querySelectorAll('tr'));
    const students = [], errors = [];

    rows.forEach((row, i) => {
      const roll = row.querySelector('.m-roll')?.value.trim();
      const name = row.querySelector('.m-name')?.value.trim();
      const markInputs = Array.from(row.querySelectorAll('.m-marks'));

      if (!roll && !name && markInputs.every(inp=>!inp.value)) return; // skip fully blank rows

      if (!roll) { errors.push(`Row ${i+1}: রোল নম্বর খালি।`); return; }
      if (!name) { errors.push(`Row ${i+1}: নাম খালি।`); return; }

      const subs = markInputs.map((inp,j) => ({
        name: subjects[j].name,
        full: subjects[j].full,
        marks: Number(inp.value)||0
      }));

      students.push({ roll: _normRoll(roll), name, gpa: _calcGPA(subs), subjects: subs });
    });

    if (errors.length) {
      let errHtml = `<div style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:10px;padding:12px;margin-bottom:10px">
        <p style="font-weight:700;color:#dc2626;margin-bottom:6px"><i class="fas fa-exclamation-triangle"></i> ${errors.length}টি সমস্যা:</p>
        ${errors.map(e=>`<p style="font-size:12px;color:#dc2626;margin:2px 0">• ${e}</p>`).join('')}
      </div>`;
      $('manualTableArea').insertAdjacentHTML('afterbegin', errHtml);
      // Remove after 5s
      setTimeout(()=>{ const el = $('manualTableArea').querySelector('div'); if(el) el.remove(); }, 5000);
      return;
    }

    if (!students.length) { toast('কোনো data পাওয়া যায়নি।','error'); return; }

    _pendingStudents = students;
    $('bulkSharedActions').style.display = 'block';
    $('bulkProgressWrap').style.display  = 'none';
    $('bulkProgressBar').style.width     = '0%';
    $('bulkUploadConfirmBtn').style.display = '';
    $('bulkUploadConfirmBtn').disabled   = false;
    $('bulkUploadConfirmBtn').innerHTML  = `<i class="fas fa-cloud-upload-alt"></i> Firebase-এ Upload করুন (${students.length}জন)`;
    $('bulkUploadConfirmBtn').scrollIntoView({behavior:'smooth', block:'center'});
    toast(`${students.length}জনের data ready। নিচের বাটনে click করুন।`);
  };
}

// ══════════════════════════════
//  SHARED UPLOAD LOGIC
// ══════════════════════════════

$('bulkCancelBtn')?.addEventListener('click', () => {
  $('bulkPreviewArea').innerHTML = '';
  $('bulkSharedActions').style.display = 'none';
  _pendingStudents = [];
});

$('bulkUploadConfirmBtn')?.addEventListener('click', async () => {
  const students = _pendingStudents;
  if (!students.length) { toast('Upload করার data নেই।','error'); return; }

  const cls  = val('bulkClass');
  const exam = val('bulkExam');
  const btn  = $('bulkUploadConfirmBtn');
  const progressWrap = $('bulkProgressWrap');
  const progressBar  = $('bulkProgressBar');
  const progressLbl  = $('bulkProgressLabel');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
  progressWrap.style.display = 'block';

  let done = 0;
  const total = students.length;
  const BATCH = 10;

  try {
    for (let i=0; i<total; i+=BATCH) {
      const batch = students.slice(i, i+BATCH);
      await Promise.all(batch.map(s =>
        set(ref(db, `results/${cls}/${exam}/${s.roll}`), {
          name: s.name, gpa: s.gpa, subjects: s.subjects
        })
      ));
      done = Math.min(i+BATCH, total);
      const pct = Math.round((done/total)*100);
      progressBar.style.width   = pct+'%';
      progressLbl.textContent   = `Uploading... ${done}/${total} (${pct}%)`;
    }

    progressLbl.textContent        = `✅ সম্পন্ন! ${total}জনের result upload হয়েছে।`;
    progressBar.style.background   = '#10b981';
    toast(`${total}জনের result সফলভাবে upload হয়েছে!`);
    btn.style.display = 'none';
    $('bulkCancelBtn').innerHTML   = '<i class="fas fa-check"></i> Done';
    _pendingStudents = [];
  } catch (err) {
    console.error(err);
    toast(`Upload-এ সমস্যা হয়েছে (${done}/${total} সম্পন্ন)।`,'error');
    progressLbl.textContent       = `❌ Error — ${done}/${total} সম্পন্ন।`;
    progressBar.style.background  = '#ef4444';
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-redo"></i> আবার চেষ্টা করুন';
  }
});
