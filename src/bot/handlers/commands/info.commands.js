import { Markup } from 'telegraf';
import { mainMenuKeyboard, mainReplyKeyboard } from '../../keyboards/index.js';
import { getFullHelpText } from '../../ui/index.js';
import { t } from '../../messages/index.js';
import { CALLBACKS } from '../../constants/callbacks.js';
import { CHAIN_REGISTRY } from '../../../shared/chains.js';
import { TOKEN_CONFIGS } from '../../../core/tokens.config.js';
import { ExchangeService } from '../../../modules/swap/exchange.service.js';

const exchange = new ExchangeService();

// "Ξ Ethereum · ₿ Bitcoin · …" — every supported network, from CHAIN_REGISTRY.
function networksLine() {
  return Object.values(CHAIN_REGISTRY)
    .map((m) => `${m.emoji} ${m.name}`)
    .join(' · ');
}

// "• Ethereum : USDC, USDT, …" per chain that has tokens, from TOKEN_CONFIGS.
function tokensSection() {
  return Object.entries(TOKEN_CONFIGS)
    .map(([chain, cfg]) => [chain, Object.keys(cfg.tokens || {})])
    .filter(([, syms]) => syms.length)
    .map(([chain, syms]) => `• <b>${CHAIN_REGISTRY[chain]?.name || chain}</b> : ${syms.join(', ')}`)
    .join('\n');
}

export function setupInfoCommands(bot) {
  // 🆘 /help - Menu d'aide complet
  bot.command('help', async (ctx) => {
    const lang = ctx.state?.lang || 'fr';
    await ctx.reply(getFullHelpText(lang), {
      parse_mode: 'HTML',
      ...mainReplyKeyboard(lang),
    });
  });

  // 🎮 /menu - Menu principal interactif (inline)
  bot.command('menu', async (ctx) => {
    const lang = ctx.state?.lang || 'fr';
    await ctx.reply(t(lang, 'menu.principal'), {
      parse_mode: 'HTML',
      ...mainMenuKeyboard(lang),
    });
  });

  // 📚 /learn [sujet] - Leçons éducatives. Menu inline sans argument, accès
  // direct sinon ("/learn btc", "/learn spl"…). Les leçons vivent dans les
  // bundles i18n (learn.lessons) — le menu et l'accès direct en sont dérivés,
  // donc ajouter une leçon = ajouter une clé dans fr.js + en.js (parité).
  const learnMenuKeyboard = (lang) => {
    const entries = Object.entries(t(lang, 'learn.lessons'));
    const rows = [];
    for (let i = 0; i < entries.length; i += 2) {
      rows.push(
        entries.slice(i, i + 2).map(([key, l]) => Markup.button.callback(l.title, `learn_l_${key}`))
      );
    }
    rows.push([
      Markup.button.callback(t(lang, 'menu.close'), CALLBACKS.CLOSE_MESSAGE),
      Markup.button.callback('🎮 Menu', CALLBACKS.BACK_TO_MENU),
    ]);
    return Markup.inlineKeyboard(rows);
  };
  const lessonBackKeyboard = (lang) =>
    Markup.inlineKeyboard([
      [Markup.button.callback(t(lang, 'learn.backToMenu'), CALLBACKS.LEARN_MENU)],
      [Markup.button.callback('🎮 Menu', CALLBACKS.BACK_TO_MENU)],
    ]);

  // Vocabulaire → clé de leçon ("spl" → sol, "bip39" → seed…). Les entrées et
  // la saisie passent par normalizeTopic : minuscules, accents et séparateurs
  // retirés ("TRC-20" → "trc20", "réseau" → "reseau").
  const LESSON_ALIASES = {
    bitcoin: 'btc',
    sat: 'btc',
    sats: 'btc',
    satoshi: 'btc',
    utxo: 'btc',
    litecoin: 'ltc',
    bitcoincash: 'bch',
    cashaddr: 'bch',
    ethereum: 'eth',
    gwei: 'eth',
    wei: 'eth',
    smartcontract: 'eth',
    avalanche: 'avax',
    cchain: 'avax',
    bsc: 'bnb',
    binance: 'bnb',
    bep20: 'bnb',
    solana: 'sol',
    spl: 'sol',
    lamport: 'sol',
    zcash: 'zec',
    zatoshi: 'zec',
    monero: 'xmr',
    piconero: 'xmr',
    privacy: 'xmr',
    toncoin: 'ton',
    jetton: 'ton',
    jettons: 'ton',
    memo: 'ton',
    tron: 'trx',
    trc20: 'trx',
    sun: 'trx',
    layer1: 'l1',
    blockchain: 'l1',
    mainnet: 'l1',
    layer2: 'l2',
    arb: 'l2',
    arbitrum: 'l2',
    op: 'l2',
    optimism: 'l2',
    base: 'l2',
    matic: 'l2',
    polygon: 'l2',
    pol: 'l2',
    rollup: 'l2',
    bip39: 'seed',
    mnemonic: 'seed',
    mnemonique: 'seed',
    seedphrase: 'seed',
    phrase: 'seed',
    recovery: 'seed',
    keys: 'key',
    cle: 'key',
    cles: 'key',
    privatekey: 'key',
    address: 'key',
    adresse: 'key',
    scam: 'security',
    scams: 'security',
    arnaque: 'security',
    arnaques: 'security',
    phishing: 'security',
    securite: 'security',
    dust: 'security',
    dusting: 'security',
    poussiere: 'security',
    poisoning: 'security',
    empoisonnement: 'security',
    hameconnage: 'security',
    rug: 'rugpull',
    honeypot: 'rugpull',
    ponzi: 'rugpull',
    pump: 'rugpull',
    pumpanddump: 'rugpull',
    reseau: 'network',
    reseaux: 'network',
    networks: 'network',
    fee: 'gas',
    fees: 'gas',
    frais: 'gas',
    coin: 'token',
    coins: 'token',
    tokens: 'token',
    erc20: 'token',
    stablecoin: 'stable',
    stablecoins: 'stable',
    usdt: 'stable',
    usdc: 'stable',
    dai: 'stable',
    wrapped: 'iou',
    wbtc: 'iou',
    ious: 'iou',
    swaps: 'swap',
    echange: 'swap',
    exchange: 'swap',
    trocador: 'swap',
    nokyc: 'kyc',
    lightning: 'ln',
    bolt11: 'ln',
    invoices: 'invoice',
    facture: 'invoice',
    factures: 'invoice',
    shielding: 'shield',
    shielded: 'shield',
    blindage: 'shield',
    confidentialite: 'shield',
    confidentiel: 'shield',
    confidential: 'shield',
    zk: 'shield',
    zkp: 'shield',
    zksnark: 'shield',
    zksnarks: 'shield',
    snark: 'shield',
    snarks: 'shield',
    fhe: 'shield',
    homomorphe: 'shield',
    homomorphic: 'shield',
    mpc: 'shield',
    arcium: 'shield',
    elusiv: 'shield',
    darkpool: 'shield',
    darkpools: 'shield',
    zyga: 'shield',
    humidifi: 'shield',
    stealth: 'shield',
    furtive: 'shield',
    furtives: 'shield',
    zkcompression: 'shield',
    seedvault: 'shield',
  };
  const normalizeTopic = (raw) =>
    String(raw || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  bot.command('learn', async (ctx) => {
    const lang = ctx.state?.lang || 'fr';
    const lessons = t(lang, 'learn.lessons');
    const topic = normalizeTopic(ctx.message.text.split(/\s+/)[1]);
    // Object.hasOwn : une saisie comme "constructor" ne doit pas remonter une
    // propriété héritée du prototype à la place d'une leçon.
    const key = Object.hasOwn(lessons, topic) ? topic : LESSON_ALIASES[topic];
    if (key && Object.hasOwn(lessons, key)) {
      return ctx.reply(lessons[key].body, { parse_mode: 'HTML', ...lessonBackKeyboard(lang) });
    }
    await ctx.reply(t(lang, 'learn.menuTitle'), { parse_mode: 'HTML', ...learnMenuKeyboard(lang) });
  });

  // 📚 Une leçon est choisie dans le menu → remplace le message en place.
  bot.action(/^learn_l_(\w+)$/, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    const lang = ctx.state?.lang || 'fr';
    const lessons = t(lang, 'learn.lessons');
    const lesson = Object.hasOwn(lessons, ctx.match[1]) ? lessons[ctx.match[1]] : null;
    if (!lesson) return;
    try {
      await ctx.editMessageText(lesson.body, { parse_mode: 'HTML', ...lessonBackKeyboard(lang) });
    } catch {
      /* message inchangé ou supprimé */
    }
  });

  // 📚 Retour au menu des leçons.
  bot.action(CALLBACKS.LEARN_MENU, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    const lang = ctx.state?.lang || 'fr';
    try {
      await ctx.editMessageText(t(lang, 'learn.menuTitle'), {
        parse_mode: 'HTML',
        ...learnMenuKeyboard(lang),
      });
    } catch {
      /* message inchangé ou supprimé */
    }
  });

  // ⁉️ /faq [sujet] - FAQ sécurité (dusting, empoisonnement d'adresse, arnaques).
  // Même mécanique que /learn : menu inline sans argument, accès direct sinon
  // ("/faq dust", "/faq memo"…). Les questions vivent dans les bundles i18n
  // (faq.items) — le menu et l'accès direct en sont dérivés, donc ajouter une
  // question = ajouter une clé dans fr.js + en.js (parité). Accessible aussi
  // depuis ⚙️ Paramètres (bouton ⁉️ FAQ → CALLBACKS.FAQ_MENU).
  const faqMenuKeyboard = (lang) => {
    const entries = Object.entries(t(lang, 'faq.items'));
    const rows = [];
    for (let i = 0; i < entries.length; i += 2) {
      rows.push(
        entries.slice(i, i + 2).map(([key, q]) => Markup.button.callback(q.title, `faq_i_${key}`))
      );
    }
    rows.push([
      Markup.button.callback(t(lang, 'menu.back'), CALLBACKS.SETTINGS_MENU),
      Markup.button.callback('🎮 Menu', CALLBACKS.BACK_TO_MENU),
    ]);
    return Markup.inlineKeyboard(rows);
  };
  const faqBackKeyboard = (lang) =>
    Markup.inlineKeyboard([
      [Markup.button.callback(t(lang, 'faq.backToMenu'), CALLBACKS.FAQ_MENU)],
      [Markup.button.callback('🎮 Menu', CALLBACKS.BACK_TO_MENU)],
    ]);

  // Vocabulaire → clé de question (normalisé par normalizeTopic, comme /learn).
  const FAQ_ALIASES = {
    poisoning: 'poison',
    empoisonnement: 'poison',
    adresse: 'poison',
    address: 'poison',
    dusting: 'dust',
    poussiere: 'dust',
    trx: 'tron',
    airdrops: 'airdrop',
    but: 'goals',
    buts: 'goals',
    objectifs: 'goals',
    detecter: 'detect',
    detection: 'detect',
    bot: 'bots',
    automatisation: 'bots',
    cible: 'targets',
    cibles: 'targets',
    target: 'targets',
    malveillant: 'benign',
    tracable: 'trace',
    tracage: 'trace',
    memos: 'memo',
    recu: 'react',
    received: 'react',
    verifier: 'verify',
    verification: 'verify',
    envoi: 'sent',
    envoye: 'sent',
    erreur: 'sent',
  };

  bot.command('faq', async (ctx) => {
    const lang = ctx.state?.lang || 'fr';
    const items = t(lang, 'faq.items');
    const topic = normalizeTopic(ctx.message.text.split(/\s+/)[1]);
    // Object.hasOwn : même garde anti-prototype que /learn.
    const key = Object.hasOwn(items, topic) ? topic : FAQ_ALIASES[topic];
    if (key && Object.hasOwn(items, key)) {
      return ctx.reply(items[key].body, { parse_mode: 'HTML', ...faqBackKeyboard(lang) });
    }
    await ctx.reply(t(lang, 'faq.menuTitle'), { parse_mode: 'HTML', ...faqMenuKeyboard(lang) });
  });

  // ⁉️ Une question est choisie dans le menu → remplace le message en place.
  bot.action(/^faq_i_(\w+)$/, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    const lang = ctx.state?.lang || 'fr';
    const items = t(lang, 'faq.items');
    const item = Object.hasOwn(items, ctx.match[1]) ? items[ctx.match[1]] : null;
    if (!item) return;
    try {
      await ctx.editMessageText(item.body, { parse_mode: 'HTML', ...faqBackKeyboard(lang) });
    } catch {
      /* message inchangé ou supprimé */
    }
  });

  // ⁉️ (Ré)ouvre le menu FAQ — depuis une question ou depuis ⚙️ Paramètres.
  bot.action(CALLBACKS.FAQ_MENU, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    const lang = ctx.state?.lang || 'fr';
    try {
      await ctx.editMessageText(t(lang, 'faq.menuTitle'), {
        parse_mode: 'HTML',
        ...faqMenuKeyboard(lang),
      });
    } catch {
      /* message inchangé ou supprimé */
    }
  });

  // 🔗 /chains - Liste des blockchains supportées (dérivée de CHAIN_REGISTRY)
  bot.command('chains', async (ctx) => {
    const entries = Object.entries(CHAIN_REGISTRY);
    const isL2 = (k, m) => m.evm && k !== 'eth' && k !== 'avax'; // EVM scaling chains
    const l1 = entries
      .filter(([k, m]) => !isL2(k, m))
      .map(([, m]) => `${m.emoji} ${m.native}`)
      .join(' · ');
    const l2 = entries
      .filter(([k, m]) => isL2(k, m))
      .map(([, m]) => `${m.emoji} ${m.name}`)
      .join(' · ');
    await ctx.reply(
      '🔗 <b>Blockchains supportées</b>\n\n' + `🏛️ <b>L1</b> : ${l1}\n⚡ <b>L2</b> : ${l2}`,
      { parse_mode: 'HTML' }
    );
  });

  // 📋 /list (/coins, /tokens, /assets) - Supported coins & tokens (English)
  bot.command(['list', 'coins', 'tokens', 'assets'], async (ctx) => {
    await ctx.reply(
      '📋 <b>Cryptos &amp; tokens supportés</b>\n' +
        '━━━━━━━━━━━━━━━\n\n' +
        `🔗 <b>Réseaux</b> · ${Object.keys(CHAIN_REGISTRY).length} chaînes\n` +
        `${networksLine()}\n\n` +
        '🎫 <b>Tokens par réseau</b>\n' +
        `${tokensSection()}\n\n` +
        '━━━━━━━━━━━━━━━\n' +
        '💱 Tout est échangeable <b>sans KYC</b> → <code>/swaps</code>\n' +
        '💹 Prix en euros → <code>/price</code>',
      { parse_mode: 'HTML' }
    );
  });

  // 💱 /swaps (/swap, /exchange) - Swappable assets, no-KYC (English)
  bot.command(['swaps', 'swap', 'exchange'], async (ctx) => {
    const symbols = exchange.listSymbols(); // sorted: natives → stablecoins → tokens
    const list = symbols.map((s) => `${s.emoji} ${s.symbol}`).join(' · ');
    await ctx.reply(
      '💱 <b>Échange sans KYC</b>\n' +
        '━━━━━━━━━━━━━━━\n\n' +
        '🔒 Sans inscription, sans KYC — le meilleur taux est choisi automatiquement ' +
        'et le bot ne touche jamais tes fonds.\n\n' +
        `🪙 <b>${symbols.length} cryptos</b> sur tous leurs réseaux\n` +
        `${list}\n\n` +
        '💵 <b>USDT</b> &amp; <b>USDC</b> dispo sur Ethereum, Arbitrum, Optimism, Polygon, ' +
        'Base, Avalanche, Solana, Tron et TON.\n\n' +
        '━━━━━━━━━━━━━━━\n' +
        '👇 Choisis une crypto à donner puis une à recevoir',
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([[Markup.button.callback('🔄 Ouvrir l’échange', CALLBACKS.EXCHANGE)]]),
      }
    );
  });
}
