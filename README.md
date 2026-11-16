# SANDBOX

A personal technical playground for experiments, visualizations and things worth exploring.

> A place to experiment. No finish line.

## Stack
- Web: React, TypeScript, Vite, Tailwind CSS v4, shadcn/ui
- 3D: Three.js, React Three Fiber, Drei
- API: Java 21, Spring Boot
- Persistence: PostgreSQL later, when needed
- Package management: npm workspaces

## Structure
- `apps/web` — frontend
- `apps/api` — Spring Boot backend
- `docs` — architecture and roadmap

## Run locally
Install frontend dependencies from the repository root:

```bash
npm install
npm run dev
```

Useful root scripts:
- `npm run build` — build the frontend
- `npm run typecheck` — type-check the frontend
- `npm run preview` — preview the production build

Run the backend (Maven installed):

```bash
cd apps/api && mvn spring-boot:run
```

API health check: `GET http://localhost:8080/api/health`

See [docs/ROADMAP.md](docs/ROADMAP.md).
