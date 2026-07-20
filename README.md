<p align="center">
  <img src="./src/assets/logo.png" alt="Enlaço Logo" width="128" height="128" style="border-radius: 28px; box-shadow: 0 8px 24px rgba(108, 99, 255, 0.3);" />
</p>

# Enlaço — Constrained Secret Santa Coordinator (SPA)

> A privacy-focused, zero-login Progressive Web App (PWA) with client-side drawing constraints, organizer blind mode, and offline QR-code sharing.

<p align="center">
  <a href="https://github.com/KalyelNLaurindo/Enlaco/actions/workflows/ci.yml">
    <img src="https://github.com/KalyelNLaurindo/Enlaco/actions/workflows/ci.yml/badge.svg" alt="Frontend CI/CD" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://zustand.docs.pmnd.rs/">
    <img src="https://img.shields.io/badge/Zustand-5.0-black?logo=react&logoColor=white" alt="Zustand" />
  </a>
  <a href="https://zod.dev/">
    <img src="https://img.shields.io/badge/Zod-4.4-3E67B1?logo=zod&logoColor=white" alt="Zod" />
  </a>
</p>

<p align="center">
  <b>Language / Idioma / Langue / Sprache / Язык</b><br>
  <a href="#-english">🇺🇸 English</a> | 
  <a href="#-português">🇧🇷 Português</a> | 
  <a href="#-español">🇪🇸 Español</a> | 
  <a href="#-français">🇫🇷 Français</a> | 
  <a href="#-deutsch">🇩🇪 Deutsch</a> | 
  <a href="#-русский">🇷🇺 Русский</a>
</p>

---

# 🇺🇸 English

## 🎯 Project Overview
**Enlaço** is a modern, responsive, mobile-first Single Page Application (SPA) designed to orchestrate Secret Santa (amigo secreto) gift exchanges without requiring servers, database persistence, user accounts, or authorization. The engine runs entirely in the user's browser, utilizing a constrained draw algorithm to resolve match exclusions. It generates offline-sharable QR codes and encrypted token-based URLs that let participants safely reveal their recipient.

## 🚀 Key Features
* **Organizer Blind Mode:** The coordinator can set up and participate without spoiling their own surprise. Matches are never displayed to the coordinator's session.
* **Smartphone-Centric UI Transitions:** Presentation sidebars collapse smoothly, and the virtual phone mockup slides into the center viewport.
* **Advanced Drawing Constraints:** Set up bidirectional exclusion rules (e.g., prevent spouses from drawing each other).
* **Multi-Channel Distribution:** Share results individually via direct WhatsApp links, recovery emails, or by downloading/sharing an offline custom QR Code voucher image.
* **100% Offline-Capable (PWA):** Once loaded, the application operates completely offline.

## ⚙️ Developer Guide
```bash
npm install     # Install dependencies
npm run dev     # Run Vite dev server
npm run build   # Build production bundle
npm run test -- run # Run tests
```

---

# 🇧🇷 Português

## 🎯 Visão Geral do Projeto
**Enlaço** é uma Single Page Application (SPA) moderna, responsiva e focada em dispositivos móveis, projetada para orquestrar sorteios de Amigo Secreto sem exigir servidores, persistência de banco de dados, contas de usuário ou autorização. O motor roda inteiramente no navegador do usuário, utilizando um algoritmo de sorteio restrito para resolver exclusões de combinações. Ele gera códigos QR compartilháveis offline e URLs criptografadas baseadas em tokens para que os participantes revelem com segurança seus respectivos destinatários.

## 🚀 Recursos Principais
* **Modo Cego do Organizador:** O coordenador pode configurar e participar do sorteio sem estragar sua própria surpresa. Os resultados nunca são exibidos na sessão do organizador.
* **Transições de Interface Focadas em Smartphone:** As barras laterais de apresentação colapsam suavemente, e o modelo virtual do telefone desliza para o centro da tela.
* **Restrições Avançadas de Sorteio:** Defina regras de exclusão bidirecionais (ex: evitar que casais tirem um ao outro).
* **Distribuição Multicanal:** Compartilhe resultados individualmente via links diretos do WhatsApp, e-mails de recuperação ou baixando/compartilhando uma imagem personalizada de cupom de QR Code offline.
* **100% Capaz de Operar Offline (PWA):** Uma vez carregado, o aplicativo funciona inteiramente sem conexão de internet.

## ⚙️ Guia do Desenvolvedor
```bash
npm install     # Instalar dependências
npm run dev     # Executar servidor de desenvolvimento do Vite
npm run build   # Gerar build de produção
npm run test -- run # Executar testes
```

---

# 🇪🇸 Español

## 🎯 Descripción General del Proyecto
**Enlaço** es una Aplicación de Página Única (SPA) moderna, receptiva y orientada a dispositivos móviles, diseñada para organizar intercambios de Amigo Invisible sin necesidad de servidores, persistencia de bases de datos, cuentas de usuario o autorización. El motor se ejecuta completamente en el navegador del usuario, utilizando un algoritmo de sorteo restringido para resolver las exclusiones de emparejamiento. Genera códigos QR compartibles fuera de línea y URLs encriptadas basadas en tokens para que los participantes revelen de manera segura a quién deben regalar.

## 🚀 Características Clave
* **Modo Ciego del Organizador:** El coordinador puede configurar y participar en el sorteo sin arruinar su propia sorpresa. Las combinaciones nunca se muestran en la sesión del coordinador.
* **Transiciones de IU Centradas en Teléfonos Inteligentes:** Las barras laterales de presentación se contraen suavemente y la maqueta virtual del teléfono se desliza hacia el centro de la pantalla.
* **Restricciones de Sorteo Avanzadas:** Configure reglas de exclusión bidireccionales (por ejemplo, evitar que parejas se sorteen entre sí).
* **Distribución Multicanal:** Comparta los resultados individualmente mediante enlaces directos de WhatsApp, correos electrónicos de recuperación o descargando/compartiendo una imagen de cupón con código QR personalizada fuera de línea.
* **100% Capaz de Funcionar Sin Conexión (PWA):** Una vez cargada, la aplicación funciona completamente fuera de línea.

## ⚙️ Guía del Desarrollador
```bash
npm install     # Instalar dependencias
npm run dev     # Ejecutar servidor de desarrollo de Vite
npm run build   # Compilar para producción
npm run test -- run # Ejecutar pruebas
```

---

# 🇫🇷 Français

## 🎯 Aperçu do Projet
**Enlaço** est une application web monopage (SPA) moderne, réactive et conçue en priorité para les mobiles, créée pour organiser des échanges de Secret Santa sans nécessiter de serveurs, de bases de données, de comptes d'utilisateurs ou d'autorisation. Le moteur s'exécute entièrement dans le navigateur de l'utilisateur, utilisant un algorithme de tirage avec contraintes pour gérer les exclusions. Il génère des codes QR partageables hors ligne et des URL chiffrées basées sur des jetons pour permettre aux participants de révéler leur destinataire en toute sécurité.

## 🚀 Fonctionnalités Clés
* **Mode Aveugle de l'Organisateur:** Le coordinateur peut configurer et participer au tirage sans gâcher sa propre surprise. Les correspondances ne sont jamais affichées dans la session de l'organisateur.
* **Transitions d'interface centrées sur le smartphone:** Les barres latérales de présentation se replient en douceur et le modèle virtuel de téléphone glisse au centre de l'écran.
* **Contraintes de tirage avancées:** Configurez des règles d'exclusion bidirectionnelles (par exemple, empêcher les conjoints de se tirer au sort mutuellement).
* **Distribution multicanal:** Partagez les résultats individuellement via des liens directs WhatsApp, des e-mails de récupération ou en téléchargeant/partageant une image de coupon QR Code personnalisée hors ligne.
* **100% opérationnel hors ligne (PWA):** Une fois chargée, l'application fonctionne entièrement sans connexion Internet.

## ⚙️ Guide du Développeur
```bash
npm install     # Installer les dépendances
npm run dev     # Lancer le serveur de développement Vite
npm run build   # Compiler pour la production
npm run test -- run # Exécuter les tests
```

---

# 🇩🇪 Deutsch

## 🎯 Projektübersicht
**Enlaço** ist eine moderne, responsive, mobile-first Single-Page-Anwendung (SPA) zur Organisation von Wichtel-Geschenkaustauschen (Secret Santa) ohne Server, Datenbanken, Benutzerkonten oder Autorisierung. Die Engine läuft vollständig im Browser des Benutzers und verwendet einen eingeschränkten Ziehungsalgorithmus, um Übereinstimmungsausschlüsse aufzulösen. Sie generiert offline teilbare QR-Codes und verschlüsselte, tokenbasierte URLs, mit denen Teilnehmer ihren Empfänger sicher enthüllen können.

## 🚀 Hauptmerkmale
* **Blindmodus für Organisatoren:** Der Koordinator kann die Ziehung einrichten und daran teilnehmen, ohne seine eigene Überraschung zu verderben. Die Zuordnungen werden in der Sitzung des Koordinators niemals angezeigt.
* **Smartphone-zentrierte UI-Übergänge:** Die Präsentations-Sidebars klappen sanft zusammen, und das virtuelle Telefonmodell gleitet in die Mitte des Bildschirms.
* **Erweiterte Ziehungsbeschränkungen:** Richten Sie bidirektionale Ausschlussregeln ein (z. B. verhindern, dass Ehepartner sich gegenseitig ziehen).
* **Multi-Kanal-Verteilung:** Teilen Sie Ergebnisse einzeln über direkte WhatsApp-Links, Wiederherstellungs-E-Mails oder durch Herunterladen/Teilen eines offline anpassbaren QR-Code-Couponbilds.
* **100% Offline-fähig (PWA):** Nach dem Laden funktioniert die Anwendung vollständig offline.

## ⚙️ Entwicklerhandbuch
```bash
npm install     # Abhängigkeiten installieren
npm run dev     # Vite-Entwicklungsserver starten
npm run build   # Produktions-Build erstellen
npm run test -- run # Tests ausführen
```

---

# 🇷🇺 Русский

## 🎯 Обзор проекта
**Enlaço** — это современное, адаптивное и ориентированное на мобильные устройства одностраничное приложение (SPA) для организации обмена подарками «Тайный Санта» (Secret Santa) без необходимости использования серверов, баз данных, учетных записей или авторизации. Движок работает полностью в браузере пользователя, используя алгоритм жеребьевки с ограничениями для исключения нежелательных совпадений. Он генерирует QR-коды, которыми можно делиться в автономном режиме, и зашифрованные URL-адреса на основе токенов для безопасного раскрытия получателя.

## 🚀 Ключевые особенности
* **Слепой режим для организатора:** Координатор может настроить жеребьевку и участвовать в ней, не зная результатов своего получателя. Совпадения никогда не отображаются в сессии координатора.
* **Адаптивные переходы интерфейса под смартфоны:** Боковые панели презентации плавно сворачиваются, а виртуальный макет телефона перемещается в центр экрана.
* **Расширенные ограничения жеребьевки:** Настройте двунаправленные правила исключения (например, запретить супругам выбирать друг друга).
* **Многоканальное распределение:** Делитесь результатами индивидуально через прямые ссылки WhatsApp, резервную почту или скачивая/отправляя изображение купона с QR-кодом в автономном режиме.
* **100% автономная работа (PWA):** После загрузки приложение работает полностью без подключения к Интернету.

## ⚙️ Руководство разработчика
```bash
npm install     # Установить зависимости
npm run dev     # Запустить сервер разработки Vite
npm run build   # Собрать проект для продакшена
npm run test -- run # Запустить тесты
```

***
**Autoria/Assinatura:** Kalyel N. Laurindo / Software Engineer
