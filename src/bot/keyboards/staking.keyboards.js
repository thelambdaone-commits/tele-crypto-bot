import { Markup } from 'telegraf';
import { CALLBACKS, dynamicCallback } from '../constants/callbacks.js';

export function liquidStakingKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🥇 JitoSOL', CALLBACKS.JITO_STAKING),
      Markup.button.callback('🥈 Marinade', CALLBACKS.MARINADE_STAKING),
    ],
    [Markup.button.callback('↩️ Retour', CALLBACKS.STAKING_YIELD)],
  ]);
}

export function jitoWithdrawalKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('⚡ Rapide (Swap)', CALLBACKS.JITO_EXIT_FAST_SELECT),
      Markup.button.callback('⏳ Standard (Unstake)', CALLBACKS.JITO_EXIT_STANDARD_SELECT),
    ],
    [Markup.button.callback('↩️ Retour', CALLBACKS.JITO_STAKING)],
  ]);
}

export function stakingExitKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('25%', CALLBACKS.JITO_EXIT_QUICK_25),
      Markup.button.callback('50%', CALLBACKS.JITO_EXIT_QUICK_50),
      Markup.button.callback('100%', CALLBACKS.JITO_EXIT_QUICK_100),
    ],
    [Markup.button.callback('✏️ Saisir un montant', CALLBACKS.JITO_EXIT_MANUAL)],
    [Markup.button.callback('❌ Retour', CALLBACKS.JITO_STAKING)],
  ]);
}

export function jitoStandardExitKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('25%', CALLBACKS.JITO_EXIT_STD_25),
      Markup.button.callback('50%', CALLBACKS.JITO_EXIT_STD_50),
      Markup.button.callback('100%', CALLBACKS.JITO_EXIT_STD_100),
    ],
    [Markup.button.callback('✏️ Saisir un montant', CALLBACKS.JITO_EXIT_STD_MANUAL)],
    [Markup.button.callback('❌ Retour', CALLBACKS.JITO_WITHDRAW)],
  ]);
}

export function jitoUnstakeStatusKeyboard(requestId, canClaim = false, hasAddress = true) {
  const buttons = [];
  if (canClaim) {
    buttons.push([
      Markup.button.callback('✅ Réclamer mes SOL', dynamicCallback.jitoClaimUnstake(requestId)),
    ]);
  } else {
    buttons.push([
      Markup.button.callback('⏳ Désactivation en cours...', CALLBACKS.JITO_UNSTAKE_PENDING_INFO),
    ]);
  }

  if (!hasAddress) {
    buttons.push([
      Markup.button.callback('🔍 Recherche automatique', dynamicCallback.jitoUnstakeAutoRepair(requestId)),
    ]);
    buttons.push([
      Markup.button.callback(
        "✏️ Saisir l'adresse manuellement",
        dynamicCallback.jitoUnstakeManualSync(requestId)
      ),
    ]);
    buttons.push([
      Markup.button.callback('🗑 Supprimer cette demande', dynamicCallback.jitoUnstakeDelete(requestId)),
    ]);
  }

  buttons.push([Markup.button.callback('↩️ Retour au Menu Jito', CALLBACKS.JITO_STAKING)]);
  return Markup.inlineKeyboard(buttons);
}
