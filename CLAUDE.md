# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (next/core-web-vitals + next/typescript rules)
```

No test runner is configured yet.

## Architecture

Next.js 14 App Router project with TypeScript (strict mode) and Tailwind CSS.

**Stack:**
- Framework: Next.js 14 with App Router (`app/` directory)
- Styling: Tailwind CSS via PostCSS; CSS variables defined in `app/globals.css` control light/dark theming
- Fonts: Geist Sans and Geist Mono loaded locally via `next/font/local` in `app/layout.tsx`
- Path alias: `@/` maps to the project root

**App Router conventions:**
- `app/layout.tsx` — root layout, wraps all pages; global metadata and font setup live here
- `app/page.tsx` — home route (`/`)
- API routes go under `app/api/<route>/route.ts`
- Nested routes follow the `app/<segment>/page.tsx` pattern

**What's not set up yet:** no database/ORM, no API routes, no component library, no test infrastructure.
# Project: my-crud-app

## Purpose: Ứng dụng CRUD quản lý items, cho phép tạo/đọc/cập nhật/xóa dữ liệu

## Stack: Next.js 14 + Neon

## Conventions: Tailwind only, no inline styles
