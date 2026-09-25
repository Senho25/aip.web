/* ===== AIP-Campus Data Layer v2.0 — incremental sync ===== */
const DB = {
  KEYS: {
    USERS:'aip_users', SESSION:'aip_session', FORUMS:'aip_forums', NEWS:'aip_news',
    CLUBS:'aip_clubs', FOLLOWS:'aip_follows_', USER_FOLLOWS:'aip_user_follows_',
    LIKES:'aip_likes_', NEWS_LIKES:'aip_news_likes_', NEWS_SAVES:'aip_news_saves_', NEWS_COMMENT_LIKES:'aip_nclikes_',
    BLOCKED:'aip_blocked_', REPORTS:'aip_reports', THEME:'aip_theme',
    INITED:'aip_campus_v1_2'
  },
  _get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},
  _set(k,v){localStorage.setItem(k,JSON.stringify(v));this._markDirty(k);this._schedulePush()},
  SB_URL:'https://nyrosucxqgdnmztykdir.supabase.co',
  SB_KEY:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cm9zdWN4cWdkbm16dHlrZGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NzUzNzAsImV4cCI6MjEwNTQ1MTM3MH0.Hvxb7YD1QezlKWlcJB7C0XIHNkVqQlSSv5XqitX06EQ',
  _dirty:new Set(),
  _pushTimer:null,
  _pullTimer:null,
  _pushing:false,
  ready:null,
  _markDirty(k){if(k!=='aip_theme'&&k!=='aip_campus_v1_2'&&k!=='aip_session')this._dirty.add(k)},
  _schedulePush(){
    clearTimeout(this._pushTimer);
    this._pushTimer=setTimeout(()=>this._push(),800);
  },
  _deepMerge(local,server){
    if(!local||!server||typeof local!=='object'||typeof server!=='object')return server||local;
    if(Array.isArray(local)&&Array.isArray(server))return this._mergeArrays(local,server);
    var out={};
    for(var k in server)out[k]=server[k];
    for(var k in local){
      if(k in out){
        if(Array.isArray(local[k])&&Array.isArray(out[k]))out[k]=this._mergeArrays(local[k],out[k]);
        else if(typeof local[k]==='object'&&typeof out[k]==='object'&&local[k]&&out[k])out[k]=this._deepMerge(local[k],out[k]);
        else{
          var lt=local.updatedAt||local.createdAt||0,st=out.updatedAt||out.createdAt||0;
          if(lt>=st)out[k]=local[k];
        }
      }else out[k]=local[k];
    }
    return out;
  },
  _mergeArrays(local,server){
    if(!Array.isArray(local)||!Array.isArray(server))return server||local;
    var map={};
    server.forEach(function(x){if(x&&x.id)map[x.id]=x});
    var self=this;
    local.forEach(function(x){
      if(!x||!x.id)return;
      if(!map[x.id])map[x.id]=x;
      else map[x.id]=self._deepMerge(x,map[x.id]);
    });
    return Object.keys(map).map(function(id){return map[id]});
  },
  async _push(){
    if(this._pushing||this._dirty.size===0)return;
    this._pushing=true;
    try{
      var r=await fetch(this.SB_URL+'/rest/v1/site_data?id=eq.1&select=data',{headers:{'apikey':this.SB_KEY}});
      var rows=await r.json();
      var serverData=(rows&&rows[0]&&rows[0].data)||{};
      var payload={};
      Array.from(this._dirty).forEach(function(k){
        try{payload[k]=JSON.parse(localStorage.getItem(k))}catch(e){}
      });
      for(var k in payload){
        if(serverData[k]!==undefined){
          payload[k]=this._mergeArrays(payload[k],serverData[k]);
        }
      }
      var merged=Object.assign({},serverData,payload);
      await fetch(this.SB_URL+'/rest/v1/site_data?id=eq.1',{
        method:'PUT',
        headers:{'apikey':this.SB_KEY,'Authorization':'Bearer '+this.SB_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
        body:JSON.stringify({id:1,data:merged})
      });
      this._dirty.clear();
    }catch(e){}
    this._pushing=false;
  },
  async _pull(){
    try{
      var r=await fetch(this.SB_URL+'/rest/v1/site_data?id=eq.1&select=data',{headers:{'apikey':this.SB_KEY}});
      var rows=await r.json();
      if(rows&&rows[0]&&rows[0].data){
        var d=rows[0].data;
        var changed=false;
        for(var k in d){
          if(k==='aip_session')continue;
          var local=localStorage.getItem(k);
          var serverStr=JSON.stringify(d[k]);
          if(local!==serverStr){
            if(Array.isArray(d[k])&&local){
              try{
                var merged=this._mergeArrays(JSON.parse(local),d[k]);
                localStorage.setItem(k,JSON.stringify(merged));
              }catch(e){localStorage.setItem(k,serverStr)}
            }else{
              localStorage.setItem(k,serverStr);
            }
            changed=true;
          }
        }
        if(changed&&typeof render==='function')render();
      }
    }catch(e){}
  },
  async syncFromServer(){
    try{
      var r=await fetch(this.SB_URL+'/rest/v1/site_data?id=eq.1&select=data',{headers:{'apikey':this.SB_KEY}});
      var rows=await r.json();
      if(rows&&rows[0]&&rows[0].data){
        var d=rows[0].data;
        for(var k in d){
          if(k==='aip_session')continue;
          var local=localStorage.getItem(k);
          if(local&&Array.isArray(d[k])){
            try{
              var merged=this._mergeArrays(JSON.parse(local),d[k]);
              localStorage.setItem(k,JSON.stringify(merged));
            }catch(e){localStorage.setItem(k,JSON.stringify(d[k]))}
          }else{
            localStorage.setItem(k,JSON.stringify(d[k]));
          }
        }
        return true;
      }
    }catch(e){}
    return false;
  },
  uid(){return 'id_'+Date.now()+'_'+Math.random().toString(36).slice(2,7)},

  async init(){
    if(this.ready)return this.ready;
    this.ready=(async()=>{
      var hadServer=await this.syncFromServer();
      if(!localStorage.getItem(this.KEYS.INITED)){
        if(!hadServer){this._seed()}
        localStorage.setItem(this.KEYS.INITED,'1');
      }
      this._pullTimer=setInterval(()=>this._pull(),8000);
    })();
    return this.ready;
  },
  _seed(){
    this._set(this.KEYS.USERS,[]);
    this._set(this.KEYS.FORUMS,[]);
    this._set(this.KEYS.NEWS,[]);
    this._set(this.KEYS.CLUBS,[]);
  },

  /* ===== Auth ===== */
  getUsers(){return this._get(this.KEYS.USERS,[])},
  getUserById(id){return this.getUsers().find(u=>u.id===id)||null},
  getUserByUsername(n){return this.getUsers().find(u=>u.username===n)},
  getCurrentUser(){const id=localStorage.getItem(this.KEYS.SESSION);return id?this.getUserById(id):null},
  login(username,password){
    const u=this.getUserByUsername(username);
    if(!u)return{ok:false,msg:'User not found'};
    if(u.password!==password)return{ok:false,msg:'Wrong password'};
    localStorage.setItem(this.KEYS.SESSION,u.id);
    return{ok:true,user:u};
  },
  register(username,email,password){
    if(this.getUserByUsername(username))return{ok:false,msg:'Username taken'};
    const users=this.getUsers();
    const u={id:this.uid(),username,email,password,avatar:username.charAt(0).toUpperCase(),bio:'',role:'member',createdAt:Date.now()};
    users.push(u);this._set(this.KEYS.USERS,users);
    localStorage.setItem(this.KEYS.SESSION,u.id);
    return{ok:true,user:u};
  },
  logout(){localStorage.removeItem(this.KEYS.SESSION)},

  /* ===== Forums ===== */
  getForums(){return this._get(this.KEYS.FORUMS,[])},
  getForum(id){return this.getForums().find(f=>f.id===id)||null},
  createForum(name,desc,tags,anon,image){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const forums=this.getForums();
    forums.push({id:this.uid(),name,description:desc,tags:tags||[],anonymous:!!anon,ownerId:u.id,heat:0,posts:[],createdAt:Date.now()});
    this._set(this.KEYS.FORUMS,forums);return{ok:true};
  },
  addForumPost(fid,content,images,files){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const forums=this.getForums();const f=forums.find(x=>x.id===fid);if(!f)return{ok:false,msg:'Forum not found'};
    f.posts.unshift({id:this.uid(),authorId:u.id,authorName:f.anonymous?'Anonymous':u.username,authorAvatar:u.avatar||u.username.charAt(0).toUpperCase(),content,images:images||[],files:files||[],likes:0,likedBy:[],recalled:false,createdAt:Date.now(),comments:[]});
    f.heat=(f.heat||0)+10;this._set(this.KEYS.FORUMS,forums);return{ok:true};
  },
  _findPost(fid,pid){const f=this.getForum(fid);return f?f.posts.find(p=>p.id===pid):null},
  isPostLiked(fid,pid){const u=this.getCurrentUser();if(!u)return false;const p=this._findPost(fid,pid);return p&&p.likedBy&&p.likedBy.includes(u.id)},
  togglePostLike(fid,pid){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const forums=this.getForums();const f=forums.find(x=>x.id===fid);if(!f)return{ok:false};
    const p=f.posts.find(x=>x.id===pid);if(!p)return{ok:false};
    p.likedBy=p.likedBy||[];
    if(p.likedBy.includes(u.id)){p.likedBy=p.likedBy.filter(i=>i!==u.id);p.likes=Math.max(0,p.likes-1)}
    else{p.likedBy.push(u.id);p.likes++}
    this._set(this.KEYS.FORUMS,forums);return{ok:true};
  },
  addPostComment(fid,pid,content){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const forums=this.getForums();const f=forums.find(x=>x.id===fid);if(!f)return{ok:false};
    const p=f.posts.find(x=>x.id===pid);if(!p)return{ok:false};
    p.comments.push({id:this.uid(),authorId:u.id,authorName:u.username,authorAvatar:u.avatar||u.username.charAt(0).toUpperCase(),content,likes:0,likedBy:[],replies:[],createdAt:Date.now()});
    this._set(this.KEYS.FORUMS,forums);return{ok:true};
  },
  addCommentReply(fid,pid,cid,content,replyTo){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const forums=this.getForums();const f=forums.find(x=>x.id===fid);if(!f)return{ok:false};
    const p=f.posts.find(x=>x.id===pid);const c=p.comments.find(x=>x.id===cid);if(!c)return{ok:false};
    c.replies.push({id:this.uid(),authorId:u.id,authorName:u.username,authorAvatar:u.avatar||u.username.charAt(0).toUpperCase(),content,replyTo,createdAt:Date.now()});
    this._set(this.KEYS.FORUMS,forums);return{ok:true};
  },
  canRecall(p){const u=this.getCurrentUser();return u&&p.authorId===u.id&&!p.recalled&&Date.now()-p.createdAt<=120000},
  recallPost(fid,pid){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const forums=this.getForums();const f=forums.find(x=>x.id===fid);const p=f.posts.find(x=>x.id===pid);
    if(!p)return{ok:false,msg:'Not found'};if(p.authorId!==u.id)return{ok:false,msg:'Not your post'};
    if(Date.now()-p.createdAt>120000)return{ok:false,msg:'Time expired'};
    p.recalled=true;p.content='[已撤回 / recalled]';this._set(this.KEYS.FORUMS,forums);return{ok:true};
  },

  /* ===== News ===== */
  getNews(){return this._get(this.KEYS.NEWS,[])},
  getNewsById(id){return this.getNews().find(n=>n.id===id)||null},
  publishNews(title,topic,slogan,content,clubId,attachments){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const news=this.getNews();
    let authorName=u.username,authorId=u.id,authorType='user';
    if(clubId){const c=this.getClubs().find(x=>x.id===clubId);if(c&&this.isClubAdmin(clubId)){authorName=c.name;authorId=clubId;authorType='club'}}
    news.unshift({id:this.uid(),title,topic:topic||'Announcement',slogan,content,authorId,authorName,authorType,clubId:clubId||null,views:0,likes:0,likedBy:[],canComment:true,attachments:attachments||[],comments:[],createdAt:Date.now()});
    this._set(this.KEYS.NEWS,news);return{ok:true,id:this.uid()};
  },
  incrementViews(id){const news=this.getNews();const n=news.find(x=>x.id===id);if(n){n.views++;this._set(this.KEYS.NEWS,news)}},
  isNewsLiked(id){const u=this.getCurrentUser();if(!u)return false;return this._get(this.KEYS.NEWS_LIKES+u.id,[]).includes(id)},
  toggleNewsLike(id){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const key=this.KEYS.NEWS_LIKES+u.id;let arr=this._get(key,[]);
    if(arr.includes(id))arr=arr.filter(x=>x!==id);else arr.push(id);
    this._set(key,arr);
    const news=this.getNews();const n=news.find(x=>x.id===id);if(n)n.likes=arr.includes(id)?(n.likes||0)+1:Math.max(0,(n.likes||0)-1);
    this._set(this.KEYS.NEWS,news);return{ok:true};
  },
  isNewsSaved(id){const u=this.getCurrentUser();if(!u)return false;return this._get(this.KEYS.NEWS_SAVES+u.id,[]).includes(id)},
  toggleNewsSave(id){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const key=this.KEYS.NEWS_SAVES+u.id;let arr=this._get(key,[]);
    if(arr.includes(id))arr=arr.filter(x=>x!==id);else arr.push(id);
    this._set(key,arr);return{ok:true};
  },
  getSavedNews(){const u=this.getCurrentUser();if(!u)return[];const ids=this._get(this.KEYS.NEWS_SAVES+u.id,[]);return this.getNews().filter(n=>ids.includes(n.id))},
  getMyNews(){const u=this.getCurrentUser();if(!u)return[];return this.getNews().filter(n=>n.authorId===u.id)},
  addNewsComment(nid,content){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const news=this.getNews();const n=news.find(x=>x.id===nid);if(!n)return{ok:false};
    n.comments.push({id:this.uid(),authorId:u.id,authorName:u.username,authorAvatar:u.avatar||u.username.charAt(0).toUpperCase(),content,likes:0,likedBy:[],createdAt:Date.now()});
    this._set(this.KEYS.NEWS,news);return{ok:true};
  },
  toggleNewsCommentLike(nid,cid){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const news=this.getNews();const n=news.find(x=>x.id===nid);const c=n.comments.find(x=>x.id===cid);
    if(!c)return{ok:false};
    c.likedBy=c.likedBy||[];
    if(c.likedBy.includes(u.id)){c.likedBy=c.likedBy.filter(i=>i!==u.id);c.likes=Math.max(0,c.likes-1)}
    else{c.likedBy.push(u.id);c.likes=(c.likes||0)+1}
    this._set(this.KEYS.NEWS,news);return{ok:true};
  },
  isNewsCommentLiked(nid,cid){const u=this.getCurrentUser();if(!u)return false;const n=this.getNewsById(nid);const c=n.comments.find(x=>x.id===cid);return c&&c.likedBy&&c.likedBy.includes(u.id)},

  /* ===== Clubs ===== */
  getClubs(){return this._get(this.KEYS.CLUBS,[])},
  getClub(id){return this.getClubs().find(c=>c.id===id)||null},
  createClub(name,desc,joinType){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const clubs=this.getClubs();
    clubs.push({id:this.uid(),name,description:desc,icon:name.charAt(0).toUpperCase(),founderId:u.id,founderName:u.username,joinType:joinType||'open',announcement:'',members:[{id:u.id,name:u.username,role:'admin'}],followers:[],updates:[],createdAt:Date.now()});
    this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  isClubAdmin(cid){const u=this.getCurrentUser();if(!u)return false;const c=this.getClub(cid);if(!c)return false;return c.founderId===u.id||(c.members||[]).some(m=>m.id===u.id&&m.role==='admin')},
  isClubMember(cid){const u=this.getCurrentUser();if(!u)return false;const c=this.getClub(cid);return c&&(c.members||[]).some(m=>m.id===u.id)},
  isClubFollower(cid){const u=this.getCurrentUser();if(!u)return false;const c=this.getClub(cid);return c&&(c.followers||[]).some(f=>f.id===u.id)},
  toggleFollowClub(cid){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);if(!c)return{ok:false,msg:'Club not found'};
    c.followers=c.followers||[];
    if(c.followers.some(f=>f.id===u.id)){c.followers=c.followers.filter(f=>f.id!==u.id);this._set(this.KEYS.CLUBS,clubs);return{ok:true,following:false}}
    c.followers.push({id:u.id,name:u.username});
    this._set(this.KEYS.CLUBS,clubs);return{ok:true,following:true};
  },
  joinClub(cid){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);if(!c)return{ok:false,msg:'Club not found'};
    if((c.members||[]).some(m=>m.id===u.id))return{ok:false,msg:'Already a member'};
    if(c.joinType==='invite')return{ok:false,msg:'Invite only'};
    if(c.joinType==='apply')return{ok:true,pending:true};
    c.members.push({id:u.id,name:u.username,role:'member'});
    this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  leaveClub(cid){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);if(!c)return{ok:false};
    if(c.founderId===u.id)return{ok:false,msg:'Founder cannot leave. Transfer or disband the club.'};
    c.members=(c.members||[]).filter(m=>m.id!==u.id);this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  disbandClub(cid){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);if(!c)return{ok:false,msg:'Club not found'};
    if(c.founderId!==u.id)return{ok:false,msg:'Only founder can disband'};
    clubs=clubs.filter(x=>x.id!==cid);this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  deleteClubUpdate(cid,uid){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);if(!c)return{ok:false};
    const up=c.updates.find(x=>x.id===uid);if(!up)return{ok:false};
    if(up.authorId!==u.id&&!this.isClubAdmin(cid))return{ok:false,msg:'Not authorized'};
    c.updates=c.updates.filter(x=>x.id!==uid);this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  addUpdateComment(cid,uid,text,parentId){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);const up=c.updates.find(x=>x.id===uid);
    if(!up)return{ok:false};
    up.comments=up.comments||[];
    up.comments.push({id:this.uid(),text,authorId:u.id,authorName:u.username,parentId:parentId||null,likes:0,likedBy:[],createdAt:Date.now()});
    this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  toggleUpdateCommentLike(cid,uid,cid2){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);const up=c.updates.find(x=>x.id===uid);
    if(!up||!up.comments)return{ok:false};
    const cm=up.comments.find(x=>x.id===cid2);if(!cm)return{ok:false};
    cm.likedBy=cm.likedBy||[];
    if(cm.likedBy.includes(u.id)){cm.likedBy=cm.likedBy.filter(i=>i!==u.id);cm.likes=Math.max(0,cm.likes-1)}
    else{cm.likedBy.push(u.id);cm.likes=(cm.likes||0)+1}
    this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  deleteUpdateComment(cid,uid,cid2){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);const up=c.updates.find(x=>x.id===uid);
    if(!up||!up.comments)return{ok:false};
    const cm=up.comments.find(x=>x.id===cid2);if(!cm)return{ok:false};
    if(cm.authorId!==u.id&&!this.isClubAdmin(cid))return{ok:false,msg:'Not authorized'};
    up.comments=up.comments.filter(x=>x.id!==cid2);this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  updateClubAnnouncement(cid,text){
    if(!this.isClubAdmin(cid))return{ok:false,msg:'Admin only'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);c.announcement=text;this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  addClubUpdate(cid,title,content,images,files){
    if(!this.isClubAdmin(cid))return{ok:false,msg:'Admin only'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);
    c.updates.unshift({id:this.uid(),title,content,images:images||[],files:files||[],authorId:this.getCurrentUser().id,createdAt:Date.now(),likes:0,likedBy:[]});
    this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  isClubUpdateLiked(cid,uid,updateId){const u=this.getCurrentUser();if(!u)return false;const c=this.getClub(cid);const up=c.updates.find(x=>x.id===updateId);return up&&up.likedBy&&up.likedBy.includes(u.id)},
  toggleClubUpdateLike(cid,updateId){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);const up=c.updates.find(x=>x.id===updateId);
    if(!up)return{ok:false};
    up.likedBy=up.likedBy||[];
    if(up.likedBy.includes(u.id)){up.likedBy=up.likedBy.filter(i=>i!==u.id);up.likes=Math.max(0,up.likes-1)}
    else{up.likedBy.push(u.id);up.likes=(up.likes||0)+1}
    this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  getUserClubs(){const u=this.getCurrentUser();if(!u)return[];return this.getClubs().filter(c=>(c.members||[]).some(m=>m.id===u.id))},
  getFollowedClubs(){const u=this.getCurrentUser();if(!u)return[];return this.getClubs().filter(c=>(c.followers||[]).some(f=>f.id===u.id))},

  /* ===== Follows ===== */
  getFollows(){const u=this.getCurrentUser();if(!u)return[];return this._get(this.KEYS.FOLLOWS+u.id,[])},
  toggleFollowClub(cid){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const key=this.KEYS.FOLLOWS+u.id;let arr=this._get(key,[]);
    if(arr.includes(cid))arr=arr.filter(x=>x!==cid);else arr.push(cid);
    this._set(key,arr);return{ok:true,following:arr.includes(cid)};
  },
  isFollowingClub(cid){return this.getFollows().includes(cid)},
  isFollowingUser(uid){const u=this.getCurrentUser();if(!u)return false;return this._get(this.KEYS.USER_FOLLOWS+u.id,[]).includes(uid)},
  toggleFollowUser(uid){
    const u=this.getCurrentUser();if(!u)return{ok:false,msg:'Sign in required'};
    const key=this.KEYS.USER_FOLLOWS+u.id;let arr=this._get(key,[]);
    if(arr.includes(uid))arr=arr.filter(x=>x!==uid);else arr.push(uid);
    this._set(key,arr);return{ok:true,following:arr.includes(uid)};
  },
  getFollowers(uid){const users=this.getUsers();const all=users.map(u=>u.id);
    return users.filter(u=>this._get(this.KEYS.USER_FOLLOWS+u.id,[]).includes(uid))},
  getFollowingUsers(uid){return this._get(this.KEYS.USER_FOLLOWS+uid,[]).map(id=>this.getUserById(id)).filter(Boolean)},

  /* ===== Search ===== */
  searchAll(q){
    q=q.toLowerCase();
    return{
      users:this.getUsers().filter(u=>u.username.toLowerCase().includes(q)).slice(0,8),
      forums:this.getForums().filter(f=>f.name.toLowerCase().includes(q)||(f.description||'').toLowerCase().includes(q)).slice(0,8),
      clubs:this.getClubs().filter(c=>c.name.toLowerCase().includes(q)||(c.description||'').toLowerCase().includes(q)).slice(0,8),
      news:this.getNews().filter(n=>n.title.toLowerCase().includes(q)).slice(0,5),
    };
  },

  /* ===== Theme ===== */
  getTheme(){return localStorage.getItem(this.KEYS.THEME)||'light'},
  setTheme(t){localStorage.setItem(this.KEYS.THEME,t)},

  /* ===== Utils ===== */
  timeAgo(ts){
    const s=(Date.now()-ts)/1000;
    if(s<60)return'just now';
    if(s<3600)return Math.floor(s/60)+'m ago';
    if(s<86400)return Math.floor(s/3600)+'h ago';
    if(s<2592000)return Math.floor(s/86400)+'d ago';
    return new Date(ts).toLocaleDateString();
  },
  formatDate(ts){return new Date(ts).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})},
  /* ===== Admin ===== */
  isAdmin(){const u=this.getCurrentUser();return u&&u.role==='admin'},
  togglePinNews(nid){
    const news=this.getNews();const n=news.find(x=>x.id===nid);if(!n)return{ok:false};
    n.pinned=!n.pinned;this._set(this.KEYS.NEWS,news);return{ok:true,pinned:!!n.pinned};
  },
  togglePinForumPost(fid,pid){
    const forums=this.getForums();const f=forums.find(x=>x.id===fid);if(!f)return{ok:false};
    const p=f.posts.find(x=>x.id===pid);if(!p)return{ok:false};
    p.pinned=!p.pinned;this._set(this.KEYS.FORUMS,forums);return{ok:true,pinned:!!p.pinned};
  },
  certifyClub(cid,certified){
    const clubs=this.getClubs();const c=clubs.find(x=>x.id===cid);if(!c)return{ok:false};
    c.certified=!!certified;this._set(this.KEYS.CLUBS,clubs);return{ok:true};
  },
  isClubCertified(cid){const c=this.getClub(cid);return !!(c&&c.certified)},
  toggleBanUser(uid,banned){
    const users=this.getUsers();const u=users.find(x=>x.id===uid);if(!u)return{ok:false};
    u.banned=!!banned;this._set(this.KEYS.USERS,users);return{ok:true};
  },
  getOnlineUsers(){
    const now=Date.now();
    return this.getUsers().filter(u=>u.lastActive&&now-u.lastActive<300000).slice(0,50);
  },
  getAdminStats(){
    return{
      users:this.getUsers().length,
      clubs:this.getClubs().length,
      news:this.getNews().length,
      forums:this.getForums().length,
      pinnedNews:this.getNews().filter(n=>n.pinned).length,
      certifiedClubs:this.getClubs().filter(c=>c.certified).length,
      bannedUsers:this.getUsers().filter(u=>u.banned).length
    };
  },
  toast(msg,type){
    let t=document.createElement('div');
    t.style.cssText='position:fixed;bottom:40px;left:50%;transform:translateX(-50%);padding:12px 24px;background:var(--forest-deep);color:#fff;font-size:13px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.2);';
    t.textContent=msg;document.body.appendChild(t);
    setTimeout(()=>t.remove(),2500);
  },
};
DB.init();
