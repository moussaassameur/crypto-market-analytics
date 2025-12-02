#  Sprint 0 — Initialisation & Conception

## Objectif du sprint

Mettre en place l’environnement de développement, la structure du projet et
réaliser l’ensemble des travaux de conception nécessaires avant l’implémentation
(architecture logicielle, UML, backlog produit).

Ce sprint prépare toute la base du projet.

---

##  Tâches réalisées

### ✔ 1. Installation de l’environnement
- Installation de **Node.js**
- Installation de **Docker Desktop**
- Installation de **PostgreSQL**
- Configuration de l’environnement de développement

### ✔ 2. Création du repository GitHub
- Création d’un repository privé `crypto-market-analytics`
- Initialisation d’un nouveau Git local
- Premier commit Sprint 0 (README + architecture)
- Mise en place de la structure du projet

### ✔ 3. Structure initiale du projet
Arborescence créée :
crypto-market-analytics/
├── api/
├── collector/
├── webapp/
├── docs/
├── architecture.drawio
├── architecture.png
├── uml/
├── use-case.png
├── class-diagram.png

### ✔ 4. Définition du Backlog Produit + Sprints
- Rédaction du Backlog Agile (User Stories)
- Découpage du projet en 7 sprints :
  - Sprint 0 : Initialisation & Conception
  - Sprint 1 : API Backend (structure + endpoints de base)
  - Sprint 2 : Collector (récupération données + scheduler)
  - Sprint 3 : Dashboard & visualisation
  - Sprint 4 : Alertes & notifications
  - Sprint 5 : Portefeuille virtuel
  - Sprint 6 : Tests, Dockerisation, CI/CD, Kubernetes

### ✔ 5. Conception de l'architecture générale
- Création du **diagramme d’architecture** (collector ↔ API ↔ DB ↔ frontend)
- Définition des technologies et interactions
- Document archi disponible dans `docs/architecture.png`

### ✔ 6. Conception UML
Tous les diagrammes de conception ont été réalisés :

#### 🔹 Diagramme de cas d’utilisation
- Acteurs : utilisateur, administrateur, scheduler, API externe
- Use cases : dashboard, alertes, login, prévisions, portefeuille…

📄 `docs/use-case.jpg`

#### 🔹 Diagramme de classes
- Classes : User, Crypto, Price, Alert, Portfolio, Transaction…
- Relations : compositions, associations, dépendances

📄 `docs/classDiagram.jpg`

#### 🔹 (Début) Diagrammes de séquence
- Préparation du séquence "Login"
- Planification des séquences restants pour les sprints suivants

### ✔ 7. Création du README
- Présentation du projet
- Description de l’architecture
- Objectifs fonctionnels et techniques
- Explication du processus Agile adopté

---

##  Indicateurs du sprint

| Élément | Statut |
|--------|--------|
| Environnement installé | ✅ |
| Repo GitHub créé | ✅ |
| Arborescence projet | ✅ |
| Diagrammes UML | ✅ |
| Architecture définie | ✅ |
| Backlog + Sprints | ✅ |

---

##  Conclusion du Sprint 0

Le Sprint 0 est **réussi** :  
- Le projet est organisé,  
- La documentation est claire,  
- L’architecture est définie,  
- Tous les diagrammes UML sont prêts,  
- Le backlog produit est structuré.

Le projet est maintenant prêt à démarrer l’implémentation (Sprint 1 : API Backend).
