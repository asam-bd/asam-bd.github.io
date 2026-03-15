import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  push,
  update,
  remove,
  get,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

/* Firebase */
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
const db = getDatabase(app);

/* Helpers */
const $ = id => document.getElementById(id);
const val = id => ($(id)?.value || '').trim();
const setVal = (id, v='') => { if($(id)) $(id).value = v; };
const show = el => el.classList.remove('hidden');
const hide = el => el.classList.add('hidden');

function toast(msg){
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function confirmDelete(msg='এটি মুছতে চান?'){
  return window.confirm(msg);
}

/* Login */
$('loginBtn')?.addEventListener('click', async () => {
  $('loginError').textContent = '';
  const email = val('lEmail');
  const pass = val('lPass');

  if(!email || !pass){
    $('loginError').textContent = 'ইমেইল ও পাসওয়ার্ড দিন';
    return;
  }

  try{
    await signInWithEmailAndPassword(auth, email, pass);
  }catch(err){
    console.error(err);
    $('loginError').textContent = 'লগইন ব্যর্থ হয়েছে';
  }
});

$('lPass')?.addEventListener('keydown', e => {
  if(e.key === 'Enter') $('loginBtn').click();
});

$('logoutBtn')?.addEventListener('click', async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, user => {
  if(user){
    hide($('loginWrap'));
    show($('app'));
    $('adminEmail').textContent = user.email;
    $('adminAvatar').textContent = user.email?.[0]?.toUpperCase() || 'A';
    initAdmin();
  }else{
    show($('loginWrap'));
    hide($('app'));
  }
});

/* Navigation */
const panelMeta = {
  dashboard:['ড্যাশবোর্ড','সারাংশ'],
  hero:['Hero','Hero section manage করুন'],
  ticker:['Ticker','Scrolling notice manage করুন'],
  notices:['Notices','Notice add/edit/delete'],
  teachers:['Teachers','Teacher add/edit/delete'],
  contact:['Contact','যোগাযোগ তথ্য'],
  siteinfo:['Site Info','সাইট সেটিং'],
  messages:['Messages','Frontend contact messages']
};

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = btn.dataset.panel;
    $('panel-'+panel).classList.add('active');
    $('pageTitle').textContent = panelMeta[panel][0];
    $('pageDesc').textContent = panelMeta[panel][1];
  });
});

/* Init */
let noticesCache = {};
let teachersCache = {};
let tickerCache = {};
let messagesCache = {};

function initAdmin(){
  loadHero();
  loadTicker();
  loadNotices();
  loadTeachers();
  loadContact();
  loadSiteInfo();
  loadMessages();

  bindHeroSave();
  bindTicker();
  bindNoticeActions();
  bindTeacherActions();
  bindContactSave();
  bindSiteInfoSave();
}

/* HERO */
function loadHero(){
  get(ref(db,'hero')).then(s => {
    const d = s.val() || {};
    setVal('heroTitleBn', d.titleBn);
    setVal('heroTitleEn', d.titleEn);
    setVal('heroMottoBn', d.mottoBn);
    setVal('heroMottoEn', d.mottoEn);
    setVal('heroDescBn', d.descBn);
    setVal('heroStudents', d.students ?? '');
    setVal('heroTeachers', d.teachers ?? '');
    setVal('heroPassRate', d.passRate ?? '');
    setVal('heroYears', d.years ?? '');
  });
}
function bindHeroSave(){
  $('saveHeroBtn')?.addEventListener('click', async () => {
    const data = {
      titleBn: val('heroTitleBn'),
      titleEn: val('heroTitleEn'),
      mottoBn: val('heroMottoBn'),
      mottoEn: val('heroMottoEn'),
      descBn: val('heroDescBn'),
      students: Number(val('heroStudents')) || 0,
      teachers: Number(val('heroTeachers')) || 0,
      passRate: Number(val('heroPassRate')) || 0,
      years: Number(val('heroYears')) || 0
    };
    await set(ref(db,'hero'), data);
    await update(ref(db,'stats'), {
      students:data.students,
      teachers:data.teachers,
      passRate:data.passRate,
      years:data.years
    });
    toast('Hero saved');
  });
}

/* TICKER */
function loadTicker(){
  onValue(ref(db,'ticker'), snap => {
    tickerCache = snap.val() || {};
    renderTicker();
  });
}
function renderTicker(){
  const list = $('tickerList');
  const items = Object.entries(tickerCache);
  if(!items.length){
    list.innerHTML = `<div class="list-item"><p>কোনো ticker নেই</p></div>`;
    return;
  }

  list.innerHTML = items.map(([id, t]) => `
    <div class="list-item">
      <h4>${t.text || ''}</h4>
      <p>Status: ${t.active ? 'Active' : 'Inactive'}</p>
      <div class="list-actions">
        <button class="btn ghost" data-ticker-toggle="${id}">${t.active ? 'Deactivate' : 'Activate'}</button>
        <button class="btn danger" data-ticker-delete="${id}">Delete</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-ticker-toggle]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.tickerToggle;
      const cur = tickerCache[id];
      await update(ref(db, `ticker/${id}`), { active: !cur.active });
      toast('Ticker updated');
    };
  });

  document.querySelectorAll('[data-ticker-delete]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.tickerDelete;
      if(!confirmDelete('Ticker delete করতে চান?')) return;
      await remove(ref(db, `ticker/${id}`));
      toast('Ticker deleted');
    };
  });
}
function bindTicker(){
  $('addTickerBtn')?.addEventListener('click', async () => {
    const text = val('tickerInput');
    if(!text) return toast('Ticker message লিখুন');
    await push(ref(db,'ticker'), { text, active:true });
    setVal('tickerInput','');
    toast('Ticker added');
  });
}

/* NOTICES */
function loadNotices(){
  onValue(ref(db,'notices'), snap => {
    noticesCache = snap.val() || {};
    $('dashNoticeCount').textContent = Object.keys(noticesCache).length;
    renderNotices();
  });
}
function renderNotices(){
  const list = $('noticeList');
  const items = Object.entries(noticesCache).sort((a,b) => (b[1].date || '').localeCompare(a[1].date || ''));

  if(!items.length){
    list.innerHTML = `<div class="list-item"><p>কোনো notice নেই</p></div>`;
    return;
  }

  list.innerHTML = items.map(([id,n]) => `
    <div class="list-item">
      <h4>${n.title || ''}</h4>
      <p>${n.body || ''}</p>
      <p>Type: ${n.type || 'normal'} | ${n.dateDisplay || n.date || ''}</p>
      <div class="list-actions">
        <button class="btn ghost" data-notice-edit="${id}">Edit</button>
        <button class="btn danger" data-notice-delete="${id}">Delete</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-notice-edit]').forEach(btn => {
    btn.onclick = async () => editNotice(btn.dataset.noticeEdit);
  });
  document.querySelectorAll('[data-notice-delete]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.noticeDelete;
      if(!confirmDelete('Notice delete করতে চান?')) return;
      await remove(ref(db, `notices/${id}`));
      toast('Notice deleted');
    };
  });
}
async function editNotice(id){
  const n = noticesCache[id];
  if(!n) return;

  setVal('noticeEditId', id);
  setVal('noticeTitle', n.title);
  setVal('noticeBody', n.body);
  setVal('noticeType', n.type || 'normal');
  setVal('noticeDate', n.date || '');
  setVal('noticeDateDisplay', n.dateDisplay || '');
  setVal('noticeLink', n.link || '');
  $('noticeActive').checked = !!n.active;

  document.querySelector('[data-panel="notices"]').click();
  window.scrollTo({top:0, behavior:'smooth'});
}
function clearNoticeForm(){
  setVal('noticeEditId','');
  setVal('noticeTitle','');
  setVal('noticeBody','');
  setVal('noticeType','normal');
  setVal('noticeDate','');
  setVal('noticeDateDisplay','');
  setVal('noticeLink','');
  $('noticeActive').checked = true;
}
function bindNoticeActions(){
  $('saveNoticeBtn')?.addEventListener('click', async () => {
    const title = val('noticeTitle');
    const body = val('noticeBody');
    if(!title || !body) return toast('Title ও body দিন');

    const data = {
      title,
      body,
      type: val('noticeType'),
      date: val('noticeDate'),
      dateDisplay: val('noticeDateDisplay'),
      link: val('noticeLink'),
      active: $('noticeActive').checked
    };

    const editId = val('noticeEditId');
    if(editId){
      await update(ref(db, `notices/${editId}`), data);
      toast('Notice updated');
    }else{
      await push(ref(db,'notices'), data);
      toast('Notice added');
    }
    clearNoticeForm();
  });

  $('clearNoticeBtn')?.addEventListener('click', clearNoticeForm);
}

/* TEACHERS */
function loadTeachers(){
  onValue(ref(db,'teachers'), snap => {
    teachersCache = snap.val() || {};
    renderTeachers();
  });
}
function renderTeachers(){
  const list = $('teacherList');
  const items = Object.entries(teachersCache);

  if(!items.length){
    list.innerHTML = `<div class="list-item"><p>কোনো teacher নেই</p></div>`;
    return;
  }

  list.innerHTML = items.map(([id,t]) => `
    <div class="list-item">
      <h4>${t.name || ''}</h4>
      <p>${t.role || ''} | ${t.subject || ''}</p>
      <p>${t.qualification || ''}</p>
      <div class="list-actions">
        <button class="btn ghost" data-teacher-edit="${id}">Edit</button>
        <button class="btn danger" data-teacher-delete="${id}">Delete</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-teacher-edit]').forEach(btn => {
    btn.onclick = () => editTeacher(btn.dataset.teacherEdit);
  });
  document.querySelectorAll('[data-teacher-delete]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.teacherDelete;
      if(!confirmDelete('Teacher delete করতে চান?')) return;
      await remove(ref(db, `teachers/${id}`));
      toast('Teacher deleted');
    };
  });
}
function editTeacher(id){
  const t = teachersCache[id];
  if(!t) return;

  setVal('teacherEditId', id);
  setVal('teacherName', t.name);
  setVal('teacherRole', t.role);
  setVal('teacherSubject', t.subject);
  setVal('teacherDept', t.dept || 'general');
  setVal('teacherQualification', t.qualification);
  setVal('teacherPhoto', t.photo || '');

  document.querySelector('[data-panel="teachers"]').click();
  window.scrollTo({top:0, behavior:'smooth'});
}
function clearTeacherForm(){
  setVal('teacherEditId','');
  setVal('teacherName','');
  setVal('teacherRole','');
  setVal('teacherSubject','');
  setVal('teacherDept','general');
  setVal('teacherQualification','');
  setVal('teacherPhoto','');
}
function bindTeacherActions(){
  $('saveTeacherBtn')?.addEventListener('click', async () => {
    const name = val('teacherName');
    if(!name) return toast('Teacher name দিন');

    const data = {
      name,
      role: val('teacherRole'),
      subject: val('teacherSubject'),
      dept: val('teacherDept'),
      qualification: val('teacherQualification'),
      photo: val('teacherPhoto')
    };

    const editId = val('teacherEditId');
    if(editId){
      await update(ref(db, `teachers/${editId}`), data);
      toast('Teacher updated');
    }else{
      await push(ref(db,'teachers'), data);
      toast('Teacher added');
    }
    clearTeacherForm();
  });

  $('clearTeacherBtn')?.addEventListener('click', clearTeacherForm);
}

/* CONTACT */
function loadContact(){
  get(ref(db,'contact')).then(s => {
    const d = s.val() || {};
    setVal('contactAddress', d.address);
    setVal('contactPhone', d.phone);
    setVal('contactEmail', d.email);
    setVal('contactHours', d.hours);
    setVal('contactAddressShort', d.addressShort);
    setVal('contactPhoneShort', d.phoneShort);
    setVal('contactEmailShort', d.emailShort);
    setVal('contactHoursShort', d.hoursShort);
    setVal('contactCallNumber', d.callNumber);
    setVal('contactWhatsapp', d.whatsapp);
  });
}
function bindContactSave(){
  $('saveContactBtn')?.addEventListener('click', async () => {
    const data = {
      address: val('contactAddress'),
      phone: val('contactPhone'),
      email: val('contactEmail'),
      hours: val('contactHours'),
      addressShort: val('contactAddressShort'),
      phoneShort: val('contactPhoneShort'),
      emailShort: val('contactEmailShort'),
      hoursShort: val('contactHoursShort'),
      callNumber: val('contactCallNumber'),
      whatsapp: val('contactWhatsapp')
    };
    await set(ref(db,'contact'), data);
    toast('Contact saved');
  });
}

/* SITE INFO */
function loadSiteInfo(){
  get(ref(db,'siteInfo')).then(s => {
    const d = s.val() || {};
    setVal('siteEiin', d.eiin);
    setVal('siteEstablished', d.established);
    setVal('siteFacebook', d.facebook);
    setVal('siteYoutube', d.youtube);
    setVal('siteWhatsapp', d.whatsapp);
    setVal('siteInstagram', d.instagram);
    setVal('siteFooterText', d.footerText);
  });
}
function bindSiteInfoSave(){
  $('saveSiteInfoBtn')?.addEventListener('click', async () => {
    const data = {
      eiin: val('siteEiin'),
      established: val('siteEstablished'),
      facebook: val('siteFacebook'),
      youtube: val('siteYoutube'),
      whatsapp: val('siteWhatsapp'),
      instagram: val('siteInstagram'),
      footerText: val('siteFooterText')
    };
    await set(ref(db,'siteInfo'), data);
    toast('Site info saved');
  });
}

/* MESSAGES */
function loadMessages(){
  onValue(ref(db,'contactMessages'), snap => {
    messagesCache = snap.val() || {};
    const count = Object.keys(messagesCache).length;
    $('msgCount').textContent = count;
    $('dashMsgCount').textContent = count;
    renderMessages();
  });
}
function renderMessages(){
  const list = $('messageList');
  const items = Object.entries(messagesCache).sort((a,b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));

  if(!items.length){
    list.innerHTML = `<div class="list-item"><p>কোনো মেসেজ নেই</p></div>`;
    return;
  }

  list.innerHTML = items.map(([id,m]) => `
    <div class="list-item">
      <h4>${m.subject || 'No subject'}</h4>
      <p><strong>নাম:</strong> ${m.name || ''}</p>
      <p><strong>ইমেইল:</strong> ${m.email || ''}</p>
      <p><strong>মেসেজ:</strong> ${m.message || ''}</p>
      <p><strong>তারিখ:</strong> ${m.dateText || ''}</p>
      <div class="list-actions">
        <button class="btn danger" data-message-delete="${id}">Delete</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-message-delete]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.messageDelete;
      if(!confirmDelete('এই মেসেজ delete করতে চান?')) return;
      await remove(ref(db, `contactMessages/${id}`));
      toast('Message deleted');
    };
  });
}
