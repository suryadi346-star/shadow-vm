# Shadow-VM

> A retro hacker-aesthetic terminal emulator running entirely in the browser — no backend, no dependencies.

[![Deploy](https://github.com/suryadi346-star/shadow-vm/actions/workflows/deploy.yml/badge.svg)](https://github.com/suryadi346-star/shadow-vm/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/github/v/release/suryadi346-star/shadow-vm)](https://github.com/suryadi346-star/shadow-vm/releases)

**[→ Live Demo](https://suryadi346-star.github.io/shadow-vm)**

---

## Features

- Scanline CRT visual effect
- Command history (↑↓ arrow keys)
- Tab autocomplete
- Simulated boot sequence
- Real-time clock
- Ctrl+L clear, Ctrl+C interrupt
- Built-in commands: `help`, `whoami`, `uname`, `ps`, `env`, `memory`, `uptime`, `date`, `echo`, `dev-status`, `clear`, `exit`

## Getting Started

No build step required. Clone and open.

```bash
git clone https://github.com/suryadia346-star/shadow-vm.git
cd shadow-vm
open index.html   # or just drag into browser
```

## Project Structure

```
shadow-vm/
├── index.html          # Single-file app (HTML + CSS + JS)
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
└── .github/
    ├── workflows/
    │   ├── deploy.yml      # GitHub Pages auto-deploy
    │   └── validate.yml    # HTML validation on PR
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── PULL_REQUEST_TEMPLATE.md
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT © [suryadi346-star](https://github.com/suryadi346-star)
# shadow-vm
