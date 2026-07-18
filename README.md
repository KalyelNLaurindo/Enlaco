# 🎁 Enlaço — Frontend Web Application

Um sorteador de amigo secreto privado, totalmente responsivo, moderno e seguro. Desenvolvido em **React + TypeScript + Vite + Zustand** com suporte a Progressive Web App (PWA) e empacotamento nativo.

## 🚀 Tecnologias
- **React 18** (Vite + TypeScript)
- **Zustand** (Estado reativo e persistente do Wizard)
- **Vite PWA Plugin** (Instalação off-line e suporte mobile)
- **Vitest & Testing Library** (Foco estrito em TDD)
- **Vanilla CSS** (Fiel aos tokens e layout do Design Brief)

## 📦 Instalação e Desenvolvimento

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Rodar suíte de testes (TDD/Vitest):**
   ```bash
   npm run test
   ```

4. **Compilar para produção (Production Build):**
   ```bash
   npm run build
   ```

## 📂 Estrutura do Código

- `src/domain/types/`: Definições puras de contratos e entidades do domínio.
- `src/validation/schemas/`: Esquemas Zod para validações de participantes e regras de exclusão.
- `src/features/wizard/`: Passos estruturados do fluxo de criação do sorteio (Step 0 a 3).
- `src/features/reveal/`: Mecanismo privado e seguro de revelação de resultados (Tap-to-Reveal).
- `src/test/`: Infraestrutura e utilitários de testes.

## 🛡️ Licença
Este projeto está sob a licença [MIT](LICENSE).
