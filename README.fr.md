<p align="center">
  <img src="./src/assets/logo.png" alt="Enlaço Logo" width="128" height="128" style="border-radius: 28px; box-shadow: 0 8px 24px rgba(108, 99, 255, 0.3);" />
</p>

# Enlaço — Coordinateur de Secret Santa Sous Contraintes (SPA)

> Une Progressive Web App (PWA) axée sur la confidentialité, sans connexion requise, avec contraintes de tirage côté client, mode aveugle pour l'organisateur et partage de codes QR hors ligne.

<p align="center">
  <a href="https://kalyelnlaurindo.github.io/Enlaco/#/">
    <img src="https://img.shields.io/badge/D%C3%A9mo_En_Ligne-Acc%C3%A9dez_Ici-brightgreen?style=for-the-badge&logo=githubpages&logoColor=white" alt="Démo en Ligne" />
  </a>
</p>

<p align="center">
  <b>Langues</b><br>
  <a href="./README.md">🇧🇷 Português</a> | 
  <a href="./README.en.md">🇺🇸 English</a> | 
  <a href="./README.es.md">🇪🇸 Español</a> | 
  <a href="./README.de.md">🇩🇪 Deutsch</a> | 
  <a href="./README.ru.md">🇷🇺 Русский</a>
</p>

---

## 🎯 Aperçu du Projet

**Enlaço** est une application web monopage (SPA) moderne, réactive et conçue en priorité pour les mobiles, créée pour organiser des tirages de Secret Santa (amigo secreto) sans nécessiter de serveurs, de bases de données, de comptes d'utilisateurs ou d'autorisation.

Le moteur s'exécute entièrement dans le navigateur de l'utilisateur, utilisant un algorithme de tirage sous contraintes pour gérer les exclusions. Il génère des codes QR partageables hors ligne et des URL chiffrées basées sur des jetons permettant aux participants de révéler leur destinataire en toute sécurité, sans divulguer les correspondances à quiconque — y compris l'organisateur.

---

## 🚀 Fonctionnalités Clés

* **Mode Aveugle de l'Organisateur:** Le coordinateur peut configurer et participer au tirage sans gâcher sa propre surprise. Les correspondances ne sont jamais affichées dans la session de l'organisateur.
* **Transitions d'Interface Centrées sur le Smartphone:** Les barres latérales de présentation se replient en douceur et le modèle virtuel de téléphone glisse au centre de l'écran.
* **Contraintes de Tirage Avancées:** Configurez des règles d'exclusion bidirectionnelles (par exemple, empêcher les conjoints de se tirer au sort mutuellement).
* **Distribution Multicanal:** Partagez les résultats individuellement via des liens directs WhatsApp, des e-mails de récupération ou en téléchargeant/partageant une image de coupon QR Code personnalisée hors ligne.
* **100% Opérationnel Hors Ligne (PWA):** Une fois chargée, l'application fonctionne entièrement sans connexion Internet.

---

## ⚙️ Guide du Développeur (Installation & Vérification)

### Développement Local
Pour lancer le serveur de développement local :
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement Vite
npm run dev
```

### Exécuter les Tests
```bash
npm run test -- run
```

### Build de Production
```bash
npm run build
```

***

**Auteur:** Kalyel Nunes Laurindo / Software Engineer
