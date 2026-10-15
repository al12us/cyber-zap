# ⚡ CYBER-ZAP: Visual Workflow & Device Flow Builder

**Cyber-Zap** este o aplicație web interactivă de ultimă generație pentru proiectarea vizuală a diagramelor de flux, a etapelor de funcționare ale dispozitivelor hardware/IoT și a automatizărilor tip Zapier/Make. Construită pe baza **Next.js 16 (App Router)**, **React 19**, **React Flow** și **Prisma ORM**, aplicația combină performanța modernă cu o estetică **Cyberpunk Glassmorphism**.

---

## 🌟 Funcționalități Cheie

### 1. 🎨 Canvas Interactiv de Fluxuri (React Flow)
- **Noduri interactive & Conexiuni animate**: Creează conexiuni fluide și animate (`Neon Magenta`) între etape.
- **Drag & Drop & Navigare fluidă**: Zoom, pan, controale dedicate (`Controls`) și grid cibernetic de fundal (`Background`).
- **Ștergere rapidă din tastatură**: Selectează un nod sau o conexiune și apasă tasta `Backspace` sau `Delete`.

### 2. 🛠️ Șabloane de Etape & Denumire Personalizată
- **Etape predefinite de dispozitiv**:
  - `Inițializare Senzori` (Neon Cyan)
  - `Calibrare Hardware` (Neon Amber)
  - `Procesare Semnal` (Neon Magenta)
  - `Transmisie Date` (Neon Green)
  - `Validare Output` (Neon Coral)
- **Input personalizat**: Poți selecta o etapă sau poți tasta direct numele dorit pentru bloc, creându-l instantaneu cu stilul și culorile specifice.

### 3. 🎛️ Panou Inspector & Editare Noduri
- La selectarea oricărui nod de pe canvas se deschide automat panoul superior de editare:
  - **Editare Text în timp real**: Modifică denumirea etapei direct.
  - **Color Picker nativ**: Alege orice nuanță dorită; border-ul, textul și efectul de neon glow (`box-shadow`) se actualizează simultan.
  - **Ștergere Bloc**: Buton dedicat pentru eliminarea nodului și a tuturor conexiunilor aferente.

### 4. 📁 Panou Complet de Gestionare a Fluxurilor (Multi-Workflow CRUD)
- **Denumire Flux & Indicator de Stare**:
  - Câmp de editare a numelui diagramei în navbar.
  - Indicator vizual: 🟢 `● Salvat` (flux stocat în baza de date) sau 🟡 `● Nou` (diagramă nouă).
- **Fereastră Modală Cyberpunk**:
  - Vizualizează toate fluxurile salvate în baza de date cu numele și data creării.
  - Marcaj `ACTIV` pentru fluxul curent de pe canvas.
  - Buton **`📂 Încarcă`** pentru comutarea instantanee între fluxuri.
  - Buton **`🗑️ Șterge`** pentru eliminarea oricărui flux salvat din baza de date.
- **Operațiuni rapide în Navbar**:
  - **`💾 Salvează Nou`**: Creează un flux nou în baza de date.
  - **`⚡ Actualizează`**: Suprascrie modificările în fluxul activ curent.
  - **`✨ Nou`**: Resetează canvas-ul pentru a începe o nouă diagramă de la zero.

---

## 🚀 Tehnologii Utilizate

| Tehnologie | Rol în Aplicație |
|---|---|
| **Next.js 16.3 (Turbopack)** | Framework React full-stack, App Router, Route Handlers |
| **React 19 & React DOM** | Librăria de interfață reactivă |
| **React Flow 11** | Motorul vizual de grafuri, noduri și muchii animate |
| **Prisma ORM 5.22** | Acces la baza de date și modelare schemă |
| **SQLite** | Bază de date locală rapidă, fără dependențe externe |
| **TypeScript 5** | Tipare statică strictă pentru întregul flux de date |
| **Vanilla CSS + Glassmorphism** | Design Cyberpunk ultra-modern cu efecte de blur și neon |

---

## 💻 Instalare și Rulare Locală

### 1. Clonare și instalare dependențe
```bash
cd NextJS_Tutorial/cyber-zap
npm install
```

### 2. Configurare Bază de Date (Prisma & SQLite)
Asigură-te că fișierul `.env` conține:
```env
DATABASE_URL="file:./dev.db"
```

Apoi sincronizează schema Prisma:
```bash
npx prisma db push
```

### 3. Pornirea Serverului de Dezvoltare
```bash
npm run dev
```
Aplicația va fi accesibilă în browser la: [http://localhost:3000](http://localhost:3000)

### 4. Verificare Build de Producție
```bash
npm run build
```

---

## 📂 Structura Proiectului

```text
cyber-zap/
├── prisma/
│   ├── dev.db                 # Baza de date SQLite
│   └── schema.prisma          # Modelele User și Workflow (arhitectură hibridă)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── workflows/
│   │   │       └── route.ts   # CRUD API (GET, POST, PUT, DELETE)
│   │   ├── globals.css        # Variabile neon, stiluri globale, glassmorphism
│   │   ├── layout.tsx         # Layout-ul rădăcină Next.js
│   │   └── page.tsx           # Aplicația principală Cyber-Zap (Canvas + UI)
│   └── lib/
│       └── prisma.ts          # Singleton Prisma Client
├── cyber_zap_architecture.md  # Documentația tehnică detaliată
├── package.json
└── README.md
```

---

## 📖 Ghid Rapid de Utilizare

1. **Adăugarea unui nod nou**:
   - Alege o etapă din dropdown sau scrie un nume personalizat în căsuța de text din navbar.
   - Apasă pe **`➕ Adaugă Bloc`** (sau apasă tasta `Enter`).
2. **Conectarea a două noduri**:
   - Trage cu cursorul de la mânerul (punctul circular) unui nod către mânerul altui nod. Conexiunea se va anima automat.
3. **Editarea unui nod**:
   - Dă click pe oricare nod pentru a-l selecta.
   - În bara superioară schimbă eticheta text sau nuanța neon din selectorul de culori.
4. **Salvarea fluxului**:
   - Schimbă numele fluxului din stânga sus (ex: *„Flux Test Senzori v2”*).
   - Apasă pe **`💾 Salvează Nou`**.
5. **Comutarea sau ștergerea fluxurilor**:
   - Apasă pe **`📁 Fluxuri (X)`**.
   - În fereastră poți alege oricare flux existent pentru a-l deschide pe ecran sau îl poți șterge apăsând pe coșul de gunoi.
