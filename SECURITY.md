# Politique de sécurité

Ce projet gère des **clés privées et des fonds crypto**. La sécurité est traitée
en priorité absolue.

## Versions supportées

Seule la dernière version de la branche `master` est maintenue et reçoit les
correctifs de sécurité.

## Signaler une vulnérabilité

**N'ouvre pas d'issue publique pour une faille de sécurité.**

Utilise le canal privé de GitHub :

1. Onglet **« Security »** du dépôt → **« Report a vulnerability »**
   (GitHub Private Vulnerability Reporting).
2. Décris la faille, les étapes de reproduction et l'impact potentiel
   (exfiltration de clés, contournement d'authentification admin, etc.).

Merci d'inclure :

- la version / le commit concerné ;
- un PoC minimal si possible ;
- ton évaluation de la sévérité.

## Engagement

- Accusé de réception sous **72 h**.
- Évaluation et plan de correctif communiqués sous **7 jours**.
- Divulgation coordonnée : on convient ensemble d'une date de publication une
  fois le correctif déployé.

## Bonnes pratiques côté exploitation

- Ne **jamais** committer `.env`, le dossier `data/`, ni un fichier de session
  (`sessions.json` / `sessions.enc`) — ils sont dans `.gitignore`.
- `MASTER_ENCRYPTION_KEY` doit rester secrète : sa fuite compromet toutes les
  clés utilisateurs chiffrées.
- Les endpoints RPC sensibles se configurent via le `SecretVault` chiffré
  (panel admin), pas en clair.
