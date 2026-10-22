/* ============================================================
   登录态：本机存储 + 服务端 token 校验（无感登录）
   ============================================================ */
const Auth = {
  key: 'token',
  userKey: 'user',

  get token() {
    try { return localStorage.getItem(this.key) || ''; } catch (e) { return ''; }
  },

  get user() {
    try { return JSON.parse(localStorage.getItem(this.userKey) || 'null'); } catch (e) { return null; }
  },

  save(token, user) {
    try {
      localStorage.setItem(this.key, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      localStorage.setItem('loginAt', String(Date.now()));
    } catch (e) {}
  },

  clear() {
    try {
      localStorage.removeItem(this.key);
      localStorage.removeItem(this.userKey);
    } catch (e) {}
  },

  get logged() {
    return !!this.token;
  },

  /** 静默校验：刷新页面时后台验一次，失效就清理 */
  async verify() {
    if (!this.token) return null;
    try {
      const r = await api('/me', { auth: true });
      this.save(this.token, r.user);
      return r.user;
    } catch (e) {
      if (/登录|401/.test(e.message)) {
        this.clear();
        return null;
      }
      return this.user;
    }
  },

  requireLogin(next) {
    if (!this.logged) {
      const target = next || location.pathname + location.search;
      location.href = 'login.html?next=' + encodeURIComponent(target);
      return false;
    }
    return true;
  },

  logout() {
    api('/logout', { method: 'POST', auth: false }).catch(() => {});
    this.clear();
  }
};

/** 渲染导航右侧（登录态相关） */
async function paintNav() {
  const box = document.getElementById('navActions');
  if (!box) return;
  const u = Auth.user;
  if (Auth.logged && u) {
    box.innerHTML = `
      <a href="contact.html">联系作者</a>
      <a href="messages.html">消息<span id="msgDot" style="display:none"></span></a>
      <a href="publish.html">发布</a>
      <a href="me.html">${esc(u.nickname || '我的')}</a>
      <a href="#" id="logoutBtn">退出</a>`;
    const btn = document.getElementById('logoutBtn');
    api('/notifications').then(r => {
      const d = document.getElementById('msgDot');
      if (d && r.unread > 0) {
        d.className = 'dot';
        d.textContent = r.unread > 99 ? '99+' : r.unread;
        d.style.display = 'inline-block';
      }
    }).catch(() => {});
    if (btn) btn.onclick = (e) => {
      e.preventDefault();
      Auth.logout();
      location.reload();
    };
  } else {
    box.innerHTML = `
      <a href="login.html">登录</a>
      <a class="primary" href="register.html">注册</a>`;
  }
}
