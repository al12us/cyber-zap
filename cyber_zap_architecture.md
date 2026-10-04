# ⚡ CyberZap: Documentație Tehnică & Arhitectură

**CyberZap** este o platformă avansată de tip Workflow Builder (o clonă Zapier / Make), construită pentru a oferi utilizatorilor un mediu vizual interactiv unde pot lega "Triggere" de "Acțiuni" folosind o interfață *Drag & Drop*.

> [!NOTE]
> Estetica aleasă este **Dark Mode / Cyberpunk**, bazată pe efecte *Glassmorphism* (ferestre translucide tip sticlă fumurie) și contraste ridicate prin culori *Neon* (Cyan și Magenta).

---

## 1. Arhitectura Sistemului (High-Level)

Sistemul este împărțit într-un Frontend interactiv (randat pe Client) și un Backend securizat (API Routes din Next.js), cuplate la o bază de date relațională cu stocare hibridă.

```mermaid
graph TD
    subgraph Client [Browser Client (React)]
        UI[UI Container: Glassmorphism]
        RF[React Flow Canvas]
        State[Local State: Nodes & Edges]
        
        UI --> RF
        RF <--> State
    end

    subgraph Server [Next.js API (Backend)]
        API_Save[POST /api/workflows]
        API_Load[GET /api/workflows/:id]
    end

    subgraph DB [Database (Prisma + SQLite/Postgres)]
        WorkflowTable[(Table: Workflow)]
    end

    State -- "JSON Payload" --> API_Save
    API_Save --> WorkflowTable
    WorkflowTable --> API_Load
    API_Load -- "Initial Nodes/Edges" --> State
```

---

## 2. Modelul de Date (Abordare Hibridă)

Pentru stocarea diagramelor (Noduri și Conexiuni), am optat pentru o arhitectură **Hibridă**. Structura de bază (relațională) stochează metadatele fluxului, în timp ce logica vizuală din `React Flow` este stocată complet sub formă de JSON.

### Prisma Schema
```prisma
model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  name      String
  workflows Workflow[] // Relație One-to-Many
}

model Workflow {
  id          String   @id @default(uuid())
  name        String   @default("Untitled Zap")
  isPublished Boolean  @default(false)
  
  // Model HIBRID: Stocăm structura vizuală complexă ca un singur document JSON
  canvasData  String   // (În Postgres va fi JSONB, în SQLite e String parsat local)
  
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

> [!TIP]
> **De ce JSON?** `React Flow` folosește date imprevizibile (poziția X/Y, lățimea, metadatele nodurilor). Crearea a 3 tabele relaționale separate pentru `Nodes`, `Edges` și `Handles` ar produce interogări foarte lente. O coloană JSON asigură viteza de citire a întregului flux instantaneu.

---

## 3. Structura Datelor din Frontend (TypeScript)

Pentru a asigura integritatea `canvasData` înainte de a-l trimite la server, am definit interfețele TypeScript care corespund formatului acceptat de **React Flow**.

```typescript
import { Node, Edge } from 'reactflow';

// Tipuri personalizate de Noduri acceptate de aplicație
export type NodeType = 'trigger' | 'action' | 'condition';

// Structura exactă a datelor salvate în coloana 'canvasData'
export interface WorkflowCanvasState {
  nodes: Node<CyberZapNodeData>[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
}

// Metadatele injectate în fiecare nod din platformă
export interface CyberZapNodeData {
  label: string;
  type: NodeType;
  config?: Record<string, any>; // ex: { emailTo: "admin@ro.ro" }
}
```

---

## 4. Estetica și Regulile UI (Glassmorphism)

Toate componentele vizuale trebuie să adere la sistemul de design **Cyberpunk Glass**:

1. **Fundal Global:** `#05050f` (Negru abisal)
2. **Grid Matrix:** `rgba(0, 255, 255, 0.05)`
3. **Componente de suprafață (Panouri):**
   - Background: `rgba(20, 20, 35, 0.4)`
   - Blur: `backdrop-filter: blur(12px)`
   - Border: `1px solid rgba(0, 255, 255, 0.2)`
4. **Acțiuni Principale (Neon Cyan):** `#00f3ff`
5. **Avertismente / Eroare (Neon Magenta):** `#ff00ff`
6. **Acțiuni Secundare / Succes (Neon Green):** `#00ff00`

> [!IMPORTANT]
> Toate nodurile plasate în React Flow (inclusiv conectorii `Handles`) trebuie să aplice clasele sau stilurile specifice efectului *Neon Glow* folosind `box-shadow: 0 0 10px [culoare]`.
