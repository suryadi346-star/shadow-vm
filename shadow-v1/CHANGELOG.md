# Changelog

All notable changes to Shadow VM will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project uses [Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2026-03-29

### Added
- Initial release
- Terminal UI with CRT scanline effect
- Command history (↑↓ arrow navigation)
- Tab autocomplete
- Ctrl+L (clear) and Ctrl+C (interrupt) keyboard shortcuts
- Boot sequence animation
- Real-time clock in header bar
- Commands: `help`, `whoami`, `uname`, `uname -a`, `ps`, `env`, `memory`, `uptime`, `date`, `echo`, `dev-status`, `clear`, `exit`
- XSS protection via `sanitize()` on all user input
- GitHub Actions: auto-deploy to GitHub Pages
- GitHub Actions: HTML validation on pull requests
