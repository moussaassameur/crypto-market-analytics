#  Sprint 1 — Documentation du Microservice Collector

##  Objectif du Sprint
Le but de ce sprint était de créer un microservice collector capable de :
- récupérer les données crypto depuis l’API CoinGecko,
- stocker ces données dans PostgreSQL,
- automatiser la collecte,
- assurer une tolérance aux pannes,
- enregistrer des logs,
- et vérifier manuellement le bon fonctionnement.

Le sprint 1 couvre les **US1 → US8**.

---

## ✅ US1 — Récupérer les prix simples
**Objectif :** récupérer les prix des cryptos (BTC, ETH, SOL).  
**Résultat :** les prix sont récupérés via `/simple/price` et affichés dans la console.

---

## ✅ US2 — Collecter volume, market cap et variations
**Objectif :** récupérer des données avancées (prix, volume 24h, market cap, variation 1h/24h).  
**Résultat :** les données complètes sont affichées correctement.

---

## ✅ US3 — Stockage dans PostgreSQL
**Objectif :** enregistrer les données collectées dans une base PostgreSQL.  
**Résultat :** connexion avec `pg`, insertion des données dans la base.

---

## ✅ US4 — Création des tables `cryptos` et `prices`
**Objectif :** structurer les données.  
- `cryptos` → données fixes : id, coin_id, symbol, name  
- `prices` → données historiques : prix, volume, variations, date  

**Résultat :** modèle propre et évolutif.

---

## ✅ US5 — Automatiser la collecte (cron)
**Objectif :** lancer automatiquement la collecte toutes les 5 minutes.  
**Résultat :** mise en place du scheduler avec `node-cron`.

---

## ✅ US6 — Tolérance aux pannes (RabbitMQ)
**Objectif :** rendre le collector robuste.  
**Résultat :**
- un **scheduler** envoie des tâches dans RabbitMQ,  
- un **worker** lit ces tâches et exécute la collecte,  
- si erreur → la tâche est rejouée.

Architecture plus fiable, conforme à l’énoncé du professeur.

---

## ✅ US7 — Logger (console + fichier)
**Objectif :** tracer toutes les opérations du collector.  
**Résultat :** mise en place du logger Winston (console + fichier `collector.log`).

---

## ✅ US8 — Test manuel du fonctionnement
**Objectif :** vérifier que tout marche correctement.  
Requêtes utilisées :

```sql
SELECT * FROM cryptos;
SELECT * FROM prices ORDER BY collected_at DESC LIMIT 5;
SELECT COUNT(*) FROM prices;
