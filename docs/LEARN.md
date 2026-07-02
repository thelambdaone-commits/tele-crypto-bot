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
