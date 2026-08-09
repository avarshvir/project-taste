# Project Taste

Project Taste is a fast, private, browser-based developer toolbox. It brings common developer utilities into one clean web application so developers do not have to jump between many random websites for formatting, encoding, decoding, generating, validating, and inspecting data.

The long-term goal of Project Taste is to provide more than 150 useful tools for developers, testers, DevOps engineers, students, technical writers, and API teams. The current registry contains 127 planned tools across 17 categories, with 40 tools already marked as ready and 87 tools marked as coming soon.

Tagline: A little taste of the perfect toolkit.

## Live Link

[Link](avarshvir.github.io/project-taste/)

## What Is Project Taste?

Project Taste is a static web application built with HTML, CSS, and JavaScript. It runs directly in the browser and is designed around privacy-first utility work:

- Format, validate, convert, inspect, and generate developer data.
- Keep sensitive data local whenever possible.
- Provide quick access through search, sidebar navigation, favorites, recent tools, and a command palette.
- Work without a backend server or user account.
- Organize many small tools into a single developer-friendly interface.

Project Taste is useful when you need a quick tool for JSON, text, encoding, JWTs, SQL, config files, colors, networking, DevOps references, diagrams, AI prompt utilities, and more.

## Problem Statements

Developers often lose time switching between many disconnected utility websites for small tasks such as formatting JSON, decoding JWTs, generating UUIDs, comparing text, or validating YAML.

Many online tools require users to paste sensitive content into third-party websites, creating privacy and security concerns for API tokens, credentials, logs, payloads, customer data, and internal configuration files.

Common developer utilities are often cluttered with ads, tracking scripts, slow pages, confusing layouts, or unnecessary signup flows.

Teams need a single, reliable, easy-to-extend toolkit where utilities are grouped logically and can be opened quickly.

Students and beginners need simple tools that explain common developer formats and workflows without forcing them to install heavy software.

Project Taste solves these problems by providing a unified, lightweight, local-first developer toolbox with a growing catalog of 150+ planned tools.

## Key Features

- Browser-based static app with no backend required.
- Tool registry stored in `data/tools.json`.
- Individual tools live in `tools/<tool-id>.html`.
- Dynamic sidebar grouped by category.
- Global search and sidebar filtering.
- Favorites and recently used tools.
- Hash-based routing for direct links to tools.
- Command palette with `Ctrl + K`.
- Light and dark theme support.
- Shared utility helpers for clipboard, download, storage, drag and drop, debounce, and toast messages.
- Privacy-first design: tool input is processed in the browser.

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons
- Google Fonts: Inter and JetBrains Mono

No framework, bundler, database, or backend server is required.

## Project Structure

```text
project-taste/
  assets/
    css/
      components.css
      palette.css
      style.css
      theme.css
      tools.css
    js/
      router.js
      sidebar.js
      theme.js
      utils.js
  data/
    tools.json
  tools/
    base64.html
    case-converter.html
    json-formatter.html
    ...
  doc.html
  index.html
  json-escape.html
  README.md
```

## How To Run

Because the app fetches `data/tools.json`, run it through a local static server.

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

You can also use any static server, such as VS Code Live Server, `npx serve`, or a normal web hosting platform.

## How To Use The Application

1. Open `index.html` through a local server.
2. Use the left sidebar to browse tool categories.
3. Use the global search box to find a tool quickly.
4. Press `Ctrl + K` to open the command palette.
5. Open a tool, paste or type input, and use the tool controls.
6. Mark frequently used tools as favorites.
7. Use `doc.html` for tool documentation and the full catalog.

## Current Status

- Current version: `0.1.0`
- Current registered tools: `127`
- Ready tools: `40`
- Coming soon tools: `87`
- Current categories: `17`
- Product goal: `150+` tools

## Tool Catalog

Status labels:

- `Ready`: implemented or available in the current project.
- `Coming soon`: planned in the registry and part of the roadmap.

### Text & String

| Tool | Status | What It Does |
| --- | --- | --- |
| Text Diff | Ready | Compares two text blocks and highlights differences. |
| Case Converter | Ready | Converts text to uppercase, lowercase, title case, camelCase, snake_case, and other case styles. |
| Remove Duplicate Lines | Ready | Removes repeated lines and keeps unique lines. |
| Remove Empty Lines | Ready | Deletes blank lines from a block of text. |
| Reverse Text | Ready | Reverses characters, words, or line order. |
| Sort Lines | Ready | Sorts lines alphabetically, numerically, or in reverse order. |
| Word Counter | Ready | Counts words, sentences, and reading time. |
| Character Counter | Ready | Counts characters, bytes, whitespace, and related text metrics. |
| Slug Generator | Ready | Converts text into clean URL slugs. |
| Random Text Generator | Ready | Generates random words, sentences, or placeholder text. |

### JSON

| Tool | Status | What It Does |
| --- | --- | --- |
| JSON Formatter | Ready | Pretty-prints and indents messy JSON. |
| JSON Validator | Ready | Validates JSON and identifies syntax errors. |
| JSON Escape / Unescape | Ready | Escapes and unescapes JSON strings for APIs, Postman, and config files. |
| JSON Pretty Print | Ready | Displays JSON in a readable indented format. |
| JSON Minify | Ready | Removes whitespace to reduce JSON payload size. |
| JSON Compare | Ready | Compares two JSON objects structurally. |
| JSON to CSV | Ready | Converts JSON arrays into CSV tables. |
| JSON to YAML | Ready | Converts JSON documents into YAML. |
| JSON Path | Ready | Queries JSON data using JSONPath expressions. |

### Data & Config

| Tool | Status | What It Does |
| --- | --- | --- |
| XML Formatter | Ready | Beautifies and validates XML documents. |
| YAML Validator | Ready | Validates YAML and reports indentation or syntax issues. |
| TOML Formatter | Ready | Formats and tidies TOML configuration files. |
| CSV Viewer | Ready | Displays CSV data in a clean sortable grid. |
| SQL Formatter | Ready | Beautifies SQL queries with readable indentation. |
| SQL Query Formatter | Ready | Formats SQL queries for multiple SQL dialects. |
| SQL to JSON | Ready | Converts SQL result-style data into JSON. |
| SQL Explain Visualizer | Ready | Visualizes SQL EXPLAIN query plans. |

### Encoding

| Tool | Status | What It Does |
| --- | --- | --- |
| Base64 | Ready | Encodes and decodes text and images as Base64. |
| URL Encode | Ready | Encodes and decodes URL components. |
| HTML Encode | Ready | Escapes and unescapes HTML entities. |
| Unicode | Ready | Inspects, escapes, and unescapes Unicode code points. |
| JWT Decoder | Ready | Decodes the header, payload, and signature of a JWT. |
| JWT Generator | Ready | Builds and signs JWTs with custom claims. |
| JWT Inspector | Ready | Inspects JWT claims, algorithms, and token structure. |
| JWT Expiry Calculator | Ready | Calculates JWT expiration time and remaining validity. |
| JWT Payload Editor | Ready | Edits a JWT payload and re-encodes it instantly. |

### Crypto & Keys

| Tool | Status | What It Does |
| --- | --- | --- |
| PEM Key Viewer | Ready | Inspects PEM certificates and key details. |
| SSH Key Generator | Ready | Generates SSH key pairs in the browser. |

### Hashing

| Tool | Status | What It Does |
| --- | --- | --- |
| MD5 | Coming soon | Computes MD5 digests for text or files. |
| SHA1 | Coming soon | Computes SHA-1 hashes. |
| SHA256 | Coming soon | Computes SHA-256 hashes. |
| SHA512 | Coming soon | Computes SHA-512 hashes. |
| CRC32 | Coming soon | Computes CRC32 checksums. |
| HMAC Generator | Coming soon | Generates keyed HMAC signatures. |

### Generators

| Tool | Status | What It Does |
| --- | --- | --- |
| UUID | Ready | Generates v4 UUIDs in bulk. |
| UUID Inspector | Coming soon | Decodes UUID version and variant information. |
| Nano ID | Coming soon | Generates compact URL-safe Nano IDs. |
| Password | Ready | Generates strong customizable passwords. |
| API Key | Coming soon | Generates secure random API keys. |
| Random Number | Coming soon | Generates random numbers within a selected range. |
| Fake User | Coming soon | Generates realistic fake user profiles for testing. |
| Lorem Ipsum | Coming soon | Generates classic placeholder text. |
| Color Palette | Coming soon | Generates harmonious color palettes. |
| .env Generator | Coming soon | Builds `.env` files from key/value pairs. |

### Web / CSS

| Tool | Status | What It Does |
| --- | --- | --- |
| HTML Formatter | Coming soon | Beautifies and indents HTML markup. |
| CSS Beautifier | Coming soon | Formats and tidies CSS code. |
| JS Beautifier | Coming soon | Beautifies minified or messy JavaScript. |
| CSS Minifier | Coming soon | Minifies CSS to reduce file size. |
| JS Minifier | Coming soon | Minifies JavaScript for production. |
| HTML Minifier | Coming soon | Compresses HTML markup. |
| CSS Grid Generator | Coming soon | Visually builds CSS grid layouts. |
| Flexbox Generator | Coming soon | Generates flexbox layouts visually. |
| GraphQL Query Beautifier | Coming soon | Formats and indents GraphQL queries. |
| CSS Variable Extractor | Coming soon | Extracts CSS custom properties from code. |
| CSS Clamp Generator | Coming soon | Builds fluid responsive `clamp()` values. |
| Tailwind Playground | Coming soon | Provides a live playground for Tailwind utility classes. |

### Colors

| Tool | Status | What It Does |
| --- | --- | --- |
| HEX to RGB | Coming soon | Converts between HEX, RGB, and HSL color formats. |
| Gradient Generator | Coming soon | Creates CSS linear and radial gradients. |
| Shadow Generator | Coming soon | Designs box-shadow and text-shadow values. |
| Glassmorphism Generator | Coming soon | Generates frosted-glass CSS effects. |
| Neumorphism Generator | Coming soon | Generates soft neumorphic shadow styles. |
| Tailwind Color Picker | Coming soon | Helps pick and copy Tailwind palette colors. |
| Color Blindness Preview | Coming soon | Simulates color-blindness effects on palettes. |
| Accessibility Contrast Checker | Coming soon | Checks WCAG contrast ratios. |

### Markdown

| Tool | Status | What It Does |
| --- | --- | --- |
| Markdown Preview | Coming soon | Renders Markdown live as you type. |
| Markdown to HTML | Coming soon | Converts Markdown into clean HTML. |
| HTML to Markdown | Coming soon | Converts HTML back into Markdown. |

### Images

| Tool | Status | What It Does |
| --- | --- | --- |
| SVG Optimizer | Coming soon | Shrinks and cleans SVG source code. |
| SVG Preview | Coming soon | Previews raw SVG markup live. |
| Base64 Image | Coming soon | Encodes images into Base64 data URIs. |
| Image Resize | Coming soon | Resizes and compresses images client-side. |
| QR Generator | Coming soon | Generates QR codes from text or URLs. |
| QR Scanner | Coming soon | Scans QR codes using camera or upload. |
| Favicon Generator | Coming soon | Creates favicons in common required sizes. |
| SVG Sprite Generator | Coming soon | Combines SVGs into a single sprite sheet. |

### Date & Time

| Tool | Status | What It Does |
| --- | --- | --- |
| Unix Timestamp | Coming soon | Converts Unix time to human dates and human dates to Unix time. |
| Cron Generator | Coming soon | Builds cron expressions visually. |
| Cron Parser | Coming soon | Explains cron schedules in plain English. |
| Time Zone Converter | Coming soon | Converts times across different time zones. |

### Regex

| Tool | Status | What It Does |
| --- | --- | --- |
| Regex Tester | Coming soon | Tests regular expressions with live match highlighting. |
| Regex Generator | Coming soon | Creates regex patterns from a described intent. |
| Regex Cheat Sheet | Coming soon | Provides a quick reference for regex syntax. |

### Networking

| Tool | Status | What It Does |
| --- | --- | --- |
| URL Parser | Coming soon | Breaks a URL into protocol, host, path, query, and hash parts. |
| HTTP Header Viewer | Coming soon | Inspects and explains HTTP headers. |
| MIME Finder | Coming soon | Looks up MIME types by file extension. |
| HTTP Status Lookup | Coming soon | Explains HTTP status codes. |
| Curl to Fetch Converter | Coming soon | Converts curl commands into JavaScript `fetch()` code. |
| Curl to Axios Converter | Coming soon | Converts curl commands into Axios request code. |
| API Response Viewer | Coming soon | Pretty-prints and explores API responses. |
| HTTP Request Builder | Coming soon | Composes and previews HTTP requests. |
| Cookie Parser | Coming soon | Parses and inspects cookie strings. |
| User Agent Analyzer | Coming soon | Breaks down User-Agent strings. |
| IP CIDR Calculator | Coming soon | Calculates subnets and IP ranges from CIDR notation. |
| IPv6 Helper | Coming soon | Expands, compresses, and validates IPv6 addresses. |

### DevOps

| Tool | Status | What It Does |
| --- | --- | --- |
| Docker Cheat Sheet | Coming soon | Provides essential Docker command references. |
| Git Cheat Sheet | Coming soon | Lists common Git commands and workflows. |
| Kubernetes Cheat Sheet | Coming soon | Provides common `kubectl` command references. |
| HTTP Status Codes | Coming soon | Provides a full HTTP status code reference. |
| Postman Environment Generator | Coming soon | Generates Postman environment JSON. |
| OpenAPI Viewer | Coming soon | Renders and browses OpenAPI or Swagger specs. |
| Kubernetes YAML Validator | Coming soon | Validates Kubernetes manifests. |
| Docker Compose Formatter | Coming soon | Formats and lints Docker Compose files. |
| Terraform Formatter | Coming soon | Formats HCL Terraform configuration. |
| Nginx Config Formatter | Coming soon | Beautifies Nginx configuration files. |
| Apache Config Formatter | Coming soon | Formats Apache HTTP server configuration. |
| Log Beautifier | Coming soon | Structures and colorizes raw log output. |
| Stack Trace Cleaner | Coming soon | Removes noise from stack traces. |
| Gitignore Generator | Coming soon | Builds `.gitignore` files from templates. |
| License Generator | Coming soon | Generates open-source license files. |
| Semantic Version Comparator | Coming soon | Compares and sorts semantic version numbers. |
| Changelog Generator | Coming soon | Generates changelogs from commits. |
| Commit Message Generator | Coming soon | Creates clean commit messages. |
| Conventional Commit Helper | Coming soon | Builds Conventional Commit messages interactively. |

### Diagrams

| Tool | Status | What It Does |
| --- | --- | --- |
| Mermaid Live Preview | Coming soon | Renders Mermaid diagrams live. |
| PlantUML Preview | Coming soon | Renders PlantUML diagrams live. |

### AI

| Tool | Status | What It Does |
| --- | --- | --- |
| AI Prompt Formatter | Coming soon | Structures and cleans up LLM prompts. |
| Prompt Token Estimator | Coming soon | Estimates token counts for prompts. |

## Applications And Use Cases

Project Taste can be used for:

- API development: JSON formatting, JWT inspection, URL encoding, curl conversion, HTTP requests, and API response viewing.
- Backend development: SQL formatting, config validation, UUID generation, hashing, and environment file generation.
- Frontend development: CSS formatting, color conversion, gradients, shadows, accessibility contrast checks, and responsive value generation.
- DevOps work: Docker, Kubernetes, Terraform, Nginx, Apache, logs, stack traces, OpenAPI, and `.gitignore` helpers.
- Security-aware workflows: local JWT decoding, PEM inspection, SSH key generation, HMAC generation, and password generation.
- Documentation: Markdown preview, Markdown/HTML conversion, diagram previews, changelog generation, and commit message helpers.
- Testing and mock data: fake users, random numbers, API keys, Lorem Ipsum, random text, and QR codes.
- Learning: quick references for regex, Git, Docker, Kubernetes, HTTP status codes, MIME types, and common web formats.

## Adding A New Tool

1. Add the tool metadata to `data/tools.json`.
2. Create a new file in `tools/<tool-id>.html`.
3. Follow the existing tool page pattern.
4. Register the tool initializer with `window.TasteTools['tool-id']`.
5. Use shared helpers from `assets/js/utils.js` for clipboard, downloads, toasts, local storage, and drag-and-drop behavior.
6. Mark the tool as `ready` when it is implemented.

Example registry entry:

```json
{
  "id": "example-tool",
  "name": "Example Tool",
  "category": "text",
  "icon": "bi-tools",
  "desc": "Explains what the tool does.",
  "badges": [],
  "status": "soon"
}
```

## Privacy

Project Taste is designed to process data in the browser. For most tools, input is not sent to a server. This makes the app suitable for working with local snippets, API payloads, logs, tokens, and configuration data.

If a future tool needs network access, it should clearly explain that behavior before sending any data outside the browser.

## Roadmap

- Expand the catalog beyond 150 tools.
- Implement all tools currently marked as coming soon.
- Improve documentation for every tool.
- Add more import/export options.
- Add better accessibility coverage.
- Add offline/PWA support.
- Add automated tests for shared helpers and complex tools.
- Add deployment instructions for static hosting.

## License

Apache 2.0 

## Author

Project Taste is built for developers who want fast, clean, privacy-respecting tools in one place.
