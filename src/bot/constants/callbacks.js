/**
 * Centralized Telegram Callback Constants
 * Prevents drift between keyboards and handlers
 */

export const CALLBACKS = {
  // Navigation
  BACK_TO_MENU: 'back_to_menu',
  CLOSE_MENU: 'close_menu',
  CANCEL: 'cancel',
  MORE_MENU: 'more_menu',
  SETTINGS_MENU: 'settings_menu',
  LANGUAGE_MENU: 'language_menu',
  INVOICE_START: 'invoice_start',
  INVOICE_LN: 'pinv_ln',

  // Learn (les leçons individuelles utilisent le préfixe dynamique learn_l_<key>)
  LEARN_MENU: 'learn_menu',

  // FAQ sécurité (les questions individuelles utilisent le préfixe dynamique faq_i_<key>)
  FAQ_MENU: 'faq_menu',

  // Wallet
  LIST_WALLETS: 'list_wallets',
  CREATE_WALLET: 'create_wallet',
  VIEW_KEYS: 'view_keys',
  EXPORT_ALL_KEYS: 'export_all_keys',
  CONFIRM_EXPORT_KEYS: 'confirm_export_keys',
  VIEW_BALANCES: 'view_balances',
  DEPOSIT: 'deposit',

  // Send
  SEND_FUNDS: 'send_funds',
  ANALYZE_ADDRESS: 'analyze_address',
  CONFIRM_SEND: 'confirm_send',
  CONFIRM_LIGHTNING: 'confirm_lightning',
  SEND_ONCHAIN: 'send_onchain',
  SEND_LIGHTNING: 'send_lightning',
  MANUAL_AMOUNT: 'manual_amount',
  QUICK_AMOUNT_ALL: 'quick_amount_all',
  QUICK_AMOUNT_50: 'quick_amount_50',
  AMOUNT_TYPE_NATIVE: 'amount_type_native',
  AMOUNT_TYPE_EUR: 'amount_type_eur',

  // Fees
  FEE_SLOW: 'fee_slow',
  FEE_AVERAGE: 'fee_average',
  FEE_FAST: 'fee_fast',
  FEE_AUTO: 'fee_auto',

  // Market
  PRICES_EUR: 'prices_eur',
  REFRESH_PRICES: 'refresh_prices',
  GRAPH_PICK: 'graph_pick',
  CLOSE_MESSAGE: 'close_message',
  HELP_MENU: 'help_menu',

  // Exchange (no-KYC cross-chain, quote-only)
  EXCHANGE: 'exchange',

  // Admin
  ADMIN_PANEL: 'admin_panel',
  ADMIN_STATS: 'admin_stats',
  ADMIN_SECURITY: 'admin_security',
  ADMIN_AUDIT: 'admin_audit',
  ADMIN_LIST_USERS: 'admin_list_users',
  ADMIN_VIEW_USER: 'admin_view_user',
  ADMIN_LOGS: 'admin_logs',
  ADMIN_SECRETS: 'admin_secrets',
  ADMIN_BROADCAST: 'admin_broadcast',
  ADMIN_BAN: 'admin_ban',
  ADMIN_UNBAN: 'admin_unban',

  // Treasury (Lightning sweep admin)
  TREASURY_OPEN: 'treasury_open',
  TREASURY_PICK: 'treasury_pick',
  TREASURY_SWEEP: 'treasury_sweep',
};

// Factory functions for dynamic callbacks
export const dynamicCallback = {
  walletAction: (walletId, action) => `${action}_${walletId}`,
  walletPrefix: (walletId, prefix = 'wallet_') => `${prefix}${walletId}`,
  generateChain: (chain) => `generate_${chain}`,
  exchangeFromSym: (sym) => `exch_fs_${sym}`,
  exchangeToSym: (sym) => `exch_ts_${sym}`,
  exchangeFrom: (chain) => `exch_from_${chain}`,
  exchangeTo: (chain) => `exch_to_${chain}`,
  importKeyChain: (chain) => `import_key_${chain}`,
  importSeedChain: (chain) => `import_seed_${chain}`,
  chainSelect: (chain, prefix = 'chain_') => `${prefix}${chain}`,
  tokenSelect: (chain, token) => `token_${chain}_${token}`,
  sendToAnalyzed: (chain) => `send_to_analyzed_${chain}`,
  adminUserKeys: (userId) => `admin_user_keys_${userId}`,
  adminUsersPage: (page) => `admin_users_page_${page}`,
  setLang: (lang) => `set_lang_${lang}`,

  // Keys feature
  keys: (walletId) => `keys_${walletId}`,
  copyAddr: (walletId) => `copy_addr_${walletId}`,
  qrAddr: (walletId) => `qr_addr_${walletId}`,
  qrBack: (walletId) => `qr_back_${walletId}`,
  viewSeed: (walletId) => `view_seed_${walletId}`,
  viewPrivkey: (walletId) => `view_privkey_${walletId}`,
  walletHistory: (walletId) => `wallet_history_${walletId}`,

  // Deposit / receive feature (symbol / chain / walletId must be underscore-free)
  depositAsset: (symbol) => `dep_a_${symbol}`,
  depositNetwork: (symbol, chain) => `dep_n_${symbol}_${chain}`,
  depositConfirm: (symbol, chain) => `dep_s_${symbol}_${chain}`,
  depositWallet: (symbol, chain, walletId) => `dep_w_${symbol}_${chain}_${walletId}`,

  // Payments / invoices / treasury feature
  invoiceWallet: (walletId) => `pinv_w_${walletId}`,
  invoiceLnWalletPrefix: 'pinv_lnw_',
  invoiceAsset: (symbol) => `pinv_a_${symbol}`,
  invoiceView: (id) => `inv_view_${id}`,
  invoiceCancel: (id) => `inv_cancel_${id}`,
  treasuryWalletPrefix: 'treasury_w_',
};

// Regex patterns for dynamic callbacks
export const CALLBACK_REGEX = {
  AMOUNT_TYPE: /^amount_type_(.+)$/,
  TOKEN_SELECT: /^token_(.+)_(.+)$/,
  SEND_FROM: /^send_from_(.+)$/,
  SEND_ANALYZED_FROM: /^send_analyzed_from_(.+)$/,
  ANALYZE_HISTORY: /^analyze_history_(.+)$/,
  ANALYZE_HISTORY_BACK: 'analyze_history_back',
  FEE_SELECTION: /^fee_(.+)$/,
  QUICK_AMOUNT: /^quick_amount_(.+)$/,
  SEND_TO_ANALYZED: /^send_to_analyzed_(.+)$/,
  EXCHANGE_WALLET: /^exch_w_(.+)$/,
  EXCHANGE_FROM_SYM: /^exch_fs_(.+)$/,
  EXCHANGE_TO_SYM: /^exch_ts_(.+)$/,
  EXCHANGE_FROM: /^exch_from_(.+)$/,
  EXCHANGE_TO: /^exch_to_(.+)$/,
  ADMIN_USERS_PAGE: /^admin_users_page_(\d+)$/,
  SET_LANG: /^set_lang_(fr|en)$/,

  // Keys feature
  KEYS: /^keys_(.+)$/,
  COPY_ADDR: /^copy_addr_(.+)$/,
  QR_ADDR: /^qr_addr_(.+)$/,
  QR_BACK: /^qr_back_(.+)$/,
  VIEW_SEED: /^view_seed_(.+)$/,
  VIEW_PRIVKEY: /^view_privkey_(.+)$/,
  WALLET_HISTORY: /^wallet_history_(.+)$/,

  // Deposit / receive feature
  DEPOSIT_ASSET: /^dep_a_(.+)$/,
  DEPOSIT_NETWORK: /^dep_n_([^_]+)_([^_]+)$/,
  DEPOSIT_CONFIRM: /^dep_s_([^_]+)_([^_]+)$/,
  DEPOSIT_WALLET: /^dep_w_([^_]+)_([^_]+)_(.+)$/,

  // Payments / invoices / treasury feature
  INVOICE_WALLET: /^pinv_w_(.+)$/,
  INVOICE_LN_WALLET: /^pinv_lnw_(.+)$/,
  INVOICE_ASSET: /^pinv_a_(.+)$/,
  INVOICE_VIEW: /^inv_view_(.+)$/,
  INVOICE_CANCEL: /^inv_cancel_(.+)$/,
  TREASURY_WALLET: /^treasury_w_(.+)$/,
};
