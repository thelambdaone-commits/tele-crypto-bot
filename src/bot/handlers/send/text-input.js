import {
  mainMenuKeyboard,
  amountTypeKeyboard,
  feeSelectionKeyboard,
  lightningConfirmationKeyboard,
} from '../../keyboards/index.js';
import { detectChain } from '../../../shared/address-detector.js';
import { isBolt11, decodeBolt11 } from '../../../shared/bolt11.js';
import { convertToEUR, formatEUR } from '../../../shared/price.js';
import { getTokenExplorerUrl } from '../../../shared/explorer.js';
import { SUPPORTED_CHAINS, NETWORK_LABEL, CHAIN_EMOJIS, isEvmChain } from '../../../shared/chains.js';
import { handleSendError } from './helpers.js';
import { sendChunked, escapeHtml } from '../../utils.js';
import { t } from '../../messages/index.js';

// EVM addresses (0x…) are identical across all EVM networks, so an analyzed
// 0x address is scanned on each of these and reported per-network. Derived from
// the registry — a new EVM chain is swept automatically.
const EVM_NETWORKS = SUPPORTED_CHAINS.filter(isEvmChain).map((chain) => ({
  chain,
  name: NETWORK_LABEL[chain],
  emoji: CHAIN_EMOJIS[chain],
}));

// Networks the analyze flow accepts, for the "address not recognized" hint. The
// EVM half is derived from EVM_NETWORKS (so a new EVM chain shows up here too);
// the non-EVM half mirrors the formats detectChain() can resolve.
const ANALYZE_ACCEPTED_LABELS = ['BTC', 'LTC', 'BCH', 'SOL', 'XMR', 'ZEC', 'TON', 'TRX']
  .concat(EVM_NETWORKS.map((n) => n.name))
  .join(', ');

/**
 * Build the native-balance + tokens section for one chain.
 * @returns {Promise<{ text: string, valueEUR: number }>}
 */
async function buildChainSection(walletService, chain, address) {
  const balanceData = await walletService.getPublicAddressBalance(chain, address);
  const nativeSymbol = balanceData.symbol || chain.toUpperCase();
  const balanceNum = Number.parseFloat(balanceData.balance) || 0;
  const conversion = await convertToEUR(chain, balanceNum);
  let valueEUR = conversion.valueEUR || 0;

  let text = `💰 <b>${balanceData.balance} ${nativeSymbol}</b>`;
  text += valueEUR > 0 ? ` — ${formatEUR(valueEUR)}\n` : '\n';

  const pendingNum = Number.parseFloat(balanceData.pendingBalance) || 0;
  if (pendingNum > 0) {
    text += `⏳ <i>+${balanceData.pendingBalance} ${nativeSymbol} en attente (réception)</i>\n`;
  } else if (pendingNum < 0) {
    text += `⏳ <i>${balanceData.pendingBalance} ${nativeSymbol} en attente (envoi)</i>\n`;
  }

  if (pendingNum !== 0) {
    const effective = balanceNum + pendingNum;
    if (effective !== balanceNum) {
      text += `💰 <i>Après confirmation: ${effective.toFixed(8)} ${nativeSymbol}</i>\n`;
    }
  }

  const tokens = await walletService.getPublicAddressTokens(chain, address);
  for (const token of tokens || []) {
    const sym = (token.symbol || '').toLowerCase();
    // Stablecoins price off USDC; other tokens only show an EUR value if known.
    const priceKey = sym.includes('usd') ? 'usdc' : sym;
    const tokenConv = await convertToEUR(priceKey, token.amount);
    const tokenValue = tokenConv.priceEUR > 0 ? tokenConv.valueEUR : 0;
    valueEUR += tokenValue;

    const amountStr = token.amount.toFixed(token.decimals <= 6 ? 2 : 6);
    text += `   ${token.icon || '🪙'} <b>${token.symbol}:</b> ${amountStr}`;
    text += tokenValue > 0 ? ` (${formatEUR(tokenValue)})\n` : '\n';

    if (!token.isKnown) {
      const tokenUrl = getTokenExplorerUrl(chain, token.mint);
      if (tokenUrl) text += `      └ <a href="${tokenUrl}">🔗 Voir</a>\n`;
    }
  }

  return { text, valueEUR };
}

export function setupSendTextInput(bot, storage, walletService, sessions, paymentService) {
  bot.on('text', async (ctx, next) => {
    const chatId = ctx.chat.id;
    const state = sessions.getState(chatId);
    const text = ctx.message.text.trim();

    if (state === 'ENTER_ADDRESS') {
      const data = sessions.getData(chatId);

      // Lightning invoice detection for BTC chains
      if (data.selectedChain === 'btc' && isBolt11(text)) {
        if (!paymentService?.lightningEnabled()) {
          return ctx.reply(
            '⚠️ <b>Lightning non configuré</b>\n\nLe backend Lightning n\'est pas actif sur ce bot. Envoie une adresse BTC on-chain.',
            { parse_mode: 'HTML' }
          );
        }

        const decoded = decodeBolt11(text);
        if (!decoded) {
          return ctx.reply(
            '⚠️ <b>Facture Lightning invalide</b>\n\nImpossible de décoder cette facture BOLT11. Vérifie le format.',
            { parse_mode: 'HTML' }
          );
        }

        const amountSat = decoded.amountSat;
        const amountBTC = amountSat != null ? (amountSat / 100_000_000) : null;
        const conversion = amountBTC != null ? await convertToEUR('btc', amountBTC) : null;

        sessions.setData(chatId, {
          ...data,
          toAddress: text,
          lightningInvoice: text,
          lightningAmountSat: amountSat,
        });
        sessions.setState(chatId, 'CONFIRM_LIGHTNING');

        let amountLine = '';
        if (amountBTC != null) {
          amountLine = `💰 Montant: <b>${amountBTC} BTC</b>`;
          if (conversion?.valueEUR > 0) amountLine += ` (${formatEUR(conversion.valueEUR)})`;
        } else {
          amountLine = '💰 Montant: <b>Défini par la facture</b>';
        }

        const msg =
          '⚡ <b>Paiement Lightning</b>\n\n' +
          `${amountLine}\n` +
          `📄 Facture: <code>${escapeHtml(text.slice(0, 20))}…</code>\n\n` +
          'Confirme le paiement ?';

        return ctx.reply(msg, {
          parse_mode: 'HTML',
          ...lightningConfirmationKeyboard(),
        });
      }

      const detected = detectChain(text);

      // Pour les tokens SPL personnalisés sur Solana, utiliser "sol" pour la validation
      // Ne jamais utiliser le nom/symbole du token comme chaîne
      let validationChain = data.selectedChain;

      // Si selectedChain n'est pas une blockchain connue (ex: "DECIMALS"), forcer "sol"
      if (!SUPPORTED_CHAINS.includes(validationChain)) {
        validationChain = 'sol';
      }

      // Addresses 0x (Ethereum) are valid on ALL EVM chains — detectChain()
      // always returns 'eth' for 0x… but the user may be sending on Arbitrum,
      // Polygon, Base, etc.  Accept the address if the target chain is EVM.
      const isEvmTarget = isEvmChain(validationChain);
      const isEvmDetected = detected === 'eth';
      if (detected !== validationChain && !(isEvmTarget && isEvmDetected)) {
        return ctx.reply(
          `⚠️ <b>Adresse invalide</b>\n\nL'adresse saisie n'est pas une adresse ${validationChain.toUpperCase()} valide.`,
          { parse_mode: 'HTML' }
        );
      }

      if (data.selectedWalletId) {
        try {
          const wallet = await storage.getWalletWithKey(chatId, data.selectedWalletId);
          if (wallet && wallet.address && text.toLowerCase() === wallet.address.toLowerCase()) {
            return ctx.reply(t(ctx.state.lang, 'send.sameAddress'), { parse_mode: 'HTML' });
          }
        } catch {}
      }

      sessions.setData(chatId, { ...data, toAddress: text });
      sessions.setState(chatId, 'SELECT_AMOUNT_TYPE');

      return ctx.reply('👉 <b>Vérification réussie</b>\n\nComment souhaites-tu saisir le montant ?', {
        parse_mode: 'HTML',
        ...amountTypeKeyboard(),
      });
    }

    if (state === 'ENTER_AMOUNT') {
      const data = sessions.getData(chatId);
      const amountStr = text.replace(',', '.');
      const inputAmount = Number.parseFloat(amountStr);

      if (Number.isNaN(inputAmount) || inputAmount <= 0) {
        return ctx.reply('⚠️ Montant invalide. Entre un nombre positif.');
      }

      try {
        let amount = inputAmount;
        const tokenSymbol = data.selectedToken;
        const displaySymbol = tokenSymbol || data.selectedChain.toUpperCase();

        if (data.amountType === 'eur' && !tokenSymbol) {
          const conversion = await convertToEUR(data.selectedChain, 1);
          if (!conversion.priceEUR) {
            return ctx.reply(
              `⚠️ Prix indisponible pour ${data.selectedChain.toUpperCase()}. Réessaie ou saisis le montant en ${data.selectedChain.toUpperCase()}.`
            );
          }
          amount = inputAmount / conversion.priceEUR;
        }

        const balanceData = await walletService.getBalance(
          chatId,
          data.selectedWalletId,
          tokenSymbol
        );
        if (amount > Number.parseFloat(balanceData.balance)) {
          return ctx.reply(`💸 Solde insuffisant (${balanceData.balance} ${balanceData.symbol})`);
        }

        // A manually typed amount is never a sweep — clear any stale flag from a
        // prior "Tout envoyer" so the SOL max-send path isn't wrongly triggered.
        sessions.setData(chatId, { ...data, amount, isMaxSend: false });

        const fees = await walletService.estimateFees(
          chatId,
          data.selectedWalletId,
          data.toAddress,
          amount,
          tokenSymbol
        );
        sessions.setData(chatId, { ...sessions.getData(chatId), fees });

        const amountEUR = tokenSymbol
          ? await convertToEUR('usd', amount)
          : await convertToEUR(data.selectedChain, amount);

        ctx.reply(
          '✅ <b>Montant validé</b>\n\n' +
            `💰 Montant : <b>${amount.toFixed(8)} ${displaySymbol}</b>\n` +
            `💶 Valeur : ${formatEUR(amountEUR.valueEUR)}\n\n` +
            'Choisis la vitesse de transaction :',
          {
            parse_mode: 'HTML',
            ...feeSelectionKeyboard('slow'),
          }
        );
        sessions.setState(chatId, 'SELECT_FEE');
      } catch (error) {
        await handleSendError(ctx, error, mainMenuKeyboard);
      }
      return;
    }

    if (state === 'ENTER_ADDRESS_ANALYZE') {
      // Ignore commands and menu buttons
      if (
        text.startsWith('/') ||
        [
          '💰 Wallets',
          '💰 Mes Wallets',
          '💸 Envoyer',
          '📤 Envoyer',
          '📤 Send',
          '📥 Recevoir',
          '📥 Receive',
          '💵 Soldes',
          '💵 Balances',
          '🔍 Analyser',
          '🔎 Analyser',
          '🔎 Analyze',
          '📊 Cours',
          '📊 Cours EUR',
          '📊 Prices',
          '➕ Nouveau',
          '➕ New',
          '❓ Aide',
          '🆘 Help',
          '❓ Help',
          '➕ Nouveau Wallet',
          '❌ Fermer',
          '❌ Close',
          '👑 Admin',
          'Stop',
          'Annuler',
          'Retour',
        ].includes(text)
      ) {
        sessions.setState(chatId, 'IDLE');
        return next();
      }

      const { logger } = await import('../../../shared/logger.js');
      const chain = detectChain(text);
      if (!chain) {
        logger.warn('Invalid address provided for analysis', { address: text, chatId });
        return ctx.reply(`⚠️ Adresse non reconnue (${ANALYZE_ACCEPTED_LABELS} acceptés).`);
      }

      // A 0x… address exists identically on every EVM network, so it can't be
      // attributed to a single one — scan them all.
      const isEvm = EVM_NETWORKS.some((n) => n.chain === chain);

      try {
        logger.info('Analyzing external address', { chain, address: text, chatId, multiEvm: isEvm });

        let message;
        if (isEvm) {
          message =
            "🔍 <b>Analyse d'adresse EVM</b>\n\n" +
            `📬 <code>${text}</code>\n` +
            '<i>Même adresse scannée sur tous les réseaux EVM.</i>\n';

          // Each chain has its own RpcManager/endpoints, so the networks are
          // scanned in parallel; sections are appended in registry order.
          const sections = await Promise.all(
            EVM_NETWORKS.map(async (net) => {
              try {
                return await buildChainSection(walletService, net.chain, text);
              } catch (e) {
                logger.warn('EVM network scan failed', { chain: net.chain, error: e.message });
                return { text: '   ⚠️ <i>Réseau indisponible</i>\n', valueEUR: 0 };
              }
            })
          );

          let total = 0;
          EVM_NETWORKS.forEach((net, i) => {
            message += `\n${net.emoji} <b>${net.name}</b>\n`;
            message += sections[i].text;
            total += sections[i].valueEUR;
          });
          message += `\n💶 <b>Valeur totale (EVM):</b> ${formatEUR(total)}`;
        } else {
          const section = await buildChainSection(walletService, chain, text);
          message =
            "🔍 <b>Analyse d'adresse</b>\n\n" +
            `⛓ Réseau : <b>${chain.toUpperCase()}</b>\n` +
            `📬 <code>${text}</code>\n\n` +
            section.text +
            `\n💶 <b>Valeur totale :</b> ${formatEUR(section.valueEUR)}`;
        }

        // Keep the rendered analysis so the history view can restore it on "Retour".
        sessions.setData(chatId, {
          analyzedAddress: text,
          analyzedChain: chain,
          analyzedMessage: message,
        });

        const { addressAnalyzedKeyboard } = await import('../../keyboards/index.js');
        // Awaited + chunked: an address holding many tokens across the EVM
        // networks can push the report past Telegram's 4096-char limit.
        await sendChunked(ctx, message, {
          parse_mode: 'HTML',
          ...addressAnalyzedKeyboard(chain, text),
        });
        sessions.setState(chatId, 'IDLE');
        logger.info('Address analysis completed', { chain, address: text, chatId });
      } catch (error) {
        logger.logError(error, {
          context: 'Address analysis',
          chain,
          address: text,
          chatId,
        });
        ctx.reply(`❌ Erreur d'analyse : ${error.message}`).catch(() => {});
        // The send is awaited now, so a failed report lands here: reset the
        // state or every next text keeps being parsed as an address to analyze.
        sessions.setState(chatId, 'IDLE');
      }
      return;
    }

    return next();
  });
}
