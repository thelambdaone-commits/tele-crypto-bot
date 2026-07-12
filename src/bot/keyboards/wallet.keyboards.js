import { Markup } from 'telegraf';
import { CALLBACKS, dynamicCallback } from '../constants/callbacks.js';
import { CHAIN_EMOJIS } from '../ui/formatters.js';

const WALLET_PAGE_SIZE = 8;

export function walletListKeyboard(wallets, prefix = 'wallet_', page = 0) {
  const chainEmojis = CHAIN_EMOJIS;
  const totalPages = Math.ceil(wallets.length / WALLET_PAGE_SIZE);
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const slice = wallets.slice(safePage * WALLET_PAGE_SIZE, (safePage + 1) * WALLET_PAGE_SIZE);

  const buttons = slice.map((w) => [
    Markup.button.callback(
      `${chainEmojis[w.chain] || '●'} ${w.label}`,
      `${prefix}${w.id}`
    ),
  ]);

  if (totalPages > 1) {
    const navRow = [];
    if (safePage > 0) {
      navRow.push(Markup.button.callback('◀️', `wpage_${prefix}${safePage - 1}`));
    }
    navRow.push(Markup.button.callback(`${safePage + 1}/${totalPages}`, 'noop'));
    if (safePage < totalPages - 1) {
      navRow.push(Markup.button.callback('▶️', `wpage_${prefix}${safePage + 1}`));
    }
    buttons.push(navRow);
  }

  buttons.push([Markup.button.callback('↩️ Retour', CALLBACKS.BACK_TO_MENU)]);
  return Markup.inlineKeyboard(buttons);
}

export function walletActionsKeyboard(walletId, explorerUrl) {
  // 2-column grid: more compact on mobile than a single tall column.
  const rows = [
    [
      Markup.button.callback('📋 Copier', dynamicCallback.copyAddr(walletId)),
      Markup.button.callback('📷 QR', dynamicCallback.qrAddr(walletId)),
    ],
    [
      Markup.button.callback('🌱 Seed', dynamicCallback.viewSeed(walletId)),
      Markup.button.callback('🔑 Clé privée', dynamicCallback.viewPrivkey(walletId)),
    ],
    [
      Markup.button.callback('📜 Historique', dynamicCallback.walletHistory(walletId)),
      Markup.button.callback('🗑 Supprimer', `delete_wallet_${walletId}`),
    ],
    [Markup.button.callback('🔄 Échanger', `exch_w_${walletId}`)],
  ];
  if (explorerUrl) {
    rows.push([Markup.button.url('🔗 Voir sur la blockchain', explorerUrl)]);
  }
  rows.push([Markup.button.callback('↩️ Retour', CALLBACKS.VIEW_KEYS)]);
  return Markup.inlineKeyboard(rows);
}

export function deleteConfirmKeyboard(walletId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🗑️ Oui, Supprimer', `confirm_delete_${walletId}`)],
    [Markup.button.callback('↩️ Annuler', CALLBACKS.VIEW_KEYS)],
  ]);
}

export function corruptedWalletKeyboard(walletId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🗑️ Supprimer ce wallet', `confirm_delete_${walletId}`)],
    [Markup.button.callback('↩️ Retour', CALLBACKS.VIEW_KEYS)],
  ]);
}

export function walletCreationMethodKeyboard(chain) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🆕 Nouveau', `generate_${chain}`)],
    [Markup.button.callback('🌱 Dériver depuis une seed existante', `derive_seed_${chain}`)],
    [Markup.button.callback('🔑 Importer une Clé Privée', `import_key_${chain}`)],
    [Markup.button.callback('🔐 Importer une Seed Phrase', `import_seed_${chain}`)],
    [Markup.button.callback('↩️ Retour', CALLBACKS.CREATE_WALLET)],
  ]);
}

export function chainSelectionKeyboard(actionPrefix = 'chain_') {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Ξ Ethereum', `${actionPrefix}eth`),
      Markup.button.callback('₿ Bitcoin', `${actionPrefix}btc`),
    ],
    [
      Markup.button.callback('Ł Litecoin', `${actionPrefix}ltc`),
      Markup.button.callback('🅑 Bitcoin Cash', `${actionPrefix}bch`),
    ],
    [
      Markup.button.callback('◎ Solana', `${actionPrefix}sol`),
      Markup.button.callback('🔵 Arbitrum', `${actionPrefix}arb`),
    ],
    [
      Markup.button.callback('⬡ Polygon', `${actionPrefix}matic`),
      Markup.button.callback('🔴 Optimism', `${actionPrefix}op`),
    ],
    [
      Markup.button.callback('🟦 Base', `${actionPrefix}base`),
      Markup.button.callback('🔺 Avalanche', `${actionPrefix}avax`),
    ],
    [
      Markup.button.callback('🟡 BNB Chain', `${actionPrefix}bsc`),
    ],
    [
      Markup.button.callback('🟥 Tron', `${actionPrefix}trx`),
      Markup.button.callback('ɱ Monero', `${actionPrefix}xmr`),
    ],
    [
      Markup.button.callback('Ⓩ Zcash', `${actionPrefix}zec`),
      Markup.button.callback('💎 TON', `${actionPrefix}ton`),
    ],
    [Markup.button.callback('↩️ Retour', CALLBACKS.BACK_TO_MENU)],
  ]);
}
