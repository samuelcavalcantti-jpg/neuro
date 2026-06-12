# 🧠 Mapa da Mente

App interativo de neurociência: trilha de aprendizado, cérebro explorável, cenários
com predição, flashcards, revisão espaçada, treino misto, tutor de IA, mapa de domínio,
conquistas e desafios. Visual dark + liquid glass.

**O seu progresso (XP, níveis, lições, conquistas, domínio, desafios) é salvo automaticamente
no navegador (localStorage) e não se perde** entre as visitas, no mesmo dispositivo/navegador.

---

## 🚀 Como rodar localmente

Precisa do Node.js 18+.

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (geralmente http://localhost:5173).

Para gerar a versão de produção:

```bash
npm run build      # gera a pasta dist/
npm run preview    # testa o build localmente
```

---

## 📦 Subir no GitHub

```bash
git init
git add .
git commit -m "Mapa da Mente"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/mapa-da-mente.git
git push -u origin main
```

---

## ▲ Publicar na Vercel

1. Entre em https://vercel.com e clique em **Add New → Project**.
2. Importe o repositório do GitHub.
3. A Vercel detecta o **Vite** sozinho (Build: `vite build`, Output: `dist`). É só clicar em **Deploy**.

### Ativar o Tutor de IA (opcional)

O modo "Explique com suas palavras" usa a API da Anthropic. Para funcionar no site publicado:

1. Pegue uma chave em https://console.anthropic.com (API Keys).
2. Na Vercel: **Project → Settings → Environment Variables**.
3. Adicione:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** sua chave (`sk-ant-...`)
4. Faça um **Redeploy**.

A chave fica só no servidor (na função `api/tutor.js`) e nunca é exposta no navegador.
Sem a chave, o app funciona normalmente — só o tutor de IA fica indisponível.

> Modelo usado: `claude-3-5-sonnet-latest`. Dá pra trocar em `api/tutor.js`.

---

## 🗂️ Estrutura

```
mapa-da-mente/
├── api/
│   └── tutor.js         # função serverless (Tutor de IA)
├── src/
│   ├── App.jsx          # o app inteiro
│   └── main.jsx         # ponto de entrada
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 💾 Sobre o salvamento das respostas

Tudo é guardado em `localStorage` com a chave `brain_progress`. Para reiniciar o
progresso, use o botão "Reiniciar progresso" no Perfil, ou limpe os dados do site no navegador.
