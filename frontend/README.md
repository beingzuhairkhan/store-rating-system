# Store Rating System — Frontend

A production-ready React frontend for the Store Rating System, built with Vite, TypeScript, Tailwind CSS, React Router, Axios, React Hook Form, Zod, and TanStack Query.

## Prerequisites

- Node.js 18+
- The NestJS backend running (see backend README for setup)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env.example` to `.env` and set the API URL:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Run the dev server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

## Features

### Authentication
- Single login page for all roles (Admin, User, Store Owner)
- User registration page (normal users only)
- JWT stored in localStorage, auto-attached to Axios requests
- Automatic redirect on 401 responses
- Role-based route protection

### Admin Dashboard
- Platform statistics (total users, stores, ratings)
- User management with search, filter by role, sorting, pagination
- Store management with search, sorting, pagination
- Create new users (any role) and stores (with store owner assignment)
- View user and store details

### User Dashboard
- Browse all stores with search by name and address
- View overall average ratings and personal ratings
- Submit and edit ratings (1–5 stars) with star-rating UI
- Loading skeletons, empty states, and error handling

### Store Owner Dashboard
- View store name, average rating, and total rating count
- See all users who rated the store with their rating and date
- Data scoped to the owner's store only

### Shared
- Change password page with validation
- Toast notifications for success/error feedback
- Confirmation dialogs for destructive actions
- Fully responsive (desktop, tablet, mobile)
- Loading, error, and empty states on every API-driven page

## Tech Stack

| Library | Purpose |
|---------|---------|
| React + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router | Routing |
| Axios | HTTP client |
| React Hook Form + Zod | Forms & validation |
| TanStack Query | Server state / caching |
| Lucide React | Icons |

## Project Structure

```
src/
├── components/
│   ├── ui/              Reusable UI primitives
│   └── ProtectedRoute.tsx
├── layouts/
│   └── DashboardLayout.tsx
├── pages/
│   ├── admin/           Admin pages
│   ├── user/            User pages
│   ├── owner/           Store owner pages
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ChangePassword.tsx
│   └── Unauthorized.tsx
├── services/
│   └── api.ts           Axios client + API functions
├── hooks/
│   ├── useAuth.tsx      Auth context
│   └── useToast.tsx     Toast notifications
├── lib/
│   └── validations.ts   Zod schemas
├── types/
│   └── index.ts         Shared TypeScript types
├── App.tsx              Router + providers
└── main.tsx
```

## API Integration

The frontend expects the following backend endpoints (adjust paths in `src/services/api.ts` if your backend differs):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Login (returns JWT + user) |
| POST | `/auth/register` | User registration |
| PUT | `/auth/change-password` | Change password |
| GET | `/users` | List users (with query params) |
| GET | `/users/:id` | Get user details |
| POST | `/users` | Create user (admin) |
| GET | `/stores` | List stores (with query params) |
| GET | `/stores/:id` | Get store details |
| POST | `/stores` | Create store (admin) |
| POST | `/ratings` | Submit a rating |
| PUT | `/ratings/:storeId` | Update a rating |
| GET | `/admin/stats` | Admin dashboard stats |
| GET | `/owner/dashboard` | Store owner dashboard data |
