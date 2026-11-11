# rrm-frontend

Interfața web pentru **Research Resource Manager**: o platformă centralizată pentru gestionarea și rezervarea resurselor de cercetare (echipamente speciale, roboți educaționali, spații de laborator).

Ce oferă aplicația:

- **catalogul de resurse**, cu căutare și filtre;
- **calendarul de disponibilitate** pe zi / săptămână / lună;
- **cereri de rezervare** și **coada de aprobări** (Coordonator Grant, apoi Responsabil Laborator);
- **check-in** la începutul intervalului;
- **notificări**;
- **dashboard-ul de rapoarte** pe granturi.

> API-ul se află în [rrm-backend](https://github.com/student-team-origin/rrm-backend).

## Tehnologii

| Categorie          | Tehnologie                     | Versiune   |
| ------------------ | ------------------------------ | ---------- |
| Framework SPA      | React                          | 18         |
| Limbaj             | TypeScript                     | 5.x        |
| Build / dev server | Vite                           | 5.x        |
| Bibliotecă UI      | Material UI (MUI)              | 6.x        |
| Rutare             | React Router                   | 6.x        |
| Apeluri API        | Axios                          | 1.7        |
| Stare server       | TanStack Query                 | 5.x        |
| Formulare          | React Hook Form + Zod          | 7.x / 3.x  |
| Calendar           | FullCalendar                   | 6.x        |
| Grafice            | Recharts                       | 2.x        |
| Date și ore        | Day.js                         | 1.11       |
| Tipuri API         | openapi-typescript             | 7.x        |
| Testare            | Vitest + React Testing Library | 2.x / 16.x |
| Calitate cod       | ESLint + Prettier              | 9.x / 3.x  |

## Cerințe

- Node.js 20 LTS sau mai nou
- Backend-ul [rrm-backend](https://github.com/student-team-origin/rrm-backend) pornit local, pe portul `8080`

## Pornire locală

```bash
npm install
npm run dev
```

Aplicația rulează la `http://localhost:5173`. Cererile către `/api` sunt redirecționate de Vite (proxy) spre `http://localhost:8080`.

Variabile de mediu, în `.env.local` (nu se pune în git):

```
VITE_API_BASE_URL=/api/v1
```

## Comenzi

| Comandă             | Ce face                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `npm run dev`       | Pornește serverul de dezvoltare                                      |
| `npm run build`     | Build de producție în `dist/`                                        |
| `npm run preview`   | Servește local build-ul de producție                                 |
| `npm run gen:api`   | Generează tipurile TypeScript din `../rrm-backend/docs/openapi.yaml` |
| `npm run lint`      | ESLint                                                               |
| `npm run format`    | Formatează codul cu Prettier                                         |
| `npm run typecheck` | Verificare de tipuri (`tsc --noEmit`)                                |
| `npm run test`      | Teste cu Vitest                                                      |

## Structura proiectului

```
src/
├── api/          client Axios + tipuri generate din OpenAPI
├── features/     reservations, resources, approvals, reports, notifications, auth
├── shared/       componente și utilitare comune
├── routes/       rutare și protejarea paginilor pe roluri
├── theme.ts      tema MUI
└── main.tsx
```

## Contribuție

- Fiecare modificare pornește de la un tichet Jira (`TO-<nr>`).
- Ramurile au forma `feature/TO-<nr>-descriere`. Nu se face push direct pe `main`.
- Commit-urile au forma `feat(functionalitate): TO-<nr> descriere`.
- PR-ul are nevoie de minim 1 aprobare, conține capturi de ecran pentru modificările vizuale și se integrează cu **Squash and merge**.
- Stilul de cod este [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html), împreună cu [Rules of React](https://react.dev/reference/rules).

Regulile complete sunt în [`CLAUDE.md`](CLAUDE.md) și în pagina **Ghid de Dezvoltare** din Confluence.

## Echipa

Vladislav Shorodok · Tudor Baciu · Yaroslav Chernov · Erick
