# 🎮 FreePlay — Site de jeux gratuits

Site de jeux gratuits avec système d'authentification et panel d'administration.
Hébergé **gratuitement sur GitHub Pages**.

---

## 🔐 Compte Fondateur par défaut

| Champ | Valeur |
|-------|--------|
| **Pseudo** | `FreePlayAdmin` |
| **Mot de passe** | `FreePlay@2025!` |
| **Rôle** | 👑 Fondateur |

> ⚠️ **Change ce mot de passe** dès ta première connexion en te reconnectant avec un nouveau compte fondateur.

---

## 🚀 Déploiement sur GitHub Pages (gratuit)

### Étape 1 — Créer un dépôt
1. Va sur [github.com](https://github.com) → **New repository**
2. Nom : `freeplay` (ou ce que tu veux)
3. Visibilité : **Public**
4. Clique **Create repository**

### Étape 2 — Envoyer les fichiers
```bash
git init
git add .
git commit -m "🎮 FreePlay v2 — Auth + Admin Panel"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/NOM_DU_REPO.git
git push -u origin main
```

### Étape 3 — Activer GitHub Pages
1. Settings → Pages
2. Source : **Deploy from branch** → `main` / `/ (root)`
3. Save

✅ Site en ligne à : `https://TON_USERNAME.github.io/NOM_DU_REPO`

---

## 🎖️ Système de rôles

| Rôle | Accès |
|------|-------|
| 👤 **Membre** | Visite le site, joue aux jeux |
| 🛡️ **Modérateur** | Membre + gestion basique |
| ⚙️ **Admin** | Voir les comptes, gérer les rôles Membre/Modérateur, bannir |
| 👑 **Fondateur** | Tout + logs complets, supprimer des comptes, attribuer Admin/Fondateur |

---

## 📁 Structure

```
├── index.html      → Structure HTML
├── style.css       → Design complet
├── auth.js         → Système d'authentification (localStorage)
├── games-data.js   → Tous les jeux (PC, PS, Xbox, Switch, Mobile, Navigateur)
├── app.js          → Logique principale + admin panel
└── README.md       → Ce fichier
```

---

## ➕ Ajouter un jeu

Dans `games-data.js`, ajoute un objet dans le tableau `games` :

```js
{
  id: 'xx01',
  name: 'Nom du jeu',
  emoji: '🎮',
  platforms: ['pc', 'playstation'],   // pc | xbox | playstation | switch | mobile | browser
  cat: 'fps',                          // voir CATEGORIES dans games-data.js
  catLabel: 'FPS',
  desc: 'Description courte.',
  url: 'https://...',
  featured: false,                     // true = section "À la une"
  tags: ['fps', 'multijoueur'],
},
```

---

## ⚠️ Note sécurité

Les données sont stockées dans le `localStorage` du navigateur.
- ✅ Parfait pour un projet perso / communautaire GitHub Pages
- ❌ Pas de base de données partagée entre appareils
- ❌ Ne stocke pas de vraies données sensibles
