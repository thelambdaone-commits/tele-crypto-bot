import {
  mainMenuKeyboard,
  walletListKeyboard,
  mainReplyKeyboard,
  feeSelectionKeyboard,
} from '../../keyboards/index.js';
import { formatEUR, convertToEUR } from '../../../shared/price.js';
import { formatNumber, formatCryptoAmount, CHAIN_EMOJIS } from '../../ui/formatters.js';
import { sendWalletKeysFile } from '../wallet/key-file.js';

// All chains registered in WalletService — shared by /bal, /send, /tx so the
// commands stay in sync with the chain-selection keyboard.
const PUBLIC_CHAINS = [
  'eth',
  'btc',
  'sol',
  'arb',
  'matic',
  'op',
  'base',
  'avax',
  'ltc',
  'bch',
  'xmr',
  'zec',
  'trx',
];

// Native-coin denomination tables for /unit. `factor` = sub-units per 1 coin.
const UNIT_DENOMS = {
  btc: { emoji: '₿', units: [['BTC', 1], ['satoshi', 1e8]] },
  ltc: { emoji: 'Ł', units: [['LTC', 1], ['litoshi', 1e8]] },
  bch: { emoji: '🅑', units: [['BCH', 1], ['satoshi', 1e8]] },
  eth: { emoji: 'Ξ', units: [['ETH', 1], ['gwei', 1e9], ['wei', 1e18]] },
  sol: { emoji: '◎', units: [['SOL', 1], ['lamport', 1e9]] },
  xmr: { emoji: 'ɱ', units: [['XMR', 1], ['piconero', 1e12]] },
  zec: { emoji: 'Ⓩ', units: [['ZEC', 1], ['zatoshi', 1e8]] },
  trx: { emoji: '🟥', units: [['TRX', 1], ['sun', 1e6]] },
};

// Any accepted input unit (singular, lower-case) → { coin, factor }.
const UNIT_MAP = {
  btc: { coin: 'btc', factor: 1 },
  satoshi: { coin: 'btc', factor: 1e8 },
  sat: { coin: 'btc', factor: 1e8 },
  ltc: { coin: 'ltc', factor: 1 },
  litoshi: { coin: 'ltc', factor: 1e8 },
  bch: { coin: 'bch', factor: 1 },
  eth: { coin: 'eth', factor: 1 },
  gwei: { coin: 'eth', factor: 1e9 },
  wei: { coin: 'eth', factor: 1e18 },
  sol: { coin: 'sol', factor: 1 },
  lamport: { coin: 'sol', factor: 1e9 },
  xmr: { coin: 'xmr', factor: 1 },
  piconero: { coin: 'xmr', factor: 1e12 },
  atomic: { coin: 'xmr', factor: 1e12 },
  zec: { coin: 'zec', factor: 1 },
  zatoshi: { coin: 'zec', factor: 1e8 },
  trx: { coin: 'trx', factor: 1 },
  sun: { coin: 'trx', factor: 1e6 },
};

const UNIT_LIST_LABEL = 'btc, sat, ltc, litoshi, bch, eth, gwei, wei, sol, lamport, xmr, piconero, zec, zatoshi, trx, sun';

export function setupWalletCommands(bot, storage, walletService, sessions) {
  // 👛 /wallet - Affiche la liste des wallets
  bot.command('wallet', async (ctx) => {
    const chatId = ctx.chat.id;
    const wallets = await storage.getWallets(chatId);

    if (wallets.length === 0) {
      return ctx.reply(
        "😅 *Oups !* Tu n'as pas encore de wallet.\n\n" +
          '💡 Utilise `/gen eth`, `/gen btc`, `/gen xmr` ou `/gen zec` pour en créer un !',
        { parse_mode: 'Markdown', ...mainMenuKeyboard() }
      );
    }

    let text = '👛 *Tes Wallets*\n\n';

    for (const wallet of wallets) {
      const chainEmoji = CHAIN_EMOJIS[wallet.chain] || '💎';
      try {
        const balance = await walletService.getBalance(chatId, wallet.id);
        text += `${chainEmoji} *${wallet.label}* (${wallet.chain.toUpperCase()})\n`;
        text += `📬 \`${wallet.address}\`\n`;
        text += `💰 Solde: *${formatCryptoAmount(balance.balance, balance.symbol || wallet.chain)}*\n\n`;
      } catch (e) {
        text += `${chainEmoji} *${wallet.label}* (${wallet.chain.toUpperCase()})\n`;
        text += `📬 \`${wallet.address}\`\n`;
        text += '💰 Solde: _Erreur de récupération_\n\n';
      }
    }

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      ...walletListKeyboard(wallets, 'wallet_'),
    });
  });

  // 🆕 /gen - Génère un nouveau wallet
  bot.command('gen', async (ctx) => {
    const chatId = ctx.chat.id;
    const args = ctx.message.text.split(' ').slice(1);

    if (args.length === 0) {
      return ctx.reply(
        '🎲 *Génération de Wallet*\n\n' +
          'Utilise cette commande avec le réseau souhaité :\n\n' +
          '• `/gen eth` — Ethereum Ξ\n' +
          '• `/gen btc` — Bitcoin ₿\n' +
          '• `/gen sol` — Solana ◎\n' +
          '• `/gen arb` — Arbitrum 🔵\n' +
          '• `/gen matic` — Polygon ⬡\n' +
          '• `/gen op` — Optimism 🔴\n' +
          '• `/gen base` — Base 🟦\n' +
          '• `/gen avax` — Avalanche 🔺\n' +
          '• `/gen ltc` — Litecoin Ł\n' +
          '• `/gen bch` — Bitcoin Cash 🅑\n' +
          '• `/gen xmr` — Monero ɱ\n' +
          '• `/gen zec` — Zcash Ⓩ',
        { parse_mode: 'Markdown' }
      );
    }

    const chain = args[0].toLowerCase();
    const supportedChains = ['eth', 'btc', 'sol', 'arb', 'matic', 'op', 'base', 'avax', 'ltc', 'bch', 'xmr', 'zec'];
    if (!supportedChains.includes(chain)) {
      return ctx.reply(
        '❌ *Réseau non supporté !*\n\n' + `Choisis parmi : \`${supportedChains.join(', ')}\``,
        {
          parse_mode: 'Markdown',
        }
      );
    }

    const chainNames = {
      eth: 'Ethereum Ξ',
      btc: 'Bitcoin ₿',
      sol: 'Solana ◎',
      arb: 'Arbitrum 🔵',
      matic: 'Polygon ⬡',
      op: 'Optimism 🔴',
      base: 'Base 🟦',
      avax: 'Avalanche 🔺',
      ltc: 'Litecoin Ł',
      bch: 'Bitcoin Cash 🅑',
      xmr: 'Monero ɱ',
      zec: 'Zcash Ⓩ',
    };
    const loadingMsg = await ctx.reply(`⏳ Génération de ton wallet ${chainNames[chain]}...`);

    try {
      const wallet = await walletService.createWallet(chatId, chain);
      const fullWallet = await storage.getWalletWithKey(chatId, wallet.id);

      let message = `🎉 *Wallet ${chainNames[chain]} créé !*\n\n`;
      message += `🏷 *Nom :* ${wallet.label}\n`;
      message += `📬 *Adresse :*\n\`${fullWallet.address}\`\n\n`;

      await sendWalletKeysFile(ctx, fullWallet, storage);

      if (fullWallet.mnemonic) {
        message += `🔐 *Phrase de récupération :*\n\`${fullWallet.mnemonic}\`\n\n`;
      }

      message += '⚠️ *IMPORTANT :* Sauvegarde bien cette phrase ! Elle ne sera plus affichée.\n\n';
      message += '🕐 _Ce message sera supprimé dans 60 secondes._';

      try {
        await ctx.telegram.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}

      const sentMsg = await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...mainReplyKeyboard(),
      });

      const deleteTimer = setTimeout(async () => {
        try {
          await ctx.telegram.deleteMessage(chatId, sentMsg.message_id);
          ctx.reply('🔒 _Message de sécurité supprimé._', { parse_mode: 'Markdown' });
        } catch (e) {}
      }, 60000);
      deleteTimer.unref();
    } catch (error) {
      try {
        await ctx.telegram.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}
      ctx.reply(`❌ Oups ! Erreur : ${error.message}`);
    }
  });

  // 💰 /bal - Vérifie le solde d'une adresse
  bot.command('bal', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);

    if (args.length < 2) {
      return ctx.reply(
        '💰 *Verification de solde*\n\n' +
          'Utilisation : `/bal <reseau> <adresse>`\n\n' +
          'Exemples :\n' +
          '• `/bal eth 0x123...abc`\n' +
          '• `/bal btc bc1q...xyz`\n' +
          '• `/bal sol 5Yfk...123`',
        { parse_mode: 'Markdown' }
      );
    }

    const network = args[0].toLowerCase();
    const address = args[1];

    if (!PUBLIC_CHAINS.includes(network)) {
      return ctx.reply(`❌ Réseau non supporté ! Choisissez parmi : \`${PUBLIC_CHAINS.join(', ')}\``, {
        parse_mode: 'Markdown',
      });
    }

    const loadingMsg = await ctx.reply('🔍 Recherche du solde...');

    try {
      const balanceData = await walletService.getPublicAddressBalance(network, address);
      const conversion = await convertToEUR(network, Number.parseFloat(balanceData.balance));

      const chainEmoji = CHAIN_EMOJIS[network] || '💎';

      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);

      await ctx.reply(
        `${chainEmoji} *Solde ${network.toUpperCase()}*\n\n` +
          `📬 Adresse : \`${address.slice(0, 8)}...${address.slice(-6)}\`\n` +
          `💰 Solde : *${formatCryptoAmount(balanceData.balance, balanceData.symbol || network)}*\n` +
          `💶 Valeur : *${formatEUR(conversion.valueEUR)}*`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      } catch (e) {}
      ctx.reply(`❌ Impossible de récupérer le solde : ${error.message}`);
    }
  });

  // 📤 /send - Envoie des cryptos
  bot.command('send', async (ctx) => {
    const chatId = ctx.chat.id;
    const args = ctx.message.text.split(' ').slice(1);

    if (args.length < 3) {
      return ctx.reply(
        '💸 *Envoi de cryptos*\n\n' +
          'Utilisation : `/send <réseau> <adresse> <montant>`\n\n' +
          'Exemple : `/send eth 0x123...abc 0.1`\n\n' +
          '💡 Pour un envoi plus guidé, utilise le bouton *💸 Envoyer* du menu !',
        { parse_mode: 'Markdown' }
      );
    }

    const network = args[0].toLowerCase();
    const toAddress = args[1];
    const amount = Number.parseFloat(args[2].replace(',', '.'));

    if (!PUBLIC_CHAINS.includes(network)) {
      return ctx.reply(
        `❌ Réseau non supporté ! Choisis parmi : \`${PUBLIC_CHAINS.join(', ')}\``,
        {
          parse_mode: 'Markdown',
        }
      );
    }

    if (Number.isNaN(amount) || amount <= 0) {
      return ctx.reply('❌ Montant invalide !');
    }

    const wallets = await storage.getWallets(chatId);
    const wallet = wallets.find((w) => w.chain === network);

    if (!wallet) {
      return ctx.reply(`❌ Tu n'as pas de wallet ${network.toUpperCase()} !`, {
        parse_mode: 'Markdown',
      });
    }

    sessions.setData(chatId, {
      selectedWalletId: wallet.id,
      selectedChain: network,
      toAddress: toAddress,
      amount: amount,
      amountType: 'native',
    });
    sessions.setState(chatId, 'SELECT_FEE');

    try {
      const balanceData = await walletService.getBalance(chatId, wallet.id);
      const fees = await walletService.estimateFees(chatId, wallet.id, toAddress, amount);

      sessions.setData(chatId, {
        ...sessions.getData(chatId),
        fees,
        currentBalance: Number.parseFloat(balanceData.balance),
      });

      const conversion = await convertToEUR(network, amount);

      await ctx.reply(
        "💸 *Préparation de l'envoi*\n\n" +
          `📤 De : ${wallet.label}\n` +
          `📥 Vers : \`${toAddress.slice(0, 8)}...${toAddress.slice(-6)}\`\n` +
          `💰 Montant : *${formatCryptoAmount(amount, network)}*\n` +
          `💶 Valeur : ${formatEUR(conversion.valueEUR)}\n` +
          `📊 Solde dispo : ${balanceData.balance} ${balanceData.symbol || network.toUpperCase()}\n\n` +
          'Choisis la vitesse de transaction :',
        { parse_mode: 'Markdown', ...feeSelectionKeyboard('slow') }
      );
    } catch (error) {
      sessions.clearState(chatId);
      ctx.reply(`❌ Erreur : ${error.message}`);
    }
  });

  // 📜 /tx - Historique des transactions
  bot.command('tx', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);

    if (args.length < 2) {
      return ctx.reply(
        '📜 *Historique des transactions*\n\n' + 'Utilisation : `/tx <réseau> <adresse> [limite]`',
        { parse_mode: 'Markdown' }
      );
    }

    const network = args[0].toLowerCase();
    const address = args[1];
    const limit = Math.min(Number.parseInt(args[2]) || 5, 20);

    if (!PUBLIC_CHAINS.includes(network)) {
      return ctx.reply(`❌ Réseau non supporté ! Choisissez parmi : \`${PUBLIC_CHAINS.join(', ')}\``, {
        parse_mode: 'Markdown',
      });
    }

    const loadingMsg = await ctx.reply('🔍 Recherche des transactions...');

    try {
      const txHistory = await walletService.getTransactionHistory(network, address, limit);
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);

      if (!txHistory || txHistory.length === 0) {
        return ctx.reply('📜 Aucune transaction trouvée.', { parse_mode: 'Markdown' });
      }

      let text = `📜 *${txHistory.length} dernières transactions (${network.toUpperCase()})*\n\n`;
      for (const tx of txHistory.slice(0, limit)) {
        const direction = tx.type === 'in' ? '📥' : '📤';
        const date = new Date(tx.timestamp).toLocaleDateString('fr-FR');
        text += `${direction} *${formatCryptoAmount(tx.amount, network)}*\n`;
        text += `📅 ${date}\n`;
        text += `🔗 \`${tx.hash.slice(0, 12)}...${tx.hash.slice(-8)}\`\n\n`;
      }

      await ctx.reply(text, { parse_mode: 'Markdown' });
    } catch (error) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      } catch (e) {}
      ctx.reply(`❌ Impossible de récupérer l'historique : ${error.message}`);
    }
  });

  // 🔢 /unit - Conversion des unités crypto
  bot.command('unit', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);

    if (args.length < 2) {
      return ctx.reply(
        "🔢 *Conversion d'Unités Crypto*\n\n" +
          'Utilisation : `/unit <montant> <unité>`\n\n' +
          `*Unités :* ${UNIT_LIST_LABEL}\n` +
          '_Exemples :_ `/unit 0.5 eth` · `/unit 1 btc` · `/unit 1 xmr`',
        { parse_mode: 'Markdown' }
      );
    }

    const amount = Number.parseFloat(args[0].replace(',', '.'));
    const unit = args[1].toLowerCase().replace(/s$/, '');

    if (Number.isNaN(amount) || amount < 0) {
      return ctx.reply('❌ Montant invalide ! Entre un nombre positif.');
    }

    const entry = UNIT_MAP[unit];
    if (!entry) {
      return ctx.reply(`❌ Unité non reconnue !\n\nUnités : ${UNIT_LIST_LABEL}`);
    }

    // Convert input → coin amount, then render every denomination of that coin.
    const coinAmount = amount / entry.factor;
    const def = UNIT_DENOMS[entry.coin];

    const lines = def.units.map(([name, factor]) => {
      let valStr;
      if (name === 'wei') {
        // 10^18 overflows JS safe integers: go ETH→gwei (safe) then ×10^9 exact.
        valStr = (BigInt(Math.round(coinAmount * 1e9)) * 1_000_000_000n).toLocaleString('fr-FR');
      } else if (factor === 1) {
        valStr = formatNumber(coinAmount, 0, 8); // the coin amount itself
      } else {
        valStr = formatNumber(coinAmount * factor, 0, 0); // integer sub-units
      }
      return `• *${valStr}* ${name}`;
    });

    await ctx.reply(
      `${def.emoji} *Conversion ${entry.coin.toUpperCase()}*\n\n${lines.join('\n')}`,
      { parse_mode: 'Markdown' }
    );
  });
}
