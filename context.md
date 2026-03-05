JSON Swiss Knife — Implementation Plan
Context

Portfolio project: outil offline-first tout-en-un pour JSON :

Formatter / Minify

Validator (avec erreurs lisibles)

Diff (JSON A vs JSON B)

Schema checker (JSON Schema)

JSON → CSV, CSV → JSON
Bonus :

“Fix JSON cassé” (parsing tolérant)

Support gros fichiers (sans lag)

Stack (cohérent avec tes apps) :

Next.js App Router + React + TypeScript

Tailwind + shadcn/ui

next-intl (EN/FR) + next-themes

State: Zustand

Editor: Monaco (excellent pour gros texte) ou CodeMirror 6 (plus léger)

Heavy work: Web Worker (obligatoire pour “sans lag”)

JSON Schema: Ajv

CSV: PapaParse

Diff: jsondiffpatch (ou custom diff tree)

Tolerant parse: jsonc-parser (JSON with comments / trailing commas) + heuristics

Project Structure

json-swiss-knife/
├── src/
│ ├── app/
│ │ ├── [locale]/
│ │ │ ├── layout.tsx # NextIntlClientProvider + ThemeProvider
│ │ │ ├── page.tsx # Workspace (tabs/tools)
│ │ │ └── schema/page.tsx # Optional separate route
│ │ ├── layout.tsx
│ │ └── globals.css
│ ├── components/
│ │ ├── ui/ # shadcn
│ │ ├── layout/ # Header, AppShell, WorkspaceLayout
│ │ ├── editor/ # JsonEditor, CsvEditor, Toolbar
│ │ ├── validator/ # ErrorList, ErrorMarker
│ │ ├── diff/ # DiffViewer, SideBySideDiff
│ │ ├── schema/ # SchemaEditor, SchemaResults
│ │ ├── convert/ # JsonToCsvPanel, CsvToJsonPanel
│ │ ├── fix/ # FixJsonPanel, FixSuggestions
│ │ └── shared/ # Toasts, LanguageToggle, ThemeToggle, ProgressBar
│ ├── stores/
│ │ ├── workspace-store.ts # active tool/tab, editors content, file meta
│ │ ├── results-store.ts # validation errors, diff output, conversion output
│ │ └── settings-store.ts # indent, sort keys, csv delimiter, etc.
│ ├── lib/
│ │ ├── worker/
│ │ │ ├── index.ts # message router
│ │ │ ├── tasks/
│ │ │ │ ├── format.ts # pretty/minify
│ │ │ │ ├── validate.ts # strict JSON validation
│ │ │ │ ├── tolerant-parse.ts # “fix broken JSON”
│ │ │ │ ├── diff.ts # compute diff model
│ │ │ │ ├── schema.ts # AJV validate
│ │ │ │ ├── json-to-csv.ts # convert
│ │ │ │ └── csv-to-json.ts
│ │ ├── json/
│ │ │ ├── pointer.ts # JSON pointer helpers
│ │ │ ├── sort.ts # stable sort keys
│ │ │ └── stringify.ts # safe stringify with bigints/undefined
│ │ └── utils/
│ │ ├── bytes.ts
│ │ ├── debounce.ts
│ │ ├── download.ts # save as file
│ │ └── storage.ts # local settings
│ ├── hooks/
│ │ ├── useWorkerTask.ts # run task + cancel + progress
│ │ ├── useDropZone.ts
│ │ ├── useKeyboardShortcuts.ts
│ │ └── useVirtualList.ts # for huge error lists/diff
│ └── types/
│ ├── worker.ts # messages, task payloads
│ ├── results.ts
│ └── schema.ts
├── messages/
│ ├── en.json
│ └── fr.json
├── middleware.ts
└── next.config.ts

Key Architecture Decisions
1) Tout ce qui coûte cher → Web Worker

Parse JSON, validate, diff, schema, conversions = worker

UI thread ne fait que :

debounce input

envoyer job

afficher résultats

2) Gros fichiers sans lag

Editeur robuste (Monaco recommandé)

Limiter recalcul:

debounce 300–600ms

cancellation “ignore outdated”

Résultats virtualisés:

liste erreurs (10k+) en virtual list

diff tree lazy-expand (pas tout render)

3) “Fix JSON cassé” = parsing tolérant

Approche en 2 niveaux :

Niveau 1 : jsonc-parser (support commentaires, trailing commas, etc.) + diagnostics

Niveau 2 (bonus) : heuristiques réparatrices :

guillemets manquants (clés)

virgules manquantes (entre objets/array)

quotes simples → doubles

suppression des caractères “garbage” en fin (logs)
➡️ Tu retournes :

fixedText

diagnostics

confidence score + “changes summary”

4) Diff : modèle stable

Pour un rendu pro :

Option A: jsondiffpatch → delta + viewer tree

Option B: diff custom (plus long)
Je conseillerais A pour le portfolio (et focus UX).

5) JSON Schema

Ajv (draft 2020-12 ou 2019-09) + affichage erreurs clair avec JSON pointer.

6) Conversions

JSON→CSV :

flatten objects (dot notation) ou mode “nested as JSON string”

array of objects only (sinon error)

CSV→JSON :

parse PapaParse

infer types optionnel (number, boolean, null)

Implementation Phases
Phase 1 — Foundation

Scaffold Next.js + Tailwind + shadcn/ui + TS

Install deps: zustand, next-intl, next-themes, monaco-editor (ou codemirror), ajv, papaparse, jsondiffpatch, jsonc-parser, zod, uuid

Setup i18n + theme

Workspace UI:

top toolbar (format/minify/validate/diff/schema/convert/fix)

2-pane layout (Editor left, Results right)

useWorkerTask skeleton + worker boot (message router)

DoD

Worker tourne, une tâche simple “format” renvoie un résultat sans freeze.

Phase 2 — Formatter + Validator

Worker task format.ts:

pretty print (indent 2/4)

minify

sort keys (option)

Worker task validate.ts:

strict parse JSON

return errors with line/col

UI:

buttons + keyboard shortcuts (Ctrl+Shift+F format, Ctrl+Enter validate)

ErrorList clickable → jump to line in editor

DoD

JSON invalide → erreurs listées + navigation au bon endroit.

Phase 3 — Diff (JSON A vs JSON B)

Add second editor tab/pane for “JSON B”

Worker diff.ts:

parse both

compute delta via jsondiffpatch

DiffViewer:

tree view expandable

toggle: “side-by-side” / “unified”

Virtualization / lazy rendering:

collapse by default

expand on demand

DoD

Diff sur objets moyens (1–5k lignes) fluide, pas de lag.

Phase 4 — Schema Checker (AJV)

Add schema editor (JSON Schema)

Worker schema.ts:

compile schema (cache by hash)

validate JSON

map ajv errors to pointers + message

SchemaResults:

list errors

highlight path + expected vs received

DoD

Coller un schema + un JSON → verdict + erreurs exploitables.

Phase 5 — JSON↔CSV

Worker json-to-csv.ts:

validate shape (array of objects)

flatten keys (option)

delimiter option (, ; \t)

Worker csv-to-json.ts:

PapaParse

header row required (option)

type inference toggle

Convert panel:

settings + preview first 20 rows

download output .csv / .json

DoD

JSON array → CSV correct ; CSV → JSON correct ; téléchargements OK.

Phase 6 — Bonus: Fix JSON cassé

Worker tolerant-parse.ts (pipeline):

try strict parse → ok => done

else run jsonc-parser to get diagnostics + attempt parse

apply heuristics (configurable) until parse succeeds or max iterations

FixJsonPanel:

show “Fixed JSON” (diff from original)

show “changes summary” (ex: replaced single quotes, added missing commas)

confidence badge

“Apply fix” button → replace editor content

DoD

JSON avec trailing comma / quotes simples / commentaires → réparé et validé.

Phase 7 — Bonus: Gros fichiers sans lag

Monaco config:

disable expensive features when > X MB

keep model markers minimal

Worker progressive:

chunked analysis for huge text (optional)

progress events ({progress: 0..1})

UI:

ProgressBar + cancel job

“Large file mode” banner (debounce bigger, auto-validate off)

Result list virtualization (errors/diff nodes)

DoD

Ouvrir un JSON de plusieurs MB → UI utilisable, pas de freeze.

Verification Checklist

App démarre, EN/FR + dark mode ok

Format → indent correct, minify ok, sort keys ok

Validator → erreurs line/col correctes, click jump editor

Diff → delta correct, viewer fluide

Schema → erreurs AJV affichées avec path

JSON→CSV → export correct + preview

CSV→JSON → types (option) corrects

Fix JSON cassé → repair + apply fix ok

Gros fichier → worker + progress + cancel, UI non bloquée

Offline → fonctionne (tout local)

Risques techniques (et parades)
1) JSON énorme → parse mémoire / temps

Worker obligatoire

“Large file mode” (limite auto-run)

Concurrency 1 job + cancellation ignore outdated

2) Heuristiques “fix” dangereuses

Toujours montrer diff + “confidence”

Ne pas auto-appliquer ; bouton “Apply fix” only

Options de heuristiques togglables

3) Diff gigantesque

Render lazy + collapsed

Limiter expansions

Option “summary only” (counts adds/updates/deletes)

4) CSV ambigu

Type inference toggle + preview

Délimiteur configurable + auto-detect (bonus)

“Portfolio narrative” (pitch)

JSON Swiss Knife est un toolkit offline-first pour formater, valider, comparer, vérifier via JSON Schema, convertir JSON↔CSV, et réparer du JSON “cassé”. Il reste fluide même sur de gros fichiers grâce à un moteur en Web Worker, rendu virtualisé et un mode “large file”.