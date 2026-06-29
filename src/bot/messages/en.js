export const en = {
  errors: {
    generic: '😕 Oops! Something went wrong. Please try again.',
    tryAgain: '🔄 Try again in a few moments.',
    network: 'Network error. Try again in a few moments.',
    timeout: '⏱️ Timed out. Please try again.',
    notFound: '👻 Not found.',
    noWallets: '🔍 No wallets yet.',
    noBalance: '💸 No balance available.',
    address: '⚠️ This address is not valid.',
    amount: '⚠️ Invalid amount.',
    amountExcessive: '⚠️ Amount too large. Check the value you entered.',
    insufficientFunds: '💸 Insufficient balance.',
    transactionFailed: '❌ Transaction failed.',
    adminOnly: '❌ Access denied — Admins only.',
    unauthorizedChat: 'This bot is for personal use only.',
    expiredAction: '⏱️ Action expired.',
    cancelled: '✅ Cancelled.',
  },

  start: {
    welcome: (name) => `👋 Hi ${name}! 🪼 Welcome to your secure crypto wallet!`,
  },

  wallet: {
    created: (chain, label) => `🎉 ${chain.toUpperCase()} wallet created: ${label}`,
    generated: '✨ Your wallet was created successfully!',
    deleted: (label) => `🗑️ Wallet "${label}" deleted.`,
    list: '💰 My Wallets',
    notFound: '❌ Wallet not found',
    noWallets: "🔍 No wallets yet. Use 'New Wallet' to create one.",
    newWallet: '🆕 New Wallet',
    myKeys: '🔐 My Keys',
    seedWarning: '🔐 Keep this phrase secret! It is the key to your funds.',
    neverShare: '⚠️ NEVER share it with anyone.',
    autoDelete: (seconds) => `🕐 This message will be deleted in ${seconds} seconds.`,
    balances: '💵 Balances',
    totalBalance: '💎 Total Balance',
    copied: '📋 Copied!',
  },

  send: {
    enterAddress: "📬 Enter the recipient's address:",
    enterAmount: '💰 How much do you want to send?',
    selectAmountType: '💰 Amount type',
    amountNative: (chain) => chain.toUpperCase(),
    amountEUR: 'Euros',
    sent: '✅ Transaction sent successfully!',
    failed: '❌ Send failed.',
    confirm: '✅ Confirm send',
    cancel: '❌ Cancel send',
    fee: 'Fee',
    balance: 'Balance',
    invalidAddress: '⚠️ This address is not valid.',
    noAddress: 'No address entered.',
    addressAnalysis: '🔍 Address analysis',
  },

  admin: {
    panel: '👑 Admin Panel',
    denied: '❌ Access denied — Admins only.',
    stats: '📊 Statistics',
    users: '👥 Users',
    security: '🔒 Security',
    audit: '🧪 Audit',
    blacklist: '⛔ Blacklist',
    logs: '📋 Logs',
    secrets: '🔐 Secrets',
    broadcast: '📢 Broadcast',
    viewUser: 'View user',
    viewKeys: 'View keys',
    ban: 'Ban',
    unban: 'Unban',
    deleteWallet: 'Delete wallet',
    confirmAction: 'Confirm this admin action?',
  },

  prices: {
    title: '💹 Prices in EUR',
    l1: '🏛️ L1 / Mainnets',
    l2: '⚡ L2 / Scaling',
    stablecoins: '🏦 Stablecoins',
    legacy: '🪙 Legacy / Forks',
    updated: (date) => `🕒 Updated on ${date}`,
  },

  help: {
    title: '🆘 Help',
    intro: 'Here are the available commands:',
    commands: [
      '/start - Start the bot',
      '/id - View your ChatID and UserID',
      '/cancel - Cancel the current operation',
    ],
    features: 'Features:',
    featureList: [
      '💰 My Wallets - Manage your wallets',
      '💸 Send - Send funds',
      '💵 Balances - View all your balances',
      '🔍 Analyze - Analyze a public address',
      '🆕 New Wallet - Create a wallet',
      '🔐 My Keys - View your private keys',
      '📊 Prices EUR - Prices in euros',
      '🔄 Exchange - Swap one crypto for another, no KYC',
    ],
  },

  // Button labels + menu headers (localized navigation chrome).
  menu: {
    principal: '🎮 <b>Main Menu</b>',
    more: '☰ <b>More options</b>',
    settings: '⚙️ <b>Settings</b>',
    language: '🌐 <b>Language</b>',
    closed: '❌ Menu closed.',
    cancelled: '❌ <b>Operation cancelled</b>',
    wallets: '💰 Wallets',
    new: '➕ New',
    receive: '📥 Receive',
    send: '📤 Send',
    balances: '💵 Balances',
    prices: '📊 Prices',
    moreBtn: '☰ More',
    close: '❌ Close',
    cancelBtn: '❌ Cancel',
    back: '↩️ Back',
    exchange: '🔄 Exchange',
    invoice: '💳 Invoice',
    lightning: '⚡ Lightning',
    analyze: '🔎 Analyze',
    keys: '🔐 My Keys',
    help: '❓ Help',
    settingsBtn: '⚙️ Settings',
    languageBtn: '🌐 Language',
  },

  settings: {
    title: '⚙️ <b>Settings</b>\n\nChoose an option 👇',
    chooseLanguage: '🌐 <b>Language</b>\n\nChoose the bot language 👇',
    langFr: '🇫🇷 Français',
    langEn: '🇬🇧 English',
    changed: '✅ Language updated: English 🇬🇧',
  },

  exchange: {
    pickFrom: '🔄 <b>Swap without KYC</b>\n\n1️⃣ Choose the crypto to <b>send</b> 👇',
    pickTo: (sym) =>
      `🔄 <b>Swap without KYC</b>\n\nYou send: <b>${sym}</b>\n\n2️⃣ Choose the crypto to <b>receive</b> 👇`,
    pickFromNet: (sym) => `🌐 Which network are your <b>${sym}</b> on?`,
    pickToNet: (sym) => `🌐 Which network do you want to receive your <b>${sym}</b> on?`,
    ready: (fromSym, toSym) =>
      '✅ <b>Swap ready</b>\n' +
      '━━━━━━━━━━━━━━━\n' +
      `You send:    <b>${fromSym}</b>\n` +
      `You receive: <b>${toSym}</b>\n` +
      '━━━━━━━━━━━━━━━\n\n' +
      `📥 Your <b>${toSym}</b> receiving address is already pre-filled.\n` +
      `👉 Open the link, enter the amount, then send your <b>${fromSym}</b> to the deposit address shown.\n\n` +
      '🔒 No KYC · best rate automatically · the bot never touches your funds.',
    openButton: '🔒 Open the swap',
    noWallet: (chainName) =>
      `👻 No <b>${chainName}</b> wallet to receive yet.\n\nCreate one (➕ New), then restart the swap.`,
    fromWallet: (sym) =>
      `🔄 <b>Swap from this wallet</b>\n\nYou send: <b>${sym}</b>\n\n2️⃣ Choose the crypto to <b>receive</b> 👇`,
    quoteExact: (fromSym, amt, toSym, provider) =>
      `💱 Rate: 1 ${fromSym} ≈ <b>${amt} ${toSym}</b> <i>(via ${provider})</i>`,
    quoteMarket: (fromSym, amt, toSym) =>
      `💱 1 ${fromSym} ≈ <b>${amt} ${toSym}</b> <i>(market rate, before fees)</i>`,
    netFee: (amt, sym) => `⛽ Sending network fee ≈ <b>${amt} ${sym}</b>`,
  },
};
