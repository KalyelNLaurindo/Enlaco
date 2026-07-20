<p align="center">
  <img src="./src/assets/logo.png" alt="Enlaço Logo" width="128" height="128" style="border-radius: 28px; box-shadow: 0 8px 24px rgba(108, 99, 255, 0.3);" />
</p>

# Enlaço — Coordinador de Amigo Invisible Restringido (SPA)

> Una aplicación web progresiva (PWA) centrada en la privacidad, sin registro, con restricciones de sorteo del lado del cliente, modo ciego para el organizador e intercambio de códigos QR fuera de línea.

<p align="center">
  <a href="https://kalyelnlaurindo.github.io/Enlaco/#/">
    <img src="https://img.shields.io/badge/Demo_En_L%C3%ADnea-Acceda_Aqu%C3%AD-brightgreen?style=for-the-badge&logo=githubpages&logoColor=white" alt="Demo en Línea" />
  </a>
</p>

<p align="center">
  <b>Idiomas</b><br>
  <a href="./README.md">🇧🇷 Português</a> | 
  <a href="./README.en.md">🇺🇸 English</a> | 
  <a href="./README.fr.md">🇫🇷 Français</a> | 
  <a href="./README.de.md">🇩🇪 Deutsch</a> | 
  <a href="./README.ru.md">🇷🇺 Русский</a>
</p>

---

## 🎯 Descripción General del Proyecto

**Enlaço** es una Aplicación de Página Única (SPA) moderna, receptiva y orientada a dispositivos móviles, diseñada para organizar intercambios de Amigo Invisible sin necesidad de servidores, persistencia de bases de datos, cuentas de usuario o autorización.

El motor se ejecuta completamente en el navegador del usuario, utilizando un algoritmo de sorteo restringido para resolver las exclusiones de emparejamiento. Genera códigos QR compartibles fuera de línea y URLs encriptadas basadas en tokens para que los participantes revelen de manera segura a quién deben regalar, sin revelar las combinaciones a nadie más, incluido el organizador.

---

## 🚀 Características Clave

* **Modo Ciego del Organizador:** El coordinador puede configurar y participar en el sorteo sin arruinar su propia sorpresa. Las combinaciones nunca se muestran en la sesión del coordinador.
* **Transiciones de IU Centradas en Teléfonos Inteligentes:** Las barras laterales de presentación se contraen suavemente y la maqueta virtual del teléfono se desliza hacia el centro de la pantalla.
* **Restricciones de Sorteo Avanzadas:** Configure reglas de exclusión bidirecionables (por ejemplo, evitar que parejas se sorteen entre sí).
* **Distribución Multicanal:** Comparta los resultados individualmente mediante enlaces directos de WhatsApp, correos electrónicos de recuperación o descargando/compartiendo una imagen de cupón con código QR personalizada fuera de línea.
* **100% Capaz de Funcionar Sin Conexión (PWA):** Una vez cargada, la aplicación funciona completamente fuera de línea.

---

## ⚙️ Guía del Desarrollador (Instalación y Verificación)

### Desarrollo Local
Para iniciar el servidor de desarrollo local:
```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo de Vite
npm run dev
```

### Ejecutar Pruebas
```bash
npm run test -- run
```

### Construcción para Producción
```bash
npm run build
```

***

**Autor:** Kalyel Nunes Laurindo / Software Engineer
