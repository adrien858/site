// =============================================
// GAMES-DATA.JS — Jeux organisés par plateforme
// =============================================

const PLATFORMS = {
  pc:      { label: 'PC',        icon: '💻', color: '#00e5ff' },
  switch:  { label: 'Nintendo Switch', icon: '🟥', color: '#e4000f' },
  xbox:    { label: 'Xbox',      icon: '🟢', color: '#107c10' },
  playstation: { label: 'PlayStation', icon: '🔵', color: '#003791' },
  mobile:  { label: 'Mobile',   icon: '📱', color: '#ff9500' },
  browser: { label: 'Navigateur', icon: '🌐', color: '#ffbe00' },
};

const CATEGORIES = {
  action:    { label: 'Action',     icon: '⚔️' },
  fps:       { label: 'FPS / Tir',  icon: '🔫' },
  aventure:  { label: 'Aventure',   icon: '🗺️' },
  rpg:       { label: 'RPG',        icon: '🧙' },
  sport:     { label: 'Sport',      icon: '⚽' },
  course:    { label: 'Course',     icon: '🏎️' },
  strategie: { label: 'Stratégie',  icon: '♟️' },
  puzzle:    { label: 'Puzzle',     icon: '🧩' },
  arcade:    { label: 'Arcade',     icon: '👾' },
  io:        { label: '.io Online', icon: '🌐' },
  survival:  { label: 'Survie',     icon: '🪓' },
  moba:      { label: 'MOBA',       icon: '🏟️' },
  mmo:       { label: 'MMO',        icon: '🌍' },
};

const games = [

  // ════════════ PC ════════════
  { id:'pc01', name:'Fortnite',         emoji:'🏝️', platforms:['pc','xbox','playstation','switch','mobile'], cat:'battle-royale', catLabel:'Battle Royale', desc:'Le battle royale le plus populaire du monde. Construction + tir.', url:'https://www.fortnite.com', featured:true,  tags:['battle royale','tir','construction'] },
  { id:'pc02', name:'Valorant',         emoji:'🎯', platforms:['pc'], cat:'fps', catLabel:'FPS', desc:'FPS tactique 5v5 avec des agents aux capacités uniques.', url:'https://playvalorant.com', featured:true, tags:['fps','tactique','compétitif'] },
  { id:'pc03', name:'League of Legends',emoji:'🏆', platforms:['pc'], cat:'moba', catLabel:'MOBA', desc:'Le MOBA le plus joué au monde — 5v5 sur la Faille de l\'Invocateur.', url:'https://www.leagueoflegends.com', featured:true, tags:['moba','compétitif','stratégie'] },
  { id:'pc04', name:'Genshin Impact',   emoji:'✨', platforms:['pc','mobile','playstation'], cat:'rpg', catLabel:'RPG', desc:'RPG open world en free-to-play avec graphismes époustouflants.', url:'https://genshin.hoyoverse.com', featured:true, tags:['rpg','open world','gacha'] },
  { id:'pc05', name:'Apex Legends',     emoji:'💠', platforms:['pc','xbox','playstation','switch'], cat:'fps', catLabel:'FPS Battle Royale', desc:'Battle royale FPS avec des légendes aux pouvoirs uniques.', url:'https://www.ea.com/games/apex-legends', featured:true, tags:['fps','battle royale','compétitif'] },
  { id:'pc06', name:'Warframe',         emoji:'🤖', platforms:['pc','xbox','playstation','switch'], cat:'action', catLabel:'Action RPG', desc:'Shooter co-op futuriste avec des ninjas spatiaux. Contenu massif.', url:'https://www.warframe.com', featured:false, tags:['action','rpg','coop'] },
  { id:'pc07', name:'Path of Exile',    emoji:'💀', platforms:['pc','xbox','playstation'], cat:'rpg', catLabel:'RPG', desc:'RPG dark fantasy avec un système de compétences ultra profond.', url:'https://www.pathofexile.com', featured:false, tags:['rpg','dark','loot'] },
  { id:'pc08', name:'Dota 2',           emoji:'⚔️', platforms:['pc'], cat:'moba', catLabel:'MOBA', desc:'MOBA compétitif de Valve — le plus complexe du genre.', url:'https://www.dota2.com', featured:false, tags:['moba','compétitif','stratégie'] },
  { id:'pc09', name:'CS2',             emoji:'🔫', platforms:['pc'], cat:'fps', catLabel:'FPS', desc:'Counter-Strike 2 — le FPS tactique de référence, gratuit.', url:'https://www.counter-strike.net', featured:true, tags:['fps','tactique','compétitif'] },
  { id:'pc10', name:'Warzone',          emoji:'☢️', platforms:['pc','xbox','playstation'], cat:'fps', catLabel:'FPS Battle Royale', desc:'Battle royale Call of Duty — 150 joueurs, carte massive.', url:'https://www.callofduty.com/warzone', featured:true, tags:['fps','battle royale','coop'] },
  { id:'pc11', name:'Team Fortress 2',  emoji:'🎩', platforms:['pc'], cat:'fps', catLabel:'FPS', desc:'Le FPS fun et coloré de Valve — 9 classes uniques.', url:'https://www.teamfortress.com', featured:false, tags:['fps','coop','fun'] },
  { id:'pc12', name:'Lost Ark',         emoji:'⚓', platforms:['pc'], cat:'mmo', catLabel:'MMO RPG', desc:'MMO action RPG coréen — contenu pharaonique gratuit.', url:'https://www.playlostark.com', featured:false, tags:['mmo','rpg','action'] },
  { id:'pc13', name:'Smite',            emoji:'⚡', platforms:['pc','xbox','playstation','switch'], cat:'moba', catLabel:'MOBA', desc:'MOBA en 3rd person avec des dieux mythologiques.', url:'https://www.smitegame.com', featured:false, tags:['moba','action','mythologie'] },
  { id:'pc14', name:'Splitgate',        emoji:'🌀', platforms:['pc','xbox','playstation'], cat:'fps', catLabel:'FPS', desc:'FPS avec des portails façon Portal + Halo. Innovant.', url:'https://www.splitgate.com', featured:false, tags:['fps','portails','arène'] },
  { id:'pc15', name:'Phantasy Star Online 2', emoji:'🌌', platforms:['pc','xbox'], cat:'mmo', catLabel:'MMO Action', desc:'MMO action free-to-play de Sega avec du contenu régulier.', url:'https://pso2.com', featured:false, tags:['mmo','action','rpg'] },
  { id:'pc16', name:'Star Wars: The Old Republic', emoji:'🚀', platforms:['pc'], cat:'mmo', catLabel:'MMO RPG', desc:'MMO Star Wars avec narration cinématique BioWare.', url:'https://www.swtor.com', featured:false, tags:['mmo','rpg','star wars'] },
  { id:'pc17', name:'Rocket League',    emoji:'🚀', platforms:['pc','xbox','playstation','switch'], cat:'sport', catLabel:'Sport', desc:'Football avec des voitures. Compétitif et addictif.', url:'https://www.rocketleague.com', featured:true, tags:['sport','voiture','compétitif'] },
  { id:'pc18', name:'Paladins',         emoji:'🛡️', platforms:['pc','xbox','playstation','switch'], cat:'fps', catLabel:'FPS Hero Shooter', desc:'Hero shooter gratuit — alternative à Overwatch.', url:'https://www.paladins.com', featured:false, tags:['fps','hero','compétitif'] },
  { id:'pc19', name:'World of Tanks',   emoji:'🪖', platforms:['pc','xbox','playstation'], cat:'action', catLabel:'Action', desc:'Batailles de chars historiques en PvP. Gratuit.', url:'https://worldoftanks.eu', featured:false, tags:['action','char','historique'] },
  { id:'pc20', name:'Eve Online',       emoji:'🛸', platforms:['pc'], cat:'mmo', catLabel:'MMO Spatial', desc:'MMO spatial sandbox — économie joueur et guerres épiques.', url:'https://www.eveonline.com', featured:false, tags:['mmo','spatial','sandbox'] },
  { id:'pc21', name:'Albion Online',    emoji:'⚔️', platforms:['pc','mobile'], cat:'mmo', catLabel:'MMO Sandbox', desc:'MMO sandbox full-loot — économie entièrement joueur.', url:'https://albiononline.com', featured:false, tags:['mmo','sandbox','pvp'] },

  // ════════════ PLAYSTATION ════════════
  { id:'ps01', name:'Fortnite',         emoji:'🏝️', platforms:['pc','xbox','playstation','switch','mobile'], cat:'battle-royale', catLabel:'Battle Royale', desc:'Le battle royale le plus populaire du monde.', url:'https://www.fortnite.com', featured:false, tags:['battle royale','tir'] },
  { id:'ps02', name:'Apex Legends',     emoji:'💠', platforms:['pc','xbox','playstation','switch'], cat:'fps', catLabel:'FPS Battle Royale', desc:'Battle royale FPS avec légendes aux pouvoirs uniques.', url:'https://www.ea.com/games/apex-legends', featured:false, tags:['fps','battle royale'] },
  { id:'ps03', name:'Genshin Impact',   emoji:'✨', platforms:['pc','mobile','playstation'], cat:'rpg', catLabel:'RPG', desc:'RPG open world magnifique en free-to-play.', url:'https://genshin.hoyoverse.com', featured:false, tags:['rpg','open world'] },
  { id:'ps04', name:'Warzone',          emoji:'☢️', platforms:['pc','xbox','playstation'], cat:'fps', catLabel:'FPS Battle Royale', desc:'Battle royale Call of Duty — la référence sur console.', url:'https://www.callofduty.com/warzone', featured:false, tags:['fps','battle royale'] },
  { id:'ps05', name:'Rocket League',    emoji:'🚀', platforms:['pc','xbox','playstation','switch'], cat:'sport', catLabel:'Sport', desc:'Football avec des voitures — jouable sur PS4/PS5.', url:'https://www.rocketleague.com', featured:false, tags:['sport','voiture'] },
  { id:'ps06', name:'Fall Guys',        emoji:'🫘', platforms:['pc','xbox','playstation','switch'], cat:'arcade', catLabel:'Party Game', desc:'Party game battle royale coloré et chaotique.', url:'https://www.fallguys.com', featured:true, tags:['party game','fun','arcade'] },
  { id:'ps07', name:'Multiversus',      emoji:'🥊', platforms:['pc','xbox','playstation'], cat:'action', catLabel:'Combat', desc:'Jeu de combat Warner Bros avec des persos cultes.', url:'https://multiversus.com', featured:false, tags:['combat','warner','fun'] },
  { id:'ps08', name:'Warframe',         emoji:'🤖', platforms:['pc','xbox','playstation','switch'], cat:'action', catLabel:'Action RPG', desc:'Shooter co-op futuriste disponible sur PS4/PS5.', url:'https://www.warframe.com', featured:false, tags:['action','rpg','coop'] },
  { id:'ps09', name:'Brawlhalla',       emoji:'🥋', platforms:['pc','xbox','playstation','switch','mobile'], cat:'action', catLabel:'Combat', desc:'Jeu de combat en ligne — style Smash Bros, gratuit.', url:'https://www.brawlhalla.com', featured:false, tags:['combat','plateforme','pvp'] },
  { id:'ps10', name:'eFootball',        emoji:'⚽', platforms:['pc','xbox','playstation','mobile'], cat:'sport', catLabel:'Football', desc:'PES rebaptisé eFootball — football gratuit de Konami.', url:'https://www.konami.com/efootball', featured:false, tags:['sport','football','simulation'] },

  // ════════════ XBOX ════════════
  { id:'xb01', name:'Fortnite',         emoji:'🏝️', platforms:['pc','xbox','playstation','switch','mobile'], cat:'battle-royale', catLabel:'Battle Royale', desc:'Le battle royale numéro 1 mondial.', url:'https://www.fortnite.com', featured:false, tags:['battle royale','tir'] },
  { id:'xb02', name:'Halo Infinite',    emoji:'🪖', platforms:['pc','xbox'], cat:'fps', catLabel:'FPS', desc:'Le FPS emblématique Xbox — multijoueur gratuit.', url:'https://www.halowaypoint.com', featured:true, tags:['fps','sci-fi','xbox'] },
  { id:'xb03', name:'Warzone',          emoji:'☢️', platforms:['pc','xbox','playstation'], cat:'fps', catLabel:'FPS Battle Royale', desc:'Battle royale CoD disponible sur Xbox One / Series.', url:'https://www.callofduty.com/warzone', featured:false, tags:['fps','battle royale'] },
  { id:'xb04', name:'Apex Legends',     emoji:'💠', platforms:['pc','xbox','playstation','switch'], cat:'fps', catLabel:'FPS Battle Royale', desc:'Battle royale FPS compétitif sur Xbox.', url:'https://www.ea.com/games/apex-legends', featured:false, tags:['fps','battle royale'] },
  { id:'xb05', name:'Rocket League',    emoji:'🚀', platforms:['pc','xbox','playstation','switch'], cat:'sport', catLabel:'Sport', desc:'Football avec des voitures — cross-play Xbox.', url:'https://www.rocketleague.com', featured:false, tags:['sport','voiture'] },
  { id:'xb06', name:'Fall Guys',        emoji:'🫘', platforms:['pc','xbox','playstation','switch'], cat:'arcade', catLabel:'Party Game', desc:'Party game battle royale — fun garanti.', url:'https://www.fallguys.com', featured:false, tags:['party game','fun'] },
  { id:'xb07', name:'Phantasy Star Online 2', emoji:'🌌', platforms:['pc','xbox'], cat:'mmo', catLabel:'MMO Action', desc:'MMO action gratuit disponible sur Xbox.', url:'https://pso2.com', featured:false, tags:['mmo','rpg'] },
  { id:'xb08', name:'Brawlhalla',       emoji:'🥋', platforms:['pc','xbox','playstation','switch','mobile'], cat:'action', catLabel:'Combat', desc:'Jeu de combat cross-play style Smash Bros.', url:'https://www.brawlhalla.com', featured:false, tags:['combat','pvp'] },

  // ════════════ NINTENDO SWITCH ════════════
  { id:'sw01', name:'Fortnite',         emoji:'🏝️', platforms:['pc','xbox','playstation','switch','mobile'], cat:'battle-royale', catLabel:'Battle Royale', desc:'Le battle royale le plus populaire — en mode portable.', url:'https://www.fortnite.com', featured:false, tags:['battle royale','tir'] },
  { id:'sw02', name:'Pokémon Unite',    emoji:'🟡', platforms:['switch','mobile'], cat:'moba', catLabel:'MOBA', desc:'MOBA Pokémon en équipes de 5 — fun et stratégique.', url:'https://unite.pokemon.com', featured:true, tags:['moba','pokemon','stratégie'] },
  { id:'sw03', name:'Apex Legends',     emoji:'💠', platforms:['pc','xbox','playstation','switch'], cat:'fps', catLabel:'FPS Battle Royale', desc:'Apex Legends disponible sur Switch.', url:'https://www.ea.com/games/apex-legends', featured:false, tags:['fps','battle royale'] },
  { id:'sw04', name:'Rocket League',    emoji:'🚀', platforms:['pc','xbox','playstation','switch'], cat:'sport', catLabel:'Sport', desc:'Football en voiture — cross-play sur Switch.', url:'https://www.rocketleague.com', featured:false, tags:['sport','voiture'] },
  { id:'sw05', name:'Fall Guys',        emoji:'🫘', platforms:['pc','xbox','playstation','switch'], cat:'arcade', catLabel:'Party Game', desc:'Party game battle royale — parfait en mode portable.', url:'https://www.fallguys.com', featured:false, tags:['party game','fun'] },
  { id:'sw06', name:'Brawlhalla',       emoji:'🥋', platforms:['pc','xbox','playstation','switch','mobile'], cat:'action', catLabel:'Combat', desc:'Combat style Smash Bros en ligne gratuit.', url:'https://www.brawlhalla.com', featured:false, tags:['combat','pvp'] },
  { id:'sw07', name:'Smite',            emoji:'⚡', platforms:['pc','xbox','playstation','switch'], cat:'moba', catLabel:'MOBA', desc:'MOBA en 3rd person avec dieux mythologiques.', url:'https://www.smitegame.com', featured:false, tags:['moba','action'] },
  { id:'sw08', name:'Warframe',         emoji:'🤖', platforms:['pc','xbox','playstation','switch'], cat:'action', catLabel:'Action RPG', desc:'Shooter co-op futuriste — disponible sur Switch.', url:'https://www.warframe.com', featured:false, tags:['action','rpg'] },

  // ════════════ MOBILE ════════════
  { id:'mb01', name:'PUBG Mobile',      emoji:'🪖', platforms:['mobile'], cat:'fps', catLabel:'FPS Battle Royale', desc:'Le battle royale PUBG sur mobile — 100 joueurs.', url:'https://pubgmobile.com', featured:true, tags:['fps','battle royale','mobile'] },
  { id:'mb02', name:'Clash Royale',     emoji:'👑', platforms:['mobile'], cat:'strategie', catLabel:'Stratégie', desc:'Duels de cartes en temps réel — compétitif et addictif.', url:'https://clashroyale.com', featured:true, tags:['stratégie','cartes','pvp'] },
  { id:'mb03', name:'Clash of Clans',   emoji:'🏰', platforms:['mobile'], cat:'strategie', catLabel:'Stratégie', desc:'Construction de base et raids — le classique mobile.', url:'https://clashofclans.com', featured:false, tags:['stratégie','construction','base'] },
  { id:'mb04', name:'Pokémon GO',       emoji:'🎮', platforms:['mobile'], cat:'aventure', catLabel:'Aventure AR', desc:'Capture des Pokémon dans la réalité augmentée.', url:'https://pokemongolive.com', featured:true, tags:['ar','pokemon','aventure'] },
  { id:'mb05', name:'Genshin Impact',   emoji:'✨', platforms:['pc','mobile','playstation'], cat:'rpg', catLabel:'RPG', desc:'Le RPG open world le plus beau sur mobile.', url:'https://genshin.hoyoverse.com', featured:false, tags:['rpg','open world'] },
  { id:'mb06', name:'Brawl Stars',      emoji:'⭐', platforms:['mobile'], cat:'action', catLabel:'Action', desc:'Jeux de tir multijoueur de Supercell — rapide et fun.', url:'https://brawlstars.com', featured:true, tags:['action','tir','pvp'] },
  { id:'mb07', name:'Mobile Legends',   emoji:'🏟️', platforms:['mobile'], cat:'moba', catLabel:'MOBA', desc:'MOBA 5v5 optimisé mobile — le plus populaire en Asie.', url:'https://mobilelegends.com', featured:false, tags:['moba','pvp','compétitif'] },
  { id:'mb08', name:'Pokémon Unite',    emoji:'🟡', platforms:['switch','mobile'], cat:'moba', catLabel:'MOBA', desc:'MOBA Pokémon disponible sur mobile.', url:'https://unite.pokemon.com', featured:false, tags:['moba','pokemon'] },
  { id:'mb09', name:'Brawlhalla',       emoji:'🥋', platforms:['pc','xbox','playstation','switch','mobile'], cat:'action', catLabel:'Combat', desc:'Combat cross-play disponible sur mobile.', url:'https://www.brawlhalla.com', featured:false, tags:['combat','pvp'] },
  { id:'mb10', name:'eFootball',        emoji:'⚽', platforms:['pc','xbox','playstation','mobile'], cat:'sport', catLabel:'Football', desc:'Football gratuit de Konami sur mobile.', url:'https://www.konami.com/efootball', featured:false, tags:['sport','football'] },

  // ════════════ NAVIGATEUR ════════════
  { id:'br01', name:'Krunker.io',       emoji:'🔫', platforms:['browser'], cat:'fps', catLabel:'FPS .io', desc:'FPS multijoueur ultra-rapide dans le navigateur.', url:'https://krunker.io', featured:true, tags:['fps','io','multijoueur'] },
  { id:'br02', name:'Agar.io',          emoji:'🟢', platforms:['browser'], cat:'io', catLabel:'.io', desc:'Mange des cellules et grandis — le classique .io.', url:'https://agar.io', featured:false, tags:['io','arcade'] },
  { id:'br03', name:'Slither.io',       emoji:'🐍', platforms:['browser'], cat:'io', catLabel:'.io', desc:'Serpent multijoueur — sois le plus grand.', url:'https://slither.io', featured:false, tags:['io','arcade'] },
  { id:'br04', name:'1v1.LOL',          emoji:'🏗️', platforms:['browser'], cat:'fps', catLabel:'FPS / Build', desc:'Fortnite dans le navigateur — construction et tir.', url:'https://1v1.lol', featured:true, tags:['fps','construction','battle royale'] },
  { id:'br05', name:'Minecraft Classic',emoji:'🟫', platforms:['browser'], cat:'aventure', catLabel:'Aventure', desc:'Minecraft original jouable dans le navigateur.', url:'https://classic.minecraft.net', featured:true, tags:['sandbox','construction','classique'] },
  { id:'br06', name:'Lichess',          emoji:'♟️', platforms:['browser'], cat:'strategie', catLabel:'Stratégie', desc:'Échecs en ligne open source et 100% gratuit.', url:'https://lichess.org', featured:false, tags:['échecs','stratégie','pvp'] },
  { id:'br07', name:'Colonist.io',      emoji:'🏝️', platforms:['browser'], cat:'strategie', catLabel:'Stratégie', desc:'Les Colons de Catane en ligne — gratuit.', url:'https://colonist.io', featured:false, tags:['stratégie','colons','pvp'] },
  { id:'br08', name:'Wordle (FR)',       emoji:'🟨', platforms:['browser'], cat:'puzzle', catLabel:'Puzzle', desc:'Trouve le mot en 6 essais — version française.', url:'https://wordle.louan.me', featured:false, tags:['puzzle','mots','quotidien'] },
  { id:'br09', name:'2048',             emoji:'🔢', platforms:['browser'], cat:'puzzle', catLabel:'Puzzle', desc:'Fusionne les tuiles pour atteindre 2048.', url:'https://play2048.co', featured:false, tags:['puzzle','réflexion'] },
  { id:'br10', name:'Shell Shockers',   emoji:'🥚', platforms:['browser'], cat:'fps', catLabel:'FPS', desc:'FPS où tout le monde est un œuf armé. Ultra fun !', url:'https://shellshock.io', featured:false, tags:['fps','fun','io'] },
  { id:'br11', name:'Diep.io',          emoji:'🔵', platforms:['browser'], cat:'io', catLabel:'.io', desc:'Tank multijoueur en ligne — améliore tes stats.', url:'https://diep.io', featured:false, tags:['io','action'] },
  { id:'br12', name:'Madalin Stunt Cars 2', emoji:'🚗', platforms:['browser'], cat:'course', catLabel:'Course', desc:'Voitures de sport et cascades en monde ouvert.', url:'https://www.crazygames.com/game/madalin-stunt-cars-2', featured:false, tags:['course','voiture','open world'] },
  { id:'br13', name:'Cookie Clicker',   emoji:'🍪', platforms:['browser'], cat:'arcade', catLabel:'Arcade / Idle', desc:'Le jeu incrémental culte — clique sur le cookie.', url:'https://orteil.dashnet.org/cookieclicker', featured:false, tags:['idle','arcade','clicker'] },
];
