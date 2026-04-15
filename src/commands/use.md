# `portkey use` Command

The `use` command activates a named port profile for the current project and optionally writes port assignments to a `.env` file.

## Usage

```bash
portkey use <profile> [options]
portkey current
```

## Commands

### `use <profile>`

Switches the active profile and applies its port assignments.

**Options:**

| Option | Description | Default |
|---|---|---|
| `-e, --env-file <path>` | Path to write the `.env` file | `.env` |
| `--no-env` | Skip writing the `.env` file | — |

**Examples:**

```bash
# Switch to the 'dev' profile and write ports to .env
portkey use dev

# Switch to 'staging' and write to a custom env file
portkey use staging --env-file .env.staging

# Switch profile without touching any env file
portkey use production --no-env
```

### `current`

Displays the currently active profile and its port assignments.

**Example:**

```bash
portkey current
# Current profile: dev
# Ports:
#   API: 3000
#   DB: 5432
```

## Notes

- The active profile is persisted in the portkey config file (`~/.portkey/config.json` by default).
- Use `portkey profile list` to see all available profiles.
- Use `portkey profile add` to create a new profile.
