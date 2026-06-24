# slidev-addon-audience-filter

A [Slidev](https://sli.dev) addon that filters slides based on the target audience. Use `showFor` and `hideFor` frontmatter properties to control which slides are visible for which audience.

## Features

- **Audience-based filtering**: Show or hide slides based on the active audience
- **Flexible configuration**: Set audience via environment variable or headmatter
- **Bypass mode**: Disable filtering for IDE editing with `AUDIENCE=bypass`
- **Comma-separated or array syntax**: Supports both formats for audience lists

## Installation

```bash
npm install slidev-addon-audience-filter
```

## Usage

### 1. Add the addon to your presentation

#### Option A: In `slides.md` frontmatter

```yaml
---
addons:
  - slidev-addon-audience-filter
audience: live
---
```

#### Option B: In `package.json`

```json
{
  "slidev": {
    "addons": ["slidev-addon-audience-filter"]
  }
}
```

### 2. Set the active audience

#### Option A: Environment variable (recommended for CLI)

```bash
AUDIENCE=live slidev
```

#### Option B: Headmatter in `slides.md`

```yaml
---
audience: live
---
```

### 3. Mark slides with `showFor` or `hideFor`

```markdown
---
showFor: live
---

# This slide is only visible for the "live" audience

---
hideFor: beginners
---

# This slide is hidden from "beginners" but visible to everyone else

---
showFor: architects,leads
---

# This slide is visible for "architects" and "leads"
```

## How It Works

1. The addon reads the active audience from the `AUDIENCE` environment variable or the `audience` headmatter field
2. For each slide, it checks the `showFor` and `hideFor` frontmatter properties
3. If a slide has `hideFor` and the active audience matches, the slide is disabled
4. If a slide has `showFor` and the active audience does NOT match, the slide is disabled
5. Slides without `showFor` or `hideFor` are always visible

### Priority

1. `AUDIENCE` environment variable (highest priority)
2. `audience` headmatter field
3. No audience set = no filtering (all slides visible)

### Bypass Mode

Set `AUDIENCE=bypass` to disable all filtering. This is useful when editing slides in an IDE:

```bash
AUDIENCE=bypass slidev
```

## Audience List Syntax

Both comma-separated strings and arrays are supported:

```yaml
# Comma-separated
showFor: architects,leads

# Array
showFor:
  - architects
  - leads
```

Values are case-insensitive and trimmed automatically.

## Development

For local development:

```bash
# Clone the repository
git clone https://github.com/yourusername/slidev-addon-audience-filter.git
cd slidev-addon-audience-filter

# Install dependencies
npm install

# Start Slidev with the demo presentation
npm run dev
```

## License

MIT

## Author

Denis Sowa

## Contributing

Contributions are welcome! Please open an issue or pull request on GitHub.
