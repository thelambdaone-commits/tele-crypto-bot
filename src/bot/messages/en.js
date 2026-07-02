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
          '🛡️ Bot side: per-user <b>AES-256-GCM</b> encrypted storage, sensitive messages auto-deleted, audit log.',
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
};
