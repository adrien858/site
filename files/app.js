// =============================================
// APP.JS — Logique principale FreePlay
// =============================================

// ── État global ──
let state = {
  platform: 'all',
  category: 'all',
  search: '',
};

// ── Helpers de couleur par rôle ──
function roleColor(role) {
  const c = { membre:'#7878a0', moderateur:'#00e5ff', admin:'#ffbe00', fondateur:'#ff3c5f' };
  return c[role] || '#7878a0';
}
function roleIcon(role) {
  const i = { membre:'👤', moderateur:'🛡️', admin:'⚙️', fondateur:'👑' };
  return i[role] || '👤';
}
function roleLabel(role) {
  const l = { membre:'Membre', moderateur:'Modérateur', admin:'Admin', fondateur:'Fondateur' };
  return l[role] || role;
}
function avatarBg(pseudo) {
  const colors = ['#ff3c5f','#ff9500','#ffbe00','#00c470','#00e5ff','#007aff','#af52de'];
  let h = 0; for (let c of pseudo) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

// ══════════════════════════════════
// PAGES
// ══════════════════════════════════
function showPage(page) {
  if (page === 'admin' && !Auth.isAdmin()) {
    alert('Accès réservé aux administrateurs.');
    page = 'home';
  }
  document.getElementById('pagHome').style.display  = page === 'home'  ? '' : 'none';
  document.getElementById('pagAdmin').style.display = page === 'admin' ? '' : 'none';
  document.getElementById('siteFooter').style.display = page === 'admin' ? 'none' : '';
  if (page === 'admin') adminTab('users');
  window.scrollTo(0, 0);
}

// ══════════════════════════════════
// AUTH UI
// ══════════════════════════════════
function renderHeaderAuth() {
  const el = document.getElementById('headerAuth');
  const u  = Auth.currentUser();
  if (!u) {
    el.innerHTML = `
      <button class="btn-login"    onclick="showAuthModal('login')">Connexion</button>
      <button class="btn-register" onclick="showAuthModal('register')">S'inscrire</button>`;
  } else {
    const bg    = avatarBg(u.pseudo);
    const admin = Auth.isAdmin();
    el.innerHTML = `
      ${admin ? `<button class="btn-admin" onclick="showPage('admin')">⚙️ Panel</button>` : ''}
      <div class="user-chip" onclick="showProfileModal()">
        <div class="user-avatar" style="background:${bg}">${roleIcon(u.role)}</div>
        <span class="user-pseudo">${u.pseudo}</span>
        <span class="role-badge" style="background:${roleColor(u.role)}22;color:${roleColor(u.role)}">${roleLabel(u.role)}</span>
      </div>`;
  }
}

// ── Modal Auth ──
function showAuthModal(tab = 'login') {
  document.getElementById('authModal').classList.add('open');
  switchTab(tab);
}
function hideAuthModal() { document.getElementById('authModal').classList.remove('open'); }
function closeAuthModal(e) { if (e.target.id === 'authModal') hideAuthModal(); }
function switchTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('formLogin').style.display    = tab === 'login'    ? '' : 'none';
  document.getElementById('formRegister').style.display = tab === 'register' ? '' : 'none';
}

async function doLogin() {
  const pseudo   = document.getElementById('loginPseudo').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  errEl.textContent = '';
  const r = await Auth.login(pseudo, password);
  if (!r.ok) { errEl.textContent = r.error; return; }
  hideAuthModal();
  renderHeaderAuth();
}

async function doRegister() {
  const pseudo   = document.getElementById('regPseudo').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const errEl    = document.getElementById('registerError');
  errEl.textContent = '';
  const r = await Auth.register(pseudo, email, password);
  if (!r.ok) { errEl.textContent = r.error; return; }
  // Auto-login
  await Auth.login(pseudo, password);
  hideAuthModal();
  renderHeaderAuth();
}

// ── Modal Profil ──
function showProfileModal() {
  const u = Auth.currentUser();
  if (!u) return;
  const bg = avatarBg(u.pseudo);
  document.getElementById('profileContent').innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar" style="background:${bg}">${roleIcon(u.role)}</div>
      <div>
        <div class="profile-pseudo">${u.pseudo}</div>
        <span class="role-badge profile-role" style="background:${roleColor(u.role)}22;color:${roleColor(u.role)}">${roleIcon(u.role)} ${roleLabel(u.role)}</span>
      </div>
    </div>
    <div class="profile-info">
      <div>ID : <span class="td-id">${u.id}</span></div>
      <div style="margin-top:8px">Rôle : <span>${roleLabel(u.role)}</span></div>
    </div>
    <button class="btn-logout" onclick="doLogout()">Se déconnecter</button>`;
  document.getElementById('profileModal').classList.add('open');
}
function hideProfileModal() { document.getElementById('profileModal').classList.remove('open'); }
function closeProfileModal(e) { if (e.target.id === 'profileModal') hideProfileModal(); }
function doLogout() {
  Auth.logout();
  hideProfileModal();
  renderHeaderAuth();
  showPage('home');
}

// ══════════════════════════════════
// PLATEFORMES
// ══════════════════════════════════
function countForPlatform(pid) {
  if (pid === 'all') return games.length;
  return games.filter(g => g.platforms.includes(pid)).length;
}
function renderPlatforms() {
  const grid = document.getElementById('platformGrid');
  const allPlatforms = [
    { id: 'all', label: 'Tous', icon: '🎮' },
    ...Object.entries(PLATFORMS).map(([id, p]) => ({ id, ...p }))
  ];
  grid.innerHTML = allPlatforms.map(p => `
    <div class="platform-card ${state.platform === p.id ? 'active' : ''}" onclick="selectPlatform('${p.id}')">
      <div class="plat-icon">${p.icon}</div>
      <div class="plat-name">${p.label}</div>
      <div class="plat-count">${countForPlatform(p.id)} jeux</div>
    </div>`).join('');
}
function selectPlatform(pid) {
  state.platform = pid;
  state.category = 'all';
  renderPlatforms();
  renderCategoryFilters();
  renderGames();
  const el = document.getElementById('gamesTitle');
  const pObj = PLATFORMS[pid];
  el.textContent = pid === 'all' ? 'Tous les jeux' : `Jeux ${pObj ? pObj.label : pid}`;
  scrollToGames();
}

// ══════════════════════════════════
// CATÉGORIES (dynamiques selon la plateforme)
// ══════════════════════════════════
function getVisibleGames() {
  return games.filter(g => {
    const platOk = state.platform === 'all' || g.platforms.includes(state.platform);
    const catOk  = state.category === 'all' || g.cat === state.category || g.catLabel === state.category;
    const q      = state.search.toLowerCase();
    const searchOk = !q ||
      g.name.toLowerCase().includes(q) ||
      (g.desc || '').toLowerCase().includes(q) ||
      (g.catLabel || '').toLowerCase().includes(q) ||
      (g.tags || []).some(t => t.toLowerCase().includes(q));
    return platOk && catOk && searchOk;
  });
}

function renderCategoryFilters() {
  const platGames = games.filter(g => state.platform === 'all' || g.platforms.includes(state.platform));
  const cats = {};
  platGames.forEach(g => {
    if (!g.cat) return;
    if (!cats[g.cat]) {
      cats[g.cat] = {
        count: 0,
        label: g.catLabel || CATEGORIES[g.cat]?.label || g.cat,
        icon: CATEGORIES[g.cat]?.icon || '🎲'
      };
    }
    cats[g.cat].count += 1;
  });
  const catDefs = Object.entries(cats).sort((a,b) => b[1].count - a[1].count);
  const container = document.getElementById('catFilters');
  container.innerHTML = `<button class="cat-btn ${state.category==='all'?'active':''}" onclick="selectCat('all')">🎮 Tous (${platGames.length})</button>` +
    catDefs.map(([cat, data]) => {
      return `<button class="cat-btn ${state.category===cat?'active':''}" onclick="selectCat('${cat}')">${data.icon} ${data.label} (${data.count})</button>`;
    }).join('');
}
function selectCat(cat) {
  state.category = cat;
  renderCategoryFilters();
  renderGames();
}

// ══════════════════════════════════
// JEUX
// ══════════════════════════════════
function renderGames() {
  const list  = getVisibleGames();
  const grid  = document.getElementById('gamesGrid');
  const noRes = document.getElementById('noResults');
  const cnt   = document.getElementById('gameCount');
  cnt.textContent = `${list.length} jeu${list.length !== 1 ? 'x' : ''}`;
  noRes.style.display = list.length === 0 ? 'block' : 'none';
  grid.innerHTML = list.map((g, i) => {
    const plats = (g.platforms||[]).map(p => PLATFORMS[p]?.icon || '').join('');
    return `
    <a class="game-card" href="${g.url}" target="_blank" rel="noopener noreferrer" style="animation-delay:${i*30}ms">
      <div class="thumb">
        ${g.emoji}
        <span class="free-badge">GRATUIT</span>
      </div>
      <div class="gc-info">
        <div class="gc-name" title="${g.name}">${g.name}</div>
        <div class="gc-plat">${plats} ${g.catLabel || g.cat}</div>
      </div>
    </a>`;
  }).join('');
}

function renderFeatured() {
  const featured = games.filter(g => g.featured).slice(0, 6);
  document.getElementById('featuredGrid').innerHTML = featured.map(g => {
    const plats = (g.platforms||[]).map(p => PLATFORMS[p]?.icon || '').join(' ');
    return `
    <a class="featured-card" href="${g.url}" target="_blank" rel="noopener noreferrer">
      <div class="thumb">${g.emoji}</div>
      <div class="info">
        <span class="f-badge">⭐ À la une</span>
        <div class="f-name">${g.name}</div>
        <p class="f-desc">${g.desc}</p>
        <div class="f-meta">
          <span class="tag">${g.catLabel || g.cat}</span>
          <span class="plat-tag">${plats}</span>
          <button class="play-btn" onclick="event.preventDefault();window.open('${g.url}','_blank')">▶ Jouer</button>
        </div>
      </div>
    </a>`;
  }).join('');
}

// ── Recherche ──
let searchTimer;
function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = document.getElementById('searchInput').value.trim();
    renderGames();
  }, 200);
}

// ── Scroll helpers ──
function scrollToPlatforms() { document.getElementById('platformsSection').scrollIntoView({ behavior: 'smooth' }); }
function scrollToGames()     { document.getElementById('allGamesSection').scrollIntoView({ behavior: 'smooth' }); }

// ══════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════
let currentAdminTab = 'users';

function adminTab(tab) {
  currentAdminTab = tab;
  document.querySelectorAll('.adm-btn').forEach(b => b.classList.remove('active'));
  const idx = ['users','roles','logs','games'].indexOf(tab);
  document.querySelectorAll('.adm-btn')[idx]?.classList.add('active');

  if (!Auth.isAdmin()) {
    document.getElementById('adminMain').innerHTML = '<p style="color:var(--accent);padding:40px">⛔ Accès refusé.</p>';
    return;
  }
  if (tab === 'users')  renderAdminUsers();
  if (tab === 'roles')  renderAdminRoles();
  if (tab === 'logs')   renderAdminLogs();
  if (tab === 'games')  renderAdminGames();
}

function renderAdminUsers() {
  const users = Auth.getAllUsers();
  const isFounder = Auth.isFounder();
  const stats = {
    total:     users.length,
    fondateur: users.filter(u=>u.role==='fondateur').length,
    admin:     users.filter(u=>u.role==='admin').length,
    modero:    users.filter(u=>u.role==='moderateur').length,
    membres:   users.filter(u=>u.role==='membre').length,
    bannis:    users.filter(u=>u.banned).length,
  };
  document.getElementById('adminMain').innerHTML = `
    <h2 class="admin-section-title">👥 Utilisateurs</h2>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">${stats.total}</div><div class="stat-label">Total</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${stats.fondateur}</div><div class="stat-label">Fondateurs</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent2)">${stats.admin}</div><div class="stat-label">Admins</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent3)">${stats.modero}</div><div class="stat-label">Modérateurs</div></div>
      <div class="stat-card"><div class="stat-num">${stats.membres}</div><div class="stat-label">Membres</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${stats.bannis}</div><div class="stat-label">Bannis</div></div>
    </div>
    <div style="overflow-x:auto">
    <table class="admin-table">
      <thead><tr>
        <th>ID</th><th>Pseudo</th><th>Email</th><th>Rôle</th><th>Créé le</th><th>Dernier login</th><th>Statut</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${users.map(u => {
          const bg = avatarBg(u.pseudo);
          const date = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
          return `<tr>
            <td class="td-id" title="${u.id}">${u.id}</td>
            <td style="display:flex;align-items:center;gap:8px;padding:10px 14px">
              <div class="user-avatar" style="background:${bg};width:26px;height:26px;font-size:.7rem">${roleIcon(u.role)}</div>
              <strong>${u.pseudo}</strong>
            </td>
            <td>${u.email}</td>
            <td><span class="role-badge" style="background:${roleColor(u.role)}22;color:${roleColor(u.role)}">${roleLabel(u.role)}</span></td>
            <td>${date(u.createdAt)}</td>
            <td>${date(u.lastLogin)}</td>
            <td>${u.banned ? '<span style="color:var(--accent);font-weight:700">Banni</span>' : '<span style="color:var(--green)">Actif</span>'}</td>
            <td><div class="td-actions">
              ${u.role !== 'fondateur' ? `
                <button class="act-btn ${u.banned?'act-unban':'act-ban'}" onclick="adminToggleBan('${u.id}')">${u.banned?'Débannir':'Bannir'}</button>
                ${isFounder ? `<button class="act-btn act-del" onclick="adminDelete('${u.id}','${u.pseudo}')">Suppr.</button>` : ''}
              ` : '<span style="color:var(--accent);font-size:.8rem">Fondateur</span>'}
            </div></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>`;
}

function renderAdminRoles() {
  const users = Auth.getAllUsers().filter(u => u.role !== 'fondateur' || Auth.isFounder());
  const isFounder = Auth.isFounder();
  const allRoles = isFounder
    ? ['membre','moderateur','admin','fondateur']
    : ['membre','moderateur'];

  document.getElementById('adminMain').innerHTML = `
    <h2 class="admin-section-title">🎖️ Gestion des rôles</h2>
    <p style="color:var(--muted);margin-bottom:24px;font-size:.88rem">
      ${isFounder ? 'En tant que Fondateur, vous pouvez attribuer tous les rôles.' : 'Les admins peuvent attribuer Membre et Modérateur uniquement.'}
    </p>
    <div style="overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>Pseudo</th><th>Rôle actuel</th><th>Changer le rôle</th></tr></thead>
      <tbody>
        ${users.map(u => `<tr>
          <td><strong>${u.pseudo}</strong></td>
          <td><span class="role-badge" style="background:${roleColor(u.role)}22;color:${roleColor(u.role)}">${roleLabel(u.role)}</span></td>
          <td>
            ${u.role === 'fondateur' && !isFounder
              ? '<span style="color:var(--muted);font-size:.8rem">Non modifiable</span>'
              : `<select class="role-select" onchange="adminSetRole('${u.id}',this.value)">
                  ${allRoles.map(r => `<option value="${r}" ${u.role===r?'selected':''}>${roleLabel(r)}</option>`).join('')}
                </select>`
            }
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function renderAdminLogs() {
  if (!Auth.isFounder()) {
    document.getElementById('adminMain').innerHTML = '<p style="color:var(--accent);padding:20px">⛔ Accès réservé aux Fondateurs.</p>';
    return;
  }
  const logs = Auth.getLogs().slice(0, 200);
  const users = Auth.getAllUsers();
  const findUser = id => users.find(u => u.id === id);

  document.getElementById('adminMain').innerHTML = `
    <h2 class="admin-section-title">📋 Logs (${logs.length})</h2>
    <div id="logsList">
      ${logs.map(l => {
        const u = l.userId ? findUser(l.userId) : null;
        const time = new Date(l.timestamp).toLocaleString('fr-FR');
        return `<div class="log-entry ${l.action}">
          <div>
            <div class="log-action">${l.action}</div>
            <div class="log-time">${time}</div>
          </div>
          <div>
            <div class="log-details">${l.details}</div>
            ${u ? `<div style="font-size:.75rem;color:var(--muted);margin-top:3px">Par : ${u.pseudo} (${u.role})</div>` : ''}
          </div>
        </div>`;
      }).join('')}
      ${logs.length === 0 ? '<p style="color:var(--muted)">Aucun log enregistré.</p>' : ''}
    </div>`;
}

function renderAdminGames() {
  let list = [...games];
  document.getElementById('adminMain').innerHTML = `
    <h2 class="admin-section-title">🔄 Jeux (${games.length})</h2>
    <button class="refresh-btn" onclick="adminRefreshGames()">🔄 Relancer la recherche / Actualiser</button>
    <input class="game-search-admin" id="adminGameSearch" placeholder="Filtrer les jeux..." oninput="adminFilterGames()"/>
    <div id="adminGameList">
      ${renderAdminGameRows(games)}
    </div>`;
}

function renderAdminGameRows(list) {
  return list.map(g => {
    const plats = (g.platforms||[]).map(p => PLATFORMS[p]?.icon || '').join(' ');
    return `<div class="game-row">
      <div class="game-row-emoji">${g.emoji}</div>
      <div>
        <div class="game-row-name">${g.name}</div>
        <div class="game-row-plat">${plats} · ${g.catLabel||g.cat}</div>
      </div>
      <a class="game-row-link" href="${g.url}" target="_blank">↗ Ouvrir</a>
    </div>`;
  }).join('');
}

function adminFilterGames() {
  const q = document.getElementById('adminGameSearch').value.toLowerCase();
  const filtered = games.filter(g =>
    g.name.toLowerCase().includes(q) ||
    (g.catLabel || '').toLowerCase().includes(q) ||
    (g.desc || '').toLowerCase().includes(q) ||
    (g.tags || []).some(t => t.toLowerCase().includes(q))
  );
  document.getElementById('adminGameList').innerHTML = renderAdminGameRows(filtered);
}

function adminRefreshGames() {
  Auth.addLog('GAME_REFRESH', `Liste des jeux actualisée (${games.length} jeux)`, Auth.currentUser()?.id);
  const btn = document.querySelector('.refresh-btn');
  btn.textContent = '✅ Actualisé !';
  setTimeout(() => { btn.textContent = '🔄 Relancer la recherche / Actualiser'; }, 2000);
  renderAdminGames();
}

// ── Actions rapides Admin ──
function adminToggleBan(userId) {
  const r = Auth.toggleBan(userId);
  if (r.ok) renderAdminUsers();
  else alert(r.error);
}
function adminDelete(userId, pseudo) {
  if (!confirm(`Supprimer définitivement le compte de ${pseudo} ?`)) return;
  const r = Auth.deleteUser(userId);
  if (r.ok) renderAdminUsers();
  else alert(r.error);
}
function adminSetRole(userId, newRole) {
  const r = Auth.setRole(userId, newRole);
  if (!r.ok) alert(r.error);
  else { renderAdminRoles(); }
}

// ══════════════════════════════════
// INIT
// ══════════════════════════════════
async function init() {
  await Auth.init();
  renderHeaderAuth();
  renderPlatforms();
  renderFeatured();
  renderCategoryFilters();
  renderGames();
  showPage('home');
  // Enter dans les champs login/register
  document.getElementById('loginPassword').addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });
  document.getElementById('regPassword').addEventListener('keydown', e => { if (e.key==='Enter') doRegister(); });
}

document.addEventListener('DOMContentLoaded', init);
