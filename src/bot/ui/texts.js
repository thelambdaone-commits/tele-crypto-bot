/**
 * Textes centralisés - Messages longs du bot Slash
 * @module ui/texts
 */

import { sectionTitle, separator } from './formatters.js';

/**
 * Texte d'aide principal du bot
 * @returns {string}
 */
export function getHelpText() {
  return `
🎮 *Aide du Bot Slash*

${sectionTitle('🔐', 'WALLETS')}
\`/wallet\` — 👛 Affiche tes wallets
\`/gen <réseau>\` — 🆕 Génère un wallet (\`/gen\` pour la liste)
\`/recevoir\` — 📥 Adresse de dépôt + QR (par actif/réseau)
\`/bal <réseau> <adresse>\` — 💰 Vérifie un solde

${sectionTitle('💸', 'TRANSACTIONS')}
\`/send <réseau> <adresse> <montant>\` — 📤 Envoie
\`/tx <réseau> <adresse>\` — 📜 Historique

${sectionTitle('📊', 'INFOS MARCHÉ')}
\`/price\` — 💹 Prix des cryptos
\`/gas\` — ⛽ Prix du gas ETH
\`/graph <token> 7|30|90|365|all\` — 📈 Graphique des prix
\`/unit <montant> <unité>\` — 🔢 Conversion d'unités

${sectionTitle('🆘', 'GÉNÉRAL')}
\`/start\` — 🚀 Menu principal
\`/menu\` — 🏠 Affiche le menu principal et accède rapidement à toutes les fonctionnalités
\`/chains\` — 🔗 Blockchains supportées
\`/id\` — 🆔 Ton ChatID / UserID
\`/help\` — ❓ Cette aide
\`/learn\` — 📚 Leçon : Coin vs Token

💡 Utilise les boutons pour naviguer !
  `.trim();
}

/**
 * Texte d'aide complet pour /help
 * @returns {string}
 */
export function getFullHelpText() {
  return `
🎮 *Bienvenue dans l'aide du Bot !*

${sectionTitle('🔐', 'WALLETS')}
\`/wallet\` — 👛 Affiche tes wallets
\`/gen <réseau>\` — 🆕 Génère un nouveau wallet (\`/gen\` pour la liste)
\`/recevoir\` — 📥 Adresse de dépôt + QR (par actif/réseau)
\`/bal <réseau> <adresse>\` — 💰 Vérifie un solde

${sectionTitle('💸', 'TRANSACTIONS')}
\`/send <réseau> <adresse> <montant>\` — 📤 Envoie des cryptos
\`/tx <réseau> <adresse> [limite]\` — 📜 Historique des transactions

${sectionTitle('📊', 'INFOS MARCHÉ')}
\`/price\` — 💹 Prix en EUR
\`/gas\` — ⛽ Prix du gas Ethereum
\`/graph <token> 7|30|90|365|all\` — 📈 Graphique des prix

${sectionTitle('🔢', "CONVERSION D'UNITÉS")}
\`/unit <montant> <unité>\` — Convertit les unités crypto

*Unités supportées :*
• BTC ↔ satoshi (1 BTC = 100M sat)
• ETH ↔ gwei ↔ wei (1 ETH = 1G gwei)
• SOL ↔ lamport (1 SOL = 1G lamports)

_Ex: /unit 1 btc → 100000000 satoshis_

${sectionTitle('📚', 'ÉDUCATION')}
\`/learn\` — 📖 Leçon : Coin vs Token

${sectionTitle('🆘', 'GÉNÉRAL')}
\`/start\` — 🚀 Démarrer
\`/menu\` — 🏠 Affiche le menu principal et accède rapidement à toutes les fonctionnalités
\`/chains\` — 🔗 Blockchains supportées
\`/id\` — 🆔 Ton ChatID / UserID
\`/help\` — ❓ Cette aide

💡 *Astuce :* Utilise les boutons du menu pour une navigation plus facile !
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
