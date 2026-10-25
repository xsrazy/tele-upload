const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tele Upload - Upload Files, Stored on Telegram</title>
<meta name="description" content="Tele Upload: upload files via the web, stored safely on Telegram + Drive. Up to 20 MB go to both, over 20 MB Drive only.">
<meta name="keywords" content="upload files, store files, telegram, tele upload, file sharing, file hosting">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0f766e">
<link rel="canonical" href="https://upload.xsrazy.web.id/">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="512x512" href="/favicon.png">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tele Upload">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="Tele Upload - Upload Files, Stored on Telegram">
<meta property="og:description" content="Upload files via the web, stored safely on Telegram + Drive. Up to 20 MB go to both, over 20 MB Drive only.">
<meta property="og:url" content="https://upload.xsrazy.web.id/">
<meta property="og:image" content="https://upload.xsrazy.web.id/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Tele Upload - Upload files, stored on Telegram">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Tele Upload - Upload Files, Stored on Telegram">
<meta name="twitter:description" content="Upload files via the web, stored safely on Telegram + Drive. Up to 20 MB go to both, over 20 MB Drive only.">
<meta name="twitter:image" content="https://upload.xsrazy.web.id/og.png">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"Tele Upload","url":"https://upload.xsrazy.web.id/","description":"Upload files via the web, stored safely on Telegram + Drive. Up to 20 MB go to both, over 20 MB Drive only.","applicationCategory":"UtilitiesApplication","operatingSystem":"Web","offers":{"@type":"Offer","price":"0","priceCurrency":"IDR"}}</script>
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: #f2f2f2; margin: 0; padding: 24px; color: #222; line-height: 1.6; }
  .wrap { background: #fff; max-width: 620px; margin: 0 auto; padding: 28px 30px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  h1 { font-size: 22px; margin: 0 0 4px 0; }
  .sub { color: #777; font-size: 13px; margin-bottom: 20px; }
  label { display: block; font-size: 14px; margin: 12px 0 4px 0; font-weight: bold; }
  input[type="file"], input[type="password"] { width: 100%; font-size: 14px; padding: 8px; box-sizing: border-box; }
  button { background: #0f766e; color: #fff; border: 0; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; margin-top: 16px; }
  #status { margin-top: 12px; font-size: 14px; color: #374151; }
  h2 { font-size: 17px; margin: 28px 0 8px 0; padding-bottom: 6px; border-bottom: 2px solid #eee; }
  .row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .row a { color: #0f766e; font-weight: bold; text-decoration: none; white-space: nowrap; }
  .del { background: #dc2626; color: #fff; border: 0; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; margin-left: 8px; }
  .note { font-size: 13px; color: #777; margin-top: 16px; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Tele Upload</h1>
  <div class="sub">Upload files, stored on Telegram + Drive. Up to 20 MB go to both, over 20 MB Drive only (max 100 MB).</div>
  <form id="up">
    <label for="file">Files (multiple allowed)</label>
    <input type="file" id="file" multiple required>
    <button type="submit">Upload</button>
    <button type="button" id="logout" style="background:#777;margin-left:8px;">Log out</button>
    <button type="button" id="logoutAll" style="background:#777;margin-left:8px;">Log out everywhere</button>
  </form>
  <div id="status"></div>
  <h2>File List</h2>
  <div id="list"><p>Loading...</p></div>
  <button type="button" id="more" style="display:none;margin-top:12px;">Load more</button>
  <p class="note">Files up to 20 MB are stored on Telegram + Drive, over 20 MB on Drive only (max 100 MB per file). Downloads are proxied through the server; the bot token is never shared with the browser. This page is locked with the upload key.</p>
</div>
<script>
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmt(n){if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';if(n<1073741824)return (n/1048576).toFixed(1)+' MB';return (n/1073741824).toFixed(1)+' GB';}
var loadedFiles=[];var totalFiles=0;
async function loadList(append){var off=append?loadedFiles.length:0;var el=document.getElementById('list');try{var r=await fetch('/api/list?limit=100&offset='+off);if(r.status===401){location.reload();return;}var d=await r.json();if(!r.ok){el.innerHTML='<p>Failed to load files'+(d&&d.error?' ('+esc(d.error)+')':'')+'.</p>';return;}totalFiles=d.total||0;if(!append)loadedFiles=[];loadedFiles=loadedFiles.concat(d.files||[]);renderList();}catch(e){el.innerHTML='<p>Failed to load files ('+esc(e.message)+').</p>';}}
function renderList(){var el=document.getElementById('list');if(!loadedFiles.length){el.innerHTML='<p>No files yet.</p>';}else{var h='';for(var i=0;i<loadedFiles.length;i++){var f=loadedFiles[i];h+='<div class="row"><span>'+esc(f.filename)+' ('+fmt(f.size)+')</span> <span><a href="/api/download/'+f.id+'">Download</a> <button class="del" onclick="doDelete('+f.id+',this)">Delete</button></span></div>';}el.innerHTML=h;}var m=document.getElementById('more');if(m)m.style.display=(loadedFiles.length<totalFiles)?'':'none';}
async function doUpload(ev){ev.preventDefault();var fi=document.getElementById('file');var st=document.getElementById('status');var btn=document.querySelector('#up button[type=submit]');if(window.__uploading)return;if(!fi.files.length){st.textContent='Select files first.';return;}window.__uploading=true;btn.disabled=true;var ok=0,fail=0;var lines=[];for(var i=0;i<fi.files.length;i++){var f=fi.files[i];if(f.size>100*1024*1024){fail++;lines.push('Failed: '+f.name+' (exceeds 100 MB Drive-only limit)');continue;}st.textContent='Uploading '+(i+1)+'/'+fi.files.length+': '+f.name+'...';var fd=new FormData();fd.append('file',f);try{var res=await (function(){return new Promise(function(resolve,reject){var xhr=new XMLHttpRequest();xhr.open('POST','/api/upload',true);xhr.upload.onprogress=function(ev){if(ev.lengthComputable){st.textContent='Uploading '+(i+1)+'/'+fi.files.length+': '+f.name+' ('+Math.round(ev.loaded/ev.total*100)+'%)...';}};xhr.onload=function(){var d=null;try{d=JSON.parse(xhr.responseText);}catch(e){}resolve({status:xhr.status,data:d});};xhr.onerror=function(){reject(new Error('Network error'));};xhr.send(fd);});})();if(res.status===401){st.innerHTML=lines.map(function(l){return esc(l);}).join('<br>')+'<br>Session expired. Please log in again.';setTimeout(function(){location.reload();},2000);return;}if(res.status<200||res.status>=300){fail++;lines.push('Failed: '+f.name+' ('+((res.data&&res.data.error)||res.status)+')');}else{ok++;lines.push('OK: '+f.name+(res.data&&res.data.drive_only?' (Drive only)':''));}}catch(e){fail++;lines.push('Failed: '+f.name+' ('+e.message+')');}if(i<fi.files.length-1){await new Promise(function(res2){setTimeout(res2,1200);});}}st.innerHTML=lines.map(function(l){return esc(l);}).join('<br>')+'<br>'+ok+' succeeded, '+fail+' failed.';fi.value='';window.__uploading=false;btn.disabled=false;if(ok>0)loadList();}
async function doDelete(id,btn){if(!confirm('Delete this file? It will also be deleted from Telegram and Drive.'))return;btn.disabled=true;var r;try{r=await fetch('/api/delete/'+id,{method:'DELETE'});}catch(e){alert('Delete failed: '+e.message);btn.disabled=false;return;}if(r.status===401){location.reload();return;}var d=null;try{d=await r.json();}catch(e){alert('Delete failed: bad response');btn.disabled=false;return;}if(!r.ok){alert('Delete failed: '+((d&&d.error)||r.status));btn.disabled=false;return;}loadList();}
document.getElementById('up').addEventListener('submit',doUpload);document.getElementById('logout').addEventListener('click',async function(){await fetch('/api/logout',{method:'POST'});location.reload();});document.getElementById('logoutAll').addEventListener('click',async function(){if(!confirm('Log out from all devices?'))return;await fetch('/api/logout-all',{method:'POST'});location.reload();});document.getElementById('more').addEventListener('click',function(){loadList(true);});document.getElementById('file').addEventListener('change',function(){var st=document.getElementById('status');if(!this.files.length){st.textContent='';return;}var ls=[];for(var i=0;i<this.files.length;i++){var f=this.files[i];ls.push(esc(f.name)+' ('+fmt(f.size)+(f.size>20*1024*1024?' - Drive only':'')+')');}st.innerHTML=ls.join('<br>');});loadList();
</script>
</body>
</html>`;

const LOCK = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tele Upload - Locked</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Tele Upload: upload files via the web, stored safely on Telegram + Drive. Up to 20 MB go to both, over 20 MB Drive only.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tele Upload">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="Tele Upload - Upload Files, Stored on Telegram">
<meta property="og:description" content="Upload files via the web, stored safely on Telegram + Drive. Up to 20 MB go to both, over 20 MB Drive only.">
<meta property="og:url" content="https://upload.xsrazy.web.id/">
<meta property="og:image" content="https://upload.xsrazy.web.id/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Tele Upload - Upload files, stored on Telegram">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Tele Upload - Upload Files, Stored on Telegram">
<meta name="twitter:description" content="Upload files via the web, stored safely on Telegram + Drive. Up to 20 MB go to both, over 20 MB Drive only.">
<meta name="twitter:image" content="https://upload.xsrazy.web.id/og.png">
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: #f2f2f2; margin: 0; padding: 24px; color: #222; line-height: 1.6; }
  .wrap { background: #fff; max-width: 420px; margin: 60px auto 0 auto; padding: 28px 30px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  h1 { font-size: 22px; margin: 0 0 4px 0; }
  .sub { color: #777; font-size: 13px; margin-bottom: 20px; }
  label { display: block; font-size: 14px; margin: 12px 0 4px 0; font-weight: bold; }
  input[type="password"] { width: 100%; font-size: 14px; padding: 8px; box-sizing: border-box; }
  button { background: #0f766e; color: #fff; border: 0; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; margin-top: 16px; }
  #err { margin-top: 12px; font-size: 14px; color: #dc2626; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Tele Upload</h1>
  <div class="sub">This page is locked. Enter the upload key to open it.</div>
  <form id="lk">
    <label for="key">Upload key</label>
    <input type="password" id="key" required autofocus>
    <button type="submit">Open</button>
  </form>
  <div id="err"></div>
</div>
<script>
document.getElementById('lk').addEventListener('submit',async function(ev){ev.preventDefault();var k=document.getElementById('key').value;var e=document.getElementById('err');e.textContent='Checking...';try{var r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:k})});if(r.ok){location.reload();}else if(r.status===429){e.textContent='Too many attempts. Try again later.';}else{e.textContent='Wrong key.';}}catch(err){e.textContent='Failed: '+err.message;}});
</script>
</body>
</html>`;

const EXPIRED_PAGE = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Session expired</title><meta http-equiv="refresh" content="2;url=/"></head><body><p>Session expired. Redirecting to login...</p><p><a href="/">Open Tele Upload</a></p></body></html>`;

const MAX_SIZE = 20 * 1024 * 1024;
const DRIVE_MAX_SIZE = 100 * 1024 * 1024;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'content-type': 'application/json;charset=utf-8' },
  });
}

function getCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  const parts = raw.split(';');
  for (const p of parts) {
    const i = p.indexOf('=');
    if (i === -1) continue;
    if (p.slice(0, i).trim() === name) return p.slice(i + 1).trim();
  }
  return null;
}

async function hasSession(request, env) {
  const token = getCookie(request, 'tu_session');
  if (!token) return false;
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('session:' + token).first();
  if (!row) return false;
  const exp = Number(row.value);
  if (!exp || exp < Date.now()) {
    await env.DB.prepare('DELETE FROM settings WHERE key = ?').bind('session:' + token).run();
    return false;
  }
  return true;
}

async function isAuthed(request, env) {
  const key = request.headers.get('x-upload-key');
  if (env.UPLOAD_KEY && key === env.UPLOAD_KEY) return true;
  return hasSession(request, env);
}

function getClientIp(request) {
  return request.headers.get('cf-connecting-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

async function checkRateLimit(env, ip) {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('ratelimit:' + ip).first();
  if (!row) return false;
  let v;
  try { v = JSON.parse(row.value); } catch (e) { return false; }
  if (!v || !v.resetAt || Date.now() >= v.resetAt) return false;
  return v.count >= 5;
}

async function recordRateFail(env, ip) {
  const now = Date.now();
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('ratelimit:' + ip).first();
  let v = null;
  try { v = row ? JSON.parse(row.value) : null; } catch (e) { v = null; }
  if (!v || !v.resetAt || now >= v.resetAt) {
    v = { count: 1, resetAt: now + 15 * 60 * 1000 };
  } else {
    v.count += 1;
  }
  await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind('ratelimit:' + ip, JSON.stringify(v)).run();
}

async function clearRateFails(env, ip) {
  await env.DB.prepare('DELETE FROM settings WHERE key = ?').bind('ratelimit:' + ip).run();
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch (e) {
    return {};
  }
}

async function driveDownloadResponse(env, row, rangeHeader) {
  try {
    const token = await driveAccessToken(env);
    if (!token) return null;
    const inHeaders = { authorization: 'Bearer ' + token };
    if (rangeHeader) inHeaders.range = rangeHeader;
    const dvRes = await fetch(
      'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(row.drive_file_id) + '?alt=media',
      { headers: inHeaders }
    );
    if (!dvRes.ok) return null;
    const safeName = String(row.filename).replace(/["\r\n]/g, '');
    const outHeaders = {
      'content-type': row.mime || 'application/octet-stream',
      'content-disposition': 'attachment; filename="' + safeName + '"; filename*=UTF-8\'\'' + encodeURIComponent(row.filename),
      'accept-ranges': 'bytes',
    };
    const len = dvRes.headers.get('content-length');
    if (len) outHeaders['content-length'] = len;
    const cr = dvRes.headers.get('content-range');
    if (cr) outHeaders['content-range'] = cr;
    return new Response(dvRes.body, { status: dvRes.status, headers: outHeaders });
  } catch (e) {
    return null;
  }
}

async function driveAccessToken(env) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'client_id=' + encodeURIComponent(env.GOOGLE_CLIENT_ID) +
      '&client_secret=' + encodeURIComponent(env.GOOGLE_CLIENT_SECRET) +
      '&refresh_token=' + encodeURIComponent(env.GOOGLE_REFRESH_TOKEN) +
      '&grant_type=refresh_token',
  });
  const data = await safeJson(res);
  return data.access_token || null;
}

async function driveGetFolderId(env) {
  if (env.DRIVE_FOLDER_ID) return env.DRIVE_FOLDER_ID;
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'drive_folder_id'").first();
  if (row) return row.value;
  return null;
}

async function driveEnsureFolder(env, token) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Upload-tele', mimeType: 'application/vnd.google-apps.folder', parents: ['root'] }),
  });
  const data = await safeJson(res);
  if (!data.id) return null;
  await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('drive_folder_id', ?) ON CONFLICT(key) DO NOTHING").bind(data.id).run();
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'drive_folder_id'").first();
  if (row && row.value) {
    if (row.value !== data.id) {
      try {
        await fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(data.id), {
          method: 'DELETE',
          headers: { authorization: 'Bearer ' + token },
        });
      } catch (e) {}
    }
    return row.value;
  }
  await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('drive_folder_id', ?)").bind(data.id).run();
  return data.id;
}

async function driveUpload(env, file, folderId, token) {
  const boundary = 'tele-upload-' + Math.random().toString(36).slice(2);
  const meta = JSON.stringify({ name: file.name, parents: [folderId] });
  const body = new Blob([
    '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta +
    '\r\n--' + boundary + '\r\nContent-Type: ' + (file.type || 'application/octet-stream') + '\r\n\r\n',
    file,
    '\r\n--' + boundary + '--',
  ], { type: 'multipart/related; boundary=' + boundary });
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token },
    body,
  });
  const data = await safeJson(res);
  return data.id || null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (
      url.pathname === '/favicon.ico' ||
      url.pathname === '/favicon.svg' ||
      url.pathname === '/favicon.png' ||
      url.pathname === '/apple-touch-icon.png' ||
      url.pathname === '/og.png'
    ) {
      return env.ASSETS.fetch(request);
    }

    if (url.pathname === '/' && request.method === 'GET') {
      if (!(await hasSession(request, env))) {
        return new Response(LOCK, { headers: { 'content-type': 'text/html;charset=utf-8' } });
      }
      return new Response(PAGE, { headers: { 'content-type': 'text/html;charset=utf-8' } });
    }

    if (url.pathname === '/api/login' && request.method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const ip = getClientIp(request);
      if (await checkRateLimit(env, ip)) {
        return json({ error: 'Too many attempts. Try again later.' }, 429);
      }
      if (!env.UPLOAD_KEY || body.key !== env.UPLOAD_KEY) {
        await recordRateFail(env, ip);
        return json({ error: 'Wrong key.' }, 401);
      }
      await clearRateFails(env, ip);
      await env.DB.prepare("DELETE FROM settings WHERE key LIKE 'session:%' AND CAST(value AS INTEGER) < ?").bind(Date.now()).run();
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      const token = Array.from(bytes, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').bind('session:' + token, String(exp)).run();
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          'content-type': 'application/json;charset=utf-8',
          'set-cookie': 'tu_session=' + token + '; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=' + (30 * 24 * 60 * 60),
        },
      });
    }

    if (url.pathname === '/api/logout' && request.method === 'POST') {
      const token = getCookie(request, 'tu_session');
      if (token) {
        await env.DB.prepare('DELETE FROM settings WHERE key = ?').bind('session:' + token).run();
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          'content-type': 'application/json;charset=utf-8',
          'set-cookie': 'tu_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0',
        },
      });
    }

    if (url.pathname === '/api/logout-all' && request.method === 'POST') {
      if (!(await isAuthed(request, env))) {
        return json({ error: 'Wrong upload key.' }, 401);
      }
      await env.DB.prepare("DELETE FROM settings WHERE key LIKE 'session:%'").run();
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          'content-type': 'application/json;charset=utf-8',
          'set-cookie': 'tu_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0',
        },
      });
    }

    if (url.pathname === '/api/list' && request.method === 'GET') {
      if (!(await isAuthed(request, env))) {
        return json({ error: 'Wrong key.' }, 401);
      }
      const limitRaw = parseInt(url.searchParams.get('limit') || '100', 10);
      const offsetRaw = parseInt(url.searchParams.get('offset') || '0', 10);
      const limit = Math.min(Math.max(isNaN(limitRaw) ? 100 : limitRaw, 1), 200);
      const offset = Math.max(isNaN(offsetRaw) ? 0 : offsetRaw, 0);
      const rows = await env.DB.prepare(
        'SELECT id, filename, mime, size, created_at FROM files ORDER BY id DESC LIMIT ? OFFSET ?'
      ).bind(limit, offset).all();
      const tot = await env.DB.prepare('SELECT COUNT(*) as c FROM files').first();
      return json({ files: rows.results || [], total: tot ? tot.c : 0 });
    }

    if (url.pathname === '/api/upload' && request.method === 'POST') {
      if (!(await isAuthed(request, env))) {
        return json({ error: 'Wrong upload key.' }, 401);
      }
      let form;
      try {
        form = await request.formData();
      } catch (e) {
        return json({ error: 'Invalid form.' }, 400);
      }
      const file = form.get('file');
      if (!file || typeof file === 'string') {
        return json({ error: 'No file.' }, 400);
      }
      const driveOnly = file.size > MAX_SIZE;
      if (file.size > DRIVE_MAX_SIZE) {
        return json({ error: 'File exceeds the 100 MB Drive-only limit.' }, 413);
      }
      const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN);
      if (driveOnly && !googleConfigured) {
        return json({ error: 'Files over 20 MB can only go to Drive, but Drive is not configured.' }, 502);
      }
      let tgData = null;
      if (!driveOnly) {
        if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHANNEL_ID) {
          return json({ error: 'Not configured: bot token / channel not set.' }, 500);
        }
        let tgStatus = 0;
        for (let attempt = 0; attempt < 2; attempt++) {
          const tg = new FormData();
          tg.append('chat_id', env.TELEGRAM_CHANNEL_ID);
          tg.append('document', file, file.name);
          tg.append('caption', file.name.slice(0, 200));
          try {
            const tgRes = await fetch(
              'https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendDocument',
              { method: 'POST', body: tg }
            );
            tgStatus = tgRes.status;
            tgData = await tgRes.json();
          } catch (e) {
            tgData = { ok: false, description: 'Network error: ' + e.message };
            tgStatus = 0;
            break;
          }
          if (tgData.ok) {
            break;
          }
          if (
            tgData.error_code === 429 &&
            tgData.parameters &&
            tgData.parameters.retry_after &&
            attempt === 0
          ) {
            const waitMs = Math.min(tgData.parameters.retry_after, 30) * 1000;
            await new Promise(function (res) { setTimeout(res, waitMs); });
            continue;
          }
          break;
        }
        if (!tgData.ok) {
          return json({ error: 'Telegram rejected the upload: ' + (tgData.description || tgStatus) }, 502);
        }
      }
      const doc = driveOnly ? null : tgData.result.document;
      const now = new Date().toISOString();
      let meta;
      try {
        meta = await env.DB.prepare(
          'INSERT INTO files (filename, mime, size, file_id, message_id, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        )
          .bind(file.name, file.type || '', file.size, driveOnly ? '' : doc.file_id, driveOnly ? 0 : tgData.result.message_id, now)
          .run();
      } catch (e) {
        if (!driveOnly && tgData) {
          try {
            await fetch(
              'https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/deleteMessage',
              {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ chat_id: env.TELEGRAM_CHANNEL_ID, message_id: tgData.result.message_id }),
              }
            );
          } catch (e2) {}
        }
        return json({ error: 'Failed to save file record.' }, 502);
      }
      let driveFileId = null;
      let driveError = null;
      if (googleConfigured) {
        try {
          const token = await driveAccessToken(env);
          if (token) {
            let folderId = await driveGetFolderId(env);
            if (!folderId) {
              folderId = await driveEnsureFolder(env, token);
            }
            if (folderId) {
              driveFileId = await driveUpload(env, file, folderId, token);
              if (!driveFileId) driveError = 'Drive upload failed.';
            } else {
              driveError = 'Drive folder not found.';
            }
          } else {
            driveError = 'Failed to refresh the Drive token.';
          }
        } catch (e) {
          driveError = 'Drive error: ' + e.message;
        }
      }
      if (driveFileId) {
        try {
          await env.DB.prepare('UPDATE files SET drive_file_id = ? WHERE id = ?').bind(driveFileId, meta.meta.last_row_id).run();
        } catch (e) {
          let cleanupOk = true;
          try {
            const token2 = await driveAccessToken(env);
            if (token2) {
              const delRes = await fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(driveFileId), {
                method: 'DELETE',
                headers: { authorization: 'Bearer ' + token2 },
              });
              if (!delRes.ok) cleanupOk = false;
            } else {
              cleanupOk = false;
            }
          } catch (e2) {
            cleanupOk = false;
          }
          driveError = cleanupOk ? 'Failed to save Drive reference.' : 'Failed to save Drive reference; Drive copy may remain orphaned.';
          driveFileId = null;
        }
      }
      return json({
        ok: true,
        id: meta.meta.last_row_id,
        filename: file.name,
        size: file.size,
        download: '/api/download/' + meta.meta.last_row_id,
        drive_only: driveOnly,
        drive_file_id: driveFileId,
        drive_error: driveError,
      });
    }

    if (url.pathname.startsWith('/api/delete/') && request.method === 'DELETE') {
      if (!(await isAuthed(request, env))) {
        return json({ error: 'Wrong upload key.' }, 401);
      }
      const id = url.pathname.replace('/api/delete/', '');
      const row = await env.DB.prepare('SELECT * FROM files WHERE id = ?').bind(id).first();
      if (!row) {
        return json({ error: 'File not found.' }, 404);
      }
      let tgGone = true;
      if (row.message_id && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHANNEL_ID) {
        let delData;
        try {
          const delRes = await fetch(
            'https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/deleteMessage',
            {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ chat_id: env.TELEGRAM_CHANNEL_ID, message_id: row.message_id }),
            }
          );
          delData = await delRes.json();
        } catch (e) {
          return json({ error: 'Failed to delete from Telegram: Network error.' }, 502);
        }
        tgGone = delData.ok;
        if (!delData.ok) {
          const desc = delData.description || '';
          if (desc.indexOf('message to delete not found') !== -1) {
            tgGone = true;
          } else {
            return json({ error: 'Failed to delete from Telegram: ' + desc }, 502);
          }
        }
      }
      let driveDeleted = null;
      if (row.drive_file_id) {
        if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) {
          return json({ error: 'Drive is not configured.' }, 502);
        }
        try {
          const token = await driveAccessToken(env);
          if (!token) {
            return json({ error: 'Failed to refresh the Drive token.' }, 502);
          }
          const dvDel = await fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(row.drive_file_id), {
            method: 'DELETE',
            headers: { authorization: 'Bearer ' + token },
          });
          if (!dvDel.ok) {
            return json({ error: 'Failed to delete from Drive.' }, 502);
          }
          driveDeleted = true;
        } catch (e) {
          return json({ error: 'Failed to delete from Drive: ' + e.message }, 502);
        }
      }
      await env.DB.prepare('DELETE FROM files WHERE id = ?').bind(id).run();
      return json({ ok: true, id: Number(id), telegram_deleted: tgGone, drive_deleted: driveDeleted });
    }

    if (url.pathname.startsWith('/api/download/') && request.method === 'GET') {
      if (!(await isAuthed(request, env))) {
        const accept = request.headers.get('accept') || '';
        if (accept.indexOf('text/html') !== -1) {
          return new Response(EXPIRED_PAGE, { status: 401, headers: { 'content-type': 'text/html;charset=utf-8' } });
        }
        return json({ error: 'Wrong key.' }, 401);
      }
      const id = url.pathname.replace('/api/download/', '');
      const row = await env.DB.prepare('SELECT * FROM files WHERE id = ?').bind(id).first();
      if (!row) {
        return json({ error: 'File not found.' }, 404);
      }
      const rangeHeader = request.headers.get('range');
      if (!row.file_id && row.drive_file_id) {
        if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) {
          return json({ error: 'Drive is not configured.' }, 500);
        }
        const dvResp = await driveDownloadResponse(env, row, rangeHeader);
        if (!dvResp) {
          return json({ error: 'Failed to download the file from Drive.' }, 502);
        }
        return dvResp;
      }
      if (!env.TELEGRAM_BOT_TOKEN) {
        return json({ error: 'Not configured.' }, 500);
      }
      let fileRes = null;
      let tgErr = null;
      try {
        const gfRes = await fetch(
          'https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/getFile?file_id=' + encodeURIComponent(row.file_id)
        );
        const gfData = await gfRes.json();
        if (!gfData.ok) {
          throw new Error('Failed to fetch the file from Telegram.');
        }
        const tgHeaders = rangeHeader ? { range: rangeHeader } : undefined;
        fileRes = await fetch(
          'https://api.telegram.org/file/bot' + env.TELEGRAM_BOT_TOKEN + '/' + gfData.result.file_path,
          tgHeaders ? { headers: tgHeaders } : {}
        );
        if (!fileRes.ok) {
          throw new Error('Failed to download the file from Telegram.');
        }
      } catch (e) {
        tgErr = e;
      }
      if (!tgErr && fileRes) {
        const safeName = String(row.filename).replace(/["\r\n]/g, '');
        const outHeaders = {
          'content-type': row.mime || 'application/octet-stream',
          'content-disposition': 'attachment; filename="' + safeName + '"; filename*=UTF-8\'\'' + encodeURIComponent(row.filename),
          'accept-ranges': 'bytes',
        };
        const len = fileRes.headers.get('content-length');
        if (len) outHeaders['content-length'] = len;
        const cr = fileRes.headers.get('content-range');
        if (cr) outHeaders['content-range'] = cr;
        return new Response(fileRes.body, { status: fileRes.status, headers: outHeaders });
      }
      if (row.drive_file_id && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN) {
        const dvResp = await driveDownloadResponse(env, row, rangeHeader);
        if (dvResp) {
          return dvResp;
        }
      }
      return json({ error: tgErr ? tgErr.message : 'Failed to download the file from Telegram.' }, 502);
    }

    return json({ error: 'Not found.' }, 404);
  },
};
