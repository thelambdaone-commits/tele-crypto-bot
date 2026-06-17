import { getPricesEUR, formatEUR } from '../../../shared/price.js';
import { generatePriceChart, parseGraphCommand } from '../../../shared/chart.js';
import { getEthFees, getBtcFees, getSolFees, SOL_TYPICAL_CU, SOL_BASE_LAMPORTS } from '../../../shared/fees.js';

// Rough vsize/gas footprints of a *typical* transfer, used to turn a per-unit
// fee rate into a concrete "what a transfer costs" estimate (presentation only).
const BTC_TYPICAL_VBYTES = 140; // native-segwit 1-in / 2-out
const ETH_GAS = { transfer: 21000, swap: 150000, defi: 300000 };

function nowLabel() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function setupMarketCommands(bot) {
  // ⛽ /gas - Prix du gas / frais de transaction (multi-chaînes)
  bot.command('gas', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const chain = args[0]?.toLowerCase();

    const loadingMsg = await ctx.reply('⛽ Récupération des frais de transaction...');

    // EUR price table is best-effort: fees are still shown without it.
    const prices = await getPricesEUR().catch(() => null);
    // Append " ≈ €x.xx" only when we have a price for that asset.
    const eur = (key, amount) =>
      prices && prices[key] ? ` ≈ ${formatEUR(amount * prices[key])}` : '';

    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);

      if (chain === 'eth') {
        const eth = await getEthFees();
        const t = eth.cost(ETH_GAS.transfer);
        const s = eth.cost(ETH_GAS.swap);
        const d = eth.cost(ETH_GAS.defi);
        return ctx.reply(
          `Ξ *Frais Ethereum* ${eth.level}\n\n` +
            `💨 Gas Price : *${eth.gasPrice.toFixed(2)} Gwei*\n` +
            `🎯 Base Fee : *${eth.baseFee.toFixed(2)} Gwei*\n` +
            `🏷 Pourboire (priority) : *${eth.priorityFee.toFixed(2)} Gwei*\n` +
            `📈 Max Fee : *${eth.maxFee.toFixed(2)} Gwei*\n\n` +
            '📤 *Coûts estimés :*\n' +
            `   • Transfert ETH (21k) : ~${t.toFixed(7)} ETH${eur('eth', t)}\n` +
            `   • Swap (~150k) : ~${s.toFixed(6)} ETH${eur('eth', s)}\n` +
            `   • DeFi complexe (~300k) : ~${d.toFixed(6)} ETH${eur('eth', d)}\n\n` +
            `🕒 Mis à jour à ${nowLabel()}`,
          { parse_mode: 'Markdown' }
        );
      }

      if (chain === 'btc') {
        const btc = await getBtcFees();
        const fast = btc.fastestFee * BTC_TYPICAL_VBYTES;
        const eco = btc.economyFee * BTC_TYPICAL_VBYTES;
        return ctx.reply(
          `₿ *Frais Bitcoin* ${btc.level}\n\n` +
            `⚡ Rapide (~10 min) : *${btc.fastestFee} sat/vB*\n` +
            `🕐 ~30 min : *${btc.halfHourFee} sat/vB*\n` +
            `🕑 ~1 h : *${btc.hourFee} sat/vB*\n` +
            `🐢 Économique : *${btc.economyFee} sat/vB*\n` +
            `🧊 Minimum : *${btc.minimumFee} sat/vB*\n\n` +
            `📤 *Transfert typique (~${BTC_TYPICAL_VBYTES} vB) :*\n` +
            `   • Rapide : ~${fast.toLocaleString('fr-FR')} sat${eur('btc', fast / 1e8)}\n` +
            `   • Économique : ~${eco.toLocaleString('fr-FR')} sat${eur('btc', eco / 1e8)}\n\n` +
            `🕒 Mis à jour à ${nowLabel()}`,
          { parse_mode: 'Markdown' }
        );
      }

      if (chain === 'sol') {
        const sol = await getSolFees();
        return ctx.reply(
          `◎ *Frais Solana* ${sol.level}\n\n` +
            `🧱 Frais de base : *${SOL_BASE_LAMPORTS.toLocaleString('fr-FR')} lamports* (0.000005 ◎ / signature)\n` +
            `💎 Priority Fee (moy.) : *${sol.priorityFee.toLocaleString('fr-FR')} µ◎/CU*\n\n` +
            `📤 *Transfert estimé (~${SOL_TYPICAL_CU.toLocaleString('fr-FR')} CU) :*\n` +
            `   • Base + priority : ~${sol.totalSol.toFixed(7)} SOL${eur('sol', sol.totalSol)}\n\n` +
            'ℹ️ 1 ◎ = 1 000 000 000 lamports · µ◎ = micro-lamport/CU\n' +
            `🕒 Mis à jour à ${nowLabel()}`,
          { parse_mode: 'Markdown' }
        );
      }

      // Summary across all chains.
      const [eth, btc, sol] = await Promise.all([
        getEthFees().catch(() => null),
        getBtcFees().catch(() => null),
        getSolFees().catch(() => null),
      ]);

      let text = '⛽ *Frais de Transaction*\n\n';

      if (eth) {
        const t = eth.cost(ETH_GAS.transfer);
        text +=
          `Ξ *Ethereum* ${eth.level}\n` +
          `   💨 Gas : *${eth.gasPrice.toFixed(2)} Gwei*\n` +
          `   📤 Transfert : ~${t.toFixed(7)} ETH${eur('eth', t)}\n\n`;
      } else {
        text += 'Ξ *Ethereum* ❓ indisponible\n\n';
      }

      if (btc) {
        const fast = btc.fastestFee * BTC_TYPICAL_VBYTES;
        text +=
          `₿ *Bitcoin* ${btc.level}\n` +
          `   ⚡ Rapide : *${btc.fastestFee} sat/vB* · 🐢 Éco : *${btc.economyFee}*\n` +
          `   📤 Transfert : ~${fast.toLocaleString('fr-FR')} sat${eur('btc', fast / 1e8)}\n\n`;
      } else {
        text += '₿ *Bitcoin* ❓ indisponible\n\n';
      }

      if (sol) {
        text +=
          `◎ *Solana* ${sol.level}\n` +
          `   💎 Priority : *${sol.priorityFee.toLocaleString('fr-FR')} µ◎/CU*\n` +
          `   📤 Transfert : ~${sol.totalSol.toFixed(7)} SOL${eur('sol', sol.totalSol)}\n\n`;
      } else {
        text += '◎ *Solana* ❓ indisponible\n\n';
      }

      text +=
        `🕒 Mis à jour à ${nowLabel()}\n` + '_Détails :_ `/gas eth` · `/gas btc` · `/gas sol`';

      await ctx.reply(text, { parse_mode: 'Markdown' });
    } catch (error) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      } catch {
        /* message may already be gone */
      }
      ctx.reply(`❌ Impossible de récupérer les frais : ${error.message}`);
    }
  });

  // 💹 /price - Prix des cryptos
  bot.command('price', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    try {
      const prices = await getPricesEUR();
      if (args.length === 0) {
        return ctx.reply(
          '💹 *Prix des Cryptos (EUR)*\n\n' +
            `Ξ *ETH* : ${formatEUR(prices.eth)}\n` +
            `₿ *BTC* : ${formatEUR(prices.btc)}\n` +
            `◎ *SOL* : ${formatEUR(prices.sol)}\n` +
            `💵 *USDC* : ${formatEUR(prices.usdc)}\n` +
            `💵 *USDT* : ${formatEUR(prices.usdt)}`,
          { parse_mode: 'Markdown' }
        );
      }

      const crypto = args[0].toLowerCase();
      if (prices[crypto]) {
        return ctx.reply(`💹 *${crypto.toUpperCase()}* : *${formatEUR(prices[crypto])}*`, {
          parse_mode: 'Markdown',
        });
      }
      ctx.reply('❌ Crypto non supportée.');
    } catch (error) {
      ctx.reply(`❌ Erreur : ${error.message}`);
    }
  });

  // 📊 /graph - Graphique des prix d'une crypto
  bot.command('graph', async (ctx) => {
    const command = parseGraphCommand(ctx.message.text);
    if (!command.ok) {
      return ctx.reply(`📊 ${command.error}`, { parse_mode: 'Markdown' });
    }

    const loadingMsg = await ctx.reply('📊 Génération du graphique...');
    try {
      const { buffer, stats } = await generatePriceChart(command.symbol, command.days);
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);

      const changeEmoji = stats.isPositive ? '📈' : '📉';
      const caption =
        `${changeEmoji} *${command.symbol.toUpperCase()}* — ${stats.periodLabel}\n\n` +
        `💰 Prix : *€${stats.currentPrice.toLocaleString('fr-FR')}*\n` +
        `📊 Var. : *${stats.isPositive ? '+' : ''}${stats.priceChange.toFixed(2)}%*\n` +
        `🕒 Mis à jour le *${stats.generatedAtLabel}*`;

      await ctx.replyWithPhoto({ source: buffer }, { caption, parse_mode: 'Markdown' });
    } catch (error) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      } catch {
        /* message may already be gone */
      }
      ctx.reply(`❌ Erreur : ${error.message}`);
    }
  });
}
