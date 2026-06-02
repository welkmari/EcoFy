# Ecofy

Plataforma de controle financeiro pessoal — entradas, saídas, contas fixas e metas em um só lugar.

## Stack

- [Next.js](https://nextjs.org) 15 (App Router)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) — auth e banco de dados
- [Drizzle ORM](https://orm.drizzle.team)
- [React Query](https://tanstack.com/query)
- [Zod](https://zod.dev)

## Pré-requisitos

- Node.js 18+
- Uma conta e projeto no [Supabase](https://supabase.com)

## Configuração

1. Clone o repositório

```bash
git clone https://github.com/welkmari/EcoFy.git
cd EcoFy
```

2. Instale as dependências

```bash
npm install
```

3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores do seu projeto Supabase:

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string |

4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Veja `.env.example` para a lista completa. Nunca commite o `.env.local`.

## Contribuindo

1. Crie uma branch a partir de `main`
2. Faça suas alterações
3. Abra um Pull Request descrevendo o que mudou e por quê
