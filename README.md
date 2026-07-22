# 🤖 Crypto Bot - Telegram Multi-Chain Wallet Manager

Bot Telegram modulaire pour gerer des wallets crypto multi-chain : creation/import/derivation, suivi des soldes, envoi de fonds, analyse d'adresses (scan multi-EVM) et prix en EUR.

## ⚡ Pour Commencer

```bash
git clone https://github.com/thelambdaone-commits/telegram-crypto-bot-v1.git
cd telegram-crypto-bot
npm install
cp .env.example .env
# Editez .env avec vos valeurs
npm run precheck
npm start
```

## ✨ Fonctionnalites

| Module | Description |
| ------ |-------------|
| 🪙 Multi-chain | Ethereum, Polygon, Solana, Bitcoin, Litecoin, BCH, Arbitrum, Optimism, Base, Avalanche, Monero, Zcash, Tron, **TON**, **BNB Chain** (15 chaînes) |
| 📷 QR Code | QR d'adresse avec logo de la crypto et nom du réseau au centre |
| 💳 Wallets | Creation, import (cle privee / seed) et derivation depuis une seed existante |
| 💸 Transferts | Estimation dynamique des frais, envoi de tokens (USDC/USDT) |
| 🔄 Échange sans KYC | Échange cross-chain **keyless** (Trocador AnonPay) : depuis le menu ou un wallet, devis + frais affichés, adresse de réception pré-remplie. Repli SimpleSwap. `/swaps` `/list` |
| 💳 Payment gateway | Factures crypto **non-custodial** (BTCPay-style) : `/invoice` → adresse + QR, surveillance auto, notif au paiement. **⚡ Lightning** (BOLT11, instantané) si un nœud phoenixd est branché, avec choix du wallet BTC de réception. Annuler / revoir / recréer une facture (`/invoices`). Trésorerie admin (`/treasury`) : sweep + sélection du wallet |
| 🔍 Analyse | Detection auto d'adresse + scan multi-EVM (solde, tokens, historique, valeur EUR) |
| 💵 Prix EUR | CoinGecko integre (`/price`, `/gas`, `/graph`) — tous les coins/tokens pricés |
| 🔐 Privacy | Monero & Zcash via Tor (optionnel) |
| 👮 Admin | Panel, logs audit, rate limiting, stockage chiffre, secrets RPC |
| 🌍 i18n | Interface bilingue français/anglais — le user toggle dans ⚙️ Paramètres |
| 🧩 Captcha | Vérification mathématique à `/start` (admin skip) — anti-bot |

## 🏗️ Architecture

```
src/
├── bot/                 # Interface Telegram: handlers, keyboards, textes, middlewares
│   ├── handlers/        # Un dossier par feature (start, wallet, send, deposit, admin, exchange, payments...)
│   ├── keyboards/       # Clavieres centralisées
│   ├── messages/        # i18n bundles fr.js + en.js
│   ├── constants/       # CALLBACKS
│   ├── patterns/        # confirmFlow, inputPrompt, createPaginator (réutilisables)
│   ├── middlewares/     # auth, rate-limit, dedup, message-length
│   └── ui/              # formatters, renderers
├── core/                # Config, stockage chiffre, sessions, secret-vault, tokens
│   └── session/         # SessionManager (in-memory + encrypted file)
├── modules/             # Services metier
│   ├── wallet/          # WalletService (orchestration multi-chain)
│   ├── swap/            # ExchangeService (echange no-KYC Trocador)
│   └── payments/        # PaymentService + Ledger + LightningService (facturation)
├── providers/           # Adaptateurs blockchain (un par chaine, 15 chaines)
├── shared/              # Utilities
│   ├── rpc/             # RpcManager (circuit breaker, cache TTL, rate limit par endpoint)
│   ├── security/        # rate-limit + auto-blacklist, audit-logger
│   └── utils/           # Telegram helpers (splitTelegramMessage, escapeHtml)
├── bootstrap.js         # App class: init, middleware wiring, health checks
└── index.js             # Point d'entree
```

Le bot garde la couche Telegram (`bot/`) sans logique blockchain : elle delegue aux services de `modules/` et aux `providers/`.

```
Telegram → Telegraf → middlewares (auth · rate-limit · dedup · message-length)
        → handlers → modules/services → providers → RPC / APIs externes
```

### 🔄 Flux d'echange sans KYC (keyless)

```
/swaps  ou  bouton « 🔄 Echanger » d'un wallet (exch_w_<id>)
   │
   ▼
[1] Crypto a DONNER  ─ picker de symboles (20)  ─┐ multi-reseau ?
   │                                              └─▶ choix du reseau
   ▼
[2] Crypto a RECEVOIR ─ picker (bridges meme-symbole OK) ─┐ multi-reseau ?
   │                                                       └─▶ choix du reseau
   ▼
finalize(from, to)
   ├─ adresse de reception = TON wallet sur la chaine cible (pre-rempli)
   ├─ devis : taux exact Trocador (si TROCADOR_API_KEY) sinon taux marche EUR
   ├─ frais reseau (estimateFees du provider source)
   └─ lien Trocador AnonPay (keyless)  +  repli SimpleSwap
          → l'utilisateur finalise sur Trocador ; le bot ne touche jamais les fonds
```

## 📋 Prérequis

- Node.js `>=20.18.0`
- npm
- Un token Telegram BotFather
- Une cle de chiffrement 32 bytes en hexadecimal

### 🔑 Generation de la cle de chiffrement

```bash
openssl rand -hex 32
```

## 📦 Installation

```bash
git clone https://github.com/thelambdaone-commits/telegram-crypto-bot-v1.git
cd telegram-crypto-bot
npm install
cp .env.example .env
```

Editez ensuite `.env` avec vos valeurs reelles.

## ⚙️ Configuration

### Variables Requises

| Variable | Description |
| --- | --- |
| `BOT_TOKEN` | Token Telegram cree via BotFather |
| `MASTER_ENCRYPTION_KEY` | Cle hex 64 caracteres (AES-256-GCM) |
| `ADMIN_USER_ID` | ID Telegram autorise a utiliser `/admin` |
| `SOL_RPC_URL` | RPC Solana (Helius, QuickNode, etc.) |

### Variables Optionnelles

| Variable | Defaut | Description |
| --- | --- | --- |
| `DATA_PATH` | `./data` | Dossier de stockage local |
| `ADMIN_CHAT_ID` | — | IDs de chats autorises (separes par virgules) |
| `SESSION_TIMEOUT` | `5` | Timeout de session en minutes |
| `RATE_LIMIT` | `30` | Requetes par minute |
| `DAILY_LIMIT_SOL` | — | Limite journaliere en SOL (circuit breaker) |
| `DAILY_LIMIT_ETH` | — | Limite journaliere en ETH (circuit breaker) |
| `DAILY_LIMIT_USD` | — | Limite journaliere en USD (circuit breaker) |
| `TON_API_KEY` | — | Clé TonCenter (optionnelle — le wallet TON marche sans, juste rate-limité) |
| `TROCADOR_API_KEY` | — | Optionnelle : active le devis exact dans le bot. L'échange AnonPay marche **sans** (keyless) |
| `TROCADOR_REF` | — | Code de parrainage Trocador (commissions, optionnel) |
 
<details>
<summary><b>RPC & Endpoints</b> (cliquer pour déplier)</summary>

| Variable | Defaut |
| --- | --- |
| `ETH_RPC_URL` | `https://eth.llamarpc.com` |
| `BTC_API_URL` | `https://mempool.space/api` |
| `POLYGON_RPC_URL` | `https://polygon-rpc.com` |
| `ARB_RPC_URL` | `https://arb1.arbitrum.io/rpc` |
| `LTC_API_URL` | `https://litecoinspace.org/api` |
| `BCH_API_URL` | `https://api.blockchain.info/bch` |
| `OPTIMISM_RPC_URL` | `https://mainnet.optimism.io` |
| `BASE_RPC_URL` | `https://mainnet.base.org` |
| `AVAX_RPC_URL` | `https://api.avax.network/ext/bc/C/rpc` |
| `TON_RPC_URL` | `https://toncenter.com/api/v2/jsonRPC` |

Les RPCs se résolvent d'abord depuis le **SecretVault** (`src/core/secret-vault.js`), puis `.env`, puis defaults hardcodés. Les admins peuvent overrider les endpoints RPC à runtime via le panel admin sans redéployer.

</details>

<details>
<summary><b>Privacy coins (Monero / Zcash) & Tor</b> (optionnel)</summary>

| Variable | Defaut | Description |
| --- | --- | --- |
| `XMR_DAEMON_URL` | `http://node.moneroworld.com:18089` | Daemon Monero (lecture) |
| `XMR_WALLET_RPC_URL` | — | Wallet RPC Monero (requis pour envoyer) |
| `XMR_WALLET_RPC_AUTH` | — | Auth `user:pass` du wallet RPC Monero |
| `ZEC_API_URL` | `https://api.zcha.in/v2/mainnet` | API Zcash (lecture) |
| `ZEC_RPC_URL` | — | Node RPC Zcash (requis pour envoyer) |
| `ZEC_RPC_AUTH` | — | Auth du node RPC Zcash |
| `TOR_PROXY_URL` | — | Proxy SOCKS5 (ex. `socks5://127.0.0.1:9050`) pour router les privacy coins |

</details>

<details>
<summary><b>CoinGecko</b> (optionnel, recommande si l'API publique renvoie 401/429)</summary>

| Variable | Defaut | Description |
| --- | --- | --- |
| `COINGECKO_API_URL` | `https://api.coingecko.com/api/v3` | Endpoint API |
| `COINGECKO_API_KEY` | — | Cle API (demo ou pro) |
| `COINGECKO_API_KEY_HEADER` | `x-cg-demo-api-key` | Header d'authentification |

</details>

<details>
<summary><b>⚡ Lightning (payment gateway, optionnel)</b></summary>

L'invoicing on-chain marche sans config. Pour activer **Lightning** (BOLT11, règlement instantané), fais tourner un nœud **phoenixd** (ACINQ, liquidité auto) et branche son API HTTP :

```bash
# Installer phoenixd : https://phoenix.acinq.co/server
# ARM64 Linux : https://github.com/ACINQ/phoenixd/releases
phoenixd --silent
# Le mot de passe HTTP est dans ~/.phoenix/phoenix.conf (http-password)
```

| Variable | Exemple |
| --- | --- |
| `LN_BACKEND_URL` | `http://127.0.0.1:9740` |
| `LN_PASSWORD` | *(http-password de phoenixd)* |
| `LN_SWEEP_BTC_ADDRESS` | *(adresse cold BTC pour le sweep automatique)* |
| `LN_SWEEP_THRESHOLD_SAT` | `500000` *(seuil en sats avant sweep)* |
| `LN_SWEEP_INTERVAL_HOURS` | `6` *(intervalle de sweep)* |

Sans `LN_BACKEND_URL` + `LN_PASSWORD`, l'option ⚡ Lightning n'apparaît pas dans `/invoice`.

</details>

## 🚀 Lancement

### Mode developpement

```bash
npm run dev
```

### Production (pm2)

Le projet inclut un `ecosystem.config.cjs` pour pm2 avec deux processus :

- **telegram-crypto-bot** — le bot (Node.js, max 500 MB RAM)
- **phoenixd** — le nœud Lightning (binaire natif, max 300 MB RAM)

```bash
# Installer pm2 globalement
npm install -g pm2

# Lancer les deux processus
pm2 start ecosystem.config.cjs

# Ou un seul
pm2 start ecosystem.config.cjs --only telegram-crypto-bot
pm2 start ecosystem.config.cjs --only phoenixd

# Voir les logs
pm2 logs
pm2 monit

# Sauvegarder la config (auto-restart au reboot)
pm2 save

# Auto-start au boot du serveur
pm2 startup
```

**Notes** :
- phoenixd doit être démarré avant le bot (le bot vérifie la connexion LN au boot)
- `pm2 save` est requis pour persister la config après redémarrage
- Les logs atterrissent dans `logs/` (rotation configurée)

## 🧪 Commandes Utiles

### Tests et verification

```bash
npm test                  # Tous les tests (node --test)
npm run test:watch        # Watch mode
npm run precheck          # Validate .env + encrypted storage
npm run lint              # ESLint (0 warnings attendus)
npm run lint:fix          # Auto-fix
npm run format            # Prettier
npm run config:check      # Validate config
npm run ci                # lint + test + precheck
npm run check:exports     # Decrypt & list credential export files
```

### Commandes Telegram

| Commande | Role |
| --- | --- |
| `/start` | Onboarding + captcha anti-bot (admin skip) |
| `/wallet`, `/gen <reseau>` | Lister / generer un wallet |
| `/bal <reseau> <adresse>`, `/tx <reseau> <adresse>` | Solde / historique d'une adresse |
| `/send <reseau> <adresse> <montant>` | Envoyer des fonds |
| `/price`, `/gas`, `/graph <token> <periode>`, `/unit` | Infos marche |
| `/swaps`, `/list` | Échange sans KYC / liste des coins & tokens supportés |
| `/invoice` | Créer une facture crypto (on-chain ou ⚡ Lightning) |
| `/invoices` | Voir mes factures récentes + statut |
| `/menu`, `/help`, `/chains`, `/learn` | Navigation et aide |

### Admin uniquement

| Commande | Role |
| --- | --- |
| `/admin` | Panel admin (stats, users, actions, secrets, audit) |
| `/treasury` | Trésorerie Lightning : solde nœud, payouts, sweep manuel |
| `/audit` | Rapport sécurité passif (config, rate-limit, RPC, injection scan) |

## 🌍 i18n (Bilingue)

Le bot est entièrement bilingue **français** (défaut) et **anglais**. L'utilisateur peut basculer dans ⚙️ Paramètres.

- Bundles : `src/bot/messages/fr.js` + `en.js` (clé-par-clé, vérifié par `tests/i18n-parity.test.js`)
- Fonction : `t(lang, 'dot.path', ...args)` depuis `src/bot/messages/index.js`
- Les labels de clavier sont localisés → les `bot.hears(...)` matchers aussi

## 🔒 Securite

- Les private keys et mnemonic sont stockes **chiffres** avec `MASTER_ENCRYPTION_KEY` (AES-256-GCM, dérivée par user via chatId).
- Chaque user a son propre fichier `<chatId>.enc` — les données ne se mélangent jamais.
- Les handlers ne renvoient pas les secrets en clair dans Telegram (auto-delete 30-60s + `escapeHtml`).
- Les logs d'audit evitent les valeurs sensibles (`redactKeys` set + `redactUrl` pour les API keys dans les URLs).
- Rate limiting multi-niveaux : 30/min global, burst 10/10s, sensitive 5/min, transactions 3/min.
- Auto-blacklist persistante via SecretVault.
- Le bot auto-leave les groupes non autorisés.
- Refus de boot si `sessions.json` existe en clair.
- `.env` ne doit jamais etre committe.
- `npm audit` peut signaler des vulnerabilites transitives dans la stack Solana actuelle. Ne lancez pas `npm audit fix --force` sans review, car npm peut proposer des versions incompatibles ou regressives.

## 🏗️ RPC Resilience

Le projet utilise `RpcManager` (`src/shared/rpc/RpcManager.js`) pour les lectures blockchain :

- **Circuit breaker** — ouvre après X échecs, se auto-répare
- **Health ranking** — les endpoints sains passent en priorité
- **Cache TTL** — les appels répétés sont dédupliqués (balances 15s, fees 60s)
- **Rate limiting** — token-bucket par endpoint

Les **écritures** (send) ne passent PAS par RpcManager : EVM utilise ethers FallbackProvider, Solana a sa propre boucle re-sign/retry, les UTXO broadcastent sur plusieurs explorers.

## 📝 Notes Production

- Utilisez Node `>=20.18.0`.
- Gardez une sauvegarde securisee de `MASTER_ENCRYPTION_KEY`; sans elle, les secrets stockes ne seront plus lisibles.
- **Backup seed** : si vous utilisez Lightning, sauvegardez `~/.phoenix/seed.dat` (12 mots) — sans elle, les fonds sur les canaux Lightning sont irrécupérables.
- Protegez le dossier `data/`.
- Surveillez regulierement `npm audit`, mais appliquez les corrections de dependances avec prudence.

---

**⚠️ Avertissement**

Ce bot est destine a un usage personnel et educatif. Verifiez les transactions et les permissions avant toute utilisation avec des fonds reels.
