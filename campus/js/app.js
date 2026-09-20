/* ===== AIP-Campus App Logic v1.0.0 ===== */
const Icons = {
  search:'<svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  user:'<svg class="ic" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  users:'<svg class="ic" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  heart:'<svg class="ic" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  heartFilled:'<svg class="ic" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  comment:'<svg class="ic" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  bookmark:'<svg class="ic" viewBox="0 0 24 24"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
  image:'<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
  file:'<svg class="ic" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  smile:'<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>',
  at:'<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>',
  send:'<svg class="ic" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>',
  eye:'<svg class="ic" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  plus:'<svg class="ic" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  menu:'<svg class="ic" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  clock:'<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  tag:'<svg class="ic" viewBox="0 0 24 24"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/></svg>',
  megaphone:'<svg class="ic" viewBox="0 0 24 24"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
  sun:'<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  moon:'<svg class="ic" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  more:'<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
  flag:'<svg class="ic" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  ban:'<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
  undo:'<svg class="ic" viewBox="0 0 24 24"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
  reply:'<svg class="ic" viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>',
  shield:'<svg class="ic" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  logout:'<svg class="ic" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
};

const App = {
  icon(n){return Icons[n]||''},
  initLightbox(){
    if(document.querySelector('.lightbox'))return;
    var lb=document.createElement('div');
    lb.className='lightbox';
    lb.innerHTML='<span class="lightbox-close">&times;</span><img src="" alt="">';
    document.body.appendChild(lb);
    var img=lb.querySelector('img'),close=lb.querySelector('.lightbox-close');
    lb.addEventListener('click',function(){lb.classList.remove('open')});
    close.addEventListener('click',function(){lb.classList.remove('open')});
    document.addEventListener('click',function(e){
      var t=e.target;
      if(t.tagName==='IMG'&&t.closest('body')&&!t.closest('.lightbox')&&!t.closest('.logo-svg')){
        img.src=t.src;lb.classList.add('open');
      }
    });
  },
  initTheme(){
    const t=DB.getTheme();
    if(t==='dark')document.documentElement.setAttribute('data-theme','dark');
  },
  toggleTheme(){
    const cur=document.documentElement.getAttribute('data-theme');
    if(cur==='dark'){document.documentElement.removeAttribute('data-theme');DB.setTheme('light')}
    else{document.documentElement.setAttribute('data-theme','dark');DB.setTheme('dark')}
    var btn=document.querySelector('.theme-toggle');
    if(btn)btn.innerHTML=document.documentElement.getAttribute('data-theme')==='dark'?Icons.sun:Icons.moon;
  },
  initNav(active){
    const user=DB.getCurrentUser();
    const right=document.querySelector('.navbar-right');
    if(!right)return;
    let html=`<a href="search.html" class="auth-btn" title="Search" style="display:flex;align-items:center">${Icons.search}</a><button class="theme-toggle" onclick="App.toggleTheme()">${document.documentElement.getAttribute('data-theme')==='dark'?Icons.sun:Icons.moon}</button>`;
    if(user){
      html+=`<a href="my-a.html" class="user-chip">${user.avatar||user.username.charAt(0)} ${user.username}</a>`;
      html+=`<button class="auth-btn" onclick="DB.logout();location.href='login.html'">${Icons.logout}</button>`;
    }else{
      html+=`<a href="login.html" class="auth-btn">Sign In</a>`;
    }
    right.innerHTML=html;
    if(active){document.querySelectorAll('.navbar-links a').forEach(a=>{if(a.dataset.page===active)a.classList.add('active')})}
    this.setupBrandDropdown();
  },
  setupBrandDropdown(){
    var brand=document.getElementById('brandArea');
    if(!brand)return;
    var dd=document.createElement('div');
    dd.className='brand-dropdown';
    dd.innerHTML=
      '<a href="../index.html">A-Web Home</a>'+
      '<a href="../station/index.html">AIP-Station</a>'+
      '<div class="dd-sep">Journal</div>'+
      '<a href="../journal/paradox.html" class="dd-sub">Paradox</a>'+
      '<a href="../journal/Laurel.html" class="dd-sub">Laurel</a>';
    brand.style.position='relative';
    brand.appendChild(dd);
    var css=document.getElementById('brand-dropdown-css');
    if(!css){
      css=document.createElement('style');css.id='brand-dropdown-css';
      css.textContent=
        '.brand-dropdown{position:absolute;top:100%;left:0;min-width:200px;background:var(--card);border:1px solid var(--line);padding:8px 0;opacity:0;visibility:hidden;transform:translateY(-6px);transition:all 0.25s cubic-bezier(0.4,0,0.2,1);box-shadow:0 12px 40px rgba(0,0,0,0.1);z-index:100}'+
        '.navbar-brand:hover .brand-dropdown,.brand-dropdown:hover{opacity:1;visibility:visible;transform:translateY(0)}'+
        '.brand-dropdown a{display:block;padding:10px 20px;font-size:13px;color:var(--text);text-decoration:none;transition:background 0.15s}'+
        '.brand-dropdown a:hover{background:var(--mist,var(--soft,#f0f7f3))}'+
        '.brand-dropdown .dd-sub{padding-left:36px;font-size:12px;color:var(--text-mute)}'+
        '.brand-dropdown .dd-sep{padding:10px 20px 4px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-mute)}';
      document.head.appendChild(css);
    }
  },
  getParam(n){return new URLSearchParams(location.search).get(n)},
  esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')},
  nl2br(s){return this.esc(s).replace(/\n/g,'<br>')},
  renderContent(s){
    // Convert [img:base64...] markers to inline images, escape everything else
    if(!s)return '';
    var parts=s.split(/(\[img:[^\]]+\])/);
    var html='';
    for(var i=0;i<parts.length;i++){
      var m=parts[i].match(/^\[img:([^\]]+)\]$/);
      if(m){html+='<img src="'+m[1]+'" style="max-width:100%;border-radius:4px;margin:8px 0;cursor:zoom-in">';}
      else{html+=this.esc(parts[i]).replace(/\n/g,'<br>');}
    }
    return html;
  },
  renderMentions(t){return this.esc(t).replace(/@(\S+)/g,'<span style="color:var(--moss);font-weight:600;">@$1</span>')},
  async fileToBase64(file){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(file)})},
  insertImageAtCursor(textarea,dataUrl){
    var start=textarea.selectionStart,end=textarea.selectionEnd;
    var marker='[img:'+dataUrl+']';
    textarea.value=textarea.value.substring(0,start)+marker+textarea.value.substring(end);
    var pos=start+marker.length;
    textarea.focus();textarea.setSelectionRange(pos,pos);
    textarea.dispatchEvent(new Event('input'));
  },
  setupGlobalSearch(input,results){
    if(!input||!results)return;
    let timer;
    input.addEventListener('input',()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        const q=input.value.trim();
        if(!q){results.classList.remove('show');results.innerHTML='';return}
        const r=DB.searchAll(q);
        let html='';
        if(r.users.length)html+=r.users.map(u=>`<div class="search-result-item" onclick="location.href='user-profile.html?id=${u.id}'"><span class="search-result-type">User</span><span>${u.username}</span></div>`).join('');
        if(r.forums.length)html+=r.forums.map(f=>`<div class="search-result-item" onclick="location.href='forum-detail.html?id=${f.id}'"><span class="search-result-type">Forum</span><span>${f.name}</span></div>`).join('');
        if(r.clubs.length)html+=r.clubs.map(c=>`<div class="search-result-item" onclick="location.href='club-detail.html?id=${c.id}'"><span class="search-result-type">Club</span><span>${c.name}</span></div>`).join('');
        if(r.news.length)html+=r.news.map(n=>`<div class="search-result-item" onclick="location.href='news-detail.html?id=${n.id}'"><span class="search-result-type">News</span><span>${n.title}</span></div>`).join('');
        results.innerHTML=html||'<div style="padding:16px;color:var(--text-mute);font-size:13px;">No results</div>';
        results.classList.add('show');
      },200);
    });
    document.addEventListener('click',e=>{
      if(!results.contains(e.target)&&e.target!==input)results.classList.remove('show');
    });
  },
};
App.initTheme();
App.initLightbox();
DB.init();
DB.syncFromServer().then(()=>{if(typeof render==='function')render()});
