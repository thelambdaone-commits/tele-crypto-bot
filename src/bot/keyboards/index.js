import { Markup } from 'telegraf';
import { CALLBACKS, dynamicCallback } from '../constants/callbacks.js';
import { t } from '../messages/index.js';

// Re-export specific modules
export * from './admin.keyboards.js';
export * from './wallet.keyboards.js';
export * from './send.keyboards.js';

// Core/Infrastructure Keyboards. `lang` defaults to 'fr' so legacy callers that
// don't yet thread ctx.state.lang keep working unchanged.
export function mainReplyKeyboard(lang = 'fr') {
  const m = (key) => t(lang, `menu.${key}`);
  // Mirrors the inline menu (same labels/emojis), with Receive included.
  return Markup.keyboard([
    [m('wallets'), m('new')],
    [m('receive'), m('send')],
    [m('balances'), m('prices')],
    [m('analyze'), m('help')],
  ]).resize();
}

export function mainMenuKeyboard(lang = 'fr') {
  const m = (key) => t(lang, `menu.${key}`);
  // Only the principal, everyday actions — secondary tools live behind "☰ Plus"
  // so /start /menu stays uncluttered.
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(m('wallets'), CALLBACKS.LIST_WALLETS),
      Markup.button.callback(m('new'), CALLBACKS.CREATE_WALLET),
    ],
    [
      Markup.button.callback(m('receive'), CALLBACKS.DEPOSIT),
      Markup.button.callback(m('send'), CALLBACKS.SEND_FUNDS),
    ],
    [
      Markup.button.callback(m('balances'), CALLBACKS.VIEW_BALANCES),
      Markup.button.callback(m('prices'), CALLBACKS.PRICES_EUR),
    ],
    [
      Markup.button.callback(m('moreBtn'), CALLBACKS.MORE_MENU),
      Markup.button.callback(m('close'), CALLBACKS.CLOSE_MENU),
    ],
  ]);
}

// Secondary / less-frequent actions, reached via "☰ Plus" from the main menu.
// Keys & Help now live under ⚙️ Settings.
export function moreMenuKeyboard(lang = 'fr') {
  const m = (key) => t(lang, `menu.${key}`);
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(m('exchange'), CALLBACKS.EXCHANGE),
      Markup.button.callback(m('invoice'), CALLBACKS.INVOICE_START),
    ],
    [
      Markup.button.callback(m('lightning'), CALLBACKS.INVOICE_LN),
      Markup.button.callback(m('analyze'), CALLBACKS.ANALYZE_ADDRESS),
    ],
    [Markup.button.callback(m('settingsBtn'), CALLBACKS.SETTINGS_MENU)],
    [Markup.button.callback(m('back'), CALLBACKS.BACK_TO_MENU)],
  ]);
}

// ⚙️ Settings submenu — groups Language, My Keys and Help.
export function settingsMenuKeyboard(lang = 'fr') {
  const m = (key) => t(lang, `menu.${key}`);
  return Markup.inlineKeyboard([
    [Markup.button.callback(m('languageBtn'), CALLBACKS.LANGUAGE_MENU)],
    [
      Markup.button.callback(m('keys'), CALLBACKS.VIEW_KEYS),
      Markup.button.callback(m('help'), CALLBACKS.HELP_MENU),
    ],
    [Markup.button.callback(m('back'), CALLBACKS.MORE_MENU)],
  ]);
}

// Language picker — marks the active language with a ✓.
export function languageMenuKeyboard(currentLang = 'fr') {
  const mark = (code, label) => (currentLang === code ? `✓ ${label}` : label);
  return Markup.inlineKeyboard([
    [Markup.button.callback(mark('fr', t('fr', 'settings.langFr')), dynamicCallback.setLang('fr'))],
    [Markup.button.callback(mark('en', t('en', 'settings.langEn')), dynamicCallback.setLang('en'))],
    [Markup.button.callback(t(currentLang, 'menu.back'), CALLBACKS.SETTINGS_MENU)],
  ]);
}

export function cancelKeyboard(lang = 'fr') {
  return Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'menu.cancelBtn'), CALLBACKS.CANCEL)]]);
}
