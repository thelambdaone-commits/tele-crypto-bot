import { StakingService } from '../../../modules/staking/staking.service.js';
import { mainMenuKeyboard } from '../../keyboards/index.js';
import { logger } from '../../../shared/logger.js';
import { formatAmountShort as formatAmount } from '../../../shared/formatters.js';

function formatCurrency(value) {
  return StakingService.formatCurrency(value);
}

async function handleCalcCommand(ctx, args) {
  const chatId = ctx.chat.id;

  if (!args || args.length < 2) {
    return ctx.reply(
      '📊 *Calculateur de Gains*\n\n' +
        '━━━━━━━━━━━━\n' +
        '*Usage:*\n' +
        '`/calc <montant> <token> [protocole]`\n\n' +
        '*Exemples:*\n' +
        '`/calc 1000 USDC`\n' +
        '`/calc 500 USDT aave`\n' +
        '`/calc 1000 USDC kamino`\n' +
        '`/calc 1000 USDC jupiter`\n\n' +
        '*Protocoles:* aave, kamino, jupiter\n' +
        '*Tokens:* USDC, USDT\n' +
        '━━━━━━━━━━━━',
      { parse_mode: 'Markdown', ...mainMenuKeyboard() }
    );
  }

  const amount = parseFloat(args[0]);
  const token = args[1].toUpperCase();
  const protocol = args[2]?.toLowerCase() || null;

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply(
      '❌ *Montant invalide*\n\n' + 'Le montant doit etre un nombre positif.\n' + '━━━━━━━━━━━━',
      { parse_mode: 'Markdown', ...mainMenuKeyboard() }
    );
  }

  if (token !== 'USDC' && token !== 'USDT') {
    return ctx.reply(
      '❌ *Token invalide*\n\n' + 'Tokens supportes: USDC, USDT\n' + '━━━━━━━━━━━━',
      { parse_mode: 'Markdown', ...mainMenuKeyboard() }
    );
  }

  const loadingMsg = await ctx.reply('📊 Calcul en cours...');

  try {
    const [aaveApy, kaminoApy, jupiterApy] = await Promise.all([
      StakingService.getAaveApy(),
      StakingService.getKaminoApy(),
      StakingService.getJupiterApy(),
    ]);

    let text = '📊 *Calculateur de Gains*\n\n';
    text += '━━━━━━━━━━━━\n';
    text += `Depot: *${formatAmount(amount)} ${token}*\n`;
    text += '━━━━━━━━━━━━\n';

    const protocolsToShow = [];

    if (!protocol || protocol === 'aave') {
      const apy = token === 'USDT' ? aaveApy.USDT?.apy : aaveApy.USDC?.apy;
      if (apy) {
        protocolsToShow.push({
          name: 'Aave V3',
          chain: 'Arbitrum',
          protocol: 'aave-v3',
          apy,
        });
      }
    }

    if ((!protocol || protocol === 'kamino') && token === 'USDC') {
      const apy = kaminoApy.USDC?.apy;
      if (apy) {
        protocolsToShow.push({
          name: 'Kamino',
          chain: 'Solana',
          protocol: 'kamino',
          apy,
        });
      }
    }

    if (!protocol || protocol === 'jupiter') {
      const apy = token === 'USDT' ? jupiterApy.USDT?.apy : jupiterApy.USDC?.apy;
      if (apy) {
        protocolsToShow.push({
          name: 'Jupiter Lend',
          chain: 'Solana',
          protocol: 'jupiter',
          apy,
        });
      }
    }

    for (const p of protocolsToShow) {
      const profit = StakingService.calculateProfit({
        amount,
        apy: p.apy,
        months: 12,
        protocol: p.protocol,
      });

      text += `${p.name} - ${p.chain}\n`;
      text += '━━━━━━━━━━━━\n';
      text += `${token} • APY: *${StakingService.formatApy(p.apy)}*\n\n`;

      text += '📈 *Gains bruts*\n';
      const gross30d = StakingService.calculateYieldForDays(amount, p.apy, 30);
      const gross90d = StakingService.calculateYieldForDays(amount, p.apy, 90);
      const gross180d = StakingService.calculateYieldForDays(amount, p.apy, 180);
      const gross365d = StakingService.calculateYieldForDays(amount, p.apy, 365);

      text += `30j: *+${formatCurrency(gross30d)}*\n`;
      text += `90j: *+${formatCurrency(gross90d)}*\n`;
      text += `180j: *+${formatCurrency(gross180d)}*\n`;
      text += `365j: *+${formatCurrency(gross365d)}*\n\n`;

      text += '💸 *Frais*\n';
      text += `Depot: ${formatCurrency(profit.breakdown.depositFee)}\n`;
      text += `Retrait: ${formatCurrency(profit.breakdown.withdrawFee)}\n`;
      text += `Slippage (${profit.breakdown.slippagePercent}%): ${formatCurrency(profit.breakdown.slippageCost)}\n`;
      text += `Total: ${formatCurrency(profit.totalFees)}\n\n`;

      text += '💰 *Gains nets*\n';
      text += `30j: *+${formatCurrency(gross30d - profit.totalFees)}*\n`;
      text += `90j: *+${formatCurrency(gross90d - profit.totalFees)}*\n`;
      text += `180j: *+${formatCurrency(gross180d - profit.totalFees)}*\n`;
      text += `365j: *+${formatCurrency(profit.netProfit)}*\n\n`;

      text += `📊 ROI annualise: *${profit.roi}%*\n`;
      text += '━━━━━━━━━━━━\n\n';
    }

    if (protocolsToShow.length === 0) {
      await ctx.telegram.deleteMessage(chatId, loadingMsg.message_id);
      return ctx.reply(
        '❌ *Aucune donnee disponible*\n\n' +
          `Pour ${token}, les protocoles disponibles sont:\n` +
          '- Aave V3 (USDC, USDT)\n' +
          '- Jupiter Lend (USDC, USDT)\n' +
          '- Kamino (USDC uniquement)\n' +
          '━━━━━━━━━━━━',
        { parse_mode: 'Markdown', ...mainMenuKeyboard() }
      );
    }

    text += '_Projection APY composée sur 30j/90j/180j/365j_\n';
    text += '_Prix mis a jour automatiquement_\n';
    text += '_Frais fixes (non garanties)_\n';

    await ctx.telegram.deleteMessage(chatId, loadingMsg.message_id);

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(),
    });
  } catch (error) {
    logger.logError(error, { context: 'handleCalcCommand', chatId, args });
    try {
      await ctx.telegram.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) {}
    ctx.reply(
      '❌ Erreur lors du calcul.\n' + '━━━━━━━━━━━━\n' + '_Reessayez plus tard_',
      mainMenuKeyboard()
    );
  }
}

export { handleCalcCommand, formatAmount, formatCurrency };
