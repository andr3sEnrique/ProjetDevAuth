# ProjetDevAuth

**ProjetDevAuth** est un système d'authentification et de gestion de blogs avec des fonctionnalités avancées telles que l'authentification à deux facteurs (2FA), la gestion des utilisateurs et la gestion des blogs publics et privés. Ce projet utilise une pile moderne de développement web comprenant **Node.js**, **Express**, **JavaScript**, et **Bootstrap**.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants installés :

- **Node.js** (version 14 ou supérieure) [Télécharger Node.js](https://nodejs.org)
- **npm** ou **yarn** (inclus avec Node.js)
- **Git** (pour cloner le dépôt) [Télécharger Git](https://git-scm.com)
- Un navigateur web moderne

---

## Configuration du projet

### 1. Cloner le dépôt

Utilisez la commande suivante pour cloner ce dépôt sur votre machine locale :

```bash
git clone https://github.com/andr3sEnrique/ProjetDevAuth.git

```
### 2. Installer les dépendances

- cd ProjetDevAuth
- npm install

### 3. Modifier l'URL du cluster MongoDB

- Le projet utilise MongoDB comme base de données. Pour connecter votre propre cluster MongoDB, modifiez l'URL de connexion dans le fichier de configuration.
- Ouvrez le fichier config/index.js et remplacez l'URL de connexion par celle de votre cluster MongoDB

### 4. Démarrer le serveur
- Pour exécuter le projet en mode développement, utilisez la commande suivante :
```bash
node index.js
