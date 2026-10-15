/* ================= STORAGE HELPERS ================= */
async function loadShared(key, fb){ try{ const r=await window.storage.get(key,true); return r?JSON.parse(r.value):fb; }catch(e){ return fb; } }
async function saveShared(key, v){ try{ await window.storage.set(key, JSON.stringify(v), true); }catch(e){ console.error(e); } }
async function loadPersonal(key, fb){ try{ const r=await window.storage.get(key,false); return r?JSON.parse(r.value):fb; }catch(e){ return fb; } }
async function savePersonal(key, v){ try{ await window.storage.set(key, JSON.stringify(v), false); }catch(e){ console.error(e); } }
function uid(){ return Math.random().toString(36).slice(2,10); }
function toast(msg, icon){
  const wrap=document.getElementById('toast-wrap');
  const t=document.createElement('div'); t.className='toast';
  t.innerHTML = `<i class="fa-solid ${icon||'fa-circle-check'}"></i><span>${msg}</span>`;
  wrap.appendChild(t); setTimeout(()=>t.remove(),3400);
}
function initials(name){ return (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function escapeHtml(s){ const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
function fmtDate(iso){ return new Date(iso).toLocaleString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function fmtSize(b){ if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(0)+' KB'; return (b/1048576).toFixed(1)+' MB'; }

/* ================= DATA / CONST ================= */
const SUBJECTS = ['Matematika','Bahasa Indonesia','Bahasa Inggris','IPA','IPS','Fisika','Kimia','Biologi','Sejarah','Informatika','Seni Budaya','PJOK'];
const SUBJECT_COLORS = {'Matematika':'#2563EB','Bahasa Indonesia':'#8B5CF6','Bahasa Inggris':'#0EA5E9','IPA':'#F59E0B','IPS':'#84A05C',
  'Fisika':'#6366F1','Kimia':'#EC4899','Biologi':'#16A34A','Sejarah':'#B45309','Informatika':'#0F172A','Seni Budaya':'#D946EF','PJOK':'#059669'};
const KELAS_LIST = ['7A','7B','8A','8B','9A','9B'];
const ALLOWED_TYPES = ['PDF','DOCX','PPT','XLSX','ZIP','JPG','PNG','MP4'];

/* ================= STATE ================= */
let S = {
  users:[], tasks:[], submissions:[], announcements:[], forum:[], chats:{}, activity:[],
  session:null, theme:'light',
  view:'landing', // landing | login | app
  tab:'dashboard',
  loginRole:'siswa', loginErrors:{},
  taskFilter:{subject:'Semua', status:'Semua', q:''},
  modal:null,
  dropFiles:[],
  calMonth:new Date().getMonth(), calYear:new Date().getFullYear(),
  chatActive:null,
  notifOpen:false, searchOpen:false,
  faqOpen:null,
  loaded:false
};

/* ================= SEED ================= */
function seedIfEmpty(){
  const now=Date.now();
  const teacherId='t_ratna', teacher2='t_anwar', adminId='a_1';
  const students=[
    {id:'s_dimas',name:'Dimas Pratama',email:'dimas.pratama@gmail.com',password:'demo123',role:'siswa',kelas:'9A'},
    {id:'s_kirana',name:'Kirana Putri',email:'kirana.putri@gmail.com',password:'demo123',role:'siswa',kelas:'9A'},
    {id:'s_yusuf',name:'Yusuf Hakim',email:'yusuf.hakim@gmail.com',password:'demo123',role:'siswa',kelas:'9A'},
  ];
  S.users = [
    {id:adminId,name:'Admin Sekolah',email:'admin.sekolah@gmail.com',password:'demo123',role:'admin'},
    {id:teacherId,name:'Bu Ratna Wijaya',email:'ratna.wijaya@gmail.com',password:'demo123',role:'guru',subject:'Matematika'},
    {id:teacher2,name:'Pak Anwar Sidik',email:'anwar.sidik@gmail.com',password:'demo123',role:'guru',subject:'Bahasa Indonesia'},
    ...students
  ];
  S.tasks = [
    {id:'tk1',title:'Latihan Persamaan Kuadrat',desc:'Kerjakan soal 1-10 di modul, sertakan langkah penyelesaian lengkap.',subject:'Matematika',kelas:'9A',teacherId,teacherName:'Bu Ratna Wijaya',deadline:new Date(now+2*86400000).toISOString(),maxSizeMB:10,types:['PDF','JPG'],rubric:[{c:'Ketepatan jawaban',m:60},{c:'Kerapian langkah',m:40}],createdAt:new Date(now-86400000).toISOString()},
    {id:'tk2',title:'Esai Struktur Naratif Cerpen',desc:'Tulis esai 500 kata tentang struktur naratif cerpen "Robohnya Surau Kami".',subject:'Bahasa Indonesia',kelas:'9A',teacherId:teacher2,teacherName:'Pak Anwar Sidik',deadline:new Date(now-3600000).toISOString(),maxSizeMB:5,types:['DOCX','PDF'],rubric:[{c:'Struktur esai',m:50},{c:'Tata bahasa',m:50}],createdAt:new Date(now-4*86400000).toISOString()},
    {id:'tk3',title:'Laporan Praktikum Reaksi Kimia',desc:'Kumpulkan laporan hasil praktikum minggu lalu lengkap dengan data pengamatan.',subject:'IPA',kelas:'9A',teacherId,teacherName:'Bu Ratna Wijaya',deadline:new Date(now+5*86400000).toISOString(),maxSizeMB:15,types:['PDF','DOCX'],rubric:[{c:'Kelengkapan data',m:50},{c:'Analisis',m:50}],createdAt:new Date(now-2*86400000).toISOString()},
  ];
  S.submissions = [
    {id:'sub1',taskId:'tk2',studentId:'s_dimas',studentName:'Dimas Pratama',files:[{name:'esai_dimas.docx',size:245000}],note:'Sudah saya revisi bagian penutup.',submittedAt:new Date(now-7200000).toISOString(),late:false,status:'graded',score:88,letter:'A-',feedback:'Struktur sudah baik, perhatikan lagi tata bahasa di paragraf 3.',rubricScores:{'Struktur esai':45,'Tata bahasa':43},revisions:[]},
  ];
  S.announcements = [
    {id:'an1',title:'Libur Tengah Semester',body:'Sekolah libur tanggal 20-22 untuk semua kelas. Kegiatan belajar dimulai kembali hari Senin.',author:'Admin Sekolah',role:'admin',createdAt:new Date(now-86400000).toISOString(),pinned:true},
    {id:'an2',title:'Pengumpulan Nilai UTS',body:'Guru mata pelajaran diminta menyelesaikan input nilai UTS paling lambat akhir minggu ini.',author:'Bu Ratna Wijaya',role:'guru',createdAt:new Date(now-2*86400000).toISOString(),pinned:false},
  ];
  S.forum = [
    {id:'f1',kelas:'9A',subject:'Matematika',author:'Kirana Putri',authorId:'s_kirana',content:'Bu, untuk soal nomor 7 apakah pakai rumus diskriminan atau pemfaktoran ya?',likes:['s_dimas'],pinned:false,createdAt:new Date(now-5000000).toISOString(),
      replies:[{author:'Bu Ratna Wijaya',content:'Boleh pakai keduanya Kirana, yang penting langkahnya jelas ya.',createdAt:new Date(now-4000000).toISOString()}]}
  ];
  S.chats = {
    's_dimas__t_ratna': [
      {from:'s_dimas',text:'Bu, izin bertanya soal deadline tugas persamaan kuadrat.',at:new Date(now-9000000).toISOString()},
      {from:'t_ratna',text:'Boleh, deadlinenya masih 2 hari lagi ya, silakan dikerjakan pelan-pelan.',at:new Date(now-8800000).toISOString()},
    ]
  };
  S.activity = [
    {id:uid(),who:'Dimas Pratama',action:'mengumpulkan tugas "Esai Struktur Naratif Cerpen"',at:new Date(now-7200000).toISOString()},
    {id:uid(),who:'Bu Ratna Wijaya',action:'membuat tugas baru "Laporan Praktikum Reaksi Kimia"',at:new Date(now-2*86400000).toISOString()},
  ];
}

async function init(){
  const [users,tasks,submissions,announcements,forum,chats,activity,session,theme] = await Promise.all([
    loadShared('users',null), loadShared('tasks',[]), loadShared('submissions',[]),
    loadShared('announcements',[]), loadShared('forum',[]), loadShared('chats',{}),
    loadShared('activity',[]), loadPersonal('session',null), loadPersonal('theme','light')
  ]);
  if(users===null){
    seedIfEmpty();
    await Promise.all([saveShared('users',S.users),saveShared('tasks',S.tasks),saveShared('submissions',S.submissions),
      saveShared('announcements',S.announcements),saveShared('forum',S.forum),saveShared('chats',S.chats),saveShared('activity',S.activity)]);
  } else {
    S.users=users; S.tasks=tasks; S.submissions=submissions; S.announcements=announcements; S.forum=forum; S.chats=chats; S.activity=activity;
  }
  S.session = session;
  S.theme = theme || 'light';
  document.documentElement.setAttribute('data-theme', S.theme);
  S.view = session ? 'app' : 'landing';
  S.loaded = true;
  render();
}

async function persist(key){ await saveShared(key, S[key]); }
function currentUser(){ return S.users.find(u=>u.id===(S.session&&S.session.userId)); }
function logActivity(who,action){ S.activity.unshift({id:uid(),who,action,at:new Date().toISOString()}); persist('activity'); }

/* ================= ROLE-AWARE DATA HELPERS ================= */
function myTasks(){
  const u=currentUser(); if(!u) return [];
  if(u.role==='siswa') return S.tasks.filter(t=>t.kelas===u.kelas);
  if(u.role==='guru') return S.tasks.filter(t=>t.teacherId===u.id);
  return S.tasks;
}
function mySubmissionFor(taskId){ const u=currentUser(); return S.submissions.find(s=>s.taskId===taskId && s.studentId===u.id); }
function submissionsFor(taskId){ return S.submissions.filter(s=>s.taskId===taskId); }
function deadlineInfo(iso){
  const diff=new Date(iso).getTime()-Date.now(); const late=diff<0; const abs=Math.abs(diff);
  const d=Math.floor(abs/86400000), h=Math.floor((abs%86400000)/3600000), m=Math.floor((abs%3600000)/60000);
  let label = late ? `Telat ${d}h ${h}j` : (d>0?`${d}h ${h}j lagi`:(h>0?`${h}j ${m}m lagi`:`${m}m lagi`));
  let cls = late?'late':(diff<24*3600000?'soon':'ok');
  return {label,cls,late};
}
function statusOf(task){
  const u=currentUser();
  const mine=mySubmissionFor(task.id);
  if(!mine) return 'belum';
  if(mine.status==='revision_requested') return 'revision';
  if(mine.score!=null) return 'graded';
  return 'submitted';
}
function statusLabel(s){ return {belum:'Belum Dikumpulkan',submitted:'Terkumpul',revision:'Perlu Revisi',graded:'Sudah Dinilai'}[s]; }

/* ================= RENDER ROOT ================= */
function render(){
  const root=document.getElementById('root');
  if(!S.loaded){ root.innerHTML='<div style="padding:80px;text-align:center;color:var(--text-dim)">Memuat EduSubmit...</div>'; return; }
  if(S.view==='landing') root.innerHTML = renderLanding();
  else if(S.view==='login') root.innerHTML = renderLogin();
  else root.innerHTML = renderApp();
  attachHandlers();
  if(S.modal) renderModal();
  if(S.view==='app') { document.getElementById('appShell').style.display='block'; renderCharts(); }
}

/* ================= LANDING ================= */
function renderLanding(){
  return `
  <div id="landing">
    <div class="landing-nav">
      <div class="brand"><span class="mark">Ed</span><span>EduSubmit</span></div>
      <div class="links">
        <a href="#fitur">Fitur</a><a href="#carakerja">Cara Kerja</a><a href="#testimoni">Testimoni</a><a href="#faq">FAQ</a>
      </div>
      <div class="nav-actions">
        <button class="theme-toggle" id="themeToggleLanding"><i class="fa-solid ${S.theme==='dark'?'fa-sun':'fa-moon'}"></i></button>
        <button class="btn ghost sm" data-goto-login="1">Masuk</button>
        <button class="btn sm" data-goto-login="1">Coba Gratis <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    </div>

    <div class="hero fade-in">
      <span class="badge"><i class="fa-solid fa-sparkles"></i> Dipercaya sekolah modern se-Indonesia</span>
      <h1>Kumpulkan tugas, <span class="grad">nilai lebih cepat,</span><br/>kelola kelas tanpa ribet.</h1>
      <p>EduSubmit adalah platform pengumpulan tugas digital untuk siswa, guru, dan admin sekolah — deadline, penilaian, revisi, dan komunikasi kelas dalam satu tempat.</p>
      <div class="hero-cta">
        <button class="btn" data-goto-login="1"><i class="fa-solid fa-rocket"></i> Mulai Sekarang</button>
        <button class="btn ghost" data-scroll="fitur"><i class="fa-solid fa-play"></i> Lihat Fitur</button>
      </div>
      <div class="hero-stats">
        <div><div class="n">12rb+</div><div class="l">Tugas Terkumpul</div></div>
        <div><div class="n">340+</div><div class="l">Sekolah Mitra</div></div>
        <div><div class="n">98%</div><div class="l">Tepat Waktu</div></div>
        <div><div class="n">4.9/5</div><div class="l">Rating Pengguna</div></div>
      </div>
    </div>

    <div class="features" id="fitur">
      <div class="section-title">
        <div class="eyebrow">Fitur Unggulan</div>
        <h2>Semua yang dibutuhkan kelas digital</h2>
        <p>Dari pengumpulan tugas sampai laporan nilai, semua tersedia dalam satu dashboard yang rapi.</p>
      </div>
      <div class="feat-grid">
        ${[
          ['fa-cloud-arrow-up','Upload Drag & Drop','Kumpulkan tugas cukup seret file ke area upload, mendukung banyak format sekaligus.'],
          ['fa-clock','Deadline Real-time','Pengingat otomatis H-3, H-1, dan hari-H supaya tidak ada tugas yang terlewat.'],
          ['fa-chart-line','Statistik & Grafik','Guru dan admin bisa memantau performa kelas lewat grafik interaktif.'],
          ['fa-comments','Chat & Forum Kelas','Diskusi langsung dengan guru atau teman sekelas tanpa keluar aplikasi.'],
          ['fa-star','Rubrik Penilaian','Penilaian terstruktur dengan rubrik, komentar, dan sistem revisi tugas.'],
          ['fa-trophy','Leaderboard & Badge','Motivasi siswa lewat papan peringkat dan pencapaian yang bisa dikoleksi.'],
        ].map(([ic,t,d])=>`<div class="feat-card slide-up"><div class="ic"><i class="fa-solid ${ic}"></i></div><h3>${t}</h3><p>${d}</p></div>`).join('')}
      </div>
    </div>

    <div class="howitworks" id="carakerja">
      <div class="section-title"><div class="eyebrow">Cara Kerja</div><h2>Mulai dalam 4 langkah</h2></div>
      <div class="steps">
        ${[['Daftar / Masuk','Buat akun sesuai peran: siswa, guru, atau admin.'],
           ['Buat / Lihat Tugas','Guru membuat tugas, siswa langsung melihatnya di dashboard.'],
           ['Kumpulkan Tugas','Upload file sebelum deadline, tambahkan catatan bila perlu.'],
           ['Terima Nilai','Guru menilai dengan rubrik, siswa menerima feedback instan.']]
           .map(([t,d],i)=>`<div class="step"><div class="num">${i+1}</div><h4>${t}</h4><p>${d}</p></div>`).join('')}
      </div>
    </div>

    <div class="testimonials" id="testimoni">
      <div class="section-title"><div class="eyebrow">Testimoni</div><h2>Kata mereka soal EduSubmit</h2></div>
      <div class="testi-grid">
        ${[['Sangat membantu memantau tugas anak-anak, semua rapi dalam satu dashboard.','Ratna Wijaya','Guru Matematika'],
           ['Tidak perlu lagi kirim tugas lewat WA grup yang berantakan.','Dimas Pratama','Siswa Kelas 9A'],
           ['Laporan dan statistik sekolah jadi jauh lebih mudah dipantau.','Admin Sekolah','Tata Usaha']]
           .map(([q,n,r])=>`<div class="testi-card"><div class="stars">★★★★★</div><p>"${q}"</p>
             <div class="testi-who"><div class="testi-avatar">${initials(n)}</div><div><div class="nm">${n}</div><div class="rl">${r}</div></div></div></div>`).join('')}
      </div>
    </div>

    <div class="faq" id="faq">
      <div class="section-title"><div class="eyebrow">FAQ</div><h2>Pertanyaan Umum</h2></div>
      ${[['Apakah EduSubmit gratis digunakan?','Ya, versi demo ini bisa dicoba penuh tanpa biaya untuk melihat seluruh alur kerja aplikasi.'],
         ['Apakah data tugas saya aman?','Ini adalah versi demo/prototipe — cocok untuk simulasi alur kerja, bukan untuk data produksi sungguhan.'],
         ['Bisakah dipakai di HP?','Bisa, tampilan EduSubmit responsif untuk HP, tablet, maupun laptop.']]
         .map(([q,a],i)=>`<div class="faq-item ${S.faqOpen===i?'open':''}" data-faq="${i}">
            <div class="q">${q}<i class="fa-solid fa-chevron-down"></i></div><div class="a">${a}</div></div>`).join('')}
    </div>

    <div class="footer">
      <div class="footer-grid">
        <div><div class="brand" style="margin-bottom:10px;"><span class="mark">Ed</span><span>EduSubmit</span></div>
          <p style="font-size:12.5px;color:var(--text-dim);max-width:260px;line-height:1.6;">Platform pengumpulan tugas digital untuk sekolah modern.</p></div>
        <div><h5>Produk</h5><ul><li><a href="#fitur">Fitur</a></li><li><a href="#carakerja">Cara Kerja</a></li><li><a href="#">Harga</a></li></ul></div>
        <div><h5>Bantuan</h5><ul><li><a href="#faq">FAQ</a></li><li><a href="#">Kontak</a></li><li><a href="#">Panduan</a></li></ul></div>
        <div><h5>Legal</h5><ul><li><a href="#">Privacy Policy</a></li><li><a href="#">Syarat Layanan</a></li></ul></div>
      </div>
      <div class="footer-bottom"><span>© 2026 EduSubmit. Semua hak dilindungi.</span><span>Dibuat untuk sekolah Indonesia 🇮🇩</span></div>
    </div>
  </div>`;
}

/* ================= LOGIN ================= */
function renderLogin(){
  const e = S.loginErrors;
  return `
  <div id="loginPage">
    <button class="login-back" data-goto-landing="1"><i class="fa-solid fa-arrow-left"></i> Kembali</button>
    <button class="theme-toggle" id="themeToggleLogin" style="position:absolute;top:20px;right:20px;"><i class="fa-solid ${S.theme==='dark'?'fa-sun':'fa-moon'}"></i></button>
    <div class="login-box glass slide-up">
      <div class="lbrand"><span class="mark" style="width:44px;height:44px;font-size:19px;">Ed</span></div>
      <h2>Selamat Datang Kembali</h2>
      <div class="sub">Masuk untuk melanjutkan ke EduSubmit</div>

      <div class="role-tabs">
        ${['siswa','guru','admin'].map(r=>`<button data-login-role="${r}" class="${S.loginRole===r?'active':''}">${r[0].toUpperCase()+r.slice(1)}</button>`).join('')}
      </div>

      <div class="field ${e.email?'invalid':''}"><label>Email</label>
        <div class="input-wrap"><i class="fa-solid fa-envelope ic-left"></i>
        <input id="loginEmail" type="text" placeholder="namakamu@gmail.com" class="${e.email?'error':''}"/></div>
        <div class="err-msg">${e.email||''}</div>
      </div>
      <div class="field ${e.password?'invalid':''}"><label>Password</label>
        <div class="input-wrap"><i class="fa-solid fa-lock ic-left"></i>
        <input id="loginPassword" type="password" placeholder="••••••••" class="${e.password?'error':''}"/>
        <button class="ic-right" id="togglePw"><i class="fa-solid fa-eye"></i></button></div>
        <div class="err-msg">${e.password||''}</div>
      </div>
      <div class="login-row">
        <label><input type="checkbox" id="rememberMe"/> Ingat saya</label>
        <a href="#" id="forgotPw">Lupa password?</a>
      </div>
      <button class="btn block" id="doLogin"><i class="fa-solid fa-arrow-right-to-bracket"></i> Masuk</button>
      <div class="divider">atau</div>
      <button class="btn google block" id="googleLogin"><i class="fa-brands fa-google"></i> Masuk dengan Google</button>

      <div class="demo-accounts">
        <p>Coba cepat pakai akun demo:</p>
        <div class="demo-chip-row">
          <button class="demo-chip" data-demo="siswa">🎒 Siswa</button>
          <button class="demo-chip" data-demo="guru">🧑‍🏫 Guru</button>
          <button class="demo-chip" data-demo="admin">🛡️ Admin</button>
        </div>
      </div>
    </div>
  </div>`;
}

function renderGooglePicker(){
  const accounts = [
    S.users.find(u=>u.id==='s_dimas'), S.users.find(u=>u.id==='t_ratna'), S.users.find(u=>u.id==='a_1')
  ].filter(Boolean);
  return `<div class="overlay" id="ovGoogle">
    <div class="gpicker fade-in">
      <button class="gclose" id="gClose" aria-label="Tutup" title="Tutup">&times;</button>
      <div class="ghead">
        <div class="glogo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div>
        <h3>Pilih akun</h3>
        <p class="gsub">untuk melanjutkan ke EduSubmit</p>
      </div>
      <div class="glist">
        ${accounts.map(a=>`<div class="gaccount" data-gaccount="${a.id}">
          <div class="gav">${initials(a.name)}</div>
          <div><div class="gnm">${escapeHtml(a.name)}</div><div class="gem">${escapeHtml(a.email)}</div></div>
        </div>`).join('')}
        <div class="gaccount" data-gaccount-other="1">
          <div class="gav" style="background:#f1f3f4;color:#5f6368;"><i class="fa-solid fa-user"></i></div>
          <div><div class="gnm">Gunakan akun lain</div></div>
        </div>
      </div>
      <div class="gfoot"><i class="fa-solid fa-lock"></i>Tampilan simulasi — bukan proses OAuth Google sungguhan.</div>
    </div>
  </div>`;
}
function renderApp(){
  const u = currentUser();
  if(!u) return renderLogin();
  const navItems = [
    ['dashboard','fa-gauge-high','Dashboard'],
    ['tugas','fa-book-open','Tugas'],
    ['kalender','fa-calendar-days','Kalender'],
    ['forum','fa-comments','Forum'],
    ['chat','fa-message','Chat'],
    ['pengumuman','fa-bullhorn','Pengumuman'],
  ];
  if(u.role==='admin') navItems.push(['kelola','fa-users-gear','Kelola']);
  navItems.push(['profil','fa-user','Profil']);

  const notifs = buildNotifications(u);
  const unread = notifs.length;

  return `
  <div id="appShell">
    <div class="topnav glass">
      <div class="left">
        <div class="brand"><span class="mark">Ed</span><span>EduSubmit</span></div>
        <div class="navlinks">
          ${navItems.map(([k,ic,l])=>`<button data-tab="${k}" class="${S.tab===k?'active':''}"><i class="fa-solid ${ic}"></i> ${l}</button>`).join('')}
        </div>
      </div>
      <div class="right">
        <div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input id="globalSearch" placeholder="Cari tugas, guru, kelas..." value=""/></div>
        <button class="theme-toggle" id="themeToggleApp"><i class="fa-solid ${S.theme==='dark'?'fa-sun':'fa-moon'}"></i></button>
        <button class="icon-btn" id="notifBtn"><i class="fa-solid fa-bell"></i>${unread?`<span class="badge-dot">${unread}</span>`:''}</button>
        <div class="user-chip"><div class="avatar">${initials(u.name)}</div><div><div class="nm">${escapeHtml(u.name)}</div><div class="rl">${u.role[0].toUpperCase()+u.role.slice(1)}</div></div>
          <button class="icon-action" id="logoutBtn" title="Keluar"><i class="fa-solid fa-arrow-right-from-bracket"></i></button></div>
      </div>
    </div>
    ${S.notifOpen ? renderNotifPanel(notifs) : ''}
    <div id="appMain">${renderTabContent(u)}</div>
  </div>`;
}

function buildNotifications(u){
  const list=[];
  if(u.role==='siswa'){
    myTasks().forEach(t=>{
      const mine=mySubmissionFor(t.id); const dl=deadlineInfo(t.deadline);
      if(!mine && dl.cls==='soon') list.push({ic:'fa-clock',bg:'var(--warning-soft)',color:'var(--warning)',text:`Deadline "${t.title}" tinggal ${dl.label}`,time:'Segera'});
      if(!mine && dl.late) list.push({ic:'fa-triangle-exclamation',bg:'var(--danger-soft)',color:'var(--danger)',text:`Tugas "${t.title}" sudah lewat deadline`,time:'Terlambat'});
      if(mine && mine.status==='revision_requested') list.push({ic:'fa-rotate-left',bg:'var(--warning-soft)',color:'var(--warning)',text:`Revisi diminta untuk "${t.title}"`,time:'Baru'});
      if(mine && mine.score!=null) list.push({ic:'fa-star',bg:'var(--success-soft)',color:'var(--success)',text:`Nilai "${t.title}" sudah keluar: ${mine.score}`,time:'Baru'});
    });
  } else if(u.role==='guru'){
    myTasks().forEach(t=>{
      const subs=submissionsFor(t.id).filter(s=>s.score==null);
      if(subs.length) list.push({ic:'fa-inbox',bg:'var(--primary-soft)',color:'var(--primary)',text:`${subs.length} pengumpulan baru untuk "${t.title}" belum dinilai`,time:'Perlu ditinjau'});
    });
  }
  return list.slice(0,8);
}
function renderNotifPanel(notifs){
  return `<div class="panel-dropdown glass fade-in" id="notifPanel">
    <h4>Notifikasi</h4>
    ${notifs.length? notifs.map(n=>`<div class="notif-item"><div class="ic" style="background:${n.bg};color:${n.color}"><i class="fa-solid ${n.ic}"></i></div>
      <div><div class="tx">${n.text}</div><div class="tm">${n.time}</div></div></div>`).join('') : `<div class="empty-state" style="padding:26px;"><i class="fa-solid fa-bell-slash"></i>Belum ada notifikasi</div>`}
  </div>`;
}

function renderTabContent(u){
  if(S.tab==='dashboard') return u.role==='siswa'?dashSiswa(u):u.role==='guru'?dashGuru(u):dashAdmin(u);
  if(S.tab==='tugas') return renderTugasTab(u);
  if(S.tab==='kalender') return renderKalender(u);
  if(S.tab==='forum') return renderForum(u);
  if(S.tab==='chat') return renderChat(u);
  if(S.tab==='pengumuman') return renderPengumuman(u);
  if(S.tab==='kelola' && u.role==='admin') return renderKelola(u);
  if(S.tab==='profil') return renderProfil(u);
  return '';
}

/* ---------- DASHBOARD SISWA ---------- */
function dashSiswa(u){
  const tasks = myTasks();
  const done = tasks.filter(t=>mySubmissionFor(t.id)).length;
  const late = tasks.filter(t=>{const m=mySubmissionFor(t.id); return !m && deadlineInfo(t.deadline).late;}).length;
  const graded = S.submissions.filter(s=>s.studentId===u.id && s.score!=null);
  const avg = graded.length? Math.round(graded.reduce((a,s)=>a+s.score,0)/graded.length):null;
  const upcoming = tasks.filter(t=>!mySubmissionFor(t.id)).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,4);
  const pinnedAnn = S.announcements.filter(a=>a.pinned).slice(0,2);

  return `
  <div class="page-head"><div><h2>Halo, ${escapeHtml(u.name.split(' ')[0])} 👋</h2><div class="desc">Berikut ringkasan aktivitas belajarmu hari ini</div></div></div>
  <div class="stat-grid">
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,var(--primary),var(--purple))"><i class="fa-solid fa-book"></i></div></div><div class="n">${tasks.length}</div><div class="l">Tugas Aktif</div></div>
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,#16A34A,#4ADE80)"><i class="fa-solid fa-circle-check"></i></div></div><div class="n">${done}</div><div class="l">Tugas Selesai</div></div>
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,#EF4444,#F87171)"><i class="fa-solid fa-clock"></i></div></div><div class="n">${late}</div><div class="l">Tugas Terlambat</div></div>
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,#F59E0B,#FBBF24)"><i class="fa-solid fa-star"></i></div></div><div class="n">${avg!=null?avg:'—'}</div><div class="l">Nilai Rata-rata</div></div>
  </div>
  <div class="dash-grid">
    <div class="card"><h3>Progres Pengumpulan Tugas <span class="see-all" data-tab="tugas">Lihat semua</span></h3>
      <div class="chart-wrap"><canvas id="chartSiswa"></canvas></div>
    </div>
    <div class="card"><h3>Deadline Terdekat</h3>
      <div class="mini-list">
        ${upcoming.length? upcoming.map(t=>{const dl=deadlineInfo(t.deadline);return `<div class="mini-item"><span class="dot" style="background:${SUBJECT_COLORS[t.subject]}"></span>
          <div class="t">${escapeHtml(t.title)}</div><div class="s">${dl.label}</div></div>`}).join('') : `<div class="empty-state" style="padding:20px 0;"><i class="fa-solid fa-mug-hot"></i>Semua tugas beres!</div>`}
      </div>
      <h3 style="margin-top:20px;">Pengumuman</h3>
      <div class="mini-list">
        ${pinnedAnn.length? pinnedAnn.map(a=>`<div class="mini-item"><span class="dot" style="background:var(--purple)"></span><div class="t">${escapeHtml(a.title)}</div><div class="s">📌</div></div>`).join('') : `<div class="empty-state" style="padding:10px 0;font-size:12px;">Tidak ada pengumuman.</div>`}
      </div>
    </div>
  </div>`;
}

/* ---------- DASHBOARD GURU ---------- */
function dashGuru(u){
  const tasks = myTasks();
  const subs = S.submissions.filter(s=>tasks.some(t=>t.id===s.taskId));
  const ungraded = subs.filter(s=>s.score==null).length;
  const graded = subs.filter(s=>s.score!=null);
  const avg = graded.length? Math.round(graded.reduce((a,s)=>a+s.score,0)/graded.length):null;
  const recent = tasks.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,4);

  return `
  <div class="page-head">
    <div><h2>Dashboard Guru</h2><div class="desc">Kelola tugas dan pantau progres kelasmu</div></div>
    <button class="btn" data-open-new-task="1"><i class="fa-solid fa-plus"></i> Buat Tugas</button>
  </div>
  <div class="stat-grid">
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,var(--primary),var(--purple))"><i class="fa-solid fa-clipboard-list"></i></div></div><div class="n">${tasks.length}</div><div class="l">Tugas Dibuat</div></div>
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,#16A34A,#4ADE80)"><i class="fa-solid fa-inbox"></i></div></div><div class="n">${subs.length}</div><div class="l">Total Pengumpulan</div></div>
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,#EF4444,#F87171)"><i class="fa-solid fa-pen"></i></div></div><div class="n">${ungraded}</div><div class="l">Belum Dinilai</div></div>
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,#F59E0B,#FBBF24)"><i class="fa-solid fa-chart-simple"></i></div></div><div class="n">${avg!=null?avg:'—'}</div><div class="l">Rata-rata Nilai Kelas</div></div>
  </div>
  <div class="dash-grid">
    <div class="card"><h3>Grafik Nilai & Keterlambatan</h3><div class="chart-wrap"><canvas id="chartGuru"></canvas></div></div>
    <div class="card"><h3>Tugas Terbaru</h3>
      <div class="mini-list">
        ${recent.map(t=>{const subN=submissionsFor(t.id).length;return `<div class="mini-item"><span class="dot" style="background:${SUBJECT_COLORS[t.subject]}"></span>
          <div class="t">${escapeHtml(t.title)}</div><div class="s">${subN} kumpul</div></div>`}).join('')}
      </div>
    </div>
  </div>`;
}

/* ---------- DASHBOARD ADMIN ---------- */
function dashAdmin(u){
  const totalUsers=S.users.length, totalGuru=S.users.filter(x=>x.role==='guru').length, totalSiswa=S.users.filter(x=>x.role==='siswa').length;
  return `
  <div class="page-head"><div><h2>Dashboard Admin</h2><div class="desc">Ringkasan seluruh aktivitas sekolah</div></div></div>
  <div class="stat-grid">
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,var(--primary),var(--purple))"><i class="fa-solid fa-users"></i></div></div><div class="n">${totalUsers}</div><div class="l">Total Pengguna</div></div>
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,#16A34A,#4ADE80)"><i class="fa-solid fa-chalkboard-user"></i></div></div><div class="n">${totalGuru}</div><div class="l">Guru</div></div>
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,#F59E0B,#FBBF24)"><i class="fa-solid fa-user-graduate"></i></div></div><div class="n">${totalSiswa}</div><div class="l">Siswa</div></div>
    <div class="stat-card glass"><div class="top"><div class="ic" style="background:linear-gradient(135deg,#EF4444,#F87171)"><i class="fa-solid fa-clipboard-list"></i></div></div><div class="n">${S.tasks.length}</div><div class="l">Total Tugas</div></div>
  </div>
  <div class="dash-grid">
    <div class="card"><h3>Aktivitas Terbaru</h3>
      <div class="mini-list">
        ${S.activity.slice(0,8).map(a=>`<div class="mini-item"><span class="dot" style="background:var(--primary)"></span><div class="t">${escapeHtml(a.who)} ${escapeHtml(a.action)}</div><div class="s">${new Date(a.at).toLocaleDateString('id-ID')}</div></div>`).join('') || `<div class="empty-state"><i class="fa-solid fa-clock-rotate-left"></i>Belum ada aktivitas.</div>`}
      </div>
    </div>
    <div class="card"><h3>Distribusi Kelas</h3>
      <div class="mini-list">
        ${KELAS_LIST.map(k=>{const n=S.users.filter(x=>x.kelas===k).length;return `<div class="mini-item"><span class="dot" style="background:var(--purple)"></span><div class="t">Kelas ${k}</div><div class="s">${n} siswa</div></div>`}).join('')}
      </div>
    </div>
  </div>`;
}

/* ---------- TUGAS TAB ---------- */
function filteredTasks(u){
  return myTasks().filter(t=>{
    if(S.taskFilter.subject!=='Semua' && t.subject!==S.taskFilter.subject) return false;
    if(S.taskFilter.q && !t.title.toLowerCase().includes(S.taskFilter.q.toLowerCase())) return false;
    if(u.role==='siswa' && S.taskFilter.status!=='Semua' && statusOf(t)!==S.taskFilter.status) return false;
    return true;
  }).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline));
}
function renderTugasTab(u){
  const list = filteredTasks(u);
  return `
  <div class="page-head"><div><h2>${u.role==='guru'?'Manajemen Tugas':'Tugas Saya'}</h2><div class="desc">${list.length} tugas ditemukan</div></div>
    ${u.role==='guru'?`<button class="btn" data-open-new-task="1"><i class="fa-solid fa-plus"></i> Buat Tugas</button>`:''}
  </div>
  <div class="filter-bar">
    <input id="taskSearch" placeholder="Cari tugas..." value="${S.taskFilter.q}"/>
    <select id="filterSubj"><option value="Semua">Semua Mapel</option>${SUBJECTS.map(s=>`<option ${S.taskFilter.subject===s?'selected':''}>${s}</option>`).join('')}</select>
    ${u.role==='siswa'?`<select id="filterStat">${['Semua','belum','submitted','revision','graded'].map(s=>`<option value="${s}" ${S.taskFilter.status===s?'selected':''}>${s==='Semua'?'Semua Status':statusLabel(s)}</option>`).join('')}</select>`:''}
  </div>
  <div class="task-grid">${list.length? list.map(t=>renderTaskCard(t,u)).join('') : `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-folder-open"></i>Tidak ada tugas untuk ditampilkan.</div>`}</div>`;
}
function renderTaskCard(t,u){
  const color = SUBJECT_COLORS[t.subject]||'#666'; const dl=deadlineInfo(t.deadline);
  if(u.role==='guru'){
    const subs=submissionsFor(t.id); const graded=subs.filter(s=>s.score!=null).length;
    const pct = subs.length? Math.round(graded/subs.length*100):0;
    return `<div class="task-card">
      <span class="subj-pill" style="background:${color}">${t.subject}</span>
      <h4>${escapeHtml(t.title)}</h4><div class="desc">${escapeHtml(t.desc)}</div>
      <div class="meta"><span>Kelas ${t.kelas}</span><span class="deadline-chip ${dl.cls}">${dl.label}</span></div>
      <div class="progress-bar"><div class="fill" style="width:${pct}%"></div></div>
      <div class="task-foot"><span class="status-pill submitted">${subs.length} kumpul</span>
        <button class="btn sm" data-review-task="${t.id}">Tinjau</button></div>
    </div>`;
  }
  const st=statusOf(t); const mine=mySubmissionFor(t.id);
  return `<div class="task-card">
    <span class="subj-pill" style="background:${color}">${t.subject}</span>
    <h4>${escapeHtml(t.title)}</h4><div class="desc">${escapeHtml(t.desc)}</div>
    <div class="meta"><span>oleh ${escapeHtml(t.teacherName)}</span><span class="deadline-chip ${dl.cls}">${dl.label}</span></div>
    <div class="task-foot"><span class="status-pill ${st}">${statusLabel(st)}${mine&&mine.score!=null?' · '+mine.score:''}</span>
      <button class="btn sm" data-open-submit="${t.id}">${mine?'Lihat':'Kumpulkan'}</button></div>
  </div>`;
}

/* ---------- KALENDER ---------- */
function renderKalender(u){
  const y=S.calYear, m=S.calMonth;
  const first=new Date(y,m,1), startDow=first.getDay(), daysInMonth=new Date(y,m+1,0).getDate();
  const monthName=first.toLocaleDateString('id-ID',{month:'long',year:'numeric'});
  const tasks = myTasks();
  let cells='';
  for(let i=0;i<startDow;i++) cells+=`<div class="cal-day empty"></div>`;
  const today=new Date();
  for(let d=1; d<=daysInMonth; d++){
    const dayTasks = tasks.filter(t=>{const dt=new Date(t.deadline); return dt.getFullYear()===y&&dt.getMonth()===m&&dt.getDate()===d;});
    const isToday = today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;
    cells+=`<div class="cal-day ${isToday?'today':''}">${d}<div class="dots">${dayTasks.map(t=>`<span style="background:${SUBJECT_COLORS[t.subject]}" title="${escapeHtml(t.title)}"></span>`).join('')}</div></div>`;
  }
  return `
  <div class="page-head"><div><h2>Kalender Tugas</h2><div class="desc">Semua deadline dalam tampilan bulanan</div></div></div>
  <div class="card">
    <div class="cal-nav"><button data-cal="-1"><i class="fa-solid fa-chevron-left"></i></button><h3 style="margin:0;">${monthName}</h3><button data-cal="1"><i class="fa-solid fa-chevron-right"></i></button></div>
    <div class="cal-grid">${['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d=>`<div class="cal-dow">${d}</div>`).join('')}${cells}</div>
  </div>`;
}

/* ---------- FORUM ---------- */
function renderForum(u){
  const kelas = u.role==='siswa'?u.kelas:(u.role==='guru'?null:null);
  const posts = S.forum.filter(p=> u.role==='siswa'? p.kelas===u.kelas : true).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  return `
  <div class="page-head"><div><h2>Forum Diskusi</h2><div class="desc">Diskusi antar siswa dan guru per kelas</div></div></div>
  <div class="card" style="margin-bottom:16px;">
    <textarea id="forumInput" placeholder="Tulis pertanyaan atau diskusi..." style="width:100%;min-height:70px;padding:12px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-alt);color:var(--text);font-family:inherit;font-size:13px;outline:none;"></textarea>
    <div style="display:flex;justify-content:flex-end;margin-top:10px;"><button class="btn sm" id="postForum"><i class="fa-solid fa-paper-plane"></i> Kirim</button></div>
  </div>
  ${posts.length? posts.map(p=>`
    <div class="forum-post">
      <div class="top"><div class="avatar" style="width:30px;height:30px;font-size:11px;">${initials(p.author)}</div>
        <div><div style="font-size:12.5px;font-weight:700;">${escapeHtml(p.author)}</div><div style="font-size:10.5px;color:var(--text-dim)">${fmtDate(p.createdAt)} ${p.pinned?'· 📌 Disematkan':''}</div></div></div>
      <div class="content">${escapeHtml(p.content)}</div>
      <div class="actions"><span data-like="${p.id}"><i class="fa-regular fa-thumbs-up"></i> ${p.likes.length}</span><span data-reply="${p.id}"><i class="fa-regular fa-comment"></i> ${p.replies.length} balasan</span></div>
      ${p.replies.map(r=>`<div class="forum-reply"><strong>${escapeHtml(r.author)}:</strong> ${escapeHtml(r.content)}</div>`).join('')}
    </div>`).join('') : `<div class="empty-state"><i class="fa-solid fa-comments"></i>Belum ada diskusi.</div>`}`;
}

/* ---------- CHAT ---------- */
function chatKey(a,b){ return [a,b].sort().join('__'); }
function renderChat(u){
  let contacts;
  if(u.role==='siswa') contacts = S.users.filter(x=>x.role==='guru');
  else if(u.role==='guru') contacts = S.users.filter(x=>x.role==='siswa');
  else contacts = S.users.filter(x=>x.id!==u.id);
  if(!S.chatActive && contacts.length) S.chatActive = contacts[0].id;
  const active = S.users.find(x=>x.id===S.chatActive);
  const key = active? chatKey(u.id,active.id) : null;
  const msgs = key? (S.chats[key]||[]) : [];
  return `
  <div class="page-head"><div><h2>Chat</h2><div class="desc">Komunikasi langsung dengan guru atau siswa</div></div></div>
  <div class="chat-wrap">
    <div class="chat-list">${contacts.map(c=>{
      const k=chatKey(u.id,c.id); const cm=(S.chats[k]||[]); const last=cm[cm.length-1];
      return `<div class="chat-list-item ${S.chatActive===c.id?'active':''}" data-chat-contact="${c.id}">
        <div class="avatar" style="width:32px;height:32px;font-size:11px;">${initials(c.name)}</div>
        <div><div class="nm">${escapeHtml(c.name)}</div><div class="lm">${last?escapeHtml(last.text):'Belum ada pesan'}</div></div></div>`;
    }).join('') || `<div class="empty-state" style="padding:20px 0;font-size:12px;">Tidak ada kontak.</div>`}</div>
    <div class="chat-panel">
      ${active? `<div class="chat-head"><div class="avatar" style="width:28px;height:28px;font-size:10.5px;">${initials(active.name)}</div>${escapeHtml(active.name)}</div>
      <div class="chat-body" id="chatBody">${msgs.length? msgs.map(m=>`<div class="bubble ${m.from===u.id?'me':'them'}">${escapeHtml(m.text)}</div>`).join('') : `<div class="empty-state" style="padding:30px 0;"><i class="fa-solid fa-comment-dots"></i>Mulai percakapan.</div>`}</div>
      <div class="chat-input"><input id="chatMsgInput" placeholder="Tulis pesan..."/><button class="btn sm" id="sendChat"><i class="fa-solid fa-paper-plane"></i></button></div>`
      : `<div class="empty-state" style="margin:auto;"><i class="fa-solid fa-comments"></i>Pilih kontak untuk mulai chat.</div>`}
    </div>
  </div>`;
}

/* ---------- PENGUMUMAN ---------- */
function renderPengumuman(u){
  const list = S.announcements.slice().sort((a,b)=> (b.pinned-a.pinned) || (new Date(b.createdAt)-new Date(a.createdAt)));
  const canPost = u.role==='guru'||u.role==='admin';
  return `
  <div class="page-head"><div><h2>Pengumuman</h2><div class="desc">Informasi penting dari sekolah</div></div>
    ${canPost?`<button class="btn" id="newAnnounce"><i class="fa-solid fa-plus"></i> Buat Pengumuman</button>`:''}
  </div>
  ${list.length? list.map(a=>`<div class="announce-card ${a.pinned?'pinned':''}">${a.pinned?'<div class="pin"><i class="fa-solid fa-thumbtack"></i></div>':''}
    <h4>${escapeHtml(a.title)}</h4><p>${escapeHtml(a.body)}</p><div class="meta">oleh ${escapeHtml(a.author)} · ${fmtDate(a.createdAt)}</div></div>`).join('') : `<div class="empty-state"><i class="fa-solid fa-bullhorn"></i>Belum ada pengumuman.</div>`}`;
}

/* ---------- KELOLA (ADMIN) ---------- */
function renderKelola(u){
  return `
  <div class="page-head"><div><h2>Kelola Sekolah</h2><div class="desc">Manajemen pengguna dan data sekolah</div></div>
    <div style="display:flex;gap:8px;"><button class="btn ghost sm" id="exportData"><i class="fa-solid fa-download"></i> Backup (JSON)</button>
    <button class="btn ghost sm" id="exportCsv"><i class="fa-solid fa-file-csv"></i> Export Nilai (CSV)</button></div>
  </div>
  <div class="card">
    <h3>Daftar Pengguna <span class="see-all">${S.users.length} akun</span></h3>
    <table class="admin-table"><thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Kelas/Mapel</th><th></th></tr></thead>
    <tbody>${S.users.map(x=>`<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.email)}</td><td><span class="role-tag ${x.role}">${x.role}</span></td>
      <td>${x.kelas||x.subject||'—'}</td><td><button class="icon-action" data-reset-pw="${x.id}" title="Reset Password"><i class="fa-solid fa-key"></i></button>
      <button class="icon-action" data-del-user="${x.id}" title="Hapus"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('')}</tbody></table>
  </div>
  <div class="card" style="margin-top:16px;"><h3>Log Aktivitas</h3>
    <div class="mini-list">${S.activity.slice(0,10).map(a=>`<div class="mini-item"><span class="dot" style="background:var(--primary)"></span><div class="t">${escapeHtml(a.who)} ${escapeHtml(a.action)}</div><div class="s">${fmtDate(a.at)}</div></div>`).join('') || `<div class="empty-state">Belum ada aktivitas.</div>`}</div>
  </div>`;
}

/* ---------- PROFIL (with leaderboard & achievements) ---------- */
function renderProfil(u){
  const scored = S.submissions.filter(s=>s.score!=null);
  const lb = {};
  scored.forEach(s=>{ if(!lb[s.studentId]) lb[s.studentId]={name:s.studentName,total:0,count:0}; lb[s.studentId].total+=s.score; lb[s.studentId].count++; });
  const ranked = Object.values(lb).map(x=>({...x,avg:Math.round(x.total/x.count)})).sort((a,b)=>b.avg-a.avg);
  const myOnTime = S.submissions.filter(s=>s.studentId===u.id && !s.late).length;
  const myPerfect = S.submissions.filter(s=>s.studentId===u.id && s.score>=95).length;
  const myTotal = S.submissions.filter(s=>s.studentId===u.id).length;
  const allDone = u.role==='siswa' && myTasks().every(t=>mySubmissionFor(t.id));
  const badges = [
    {em:'🥇',nm:'Tepat Waktu',unlocked:myOnTime>=1},
    {em:'📚',nm:'Rajin',unlocked:myTotal>=3},
    {em:'⭐',nm:'Nilai Sempurna',unlocked:myPerfect>=1},
    {em:'🎯',nm:'Semua Selesai',unlocked:allDone},
    {em:'🔥',nm:'Streak 30 Hari',unlocked:false},
  ];
  return `
  <div class="page-head"><div><h2>Profil</h2><div class="desc">Informasi akun dan pencapaianmu</div></div></div>
  <div class="dash-grid">
    <div class="card">
      <h3>Informasi Akun</h3>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
        <div class="avatar" style="width:56px;height:56px;font-size:19px;">${initials(u.name)}</div>
        <div><div style="font-weight:700;font-size:16px;">${escapeHtml(u.name)}</div><div style="font-size:12.5px;color:var(--text-dim)">${escapeHtml(u.email)} · ${u.role}</div></div>
      </div>
      ${u.role==='siswa'?`<p style="font-size:12.5px;color:var(--text-soft);">Kelas ${u.kelas}</p>`:''}
      ${u.role==='guru'?`<p style="font-size:12.5px;color:var(--text-soft);">Mengajar ${u.subject}</p>`:''}
      <h3 style="margin-top:20px;">Pencapaian</h3>
      <div class="badge-grid">${badges.map(b=>`<div class="badge-item ${b.unlocked?'':'locked'}"><div class="em">${b.em}</div><div class="nm">${b.nm}</div></div>`).join('')}</div>
    </div>
    <div class="card">
      <h3>Papan Peringkat Kelas</h3>
      ${ranked.length? ranked.map((r,i)=>`<div class="lb-row"><div class="lb-rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</div>
        <div><div class="lb-name">${escapeHtml(r.name)}</div><div class="lb-sub">${r.count} tugas dinilai</div></div><div class="lb-score">${r.avg}</div></div>`).join('') : `<div class="empty-state" style="padding:20px 0;">Belum ada nilai.</div>`}
    </div>
  </div>`;
}

/* ================= CHARTS ================= */
let chartInstances = {};
function renderCharts(){
  const u=currentUser(); if(!u) return;
  Object.values(chartInstances).forEach(c=>c && c.destroy && c.destroy());
  chartInstances={};
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border');
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-soft');
  Chart.defaults.font.family = 'Inter'; Chart.defaults.color = textColor;

  const c1 = document.getElementById('chartSiswa');
  if(c1){
    const tasks = myTasks();
    const labels = tasks.map(t=>t.subject);
    const data = tasks.map(t=>mySubmissionFor(t.id)?100:0);
    chartInstances.a = new Chart(c1, { type:'bar', data:{ labels, datasets:[{label:'Progres (%)', data, backgroundColor:tasks.map(t=>SUBJECT_COLORS[t.subject]||'#2563EB'), borderRadius:8, maxBarThickness:34}] },
      options:{plugins:{legend:{display:false}}, scales:{y:{min:0,max:100,grid:{color:gridColor}},x:{grid:{display:false}}}} });
  }
  const c2 = document.getElementById('chartGuru');
  if(c2){
    const tasks = myTasks();
    const subs = S.submissions.filter(s=>tasks.some(t=>t.id===s.taskId) && s.score!=null);
    const buckets = {'0-59':0,'60-69':0,'70-79':0,'80-89':0,'90-100':0};
    subs.forEach(s=>{ if(s.score<60)buckets['0-59']++; else if(s.score<70)buckets['60-69']++; else if(s.score<80)buckets['70-79']++; else if(s.score<90)buckets['80-89']++; else buckets['90-100']++; });
    chartInstances.b = new Chart(c2, { type:'line', data:{ labels:Object.keys(buckets), datasets:[{label:'Jumlah Siswa', data:Object.values(buckets), borderColor:'#2563EB', backgroundColor:'rgba(37,99,235,.15)', fill:true, tension:.35, pointBackgroundColor:'#2563EB'}]},
      options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,grid:{color:gridColor}},x:{grid:{display:false}}}} });
  }
}

/* ================= MODALS ================= */
function renderModal(){
  let html='';
  if(S.modal.type==='new-task') html = modalNewTask();
  if(S.modal.type==='submit') html = modalSubmit();
  if(S.modal.type==='review') html = modalReview();
  if(S.modal.type==='new-announce') html = modalAnnounce();
  const ov=document.createElement('div'); ov.className='overlay'; ov.id='ovModal'; ov.innerHTML=html;
  document.getElementById('root').appendChild(ov);
  ov.addEventListener('click', e=>{ if(e.target.id==='ovModal'){ S.modal=null; S.dropFiles=[]; render(); }});
  bindModalEvents();
}
function modalNewTask(){
  return `<div class="modal wide"><button class="close-x" data-close-modal="1" aria-label="Tutup" title="Tutup">&times;</button>
    <h2>Buat Tugas Baru</h2><div class="sub">Isi detail tugas untuk siswa</div>
    <div class="field"><label>Judul Tugas</label><input id="ntTitle" placeholder="Contoh: Latihan Bab 4"/></div>
    <div class="field-row">
      <div class="field"><label>Mata Pelajaran</label><select id="ntSubject">${SUBJECTS.map(s=>`<option>${s}</option>`).join('')}</select></div>
      <div class="field"><label>Kelas</label><select id="ntKelas">${KELAS_LIST.map(k=>`<option>${k}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label>Deskripsi / Instruksi</label><textarea id="ntDesc" rows="3" placeholder="Jelaskan instruksi tugas..."></textarea></div>
    <div class="field-row">
      <div class="field"><label>Batas Waktu</label><input id="ntDeadline" type="datetime-local"/></div>
      <div class="field"><label>Maks Ukuran File (MB)</label><input id="ntMaxSize" type="number" value="10"/></div>
    </div>
    <div class="field"><label>Jenis File Diperbolehkan</label>
      <div class="chip-select" id="ntTypes">${ALLOWED_TYPES.map(t=>`<span data-type="${t}">${t}</span>`).join('')}</div>
    </div>
    <div class="field"><label>Rubrik Penilaian</label>
      <div id="rubricRows">
        <div class="rubric-row"><span>Ketepatan jawaban</span><input type="number" value="60" class="rubricM"/></div>
        <div class="rubric-row"><span>Kerapian & kelengkapan</span><input type="number" value="40" class="rubricM"/></div>
      </div>
    </div>
    <div class="modal-actions"><button class="btn ghost" data-close-modal="1">Batal</button><button class="btn" id="saveNewTask">Simpan Tugas</button></div>
  </div>`;
}
function modalSubmit(){
  const t = S.tasks.find(x=>x.id===S.modal.taskId); const mine=mySubmissionFor(t.id);
  return `<div class="modal"><button class="close-x" data-close-modal="1" aria-label="Tutup" title="Tutup">&times;</button>
    <h2>${escapeHtml(t.title)}</h2><div class="sub">${escapeHtml(t.desc)}</div>
    <div class="field"><label>Jenis file diperbolehkan: ${t.types.join(', ')} · Maks ${t.maxSizeMB}MB</label></div>
    <div class="dropzone" id="dropZone"><i class="fa-solid fa-cloud-arrow-up"></i>Seret file ke sini atau klik untuk pilih file<input type="file" id="fileInput" multiple style="display:none;"/></div>
    <div class="file-chip-list" id="fileChipList">${(S.dropFiles.length?S.dropFiles:(mine?mine.files:[])).map((f,i)=>`<div class="file-chip"><i class="fa-solid fa-file"></i>${escapeHtml(f.name)} <span style="color:var(--text-dim)">(${fmtSize(f.size)})</span><span class="rm" data-rm-file="${i}"><i class="fa-solid fa-xmark"></i></span></div>`).join('')}</div>
    <div class="field" style="margin-top:12px;"><label>Catatan untuk Guru</label><textarea id="subNote" rows="2" placeholder="Opsional...">${mine?escapeHtml(mine.note||''):''}</textarea></div>
    ${mine && mine.status==='revision_requested' ? `<div class="field" style="background:var(--warning-soft);padding:10px 12px;border-radius:10px;color:var(--warning);font-size:12.5px;"><i class="fa-solid fa-rotate-left"></i> Guru meminta revisi: ${escapeHtml(mine.feedback||'')}</div>`:''}
    ${mine && mine.score!=null ? `<div class="field" style="background:var(--success-soft);padding:12px;border-radius:10px;"><strong style="color:var(--success)">${mine.score}/100 (${mine.letter||''})</strong><div style="font-size:12px;color:var(--text-soft);margin-top:4px;">${escapeHtml(mine.feedback||'Tidak ada catatan.')}</div></div>`:''}
    <div class="modal-actions"><button class="btn ghost" data-close-modal="1">Tutup</button><button class="btn" id="saveSubmission" data-tid="${t.id}"><i class="fa-solid fa-paper-plane"></i> ${mine?'Perbarui':'Kumpulkan'}</button></div>
  </div>`;
}
function modalReview(){
  const t = S.tasks.find(x=>x.id===S.modal.taskId); const subs = submissionsFor(t.id);
  return `<div class="modal wide"><button class="close-x" data-close-modal="1" aria-label="Tutup" title="Tutup">&times;</button>
    <h2>${escapeHtml(t.title)}</h2><div class="sub">${subs.length} pengumpulan · deadline ${fmtDate(t.deadline)}</div>
    ${subs.length? subs.map(s=>`
      <div class="grade-sub-item">
        <div class="top"><span class="who">${escapeHtml(s.studentName)}</span><span class="when">${fmtDate(s.submittedAt)}${s.late?' · TELAT':''}</span></div>
        <div class="note">${escapeHtml(s.note||'(tidak ada catatan)')}</div>
        <div class="file-chip-list">${s.files.map(f=>`<div class="file-chip"><i class="fa-solid fa-file"></i>${escapeHtml(f.name)} <span style="color:var(--text-dim)">(${fmtSize(f.size)})</span></div>`).join('')}</div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center;">
          ${s.score!=null?`<span class="status-pill graded">${s.score}/100</span>`:`<input type="number" min="0" max="100" placeholder="Nilai" id="score-${s.id}" style="width:70px;padding:8px;border-radius:8px;border:1px solid var(--border);"/>`}
          <input type="text" placeholder="Feedback singkat..." id="fb-${s.id}" value="${s.score!=null?escapeHtml(s.feedback||''):''}" style="flex:1;min-width:160px;padding:8px 10px;border-radius:8px;border:1px solid var(--border);"/>
          <button class="btn sm" data-save-grade="${s.id}">${s.score!=null?'Ubah Nilai':'Simpan Nilai'}</button>
          <button class="btn sm ghost" data-req-revision="${s.id}"><i class="fa-solid fa-rotate-left"></i> Minta Revisi</button>
        </div>
      </div>`).join('') : `<div class="empty-state"><i class="fa-solid fa-inbox"></i>Belum ada siswa yang mengumpulkan.</div>`}
    <div class="modal-actions"><button class="btn ghost" data-close-modal="1">Tutup</button></div>
  </div>`;
}
function modalAnnounce(){
  return `<div class="modal"><button class="close-x" data-close-modal="1" aria-label="Tutup" title="Tutup">&times;</button>
    <h2>Buat Pengumuman</h2>
    <div class="field"><label>Judul</label><input id="anTitle" placeholder="Judul pengumuman"/></div>
    <div class="field"><label>Isi</label><textarea id="anBody" rows="4" placeholder="Tulis isi pengumuman..."></textarea></div>
    <div class="field"><label><input type="checkbox" id="anPinned"/> Sematkan pengumuman ini</label></div>
    <div class="modal-actions"><button class="btn ghost" data-close-modal="1">Batal</button><button class="btn" id="saveAnnounce">Publikasikan</button></div>
  </div>`;
}

/* ================= EVENT HANDLERS ================= */
function attachHandlers(){
  // theme toggles
  ['themeToggleLanding','themeToggleLogin','themeToggleApp'].forEach(id=>{
    const b=document.getElementById(id);
    if(b) b.addEventListener('click', async ()=>{ S.theme = S.theme==='dark'?'light':'dark'; document.documentElement.setAttribute('data-theme',S.theme); await savePersonal('theme',S.theme); render(); });
  });
  document.querySelectorAll('[data-goto-login]').forEach(b=>b.addEventListener('click', ()=>{ S.view='login'; S.loginErrors={}; render(); }));
  document.querySelectorAll('[data-goto-landing]').forEach(b=>b.addEventListener('click', ()=>{ S.view='landing'; render(); }));
  document.querySelectorAll('[data-scroll]').forEach(b=>b.addEventListener('click', ()=>{ document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:'smooth'}); }));
  document.querySelectorAll('[data-faq]').forEach(b=>b.addEventListener('click', ()=>{ const i=Number(b.dataset.faq); S.faqOpen = S.faqOpen===i?null:i; render(); }));

  /* ---- login page ---- */
  document.querySelectorAll('[data-login-role]').forEach(b=>b.addEventListener('click', ()=>{ S.loginRole=b.dataset.loginRole; render(); }));
  const togglePw = document.getElementById('togglePw');
  if(togglePw) togglePw.addEventListener('click', ()=>{ const inp=document.getElementById('loginPassword'); const icon=togglePw.querySelector('i');
    if(inp.type==='password'){inp.type='text';icon.className='fa-solid fa-eye-slash';} else {inp.type='password';icon.className='fa-solid fa-eye';} });
  const forgotPw = document.getElementById('forgotPw');
  if(forgotPw) forgotPw.addEventListener('click', e=>{ e.preventDefault(); toast('Tautan reset password (demo) telah "dikirim" ke email kamu.','fa-envelope-circle-check'); });
  const googleLogin = document.getElementById('googleLogin');
  if(googleLogin) googleLogin.addEventListener('click', ()=>{
    document.getElementById('root').insertAdjacentHTML('beforeend', renderGooglePicker());
    document.getElementById('ovGoogle').addEventListener('click', e=>{ if(e.target.id==='ovGoogle') e.target.remove(); });
    document.getElementById('gClose').addEventListener('click', ()=>document.getElementById('ovGoogle').remove());
    document.querySelectorAll('[data-gaccount]').forEach(el=>el.addEventListener('click', ()=>loginWithGoogleAccount(el.dataset.gaccount)));
    const other=document.querySelector('[data-gaccount-other]');
    if(other) other.addEventListener('click', ()=>{ document.getElementById('ovGoogle').remove(); toast('Silakan masuk manual dengan email & password di bawah.','fa-circle-info'); });
  });
  document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click', ()=>{
    const role=b.dataset.demo; const map={siswa:'dimas.pratama@gmail.com',guru:'ratna.wijaya@gmail.com',admin:'admin.sekolah@gmail.com'};
    document.getElementById('loginEmail').value = map[role]; document.getElementById('loginPassword').value='demo123'; S.loginRole=role;
    document.querySelectorAll('[data-login-role]').forEach(x=>x.classList.toggle('active', x.dataset.loginRole===role));
  }));
  const doLogin = document.getElementById('doLogin');
  if(doLogin) doLogin.addEventListener('click', doLoginHandler);

  /* ---- app shell ---- */
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click', ()=>{ S.tab=b.dataset.tab; S.notifOpen=false; render(); }));
  const notifBtn = document.getElementById('notifBtn');
  if(notifBtn) notifBtn.addEventListener('click', e=>{ e.stopPropagation(); S.notifOpen=!S.notifOpen; render(); });
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn) logoutBtn.addEventListener('click', async ()=>{ S.session=null; await savePersonal('session',null); S.view='landing'; S.tab='dashboard'; render(); toast('Berhasil keluar.','fa-arrow-right-from-bracket'); });

  const openNewTask = document.querySelector('[data-open-new-task]');
  if(openNewTask) openNewTask.addEventListener('click', ()=>{ S.modal={type:'new-task'}; render(); });
  document.querySelectorAll('[data-open-submit]').forEach(b=>b.addEventListener('click', ()=>{ S.dropFiles=[]; S.modal={type:'submit',taskId:b.dataset.openSubmit}; render(); }));
  document.querySelectorAll('[data-review-task]').forEach(b=>b.addEventListener('click', ()=>{ S.modal={type:'review',taskId:b.dataset.reviewTask}; render(); }));
  const newAnnounce = document.getElementById('newAnnounce');
  if(newAnnounce) newAnnounce.addEventListener('click', ()=>{ S.modal={type:'new-announce'}; render(); });

  const taskSearch=document.getElementById('taskSearch');
  if(taskSearch) taskSearch.addEventListener('input', e=>{ S.taskFilter.q=e.target.value; render(); const el=document.getElementById('taskSearch'); if(el){el.focus(); el.selectionStart=el.selectionEnd=el.value.length;} });
  const filterSubj=document.getElementById('filterSubj');
  if(filterSubj) filterSubj.addEventListener('change', e=>{ S.taskFilter.subject=e.target.value; render(); });
  const filterStat=document.getElementById('filterStat');
  if(filterStat) filterStat.addEventListener('change', e=>{ S.taskFilter.status=e.target.value; render(); });

  document.querySelectorAll('[data-cal]').forEach(b=>b.addEventListener('click', ()=>{
    let m=S.calMonth+Number(b.dataset.cal); let y=S.calYear;
    if(m<0){m=11;y--;} if(m>11){m=0;y++;} S.calMonth=m; S.calYear=y; render();
  }));

  const postForum=document.getElementById('postForum');
  if(postForum) postForum.addEventListener('click', async ()=>{
    const u=currentUser(); const val=document.getElementById('forumInput').value.trim();
    if(!val){ toast('Tulis sesuatu dulu ya.','fa-triangle-exclamation'); return; }
    S.forum.unshift({id:uid(),kelas:u.kelas||'9A',subject:'Umum',author:u.name,authorId:u.id,content:val,likes:[],pinned:false,createdAt:new Date().toISOString(),replies:[]});
    await persist('forum'); render(); toast('Diskusi berhasil diposting.','fa-comment');
  });
  document.querySelectorAll('[data-like]').forEach(b=>b.addEventListener('click', async ()=>{
    const u=currentUser(); const p=S.forum.find(x=>x.id===b.dataset.like);
    const idx=p.likes.indexOf(u.id); if(idx>-1) p.likes.splice(idx,1); else p.likes.push(u.id);
    await persist('forum'); render();
  }));

  document.querySelectorAll('[data-chat-contact]').forEach(b=>b.addEventListener('click', ()=>{ S.chatActive=b.dataset.chatContact; render(); }));
  const sendChat=document.getElementById('sendChat');
  if(sendChat) sendChat.addEventListener('click', sendChatHandler);
  const chatInput=document.getElementById('chatMsgInput');
  if(chatInput) chatInput.addEventListener('keydown', e=>{ if(e.key==='Enter') sendChatHandler(); });

  document.querySelectorAll('[data-reset-pw]').forEach(b=>b.addEventListener('click', ()=>{ toast('Password direset ke "demo123" (simulasi).','fa-key'); }));
  document.querySelectorAll('[data-del-user]').forEach(b=>b.addEventListener('click', async ()=>{
    S.users = S.users.filter(x=>x.id!==b.dataset.delUser); await persist('users'); render(); toast('Pengguna dihapus.','fa-trash');
  }));
  const exportData=document.getElementById('exportData');
  if(exportData) exportData.addEventListener('click', ()=>{
    const blob=new Blob([JSON.stringify({users:S.users,tasks:S.tasks,submissions:S.submissions,announcements:S.announcements},null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='edusubmit-backup.json'; a.click();
    toast('Backup JSON diunduh.','fa-download');
  });
  const exportCsv=document.getElementById('exportCsv');
  if(exportCsv) exportCsv.addEventListener('click', ()=>{
    let csv='Nama Siswa,Tugas,Mapel,Nilai,Status\\n';
    S.submissions.forEach(s=>{ const t=S.tasks.find(x=>x.id===s.taskId); csv+=`${s.studentName},${t?t.title:''},${t?t.subject:''},${s.score??''},${s.score!=null?'Dinilai':'Belum'}\\n`; });
    const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='nilai-edusubmit.csv'; a.click();
    toast('Nilai diekspor ke CSV.','fa-file-csv');
  });


  document.addEventListener('click', closeDropdownsOnOutsideClick, {once:true});
}
function closeDropdownsOnOutsideClick(e){
  if(S.notifOpen && !e.target.closest('#notifBtn') && !e.target.closest('#notifPanel')){ S.notifOpen=false; render(); }
}

async function loginWithGoogleAccount(userId){
  const ov=document.getElementById('ovGoogle'); if(ov) ov.remove();
  const user = S.users.find(u=>u.id===userId);
  if(!user) return;
  const wrap=document.createElement('div'); wrap.className='login-success'; wrap.innerHTML='<div class="success-check"><i class="fa-solid fa-check"></i></div>';
  document.getElementById('root').appendChild(wrap);
  await new Promise(r=>setTimeout(r,650));
  S.loginErrors={}; S.session={userId:user.id}; await savePersonal('session',S.session);
  S.view='app'; S.tab='dashboard';
  logActivity(user.name,'masuk ke EduSubmit lewat Google');
  render();
  toast(`Selamat datang, ${user.name.split(' ')[0]}!`,'fa-hand-sparkles');
}
async function doLoginHandler(){
  const email=document.getElementById('loginEmail').value.trim();
  const pw=document.getElementById('loginPassword').value;
  const errors={};
  if(!email) errors.email='Email wajib diisi.';
  else if(!/^\\S+@gmail\\.com$/i.test(email)) errors.email='Gunakan alamat @gmail.com.';
  if(!pw) errors.password='Password wajib diisi.';
  if(Object.keys(errors).length){ S.loginErrors=errors; render(); return; }
  const user = S.users.find(u=>u.email.toLowerCase()===email.toLowerCase() && u.password===pw && u.role===S.loginRole);
  if(!user){ S.loginErrors={password:'Email, password, atau peran tidak cocok.'}; render(); return; }
  S.loginErrors={};
  // success animation
  const wrap=document.createElement('div'); wrap.className='login-success'; wrap.innerHTML='<div class="success-check"><i class="fa-solid fa-check"></i></div>';
  document.getElementById('root').appendChild(wrap);
  await new Promise(r=>setTimeout(r,650));
  S.session={userId:user.id}; await savePersonal('session',S.session);
  S.view='app'; S.tab='dashboard';
  logActivity(user.name,'masuk ke EduSubmit');
  render();
  toast(`Selamat datang, ${user.name.split(' ')[0]}!`,'fa-hand-sparkles');
}

async function sendChatHandler(){
  const u=currentUser(); const inp=document.getElementById('chatMsgInput'); const val=inp.value.trim();
  if(!val || !S.chatActive) return;
  const key=chatKey(u.id,S.chatActive);
  if(!S.chats[key]) S.chats[key]=[];
  S.chats[key].push({from:u.id,text:val,at:new Date().toISOString()});
  await persist('chats'); render();
  setTimeout(()=>{ const body=document.getElementById('chatBody'); if(body) body.scrollTop=body.scrollHeight; },30);
}

function bindModalEvents(){
  // tombol tutup (X, Batal, Tutup) — dipasang di sini karena modal baru ada di DOM setelah attachHandlers()
  document.querySelectorAll('[data-close-modal]').forEach(b=>b.addEventListener('click', ()=>{ S.modal=null; S.dropFiles=[]; render(); }));
  // new task
  document.querySelectorAll('#ntTypes span').forEach(s=>s.addEventListener('click', ()=>s.classList.toggle('active')));
  const saveNewTask=document.getElementById('saveNewTask');
  if(saveNewTask) saveNewTask.addEventListener('click', async ()=>{
    const u=currentUser(); const title=document.getElementById('ntTitle').value.trim(); const deadline=document.getElementById('ntDeadline').value;
    if(!title||!deadline){ toast('Judul dan batas waktu wajib diisi.','fa-triangle-exclamation'); return; }
    const types=[...document.querySelectorAll('#ntTypes span.active')].map(s=>s.dataset.type);
    const rubricRows=[...document.querySelectorAll('#rubricRows .rubric-row')].map(r=>({c:r.querySelector('span').textContent, m:Number(r.querySelector('input').value)||0}));
    const nt={ id:uid(), title, subject:document.getElementById('ntSubject').value, kelas:document.getElementById('ntKelas').value,
      desc:document.getElementById('ntDesc').value.trim(), deadline:new Date(deadline).toISOString(),
      maxSizeMB:Number(document.getElementById('ntMaxSize').value)||10, types:types.length?types:['PDF'],
      teacherId:u.id, teacherName:u.name, rubric:rubricRows.length?rubricRows:[{c:'Kelengkapan',m:100}], createdAt:new Date().toISOString() };
    S.tasks.unshift(nt); await persist('tasks'); logActivity(u.name,`membuat tugas baru "${title}"`);
    S.modal=null; S.tab='tugas'; render(); toast('Tugas baru berhasil dibuat!','fa-circle-check');
  });

  // submit / dropzone
  const dz=document.getElementById('dropZone'); const fi=document.getElementById('fileInput');
  if(dz){
    dz.addEventListener('click', ()=>fi.click());
    ['dragover','dragenter'].forEach(ev=>dz.addEventListener(ev, e=>{ e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev, e=>{ e.preventDefault(); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', e=>{ handleFiles(e.dataTransfer.files); });
    fi.addEventListener('change', e=>{ handleFiles(e.target.files); });
  }
  document.querySelectorAll('[data-rm-file]').forEach(b=>b.addEventListener('click', ()=>{ S.dropFiles.splice(Number(b.dataset.rmFile),1); S.modal.type==='submit'&&render(); }));
  const saveSubmission=document.getElementById('saveSubmission');
  if(saveSubmission) saveSubmission.addEventListener('click', async ()=>{
    const u=currentUser(); const tid=saveSubmission.dataset.tid; const t=S.tasks.find(x=>x.id===tid);
    const note=document.getElementById('subNote').value.trim();
    const existing=mySubmissionFor(tid);
    const files = S.dropFiles.length? S.dropFiles : (existing?existing.files:[]);
    if(!files.length && !note){ toast('Lampirkan file atau tulis catatan terlebih dahulu.','fa-triangle-exclamation'); return; }
    const late=deadlineInfo(t.deadline).late;
    if(existing){
      if(existing.status==='revision_requested') existing.revisions.push({note:existing.note,files:existing.files,submittedAt:existing.submittedAt});
      existing.files=files; existing.note=note; existing.submittedAt=new Date().toISOString(); existing.late=late; existing.status='submitted';
    } else {
      S.submissions.push({id:uid(),taskId:tid,studentId:u.id,studentName:u.name,files,note,submittedAt:new Date().toISOString(),late,status:'submitted',score:null,letter:null,feedback:null,rubricScores:{},revisions:[]});
    }
    await persist('submissions'); logActivity(u.name,`mengumpulkan tugas "${t.title}"`);
    S.modal=null; S.dropFiles=[]; render(); toast(late?'Tugas dikumpulkan (terlambat).':'Tugas berhasil dikumpulkan!','fa-paper-plane');
  });

  // review / grading
  document.querySelectorAll('[data-save-grade]').forEach(b=>b.addEventListener('click', async ()=>{
    const sid=b.dataset.saveGrade; const sub=S.submissions.find(x=>x.id===sid);
    const scoreInput=document.getElementById('score-'+sid);
    const score = scoreInput? Number(scoreInput.value) : sub.score;
    if(scoreInput && (scoreInput.value===''||isNaN(score)||score<0||score>100)){ toast('Masukkan nilai 0-100 yang valid.','fa-triangle-exclamation'); return; }
    sub.score=score; sub.letter = score>=90?'A':score>=80?'B':score>=70?'C':score>=60?'D':'E';
    sub.feedback=document.getElementById('fb-'+sid).value.trim(); sub.status='graded';
    await persist('submissions'); const u=currentUser(); logActivity(u.name,`memberi nilai untuk ${sub.studentName}`);
    render(); toast('Nilai tersimpan.','fa-circle-check');
  }));
  document.querySelectorAll('[data-req-revision]').forEach(b=>b.addEventListener('click', async ()=>{
    const sub=S.submissions.find(x=>x.id===b.dataset.reqRevision);
    const fb=document.getElementById('fb-'+sub.id); sub.feedback = (fb&&fb.value.trim()) || 'Mohon perbaiki dan kumpulkan ulang.';
    sub.status='revision_requested'; sub.score=null;
    await persist('submissions'); render(); toast('Revisi diminta ke siswa.','fa-rotate-left');
  }));

  const saveAnnounce=document.getElementById('saveAnnounce');
  if(saveAnnounce) saveAnnounce.addEventListener('click', async ()=>{
    const u=currentUser(); const title=document.getElementById('anTitle').value.trim(); const body=document.getElementById('anBody').value.trim();
    if(!title||!body){ toast('Judul dan isi wajib diisi.','fa-triangle-exclamation'); return; }
    S.announcements.unshift({id:uid(),title,body,author:u.name,role:u.role,createdAt:new Date().toISOString(),pinned:document.getElementById('anPinned').checked});
    await persist('announcements'); S.modal=null; render(); toast('Pengumuman dipublikasikan.','fa-bullhorn');
  });
}
function handleFiles(fileList){
  [...fileList].forEach(f=>S.dropFiles.push({name:f.name,size:f.size}));
  render();
}

// Tombol Esc menutup popup yang sedang terbuka
document.addEventListener('keydown', e=>{
  if(e.key!=='Escape') return;
  const g=document.getElementById('ovGoogle'); if(g){ g.remove(); return; }
  if(S.modal){ S.modal=null; S.dropFiles=[]; render(); }
});

init();
