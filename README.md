# SweetOps Ice Cream Factory

Inventory Management is a small full-stack application for tracking raw ingredients, finished ice cream products, and inventory movements at an ice cream factory.

## Architecture

The application runs as three Docker Compose services on one Compose network:

- `postgres`: PostgreSQL 16 database with schema and seed scripts mounted into `/docker-entrypoint-initdb.d`
- `backend`: Node.js and Express REST API using the `pg` driver and PostgreSQL service name `postgres`
- `frontend`: React with Vite, served from a separate container and calling the backend API from the browser

Database credentials are only used by the backend container and are not exposed to the React application.

## Directory structure

```text
sweetops-ice-cream-inventory/
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   └── src/
├── backend/
│   ├── Dockerfile
│   └── src/
├── database/
│   └── init/
│       ├── 01-schema.sql
│       └── 02-seed.sql
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

- Docker
- Docker Compose v2

## Start the application

```bash
docker compose up --build
```

Then open:

- React UI: <http://localhost:4317>
- API: <http://localhost:4318>
- API health check: <http://localhost:4318/api/health>

## Containers and ports

| Service | Container name | Host port | Container port |
| --- | --- | ---: | ---: |
| React frontend | `sweetops-frontend` | `4317` | `5173` |
| Express backend | `sweetops-backend` | `4318` | `3000` |
| PostgreSQL | `sweetops-postgres` | `55437` | `5432` |

## Database connection

From the host:

```text
Host: localhost
Port: 55437
Database: ice_cream_inventory
User: sweetops
Password: sweetops_dev_password
```

From containers, use the Compose service name:

```text
Host: postgres
Port: 5432
```

## API endpoints

```text
GET    /api/health

GET    /api/ingredients
GET    /api/ingredients/:id
POST   /api/ingredients
PUT    /api/ingredients/:id
DELETE /api/ingredients/:id

GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/transactions
POST   /api/transactions

GET    /api/dashboard
```

## Seed data

PostgreSQL automatically runs scripts in `database/init/` only the first time the database volume is created:

1. `01-schema.sql` creates ingredients, products, inventory transaction tables, constraints, indexes, foreign keys, and update triggers.
2. `02-seed.sql` inserts realistic ingredients, finished products, low-stock examples, and recent inventory transactions.

## Stop the application

```bash
docker compose down
```

## Reset and reseed PostgreSQL

To completely remove the database volume and rerun the initialization scripts:

```bash
docker compose down -v
docker compose up --build
```

## Local npm scripts

Each app can also be run directly after installing dependencies:

```bash
cd backend
npm install
npm run dev
npm start
npm test
```

```bash
cd frontend
npm install
npm run dev
npm run build
npm start
npm test
npm run test:e2e
```

## Testing strategy

The repository uses a layered test strategy:

- Backend unit tests use Node's built-in test runner and live in `backend/src/__tests__/`.
- Frontend unit tests use Vitest plus Testing Library and live in `frontend/src/__tests__/`.
- End-to-end coverage uses Playwright specs in `frontend/tests/e2e/`.

Run tests with:

```bash
cd backend && npm test
```

```bash
cd frontend && npm test
```

```bash
cd frontend && npm run test:e2e
```

For e2e runs, ensure the app is running first, for example with `docker compose up --build`.

