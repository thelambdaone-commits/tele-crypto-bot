/**
 * Textes centralisés - Messages longs du bot Slash
 * @module ui/texts
 */

import { sectionTitle, separator } from './formatters.js';

/**
 * Full help text for /help.
 * @param {string} [lang] - 'fr' (default) or 'en'
 * @returns {string}
 */
export function getFullHelpText(lang = 'fr') {
  if (lang === 'en') {
    return `
🎮 <b>Bot Help</b>

${sectionTitle('🔐', 'WALLETS')}
<code>/wallet</code> — 💰 Show my wallets
<code>/gen &lt;network&gt;</code> — 🆕 Generate a wallet (<code>/gen</code> for the list)
<code>/receive</code> — 📥 Address + QR (per asset/network)
<code>/bal &lt;network&gt; &lt;address&gt;</code> — 💰 Check a balance

${sectionTitle('💸', 'TRANSACTIONS')}
<code>/send &lt;network&gt; &lt;address&gt; &lt;amount&gt;</code> — 📤 Send crypto
<code>/tx &lt;network&gt; &lt;address&gt; [limit]</code> — 📜 Transaction history

${sectionTitle('📊', 'MARKET INFO')}
<code>/price</code> — 💹 Prices in EUR
<code>/gas [eth|btc|sol|trx]</code> — ⛽ Transaction fees
<code>/graph &lt;token&gt; [7|30|90|365]</code> — 📈 Chart (default 365d)
↳ or the <b>📈 Chart</b> button on <code>/price</code> (grid of all coins) &amp; in 🔎 Analyze

${sectionTitle('🔢', 'UNIT CONVERSION')}
<code>/unit &lt;amount&gt; &lt;unit&gt;</code> — Convert crypto units
BTC ↔ satoshi · ETH ↔ gwei/wei · SOL ↔ lamport
XMR ↔ piconero · ZEC ↔ zatoshi · TRX ↔ sun

<i>e.g. /unit 1 btc → 100,000,000 satoshis</i>

${sectionTitle('💱', 'EXCHANGE')}
<code>/list</code> — 📋 Supported coins &amp; tokens
<code>/swaps</code> — 💱 No-KYC swap (cross-chain)
<code>/invoice</code> — 💳 Create an invoice (receive a payment)
<code>/invoices</code> — 🧾 My invoices

${sectionTitle('📚', 'LEARN')}
<code>/learn</code> — 📖 Coin vs Token

${sectionTitle('🆘', 'GENERAL')}
<code>/start</code> — 🚀 Start
<code>/menu</code> — 🎮 Main menu
<code>/chains</code> — 🔗 Supported blockchains
<code>/id</code> — 🆔 Your ChatID / UserID
<code>/help</code> — ❓ This help

💡 <b>Tip:</b> Use the menu buttons to navigate more easily
  `.trim();
  }

  return `
🎮 <b>Aide du Bot</b>

${sectionTitle('🔐', 'WALLETS')}
<code>/wallet</code> — 💰 Afficher mes wallets
<code>/gen &lt;réseau&gt;</code> — 🆕 Générer un wallet (<code>/gen</code> pour la liste)
<code>/receive</code> — 📥 Adresse + QR (par actif/réseau)
<code>/bal &lt;réseau&gt; &lt;adresse&gt;</code> — 💰 Vérifier un solde

${sectionTitle('💸', 'TRANSACTIONS')}
<code>/send &lt;réseau&gt; &lt;adresse&gt; &lt;montant&gt;</code> — 📤 Envoyer des cryptos
<code>/tx &lt;réseau&gt; &lt;adresse&gt; [limite]</code> — 📜 Historique des transactions

${sectionTitle('📊', 'INFOS MARCHÉ')}
<code>/price</code> — 💹 Prix en EUR
<code>/gas [eth|btc|sol|trx]</code> — ⛽ Frais de transaction
<code>/graph &lt;token&gt; [7|30|90|365]</code> — 📈 Graphique (défaut 365j)
↳ ou bouton <b>📈 Graphique</b> sur <code>/price</code> (grille de toutes les cryptos) &amp; dans 🔍 Analyser

${sectionTitle('🔢', "CONVERSION D'UNITÉS")}
<code>/unit &lt;montant&gt; &lt;unité&gt;</code> — Convertir les unités crypto
BTC ↔ satoshi · ETH ↔ gwei/wei · SOL ↔ lamport
XMR ↔ piconero · ZEC ↔ zatoshi · TRX ↔ sun

<i>Ex : /unit 1 btc → 100 000 000 satoshis</i>

${sectionTitle('💱', 'EXCHANGE')}
<code>/list</code> — 📋 Cryptos &amp; tokens supportés
<code>/swaps</code> — 💱 Échange sans KYC (cross-chain)
<code>/invoice</code> — 💳 Créer une facture (recevoir un paiement)
<code>/invoices</code> — 🧾 Mes factures

${sectionTitle('📚', 'ÉDUCATION')}
<code>/learn</code> — 📖 Coin vs Token

${sectionTitle('🆘', 'GÉNÉRAL')}
<code>/start</code> — 🚀 Démarrer
<code>/menu</code> — 🎮 Menu principal
<code>/chains</code> — 🔗 Blockchains supportées
<code>/id</code> — 🆔 Ton ChatID / UserID
<code>/help</code> — ❓ Cette aide

💡 <b>Astuce :</b> Utilise les boutons du menu pour naviguer plus facilement
  `.trim();
}

/**
 * Prompt premium et unique de sélection de réseau (création de wallet et
 * réception). Le corps du message porte le titre/séparateur/avertissement —
 * le clavier (chainSelectionKeyboard) ne porte que les boutons.
 * @returns {string}
 */
export function chainSelectionPrompt() {
  return [
    '🌐 <b>Choisis ton réseau</b>',
    separator(),
    '🔑 Chaque réseau possède sa propre adresse.',
    "💵 Les stablecoins <b>USDT</b> / <b>USDC</b> arrivent sur le réseau de l'adresse choisie.",
    '',
    '⚠️ Un envoi depuis un <b>mauvais réseau</b> entraîne une <b>perte définitive</b> des fonds.',
  ].join('\n');
}
