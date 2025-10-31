# Development Guide

## ESLint and Prettier Setup

This project uses modern ESLint (v9+) with the new flat config format and Prettier for consistent code formatting and quality.

### Configuration Files

- **`eslint.config.js`** - ESLint configuration using the new flat config format
- **`.prettierrc.json`** - Prettier formatting configuration
- **`.prettierignore`** - Files and directories to ignore during formatting
- **`.vscode/settings.json`** - VS Code integration settings
- **`.vscode/extensions.json`** - Recommended VS Code extensions

### Code Style Rules

- **Double quotes** for strings in TypeScript/JavaScript files
- **Semicolons** required at the end of statements
- **2-space indentation**
- **Trailing commas** in ES5 compatible positions
- **Arrow functions** preferred for callbacks
- **Template literals** preferred over string concatenation
- **const/let** preferred over var
- **Import sorting** - Imports are automatically sorted and grouped

### Available Scripts

```json
{
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "type-check": "tsc --noEmit",
  "check": "bun run type-check && bun run lint && bun run format:check"
}
```

### Usage

#### Linting

```bash
# Check for linting errors
bun run lint

# Fix auto-fixable linting errors
bun run lint:fix
```

#### Formatting

```bash
# Format all files
bun run format

# Check if files are properly formatted
bun run format:check
```

#### Full Check

```bash
# Run type checking, linting, and format checking
bun run check
```

### Import Sorting

Imports are automatically sorted and grouped using `@trivago/prettier-plugin-sort-imports` with the following order:

1. **Node.js built-in modules** (e.g., `fs`, `path`)
2. **Third-party packages** (e.g., `hono`, `zod`)
3. **Absolute imports** with `@/` prefix (if using path mapping)
4. **Relative parent imports** (e.g., `../config/database`)
5. **Relative same-level imports** (e.g., `./utils/helpers`)

**Example:**
```typescript
import { readFileSync } from "fs";
import path from "path";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";

import { config } from "../config/database";

import { UserService } from "./services/user";
import { formatDate } from "./utils/helpers";
```

### IDE Integration

#### VS Code

The project includes VS Code settings for optimal development experience:

1. **Auto-format on save** - Files are automatically formatted when saved
2. **ESLint integration** - Errors and warnings are shown inline
3. **Auto-fix on save** - ESLint auto-fixes are applied on save
4. **Import organization** - Imports are automatically organized

#### Recommended Extensions

- ESLint (dbaeumer.vscode-eslint)
- Prettier - Code formatter (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- TypeScript Importer (pmneo.tsimporter)
- Error Lens (usernamehw.errorlens)
- Code Spell Checker (streetsidesoftware.code-spell-checker)

### ESLint Rules Overview

#### TypeScript Rules

- `@typescript-eslint/no-unused-vars` - Error for unused variables (except those starting with `_`)
- `@typescript-eslint/no-explicit-any` - Warning for explicit any types
- `@typescript-eslint/no-non-null-assertion` - Warning for non-null assertions

#### General Rules
- `prefer-const` - Use const when variables are not reassigned
- `no-var` - Disallow var declarations
- `object-shorthand` - Prefer object shorthand syntax
- `prefer-arrow-callback` - Prefer arrow functions for callbacks
- `prefer-template` - Prefer template literals over string concatenation
- `no-console` - Warning for console statements (consider using proper logging)
- `eqeqeq` - Require strict equality comparisons
- `curly` - Require curly braces for control statements
- `sort-imports` - Disabled (handled by Prettier plugin)

### Pre-commit Workflow

Before committing changes, run:

```bash
bun run check
```

This ensures:

1. TypeScript compilation succeeds
2. No ESLint errors
3. All files are properly formatted

### Troubleshooting

#### ESLint Errors

- Run `bun run lint:fix` to auto-fix most issues
- For remaining errors, fix them manually following the ESLint messages

#### Prettier Issues

- Run `bun run format` to format all files
- Check `.prettierignore` if certain files shouldn't be formatted

#### VS Code Not Working

1. Ensure recommended extensions are installed
2. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
3. Check VS Code settings match `.vscode/settings.json`

#### Performance Issues

- ESLint and Prettier are configured to ignore `node_modules`, `dist`, and other build artifacts
- If experiencing slow performance, check ignore patterns in `eslint.config.js` and `.prettierignore`
