# CLAUDE.md — rrm-frontend

Interfața web (SPA) pentru **Research Resource Manager**: platforma de rezervare a resurselor de cercetare (echipamente, roboți, laboratoare). Conține:

- catalogul de resurse;
- calendarul de disponibilitate;
- cereri de rezervare;
- coada de aprobări;
- check-in;
- notificări;
- dashboard de rapoarte.

- Backend: `../rrm-backend` (Java 21 + Spring Boot), API la `http://localhost:8080/api/v1`
- Organizație: https://github.com/student-team-origin
- Confluence (spațiul proiectului): PRD, _Document de Arhitectură_, _Ghid de Dezvoltare_
- Design: wireframe-urile și prototipul din Figma (link în Documentul de Arhitectură)

## Stack

| Rol          | Tehnologie                     |
| ------------ | ------------------------------ |
| Framework    | React 18                       |
| Limbaj       | TypeScript 5 (`strict`)        |
| Build        | Vite 5                         |
| UI           | Material UI (MUI) 6            |
| Rutare       | React Router 6                 |
| HTTP         | Axios 1.7                      |
| Stare server | TanStack Query 5               |
| Formulare    | React Hook Form 7 + Zod 3      |
| Calendar     | FullCalendar 6                 |
| Grafice      | Recharts 2                     |
| Date și ore  | Day.js                         |
| Tipuri API   | openapi-typescript 7           |
| Teste        | Vitest + React Testing Library |
| Calitate     | ESLint 9 + Prettier 3          |

## Surse de adevăr

- **Contractul API este `../rrm-backend/docs/openapi.yaml`.** Tipurile din `src/api/schema.d.ts` se generează din el cu `npm run gen:api`.
  - Nu edita `schema.d.ts` manual.
  - Nu scrie de mână tipuri care există deja în schemă.
  - Dacă lipsește un endpoint, acesta se adaugă întâi în backend (alt tichet sau PR).
- Pentru ecrane și fluxuri urmează prototipul Figma și diagrama de activități din Confluence.

---

## Flux de lucru (obligatoriu)

### 1. Fiecare modificare are un tichet Jira

- Cheia proiectului este **`TO`**. Nu începe nicio modificare de cod fără o cheie de tichet.
- **Dacă utilizatorul nu a dat o cheie Jira, întreabă-l care este, înainte de a crea ramura.** Nu inventa chei.

Tichete existente (din PRD):

| Cheie | Funcționalitate                                                               |
| ----- | ----------------------------------------------------------------------------- |
| TO-1  | Gestiunea sesiunilor și a tokenurilor (60 min inactivitate)                   |
| TO-2  | Autentificare în doi pași (2FA, dispozitiv de încredere 5 zile)               |
| TO-3  | RBAC: Student, Coordonator Grant, Responsabil Laborator, Administrator Sistem |
| TO-4  | Catalog logic de resurse                                                      |
| TO-5  | Motor de rezervare fără suprapuneri (hard lock + buffer time)                 |
| TO-6  | Flux de aprobare configurabil                                                 |
| TO-7  | Check-in prin interfața web și auto-anulare                                   |
| TO-8  | Dashboard de utilizare și grad de ocupare                                     |
| TO-9  | Motor de notificări (e-mail + dashboard)                                      |
| TO-11 | Integrare SSO universitar                                                     |
| TO-17 | Export rapoarte audit (PDF / Excel)                                           |

### 2. Ramuri

- `main` este protejată: **nu face niciodată commit sau push direct pe `main`**. Totul intră prin Pull Request.
- Înainte de o ramură nouă, actualizează `main`: `git switch main && git pull`.
- Format: `<tip>/TO-<nr>-<descriere-scurta-kebab>`
  - `feature/TO-4-pagina-catalog`
  - `fix/TO-7-buton-check-in`
  - `chore/TO-12-configurare-eslint`
- Tipuri de ramură: `feature`, `fix`, `refactor`, `chore`, `docs`, `test`.
- O ramură corespunde unui singur tichet.

### 3. Commit-uri (Conventional Commits + cheia Jira)

```
<tip>(<functionalitate>): TO-<nr> <descriere la imperativ, în română>
```

- `feat(rezervari): TO-5 formular cerere de rezervare`
- `fix(auth): TO-1 redirect la login la sesiune expirată`
- `test(catalog): TO-4 teste pentru filtrare`

Tipuri: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`. Commit-urile sunt mici și coerente, fără `.env`, `dist/` sau secrete.

### 4. Pull Request

- Titlu: `TO-<nr> <Titlul tichetului>`.
- Descrierea conține: link-ul tichetului Jira, **ce** s-a schimbat, **cum** s-a testat și **capturi de ecran** pentru modificările vizuale.
- Este nevoie de minim **1 aprobare**. Comentariile se rezolvă înainte de merge.
- Merge: **Squash and merge**, apoi ramura se șterge.
- După merge: `git switch main && git pull && npm install`, apoi verifici că aplicația pornește.

### 5. Înainte de commit / PR

```bash
npm run lint
npm run format:check     # sau: npm run format
npm run typecheck
npm run test -- --run
npm run build
```

Nu deschide PR dacă vreuna dintre ele eșuează.

---

## Coding style

**Ghiduri:**

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html), pentru limbaj;
- [Rules of React](https://react.dev/reference/rules), pentru componente și hook-uri.

**Verificare automată:**

- ESLint 9 (flat config, `eslint.config.js`) cu `typescript-eslint`, `eslint-plugin-react-hooks` și `eslint-plugin-react-refresh`. Configurația interzice deja `any`, `export default` și importul direct al `axios` în afara `src/api/` — nu le dezactiva cu `eslint-disable`.
- Prettier, cu setările: 2 spații, ghilimele simple, `;`, `printWidth: 100`, `trailingComma: "all"`.

### Limba

- **Codul este în engleză**, cu aceeași terminologie ca în backend: `Reservation`, `Resource`, `Grant`, `Approval`, `Laboratory`, `Notification`.
- **Textele afișate utilizatorului sunt în română**: etichete, mesaje de eroare, mesaje de validare Zod.

### TypeScript

- `"strict": true`. **Fără `any`**; pentru date necunoscute se folosește `unknown`, apoi se îngustează tipul.
- `type` pentru props și obiecte, `interface` doar când trebuie extinsă.
- Tipurile pentru request și response vin din `schema.d.ts` (`components['schemas']['ReservationResponse']`). Pentru utilizare se re-exportă cu alias-uri în `features/<x>/types.ts`.

### Structura (pe funcționalități)

```
src/
├── api/
│   ├── client.ts          apiClient (Axios + interceptori), toApiError()
│   ├── queryClient.ts     QueryClient comun
│   └── schema.d.ts        GENERAT, nu se editează
├── features/
│   └── <feature>/         reservations, resources, approvals, reports, notifications, auth
│       ├── components/    inclusiv pagina, ex. ResourcesPage.tsx
│       ├── hooks/
│       ├── api.ts         funcțiile care apelează endpoint-urile
│       ├── schemas.ts     schemele Zod
│       └── types.ts
├── shared/
│   ├── components/        AppLayout (bară + meniu lateral), NotFoundPage
│   └── utils/             formatDate / formatDateTime (Day.js, locale ro)
├── routes/routes.tsx      toate rutele; paginile noi = rute copil ale AppLayout
├── test/                  setup Vitest + renderWithProviders()
├── theme.ts               tema MUI + culorile și etichetele stărilor
├── App.tsx                providerii (Query, temă) + router
└── main.tsx
```

Codul specific unei funcționalități stă în `features/<feature>`. Ajunge în `shared/` doar când este folosit de cel puțin două funcționalități.

O pagină nouă: componenta în `features/<x>/components/`, ruta în `routes/routes.tsx`, intrarea de meniu în `NAV_ITEMS` din `AppLayout.tsx`.

### Denumiri

| Element            | Convenție                                   | Exemplu                    |
| ------------------ | ------------------------------------------- | -------------------------- |
| Componente         | `PascalCase`, fișier `.tsx` cu același nume | `ReservationForm.tsx`      |
| Hook-uri           | `useX`, `camelCase`                         | `useReservations.ts`       |
| Alte fișiere `.ts` | `camelCase`                                 | `api.ts`, `formatDate.ts`  |
| Props              | `XProps`                                    | `ReservationFormProps`     |
| Handler-e          | `handleX` în componentă, `onX` ca prop      | `handleSubmit`, `onCancel` |
| Constante globale  | `UPPER_SNAKE_CASE`                          | `CHECK_IN_WINDOW_MINUTES`  |
| Teste              | lângă fișier, `.test.tsx`                   | `ReservationForm.test.tsx` |

### Componente React

- Doar componente funcționale cu hook-uri. Exportul este **named**: `export function ReservationForm()`. Fără `export default`, cu excepția paginilor încărcate lazy, dacă e nevoie.
- O singură componentă exportată pe fișier, de regulă sub ~150 de linii. Dacă e mai mare, se împarte sau logica trece într-un hook.
- Fără logică de business în JSX. Calculele se fac în hook-uri sau `utils`.

### Date de la server: TanStack Query

- Datele de la API se citesc cu `useQuery` și se modifică cu `useMutation`. **Nu cu `useEffect` + `useState`.**
- Cheile de query se definesc într-un singur loc per funcționalitate: `reservationKeys.all`, `reservationKeys.list(filters)`.
- După o mutație se invalidează cheile afectate. De exemplu, o cerere nouă reîncarcă calendarul resursei.
- `useState` se folosește doar pentru starea locală a UI-ului (dialog deschis, tab activ).

### HTTP: Axios

- Toate apelurile trec prin `src/api/client.ts`. Componentele nu importă `axios` și nu folosesc `fetch`.
- **Token-ul JWT se păstrează în `sessionStorage`** (TO-1), niciodată în `localStorage` sau cookie scris din JS. Interceptorul de request îl atașează.
- Interceptorul de response tratează **401**: golește `sessionStorage`. Redirect-ul la `/login` se adaugă odată cu pagina de login (TO-1).
- Erorile se citesc cu `toApiError(error)` din `client.ts`, care întoarce `{ code, message, fields? }` (schema `Error`). `fields` (la 400) se pune pe câmpurile formularului cu `setError`; **409** și **422** se afișează ca mesaje clare, nu ca erori generice.

### Formulare: React Hook Form + Zod

- Fiecare formular are o schemă Zod în `schemas.ts`. Tipul se obține cu `z.infer<typeof schema>`.
- Validarea se leagă cu `zodResolver`. Mesajele de validare sunt în română.

### UI: MUI, FullCalendar, Recharts

- Se folosesc componentele MUI și tema din `theme.ts`. **Fără culori sau dimensiuni hardcodate** și fără CSS inline. Pentru ajustări se folosește `sx`, cu valori din temă.
- **Culorile stărilor** se definesc o singură dată în `theme.ts` și se refolosesc în calendar, chip-uri și grafice:
  - resurse: Activă / Mentenanță / Defectă;
  - rezervări: În așteptare / Aprobată / Activă / Respinsă / Anulată.
- Interfața este adaptivă pentru Desktop, Tabletă și Mobil (cerință din PRD). Se folosesc breakpoint-urile MUI.
- Datele și orele se formatează doar prin Day.js, folosind `shared/utils`.

### Rutare

- Rutele sunt definite centralizat în `routes/`. Paginile protejate se înfășoară în `<ProtectedRoute roles={[...]}>`, conform RBAC (TO-3).

### Comentarii și teste

- TSDoc (`/** ... */`) pe hook-urile și funcțiile exportate.
- Testele folosesc Vitest + React Testing Library, cu `renderWithProviders(routes, path)` din `src/test/`, și verifică ce vede utilizatorul (`getByRole`, `getByText`), nu detaliile de implementare.

---

## Comenzi utile

```bash
npm install
npm run dev              # http://localhost:5173 (proxy /api → http://localhost:8080)
npm run gen:api          # regenerează src/api/schema.d.ts din ../rrm-backend/docs/openapi.yaml
npm run lint
npm run format
npm run typecheck
npm run test
npm run build
```
