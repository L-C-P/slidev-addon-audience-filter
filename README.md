# slidev-addon-audience-filter

A [Slidev](https://sli.dev) addon that filters slides based on the target audience. Use `showFor` and `hideFor` frontmatter properties to control which slides are visible for which audience.

## Features

- **Audience-based filtering**: Show or hide slides based on the active audience
- **Flexible configuration**: Set audience via environment variable or headmatter
- **Bypass mode**: Disable filtering for IDE editing with `AUDIENCE=bypass`
- **Comma-separated or array syntax**: Supports both formats for audience lists
- **Presenter switch**: Shows the active audience in the presenter nav bar and lets you switch it while the dev server is running

## Installation

```bash
npm install slidev-addon-audience-filter
```

## Usage

### 1. Enable the addon

Add the addon to the `addons` list in your `slides.md` headmatter:

```yaml
---
addons:
  - slidev-addon-audience-filter
---
```

This requires **Slidev 52.17.1 or newer**. After adding the addon, fully stop
and restart the dev server (a hot reload is not enough for preparser changes).

#### Older Slidev versions (< 52.17.1)

Before 52.17.1, Slidev did not apply addon preparsers to the initial render
([slidevjs/slidev#2646](https://github.com/slidevjs/slidev/issues/2646)), and
listing the addon in `addons` fails the version check. Instead, leave it out of
the `addons` list and create `setup/preparser.ts` in your Slidev project:

```ts
import {createAudienceFilterPreparser} from 'slidev-addon-audience-filter'

export default createAudienceFilterPreparser()
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

`audience: bypass` in the headmatter works the same way. The value is case-insensitive.

## Presenter Switch

The addon adds a UI element to the nav bar in **presenter mode** (an audience
icon next to the active audience). It is not shown in the audience view or on a
second screen.

- **Dev server (`slidev`):** a dropdown that switches the audience at runtime.
- **Static build (`slidev build`):** the audience is fixed at build time and
  only displayed, without a dropdown.

How the dropdown behaves:

- The options are all audiences used in `showFor`/`hideFor`, the `audience`
  headmatter value, and `bypass`. They are shown in lowercase, with `bypass`
  first and the rest sorted alphabetically (case-insensitive).
- Switching re-parses the slides, so the slide list and `<Toc>` update in all
  open views (presenter, audience, second screen). Slidev may reload the
  views; the current slide number is kept.
- The switch is not persisted: after a restart, `AUDIENCE` or the headmatter
  applies again.

The UI element requires the addon to be listed in `addons`; it is not
available with the `setup/preparser.ts` fallback for older Slidev versions.

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

## License

MIT

## Author

Denis Sowa

## Contributing

Contributions are welcome! Please open an issue or pull request on GitHub.
