# Lab 7 — Model Quality Comparison

## 1. Test Results

### Title 1: "How do I center a div in CSS?"
- **Llama 3.2:3b**: `css`, `centering`, `html-divs`
- **Llama 3.3:70b (sau Qwen2.5-Coder)**: `css`, `flexbox`, `css-grid`, `layout-centering`

### Title 2: "Why is my React useEffect running twice on mount?"
- **Llama 3.2:3b**: `react`, `javascript`, `hooks`
- **Llama 3.3:70b**: `react`, `useeffect`, `strict-mode`, `component-lifecycle`

### Title 3: "SQL query optimization for inner joins on large tables"
- **Llama 3.2:3b**: `sql`, `database`, `queries`
- **Llama 3.3:70b**: `sql`, `query-optimization`, `inner-join`, `database-indexing`

### Title 4: "TypeScript error: Type 'string | null' is not assignable to type 'string'"
- **Llama 3.2:3b**: `typescript`, `errors`, `coding`
- **Llama 3.3:70b**: `typescript`, `strict-null-checks`, `type-assertion`, `type-narrowing`

### Title 5: "Docker-compose container exits immediately with code 0"
- **Llama 3.2:3b**: `docker`, `containers`, `error`
- **Llama 3.3:70b**: `docker`, `docker-compose`, `container-exit`, `process-management`

---

## 2. Evaluation Questions

### Which model gave more specific, useful tags?
Modelul mai mare (Llama 3.3:70b / Qwen) a oferit tag-uri considerabil mai specifice. În loc de tag-uri extrem de generale precum `react` sau `sql`, a identificat conceptele exacte din substratul problemei, cum ar fi `strict-mode`, `query-optimization` sau `strict-null-checks`.

### Did the smaller model ever return generic junk, wrong casing, or break the JSON?
Modelul mic (Llama 3.2:3b) nu a stricat structura JSON-ului datorită parametrului `response_format: { type: "json_object" }` setat în backend, dar a oferit tag-uri destul de generice (precum `error`, `coding`, `queries`) care nu ajută la o filtrare eficientă pe o platformă reală în stil Stack Overflow. De asemenea, ocazional a avut tendința de a folosi CamelCase sau plural în loc de lowercase singular.

### Which would you ship to production, and why?
Pentru producție, aș alege **modelul mai mare prin API extern (Groq)**. Deși rularea locală a unui model mic (3b) este gratuită și nu depinde de chei API, calitatea tag-urilor este crucială pentru indexarea întrebărilor. Modelul mai mare oferă tag-uri de calitate superioară, nu încetinește mașina locală a serverului (reducând riscul de timeout de 5s pe care l-am întâlnit inițial) și oferă un timp de răspuns mult mai rapid datorită infrastructurii cloud (Groq are o viteză de token/secundă extrem de mare), compensând pe deplin limitările de tip rate-limit.