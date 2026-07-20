<p align="center">
  <img src="./src/assets/logo.png" alt="Enlaço Logo" width="128" height="128" style="border-radius: 28px; box-shadow: 0 8px 24px rgba(108, 99, 255, 0.3);" />
</p>

# Enlaço — Organizador de Amigo Secreto Descentralizado (SPA)

> Um Progressive Web App (PWA) focado em privacidade, sem necessidade de login, com restrições de sorteio no lado do cliente, modo cego para o organizador e compartilhamento offline de códigos QR.

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
  <a href="https://www.npmjs.com/package/qrcode">
    <img src="https://img.shields.io/badge/QRCode-1.5-blueviolet" alt="QRCode" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
  </a>
  <a href="https://vite-pwa-org.netlify.app/">
    <img src="https://img.shields.io/badge/PWA-Ready-orange?logo=pwa&logoColor=white" alt="PWA" />
  </a>
  <a href="https://vitest.dev/">
    <img src="https://img.shields.io/badge/Vitest-1.6-729B1B?logo=vitest&logoColor=white" alt="Vitest" />
  </a>
</p>

<p align="center">
  <b>Outros Idiomas / Other Languages</b><br>
  <a href="./README.en.md">🇺🇸 English</a> | 
  <a href="./README.es.md">🇪🇸 Español</a> | 
  <a href="./README.fr.md">🇫🇷 Français</a> | 
  <a href="./README.de.md">🇩🇪 Deutsch</a> | 
  <a href="./README.ru.md">🇷🇺 Русский</a>
</p>

---

## 🎯 Visão Geral do Projeto

**Enlaço** é uma Single Page Application (SPA) moderna, responsiva e focada em dispositivos móveis, projetada para orquestrar sorteios de Amigo Secreto sem exigir servidores, persistência de banco de dados, contas de usuário ou autorizações de qualquer tipo.

O motor do sorteio roda inteiramente no navegador do usuário, utilizando um algoritmo de busca com retrocesso (backtracking) para resolver restrições e exclusões. Ele gera códigos QR compartilháveis offline e URLs criptografadas baseadas em tokens para que os participantes revelem com segurança seus respectivos destinatários, sem expor os pares a ninguém (nem mesmo ao organizador).

---

## 🚀 Recursos Principais

* **Modo Cego do Organizador:** O coordenador pode configurar e participar do sorteio sem estragar sua própria surpresa. Os pares gerados são encriptados e nunca ficam visíveis na sessão do organizador.
* **Transições de Interface para Smartphones:** As seções de apresentação lateral colapsam suavemente no desktop, centralizando o mockup interativo de smartphone para foco total na experiência de uso.
* **Restrições Avançadas de Sorteio:** Defina regras de exclusão bidirecionais (ex: evitar que cônjuges ou familiares próximos tirem uns aos outros).
* **Distribuição Multicanal:** Compartilhe resultados individualmente via links de WhatsApp pré-formatados, e-mails de recuperação ou baixando cupons contendo o QR Code offline personalizado.
* **100% Offline (PWA):** Após carregar a página pela primeira vez, toda a configuração, sorteio e exportação de cupons funcionam sem qualquer acesso à internet.

---

## 🛠️ Stack Tecnológica & Dependências

* **React (v18.3.1) & React-DOM (v18.3.1):** Biblioteca de componentes reativos e renderização virtual.
* **TypeScript (v5.6.2):** Tipagem estática e modelagem de domínio robusta.
* **React Router DOM (v7.18.1):** Roteador SPA local utilizando `HashRouter` para compatibilidade total com o GitHub Pages.
* **Zustand (v5.0.14):** Armazenamento de estado para rascunhos, participantes e regras locais persistidos no `localStorage`.
* **Zod (v4.4.3):** Validador de esquemas para validação de dados em tempo de execução.
* **qrcode (v1.5.4):** Geração dinâmica de QR Codes desenhados em canvas 2D para download em PNG.
* **Vite (v5.4.10) & Vite Plugin PWA (v1.3.0):** Compilador de assets e empacotador de Progressive Web App.
* **Vitest (v1.6.0) & @testing-library/react (v16.3.2):** Ferramentas de testes para suporte à metodologia TDD.

---

## 🧭 Estrutura de Diretórios

```
src/
├── assets/                  # Logos, ícones e assets de marca da aplicação
├── components/              # Componentes globais compartilhados (ex: seletor de idioma)
├── domain/                  # Lógica de domínio pura
│   ├── services/            # Serviços puramente lógicos (criptografia, sorteador, i18n)
│   └── types/               # Contratos e tipos do TypeScript
├── features/                # Fluxos de negócios autossuficientes
│   ├── dashboard/           # Painel de controle do organizador (histórico, exportação de auditoria)
│   ├── landing/             # Tela inicial e contêiner da transição mobile
│   ├── reveal/              # Tela de revelação do participante
│   └── wizard/              # Passos de criação (detalhes, participantes, exclusões, revisão)
│       └── components/      # Componentes internos dos passos e tela de sucesso
├── test/                    # Configurações globais de testes unitários
├── App.tsx                  # Ponto de entrada de rotas com HashRouter
└── main.tsx                 # Inicialização da aplicação
```

---

## 📖 Guia de Uso: Como Funciona

### 1. Detalhes do Evento
Defina o nome do evento, orçamento médio recomendado, data e descrição. Selecione se deseja ativar o **Modo Cego** e inclua um e-mail de recuperação para rascunhos.

### 2. Cadastro de Participantes & Canais
Adicione o nome de cada participante e a forma de entrega de sua revelação:
* **Link de WhatsApp:** Abre um link com mensagem pronta.
* **E-mail de Recuperação:** Facilita o envio das credenciais.
* **QR / Presencial:** Gera um QR Code diretamente na tela para ser escaneado na hora.

### 3. Configuração de Exclusões
Crie restrições para o sorteio. Por exemplo, se "Alice" e "Bob" formam um casal, crie uma regra de exclusão para que não possam se sortear mutualmente. O algoritmo trata essas restrições automaticamente.

### 4. Revisão e Sorteio
Valide os dados do grupo e clique em **"Sortear"**. Uma animação simula o embaralhamento enquanto gera tokens criptográficos seguros e individuais para cada participante.

### 5. Compartilhar Resultados
Na tela final de sucesso, clique em **"Compartilhar QR Codes"** para:
* Utilizar o link do WhatsApp.
* Baixar um cupom em imagem PNG com a logo do evento, nome do destinatário e QR Code para envio offline.

### 6. Revelação (Tap-to-Reveal)
Quando o participante abrir o link ou escanear o QR Code correspondente:
1. Ele será levado a uma página contendo um envelope digital de presente.
2. Ao clicar, o envelope se abre com efeitos visuais.
3. O token da URL é decodificado localmente no navegador dele, revelando quem ele tirou no sorteio.

---

## ⚙️ Guia do Desenvolvedor (Instalação & Execução)

### Desenvolvimento Local
Para iniciar o servidor de desenvolvimento com recarregamento em tempo real (HMR):
```bash
# Instalar dependências do npm
npm install

# Iniciar servidor local Vite
npm run dev
```
Abra `http://localhost:5173/` no navegador.

### Testes Unitários (TDD)
Para rodar toda a suíte de testes do projeto:
```bash
# Executa os testes no modo CI
npm run test -- run
```

### Validações de Sintaxe & Tipagem
```bash
# Verificação estática do TypeScript
npx tsc --project tsconfig.app.json --noEmit

# Análise de padrões com ESLint
npm run lint
```

### Build de Produção
```bash
# Gera o build final otimizado na pasta dist/
npm run build

# Pré-visualiza localmente o build estático
npm run preview
```

---

## 🛡️ Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para obter detalhes.

***

**Autor:** Kalyel Nunes Laurindo / Software Engineer
