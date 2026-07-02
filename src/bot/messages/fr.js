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
          '🛡️ Côté bot : stockage chiffré <b>AES-256-GCM</b> par utilisateur, messages sensibles auto-supprimés, journal d’audit.',
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
};
