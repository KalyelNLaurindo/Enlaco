<p align="center">
  <img src="./src/assets/logo.png" alt="Enlaço Logo" width="128" height="128" style="border-radius: 28px; box-shadow: 0 8px 24px rgba(108, 99, 255, 0.3);" />
</p>

# Enlaço — Wichtel-Koordinator mit Ziehungsbeschränkungen (SPA)

> Eine datenschutzfreundliche Progressive Web App (PWA) ohne Anmeldung, mit clientseitigen Ziehungsbeschränkungen, Blindmodus für Organisatoren und Offline-QR-Code-Teilen.

<p align="center">
  <b>Sprachen</b><br>
  <a href="./README.md">🇧🇷 Português</a> | 
  <a href="./README.en.md">🇺🇸 English</a> | 
  <a href="./README.es.md">🇪🇸 Español</a> | 
  <a href="./README.fr.md">🇫🇷 Français</a> | 
  <a href="./README.ru.md">🇷🇺 Русский</a>
</p>

---

## 🎯 Projektübersicht

**Enlaço** ist eine moderne, responsive, mobile-first Single-Page-Anwendung (SPA) zur Organisation von Wichtel-Geschenkaustauschen (Secret Santa/Amigo Secreto) ohne Server, Datenbanken, Benutzerkonten oder Autorisierung.

Die Engine läuft vollständig im Browser des Benutzers und verwendet einen eingeschränkten Ziehungsalgorithmus, um Übereinstimmungsausschlüsse aufzulösen. Sie generiert offline teilbare QR-Codes und verschlüsselte, tokenbasierte URLs, mit denen Teilnehmer ihren Empfänger sicher enthüllen können, ohne dass die Übereinstimmungen jemand anderem offengelegt werden – einschließlich des Organisators.

---

## 🚀 Hauptmerkmale

* **Blindmodus für Organisatoren:** Der Koordinator kann die Ziehung einrichten und daran teilnehmen, ohne seine eigene Überraschung zu verderben. Die Zuordnungen werden in der Sitzung des Koordinators niemals angezeigt.
* **Smartphone-zentrierte UI-Übergänge:** Die Präsentations-Sidebars klappen sanft zusammen, und das virtuelle Telefonmodell gleitet in die Mitte des Bildschirms.
* **Erweiterte Ziehungsbeschränkungen:** Richten Sie Ausschlussregeln ein (z. B. verhindern, dass Ehepartner sich gegenseitig ziehen).
* **Multi-Kanal-Verteilung:** Teilen Sie Ergebnisse einzeln über direkte WhatsApp-Links, Wiederherstellungs-E-Mails oder durch Herunterladen/Teilen eines offline anpassbaren QR-Code-Couponbilds.
* **100% Offline-fähig (PWA):** Nach dem Laden funktioniert die Anwendung vollständig offline.

---

## ⚙️ Entwicklerhandbuch (Setup & Verifizierung)

### Lokale Entwicklung
Um den lokalen Entwicklungsserver zu starten:
```bash
# Abhängigkeiten installieren
npm install

# Vite-Entwicklungsserver starten
npm run dev
```

### Tests ausführen
```bash
npm run test -- run
```

### Produktions-Build erstellen
```bash
npm run build
```

***

**Autor:** Kalyel Nunes Laurindo / Software Engineer
