// =============================================
// AUTH.JS — Système d'authentification FreePlay
// Stockage : localStorage (GitHub Pages compatible)
// =============================================

const Auth = (() => {
  const ROLES = {
    membre:    { level: 1, label: 'Membre',     color: '#7878a0', icon: '👤' },
    moderateur:{ level: 2, label: 'Modérateur', color: '#00e5ff', icon: '🛡️' },
    admin:     { level: 3, label: 'Admin',      color: '#ffbe00', icon: '⚙️' },
    fondateur: { level: 4, label: 'Fondateur',  color: '#ff3c5f', icon: '👑' },
  };

  const STORAGE = {
    users: 'fp_users',
    session: 'fp_session',
    logs: 'fp_logs',
  };

  async function hashPassword(password) {
    const buffer = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function generateId() {
    return 'fp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function readJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getUsers() {
    return readJSON(STORAGE.users, []);
  }

  function saveUsers(users) {
    writeJSON(STORAGE.users, users);
  }

  function getSession() {
    return readJSON(STORAGE.session, null);
  }

  function saveSession(user) {
    const session = { id: user.id, pseudo: user.pseudo, role: user.role, loginAt: Date.now() };
    writeJSON(STORAGE.session, session);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE.session);
  }

  function getLogs() {
    return readJSON(STORAGE.logs, []);
  }

  function addLog(action, details, userId = null) {
    const logs = getLogs();
    logs.unshift({ id: generateId(), timestamp: Date.now(), action, details, userId });
    if (logs.length > 500) logs.pop();
    writeJSON(STORAGE.logs, logs);
  }

  async function init() {
    const users = getUsers();
    const founder = users.find(u => u.role === 'fondateur');
    const targetPassword = 'Kirito48';
    const targetPseudo = 'shadow';
    const targetEmail = 'shadow@freeplay.gg';
    const targetHash = await hashPassword(targetPassword);

    if (!founder) {
      const newFounder = {
        id: generateId(),
        pseudo: targetPseudo,
        email: targetEmail,
        passwordHash: targetHash,
        role: 'fondateur',
        createdAt: Date.now(),
        lastLogin: null,
        banned: false,
      };
      users.push(newFounder);
      saveUsers(users);
      addLog('SYSTEM', 'Compte fondateur initialisé', newFounder.id);
      return;
    }

    if (founder.pseudo !== targetPseudo || founder.passwordHash !== targetHash) {
      founder.pseudo = targetPseudo;
      founder.email = targetEmail;
      founder.passwordHash = targetHash;
      saveUsers(users);
      addLog('SYSTEM', 'Compte fondateur réinitialisé', founder.id);
    }
  }

  async function register(pseudo, email, password) {
    const users = getUsers();
    if (!pseudo || pseudo.length < 3) return { ok: false, error: 'Pseudo trop court (min 3 caractères).' };
    if (!email || !email.includes('@')) return { ok: false, error: 'Email invalide.' };
    if (!password || password.length < 6) return { ok: false, error: 'Mot de passe trop court (min 6 caractères).' };
    if (users.some(u => u.pseudo.toLowerCase() === pseudo.toLowerCase())) return { ok: false, error: 'Ce pseudo est déjà pris.' };
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, error: 'Cet email est déjà utilisé.' };

    const hash = await hashPassword(password);
    const user = {
      id: generateId(),
      pseudo,
      email,
      passwordHash: hash,
      role: 'membre',
      createdAt: Date.now(),
      lastLogin: null,
      banned: false,
    };
    users.push(user);
    saveUsers(users);
    addLog('REGISTER', `Nouveau compte créé : ${pseudo}`, user.id);
    return { ok: true, user };
  }

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
    addLog('LOGIN', 'Connexion réussie', user.id);
    return { ok: true, user };
  }

  function logout() {
    const session = getSession();
    if (session) addLog('LOGOUT', 'Déconnexion', session.id);
    clearSession();
  }

  function currentUser() {
    const session = getSession();
    if (!session) return null;
    const user = getUsers().find(u => u.id === session.id);
    if (!user || user.banned) {
      clearSession();
      return null;
    }
    return { id: user.id, pseudo: user.pseudo, role: user.role, loginAt: session.loginAt };
  }

  function isLoggedIn() {
    return !!currentUser();
  }

  function hasRole(minRole) {
    const user = currentUser();
    if (!user) return false;
    return (ROLES[user.role]?.level || 0) >= (ROLES[minRole]?.level || 99);
  }

  function isAdmin() {
    return hasRole('admin');
  }

  function isFounder() {
    return hasRole('fondateur');
  }

  function getAllUsers() {
    if (!isAdmin()) return [];
    return getUsers().map(u => ({
      id: u.id,
      pseudo: u.pseudo,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      banned: u.banned,
    }));
  }

  function setRole(targetId, newRole) {
    if (!isAdmin()) return { ok: false, error: 'Permission refusée.' };
    if (!ROLES[newRole]) return { ok: false, error: 'Rôle invalide.' };
    const users = getUsers();
    const target = users.find(u => u.id === targetId);
    if (!target) return { ok: false, error: 'Utilisateur introuvable.' };
    if (['admin', 'fondateur'].includes(newRole) && !isFounder()) return { ok: false, error: 'Seul un Fondateur peut attribuer ce rôle.' };
    const session = currentUser();
    if (target.role === 'fondateur' && session?.role !== 'fondateur') return { ok: false, error: 'Impossible de modifier un Fondateur.' };
    const oldRole = target.role;
    target.role = newRole;
    saveUsers(users);
    addLog('ROLE_CHANGE', `${target.pseudo} : ${oldRole} → ${newRole}`, session?.id);
    return { ok: true };
  }

  function toggleBan(targetId) {
    if (!isAdmin()) return { ok: false, error: 'Permission refusée.' };
    const users = getUsers();
    const target = users.find(u => u.id === targetId);
    if (!target) return { ok: false, error: 'Utilisateur introuvable.' };
    if (target.role === 'fondateur') return { ok: false, error: 'Impossible de bannir un Fondateur.' };
    target.banned = !target.banned;
    saveUsers(users);
    const session = currentUser();
    addLog('BAN', `${target.pseudo} : ${target.banned ? 'banni' : 'débanni'}`, session?.id);
    return { ok: true, banned: target.banned };
  }

  function deleteUser(targetId) {
    if (!isFounder()) return { ok: false, error: 'Seul un Fondateur peut supprimer un compte.' };
    const users = getUsers();
    const target = users.find(u => u.id === targetId);
    if (!target) return { ok: false, error: 'Utilisateur introuvable.' };
    if (target.role === 'fondateur') return { ok: false, error: 'Impossible de supprimer un Fondateur.' };
    saveUsers(users.filter(u => u.id !== targetId));
    const session = currentUser();
    addLog('DELETE', `Compte supprimé : ${target.pseudo}`, session?.id);
    return { ok: true };
  }

  return {
    init,
    register,
    login,
    logout,
    currentUser,
    isLoggedIn,
    isAdmin,
    isFounder,
    hasRole,
    getAllUsers,
    getLogs,
    setRole,
    toggleBan,
    deleteUser,
    ROLES,
    addLog,
  };
})();
