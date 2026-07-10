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
    faqBtn: '⁉️ FAQ',
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

  learn: {
    menuTitle:
      '📚 <b>Leçons crypto</b>\n' +
      '━━━━━━━━━━━━━━━\n\n' +
      'Choisis une leçon 👇\n\n' +
      '💡 Accès direct : <code>/learn btc</code>, <code>/learn iou</code>…',
    backToMenu: '📚 Toutes les leçons',
    lessons: {
      btc: {
        title: '₿ Bitcoin',
        body:
          '₿ <b>Bitcoin (BTC)</b>\n\n' +
          'La première blockchain (2009, Satoshi Nakamoto) : un registre public sécurisé par la <b>preuve de travail</b> (minage).\n\n' +
          "• Offre limitée à <b>21 millions</b> de BTC — cette rareté fait l'« or numérique ».\n" +
          '• Modèle <b>UTXO</b> : ton solde = la somme de « pièces » non dépensées.\n' +
          '• Plus petite unité : le <b>satoshi</b> (1 BTC = 100 000 000 sats).\n\n' +
          '💡 Essaie <code>/unit 1 btc</code> pour la conversion.',
      },
      ltc: {
        title: '🥈 Litecoin',
        body:
          '🥈 <b>Litecoin (LTC)</b>\n\n' +
          "L'« argent » face à l'or Bitcoin : un fork de Bitcoin (2011) avec des blocs 4× plus rapides (2,5 min) et des frais très bas.\n\n" +
          '• Même modèle UTXO que Bitcoin, offre limitée à <b>84 millions</b>.\n' +
          '• Adresses <code>ltc1...</code> (SegWit), <code>L...</code> ou <code>M...</code>.\n\n' +
          '💡 Souvent utilisé pour les petits transferts rapides entre exchanges.',
      },
      bch: {
        title: '💚 Bitcoin Cash',
        body:
          '💚 <b>Bitcoin Cash (BCH)</b>\n\n' +
          "Fork de Bitcoin (2017) né d'un désaccord sur la taille des blocs : BCH a choisi de <b>gros blocs</b> pour des frais minimes.\n\n" +
          '• Même modèle UTXO ; adresses au format <b>CashAddr</b> (<code>bitcoincash:q...</code>), convertibles depuis le format legacy (<code>1...</code>).\n\n' +
          "⚠️ BCH et BTC sont des chaînes <b>différentes</b> : envoyer du BTC à une adresse BCH (ou l'inverse) peut perdre les fonds.",
      },
      eth: {
        title: 'Ξ Ethereum',
        body:
          'Ξ <b>Ethereum (ETH)</b>\n\n' +
          "La blockchain des <b>smart contracts</b> : des programmes qui s'exécutent sur la chaîne (DeFi, NFT, stablecoins).\n\n" +
          '• Les frais s’appellent le <b>gas</b>, payés en ETH (voir <code>/gas eth</code>).\n' +
          '• Les tokens <b>ERC-20</b> (USDT, USDC, DAI…) vivent sur Ethereum.\n' +
          "• Sécurisée par la <b>preuve d'enjeu</b> (staking) depuis 2022.\n" +
          '• Unités : 1 ETH = 10⁹ gwei = 10¹⁸ wei.\n\n' +
          '🚀 Ses <b>Layer 2</b> (Arbitrum, Optimism, Base…) → <code>/learn l2</code>.',
      },
      avax: {
        title: '🔴 Avalanche',
        body:
          '🔴 <b>Avalanche (AVAX)</b>\n\n' +
          'Blockchain rapide à finalité quasi instantanée. Le bot utilise la <b>C-Chain</b>, compatible EVM.\n\n' +
          "• Mêmes adresses <code>0x...</code> qu'Ethereum, tokens ERC-20 (USDT, USDC…).\n" +
          '• AVAX paie le gas ; une partie des frais est <b>brûlée</b>.\n\n' +
          "⚠️ C-Chain ≠ X-Chain/P-Chain : ici, c'est toujours la C-Chain (EVM).",
      },
      bnb: {
        title: '🟡 BNB Chain',
        body:
          '🟡 <b>BNB Chain (BNB)</b>\n\n' +
          "La blockchain EVM liée à l'écosystème Binance (ex-BSC). Très utilisée pour ses frais bas.\n\n" +
          "• Mêmes adresses <code>0x...</code> qu'Ethereum ; tokens au standard <b>BEP-20</b> (équivalent ERC-20).\n" +
          '• BNB paie le gas.\n\n' +
          '💡 Un même USDT existe en ERC-20, BEP-20, TRC-20… : ce sont des réseaux différents → <code>/learn network</code>.',
      },
      sol: {
        title: '◎ Solana',
        body:
          '◎ <b>Solana (SOL)</b>\n\n' +
          'Blockchain à <b>haut débit</b> : des milliers de transactions/seconde pour des frais minuscules (fractions de centime).\n\n' +
          "• Ses tokens s'appellent des <b>SPL</b> (USDC, USDT…) — l'équivalent des ERC-20 d'Ethereum.\n" +
          '• Plus petite unité : le <b>lamport</b> (1 SOL = 10⁹ lamports).\n\n' +
          "⚠️ Zcash n'est <b>pas</b> un token SPL → <code>/learn zec</code>.",
      },
      zec: {
        title: '🛡️ Zcash',
        body:
          '🛡️ <b>Zcash (ZEC)</b>\n\n' +
          'Blockchain <b>L1 indépendante</b>, fork du code Bitcoin, spécialisée dans la <b>confidentialité</b> grâce aux preuves <b>zk-SNARK</b>.\n\n' +
          '• Adresses <b>transparentes</b> (<code>t...</code>) : publiques, comme Bitcoin.\n' +
          '• Adresses <b>blindées</b> (<code>z...</code>/<code>u...</code>) : montants et parties chiffrés.\n' +
          '• Modèle UTXO ; plus petite unité : le <b>zatoshi</b>.\n\n' +
          "❌ Ce n'est <b>pas</b> un token SPL Solana. Le « wrapped ZEC » croisé sur d'autres chaînes est un IOU → <code>/learn iou</code>.",
      },
      xmr: {
        title: '🕵️ Monero',
        body:
          '🕵️ <b>Monero (XMR)</b>\n\n' +
          'La référence des cryptos <b>privées</b> : la confidentialité est <b>par défaut</b>, pas optionnelle.\n\n' +
          '• <b>Signatures en anneau</b> + <b>adresses furtives</b> + montants masqués : émetteur, destinataire et montant sont invisibles.\n' +
          '• Contrairement à Zcash, impossible de faire une transaction « transparente ».\n' +
          '• Plus petite unité : le <b>piconero</b>.\n\n' +
          '🔑 Dans ce bot, Monero utilise sa propre seed (dérivation différente des autres chaînes).',
      },
      ton: {
        title: '💎 TON',
        body:
          '💎 <b>TON (Toncoin)</b>\n\n' +
          'Blockchain initiée par Telegram, pensée pour les paiements <b>dans la messagerie</b>. Très rapide, frais faibles.\n\n' +
          "• Ses tokens s'appellent des <b>jettons</b> (USDT existe en jetton).\n" +
          '• Les dépôts vers les exchanges exigent souvent un <b>memo/commentaire</b> — sans lui, les fonds peuvent être perdus.',
      },
      trx: {
        title: '🔺 Tron',
        body:
          '🔺 <b>Tron (TRX)</b>\n\n' +
          "Blockchain à frais réduits, devenue le <b>hub mondial de l'USDT</b> : le stablecoin y circule en <b>TRC-20</b>.\n\n" +
          '• Les frais se paient en « énergie » et « bande passante », rechargées en TRX.\n' +
          '• Plus petite unité : le <b>sun</b> (1 TRX = 1 000 000 sun).\n\n' +
          "💵 Beaucoup d'exchanges privilégient USDT-TRC20 : les retraits y sont bon marché.",
      },
      l1: {
        title: '🏛️ Layer 1',
        body:
          '🏛️ <b>Layer 1 (L1)</b>\n\n' +
          'Une blockchain <b>de base</b>, autonome : elle a ses propres validateurs/mineurs, son propre coin natif et sa propre sécurité. Bitcoin, Ethereum, Solana, Zcash, Monero, TON, Tron… sont des L1.\n\n' +
          '• Chaque L1 est un monde séparé : adresses, frais et règles différentes.\n' +
          "• Les <b>L2</b> (→ <code>/learn l2</code>) s'appuient sur une L1 pour leur sécurité.\n\n" +
          "💡 Dans ce bot, chaque réseau du menu correspond à une L1 (ou à une L2 d'Ethereum).",
      },
      l2: {
        title: '🚀 Layer 2',
        body:
          '🚀 <b>Layer 2 (L2)</b>\n\n' +
          "Des chaînes construites <b>au-dessus d'Ethereum</b> (Arbitrum, Optimism, Base, Polygon*) : elles regroupent les transactions puis les ancrent sur Ethereum.\n\n" +
          "• Mêmes adresses <code>0x...</code> qu'Ethereum — mais chaque réseau est séparé !\n" +
          "• Frais bien plus bas, sécurité héritée d'Ethereum.\n\n" +
          '⚠️ Envoyer sur le <b>mauvais réseau</b> peut faire perdre les fonds : vérifie toujours le réseau avant un envoi.\n' +
          '<i>*Polygon est techniquement une sidechain, souvent rangée avec les L2.</i>',
      },
      seed: {
        title: '🌱 Seed phrase',
        body:
          '🌱 <b>Seed phrase (phrase de récupération)</b>\n\n' +
          '12 ou 24 mots (standard <b>BIP39</b>) qui génèrent <b>toutes</b> tes clés privées. Qui connaît ta seed possède tes fonds — sur toutes les chaînes.\n\n' +
          '• Une seule seed dérive tes wallets BTC, ETH, SOL, TRX… (dans ce bot : toutes les chaînes sauf Monero, qui a la sienne).\n' +
          '• Note-la <b>hors ligne</b> (papier/métal). Jamais en photo, jamais dans le cloud.\n' +
          '• Personne de légitime ne te la demandera <b>jamais</b>.\n\n' +
          "🔐 Le bot la stocke chiffrée (AES-256) et efface automatiquement les messages qui l'affichent.",
      },
      key: {
        title: '🔑 Clés & adresses',
        body:
          '🔑 <b>Clé privée &amp; adresse publique</b>\n\n' +
          'La crypto repose sur des paires de clés :\n\n' +
          '• <b>Adresse publique</b> 📬 : ton « IBAN », à partager pour recevoir.\n' +
          '• <b>Clé privée</b> 🔑 : la seule chose qui permet de <b>dépenser</b>. À ne jamais partager.\n\n' +
          "La clé privée signe les transactions ; l'adresse en est dérivée mathématiquement (l'inverse est impossible).\n\n" +
          "💡 <i>« Not your keys, not your coins »</i> : sur un exchange, c'est lui qui a les clés → <code>/learn iou</code>.",
      },
      security: {
        title: '🔒 Sécurité & arnaques',
        body:
          '🔒 <b>Sécurité &amp; arnaques</b>\n\n' +
          '• Ta <b>seed</b> (<code>/learn seed</code>) et tes <b>clés privées</b> (<code>/learn key</code>) ne se partagent <b>jamais</b> — aucun support, aucun admin, aucun « airdrop » légitime ne les demande.\n' +
          '• <b>Phishing</b> : méfie-toi des faux sites/bots imitant les vrais, des MP non sollicités et des liens « urgents ».\n' +
          "• <b>Address poisoning</b> : des escrocs envoient des mini-transactions depuis une adresse ressemblant à la tienne pour polluer ton historique. Vérifie l'adresse <b>entière</b>, pas juste le début et la fin.\n" +
          '• Pour un gros montant : fais d’abord un <b>petit envoi test</b>.\n' +
          '• Vérifie toujours le <b>réseau</b> avant un envoi → <code>/learn network</code>.\n\n' +
          '🛡️ Côté bot : stockage chiffré <b>AES-256-GCM</b> par utilisateur, messages sensibles auto-supprimés, journal d’audit.\n\n' +
          '⁉️ Pour approfondir dusting &amp; empoisonnement : <code>/faq</code>',
      },
      rugpull: {
        title: '🪤 Rug pull & co',
        body:
          '🪤 <b>Rug pull &amp; arnaques token</b>\n\n' +
          "• <b>Rug pull</b> (« tirer le tapis ») : les créateurs d'un token gonflent le projet, attirent les acheteurs… puis retirent d'un coup la liquidité ou vendent tout. Le prix s'effondre à zéro.\n" +
          '• <b>Honeypot</b> : un token que tu peux <b>acheter mais jamais revendre</b> (blocage caché dans le smart contract).\n' +
          '• <b>Pump &amp; dump</b> : un groupe gonfle artificiellement le prix puis revend sur les derniers arrivés.\n' +
          '• <b>Ponzi</b> : les « rendements garantis » des anciens sont payés avec les dépôts des nouveaux.\n' +
          '• <b>Pig butchering</b> : arnaque « sentimentale » longue durée qui finit par une fausse plateforme d\'investissement.\n\n' +
          '✅ Réflexes : liquidité verrouillée ? équipe identifiée ? contrat audité ? rendement « garanti » = fuis. Et n\'investis que ce que tu peux perdre.\n\n' +
          '🔗 Voir aussi <code>/learn security</code> et <code>/learn iou</code>.',
      },
      network: {
        title: '🌐 Réseaux & adresses',
        body:
          '🌐 <b>Réseaux &amp; adresses</b>\n\n' +
          'Un même actif peut exister sur <b>plusieurs réseaux</b> : USDT existe en ERC-20 (Ethereum), TRC-20 (Tron), BEP-20 (BNB), SPL (Solana), jetton (TON)…\n\n' +
          '• Les chaînes EVM partagent le même format <code>0x...</code>, mais restent des réseaux <b>séparés</b>.\n' +
          '• Un envoi sur le <b>mauvais réseau</b> = fonds souvent <b>perdus définitivement</b>.\n\n' +
          "✅ Règle d'or : le réseau de l'expéditeur et du destinataire doivent être <b>identiques</b>. Le bot te fait toujours choisir le réseau avant un dépôt ou un envoi.",
      },
      gas: {
        title: '⛽ Frais',
        body:
          '⛽ <b>Frais de transaction</b>\n\n' +
          'Chaque réseau rémunère ses validateurs/mineurs :\n\n' +
          '• <b>EVM</b> (ETH, L2, BNB, AVAX) : le <b>gas</b>, payé dans le coin natif.\n' +
          '• <b>Bitcoin/LTC/BCH/ZEC</b> : des <b>sats/vByte</b> — plus tu paies, plus vite tu es confirmé.\n' +
          '• <b>Tron</b> : énergie &amp; bande passante ; <b>Solana</b> : fractions de centime.\n\n' +
          "💡 <code>/gas</code> affiche les frais en direct. Le bot propose 🐢 lent / 🚶 moyen / 🚀 rapide à l'envoi.",
      },
      token: {
        title: '🪙 Coin vs Token',
        body:
          '🪙 <b>Coin vs Token</b>\n\n' +
          "1️⃣ <b>Coin</b> 🪙 : la monnaie <b>native</b> d'une blockchain (BTC sur Bitcoin, ETH sur Ethereum, SOL sur Solana). Elle paie les frais du réseau.\n" +
          '2️⃣ <b>Token</b> 🎫 : un actif <b>hébergé</b> sur une blockchain existante (USDC, USDT, DAI…). Standards : ERC-20 (Ethereum), SPL (Solana), TRC-20 (Tron), jetton (TON).\n\n' +
          '💡 Pour envoyer un token, il faut toujours un peu de coin natif pour payer les frais (du TRX pour un USDT-TRC20, par ex.).',
      },
      stable: {
        title: '💵 Stablecoins',
        body:
          '💵 <b>Stablecoins</b>\n\n' +
          'Des tokens indexés sur une monnaie fiat, généralement le dollar : <b>USDT</b> (Tether), <b>USDC</b> (Circle), <b>DAI</b> (décentralisé).\n\n' +
          '• Utiles pour se protéger de la volatilité sans repasser par une banque.\n' +
          '• Ce sont des tokens → il faut du coin natif pour les frais (<code>/learn token</code>).\n' +
          "• USDT/USDC sont des IOU d'un émetteur centralisé (<code>/learn iou</code>) ; DAI est garanti par de la crypto en surcollatéral.\n\n" +
          '🌐 Choisis bien le réseau (ERC-20, TRC-20…) → <code>/learn network</code>.',
      },
      iou: {
        title: '🧾 IOU & wrapped',
        body:
          '🧾 <b>IOU &amp; wrapped tokens</b>\n\n' +
          '<b>IOU</b> = <i>« I Owe You »</i> (« je te dois ») : une <b>reconnaissance de dette</b>. Un jeton qui représente une promesse, pas l’actif lui-même.\n\n' +
          "Ex. : le « wrapped ZEC » sur Solana n'est pas du vrai ZEC — c'est un token SPL qui dit « l'émetteur te doit 1 ZEC ». Le vrai ZEC est (en théorie) en réserve chez l'émetteur : tu dépends de sa solvabilité et de son honnêteté.\n\n" +
          '• <b>Natif</b> : BTC sur Bitcoin, ZEC sur Zcash — possession directe, aucune contrepartie.\n' +
          "• <b>IOU / wrapped</b> : WBTC, wZEC — une créance. Si l'émetteur est hacké (bridge Wormhole, 2022) ou fait faillite, le token peut ne plus rien valoir.\n\n" +
          '💡 <i>« Not your keys, not your coins »</i> — et pour les wrapped : <i>« not the native chain, not really the coin »</i>.',
      },
      swap: {
        title: '💱 Échange sans KYC',
        body:
          '💱 <b>Échange sans KYC</b>\n\n' +
          "Le bot s'appuie sur un agrégateur (Trocador) : tu échanges une crypto contre une autre <b>sans compte ni vérification d'identité</b>.\n\n" +
          '• Le meilleur taux est choisi automatiquement parmi plusieurs plateformes.\n' +
          '• Ton adresse de réception est pré-remplie ; le bot ne touche <b>jamais</b> tes fonds.\n' +
          '• Cross-chain : BTC → XMR, ETH → SOL, USDT-TRC20 → USDC-SOL…\n\n' +
          '👉 <code>/swaps</code> pour la liste, bouton 🔄 Échanger sur chaque wallet.',
      },
      kyc: {
        title: '🪪 KYC / no-KYC',
        body:
          '🪪 <b>KYC / no-KYC</b>\n\n' +
          "<b>KYC</b> = <i>« Know Your Customer »</i> : l'obligation pour les plateformes régulées de vérifier ton identité (papiers, selfie…).\n\n" +
          '• <b>Avec KYC</b> : exchanges centralisés (Binance, Kraken…) — ton identité est liée à tes transactions.\n' +
          '• <b>Sans KYC</b> : échanges instantanés (comme <code>/swaps</code> ici), DEX, pair-à-pair — pas de compte, pas de dossier.\n\n' +
          '⚖️ Le no-KYC préserve ta vie privée ; les obligations fiscales de déclaration restent inchangées.',
      },
      ln: {
        title: '⚡ Lightning',
        body:
          '⚡ <b>Lightning Network</b>\n\n' +
          'Un réseau de <b>paiement instantané</b> construit au-dessus de Bitcoin : les transactions passent par des canaux hors chaîne.\n\n' +
          '• Paiements en <b>quelques secondes</b>, frais quasi nuls, montants en satoshis.\n' +
          '• Une facture Lightning = un code <b>BOLT11</b> (<code>lnbc...</code>), souvent affiché en QR.\n\n' +
          "💳 Dans ce bot : <code>/invoice</code> propose l'option ⚡ pour encaisser un paiement Lightning instantanément.",
      },
      invoice: {
        title: '💳 Factures crypto',
        body:
          '💳 <b>Factures crypto</b>\n\n' +
          'Une facture = un montant (en euros ou en crypto), une adresse de paiement et une expiration. Le payeur scanne le QR, le bot détecte le paiement et te notifie.\n\n' +
          '• <b>Non-custodial</b> : les fonds arrivent directement sur <b>ton</b> wallet, le bot ne les détient jamais.\n' +
          '• Taux fiat→crypto verrouillé à la création ; petite tolérance de sous/sur-paiement.\n' +
          '• Multi-actifs : coin natif, stablecoins (USDT/USDC…), et ⚡ Lightning.\n\n' +
          '👉 <code>/invoice</code> pour créer, <code>/invoices</code> pour suivre.',
      },
      shield: {
        title: '🛡️ Confidentialité / ZK',
        body:
          '🛡️ <b>Shielding &amp; confidentialité (Solana)</b>\n\n' +
          'Solana est <b>transparente par défaut</b> : soldes et montants sont publics. Le « shielding » désigne les techniques qui les masquent.\n\n' +
          '• <b>Confidential Balances</b> (Token-2022) : extension <b>native</b> de Solana (mainnet 2025) — montants et soldes chiffrés (ElGamal + preuves ZK). Les adresses, elles, restent publiques.\n' +
          "• <b>ZK-SNARK</b> : preuve cryptographique qui démontre qu'une transaction est valide <b>sans en révéler les détails</b>. Au cœur de Zcash (<code>/learn zec</code>) et d'Elusiv (protocole pionnier sur Solana, fermé en 2024).\n" +
          "• <b>MPC</b> (calcul multi-parties) : des nœuds indépendants calculent sur des données chiffrées sans jamais les voir — la techno d'<b>Arcium</b> (né de l'équipe Elusiv). Arcium utilise du MPC, <b>pas</b> du FHE.\n" +
          '• <b>FHE</b> (chiffrement homomorphe complet) : calculer directement sur des données chiffrées. Très puissant mais encore lent.\n' +
          "• <b>Dark pools</b> : des marchés où les gros ordres s'exécutent hors carnet public (anti-MEV, anti-front-running) — HumidiFi, ou Zyga (exécution privée + zkKYC institutionnel).\n" +
          '• <b>Adresses furtives</b> : une adresse à usage unique par transaction, pour casser le traçage du portefeuille.\n\n' +
          "⚠️ Ne pas confondre : la <b>ZK Compression</b> (Light Protocol/Helius) utilise des preuves ZK pour <b>réduire les coûts de stockage</b>, pas pour l'anonymat. Idem, le <b>Seed Vault</b> (Solana Saga/Seeker) protège tes clés dans une puce dédiée — sécurité matérielle, pas confidentialité des transactions.\n\n" +
          '🕵️ Confidentialité par défaut → <code>/learn xmr</code>.',
      },
      mempool: {
        title: '⏳ Mempool & tx bloquées',
        body:
          '⏳ <b>Mempool, fees &amp; transactions bloquées</b>\n\n' +
          "Quand tu envoies une tx Bitcoin, elle n'est pas confirmée instantanément. Elle atterrit dans le <b>mempool</b> (pool de mémoire), un zone d'attente partagée par tous les nœuds du réseau, en attendant qu'un mineur l'inclut dans un bloc.\n\n" +
          '<b>⏳ Pourquoi ma tx est bloquée ?</b>\n' +
          "Les mineurs trient les tx par <b>fee rate</b> (frais par vByte). Plus tu paies, plus tu passes vite. Si ton fee rate est trop bas, ta tx reste en attente derrière des milliers d'autres.\n\n" +
          '<b>📊 Les tiers de fees :</b>\n' +
          '• <b>Rapide</b> (~10 min) : 3+ sat/vB\n' +
          '• <b>Moyen</b> (~30 min) : 2 sat/vB\n' +
          '• <b>Lent</b> (~1h) : 1 sat/vB\n' +
          '• <b>Économique</b> (1h+) : 0.5-1 sat/vB\n' +
          '• <b>Minimum</b> (risqué) : &lt;0.5 sat/vB — peut rester des jours\n\n' +
          '<b>🔓 RBF (Replace-By-Fee)</b>\n' +
          'Certaines tx ont le flag RBF activé. Ça permet de <b>renvoyer la même tx avec un fee plus élevé</b> pour la remplacer. Le destinataire recevra la version la plus chère. Vérifie sur <code>mempool.space</code> si ta tx a le flag RBF.\n\n' +
          '<b>👶 CPFP (Child Pays For Parent)</b>\n' +
          'Si ta tx a un <b>change</b> (monnaie rendue), tu peux créer une 2ème tx qui dépense ce change avec un fee élevé. Les mineurs incluront les deux tx ensemble car le fee total est suffisant. C\'est plus complexe mais efficace.\n\n' +
          '<b>🗑️ Drop du mempool</b>\n' +
          'Si ta tx n\'est jamais confirmée, elle est <b>retirée du mempool après ~14 jours</b>. Les fonds reviennent disponibles dans ton wallet et tu pourras renvoyer avec un fee correct.\n\n' +
          '<b>🛡️ Comment éviter ça ?</b>\n' +
          '• Le bot calcule automatiquement les fees optimaux.\n' +
          '• Sur les chaînes EVM (ETH, Polygon…), les fees sont généralement rapides.\n' +
          '• Sur Bitcoin, privilégie le fee "Rapide" pour les envois urgents.\n\n' +
          '🎓 Voir aussi : <code>/learn gas</code> (fees sur EVM) — <code>/learn btc</code> (Bitcoin).',
      },
      explorer: {
        title: '🔍 Explorateurs de blocs',
        body:
          '🔍 <b>Explorateurs de blocs</b>\n\n' +
           'Un explorateur de blocs est un site web qui te permet de <b>voir tout ce qui se passe sur une blockchain</b> en temps réel : transactions, blocs, adresses, fees.\n\n' +
          '<b>🌐 Sites utiles :</b>\n' +
          '• <b>Bitcoin</b> : <code>mempool.space</code> (le meilleur pour les fees) ou <code>blockstream.info</code>\n' +
          '• <b>Ethereum / EVM</b> : <code>etherscan.io</code>, <code>arbiscan.io</code>, <code>polygonscan.com</code>\n' +
          '• <b>Solana</b> : <code>solscan.io</code>\n' +
          '• <b>Tron</b> : <code>tronscan.org</code>\n\n' +
          '<b>📊 Comment lire une transaction :</b>\n' +
          '• <b>TxID</b> : identifiant unique de la transaction — 64 caractères hexadécimaux.\n' +
          '• <b>Statut</b> : <code>pending</code> (mempool, pas encore dans un bloc), <code>confirmed</code> (inclus dans un bloc, N confirmations).\n' +
          '• <b>Confirmations</b> : nombre de blocs construits par-dessus. 1 = inclusion, 6+ = considéré sûr.\n' +
          '• <b>Fee rate</b> : frais par vByte (ex : 2 sat/vB). Plus c\'est haut, plus la confirmation est rapide.\n\n' +
          '<b>🔎 Comment vérifier un paiement :</b>\n' +
          '1. Copie le TxID (ou l\'adresse source/destinataire).\n' +
          "2. Va sur l'explorateur correspondant à la chaîne.\n" +
          '3. Colle le TxID dans la barre de recherche.\n' +
          '4. Vérifie le statut : « confirmed » = arrivé, « unconfirmed » = en attente.\n\n' +
          '🎓 Voir aussi : <code>/learn mempool</code> — <code>/learn gas</code>.',
      },
      utxo: {
        title: '🧩 Le modèle UTXO',
        body:
          '🧩 <b>Le modèle UTXO</b>\n\n' +
          'Bitcoin, Litecoin, Bitcoin Cash et Zcash utilisent le modèle <b>UTXO</b> (Unspent Transaction Output). C\'est très différent du modèle « compte » d\'Ethereum.\n\n' +
          '<b>💡 Principe :</b>\n' +
          "Ton « solde » n'est pas un nombre dans une base de données. C'est la <b>somme de toutes tes pièces non dépensées</b> (UTXOs).\n\n" +
          '<b>🔑 Comment ça marche :</b>\n' +
          '• Quand tu reçois 0.5 BTC, tu reçois une UTXO de 0.5 BTC.\n' +
          "• Quand tu envoies 0.3 BTC, le wallet <b>consomme</b> l'UTXO de 0.5 et crée <b>deux sorties</b> : 0.3 BTC au destinataire + 0.2 BTC de <b>change</b> (retour à toi).\n" +
          '• Les frais sont la différence : 0.5 - 0.3 - 0.2 = 0.0 BTC de frais (dans cet exemple idéal).\n\n' +
          '<b>💸 Pourquoi je reçois du change ?</b>\n' +
          "C'est le modèle UTXO : on ne peut pas « dépenser la moitié d'une pièce ». On consomme la pièce entière et on rend la différence en change. C'est normal !\n\n" +
          '<b>⚡ Implications pratiques :</b>\n' +
          '• <b>Plus tu as d\'UTXOs</b>, plus ta tx est volumineuse (coûteux en fees).\n' +
          '• <b>Consolidation</b> : envoyer tes UTXOs à toi-même avec un fee bas pour n\'en faire qu\'une. Utile quand le réseau est calme.\n' +
          '• <b>EVM</b> (ETH, BNB…) utilise un modèle « compte » : pas d\'UTXOs, pas de change, les fees sont déduits directement.\n\n' +
          '🎓 Voir aussi : <code>/learn btc</code> — <code>/learn gas</code> — <code>/learn mempool</code>.',
      },
    },
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

  // ⁉️ FAQ sécurité (dusting / empoisonnement d'adresse / arnaques). Comme les
  // leçons /learn : le menu et l'accès direct (/faq dust) sont dérivés de
  // `items` — ajouter une entrée = ajouter la clé ici ET dans en.js (parité).
  faq: {
    menuTitle:
      '⁉️ <b>FAQ Sécurité</b>\n' +
      '━━━━━━━━━━━━━━━\n\n' +
      "Dusting, empoisonnement d'adresse, arnaques : choisis une question 👇\n\n" +
      '💡 Accès direct : <code>/faq dust</code>, <code>/faq memo</code>…\n' +
      '🎓 Pour les bases : <code>/learn security</code>',
    backToMenu: '⁉️ Toutes les questions',
    items: {
      poison: {
        title: "☠️ Empoisonnement d'adresse",
        body:
          "☠️ <b>Qu'est-ce que l'empoisonnement d'adresse ?</b>\n\n" +
          "Un escroc t'envoie une transaction de <b>poussière</b> (souvent &lt; 0,01 $) depuis une adresse qui <b>imite visuellement</b> celle d'un destinataire avec qui tu as déjà interagi (mêmes premiers et derniers caractères).\n\n" +
          "Son but : que cette fausse adresse apparaisse dans ton <b>historique</b>, et qu'un jour tu la copies-colles par erreur au lieu de la vraie — tes fonds partent alors chez l'escroc.\n\n" +
          'Les trois usages classiques :\n' +
          '• <b>Empoisonnement</b> : imiter une adresse légitime de ton historique.\n' +
          '• <b>Spam de jetons</b> : encombrer ton historique pour provoquer des erreurs ou des clics vers des contrats/liens malveillants.\n' +
          '• <b>Désanonymisation</b> : tracer comment tu déplaces les fonds pour relier tes wallets entre eux.\n\n' +
          '👉 Vérifie toujours une adresse <b>en entier</b> avant d\'envoyer (voir « ✅ Bien vérifier une adresse »).',
      },
      dust: {
        title: '🌫 Le « dusting »',
        body:
          '🌫 <b>Pourquoi « dusting » ?</b>\n\n' +
          "La « dust » (poussière), c'est une quantité minuscule de crypto (ex : du TRX) envoyée à ton wallet — souvent trop faible pour être échangée ou retirée.\n\n" +
          'Le dusting sert à :\n' +
          '• obscurcir les historiques de transactions,\n' +
          "• promouvoir des jetons d'arnaque,\n" +
          '• pousser à des interactions non sécurisées,\n' +
          '• tracer les wallets (analyse de la blockchain).\n\n' +
          '🎓 Les bases des arnaques : <code>/learn security</code>',
      },
      tron: {
        title: '🔺 Le cas TRON',
        body:
          '🔺 <b>Comment ça marche sur TRON ?</b>\n\n' +
          'Les attaquants envoient de très faibles montants de TRX depuis des adresses qui <b>ressemblent</b> à celles de tes contreparties habituelles.\n\n' +
          "Pourquoi TRON ? Son infrastructure à <b>très bas coût</b> : les microtransactions y sont quasi gratuites, ce qui rend possibles des campagnes d'empoisonnement à très grande échelle. Les utilisateurs parlent de « poussière TRX ».\n\n" +
          '⚠️ Le phénomène existe aussi sur les autres chaînes (EVM, Solana…), TRON est juste le terrain le moins cher.\n\n' +
          '🎓 En savoir plus sur TRON : <code>/learn trx</code>',
      },
      airdrop: {
        title: '🎁 Dust vs airdrop',
        body:
          '🎁 <b>Quelle différence entre dusting et airdrop ?</b>\n\n' +
          'Les deux sont des transferts de jetons <b>non sollicités</b>, mais :\n\n' +
          '• Un <b>airdrop</b> est généralement promotionnel et transparent (projet identifiable, annonce publique).\n' +
          '• Le <b>dusting</b> vise à semer la confusion, tromper ou surveiller — phishing, désanonymisation, promotion d\'arnaques.\n\n' +
          "En pratique : dans le doute, traite tout jeton non sollicité comme <b>suspect</b> et n'interagis pas avec lui.\n\n" +
          '🎓 Jetons frauduleux : <code>/learn rugpull</code>',
      },
      goals: {
        title: '🪤 Buts des escrocs',
        body:
          '🪤 <b>Que cherchent les escrocs avec le dusting ?</b>\n\n' +
          "• <b>Hameçonnage</b> : t'inciter à envoyer des fonds à une adresse similaire à une adresse connue.\n" +
          '• <b>Suivi comportemental</b> : observer comment tu gères ces petits soldes pour relier tes wallets entre eux et repérer les cibles à forte valeur.\n' +
          "• <b>Promotion d'arnaque</b> : glisser des liens de phishing ou des métadonnées de faux jetons pour te faire interagir.\n\n" +
          '👉 La parade est simple : <b>ignorer</b> la poussière, ne jamais cliquer, ne jamais échanger ces jetons.',
      },
      detect: {
        title: '🔎 Détecter une attaque',
        body:
          '🔎 <b>Comment savoir si mon wallet a été « dusté » ?</b>\n\n' +
          'Signes typiques :\n' +
          "• un transfert d'une <b>fraction de centime</b> reçu d'une adresse inconnue ;\n" +
          '• une adresse qui <b>ressemble fortement</b> à un de tes contacts connus (mêmes début/fin) ;\n' +
          '• des jetons inconnus apparus sans raison dans ton historique.\n\n' +
          "Dans ce bot : le bouton 🔍 <b>Analyser</b> te montre l'historique et les tokens d'une adresse publique — utile pour inspecter sans risque.\n\n" +
          '👉 Recevoir de la poussière est <b>sans danger</b> en soi. Le danger, c\'est d\'y <b>réagir</b>.',
      },
      bots: {
        title: '🤖 Attaques automatisées',
        body:
          '🤖 <b>Ces attaques peuvent-elles être automatisées ?</b>\n\n' +
          'Oui — la plupart des campagnes de dusting sont menées par des bots qui :\n\n' +
          '• surveillent la blockchain pour repérer les wallets <b>nouvellement actifs</b> ou à forte valeur ;\n' +
          '• génèrent des adresses usurpées avec des outils de <b>vanity address</b> (mêmes premiers/derniers caractères que la cible imitée) ;\n' +
          "• déclenchent l'envoi de poussière <b>quelques secondes</b> après ton activité.\n\n" +
          "C'est pour ça qu'une poussière peut arriver juste après une vraie transaction — ce n'est pas une coïncidence.",
      },
      targets: {
        title: '🎯 Qui est ciblé ?',
        body:
          '🎯 <b>Qui est le plus susceptible d\'être ciblé ?</b>\n\n' +
          'Les attaquants se concentrent sur :\n\n' +
          '• les wallets à <b>activité récente</b> ou à forte valeur ;\n' +
          '• les <b>premières interactions</b> entre deux wallets (pour insérer leur fausse adresse au bon moment) ;\n' +
          '• les wallets <b>non custodiaux</b>, qui filtrent moins les transactions entrantes.\n\n' +
          'Ce bot est non custodial : tes clés restent chiffrées chez toi, mais la vigilance sur les adresses reste <b>ta</b> responsabilité.',
      },
      benign: {
        title: '⚖️ Toujours malveillant ?',
        body:
          '⚖️ <b>Le dusting est-il toujours malveillant ?</b>\n\n' +
          "Pas nécessairement — certains usages sont bénins (tests, messages réseau). Mais en pratique, le dusting est <b>très majoritairement</b> associé à une infrastructure d'escroquerie et à des tactiques de tromperie.\n\n" +
          'Le bon réflexe par défaut : considérer tout micro-dépôt non sollicité comme <b>suspect</b> et ne pas interagir avec les jetons reçus.',
      },
      trace: {
        title: '🕵️ Est-ce traçable ?',
        body:
          '🕵️ <b>Le dusting peut-il être retracé ?</b>\n\n' +
          "Oui. Les outils d'analyse de blockchain (« blockchain intelligence ») peuvent :\n\n" +
          "• identifier et regrouper l'infrastructure des attaquants ;\n" +
          '• signaler les utilisateurs ayant interagi avec des adresses usurpées ;\n' +
          "• relier les wallets de dusting entre campagnes d'escroquerie.\n\n" +
          "Ces signaux aident l'attribution et la remédiation — mais ils n'annulent pas une transaction : la prévention reste la seule vraie protection.",
      },
      memo: {
        title: '📝 Champs mémo piégés',
        body:
          '📝 <b>Quel rôle jouent les champs mémo dans les arnaques ?</b>\n\n' +
          "Sur TRON, TON et d'autres chaînes, les transactions peuvent porter un <b>mémo</b> : les fraudeurs y intègrent des liens de phishing ou des messages frauduleux (« réclame ton airdrop ici »…).\n\n" +
          'Ces champs sont visibles dans les explorateurs (Tronscan…) et peuvent te rediriger vers des sites dangereux.\n\n' +
          '👉 <b>Ignore tout lien</b> dans un mémo, sauf si la source est confirmée par un canal de confiance.\n\n' +
          '🎓 À quoi sert un mémo légitime : <code>/learn ton</code>',
      },
      react: {
        title: '🚨 J\'ai reçu du dust',
        body:
          '🚨 <b>Que faire si je reçois de la poussière ?</b>\n\n' +
          '1. <b>N\'y touche pas</b> : ne l\'envoie pas, ne l\'échange pas, ne « réclame » rien.\n' +
          "2. N'interagis pas avec les jetons ou adresses inconnus (un swap/une approbation peut déclencher un contrat malveillant — honeypot).\n" +
          '3. Ignore les liens des champs mémo.\n' +
          '4. Vérifie <b>chaque adresse en entier</b> avant tout envoi futur — surtout si elle « ressemble » à un contact.\n' +
          '5. Considère tout micro-dépôt non sollicité comme suspect, par défaut.\n\n' +
          'La poussière reçue ne compromet <b>ni tes clés ni ta seed</b> : elle ne devient dangereuse que si tu réagis.\n\n' +
          '🎓 <code>/learn rugpull</code> · <code>/learn security</code>',
      },
      verify: {
        title: '✅ Bien vérifier une adresse',
        body:
          '✅ <b>Comment bien vérifier une adresse avant d\'envoyer ?</b>\n\n' +
          "L'empoisonnement mise sur une habitude : ne comparer que les <b>premiers et derniers caractères</b>. Les vanity addresses imitent exactement ces zones-là.\n\n" +
          'Les bons réflexes :\n' +
          "• Compare l'adresse <b>en entier</b>, pas seulement les extrémités.\n" +
          '• Récupère l\'adresse à la <b>source</b> (QR code, message direct du destinataire) — jamais depuis ton historique de transactions.\n' +
          '• Pour un gros montant : fais d\'abord un <b>petit envoi test</b>, confirme la réception, puis envoie le reste.\n' +
          '• Dans ce bot : 📥 <b>Recevoir</b> affiche ton adresse complète + QR ; 🔍 <b>Analyser</b> inspecte une adresse avant envoi ; l\'envoi affiche toujours un récapitulatif à confirmer.\n\n' +
          '🎓 Adresses & clés : <code>/learn key</code>',
      },
      sent: {
        title: '😱 Envoi au mauvais destinataire',
        body:
          '😱 <b>J\'ai envoyé à une adresse empoisonnée, que faire ?</b>\n\n' +
          "Sois lucide : une transaction blockchain confirmée est <b>irréversible</b> — personne (ni ce bot, ni un support) ne peut l'annuler. Méfie-toi d'ailleurs des « services de récupération de fonds » : ce sont presque toujours des arnaques de seconde couche.\n\n" +
          'Ce que tu peux faire :\n' +
          '1. <b>Arrête</b> tout envoi en cours vers cette adresse.\n' +
          "2. Supprime-la de tes habitudes (ne la recopie plus depuis l'historique).\n" +
          '3. Documente : montant, txid, adresse — utile pour un signalement (plateforme, police).\n' +
          "4. Si l'adresse imitait un exchange/service, préviens ce service.\n" +
          '5. Ta seed et tes clés ne sont <b>pas compromises</b> par cet envoi — pas besoin de migrer de wallet.\n\n' +
          '🎓 <code>/learn security</code> · <code>/learn seed</code>',
      },
      tx_stuck: {
        title: '⏳ TX bloquée depuis longtemps',
        body:
          '⏳ <b>Ma transaction est bloquée depuis longtemps, que faire ?</b>\n\n' +
           'Si ta tx Bitcoin est « pending » depuis plusieurs heures voire jours, c\'est que ton fee rate est trop bas par rapport à la congestion du réseau.\n\n' +
          '<b>📋 Étapes à suivre :</b>\n' +
           '1. <b>Vérifie le statut</b> : copie le TxID et colle-le sur <code>mempool.space</code>. Regarde le fee rate (sat/vB) et le nombre de tx en attente.\n' +
           '2. <b>Cherche le flag RBF</b> : sur mempool.space, si ta tx a le symbole ⚡ « RBF activé », tu peux la <b>remplacer</b> avec un fee plus élevé.\n' +
          '3. <b>Pas de RBF ?</b> Si tu as reçu du change (une adresse qui commence par <code>bc1</code> et qui t\'appartient), tu peux utiliser le <b>CPFP</b> : crée une tx qui dépense ce change avec un fee élevé — les mineurs incluront les deux tx ensemble.\n' +
          '4. <b>Ni RBF ni CPFP ?</b> Il ne reste qu\'à <b>attendre</b> que le mempool se vide (souvent pendant les week-ends ou les périodes calmes) ou que la tx soit dropée (~14 jours).\n\n' +
          '<b>🚀 Accélérateurs :</b>\n' +
          '• <code>mempool.space/accelerate</code> — paie un mineur pour inclure ta tx prioritairement.\n' +
           '• Certains services acceptent un paiement pour \'pousser\' ta tx.\n\n' +
          '<b>🛡️ À l\'avenir :</b> utilise toujours le fee « Rapide » pour les envois urgents.\n\n' +
          '🎓 <code>/learn mempool</code> · <code>/learn gas</code> · <code>/faq explorer</code>',
      },
      explorer: {
        title: '🔍 Comment vérifier ma tx',
        body:
          '🔍 <b>Comment vérifier le statut d\'une transaction ?</b>\n\n' +
          'Pour savoir si ta transaction est bien arrivée, utilise un <b>explorateur de blocs</b>.\n\n' +
          '<b>🌐 Adresses utiles :</b>\n' +
          '• <b>Bitcoin</b> : <code>mempool.space/fr/address/TON_ADRESSE</code> ou <code>blockstream.info</code>\n' +
          '• <b>Ethereum / EVM</b> : <code>etherscan.io</code>, <code>arbiscan.io</code>, <code>polygonscan.com</code>\n' +
          '• <b>Solana</b> : <code>solscan.io</code>\n' +
          '• <b>Tron</b> : <code>tronscan.org</code>\n\n' +
          '<b>📋 Comment faire :</b>\n' +
          '1. <b>Copie le TxID</b> (reçu dans le bot après envoi) ou <b>l\'adresse</b> du destinataire.\n' +
          "2. Va sur l'explorateur de la chaîne correspondante.\n" +
          '3. Colle le TxID ou l\'adresse dans la barre de recherche.\n' +
          '4. Regarde le statut :\n' +
          '   • <b>Confirmed</b> ✅ = transaction finale, fonds arrivés.\n' +
          '   • <b>Unconfirmed</b> ⏳ = en attente dans le mempool.\n' +
          '   • <b>Confirmations</b> : 1 = inclus dans un bloc, 6+ = considéré sûr.\n\n' +
          '💡 Dans ce bot, 🔍 <b>Analyser</b> affiche automatiquement le solde et l\'historique d\'une adresse.\n\n' +
          '🎓 <code>/learn explorer</code> · <code>/learn mempool</code>',
      },
    },
  },

  // Payment gateway (non-custodial invoicing) — merchant UI + watcher notifications.
  payments: {
    noWallet: "👻 Aucun wallet pour recevoir. Crée-en un d'abord (➕ Nouveau).",
    createTitle: '💳 <b>Créer une facture</b>\n\nComment veux-tu être payé ?',
    lnMethodBtn: '⚡ Lightning (BTC · instantané)',
    menuBtn: '🎮 Menu',
    lnUnavailable:
      "⚡ <b>Lightning indisponible</b>\n\nAucun nœud n'est branché. Configure <code>LN_BACKEND_URL</code> + <code>LN_PASSWORD</code> (phoenixd) pour l'activer.\n\nEn attendant, utilise 💳 <b>Facture</b> (on-chain, 15 chaînes + stablecoins).",
    lnPickWallet:
      '⚡ <b>Facture Lightning</b>\n\nSur quel wallet BTC veux-tu être payé ?\n<i>(destination du balayage Lightning)</i>',
    lnAskAmount: '⚡ <b>Facture Lightning (BTC)</b>\n\nQuel montant veux-tu recevoir, en <b>EUR</b> ? (ex : 25)',
    askAmount: (symbol, chainName) =>
      `💳 <b>Facture en ${symbol}</b> · ${chainName}\n\nQuel montant veux-tu recevoir, en <b>EUR</b> ? (ex : 25)`,
    pickAsset: (chainName) => `💳 <b>Facture · ${chainName}</b>\n\nQuel actif veux-tu recevoir ?`,
    invalidAmount: '⚠️ Montant invalide.',
    alreadyOpenCard:
      '⚠️ <b>Une facture est déjà ouverte</b> pour cet actif.\nAffiche-la, ou annule-la pour en créer une nouvelle.',
    viewBtn: '👁 Voir',
    cancelBtn: '🗑 Annuler',
    cancelInvoiceBtn: '🗑 Annuler la facture',
    notFound: '🤷 Facture introuvable.',
    canceled: '🗑 <b>Facture annulée.</b>\nTu peux en créer une nouvelle.',
    newLnBtn: '⚡ Nouvelle facture Lightning',
    newBtn: '💳 Nouvelle facture',
    expireIn: (mins) => `⌛ Expire dans ${mins} min`,
    expired: '⌛ Expirée',
    coldLabel: 'Adresse externe (cold)',
    lnCard: (o) =>
      '⚡ <b>Facture Lightning</b>\n━━━━━━━━━━━━━━━\n' +
      `Montant : <b>${o.fiat}</b> ≈ <b>${o.sats} sats</b> (${o.btc} BTC)\n` +
      `Invoice (BOLT11) :\n<code>${o.bolt11}</code>\n` +
      `${o.expLine} · <code>${o.id}</code>\n` +
      o.destLine +
      "\nScanne / envoie l'invoice au client. Règlement <b>instantané</b>. ⚡",
    collectedOn: (label, address) => `💰 Encaissé sur :${label ? ` <b>${label}</b>` : ''}\n<code>${address}</code>\n`,
    card: (o) =>
      '💳 <b>Facture</b>\n━━━━━━━━━━━━━━━\n' +
      `Montant : <b>${o.fiat}</b> ≈ <b>${o.amount} ${o.symbol}</b>\n` +
      `Réseau : <b>${o.chainName}</b>\n` +
      `Adresse :\n<code>${o.address}</code>\n` +
      `${o.expLine} · <code>${o.id}</code>\n\n` +
      "Envoie ce QR (ou l'adresse) au client. Tu seras notifié dès réception. 🔔",
    lnBalanceHead: (sats) => `⚡ Solde Lightning : <b>${sats} sats</b>\n\n`,
    listEmpty: '🧾 Aucune facture. <code>/invoice</code> pour en créer une.',
    listTitle: '🧾 <b>Mes factures</b>',
    openBelow: '👇 Factures ouvertes :',
    treasuryUnreachable: (err) => `❌ Nœud injoignable : ${err}`,
    treasuryOff: '⚡ Lightning non configuré.',
    treasury: (o) =>
      '🏦 <b>Trésorerie Lightning</b>\n' +
      `Solde nœud : <b>${o.balanceSat} sats</b>\n` +
      `Seuil de sweep : ${o.thresholdSat} sats\n` +
      `Destination : ${o.destBlock}\n\n` +
      o.payoutsBlock,
    noDest: '(non configurée)',
    payoutsTitle: '<b>Derniers retraits</b>',
    noPayouts: 'Aucun retrait.',
    sweepNowBtn: '🧹 Balayer maintenant',
    changeWalletBtn: '💰 Changer le wallet de réception',
    treasuryBackBtn: '↩️ Trésorerie',
    forcedDest: '🔒 Destination forcée par <code>LN_SWEEP_BTC_ADDRESS</code>.',
    noBtcWallet: 'Aucun wallet BTC. Crée-en un avec /gen btc.',
    pickSweepWallet:
      '💰 <b>Wallet de réception Lightning</b>\nOù veux-tu que les sats balayés depuis le nœud soient envoyés ?',
    destSet: (label, address) => `✅ Destination du sweep : 💰 <b>${label}</b>\n<code>${address}</code>`,
    sweptOk: (sats, txid) => `✅ Balayé ${sats} sats → trésorerie (txid <code>${txid}</code>)`,
    nothingToSweep: (reason, bal) => `ℹ️ Rien à balayer (${reason}${bal != null ? ` : ${bal} sats` : ''})`,
    notifExpired: (symbol) => `⌛ Facture expirée (${symbol}).`,
    notifPaid: (o) =>
      `✅ <b>Paiement reçu</b>\n${o.amount} ${o.symbol}${o.fiat}${o.over}\nFacture <code>${o.id}</code> réglée.${o.lnLine}`,
    overpaid: ' ⚠️ trop-perçu',
    lnBalanceLine: (sats) => `\n💼 Solde Lightning : <b>${sats} sats</b>`,
    treasurySwept: (o) => `🏦 <b>Trésorerie balayée</b>\n${o.amountSat} sats → <code>${o.address}</code>\ntxid <code>${o.txid}</code>`,
    // Service errors translated by their e.code (the Error.message stays French).
    errors: {
      SWEEP_FORCED: 'Destination forcée par la config (LN_SWEEP_BTC_ADDRESS).',
      WALLET_NOT_FOUND: 'Wallet BTC introuvable.',
      LN_NOT_CONFIGURED: 'Lightning non configuré sur ce bot.',
      LN_ALREADY_OPEN: 'Une facture Lightning est déjà ouverte.',
      NO_WALLET_FOR_CHAIN: (chain) => `Aucun wallet ${chain} pour recevoir.`,
      ALREADY_OPEN: (symbol, chain) => `Une facture ${symbol} sur ${chain} est déjà ouverte.`,
      INVOICE_NOT_FOUND: 'Facture introuvable.',
      INVOICE_NOT_OPEN: 'Cette facture n’est plus ouverte.',
    },
  },
};
