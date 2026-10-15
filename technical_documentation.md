# ⚡ Documentație Tehnică: Cyber-Zap Visual Workflow Builder

Această documentație detaliază întregul ciclu de viață al dezvoltării software (SDLC), arhitectura de sistem, deciziile tehnice și specificațiile de implementare pentru aplicația **Cyber-Zap**, construită pe baza ecosistemului **Next.js 16 (App Router)**, **React 19**, **React Flow** și **Prisma ORM**.

---

## 1. Planificare și Cerințe (Planning & Requirements)

### Scopul Proiectului
Dezvoltarea unei platforme moderne de tip *Workflow & Device Flow Builder*, destinată configurării vizuale a fluxurilor operaționale, etapelor de funcționare ale dispozitivelor hardware/IoT și automatizărilor de procese.

### Obiective Cheie
- **Interactivitate Grafică**: Oferirea unui canvas intuitiv de tip drag-and-drop pentru adăugarea, conectarea, repoziționarea și ștergerea nodurilor.
- **Modelare Hibridă de Date**: Stocarea metadatelor relaționale alături de structura topologică JSON a grafului într-o singură bază de date SQLite prin Prisma ORM.
- **Gestionare Multi-Flux (CRUD)**: Posibilitatea utilizatorului de a crea, denumi, salva, vizualiza, actualiza și șterge multiple fluxuri salvate.
- **Design System Cyberpunk**: Utilizarea tehnicilor avansate de Glassmorphism, umbre neon dinamice și culori vii contrastante pe un fundal întunecat abisal.

---

## 2. Arhitectura Sistemului (System Architecture)

Aplicația este structurată pe trei paliere independente și decuplate:

```mermaid
graph TD
    subgraph Client [Client-Side (React 19)]
        UI[UI Navbar & Inspector Panel]
        Canvas[React Flow Engine]
        Modal[Modal Panou Gestionare Fluxuri]
        ClientState[Hook-uri de Stare: Nodes, Edges, WorkflowId, AllWorkflows]
        
        UI <--> ClientState
        Canvas <--> ClientState
        Modal <--> ClientState
    end

    subgraph Server [Backend Server (Next.js 16 Route Handlers)]
        API_Route["/api/workflows (GET, POST, PUT, DELETE)"]
        PrismaClient[Prisma Client Singleton]
        
        API_Route --> PrismaClient
    end

    subgraph Database [Database Layer]
        SQLite[(SQLite Database: dev.db)]
        PrismaClient --> SQLite
    end

    ClientState -- "Fetch / JSON Payloads" --> API_Route
```

---

## 3. Modelul de Date și Persistența (Data Modeling)

Pentru stocarea diagramelor vizuale, am adoptat un **Model Hibrid (Relational + Document)**:
- **Coloane Relaționale**: Asigură interogarea rapidă a fluxurilor (`id`, `name`, `createdAt`, `userId`).
- **Coloana JSON Document (`canvasData`)**: Salvează array-urile complexe de `nodes` și `edges`, pozițiile X/Y, etichetele și culorile specifice fiecărui nod.

```prisma
model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  name      String
  workflows Workflow[]
}

model Workflow {
  id          String   @id @default(uuid())
  name        String   @default("Untitled Zap")
  isPublished Boolean  @default(false)
  canvasData  String   // JSON serializat: { nodes: Node[], edges: Edge[] }
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 4. Specificațiile Endpoint-urilor API (`/api/workflows`)

Fișier de referință: [src/app/api/workflows/route.ts](file:///c:/PORTABLE/dev/projects/FirstReact_project_react/NextJS_Tutorial/cyber-zap/src/app/api/workflows/route.ts)

### 1. `GET /api/workflows`
- **Scop**: Returnează toate fluxurile create de utilizator, sortate descrescător după data adăugării.
- **Răspuns**: `200 OK` cu lista de obiecte `Workflow`.

### 2. `POST /api/workflows`
- **Scop**: Salvează o diagramă nouă în baza de date.
- **Payload**:
  ```json
  {
    "name": "Numele Fluxului",
    "nodes": [ ... ],
    "edges": [ ... ]
  }
  ```
- **Răspuns**: `201 Created` cu obiectul salvat și noul său `id` (UUID).

### 3. `PUT /api/workflows`
- **Scop**: Actualizează un flux existent pe baza `id`-ului său.
- **Payload**: `{ id, name, nodes, edges }`.
- **Răspuns**: `200 OK` `{ "message": "Flux actualizat cu succes!" }`.

### 4. `DELETE /api/workflows`
- **Scop**: Șterge definitiv un flux din baza de date.
- **Payload**: `{ "id": "uuid-flux" }`.
- **Răspuns**: `200 OK` `{ "message": "Flux șters cu succes!" }`.

---

## 5. Arhitectura Frontend și Componentele Interactive

Fișier de referință: [src/app/page.tsx](file:///c:/PORTABLE/dev/projects/FirstReact_project_react/NextJS_Tutorial/cyber-zap/src/app/page.tsx)

### Structura Stării Locale:
- `nodes`, `edges`: Array-urile principale gestionate prin callback-urile native React Flow (`applyNodeChanges`, `applyEdgeChanges`, `addEdge`).
- `selectedNodeId`: ID-ul nodului activ selectat pe canvas. Declanșează afișarea barei superioare de inspector.
- `workflowId`, `workflowName`: Datele fluxului activ încărcat din baza de date.
- `allWorkflows`: Lista tuturor fluxurilor salvate afișată în fereastra modală.
- `showFluxPanel`: Valoare booleană ce controlează vizibilitatea modalului de administrare a fluxurilor.

### Sistemul de Editare în Timp Real:
- **`schimbaTextNod(textNou)`**: Actualizează proprietatea `data.label` a nodului selectat.
- **`schimbaCuloareNod(culoareNoua)`**: Recalculează stilurile CSS inline ale nodului, aplicând automat `border` și `box-shadow` neon corespunzătoare nuanței alese.
- **`stergeBlocSelectat()` / `onNodesDelete()`**: Elimină nodul și filtrează automat conexiunile asociate din array-ul `edges`.

---

## 6. Design System și Estetică (Cyberpunk Glassmorphism)

Toate elementele de interfață respectă regulile de design definite în [src/app/globals.css](file:///c:/PORTABLE/dev/projects/FirstReact_project_react/NextJS_Tutorial/cyber-zap/src/app/globals.css):
- **Glassmorphism**: Fundaluri semitransparente (`rgba(20, 20, 35, 0.85)` și `rgba(15, 15, 30, 0.96)`) suprapuse cu `backdrop-filter: blur(12px)`.
- **Accente Neon**:
  - `Neon Cyan` (`#00f3ff`): Acțiuni primare, titlu principal, noduri de start.
  - `Neon Magenta` (`#ff00ff`): Conexiuni animate, butoane de reset.
  - `Neon Green` (`#00ff88`): Confirmări, salvare cu succes, badge `● Salvat` și `ACTIV`.
  - `Neon Amber` (`#ffcc00`): Avertizări, badge `● Nou / Nesalvat`, actualizare flux.
  - `Neon Coral` (`#ff0055`): Acțiuni distructive (ștergere nod sau ștergere flux).

---

## 7. Verificare și Validare Tehnică

- **Type Safety**: Codul TypeScript este 100% conform (`strict: true`), fără erori de tipare la compilare.
- **Compilare Turbopack**: Comanda `npm run build` rulează cu succes, confirmând generarea optimizată a bundle-ului de producție și a rutelor API dinamice.
