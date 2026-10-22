/* ============================================================
   API 封装
   ============================================================ */
const API_BASE = 'https://119.91.29.16:8444/api';

async function api(path, opts = {}) {
  const { method = 'GET', body, auth = true } = opts;
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (auth && token) headers['Authorization'] = 'Bearer ' + token;

  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    });
  } catch (e) {
    throw new Error('网络连接失败，请检查网络后重试');
  }

  let data = {};
  try { data = await res.json(); } catch (e) {}

  if (res.status === 401) {
    Auth.clear();
    throw new Error(data.msg || '请先登录');
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data.msg || ('请求失败（' + res.status + '）'));
  }
  return data;
}

/* 工具 */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function priceText(p) {
  const n = Number(p || 0);
  if (!n) return '面议';
  return '¥' + (n % 1 === 0 ? n : n.toFixed(2));
}

function timeAgo(ts) {
  if (!ts) return '';
  const t = new Date(ts.replace(/-/g, '/')).getTime();
  const d = Math.floor((Date.now() - t) / 1000);
  if (d < 60) return '刚刚';
  if (d < 3600) return Math.floor(d / 60) + ' 分钟前';
  if (d < 86400) return Math.floor(d / 3600) + ' 小时前';
  if (d < 86400 * 7) return Math.floor(d / 86400) + ' 天前';
  return ts.slice(5, 10);
}

function toast(msg, ms = 2000) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function go(url) { location.href = url; }
