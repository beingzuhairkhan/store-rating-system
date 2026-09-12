# Store Rating System - Backend

A production-ready NestJS backend for a Store Rating System with JWT authentication, role-based access control, Redis token revocation, and Prisma ORM on PostgreSQL (NeonDB).

## Tech Stack

- **NestJS** + **TypeScript** — API framework
- **PostgreSQL** (NeonDB) — Database
- **Prisma ORM** — Database ORM with migrations
- **JWT** — Authentication
- **Redis** — Token blacklist / revocation
- **bcrypt** — Password hashing
- **class-validator** + **class-transformer** — Request validation

## Prerequisites

- Node.js 18+
- PostgreSQL database (NeonDB or local)
- Redis server

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=1h
   REDIS_URL=redis://localhost:6379
   PORT=3000
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=Admin@123
   ```

3. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```
   For development (creates a new migration):
   ```bash
   npm run prisma:migrate:dev
   ```

5. **Seed the admin account:**
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   npm run start:dev
   ```
   Production:
   ```bash
   npm run build && npm run start:prod
   ```

## Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Full access — manage users, stores, view dashboard stats |
| `USER` | Browse stores, search, rate stores, update own password |
| `STORE_OWNER` | View own store, ratings, and users who rated |

## API Endpoints

All routes are prefixed with `/api`.

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new USER |
| `POST` | `/api/auth/login` | Login (all roles) |
| `POST` | `/api/auth/logout` | Logout (revoke token via Redis) |
| `POST` | `/api/auth/password` | Update password (authenticated) |

### Stores (USER, ADMIN)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stores` | List/search stores (name, address, sort, paginate) |
| `GET` | `/api/stores/:id` | Store details with average rating |
| `POST` | `/api/stores` | Create store (ADMIN only) |

### Ratings (USER)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ratings` | Create or update rating |
| `PUT` | `/api/ratings/:id` | Update own rating |
| `GET` | `/api/ratings/my?storeId=` | Get your rating for a store |

### Store Owner (STORE_OWNER)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/store-owner/store` | View own store + ratings + average |

### Admin (ADMIN)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/users` | Create user (any role) |
| `POST` | `/api/admin/stores` | Create store + assign owner |
| `GET` | `/api/admin/dashboard` | Total users, stores, ratings |
| `GET` | `/api/admin/users` | List users (filter, sort, paginate) |
| `GET` | `/api/admin/stores` | List stores (filter, sort, paginate) |
| `GET` | `/api/admin/users/:id` | User details |
| `GET` | `/api/admin/stores/:id` | Store details with ratings |
| `GET` | `/api/admin/store-owners/:id/rating` | Store owner's average rating |

### Query Parameters for Listing

| Param | Description |
|-------|-------------|
| `name` | Filter by name (partial match) |
| `email` | Filter by email (partial match) |
| `address` | Filter by address (partial match) |
| `role` | Filter by role (users only) |
| `sortBy` | Sort field (`name`, `email`, `address`, `createdAt`, etc.) |
| `sortOrder` | `asc` or `desc` |
| `page` | Page number (default: 1) |
| `limit` | Items per page (default: 10) |

## Response Format

```json
{
  "success": true,
  "message": "Request successful",
  "data": { }
}
```

Error:
```json
{
  "success": false,
  "message": "Description of the error",
  "timestamp": "2026-09-11T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

## Validation Rules

| Field | Rule |
|-------|------|
| `name` | 20–60 characters |
| `address` | Max 400 characters |
| `password` | 8–16 characters, at least 1 uppercase + 1 special character |
| `email` | Valid email format, unique |
| `rating` | Integer 1–5 |

## Project Structure

```
src/
├── main.ts                      # Bootstrap, global pipes/interceptors/filters
├── app.module.ts                # Root module
├── common/
│   ├── decorators/              # @Roles, @CurrentUser, @Public
│   ├── guards/                  # JwtAuthGuard, RolesGuard
│   ├── interceptors/            # Response transform, request logging
│   └── filters/                 # Global exception handler
├── prisma/                      # PrismaService + module
├── redis/                       # Redis token blacklist service
├── auth/                        # Authentication (register, login, logout, password)
├── users/                       # Users service + DTOs
├── stores/                      # Stores + Store Owner endpoints
├── ratings/                     # Ratings CRUD
└── admin/                       # Admin dashboard & management
prisma/
├── schema.prisma                # Prisma schema
├── seed.ts                      # Admin seed script
└── migrations/                  # SQL migrations
```

## Database Schema

```
User (id, name, email, password, address, role, timestamps)
  ├── 1:N Store (owner)     — onDelete: Restrict
  └── 1:N Rating            — onDelete: Cascade

Store (id, name, email, address, ownerId, timestamps)
  └── 1:N Rating            — onDelete: Cascade

Rating (id, userId, storeId, rating, timestamps)
  └── Unique(userId, storeId)
```

## Security Features

- bcrypt password hashing (10 rounds)
- JWT with Redis-based token revocation (blacklisted until expiry)
- Role-based access control via `@Roles()` decorator + `RolesGuard`
- Global `ValidationPipe` with `whitelist` and `transform`
- Passwords never returned in API responses
- `userId`/`ownerId` always taken from JWT, never from client input
- Duplicate ratings prevented at both application and database level
- Prisma errors sanitized — no internal DB details exposed
- CORS configurable via environment
- Request logging on all endpoints
