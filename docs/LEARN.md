# 📚 LEARN — glossaire crypto perso

Notes pédagogiques accumulées au fil des sessions. Ajouter une entrée via `/learn <sujet>`.

---

## Zcash n'est PAS un token SPL Solana

Zcash (ZEC) est une **blockchain L1 indépendante** (fork du code Bitcoin avec des preuves zk-SNARK pour la confidentialité), avec ses propres nœuds, son propre format d'adresses (transparentes `t...` et blindées `z...`) et son propre modèle UTXO.

Les tokens **SPL** sont des actifs qui vivent *sur* Solana. ZEC natif n'en fait pas partie.

Dans le bot : Zcash a son propre provider dans `src/providers/` (chaîne à part entière dans `CHAIN_REGISTRY`, routable via Tor comme Monero), alors que les tokens SPL sont gérés par le provider Solana via `TOKEN_CONFIGS`. Le swap ZEC passe par Trocador en cross-chain.

Nuance : il peut exister des versions **wrapped** de ZEC émises sur Solana comme tokens SPL par des bridges/exchanges — mais c'est un [[IOU]], pas le Zcash natif.

---

## IOU (« I Owe You »)

**IOU** = *« I Owe You »* (« je te dois ») : une **reconnaissance de dette**. Un jeton qui représente une promesse, pas l'actif lui-même.

En crypto : quand un bridge ou un exchange émet du « wrapped ZEC » sur Solana, tu ne détiens pas de vrai ZEC sur la blockchain Zcash. Tu détiens un token SPL qui dit « l'émetteur te doit 1 ZEC ». Le vrai ZEC est (en théorie) gardé en réserve par l'émetteur — tu dépends de sa solvabilité et de son honnêteté.

Opposition classique :

- **Actif natif** : ZEC sur Zcash, BTC sur Bitcoin — possession directe, aucune contrepartie.
- **IOU / wrapped** : wZEC sur Solana, WBTC sur Ethereum — une créance sur quelqu'un. Si l'émetteur fait faillite ou se fait hacker (cf. le bridge Wormhole en 2022), le token peut ne plus rien valoir.

D'où l'adage *« not your keys, not your coins »* — qui s'étend aux wrapped : *« not the native chain, not really the coin »*.

---

## Shielding & confidentialité sur Solana (état vérifié juillet 2026)

Solana est **transparente par défaut** : soldes, montants et flux sont publics. Le « shielding » regroupe les techniques qui les masquent.

- **Confidential Balances (Token-2022)** : la solution **native**, en mainnet depuis avril 2025. Extensions Token-2022 qui chiffrent montants et soldes (twisted ElGamal + preuves ZK) ; les **adresses restent publiques**.
- **Elusiv** : protocole ZK-SNARK pionnier (pool de confidentialité partagé), **fermé** — annonce février 2024, retraits possibles jusqu'à janvier 2025. ⚠️ Il n'a jamais eu de token « ELSV » (intox fréquente). L'équipe a relancé le projet sous le nom **Arcium**.
- **Arcium (ARX)** : réseau de calcul confidentiel généraliste (« encrypted supercomputer »). ⚠️ La techno est du **MPC** (protocole Cerberus : chiffrement semi-homomorphe + calcul multi-parties), **pas du FHE** — Arcium se positionne justement comme des ordres de grandeur plus rapide que le FHE.
- **FHE (chiffrement homomorphe complet)** : calculer sur des données restées chiffrées. Puissant mais lent ; à distinguer du ZK (qui *prouve* sans révéler) et du MPC (qui *répartit* le calcul).
- **Dark pools** : exécution des gros ordres hors carnet public (anti-MEV, anti-front-running). Sur Solana : **HumidiFi** (devenu le plus gros DEX en volume, ~1,1 Md$/24 h fin 2025) et **Zyga** (Darklake Labs, racheté par SOL Strategies en avril 2026 — exécution privée + **zkKYC** pour les institutions).
- **Stealth addresses (adresses furtives)** : une adresse à usage unique par transaction pour casser le traçage d'un portefeuille (concept popularisé par Monero ; ERC-5564 côté Ethereum).
- **ZK Compression (Light Protocol + Helius)** : des preuves ZK pour **compresser l'état** et réduire les coûts de stockage. Ce n'est **pas** de la confidentialité — ne pas la vendre comme du shielding.
- **Seed Vault (Solana Saga / Seeker)** : enclave matérielle des smartphones Solana Mobile qui isole les clés privées au niveau de la puce. Sécurité **physique** des clés, pas anonymat on-chain.

Dans le bot : leçon `/learn shield` (alias : zk, zksnark, fhe, mpc, arcium, elusiv, darkpool, zyga, stealth, zkcompression, seedvault…). Voir aussi [[Zcash n'est PAS un token SPL Solana]] pour les zk-SNARK côté Zcash.
