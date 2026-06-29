export const fr = {
  errors: {
    generic: '😕 Oups ! Une erreur est survenue. Réessayez.',
    tryAgain: '🔄 Réessaie dans quelques instants.',
    network: 'Erreur réseau. Réessaie dans quelques instants.',
    timeout: '⏱️ Délai dépassé. Réessaie.',
    notFound: '👻 Introuvable.',
    noWallets: '🔍 Aucun wallet pour le moment.',
    noBalance: '💸 Aucun solde disponible.',
    address: "⚠️ Cette adresse n'est pas valide.",
    amount: '⚠️ Montant invalide.',
    amountExcessive: '⚠️ Montant excessif. Vérifie la valeur saisie.',
    insufficientFunds: '💸 Solde insuffisant.',
    transactionFailed: '❌ Échec de la transaction.',
    adminOnly: '❌ Accès refusé — Admin uniquement.',
    unauthorizedChat: 'Ce bot est destiné à un usage personnel uniquement.',
    expiredAction: '⏱️ Action expirée.',
    cancelled: '✅ Annulé.',
  },

  start: {
    welcome: (name) => `👋 Salut ${name} ! 🪼 Bienvenue sur ton wallet crypto sécurisé !`,
  },

  wallet: {
    created: (chain, label) => `🎉 Wallet ${chain.toUpperCase()} créé : ${label}`,
    generated: '✨ Ton wallet a été créé avec succès !',
    deleted: (label) => `🗑️ Wallet "${label}" supprimé.`,
    list: '💰 Mes Wallets',
    notFound: '❌ Wallet non trouvé',
    noWallets: "🔍 Aucun wallet pour le moment. Utilise 'Nouveau Wallet' pour en créer un.",
    newWallet: '🆕 Nouveau Wallet',
    myKeys: '🔐 Mes Clés',
    seedWarning: "🔐 Garde cette phrase secrète ! C'est la clé de tes fonds.",
    neverShare: '⚠️ Ne la partage JAMAIS avec personne.',
    autoDelete: (seconds) => `🕐 Ce message sera supprimé dans ${seconds} secondes.`,
    balances: '💵 Soldes',
    totalBalance: '💎 Solde Total',
    copied: '📋 Copié !',
  },

  send: {
    enterAddress: "📬 Entre l'adresse du destinataire :",
    enterAmount: '💰 Quel montant veux-tu envoyer ?',
    selectAmountType: '💰 Type de montant',
    amountNative: (chain) => chain.toUpperCase(),
    amountEUR: 'Euros',
    sent: '✅ Transaction envoyée avec succès !',
    failed: "❌ Échec de l'envoi.",
    confirm: "✅ Confirmer l'envoi",
    cancel: "❌ Annuler l'envoi",
    fee: 'Frais',
    balance: 'Solde',
    invalidAddress: "⚠️ Cette adresse n'est pas valide.",
    noAddress: 'Aucune adresse saisie.',
    addressAnalysis: "🔍 Analyse d'adresse",

  },

  admin: {
    panel: '👑 Panel Admin',
    denied: '❌ Accès refusé — Admin uniquement.',
    stats: '📊 Statistiques',
    users: '👥 Utilisateurs',
    security: '🔒 Sécurité',
    audit: '🧪 Audit',
    blacklist: '⛔ Blacklist',
    logs: '📋 Logs',
    secrets: '🔐 Secrets',
    broadcast: '📢 Broadcast',
    viewUser: 'Voir utilisateur',
    viewKeys: 'Voir clés',
    ban: 'Bannir',
    unban: 'Débannir',
    deleteWallet: 'Supprimer wallet',
    confirmAction: 'Confirmer cette action admin ?',
  },

  prices: {
    title: '💹 Prix en euros',
    l1: '🏛️ L1 / Mainnets',
    l2: '⚡ L2 / Scaling',
    stablecoins: '🏦 Stablecoins',
    legacy: '🪙 Legacy / Forks',
    updated: (date) => `🕒 Mis à jour le ${date}`,
  },

  help: {
    title: '🆘 Aide',
    intro: 'Voici les commandes disponibles :',
    commands: [
      '/start - Démarrer le bot',
      '/id - Voir ton ChatID et UserID',
      "/cancel - Annuler l'opération en cours",
    ],
    features: 'Fonctionnalités :',
    featureList: [
      '💰 Mes Wallets - Gérer tes wallets',
      '💸 Envoyer - Envoyer des fonds',
      '💵 Soldes - Voir tous tes soldes',
      '🔍 Analyser - Analyser une adresse publique',
      '🆕 Nouveau Wallet - Créer un wallet',
      '🔐 Mes Clés - Voir tes clés privées',
      '📊 Cours EUR - Prix en euros',
      '🔄 Échanger - Échanger une crypto contre une autre, sans KYC',
    ],
  },

  // Button labels + menu headers (localized navigation chrome).
  menu: {
    principal: '🎮 <b>Menu Principal</b>',
    more: '☰ <b>Plus d’options</b>',
    settings: '⚙️ <b>Paramètres</b>',
    language: '🌐 <b>Langue</b>',
    closed: '❌ Menu fermé.',
    cancelled: '❌ <b>Opération annulée</b>',
    wallets: '💰 Wallets',
    new: '➕ Nouveau',
    receive: '📥 Recevoir',
    send: '📤 Envoyer',
    balances: '💵 Soldes',
    prices: '📊 Cours',
    moreBtn: '☰ Plus',
    close: '❌ Fermer',
    cancelBtn: '❌ Annuler',
    back: '↩️ Retour',
    exchange: '🔄 Échanger',
    invoice: '💳 Facture',
    lightning: '⚡ Lightning',
    analyze: '🔎 Analyser',
    keys: '🔐 Mes Clés',
    help: '❓ Aide',
    settingsBtn: '⚙️ Paramètres',
    languageBtn: '🌐 Langue',
  },

  settings: {
    title: '⚙️ <b>Paramètres</b>\n\nChoisis une option 👇',
    chooseLanguage: '🌐 <b>Langue</b>\n\nChoisis la langue du bot 👇',
    langFr: '🇫🇷 Français',
    langEn: '🇬🇧 English',
    changed: '✅ Langue mise à jour : Français 🇫🇷',
  },

  exchange: {
    pickFrom: '🔄 <b>Échanger sans KYC</b>\n\n1️⃣ Choisis la crypto à <b>donner</b> 👇',
    pickTo: (sym) =>
      `🔄 <b>Échanger sans KYC</b>\n\nTu donnes : <b>${sym}</b>\n\n2️⃣ Choisis la crypto à <b>recevoir</b> 👇`,
    pickFromNet: (sym) => `🌐 Sur quel réseau sont tes <b>${sym}</b> à donner ?`,
    pickToNet: (sym) => `🌐 Sur quel réseau veux-tu recevoir tes <b>${sym}</b> ?`,
    ready: (fromSym, toSym) =>
      '✅ <b>Échange prêt</b>\n' +
      '━━━━━━━━━━━━━━━\n' +
      `Tu donnes :  <b>${fromSym}</b>\n` +
      `Tu reçois :  <b>${toSym}</b>\n` +
      '━━━━━━━━━━━━━━━\n\n' +
      `📥 Ton adresse de réception <b>${toSym}</b> est déjà pré-remplie.\n` +
      `👉 Ouvre le lien, saisis le montant, puis envoie tes <b>${fromSym}</b> à l'adresse de dépôt affichée.\n\n` +
      '🔒 Sans KYC · meilleur taux automatique · le bot ne touche jamais tes fonds.',
    openButton: '🔒 Ouvrir l’échange',
    noWallet: (chainName) =>
      `👻 Pas encore de wallet <b>${chainName}</b> pour recevoir.\n\nCrée-en un (➕ Nouveau), puis relance l'échange.`,
    fromWallet: (sym) =>
      `🔄 <b>Échanger depuis ce wallet</b>\n\nTu donnes : <b>${sym}</b>\n\n2️⃣ Choisis la crypto à <b>recevoir</b> 👇`,
    quoteExact: (fromSym, amt, toSym, provider) =>
      `💱 Taux : 1 ${fromSym} ≈ <b>${amt} ${toSym}</b> <i>(via ${provider})</i>`,
    quoteMarket: (fromSym, amt, toSym) =>
      `💱 1 ${fromSym} ≈ <b>${amt} ${toSym}</b> <i>(taux marché, hors frais)</i>`,
    netFee: (amt, sym) => `⛽ Frais réseau d'envoi ≈ <b>${amt} ${sym}</b>`,
  },
};
