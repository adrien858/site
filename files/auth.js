// =============================================
// AUTH.JS — Système d'authentification FreePlay
// Stockage : localStorage (GitHub Pages compatible)
// =============================================

const Auth = (() => {

  const ROLES = {
    membre:    { level: 1, label: 'Membre',    color: '#7878a0', icon: '👤' },
    moderateur:{ level: 2, label: 'Modérateur',color: '#00e5ff', icon: '🛡️' },
    admin:     { level: 3, label: 'Admin',     color: '#ffbe00', icon: '⚙️' },
    fondateur: { level: 4, label: 'Fondateur', color: '#ff3c5f', icon: '👑' },
  };

  // ── Hachage simple (SHA-256 via SubtleCrypto) ──
  async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Génère un ID unique ──
  function generateId() {
    return 'fp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }

  // ── Charge / sauvegarde les users ──
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('fp_users') || '[]'); }
    catch { return []; }
  }
  function saveUsers(users) {
    localStorage.setItem('fp_users', JSON.stringify(users));
  }

  // ── Session courante ──
  function getSession() {
    try { return JSON.parse(localStorage.getItem('fp_session') || 'null'); }
    catch { return null; }
  }
  function saveSession(user) {
    const s = { id: user.id, pseudo: user.pseudo, role: user.role, loginAt: Date.now() };
    localStorage.setItem('fp_session', JSON.stringify(s));
  }
  function clearSession() {
    localStorage.removeItem('fp_session');
  }

  // ── Logs ──
  function addLog(action, details, userId = null) {
    const logs = getLogs();
    logs.unshift({ id: generateId(), timestamp: Date.now(), action, details, userId });
    if (logs.length > 500) logs.pop();
    localStorage.setItem('fp_logs', JSON.stringify(logs));
  }
  function getLogs() {
    try { return JSON.parse(localStorage.getItem('fp_logs') || '[]'); }
    catch { return []; }
  }

  // ── Init : crée le compte Fondateur par défaut ──
  async function init() {
    const users = getUsers();
    if (!users.find(u => u.role === 'fondateur')) {
      const hash = await hashPassword('FreePlay@2025!');
      const founder = {
        id: generateId(),
        pseudo: 'FreePlayAdmin',
        email: 'admin@freeplay.gg',
        passwordHash: hash,
        role: 'fondateur',
        createdAt: Date.now(),
        lastLogin: null,
        banned: false,
      };
      users.push(founder);
      saveUsers(users);
      addLog('SYSTEM', 'Compte fondateur initialisé', founder.id);
    }
  }

  // ── Inscription ──
  async function register(pseudo, email, password) {
    const users = getUsers();
    if (!pseudo || pseudo.length < 3) return { ok: false, error: 'Pseudo trop court (min 3 caractères).' };
    if (!email || !email.includes('@')) return { ok: false, error: 'Email invalide.' };
    if (!password || password.length < 6) return { ok: false, error: 'Mot de passe trop court (min 6 caractères).' };
    if (users.find(u => u.pseudo.toLowerCase() === pseudo.toLowerCase())) return { ok: false, error: 'Ce pseudo est déjà pris.' };
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, error: 'Cet email est déjà utilisé.' };

    const hash = await hashPassword(password);
    const user = { id: generateId(), pseudo, email, passwordHash: hash, role: 'membre', createdAt: Date.now(), lastLogin: null, banned: false };
    users.push(user);
    saveUsers(users);
    addLog('REGISTER', `Nouveau compte créé : ${pseudo}`, user.id);
    return { ok: true, user };
  }

  // ── Connexion ──
  async function login(pseudo, password) {
    const users = getUsers();
    const user = users.find(u => u.pseudo.toLowerCase() === pseudo.toLowerCase());
    if (!user) return { ok: false, error: 'Pseudo introuvable.' };
    if (user.banned) return { ok: false, error: 'Ce compte est banni.' };
    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) return { ok: false, error: 'Mot de passe incorrect.' };
    user.lastLogin = Date.now();
    saveUsers(users);
    saveSession(user);
    addLog('LOGIN', `Connexion réussie`, user.id);
    return { ok: true, user };
  }

  // ── Déconnexion ──
  function logout() {
    const s = getSession();
    if (s) addLog('LOGOUT', `Déconnexion`, s.id);
    clearSession();
  }

  // ── Vérification des permissions ──
  function currentUser() {
    const s = getSession();
    if (!s) return null;
    const user = getUsers().find(u => u.id === s.id);
    if (!user || user.banned) {
      clearSession();
      return null;
    }
    return { id: user.id, pseudo: user.pseudo, role: user.role, loginAt: s.loginAt };
  }
  function isLoggedIn() { return !!currentUser(); }
  function hasRole(minRole) {
    const s = currentUser();
    if (!s) return false;
    return (ROLES[s.role]?.level || 0) >= (ROLES[minRole]?.level || 99);
  }
  function isAdmin()   { return hasRole('admin'); }
  function isFounder() { return hasRole('fondateur'); }

  // ── Admin : liste des utilisateurs ──
  function getAllUsers() {
    if (!isAdmin()) return [];
    return getUsers().map(u => ({
      id: u.id, pseudo: u.pseudo, email: u.email,
      role: u.role, createdAt: u.createdAt, lastLogin: u.lastLogin, banned: u.banned
    }));
  }

  // ── Admin : changer le rôle ──
  function setRole(targetId, newRole) {
    if (!isAdmin()) return { ok: false, error: 'Permission refusée.' };
    if (!ROLES[newRole]) return { ok: false, error: 'Rôle invalide.' };
    const users = getUsers();
    const target = users.find(u => u.id === targetId);
    if (!target) return { ok: false, error: 'Utilisateur introuvable.' };
    // Seul le fondateur peut promouvoir en admin/fondateur
    if (['admin','fondateur'].includes(newRole) && !isFounder()) return { ok: false, error: 'Seul un Fondateur peut attribuer ce rôle.' };
    const s = currentUser();
    if (target.role === 'fondateur' && s.role !== 'fondateur') return { ok: false, error: 'Impossible de modifier un Fondateur.' };
    const oldRole = target.role;
    target.role = newRole;
    saveUsers(users);
    addLog('ROLE_CHANGE', `${target.pseudo} : ${oldRole} → ${newRole}`, s.id);
    return { ok: true };
  }

  // ── Admin : bannir/débannir ──
  function toggleBan(targetId) {
    if (!isAdmin()) return { ok: false, error: 'Permission refusée.' };
    const users = getUsers();
    const target = users.find(u => u.id === targetId);
    if (!target) return { ok: false, error: 'Utilisateur introuvable.' };
    if (target.role === 'fondateur') return { ok: false, error: 'Impossible de bannir un Fondateur.' };
    target.banned = !target.banned;
    saveUsers(users);
    const s = currentUser();
    addLog('BAN', `${target.pseudo} : ${target.banned ? 'banni' : 'débanni'}`, s.id);
    return { ok: true, banned: target.banned };
  }

  // ── Admin : supprimer un compte ──
  function deleteUser(targetId) {
    if (!isFounder()) return { ok: false, error: 'Seul un Fondateur peut supprimer un compte.' };
    let users = getUsers();
    const target = users.find(u => u.id === targetId);
    if (!target) return { ok: false, error: 'Utilisateur introuvable.' };
    if (target.role === 'fondateur') return { ok: false, error: 'Impossible de supprimer un Fondateur.' };
    users = users.filter(u => u.id !== targetId);
    saveUsers(users);
    const s = currentUser();
    addLog('DELETE', `Compte supprimé : ${target.pseudo}`, s.id);
    return { ok: true };
  }

  return {
    init, register, login, logout,
    currentUser, isLoggedIn, isAdmin, isFounder, hasRole,
    getAllUsers, getLogs,
    setRole, toggleBan, deleteUser,
    ROLES, addLog,
  };
})();
