// =============================================
// APP.JS — Logique principale FreePlay
// =============================================

const App = {
  state: {
    platform: 'all',
    category: 'all',
    search: '',
    selectedGameId: null,
  },
  elements: {},
  searchTimer: null,
  gameInteractions: {},
  currentAdminTab: 'users',
  adminLogRefreshInterval: null,
};

function $(id) {
  return document.getElementById(id);
}

function formatDate(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleDateString('fr-FR') : '—';
}

function avatarBg(pseudo) {
  const colors = ['#ff3c5f', '#ff9500', '#ffbe00', '#00c470', '#00e5ff', '#007aff', '#af52de'];
  let hash = 0;
  for (const char of pseudo) {
    hash = (hash * 31 + char.charCodeAt(0)) % colors.length;
  }
  return colors[hash];
}

function roleColor(role) {
  const map = { membre: '#7878a0', moderateur: '#00e5ff', admin: '#ffbe00', fondateur: '#ff3c5f' };
  return map[role] || '#7878a0';
}

function roleIcon(role) {
  const map = { membre: '👤', moderateur: '🛡️', admin: '⚙️', fondateur: '👑' };
  return map[role] || '👤';
}

function roleLabel(role) {
  const map = { membre: 'Membre', moderateur: 'Modérateur', admin: 'Admin', fondateur: 'Fondateur' };
  return map[role] || role;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function loadGameInteractions() {
  try {
    App.gameInteractions = JSON.parse(localStorage.getItem('fp_game_interactions') || '{}');
  } catch {
    App.gameInteractions = {};
  }
}

function saveGameInteractions() {
  localStorage.setItem('fp_game_interactions', JSON.stringify(App.gameInteractions));
}

function ensureGameStore(gameId) {
  if (!App.gameInteractions[gameId]) {
    App.gameInteractions[gameId] = { comments: [], ratings: {} };
  }
  return App.gameInteractions[gameId];
}

function getGameComments(gameId) {
  return ensureGameStore(gameId).comments;
}

function getGameRatingStats(gameId) {
  const ratings = Object.values(ensureGameStore(gameId).ratings).map(Number);
  const count = ratings.length;
  const average = count ? ratings.reduce((sum, value) => sum + value, 0) / count : 0;
  return { count, average };
}

function getUserGameRating(gameId) {
  const user = Auth.currentUser();
  if (!user) return 0;
  return ensureGameStore(gameId).ratings[user.id] || 0;
}

function addGameComment(gameId, text) {
  const user = Auth.currentUser();
  if (!user) return { ok: false, error: 'Vous devez être connecté.' };
  if (!text) return { ok: false, error: 'Le commentaire ne peut pas être vide.' };

  const store = ensureGameStore(gameId);
  store.comments.unshift({
    id: `c_${Date.now().toString(36)}`,
    userId: user.id,
    pseudo: user.pseudo,
    text,
    timestamp: Date.now(),
  });
  saveGameInteractions();
  return { ok: true };
}

function setGameRating(gameId, score) {
  const user = Auth.currentUser();
  if (!user) return { ok: false, error: 'Vous devez être connecté.' };
  const value = Number(score);
  if (!value || value < 1 || value > 5) return { ok: false, error: 'Note invalide.' };

  const store = ensureGameStore(gameId);
  store.ratings[user.id] = value;
  saveGameInteractions();
  return { ok: true };
}

function getGamePlatformChips(game) {
  return (game.platforms || []).map(code => `<span class="game-chip">${PLATFORMS[code]?.icon || ''} ${PLATFORMS[code]?.label || code}</span>`).join(' ');
}

function loadFeaturedOverrides() {
  try {
    App.featuredOverride = JSON.parse(localStorage.getItem('fp_featured_override') || '{}');
  } catch {
    App.featuredOverride = {};
  }
}

function saveFeaturedOverrides() {
  localStorage.setItem('fp_featured_override', JSON.stringify(App.featuredOverride));
}

function startAdminLiveLogs() {
  stopAdminLiveLogs();
  if (!Auth.isFounder()) return;
  App.adminLogRefreshInterval = setInterval(() => {
    if (App.currentAdminTab === 'logs') updateAdminLogsList();
  }, 2500);
}

function stopAdminLiveLogs() {
  if (App.adminLogRefreshInterval) {
    clearInterval(App.adminLogRefreshInterval);
    App.adminLogRefreshInterval = null;
  }
}

function isGameFeatured(game) {
  return App.featuredOverride[game.id] ?? game.featured;
}

function toggleGameFeatured(gameId) {
  const game = games.find(g => g.id === gameId);
  if (!game) return;
  App.featuredOverride[gameId] = !isGameFeatured(game);
  saveFeaturedOverrides();
  renderFeatured();
  if (App.currentAdminTab === 'games') renderAdminGames();
}

function hideGameModal() {
  $('gameModal').classList.remove('open');
}

function closeGameModalOverlay(event) {
  if (event.target.id === 'gameModal') {
    hideGameModal();
  }
}

function openGameModal(gameId) {
  const game = games.find(item => item.id === gameId);
  if (!game) return;
  App.state.selectedGameId = gameId;

  const comments = getGameComments(gameId);
  const ratingInfo = getGameRatingStats(gameId);
  const userRating = getUserGameRating(gameId);
  const sizeLabel = game.size || GAME_SIZES?.[game.id] || 'Non renseignée';
  const downloadUrl = game.downloadUrl || game.url;

  $('gameModalContent').innerHTML = `
    <div class="game-detail-header">
      <div class="game-detail-title">
        <div class="game-detail-badge">${game.emoji}</div>
        <div>
          <div class="game-detail-name" id="gameModalTitle">${escapeHtml(game.name)}</div>
          <div class="game-detail-meta">${escapeHtml(game.catLabel || game.cat)} · ${getGamePlatformChips(game)}</div>
        </div>
      </div>
      <div class="game-detail-size">Taille estimée : <strong>${escapeHtml(sizeLabel)}</strong></div>
    </div>
    <p class="game-detail-desc">${escapeHtml(game.desc)}</p>
    <div class="game-detail-actions">
      <a class="btn-primary" href="${downloadUrl}" target="_blank" rel="noopener noreferrer">Télécharger</a>
      <a class="btn-secondary" href="${game.url}" target="_blank" rel="noopener noreferrer">Jouer</a>
    </div>
    <div class="game-rating-panel">
      <div class="rating-overview">
        <div class="rating-score"><strong>${ratingInfo.count ? ratingInfo.average.toFixed(1) : '—'}</strong> / 5</div>
        <div class="rating-count">${ratingInfo.count} avis</div>
      </div>
      <div class="rating-stars">
        ${[1, 2, 3, 4, 5].map(value => `
          <button type="button" class="star-btn ${value <= userRating ? 'active' : ''}" data-action="rate-game" data-game-id="${game.id}" data-score="${value}" aria-label="Donner ${value} étoiles">${value <= userRating ? '★' : '☆'}</button>
        `).join('')}
      </div>
      <div class="rating-note">${userRating ? `Ta note : ${userRating} ⭐` : 'Clique sur une étoile pour noter ce jeu.'}</div>
    </div>
    <div class="game-comments-section">
      <div class="section-title" style="margin-bottom:14px;font-size:1.2rem;">Commentaires</div>
      <form id="gameCommentForm" class="comment-form">
        <textarea id="gameCommentText" placeholder="Laisse un avis sur ce jeu..." rows="3"></textarea>
        <button type="submit" class="btn-primary">Publier</button>
      </form>
      <div class="game-comment-list">
        ${comments.length ? comments.map(comment => `
          <div class="comment-entry">
            <div class="comment-meta">
              <span class="comment-user">${escapeHtml(comment.pseudo)}</span>
              <span class="comment-time">${new Date(comment.timestamp).toLocaleDateString('fr-FR')}</span>
            </div>
            <p class="comment-text">${escapeHtml(comment.text)}</p>
          </div>
        `).join('') : '<div class="empty-comments">Aucun commentaire pour l’instant. Soyez le premier !</div>'}
      </div>
    </div>
  `;

  const form = $('gameCommentForm');
  if (form) {
    form.addEventListener('submit', handleGameCommentSubmit);
  }

  $('gameModal').classList.add('open');
}

function handleGameCommentSubmit(event) {
  event.preventDefault();
  const text = $('gameCommentText')?.value.trim();
  if (!text) {
    alert('Écris un commentaire avant de publier.');
    return;
  }

  const result = addGameComment(App.state.selectedGameId, text);
  if (!result.ok) {
    alert(result.error);
    return;
  }

  openGameModal(App.state.selectedGameId);
}

function renderHeaderAuth() {
  const header = $('headerAuth');
  const user = Auth.currentUser();
  if (!user) {
    header.innerHTML = `
      <button type="button" class="btn-login" data-action="open-auth" data-auth-target="login">Connexion</button>
      <button type="button" class="btn-register" data-action="open-auth" data-auth-target="register">S'inscrire</button>
    `;
    return;
  }

  header.innerHTML = `
    ${Auth.isAdmin() ? `<button type="button" class="btn-admin" data-action="show-page" data-page="admin">⚙️ Panel</button>` : ''}
    <div class="user-chip" data-action="open-profile">
      <div class="user-avatar" style="background:${avatarBg(user.pseudo)}">${roleIcon(user.role)}</div>
      <span class="user-pseudo">${user.pseudo}</span>
      <span class="role-badge" style="background:${roleColor(user.role)}22;color:${roleColor(user.role)}">${roleLabel(user.role)}</span>
    </div>
  `;
}

function showPage(page) {
  if (page === 'home' && !Auth.isLoggedIn()) {
    $('pagHome').style.display = 'none';
    showAuthModal('login');
    return;
  }
  if (page === 'admin' && !Auth.isAdmin()) {
    alert('Accès réservé aux administrateurs.');
    page = 'home';
  }
  const isAdminPage = page === 'admin';
  $('pagHome').style.display = page === 'home' ? '' : 'none';
  $('pagAdmin').style.display = isAdminPage ? '' : 'none';
  $('siteFooter').style.display = isAdminPage ? 'none' : '';
  if (isAdminPage) {
    adminTab(App.currentAdminTab);
  } else {
    stopAdminLiveLogs();
  }
  window.scrollTo(0, 0);
}

function showAuthModal(tab = 'login') {
  $('authModal').classList.add('open');
  switchAuthTab(tab);
}

function hideAuthModal() {
  $('authModal').classList.remove('open');
}

function closeAuthModal(event) {
  if (event.target.id === 'authModal') {
    hideAuthModal();
  }
}

function switchAuthTab(tab) {
  $('tabLogin').classList.toggle('active', tab === 'login');
  $('tabRegister').classList.toggle('active', tab === 'register');
  $('formLogin').style.display = tab === 'login' ? '' : 'none';
  $('formRegister').style.display = tab === 'register' ? '' : 'none';
}

async function handleLogin(event) {
  event.preventDefault();
  const pseudo = $('loginPseudo').value.trim();
  const password = $('loginPassword').value;
  const error = $('loginError');
  error.textContent = '';
  const result = await Auth.login(pseudo, password);
  if (!result.ok) {
    error.textContent = result.error;
    return;
  }
  hideAuthModal();
  renderHeaderAuth();
  showPage('home');
}

async function handleRegister(event) {
  event.preventDefault();
  const pseudo = $('regPseudo').value.trim();
  const email = $('regEmail').value.trim();
  const password = $('regPassword').value;
  const error = $('registerError');
  error.textContent = '';
  const result = await Auth.register(pseudo, email, password);
  if (!result.ok) {
    error.textContent = result.error;
    return;
  }
  await Auth.login(pseudo, password);
  hideAuthModal();
  renderHeaderAuth();
  showPage('home');
}

function showProfileModal() {
  const user = Auth.currentUser();
  if (!user) return;
  $('profileContent').innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar" style="background:${avatarBg(user.pseudo)}">${roleIcon(user.role)}</div>
      <div>
        <div class="profile-pseudo">${user.pseudo}</div>
        <span class="role-badge profile-role" style="background:${roleColor(user.role)}22;color:${roleColor(user.role)}">${roleIcon(user.role)} ${roleLabel(user.role)}</span>
      </div>
    </div>
    <div class="profile-info">
      <div>ID : <span class="td-id">${user.id}</span></div>
      <div style="margin-top:8px">Rôle : <span>${roleLabel(user.role)}</span></div>
    </div>
    <button type="button" class="btn-logout" data-action="logout">Se déconnecter</button>
  `;
  $('profileModal').classList.add('open');
}

function hideProfileModal() {
  $('profileModal').classList.remove('open');
}

function closeProfileModal(event) {
  if (event.target.id === 'profileModal') {
    hideProfileModal();
  }
}

function doLogout() {
  Auth.logout();
  hideProfileModal();
  renderHeaderAuth();
  showPage('home');
}

function countForPlatform(platformId) {
  if (platformId === 'all') return games.length;
  return games.filter(game => game.platforms.includes(platformId)).length;
}

function renderPlatforms() {
  const grid = $('platformGrid');
  const items = [
    { id: 'all', label: 'Tous', icon: '🎮' },
    ...Object.entries(PLATFORMS).map(([id, data]) => ({ id, ...data })),
  ];
  grid.innerHTML = items.map(item => `
    <button type="button" class="platform-card ${App.state.platform === item.id ? 'active' : ''}" data-action="select-platform" data-platform="${item.id}">
      <div class="plat-icon">${item.icon}</div>
      <div class="plat-name">${item.label}</div>
      <div class="plat-count">${countForPlatform(item.id)} jeux</div>
    </button>
  `).join('');
}

function selectPlatform(platformId) {
  App.state.platform = platformId;
  App.state.category = 'all';
  renderPlatforms();
  renderCategoryFilters();
  renderGames();
  $('gamesTitle').textContent = platformId === 'all' ? 'Tous les jeux' : `Jeux ${PLATFORMS[platformId]?.label || platformId}`;
  scrollToGames();
}

function getVisibleGames() {
  const query = App.state.search.toLowerCase();
  return games.filter(game => {
    const platformOk = App.state.platform === 'all' || game.platforms.includes(App.state.platform);
    const categoryOk = App.state.category === 'all' || game.cat === App.state.category || game.catLabel === App.state.category;
    const searchOk = !query || [game.name, game.desc, game.catLabel, game.cat, ...(game.tags || [])].some(value =>
      String(value).toLowerCase().includes(query)
    );
    return platformOk && categoryOk && searchOk;
  });
}

function renderCategoryFilters() {
  const filteredGames = games.filter(game => App.state.platform === 'all' || game.platforms.includes(App.state.platform));
  const categories = filteredGames.reduce((acc, game) => {
    if (!game.cat) return acc;
    if (!acc[game.cat]) {
      acc[game.cat] = {
        count: 0,
        label: game.catLabel || CATEGORIES[game.cat]?.label || game.cat,
        icon: CATEGORIES[game.cat]?.icon || '🎲',
      };
    }
    acc[game.cat].count += 1;
    return acc;
  }, {});

  const buttons = Object.entries(categories).sort((a, b) => b[1].count - a[1].count).map(([cat, data]) => `
    <button type="button" class="cat-btn ${App.state.category === cat ? 'active' : ''}" data-action="select-category" data-category="${cat}">
      ${data.icon} ${data.label} (${data.count})
    </button>
  `).join('');

  $('catFilters').innerHTML = `
    <button type="button" class="cat-btn ${App.state.category === 'all' ? 'active' : ''}" data-action="select-category" data-category="all">🎮 Tous (${filteredGames.length})</button>
    ${buttons}
  `;
}

function selectCategory(categoryId) {
  App.state.category = categoryId;
  renderCategoryFilters();
  renderGames();
}

function renderGames() {
  const list = getVisibleGames();
  const grid = $('gamesGrid');
  const noResults = $('noResults');
  const count = $('gameCount');

  count.textContent = `${list.length} jeu${list.length === 1 ? '' : 'x'}`;
  noResults.style.display = list.length === 0 ? 'block' : 'none';
  grid.innerHTML = list.map((game, index) => {
    const icons = (game.platforms || []).map(code => PLATFORMS[code]?.icon || '').join('');
    return `
      <button type="button" class="game-card" data-action="open-game" data-game-id="${game.id}" style="animation-delay:${index * 30}ms">
        <div class="thumb">
          ${game.emoji}
          <span class="free-badge">GRATUIT</span>
        </div>
        <div class="gc-info">
          <div class="gc-name" title="${game.name}">${game.name}</div>
          <div class="gc-plat">${icons} ${game.catLabel || game.cat}</div>
        </div>
      </button>
    `;
  }).join('');
}

function renderFeatured() {
  const featured = games.filter(game => isGameFeatured(game)).slice(0, 6);
  $('featuredGrid').innerHTML = featured.map(game => {
    const icons = (game.platforms || []).map(code => PLATFORMS[code]?.icon || '').join(' ');
    return `
      <button type="button" class="featured-card" data-action="open-game" data-game-id="${game.id}">
        <div class="thumb">${game.emoji}</div>
        <div class="info">
          <span class="f-badge">⭐ À la une</span>
          <div class="f-name">${game.name}</div>
          <p class="f-desc">${game.desc}</p>
          <div class="f-meta">
            <span class="tag">${game.catLabel || game.cat}</span>
            <span class="plat-tag">${icons}</span>
            <a class="play-btn" data-action="play-game" href="${game.url}" target="_blank" rel="noopener noreferrer">▶ Jouer</a>
          </div>
        </div>
      </button>
    `;
  }).join('');
}

function onSearch(event) {
  clearTimeout(App.searchTimer);
  App.searchTimer = setTimeout(() => {
    App.state.search = $('searchInput').value.trim();
    renderGames();
  }, 200);
}

function scrollToPlatforms() {
  $('platformsSection').scrollIntoView({ behavior: 'smooth' });
}

function scrollToGames() {
  $('allGamesSection').scrollIntoView({ behavior: 'smooth' });
}

function adminTab(tab) {
  App.currentAdminTab = tab;
  document.querySelectorAll('.adm-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.adminTab === tab));

  if (!Auth.isAdmin()) {
    $('adminMain').innerHTML = '<p style="color:var(--accent);padding:40px">⛔ Accès refusé.</p>';
    return;
  }

  if (tab === 'users') renderAdminUsers();
  if (tab === 'roles') renderAdminRoles();
  if (tab === 'logs') renderAdminLogs();
  if (tab === 'games') renderAdminGames();
  if (tab === 'logs') startAdminLiveLogs(); else stopAdminLiveLogs();
}

function renderAdminUserRows(list) {
  return list.map(user => `
    <tr>
      <td class="td-id" title="${user.id}">${user.id}</td>
      <td style="display:flex;align-items:center;gap:8px;padding:10px 14px">
        <div class="user-avatar" style="background:${avatarBg(user.pseudo)};width:26px;height:26px;font-size:.7rem">${roleIcon(user.role)}</div>
        <strong>${user.pseudo}</strong>
      </td>
      <td>${user.email}</td>
      <td><span class="role-badge" style="background:${roleColor(user.role)}22;color:${roleColor(user.role)}">${roleLabel(user.role)}</span></td>
      <td>${formatDate(user.createdAt)}</td>
      <td>${formatDate(user.lastLogin)}</td>
      <td>${user.banned ? '<span style="color:var(--accent);font-weight:700">Banni</span>' : '<span style="color:var(--green)">Actif</span>'}</td>
      <td><div class="td-actions">
        ${user.role !== 'fondateur' ? `
          <button type="button" class="act-btn ${user.banned ? 'act-unban' : 'act-ban'}" data-admin-action="toggle-ban" data-user-id="${user.id}">${user.banned ? 'Débannir' : 'Bannir'}</button>
          <button type="button" class="act-btn act-del" data-admin-action="delete-user" data-user-id="${user.id}" data-user-pseudo="${user.pseudo}">Suppr.</button>
        ` : '<span style="color:var(--accent);font-size:.8rem">Fondateur</span>'}
      </div></td>
    </tr>
  `).join('');
}

function adminFilterUsers() {
  const query = $('adminUserSearch').value.trim().toLowerCase();
  const users = Auth.getAllUsers();
  const filtered = users.filter(user =>
    user.pseudo.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query)
  );
  $('adminUserList').innerHTML = renderAdminUserRows(filtered);
  $('adminUserCount').textContent = `Résultats : ${filtered.length}`;
}

function renderAdminUsers() {
  const users = Auth.getAllUsers();
  const stats = {
    total: users.length,
    fondateur: users.filter(u => u.role === 'fondateur').length,
    admin: users.filter(u => u.role === 'admin').length,
    moderateur: users.filter(u => u.role === 'moderateur').length,
    membre: users.filter(u => u.role === 'membre').length,
    bannis: users.filter(u => u.banned).length,
  };

  $('adminMain').innerHTML = `
    <h2 class="admin-section-title">👥 Utilisateurs</h2>
    <div class="admin-panel-top">
      <input class="admin-search" id="adminUserSearch" placeholder="Rechercher un utilisateur..." />
      <span class="admin-hint" id="adminUserCount">Résultats : ${users.length}</span>
    </div>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">${stats.total}</div><div class="stat-label">Total</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${stats.fondateur}</div><div class="stat-label">Fondateurs</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent2)">${stats.admin}</div><div class="stat-label">Admins</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent3)">${stats.moderateur}</div><div class="stat-label">Modérateurs</div></div>
      <div class="stat-card"><div class="stat-num">${stats.membre}</div><div class="stat-label">Membres</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${stats.bannis}</div><div class="stat-label">Bannis</div></div>
    </div>
    <div style="overflow-x:auto">
      <table class="admin-table">
        <thead><tr>
          <th>ID</th><th>Pseudo</th><th>Email</th><th>Rôle</th><th>Créé le</th><th>Dernier login</th><th>Statut</th><th>Actions</th>
        </tr></thead>
        <tbody id="adminUserList">
          ${renderAdminUserRows(users)}
        </tbody>
      </table>
    </div>
  `;

  $('adminUserSearch').addEventListener('input', adminFilterUsers);
}

function renderAdminRoles() {
  const users = Auth.getAllUsers().filter(user => user.role !== 'fondateur' || Auth.isFounder());
  const isFounder = Auth.isFounder();
  const roleOptions = isFounder ? ['membre', 'moderateur', 'admin', 'fondateur'] : ['membre', 'moderateur'];

  $('adminMain').innerHTML = `
    <h2 class="admin-section-title">🎖️ Gestion des rôles</h2>
    <p style="color:var(--muted);margin-bottom:24px;font-size:.88rem">
      ${isFounder ? 'En tant que Fondateur, vous pouvez attribuer tous les rôles.' : 'Les admins peuvent attribuer Membre et Modérateur uniquement.'}
    </p>
    <div style="overflow-x:auto">
      <table class="admin-table">
        <thead><tr><th>Pseudo</th><th>Rôle actuel</th><th>Changer le rôle</th></tr></thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td><strong>${user.pseudo}</strong></td>
              <td><span class="role-badge" style="background:${roleColor(user.role)}22;color:${roleColor(user.role)}">${roleLabel(user.role)}</span></td>
              <td>
                ${user.role === 'fondateur' && !isFounder ? '<span style="color:var(--muted);font-size:.8rem">Non modifiable</span>' : `
                  <select class="role-select" data-role-select data-user-id="${user.id}">
                    ${roleOptions.map(role => `<option value="${role}" ${user.role === role ? 'selected' : ''}>${roleLabel(role)}</option>`).join('')}
                  </select>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminLogs() {
  if (!Auth.isFounder()) {
    $('adminMain').innerHTML = '<p style="color:var(--accent);padding:20px">⛔ Accès réservé aux Fondateurs.</p>';
    return;
  }

  const logs = Auth.getLogs().slice(0, 200);
  const users = Auth.getAllUsers();
  const findUser = id => users.find(user => user.id === id);

  $('adminMain').innerHTML = `
    <h2 class="admin-section-title">📋 Logs (${logs.length})</h2>
    <div class="admin-panel-top">
      <input class="admin-search" id="adminLogSearch" placeholder="Rechercher dans les logs..." />
      <span class="admin-hint" id="adminLogCount">Logs : ${logs.length}</span>
      <div class="admin-panel-actions">
        <span class="live-badge">FLUX EN DIRECT</span>
        <button type="button" class="refresh-btn" data-admin-action="refresh-logs">🔄 Actualiser</button>
        <button type="button" class="refresh-btn secondary" data-admin-action="clear-logs">🧹 Vider les logs</button>
      </div>
    </div>
    <div id="logsList"></div>
  `;

  $('adminLogSearch').addEventListener('input', adminFilterLogs);
  updateAdminLogsList();
}

function updateAdminLogsList() {
  const query = $('adminLogSearch')?.value.trim().toLowerCase() || '';
  const logs = Auth.getLogs().slice(0, 200);
  const users = Auth.getAllUsers();
  const findUser = id => users.find(user => user.id === id);
  const filtered = logs.filter(log =>
    log.action.toLowerCase().includes(query) ||
    log.details.toLowerCase().includes(query) ||
    (findUser(log.userId)?.pseudo || '').toLowerCase().includes(query)
  );

  $('adminLogCount').textContent = `Logs : ${filtered.length}/${logs.length}`;
  $('logsList').innerHTML = filtered.map(log => {
    const author = log.userId ? findUser(log.userId) : null;
    return `
      <div class="log-entry ${log.action}">
        <div>
          <div class="log-action">${log.action}</div>
          <div class="log-time">${new Date(log.timestamp).toLocaleString('fr-FR')}</div>
        </div>
        <div>
          <div class="log-details">${log.details}</div>
          ${author ? `<div style="font-size:.75rem;color:var(--muted);margin-top:3px">Par : ${author.pseudo} (${author.role})</div>` : ''}
        </div>
      </div>
    `;
  }).join('') + (filtered.length === 0 ? '<p style="color:var(--muted)">Aucun log trouvé.</p>' : '');
}

function adminFilterLogs() {
  updateAdminLogsList();
}

function adminClearLogs() {
  if (!Auth.isFounder()) return;
  if (!confirm('Vider tous les logs ? Cette action est irréversible.')) return;
  localStorage.removeItem('fp_logs');
  renderAdminLogs();
}

function renderAdminGames() {
  const featuredCount = games.filter(isGameFeatured).length;
  $('adminMain').innerHTML = `
    <h2 class="admin-section-title">🔄 Jeux (${games.length})</h2>
    <div class="admin-panel-top">
      <input class="admin-search" id="adminGameSearch" placeholder="Filtrer les jeux..." />
      <span class="admin-hint" id="adminGameHint">À la une : ${featuredCount} · Résultats : ${games.length}</span>
      <button type="button" class="refresh-btn" data-admin-action="refresh-games">🔄 Actualiser</button>
    </div>
    <div id="adminGameList">${renderAdminGameRows(games)}</div>
  `;

  $('adminGameSearch').addEventListener('input', adminFilterGames);
}

function renderAdminGameRows(list) {
  return list.map(game => {
    const icons = (game.platforms || []).map(code => PLATFORMS[code]?.icon || '').join(' ');
    const featured = isGameFeatured(game);
    const sizeLabel = game.size || GAME_SIZES?.[game.id] || '—';
    return `
      <div class="game-row game-row-admin">
        <div class="game-row-emoji">${game.emoji}</div>
        <div class="game-row-data">
          <div class="game-row-name">${game.name}</div>
          <div class="game-row-plat">${icons} · ${game.catLabel || game.cat} · ${sizeLabel}</div>
        </div>
        <div class="game-row-actions">
          <button type="button" class="act-btn act-role" data-admin-action="toggle-featured" data-game-id="${game.id}">${featured ? 'Désactiver à la une' : 'Mettre à la une'}</button>
          <a class="game-row-link" href="${game.url}" target="_blank" rel="noopener noreferrer">↗ Ouvrir</a>
        </div>
      </div>
    `;
  }).join('');
}

function adminFilterGames() {
  const query = $('adminGameSearch').value.toLowerCase();
  const filtered = games.filter(game => [game.name, game.catLabel, game.desc, ...(game.tags || [])].some(value =>
    String(value).toLowerCase().includes(query)
  ));
  const featuredCount = filtered.filter(isGameFeatured).length;
  $('adminGameList').innerHTML = renderAdminGameRows(filtered);
  $('adminGameHint').textContent = `À la une : ${featuredCount} · Résultats : ${filtered.length}`;
}

function adminRefreshGames() {
  Auth.addLog('GAME_REFRESH', `Liste des jeux actualisée (${games.length} jeux)`, Auth.currentUser()?.id);
  const button = document.querySelector('[data-admin-action="refresh-games"]');
  if (button) {
    button.textContent = '✅ Actualisé !';
    setTimeout(() => { button.textContent = '🔄 Relancer la recherche / Actualiser'; }, 2000);
  }
  renderAdminGames();
}

function adminToggleBan(userId) {
  const result = Auth.toggleBan(userId);
  if (!result.ok) { alert(result.error); return; }
  renderAdminUsers();
}

function adminDelete(userId, pseudo) {
  if (!confirm(`Supprimer définitivement le compte de ${pseudo} ?`)) return;
  const result = Auth.deleteUser(userId);
  if (!result.ok) { alert(result.error); return; }
  renderAdminUsers();
}

function adminSetRole(userId, role) {
  const result = Auth.setRole(userId, role);
  if (!result.ok) { alert(result.error); return; }
  renderAdminRoles();
}

function handleBodyClick(event) {
  const actionElement = event.target.closest('[data-action]');
  if (!actionElement) return;
  const action = actionElement.dataset.action;
  if (!action) return;

  event.preventDefault();

  switch (action) {
    case 'open-auth':
      showAuthModal(actionElement.dataset.authTarget || 'login');
      break;
    case 'show-page':
      showPage(actionElement.dataset.page);
      break;
    case 'scroll-platforms':
      scrollToPlatforms();
      break;
    case 'switch-auth-tab':
      switchAuthTab(actionElement.dataset.authTab || 'login');
      break;
    case 'scroll-games':
      scrollToGames();
      break;
    case 'open-game':
      openGameModal(actionElement.dataset.gameId);
      break;
    case 'play-game':
      window.open(actionElement.href, '_blank', 'noopener noreferrer');
      break;
    case 'rate-game':
      {
        const gameId = actionElement.dataset.gameId;
        const score = actionElement.dataset.score;
        const result = setGameRating(gameId, score);
        if (!result.ok) { alert(result.error); break; }
        openGameModal(gameId);
      }
      break;
    case 'close-game-modal':
      hideGameModal();
      break;
    case 'open-profile':
      showProfileModal();
      break;
    case 'close-auth':
      hideAuthModal();
      break;
    case 'close-profile':
      hideProfileModal();
      break;
    case 'logout':
      doLogout();
      break;
    case 'select-platform':
      selectPlatform(actionElement.dataset.platform);
      break;
    case 'select-category':
      selectCategory(actionElement.dataset.category);
      break;
    case 'admin-tab':
      adminTab(actionElement.dataset.adminTab);
      break;
    case 'admin-back':
      showPage('home');
      break;
    case 'toggle-ban':
      adminToggleBan(actionElement.dataset.userId);
      break;
    case 'delete-user':
      adminDelete(actionElement.dataset.userId, actionElement.dataset.userPseudo);
      break;
    case 'toggle-featured':
      toggleGameFeatured(actionElement.dataset.gameId);
      break;
    case 'refresh-games':
      adminRefreshGames();
      break;
    case 'refresh-logs':
      updateAdminLogsList();
      break;
    case 'clear-logs':
      adminClearLogs();
      break;
  }
}

function handleBodyChange(event) {
  const select = event.target.closest('[data-role-select]');
  if (!select) return;
  adminSetRole(select.dataset.userId, select.value);
}

function init() {
  App.elements = {
    authModal: $('authModal'),
    profileModal: $('profileModal'),
    formLogin: $('formLogin'),
    formRegister: $('formRegister'),
    searchInput: $('searchInput'),
  };

  loadGameInteractions();
  loadFeaturedOverrides();
  Auth.init().then(() => {
    renderHeaderAuth();
    renderPlatforms();
    renderFeatured();
    renderCategoryFilters();
    renderGames();
    if (Auth.isLoggedIn()) {
      showPage('home');
    } else {
      $('pagHome').style.display = 'none';
      showAuthModal('login');
    }
  });

  document.body.addEventListener('click', handleBodyClick);
  document.body.addEventListener('change', handleBodyChange);
  document.getElementById('authClose').addEventListener('click', hideAuthModal);
  document.getElementById('profileClose').addEventListener('click', hideProfileModal);
  document.getElementById('authModal').addEventListener('click', closeAuthModal);
  document.getElementById('profileModal').addEventListener('click', closeProfileModal);
  document.getElementById('gameModal').addEventListener('click', closeGameModalOverlay);
  App.elements.formLogin.addEventListener('submit', handleLogin);
  App.elements.formRegister.addEventListener('submit', handleRegister);
  App.elements.searchInput.addEventListener('input', onSearch);
}

window.addEventListener('DOMContentLoaded', init);
