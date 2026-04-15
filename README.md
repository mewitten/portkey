# portkey

A CLI tool for managing and switching between local development port configurations across projects.

## Installation

```bash
npm install -g portkey
```

## Usage

```bash
# Add a port configuration for a project
portkey add my-app --port 3000

# List all saved configurations
portkey list

# Switch to a project's port configuration
portkey use my-app

# Remove a configuration
portkey remove my-app
```

Portkey saves your port configurations locally and makes it easy to avoid conflicts when jumping between projects.

## Configuration

Configurations are stored in `~/.portkey/config.json`. You can edit this file directly or use the CLI commands above.

## Requirements

- Node.js >= 16
- npm or yarn

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT