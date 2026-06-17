# Architecture du Telegram Crypto Bot

## Vue d'ensemble

Bot Telegram multi-chaîne pour la gestion de portefeuilles crypto. Architecture modulaire en couches avec chiffrement AES-256-GCM, rate limiting, journalisation d'audit et circuit breaker RPC.

```
src/
├── index.js          → Point d'entrée (orchestrateur)
├── bot/              → Couche Telegram
│   ├── constants/    → Constantes partagées (callbacks)
│   ├── handlers/     → Gestionnaires de commandes/actions
│   ├── keyboards/    → Définitions des claviers inline/reply
│   ├── messages/     → Textes utilisateur centralisés
│   ├── middlewares/  → Auth, rate limiting, sécurité
│   └── ui/           → Formateurs d'affichage
├── core/             → Infrastructure fondamentale
│   ├── session/      → Gestionnaire de sessions persistantes
│   ├── config.js     → Configuration centralisée
│   ├── monitor.js    → Surveillance des dépôts
│   ├── secret-vault.js → Coffre-fort de secrets chiffrés
│   └── storage.js    → Stockage fichier chiffré
├── modules/          → Logique métier
│   └── wallet/       → Service wallet unifié
├── providers/        → Abstraction blockchain
│   ├── base.provider.js → Clase abstraite
│   ├── evm-base.js   → Base EVM (ETH, ARB, MATIC, OP, BASE, AVAX)
│   ├── bitcoin.js    → BTC
│   ├── solana.js     → SOL
│   ├── monero.js     → XMR (privacy, via Tor optionnel)
│   ├── zcash.js      → ZEC (privacy, via Tor optionnel)
│   └── ...           → LTC, BCH, avalanche, chaînes EVM individuelles
└── shared/           → Utilitaires transversaux
    ├── security/     → Audit log, rate limiter
    ├── utils/        → Utilitaires Telegram
    ├── encryption.js → AES-256-GCM
    ├── logger.js     → Logger structuré avec redaction
    ├── rpc-fallback.js → Fallback multi-endpoint RPC
    ├── resilient-rpc.js → Circuit breaker pattern
    └── ...
```

## Flux de données

```
Telegram API
    ↓
Telegraf (bot framework)
    ↓
Middlewares (auth, rate-limit, profile sync)
    ↓
Handlers (commandes callbacks, text input)
    ↓
Modules / Services (wallet)
    ↓
Providers (blockchain specific implementations)
    ↓
RPC / External APIs
```

## Principes clés

1. **Séparation stricte** : La couche Telegram (`bot/`) ne contient aucune logique blockchain.
2. **Injection de dépendances** : Les handlers reçoivent `(bot, storage, walletService, sessions)`.
3. **Chiffrement systématique** : Toutes les données sensibles utilisent AES-256-GCM.
4. **Sessions persistantes** : Combinaison mémoire + fichier chiffré pour la récupération après redémarrage.
5. **Sécurité multicouche** : Rate limiting + audit logging + blacklist automatique + redaction de logs.

## Sécurité

- Chiffrement AES-256-GCM pour toutes les clés privées et seeds
- MASTER_ENCRYPTION_KEY de 32 bytes (64 hex) requise au démarrage
- Coffre-fort de secrets chiffré pour les RPC
- Logger avec redaction automatique des champs sensibles (`privateKey`, `mnemonic`, etc.)
- Rate limiter avec blacklist automatique après 5 avertissements
- Journal d'audit pour toutes les actions sensibles
- Vérification `sessions.json` au démarrage (interdiction des sessions en clair)

## Chaînes supportées

| Chaîne | Provider | Type |
|--------|----------|------|
| Ethereum | evm-base | EVM |
| Bitcoin | bitcoin | UTXO |
| Solana | solana | Solana |
| Arbitrum | evm-base | EVM L2 |
| Polygon | evm-base | EVM |
| Optimism | evm-base | EVM L2 |
| Base | evm-base | EVM L2 |
| Litecoin | litecoin | UTXO |
| Bitcoin Cash | bitcoincash | UTXO |
| Avalanche | avalanche (evm-base) | EVM (C-Chain) |
| Monero | monero | CryptoNote (privacy) |
| Zcash | zcash | UTXO (privacy) |
