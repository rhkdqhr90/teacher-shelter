# Next.js Production Boilerplate

Production-ready Next.js boilerplate for universal web applications (SaaS, E-commerce, Content sites, Admin tools).

## 🚀 Features

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui + CVA + clsx
- **State Management**: Zustand 5 (client state) + TanStack Query 5 (server state)
- **HTTP Client**: Axios 1.7+ with interceptors and token refresh queue
- **Forms**: React Hook Form 7 + Zod 3.24+ validation
- **Authentication**: Auth.js v5 (OAuth + Credentials) - **Coming in Phase 2**
- **Internationalization**: next-intl 4 (English + Korean)
- **Testing**: Vitest 2 + Testing Library 16 + Playwright 1.49+
- **Code Quality**: ESLint 9 (flat config) + Prettier 3 + Husky 9 + Commitlint 19
- **Environment**: @t3-oss/env-nextjs with Zod validation
- **Deployment**: Docker (multi-stage) + GitHub Actions CI/CD

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router (routing only)
│   ├── (auth)/             # Auth route group
│   ├── (dashboard)/        # Protected route group
│   └── api/                # API Route Handlers
├── components/
│   ├── ui/                 # shadcn/ui atomic components
│   ├── common/             # Shared layouts (Header, Footer, Sidebar)
│   └── forms/              # React Hook Form integrated components
├── features/[name]/        # Domain-specific modules
│   ├── components/         # Feature components
│   ├── hooks/              # Feature hooks (useQuery/useMutation wrappers)
│   ├── services/           # API call functions
│   └── types/              # Zod schemas + type inference
├── hooks/                  # Shared custom hooks
├── lib/                    # Core utilities (api-client, utils)
├── providers/              # React Context Providers
├── stores/                 # Zustand stores
├── config/                 # Configuration (env, i18n)
├── types/                  # Shared TypeScript types
├── middleware.ts           # Auth guard + Security headers
└── styles/                 # Global CSS
```

## 🏁 Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- npm 9.0.0 or higher

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nextjs-boilerplate
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and fill in your values
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📜 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests with Vitest
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI

## 🏗️ Architecture Decisions

### State Management Strategy

| Data Type | Tool | Example |
|---|---|---|
| Server data (API responses) | TanStack Query | User lists, posts |
| Global UI state | Zustand | Sidebar, modal, theme, toast |
| Component local state | useState/useReducer | Toggles, counters |
| Form state | React Hook Form | Login form, register form |
| URL state | Next.js searchParams | Filters, pagination |

### Coding Rules

1. **TypeScript**: `strict: true`, no `any`, use Zod for validation
2. **React**: Default to Server Components, `'use client'` only when needed
3. **Styling**: Use `cn()` utility, CVA for variants, mobile-first
4. **Testing**: 70%+ coverage target
5. **Commits**: Conventional commits (feat/fix/docs/refactor/test/chore)

## 🔒 Security

- Security headers configured in `next.config.ts`
- Environment variable validation with Zod
- CSRF protection via Auth.js (Phase 2)
- Token refresh with request queuing
- No sensitive data in client-side code

## 🐳 Docker Deployment

Build and run with Docker:

```bash
# Build image
docker build -t nextjs-boilerplate .

# Run container
docker run -p 3000:3000 nextjs-boilerplate

# Or use docker-compose
docker-compose up
```

## 📝 Development Status

### Phase 1: Foundation ✅ COMPLETED
- ✅ Next.js 15 + TypeScript + Tailwind v4
- ✅ Folder structure (feature-sliced design)
- ✅ ESLint + Prettier + Husky + Commitlint
- ✅ Environment variable validation
- ✅ Global CSS + design tokens
- ✅ Root layout + Providers
- ✅ Error/Loading/NotFound pages
- ✅ Health check API
- ✅ Docker + GitHub Actions CI/CD
- ✅ i18n (English/Korean)
- ✅ UI components (Button, Input)
- ✅ Axios client with interceptors
- ✅ Zustand app store
- ✅ Custom hooks (useDebounce, useMediaQuery)

### Phase 2: Authentication System 🔲 NEXT
- Auth.js v5 configuration
- OAuth providers (Google, GitHub)
- Credentials provider
- Protected routes
- User profile dropdown

### Phase 3-6: Coming Soon
See `TASK-TRACKER.md` for full roadmap.

## 📚 Documentation

- [Development Guide](./DEVELOPMENT-GUIDE.md) - Detailed coding patterns and best practices
- [PRD](./prd-nextjs-boilerplate.docx) - Product requirements document
- [Task Tracker](./TASK-TRACKER.md) - Phase-by-phase task checklist

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ by the Development Team**
