Це сучасна **CRM система для сорсингу кандидатів** (Next.js + shadcn/ui), орієнтована на HR агенції.

## Getting Started

### Локальний запуск (dev)

```bash
npm install

# 1) env
cp .env.example .env

# 2) база (SQLite)
npm run db:push
npm run db:seed

# 3) dev server
npm run dev
```

Відкрий `http://localhost:3000` — за замовчуванням це редірект на `/candidates`.

### Функціонал (MVP)

- **Кандидати**: список + фільтри (стадія/джерело) + деталі
- **Переписки**: читання демо-переписок
- **Kanban**: дошка по стадіях
- **Планувальник**: календар + події по днях
- **AI**: `/ai` → запит + ранжування/пояснення (якщо задано `OPENAI_API_KEY`)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### AI

- **Env**: `OPENAI_API_KEY`
- Якщо ключ не заданий — AI екран працює як “розумна оболонка” над простим пошуком у внутрішній базі.
