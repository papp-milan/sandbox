# Architecture

Sandbox starts as a small monorepo with two independently runnable applications: `apps/web` (React + TypeScript) and `apps/api` (Spring Boot). The system remains a modular monolith: no microservices, Kubernetes, broker or database until an experiment needs one.

## Web
Vite, Tailwind CSS v4, shadcn/ui as-needed, React Three Fiber and Drei for 3D experiments.

## API
Java 21, Spring Boot and REST endpoints under `/api`. PostgreSQL can be introduced when durable data is required.

## Deferred
Kafka, Camunda, PostgreSQL, authentication and deployment automation.
