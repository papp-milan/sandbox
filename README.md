# Sandbox

<p align="center">
  <strong>A place to experiment.</strong><br />
  Build things, break things, learn something new.
</p>

<p align="center">
  <a href="https://sandbox.pappmilan.com">Live application</a>
  ·
  <a href="docs/ARCHITECTURE.md">Architecture</a>
  ·
  <a href="docs/ROADMAP.md">Roadmap</a>
</p>

---

Sandbox is a personal technical playground for exploring ideas through interactive software. It brings together visual experiments, weather data, games, audio and interactive workflow modelling in one responsive web application.

The project is intentionally evolutionary: experiments can be small and independent, while the platform stays straightforward to run, understand and extend.

## Contents

- [Labs](#labs)
- [Technology](#technology)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Available commands](#available-commands)
- [Backend API](#backend-api)
- [External services and data](#external-services-and-data)
- [CI and deployment](#ci-and-deployment)
- [Project principles](#project-principles)
- [Documentation](#documentation)

## Labs

The application is organized into focused labs. Some are interactive today; others are planned spaces for future experiments.

| Lab | Status | Description |
|---|---|---|
| **Visual Lab** | Available | Explore mathematical surfaces with a 3D function visualizer. Edit expressions, use presets and adjust rendering parameters. |
| **Weather** | Available · Visual Lab | Explore current conditions, forecasts and radar imagery through an interactive weather experience. |
| **Games Lab** | Available | Play strategy games against bots, including Tic-Tac-Toe, Rock Paper Scissors and Battleship. |
| **Auditory Lab** | Available | Listen to SomaFM stations, browse the station explorer and inspect audio through real-time visualizers. |
| **Data Lab** | Planned | Turn raw data into useful, understandable visualizations. |
| **Event Lab** | Planned | Experiment with event streams, Kafka and distributed systems. |
| **AI Lab** | Planned | Explore models, agents, prompts and autonomous workflows. |

The overview also contains a living idea backlog. The set of experiments will change as the project evolves.

## Technology

| Area | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS v4, custom CSS |
| UI and icons | shadcn/ui principles, Lucide |
| 3D and graphics | Three.js, React Three Fiber, Drei, Canvas API |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Actuator |
| Backend build | Maven |
| Frontend package management | npm workspaces |
| Automation | GitHub Actions |
| Hosting | GitHub Pages |

The frontend and backend are independently runnable applications. The backend is a lightweight API foundation; the current interactive labs primarily run in the browser.

## Repository layout

```text
sandbox/
├── .github/
│   └── workflows/          # CI and GitHub Pages deployment
├── apps/
│   ├── web/                # React + TypeScript frontend
│   │   └── src/
│   │       └── components/ # Lab experiences and UI components
│   └── api/                # Spring Boot REST API
│       ├── src/
│       └── pom.xml
├── docs/
│   ├── ARCHITECTURE.md     # Architectural decisions and boundaries
│   └── ROADMAP.md          # Planned platform and lab work
├── package.json            # npm workspace and root scripts
└── README.md
```

## Getting started

### Prerequisites

| Tool | Version | Purpose |
|---|---:|---|
| Node.js | 22 or newer | Frontend tooling |
| npm | Included with Node.js | Install dependencies and run workspace scripts |
| Java JDK | 21 | Run the backend |
| Maven | Compatible with the Spring Boot project | Build and run the API |

### Frontend

Run these commands from the repository root:

```bash
# Install dependencies
npm ci

# Start the Vite development server
npm run dev
```

Vite prints the local development URL in the terminal (typically `http://localhost:5173`).

### Backend

The API is a separate Maven application:

```bash
cd apps/api

# Start the Spring Boot application
mvn spring-boot:run
```

The API runs on `http://localhost:8080` by default.

## Available commands

Run frontend commands from the repository root:

| Command | Description |
|---|---|
| `npm run dev` | Start the frontend development server |
| `npm run build` | Run TypeScript project builds and create the production frontend bundle |
| `npm run typecheck` | Run TypeScript checks |
| `npm run preview` | Preview the production build locally |

Backend commands are run from `apps/api`:

| Command | Description |
|---|---|
| `mvn spring-boot:run` | Start the API locally |
| `mvn test` | Run backend tests |
| `mvn package` | Build the backend JAR |

## Backend API

The backend is built with Java 21 and Spring Boot. It provides the foundation for future server-backed experiments and exposes REST endpoints under the `/api` path.

The health endpoint is:

```http
GET http://localhost:8080/api/health
```

The API is intentionally kept independent of the frontend workspace. Persistent storage, authentication and additional infrastructure should be introduced when a concrete experiment requires them.

## External services and data

Some labs use public services to retrieve live content or data.

| Service | Used for | Website |
|---|---|---|
| SomaFM | Internet radio streams and station metadata | [somafm.com](https://somafm.com) |
| Open-Meteo Forecast API | Weather conditions and forecast data | [open-meteo.com](https://open-meteo.com) |
| Open-Meteo Ensemble API | Ensemble forecast data | [open-meteo.com](https://open-meteo.com) |
| Open-Meteo Geocoding API | Location search | [open-meteo.com](https://open-meteo.com) |
| RainViewer | Weather radar frames and tiles | [rainviewer.com](https://www.rainviewer.com) |
| OpenStreetMap | Map tiles | [openstreetmap.org](https://www.openstreetmap.org) |

These services are accessed by the relevant frontend experiences. Their availability, coverage and usage policies are outside this repository's control. Consult each provider's terms and attribution requirements before extending or redistributing an integration.

## CI and deployment

GitHub Actions automates frontend validation and publishing.

| Workflow | Trigger | What it does |
|---|---|---|
| **Frontend CI** | Pull requests and pushes to `main` or `develop` | Installs dependencies with Node.js 22 and runs the frontend production build. |
| **Deploy GitHub Pages** | Pushes to `main` | Builds the frontend and publishes `apps/web/dist` to GitHub Pages. |

The production application is available at **[sandbox.pappmilan.com](https://sandbox.pappmilan.com)**.

A successful frontend CI run validates the frontend build. The Pages deployment workflow is the separate signal that the production site has been published.

## Project principles

- **Experiment first.** Build small things that make an idea tangible.
- **Keep the architecture understandable.** Prefer a modular application over premature microservices.
- **Add infrastructure when it is needed.** Databases, brokers and workflow engines should solve a real requirement, not create one.
- **Keep labs focused.** Experiments should be independently understandable and maintainable.
- **Make the experience accessible.** Favor responsive layouts, readable typography and clear interaction states.
- **Learn by building.** The platform is allowed to evolve as new interests and technical questions emerge.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — application boundaries and technology decisions.
- [Roadmap](docs/ROADMAP.md) — planned platform and lab experiments.

---

<p align="center">
  <sub>Sandbox · A place to experiment. No finish line.</sub>
</p>
