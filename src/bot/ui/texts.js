/**
 * Textes centralisés - Messages longs du bot Slash
 * @module ui/texts
 */

import { sectionTitle, separator } from './formatters.js';

/**
 * Texte d'aide complet pour /help
 * @returns {string}
 */
export function getFullHelpText() {
  return `
🎮 *Aide du Bot*

${sectionTitle('🔐', 'WALLETS')}
\`/wallet\` — 👛 Affiche tes wallets
\`/gen <réseau>\` — 🆕 Générer un wallet (\`/gen\` pour la liste)
\`/receive\` — 📥 Adresse + QR (par actif/réseau)
\`/bal <réseau> <adresse>\` — 💰 Vérifier un solde

${sectionTitle('💸', 'TRANSACTIONS')}
\`/send <réseau> <adresse> <montant>\` — 📤 Envoyer des cryptos
\`/tx <réseau> <adresse> [limite]\` — 📜 Historique des transactions

${sectionTitle('📊', 'INFOS MARCHÉ')}
\`/price\` — 💹 Prix en EUR
\`/gas [eth|btc|sol]\` — ⛽ Frais de transaction
\`/graph <token> [7|30|90|365]\` — 📈 Graphique (défaut 365j)

${sectionTitle('🔢', "CONVERSION D'UNITÉS")}
\`/unit <montant> <unité>\` — Convertir les unités crypto
BTC ↔ satoshi · ETH ↔ gwei/wei · SOL ↔ lamport
XMR ↔ piconero · ZEC ↔ zatoshi · TRX ↔ sun

_Ex : /unit 1 btc → 100 000 000 satoshis_

${sectionTitle('📚', 'ÉDUCATION')}
\`/learn\` — 📖 Coin vs Token

${sectionTitle('🆘', 'GÉNÉRAL')}
\`/start\` — 🚀 Démarrer
\`/menu\` — 🏠 Menu principal
\`/chains\` — 🔗 Blockchains supportées
\`/id\` — 🆔 Ton ChatID / UserID
\`/help\` — ❓ Cette aide

💡 *Astuce :* Utilise les boutons du menu pour naviguer plus facilement
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
    '🌐 *Choisis ton réseau*',
    separator(),
    '🔑 Chaque réseau possède sa propre adresse.',
    "💵 Les stablecoins *USDT* / *USDC* arrivent sur le réseau de l'adresse choisie.",
    '',
    '⚠️ Un envoi depuis un *mauvais réseau* entraîne une *perte définitive* des fonds.',
  ].join('\n');
}
