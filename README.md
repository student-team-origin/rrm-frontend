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
- [pnpm](https://pnpm.io/) 10 sau mai nou: `npm install -g pnpm` (o singură dată). Proiectul **nu** folosește npm, deci nu rula `npm install` (ar crea un `package-lock.json`)
- Backend-ul [rrm-backend](https://github.com/student-team-origin/rrm-backend) pornit local, pe portul `8080`

## Clonare

Contractul API este inclus ca submodul git (`api-contract/`, din [rrm-api-contract](https://github.com/student-team-origin/rrm-api-contract)), deci clonarea se face cu:

```bash
git clone --recurse-submodules https://github.com/student-team-origin/rrm-frontend.git
```

Dacă ai clonat deja fără submodule:

```bash
git submodule update --init
```

După fiecare `git pull`, rulează și `git submodule update`. Build-ul nu are nevoie de backend: tipurile generate (`src/api/schema.d.ts`) sunt în git, iar contractul vine din submodul.

## Pornire rapidă

Aplicația completă se pornește în ordinea: **PostgreSQL → [backend](https://github.com/student-team-origin/rrm-backend#pornire-rapidă) → frontend**. Pornește întâi baza de date și backend-ul după README-ul din rrm-backend, apoi:

```bash
pnpm install
pnpm dev
```

Deschide `http://localhost:5173`: pagina **Catalog resurse** afișează cele 6 resurse din datele de test.

Cererile către `/api` sunt redirecționate de Vite (proxy) spre `http://localhost:8080`, deci nu e nevoie de nicio configurare suplimentară. Opțional, adresa API-ului se poate schimba în `.env.local` (nu se pune în git):

```
VITE_API_BASE_URL=/api/v1
```

Probleme frecvente:

- Pagina afișează „Resursele nu au putut fi încărcate”: backend-ul nu rulează pe portul `8080`.
- Pagina rămâne albă după un `git pull` cu dependențe noi, iar în consola browserului apare `504 (Outdated Optimize Dep)`: oprește `pnpm dev`, pornește-l din nou și reîncarcă pagina.
- `Port 5173 is in use`: un `pnpm dev` pornit anterior (eventual cu cod vechi) rulează încă, iar Vite pornește pe `5174`. Oprește procesul vechi, ca să nu deschizi din greșeală versiunea veche la `5173`.

## Comenzi

| Comandă          | Ce face                                                       |
| ---------------- | ------------------------------------------------------------- |
| `pnpm dev`       | Pornește serverul de dezvoltare                               |
| `pnpm build`     | Build de producție în `dist/`                                 |
| `pnpm preview`   | Servește local build-ul de producție                          |
| `pnpm gen:api`   | Generează tipurile TypeScript din `api-contract/openapi.yaml` |
| `pnpm lint`      | ESLint                                                        |
| `pnpm format`    | Formatează codul cu Prettier                                  |
| `pnpm typecheck` | Verificare de tipuri (`tsc --noEmit`)                         |
| `pnpm test`      | Teste cu Vitest                                               |

## Structura proiectului

```
src/
├── api/          client Axios + tipuri generate din OpenAPI
├── features/     reservations, resources, approvals, reports, notifications, auth
├── shared/       componente și utilitare comune
├── routes/       rutare și protejarea paginilor pe roluri
├── theme.ts      tema MUI
└── main.tsx
api-contract/     submodul git → rrm-api-contract (openapi.yaml)
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
