# SANDBOX

A personal technical playground for experiments, visualizations and things worth exploring.

> A place to experiment. No finish line.

## Stack
- Web: React, TypeScript, Vite, Tailwind CSS v4, shadcn/ui
- 3D: Three.js, React Three Fiber, Drei
- API: Java 21, Spring Boot
- Persistence: PostgreSQL later, when needed

## Structure
- `apps/web` — frontend
- `apps/api` — Spring Boot backend
- `docs` — architecture and roadmap

## Run locally
Frontend: `cd apps/web && pnpm install && pnpm dev`
Backend: `cd apps/api && ./mvnw spring-boot:run`

API health check: `GET http://localhost:8080/api/health`

See [docs/ROADMAP.md](docs/ROADMAP.md).
