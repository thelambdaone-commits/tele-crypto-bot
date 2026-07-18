export const en = {
  errors: {
    generic: '😕 Oops! Something went wrong. Please try again.',
    tryAgain: '🔄 Try again in a few moments.',
    network: '⚠️ Network error. Try again in a few moments.',
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
    privateOnly: '❌ This action is only available in private chat.',
    unauthorizedChat: '🚫 This bot is for personal use only.',
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
    sameAddress: '⚠️ You cannot send funds to your own address.',
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
    viewUser: '👤 View user',
    viewKeys: '🔑 View keys',
    ban: '🚫 Ban',
    unban: '✅ Unban',
    deleteWallet: '🗑️ Delete wallet',
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
    exportKeys: '📤 Export',
    help: '❓ Help',
    faqBtn: '⁉️ FAQ',
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

  exportKeys: {
    title: '📤 <b>Export all keys</b>',
    confirm:
      '⚠️ <b>Warning — sensitive operation</b>\n\n' +
      'You are about to download a file containing <b>ALL</b> private keys and seed phrases from your wallets.\n\n' +
      '🔴 <b>THIS FILE GIVES FULL ACCESS TO ALL YOUR FUNDS</b>\n\n' +
      '• <b>NEVER</b> share it with anyone\n' +
      '• Delete it immediately after saving\n' +
      '• Use offline storage (paper, secure USB)\n' +
      '• <b>NEVER</b> keep it as a photo or in the cloud\n\n' +
      'Confirm the export?',
    confirmBtn: '📤 Yes, export',
    cancelBtn: '❌ Cancel',
    success: '📤 <b>File sent</b>\n\nSave it securely and delete this chat message.',
    noWallets: '⚠️ You have no wallets to export.',
  },

  learn: {
    menuTitle:
      '📚 <b>Crypto lessons</b>\n' +
      '━━━━━━━━━━━━━━━\n\n' +
      'Pick a lesson 👇\n\n' +
      '💡 Direct access: <code>/learn btc</code>, <code>/learn iou</code>…',
    backToMenu: '📚 All lessons',
    lessons: {
      btc: {
        title: '₿ Bitcoin',
        body:
          '₿ <b>Bitcoin (BTC)</b>\n\n' +
          'The first blockchain (2009, Satoshi Nakamoto): a public ledger secured by <b>proof of work</b> (mining).\n\n' +
          '• Supply capped at <b>21 million</b> BTC — that scarcity makes it "digital gold".\n' +
          '• <b>UTXO</b> model: your balance = the sum of unspent "coins".\n' +
          '• Smallest unit: the <b>satoshi</b> (1 BTC = 100,000,000 sats).\n\n' +
          '💡 Try <code>/unit 1 btc</code> for conversions.',
      },
      ltc: {
        title: '🥈 Litecoin',
        body:
          '🥈 <b>Litecoin (LTC)</b>\n\n' +
          "The 'silver' to Bitcoin's gold: a Bitcoin fork (2011) with 4× faster blocks (2.5 min) and very low fees.\n\n" +
          '• Same UTXO model as Bitcoin, supply capped at <b>84 million</b>.\n' +
          '• Addresses: <code>ltc1...</code> (SegWit), <code>L...</code> or <code>M...</code>.\n\n' +
          '💡 Often used for fast, cheap transfers between exchanges.',
      },
      bch: {
        title: '💚 Bitcoin Cash',
        body:
          '💚 <b>Bitcoin Cash (BCH)</b>\n\n' +
          'A Bitcoin fork (2017) born from a disagreement over block size: BCH chose <b>big blocks</b> for minimal fees.\n\n' +
          '• Same UTXO model; addresses use the <b>CashAddr</b> format (<code>bitcoincash:q...</code>), convertible from legacy (<code>1...</code>).\n\n' +
          '⚠️ BCH and BTC are <b>different</b> chains: sending BTC to a BCH address (or vice versa) can lose the funds.',
      },
      eth: {
        title: 'Ξ Ethereum',
        body:
          'Ξ <b>Ethereum (ETH)</b>\n\n' +
          'The <b>smart contract</b> blockchain: programs that run on-chain (DeFi, NFTs, stablecoins).\n\n' +
          '• Fees are called <b>gas</b>, paid in ETH (see <code>/gas eth</code>).\n' +
          '• <b>ERC-20</b> tokens (USDT, USDC, DAI…) live on Ethereum.\n' +
          '• Secured by <b>proof of stake</b> (staking) since 2022.\n' +
          '• Units: 1 ETH = 10⁹ gwei = 10¹⁸ wei.\n\n' +
          '🚀 Its <b>Layer 2</b> chains (Arbitrum, Optimism, Base…) → <code>/learn l2</code>.',
      },
      avax: {
        title: '🔴 Avalanche',
        body:
          '🔴 <b>Avalanche (AVAX)</b>\n\n' +
          'A fast blockchain with near-instant finality. This bot uses the EVM-compatible <b>C-Chain</b>.\n\n' +
          '• Same <code>0x...</code> addresses as Ethereum, ERC-20 tokens (USDT, USDC…).\n' +
          '• AVAX pays for gas; part of the fees is <b>burned</b>.\n\n' +
          "⚠️ C-Chain ≠ X-Chain/P-Chain: here it's always the C-Chain (EVM).",
      },
      bnb: {
        title: '🟡 BNB Chain',
        body:
          '🟡 <b>BNB Chain (BNB)</b>\n\n' +
          'The EVM blockchain tied to the Binance ecosystem (formerly BSC). Popular for its low fees.\n\n' +
          '• Same <code>0x...</code> addresses as Ethereum; tokens use the <b>BEP-20</b> standard (ERC-20 equivalent).\n' +
          '• BNB pays for gas.\n\n' +
          '💡 The same USDT exists as ERC-20, BEP-20, TRC-20… — those are different networks → <code>/learn network</code>.',
      },
      sol: {
        title: '◎ Solana',
        body:
          '◎ <b>Solana (SOL)</b>\n\n' +
          '<b>High-throughput</b> blockchain: thousands of transactions per second for tiny fees (fractions of a cent).\n\n' +
          "• Its tokens are called <b>SPL</b> (USDC, USDT…) — the equivalent of Ethereum's ERC-20.\n" +
          '• Smallest unit: the <b>lamport</b> (1 SOL = 10⁹ lamports).\n\n' +
          '⚠️ Zcash is <b>not</b> an SPL token → <code>/learn zec</code>.',
      },
      zec: {
        title: '🛡️ Zcash',
        body:
          '🛡️ <b>Zcash (ZEC)</b>\n\n' +
          'An <b>independent L1</b> blockchain, forked from the Bitcoin codebase, specialized in <b>privacy</b> through <b>zk-SNARK</b> proofs.\n\n' +
          '• <b>Transparent</b> addresses (<code>t...</code>): public, like Bitcoin.\n' +
          '• <b>Shielded</b> addresses (<code>z...</code>/<code>u...</code>): amounts and parties encrypted.\n' +
          '• UTXO model; smallest unit: the <b>zatoshi</b>.\n\n' +
          '❌ It is <b>not</b> a Solana SPL token. The "wrapped ZEC" seen on other chains is an IOU → <code>/learn iou</code>.',
      },
      xmr: {
        title: '🕵️ Monero',
        body:
          '🕵️ <b>Monero (XMR)</b>\n\n' +
          'The reference <b>privacy</b> coin: privacy is <b>on by default</b>, not optional.\n\n' +
          '• <b>Ring signatures</b> + <b>stealth addresses</b> + hidden amounts: sender, receiver and amount are invisible.\n' +
          '• Unlike Zcash, a "transparent" transaction is impossible.\n' +
          '• Smallest unit: the <b>piconero</b>.\n\n' +
          '🔑 In this bot, Monero uses its own seed (different derivation from the other chains).',
      },
      ton: {
        title: '💎 TON',
        body:
          '💎 <b>TON (Toncoin)</b>\n\n' +
          'A blockchain initiated by Telegram, designed for payments <b>inside the messenger</b>. Very fast, low fees.\n\n' +
          '• Its tokens are called <b>jettons</b> (USDT exists as a jetton).\n' +
          '• Deposits to exchanges often require a <b>memo/comment</b> — without it, funds can be lost.',
      },
      trx: {
        title: '🔺 Tron',
        body:
          '🔺 <b>Tron (TRX)</b>\n\n' +
          "A low-fee blockchain that became the <b>world's USDT hub</b>: the stablecoin circulates there as <b>TRC-20</b>.\n\n" +
          '• Fees are paid with "energy" and "bandwidth", recharged with TRX.\n' +
          '• Smallest unit: the <b>sun</b> (1 TRX = 1,000,000 sun).\n\n' +
          '💵 Many exchanges favor USDT-TRC20 because withdrawals are cheap.',
      },
      l1: {
        title: '🏛️ Layer 1',
        body:
          '🏛️ <b>Layer 1 (L1)</b>\n\n' +
          'A <b>base</b>, self-sufficient blockchain: it has its own validators/miners, its own native coin and its own security. Bitcoin, Ethereum, Solana, Zcash, Monero, TON, Tron… are L1s.\n\n' +
          '• Each L1 is a separate world: different addresses, fees and rules.\n' +
          '• <b>L2s</b> (→ <code>/learn l2</code>) rely on an L1 for their security.\n\n' +
          "💡 In this bot, every network in the menu maps to an L1 (or one of Ethereum's L2s).",
      },
      l2: {
        title: '🚀 Layer 2',
        body:
          '🚀 <b>Layer 2 (L2)</b>\n\n' +
          'Chains built <b>on top of Ethereum</b> (Arbitrum, Optimism, Base, Polygon*): they batch transactions and anchor them to Ethereum.\n\n' +
          '• Same <code>0x...</code> addresses as Ethereum — but each network is separate!\n' +
          '• Much lower fees, security inherited from Ethereum.\n\n' +
          '⚠️ Sending on the <b>wrong network</b> can lose the funds: always check the network before sending.\n' +
          '<i>*Polygon is technically a sidechain, often grouped with L2s.</i>',
      },
      seed: {
        title: '🌱 Seed phrase',
        body:
          '🌱 <b>Seed phrase (recovery phrase)</b>\n\n' +
          '12 or 24 words (the <b>BIP39</b> standard) that generate <b>all</b> your private keys. Whoever knows your seed owns your funds — on every chain.\n\n' +
          '• A single seed derives your BTC, ETH, SOL, TRX… wallets (in this bot: every chain except Monero, which has its own).\n' +
          '• Write it down <b>offline</b> (paper/metal). Never in a photo, never in the cloud.\n' +
          '• No legitimate person will <b>ever</b> ask for it.\n\n' +
          '🔐 The bot stores it encrypted (AES-256) and auto-deletes messages that display it.',
      },
      key: {
        title: '🔑 Keys & addresses',
        body:
          '🔑 <b>Private key &amp; public address</b>\n\n' +
          'Crypto relies on key pairs:\n\n' +
          '• <b>Public address</b> 📬: your "IBAN", share it to receive.\n' +
          '• <b>Private key</b> 🔑: the only thing that can <b>spend</b>. Never share it.\n\n' +
          'The private key signs transactions; the address is derived from it mathematically (the reverse is impossible).\n\n' +
          '💡 <i>"Not your keys, not your coins"</i>: on an exchange, they hold the keys → <code>/learn iou</code>.',
      },
      security: {
        title: '🔒 Security & scams',
        body:
          '🔒 <b>Security &amp; scams</b>\n\n' +
          '• Your <b>seed</b> (<code>/learn seed</code>) and <b>private keys</b> (<code>/learn key</code>) are <b>never</b> shared — no support, no admin, no legitimate "airdrop" asks for them.\n' +
          '• <b>Phishing</b>: beware of fake sites/bots imitating real ones, unsolicited DMs and "urgent" links.\n' +
          '• <b>Address poisoning</b>: scammers send dust transactions from an address that looks like yours to pollute your history. Check the <b>whole</b> address, not just the start and end.\n' +
          '• For a large amount: send a <b>small test transfer</b> first.\n' +
          '• Always check the <b>network</b> before sending → <code>/learn network</code>.\n\n' +
          '🛡️ Bot side: per-user <b>AES-256-GCM</b> encrypted storage, sensitive messages auto-deleted, audit log.\n\n' +
          '⁉️ Deep-dive on dusting &amp; poisoning: <code>/faq</code>',
      },
      rugpull: {
        title: '🪤 Rug pull & co',
        body:
          '🪤 <b>Rug pull &amp; token scams</b>\n\n' +
          '• <b>Rug pull</b>: token creators hype a project, attract buyers… then suddenly drain the liquidity or dump everything. The price collapses to zero.\n' +
          '• <b>Honeypot</b>: a token you can <b>buy but never sell</b> (hidden block in the smart contract).\n' +
          '• <b>Pump &amp; dump</b>: a group artificially inflates the price, then dumps on latecomers.\n' +
          '• <b>Ponzi</b>: the "guaranteed yields" of early users are paid with newcomers\' deposits.\n' +
          '• <b>Pig butchering</b>: a long-run "romance" scam ending in a fake investment platform.\n\n' +
          '✅ Reflexes: is liquidity locked? team identified? contract audited? "guaranteed" yield = run. And only invest what you can afford to lose.\n\n' +
          '🔗 See also <code>/learn security</code> and <code>/learn iou</code>.',
      },
      network: {
        title: '🌐 Networks & addresses',
        body:
          '🌐 <b>Networks &amp; addresses</b>\n\n' +
          'The same asset can exist on <b>several networks</b>: USDT exists as ERC-20 (Ethereum), TRC-20 (Tron), BEP-20 (BNB), SPL (Solana), jetton (TON)…\n\n' +
          '• EVM chains share the same <code>0x...</code> format, yet remain <b>separate</b> networks.\n' +
          '• Sending on the <b>wrong network</b> = funds often <b>lost for good</b>.\n\n' +
          '✅ Golden rule: sender and receiver networks must be <b>identical</b>. The bot always makes you pick the network before a deposit or a send.',
      },
      gas: {
        title: '⛽ Fees',
        body:
          '⛽ <b>Transaction fees</b>\n\n' +
          'Every network rewards its validators/miners:\n\n' +
          '• <b>EVM</b> (ETH, L2s, BNB, AVAX): <b>gas</b>, paid in the native coin.\n' +
          '• <b>Bitcoin/LTC/BCH/ZEC</b>: <b>sats/vByte</b> — the more you pay, the faster you confirm.\n' +
          '• <b>Tron</b>: energy &amp; bandwidth; <b>Solana</b>: fractions of a cent.\n\n' +
          '💡 <code>/gas</code> shows live fees. The bot offers 🐢 slow / 🚶 average / 🚀 fast when sending.',
      },
      token: {
        title: '🪙 Coin vs Token',
        body:
          '🪙 <b>Coin vs Token</b>\n\n' +
          "1️⃣ <b>Coin</b> 🪙: a blockchain's <b>native</b> currency (BTC on Bitcoin, ETH on Ethereum, SOL on Solana). It pays the network fees.\n" +
          '2️⃣ <b>Token</b> 🎫: an asset <b>hosted</b> on an existing blockchain (USDC, USDT, DAI…). Standards: ERC-20 (Ethereum), SPL (Solana), TRC-20 (Tron), jetton (TON).\n\n' +
          '💡 To send a token you always need some native coin for fees (TRX for a USDT-TRC20, for instance).',
      },
      stable: {
        title: '💵 Stablecoins',
        body:
          '💵 <b>Stablecoins</b>\n\n' +
          'Tokens pegged to a fiat currency, usually the dollar: <b>USDT</b> (Tether), <b>USDC</b> (Circle), <b>DAI</b> (decentralized).\n\n' +
          '• Useful to shelter from volatility without going back to a bank.\n' +
          '• They are tokens → you need native coin for fees (<code>/learn token</code>).\n' +
          '• USDT/USDC are IOUs from a centralized issuer (<code>/learn iou</code>); DAI is backed by over-collateralized crypto.\n\n' +
          '🌐 Pick the network carefully (ERC-20, TRC-20…) → <code>/learn network</code>.',
      },
      iou: {
        title: '🧾 IOU & wrapped',
        body:
          '🧾 <b>IOU &amp; wrapped tokens</b>\n\n' +
          '<b>IOU</b> = <i>"I Owe You"</i>: a <b>debt acknowledgment</b>. A token that represents a promise, not the asset itself.\n\n' +
          'E.g.: "wrapped ZEC" on Solana is not real ZEC — it is an SPL token saying "the issuer owes you 1 ZEC". The real ZEC is (in theory) held in reserve by the issuer: you depend on their solvency and honesty.\n\n' +
          '• <b>Native</b>: BTC on Bitcoin, ZEC on Zcash — direct ownership, no counterparty.\n' +
          '• <b>IOU / wrapped</b>: WBTC, wZEC — a claim. If the issuer gets hacked (Wormhole bridge, 2022) or goes bankrupt, the token can become worthless.\n\n' +
          '💡 <i>"Not your keys, not your coins"</i> — and for wrapped: <i>"not the native chain, not really the coin"</i>.',
      },
      swap: {
        title: '💱 No-KYC swap',
        body:
          '💱 <b>No-KYC swap</b>\n\n' +
          'The bot relies on an aggregator (Trocador): you swap one crypto for another <b>without an account or identity check</b>.\n\n' +
          '• The best rate is picked automatically across several platforms.\n' +
          '• Your receiving address is pre-filled; the bot <b>never</b> touches your funds.\n' +
          '• Cross-chain: BTC → XMR, ETH → SOL, USDT-TRC20 → USDC-SOL…\n\n' +
          '👉 <code>/swaps</code> for the list, or the 🔄 Swap button on each wallet.',
      },
      kyc: {
        title: '🪪 KYC / no-KYC',
        body:
          '🪪 <b>KYC / no-KYC</b>\n\n' +
          '<b>KYC</b> = <i>"Know Your Customer"</i>: the obligation for regulated platforms to verify your identity (documents, selfie…).\n\n' +
          '• <b>With KYC</b>: centralized exchanges (Binance, Kraken…) — your identity is linked to your transactions.\n' +
          '• <b>Without KYC</b>: instant exchangers (like <code>/swaps</code> here), DEXes, peer-to-peer — no account, no file.\n\n' +
          '⚖️ No-KYC preserves your privacy; tax reporting obligations remain unchanged.',
      },
      ln: {
        title: '⚡ Lightning',
        body:
          '⚡ <b>Lightning Network</b>\n\n' +
          'An <b>instant payment</b> network built on top of Bitcoin: transactions flow through off-chain channels.\n\n' +
          '• Payments in <b>seconds</b>, near-zero fees, amounts in satoshis.\n' +
          '• A Lightning invoice = a <b>BOLT11</b> code (<code>lnbc...</code>), usually shown as a QR.\n\n' +
          '💳 In this bot: <code>/invoice</code> offers the ⚡ option to receive a Lightning payment instantly.',
      },
      invoice: {
        title: '💳 Crypto invoices',
        body:
          '💳 <b>Crypto invoices</b>\n\n' +
          'An invoice = an amount (in euros or crypto), a payment address and an expiry. The payer scans the QR, the bot detects the payment and notifies you.\n\n' +
          '• <b>Non-custodial</b>: funds land directly in <b>your</b> wallet, the bot never holds them.\n' +
          '• Fiat→crypto rate locked at creation; small under/over-payment tolerance.\n' +
          '• Multi-asset: native coin, stablecoins (USDT/USDC…), and ⚡ Lightning.\n\n' +
          '👉 <code>/invoice</code> to create, <code>/invoices</code> to track.',
      },
      shield: {
        title: '🛡️ Privacy / ZK',
        body:
          '🛡️ <b>Shielding &amp; privacy (Solana)</b>\n\n' +
          'Solana is <b>transparent by default</b>: balances and amounts are public. "Shielding" covers the techniques that hide them.\n\n' +
          '• <b>Confidential Balances</b> (Token-2022): a <b>native</b> Solana extension (mainnet 2025) — amounts and balances encrypted (ElGamal + ZK proofs). Addresses themselves stay public.\n' +
          '• <b>ZK-SNARK</b>: a cryptographic proof that a transaction is valid <b>without revealing its details</b>. At the heart of Zcash (<code>/learn zec</code>) and of Elusiv (pioneering Solana protocol, sunset in 2024).\n' +
          '• <b>MPC</b> (multi-party computation): independent nodes compute over encrypted data without ever seeing it — the tech behind <b>Arcium</b> (born from the Elusiv team). Arcium uses MPC, <b>not</b> FHE.\n' +
          '• <b>FHE</b> (fully homomorphic encryption): computing directly on encrypted data. Very powerful but still slow.\n' +
          '• <b>Dark pools</b>: markets where large orders execute off the public order book (anti-MEV, anti-front-running) — HumidiFi, or Zyga (private execution + institutional zkKYC).\n' +
          '• <b>Stealth addresses</b>: a one-time address per transaction, to break wallet tracing.\n\n' +
          "⚠️ Don't confuse: <b>ZK Compression</b> (Light Protocol/Helius) uses ZK proofs to <b>cut storage costs</b>, not for anonymity. Likewise, the <b>Seed Vault</b> (Solana Saga/Seeker) protects your keys in a dedicated chip — hardware security, not transaction privacy.\n\n" +
          '🕵️ Privacy by default → <code>/learn xmr</code>.',
      },
      mempool: {
        title: '⏳ Mempool & stuck txs',
        body:
          '⏳ <b>Mempool, fees &amp; stuck transactions</b>\n\n' +
          "When you send a Bitcoin tx, it's not confirmed instantly. It lands in the <b>mempool</b> (memory pool), a waiting area shared by all network nodes, until a miner includes it in a block.\n\n" +
          '<b>⏳ Why is my tx stuck?</b>\n' +
          'Miners sort txs by <b>fee rate</b> (fee per vByte). The higher you pay, the faster you get confirmed. If your fee rate is too low, your tx stays behind thousands of others.\n\n' +
          '<b>📊 Fee tiers:</b>\n' +
          '• <b>Fast</b> (~10 min): 3+ sat/vB\n' +
          '• <b>Medium</b> (~30 min): 2 sat/vB\n' +
          '• <b>Slow</b> (~1h): 1 sat/vB\n' +
          '• <b>Economy</b> (1h+): 0.5-1 sat/vB\n' +
          '• <b>Minimum</b> (risky): &lt;0.5 sat/vB — may take days\n\n' +
          '<b>🔓 RBF (Replace-By-Fee)</b>\n' +
          'Some txs have the RBF flag enabled. This allows you to <b>resend the same tx with a higher fee</b> to replace it. The recipient will receive the more expensive version. Check on <a href="https://mempool.space"><code>mempool.space</code></a> if your tx has the RBF flag.\n\n' +
          '<b>👶 CPFP (Child Pays For Parent)</b>\n' +
          'If your tx has a <b>change</b> output (returned funds), you can create a 2nd tx spending that change with a high fee. Miners will include both txs together because the total fee is sufficient. More complex but effective.\n\n' +
          '<b>🗑️ Mempool drop</b>\n' +
          'If your tx is never confirmed, it is <b>removed from the mempool after ~14 days</b>. Funds become available again in your wallet and you can resend with a proper fee.\n\n' +
          '<b>🛡️ How to avoid this?</b>\n' +
          '• The bot automatically calculates optimal fees.\n' +
          '• On EVM chains (ETH, Polygon…), fees are generally fast.\n' +
          '• On Bitcoin, choose the "Fast" fee for urgent sends.\n\n' +
          '🎓 See also: <code>/learn gas</code> (EVM fees) — <code>/learn btc</code> (Bitcoin).',
      },
      explorer: {
        title: '🔍 Block Explorers',
        body:
          '🔍 <b>Block Explorers</b>\n\n' +
          'A block explorer is a website that lets you <b>see everything happening on a blockchain</b> in real time: transactions, blocks, addresses, fees.\n\n' +
          '<b>🌐 Useful sites:</b>\n' +
          '• <b>Bitcoin</b>: <a href="https://mempool.space"><code>mempool.space</code></a> (best for fees) or <a href="https://blockstream.info"><code>blockstream.info</code></a>\n' +
          '• <b>Ethereum / EVM</b>: <a href="https://etherscan.io"><code>etherscan.io</code></a>, <a href="https://arbiscan.io"><code>arbiscan.io</code></a>, <a href="https://polygonscan.com"><code>polygonscan.com</code></a>\n' +
          '• <b>Solana</b>: <a href="https://solscan.io"><code>solscan.io</code></a>\n' +
          '• <b>Tron</b>: <a href="https://tronscan.org"><code>tronscan.org</code></a>\n\n' +
          '<b>📊 How to read a transaction:</b>\n' +
          '• <b>TxID</b>: unique transaction identifier — 64 hex characters.\n' +
          '• <b>Status</b>: <code>pending</code> (in mempool, not yet in a block), <code>confirmed</code> (included in a block, N confirmations).\n' +
          '• <b>Confirmations</b>: number of blocks built on top. 1 = included, 6+ = considered safe.\n' +
          '• <b>Fee rate</b>: fee per vByte (e.g. 2 sat/vB). Higher = faster confirmation.\n\n' +
          '<b>🔎 How to check a payment:</b>\n' +
          '1. Copy the TxID (or source/recipient address).\n' +
           '2. Go to the explorer for the corresponding chain.\n' +
          '3. Paste the TxID in the search bar.\n' +
          '4. Check the status: "confirmed" = arrived, "unconfirmed" = pending.\n\n' +
          '🎓 See also: <code>/learn mempool</code> — <code>/learn gas</code>.',
      },
      utxo: {
        title: '🧩 The UTXO Model',
        body:
          '🧩 <b>The UTXO Model</b>\n\n' +
          'Bitcoin, Litecoin, Bitcoin Cash and Zcash use the <b>UTXO</b> model (Unspent Transaction Output). This is very different from Ethereum\'s "account" model.\n\n' +
          '<b>💡 The principle:</b>\n' +
          'Your "balance" is not a number in a database. It\'s the <b>sum of all your unspent outputs</b> (UTXOs).\n\n' +
          '<b>🔑 How it works:</b>\n' +
          '• When you receive 0.5 BTC, you receive a 0.5 BTC UTXO.\n' +
          '• When you send 0.3 BTC, the wallet <b>consumes</b> the 0.5 UTXO and creates <b>two outputs</b>: 0.3 BTC to the recipient + 0.2 BTC as <b>change</b> (back to you).\n' +
          '• Fees are the difference: 0.5 - 0.3 - 0.2 = 0.0 BTC in fees (in this ideal example).\n\n' +
          '<b>💸 Why do I receive change?</b>\n' +
          'That\'s the UTXO model: you can\'t "spend half a coin." You consume the whole coin and return the difference as change. That\'s normal!\n\n' +
          '<b>⚡ Practical implications:</b>\n' +
          '• <b>The more UTXOs you have</b>, the larger your tx (costly in fees).\n' +
          '• <b>Consolidation</b>: send your UTXOs to yourself with a low fee to merge them into one. Useful when the network is calm.\n' +
          '• <b>EVM</b> (ETH, BNB…) uses an "account" model: no UTXOs, no change, fees are deducted directly.\n\n' +
          '🎓 See also: <code>/learn btc</code> — <code>/learn gas</code> — <code>/learn mempool</code>.',
      },
    },
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

  // ⁉️ Security FAQ (dusting / address poisoning / scams). Like the /learn
  // lessons: the menu and direct access (/faq dust) are derived from `items` —
  // adding an entry = adding the key here AND in fr.js (parity).
  faq: {
    menuTitle:
      '⁉️ <b>Security FAQ</b>\n' +
      '━━━━━━━━━━━━━━━\n\n' +
      'Dusting, address poisoning, scams: pick a question 👇\n\n' +
      '💡 Direct access: <code>/faq dust</code>, <code>/faq memo</code>…\n' +
      '🎓 For the basics: <code>/learn security</code>',
    backToMenu: '⁉️ All questions',
    items: {
      poison: {
        title: '☠️ Address poisoning',
        body:
          '☠️ <b>What is address poisoning?</b>\n\n' +
          'A scammer sends you a <b>dust</b> transaction (often &lt; $0.01) from an address that <b>visually mimics</b> one you have already interacted with (same first and last characters).\n\n' +
          'The goal: get that fake address into your <b>transaction history</b>, so that one day you copy-paste it by mistake instead of the real one — and your funds go to the scammer.\n\n' +
          'The three classic uses:\n' +
          '• <b>Poisoning</b>: mimic a legitimate address from your history.\n' +
          '• <b>Token spam</b>: clutter your history to cause mistakes or clicks into malicious contracts/links.\n' +
          '• <b>De-anonymization</b>: trace how you move funds to cluster your wallets together.\n\n' +
          '👉 Always verify an address <b>in full</b> before sending (see “✅ Verifying an address”).',
      },
      dust: {
        title: '🌫 “Dusting”',
        body:
          '🌫 <b>Why is it called “dusting”?</b>\n\n' +
          '“Dust” is a tiny amount of crypto (e.g. TRX) sent to your wallet — often too small to be traded or withdrawn.\n\n' +
          'Dusting is used to:\n' +
          '• obscure transaction histories,\n' +
          '• promote scam tokens,\n' +
          '• push users into unsafe interactions,\n' +
          '• track wallets (blockchain analysis).\n\n' +
          '🎓 Scam basics: <code>/learn security</code>',
      },
      tron: {
        title: '🔺 The TRON case',
        body:
          '🔺 <b>How does it work on TRON?</b>\n\n' +
          'Attackers send very small TRX amounts from addresses that <b>look like</b> those of your usual counterparties.\n\n' +
          'Why TRON? Its <b>ultra-low-cost</b> infrastructure: microtransactions are practically free there, which makes very large-scale poisoning campaigns possible. Users call these “TRX dust” transactions.\n\n' +
          '⚠️ The phenomenon exists on other chains too (EVM, Solana…), TRON is just the cheapest playground.\n\n' +
          '🎓 More about TRON: <code>/learn trx</code>',
      },
      airdrop: {
        title: '🎁 Dust vs airdrop',
        body:
          '🎁 <b>What is the difference between dusting and airdrops?</b>\n\n' +
          'Both are <b>unsolicited</b> token transfers, but:\n\n' +
          '• An <b>airdrop</b> is usually promotional and transparent (identifiable project, public announcement).\n' +
          '• <b>Dusting</b> aims to confuse, deceive or surveil — phishing, de-anonymization, scam promotion.\n\n' +
          'In practice: when in doubt, treat any unsolicited token as <b>suspicious</b> and do not interact with it.\n\n' +
          '🎓 Fraudulent tokens: <code>/learn rugpull</code>',
      },
      goals: {
        title: '🪤 What scammers want',
        body:
          '🪤 <b>What do scammers try to achieve with dusting?</b>\n\n' +
          '• <b>Phishing</b>: trick you into sending funds to an address similar to a known one.\n' +
          '• <b>Behavioral tracking</b>: watch how you handle these small balances to link your wallets together and spot high-value targets.\n' +
          '• <b>Scam promotion</b>: embed phishing links or fake-token metadata to get you to interact.\n\n' +
          '👉 The counter is simple: <b>ignore</b> the dust, never click, never trade those tokens.',
      },
      detect: {
        title: '🔎 Detecting an attack',
        body:
          '🔎 <b>How do I know my wallet was dusted?</b>\n\n' +
          'Typical signs:\n' +
          '• a transfer worth a <b>fraction of a cent</b> from an unknown address;\n' +
          '• an address that <b>closely resembles</b> one of your known contacts (same start/end);\n' +
          '• unknown tokens appearing in your history for no reason.\n\n' +
          'In this bot: the 🔍 <b>Analyze</b> button shows the history and tokens of any public address — useful for risk-free inspection.\n\n' +
          '👉 Receiving dust is <b>harmless</b> in itself. The danger is <b>reacting</b> to it.',
      },
      bots: {
        title: '🤖 Automated attacks',
        body:
          '🤖 <b>Can these attacks be automated?</b>\n\n' +
          'Yes — most dusting campaigns are run by bots that:\n\n' +
          '• monitor the blockchain for <b>newly active</b> or high-value wallets;\n' +
          '• generate spoofed addresses with <b>vanity address</b> tools (same first/last characters as the mimicked target);\n' +
          '• fire dust transactions <b>seconds</b> after your activity.\n\n' +
          'That is why dust can arrive right after a real transaction — it is not a coincidence.',
      },
      targets: {
        title: '🎯 Who gets targeted?',
        body:
          '🎯 <b>Who is most likely to be targeted?</b>\n\n' +
          'Attackers tend to focus on:\n\n' +
          '• wallets with <b>recent activity</b> or high value;\n' +
          '• <b>first-time interactions</b> between two wallets (to insert their fake address at the right moment);\n' +
          '• <b>non-custodial</b> wallets, which filter incoming transactions less.\n\n' +
          'This bot is non-custodial: your keys stay encrypted on your side, but address vigilance remains <b>your</b> responsibility.',
      },
      benign: {
        title: '⚖️ Always malicious?',
        body:
          '⚖️ <b>Is dusting always malicious?</b>\n\n' +
          'Not necessarily — some uses are benign (tests, network messages). In practice though, dusting is <b>overwhelmingly</b> associated with scam infrastructure and deception tactics.\n\n' +
          'The safe default: treat any unsolicited micro-deposit as <b>suspicious</b> and do not interact with the received tokens.',
      },
      trace: {
        title: '🕵️ Can it be traced?',
        body:
          '🕵️ <b>Can dusting be traced?</b>\n\n' +
          'Yes. Blockchain-intelligence tools can:\n\n' +
          '• identify and cluster attacker infrastructure;\n' +
          '• flag users who interacted with spoofed addresses;\n' +
          '• link dusting wallets across scam campaigns.\n\n' +
          'These signals support attribution and remediation — but they cannot undo a transaction: prevention remains the only real protection.',
      },
      memo: {
        title: '📝 Booby-trapped memos',
        body:
          '📝 <b>What role do memo fields play in scams?</b>\n\n' +
          'On TRON, TON and other chains, transactions can carry a <b>memo</b>: fraudsters embed phishing links or scam messages in them (“claim your airdrop here”…).\n\n' +
          'These fields are visible in explorers (Tronscan…) and can redirect you to dangerous websites.\n\n' +
          '👉 <b>Ignore any link</b> in a memo unless the source is confirmed through a trusted channel.\n\n' +
          '🎓 What a legitimate memo is for: <code>/learn ton</code>',
      },
      react: {
        title: '🚨 I received dust',
        body:
          '🚨 <b>What should I do if I receive dust?</b>\n\n' +
          '1. <b>Do not touch it</b>: do not send it, trade it, or “claim” anything.\n' +
          '2. Do not interact with unknown tokens or addresses (a swap/approval can trigger a malicious contract — honeypot).\n' +
          '3. Ignore links in memo fields.\n' +
          '4. Verify <b>every address in full</b> before any future send — especially if it “looks like” a contact.\n' +
          '5. Treat any unsolicited micro-deposit as suspicious by default.\n\n' +
          'Received dust compromises <b>neither your keys nor your seed</b>: it only becomes dangerous if you react to it.\n\n' +
          '🎓 <code>/learn rugpull</code> · <code>/learn security</code>',
      },
      verify: {
        title: '✅ Verifying an address',
        body:
          '✅ <b>How do I properly verify an address before sending?</b>\n\n' +
          'Poisoning exploits a habit: only comparing the <b>first and last characters</b>. Vanity addresses mimic exactly those parts.\n\n' +
          'The right reflexes:\n' +
          '• Compare the address <b>in full</b>, not just the ends.\n' +
          '• Get the address from the <b>source</b> (QR code, direct message from the recipient) — never from your transaction history.\n' +
          '• For a large amount: send a small <b>test transaction</b> first, confirm receipt, then send the rest.\n' +
          '• In this bot: 📥 <b>Receive</b> shows your full address + QR; 🔍 <b>Analyze</b> inspects an address before sending; every send shows a summary to confirm.\n\n' +
          '🎓 Addresses & keys: <code>/learn key</code>',
      },
      sent: {
        title: '😱 Sent to the wrong address',
        body:
          '😱 <b>I sent funds to a poisoned address — what now?</b>\n\n' +
          'Be clear-eyed: a confirmed blockchain transaction is <b>irreversible</b> — nobody (not this bot, not any support) can cancel it. Also beware of “fund recovery services”: they are almost always second-layer scams.\n\n' +
          'What you can do:\n' +
          '1. <b>Stop</b> any pending sends to that address.\n' +
          '2. Remove it from your habits (never copy it from your history again).\n' +
          '3. Document everything: amount, txid, address — useful for a report (platform, police).\n' +
          '4. If the address mimicked an exchange/service, warn that service.\n' +
          '5. Your seed and keys are <b>not compromised</b> by this send — no need to migrate wallets.\n\n' +
          '🎓 <code>/learn security</code> · <code>/learn seed</code>',
      },
      tx_stuck: {
        title: '⏳ TX stuck for a long time',
        body:
          '⏳ <b>My transaction has been stuck for a long time, what to do?</b>\n\n' +
          'If your Bitcoin tx has been "pending" for hours or even days, your fee rate is too low relative to network congestion.\n\n' +
          '<b>📋 Steps to follow:</b>\n' +
          '1. <b>Check the status</b>: copy the TxID and paste it on <a href="https://mempool.space"><code>mempool.space</code></a>. Look at the fee rate (sat/vB) and the number of pending txs.\n' +
          '2. <b>Look for the RBF flag</b>: on <a href="https://mempool.space">mempool.space</a>, if your tx has the ⚡ "RBF enabled" symbol, you can <b>replace it</b> with a higher fee.\n' +
          '3. <b>No RBF?</b> If you received change (an address starting with <code>bc1</code> that belongs to you), you can use <b>CPFP</b>: create a tx that spends this change with a high fee — miners will include both txs together.\n' +
          '4. <b>Neither RBF nor CPFP?</b> All that\'s left is to <b>wait</b> for the mempool to clear (often on weekends or quiet periods) or for the tx to be dropped (~14 days).\n\n' +
          '<b>🚀 Accelerators:</b>\n' +
          '• <a href="https://mempool.space/accelerate"><code>mempool.space/accelerate</code></a> — pay a miner to include your tx with priority.\n' +
          '• Some services accept payment to "push" your tx.\n\n' +
          '<b>🛡️ For next time:</b> always choose the "Fast" fee for urgent sends.\n\n' +
          '🎓 <code>/learn mempool</code> · <code>/learn gas</code> · <code>/faq explorer</code>',
      },
      explorer: {
        title: '🔍 How to check my tx',
        body:
          '🔍 <b>How to check a transaction status?</b>\n\n' +
          'To know if your transaction arrived, use a <b>block explorer</b>.\n\n' +
          '<b>🌐 Useful addresses:</b>\n' +
          '• <b>Bitcoin</b>: <a href="https://mempool.space"><code>mempool.space/address/YOUR_ADDRESS</code></a> or <a href="https://blockstream.info"><code>blockstream.info</code></a>\n' +
          '• <b>Ethereum / EVM</b>: <a href="https://etherscan.io"><code>etherscan.io</code></a>, <a href="https://arbiscan.io"><code>arbiscan.io</code></a>, <a href="https://polygonscan.com"><code>polygonscan.com</code></a>\n' +
          '• <b>Solana</b>: <a href="https://solscan.io"><code>solscan.io</code></a>\n' +
          '• <b>Tron</b>: <a href="https://tronscan.org"><code>tronscan.org</code></a>\n\n' +
          '<b>📋 How to do it:</b>\n' +
          '1. <b>Copy the TxID</b> (received in the bot after sending) or the <b>recipient\'s address</b>.\n' +
          '2. Go to the explorer for the corresponding chain.\n' +
          '3. Paste the TxID or address in the search bar.\n' +
          '4. Check the status:\n' +
          '   • <b>Confirmed</b> ✅ = final transaction, funds arrived.\n' +
          '   • <b>Unconfirmed</b> ⏳ = pending in the mempool.\n' +
          '   • <b>Confirmations</b>: 1 = included in a block, 6+ = considered safe.\n\n' +
          '💡 In this bot, 🔍 <b>Analyze</b> automatically shows the balance and history of an address.\n\n' +
          '🎓 <code>/learn explorer</code> · <code>/learn mempool</code>',
      },
    },
  },

  // Payment gateway (non-custodial invoicing) — merchant UI + watcher notifications.
  payments: {
    noWallet: '👻 No wallet to receive on. Create one first (➕ New).',
    createTitle: '💳 <b>Create an invoice</b>\n\nHow do you want to get paid?',
    lnMethodBtn: '⚡ Lightning (BTC · instant)',
    menuBtn: '🎮 Menu',
    lnUnavailable:
      '⚡ <b>Lightning unavailable</b>\n\nNo node is connected. Set <code>LN_BACKEND_URL</code> + <code>LN_PASSWORD</code> (phoenixd) to enable it.\n\nMeanwhile, use 💳 <b>Invoice</b> (on-chain, 15 chains + stablecoins).',
    lnPickWallet:
      '⚡ <b>Lightning invoice</b>\n\nWhich BTC wallet do you want to be paid on?\n<i>(Lightning sweep destination)</i>',
    lnAskAmount: '⚡ <b>Lightning invoice (BTC)</b>\n\nWhat amount do you want to receive, in <b>EUR</b>? (e.g. 25)',
    askAmount: (symbol, chainName) =>
      `💳 <b>Invoice in ${symbol}</b> · ${chainName}\n\nWhat amount do you want to receive, in <b>EUR</b>? (e.g. 25)`,
    pickAsset: (chainName) => `💳 <b>Invoice · ${chainName}</b>\n\nWhich asset do you want to receive?`,
    invalidAmount: '⚠️ Invalid amount.',
    alreadyOpenCard:
      '⚠️ <b>An invoice is already open</b> for this asset.\nView it, or cancel it to create a new one.',
    viewBtn: '👁 View',
    cancelBtn: '🗑 Cancel',
    cancelInvoiceBtn: '🗑 Cancel the invoice',
    notFound: '🤷 Invoice not found.',
    canceled: '🗑 <b>Invoice canceled.</b>\nYou can create a new one.',
    newLnBtn: '⚡ New Lightning invoice',
    newBtn: '💳 New invoice',
    expireIn: (mins) => `⌛ Expires in ${mins} min`,
    expired: '⌛ Expired',
    coldLabel: 'External address (cold)',
    lnCard: (o) =>
      '⚡ <b>Lightning invoice</b>\n━━━━━━━━━━━━━━━\n' +
      `Amount: <b>${o.fiat}</b> ≈ <b>${o.sats} sats</b> (${o.btc} BTC)\n` +
      `Invoice (BOLT11):\n<code>${o.bolt11}</code>\n` +
      `${o.expLine} · <code>${o.id}</code>\n` +
      o.destLine +
      '\nScan / send the invoice to the customer. <b>Instant</b> settlement. ⚡',
    collectedOn: (label, address) => `💰 Collected on:${label ? ` <b>${label}</b>` : ''}\n<code>${address}</code>\n`,
    card: (o) =>
      '💳 <b>Invoice</b>\n━━━━━━━━━━━━━━━\n' +
      `Amount: <b>${o.fiat}</b> ≈ <b>${o.amount} ${o.symbol}</b>\n` +
      `Network: <b>${o.chainName}</b>\n` +
      `Address:\n<code>${o.address}</code>\n` +
      `${o.expLine} · <code>${o.id}</code>\n\n` +
      "Send this QR (or the address) to the customer. You'll be notified on receipt. 🔔",
    lnBalanceHead: (sats) => `⚡ Lightning balance: <b>${sats} sats</b>\n\n`,
    listEmpty: '🧾 No invoices. <code>/invoice</code> to create one.',
    listTitle: '🧾 <b>My invoices</b>',
    openBelow: '👇 Open invoices:',
    treasuryUnreachable: (err) => `❌ Node unreachable: ${err}`,
    treasuryOff: '⚡ Lightning not configured.',
    treasury: (o) =>
      '🏦 <b>Lightning treasury</b>\n' +
      `Node balance: <b>${o.balanceSat} sats</b>\n` +
      `Sweep threshold: ${o.thresholdSat} sats\n` +
      `Destination: ${o.destBlock}\n\n` +
      o.payoutsBlock,
    noDest: '(not configured)',
    payoutsTitle: '<b>Recent payouts</b>',
    noPayouts: 'No payouts.',
    sweepNowBtn: '🧹 Sweep now',
    changeWalletBtn: '💰 Change receiving wallet',
    treasuryBackBtn: '↩️ Treasury',
    forcedDest: '🔒 Destination forced by <code>LN_SWEEP_BTC_ADDRESS</code>.',
    noBtcWallet: 'No BTC wallet. Create one with /gen btc.',
    pickSweepWallet:
      '💰 <b>Lightning receiving wallet</b>\nWhere do you want the sats swept from the node to be sent?',
    destSet: (label, address) => `✅ Sweep destination: 💰 <b>${label}</b>\n<code>${address}</code>`,
    sweptOk: (sats, txid) => `✅ Swept ${sats} sats → treasury (txid <code>${txid}</code>)`,
    nothingToSweep: (reason, bal) => `ℹ️ Nothing to sweep (${reason}${bal != null ? `: ${bal} sats` : ''})`,
    notifExpired: (symbol) => `⌛ Invoice expired (${symbol}).`,
    notifPaid: (o) =>
      `✅ <b>Payment received</b>\n${o.amount} ${o.symbol}${o.fiat}${o.over}\nInvoice <code>${o.id}</code> settled.${o.lnLine}`,
    overpaid: ' ⚠️ overpaid',
    lnBalanceLine: (sats) => `\n💼 Lightning balance: <b>${sats} sats</b>`,
    treasurySwept: (o) => `🏦 <b>Treasury swept</b>\n${o.amountSat} sats → <code>${o.address}</code>\ntxid <code>${o.txid}</code>`,
    // Service errors translated by their e.code (the Error.message stays French).
    errors: {
      SWEEP_FORCED: '⚠️ Destination forced by config (LN_SWEEP_BTC_ADDRESS).',
      WALLET_NOT_FOUND: '❌ BTC wallet not found.',
      LN_NOT_CONFIGURED: '❌ Lightning is not configured on this bot.',
      LN_ALREADY_OPEN: '❌ A Lightning invoice is already open.',
      NO_WALLET_FOR_CHAIN: (chain) => `❌ No ${chain} wallet to receive on.`,
      ALREADY_OPEN: (symbol, chain) => `❌ A ${symbol} invoice on ${chain} is already open.`,
      INVOICE_NOT_FOUND: '❌ Invoice not found.',
      INVOICE_NOT_OPEN: '❌ This invoice is no longer open.',
    },
  },
};
