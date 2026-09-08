# Культурный путеводитель ГЕРОФАРМ

Интерактивный пример сайта корпоративных ценностей.

## Как открыть у себя

Нужны [Node.js](https://nodejs.org/) (LTS) и Git.

```bash
git clone <URL-репозитория>
cd value-book
npm install
npm run dev
```

Откройте в браузере адрес из терминала (обычно `http://127.0.0.1:5173/`).

Сборка без режима разработки:

```bash
npm run build
npm run preview
```

## Стек

Vite + React + TypeScript. Контент: `src/data/book.ts`.
