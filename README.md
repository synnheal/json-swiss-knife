<div align="center">

# JSON Swiss Knife

**The all-in-one JSON toolkit: format, validate, diff, convert, fix, and generate schemas.**

*La boite a outils JSON tout-en-un : formatage, validation, diff, conversion, reparation et generation de schemas.*

[English](#english) | [Francais](#francais)

</div>

---

## English

### What is JSON Swiss Knife?

JSON Swiss Knife is a feature-rich browser-based JSON editor powered by Monaco Editor. Format messy JSON, validate against schemas, diff two documents, convert between JSON and CSV, auto-fix broken JSON, and generate JSON schemas — all in one workspace.

### Features

- **Monaco Editor** — Full-featured JSON editor with syntax highlighting and autocomplete
- **Format & Minify** — Prettify or compress JSON with one click
- **Schema Validation** — Validate JSON against JSON Schema (AJV)
- **JSON Diff** — Compare two JSON documents with visual diff
- **JSON <-> CSV Conversion** — Bidirectional conversion with PapaParse
- **Tolerant Parser** — Auto-fix broken JSON (trailing commas, missing quotes, etc.)
- **Schema Generation** — Infer JSON Schema from your data
- **Web Worker** — Heavy operations run off the main thread
- **Dark / Light Mode** — Theme toggle
- **Bilingual UI** — Full English & French interface

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Editor | Monaco Editor |
| UI | Tailwind CSS 4 + shadcn/ui + Radix UI |
| State | Zustand |
| Validation | AJV + ajv-formats |
| Diff | jsondiffpatch |
| CSV | PapaParse |
| Parser | jsonc-parser |
| i18n | next-intl |

### Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Francais

### Qu'est-ce que JSON Swiss Knife ?

JSON Swiss Knife est un editeur JSON complet dans le navigateur propulse par Monaco Editor. Formatez du JSON brouillon, validez contre des schemas, comparez deux documents, convertissez entre JSON et CSV, reparez du JSON casse, et generez des schemas — tout dans un seul espace de travail.

### Fonctionnalites

- **Editeur Monaco** — Editeur JSON complet avec coloration syntaxique et autocompletion
- **Formatage et Minification** — Embellir ou compresser le JSON en un clic
- **Validation de Schema** — Validez le JSON contre un JSON Schema (AJV)
- **Diff JSON** — Comparez deux documents JSON avec diff visuel
- **Conversion JSON <-> CSV** — Conversion bidirectionnelle avec PapaParse
- **Parseur Tolerant** — Repare automatiquement le JSON casse (virgules finales, guillemets manquants, etc.)
- **Generation de Schema** — Inferez un JSON Schema depuis vos donnees
- **Web Worker** — Les operations lourdes s'executent hors du thread principal
- **Mode Sombre / Clair** — Bascule de theme
- **Interface Bilingue** — Anglais et francais complets

### Demarrage Rapide

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

<div align="center">

**Built with Next.js, TypeScript & Tailwind CSS**

</div>
