# Contributing to Shadow VM

First off — thanks for taking the time to contribute.

## Ground Rules

- One feature or fix per PR. Keep it focused.
- All changes must work without a build step (pure HTML/CSS/JS).
- Test in at least Chrome and Firefox before submitting.
- Follow the existing code style: sanitize all user input, use CSS variables for colors.

## How to Contribute

1. **Fork** this repo
2. **Create a branch**: `git checkout -b feat/your-feature-name`
3. **Make your changes** in `index.html`
4. **Test locally**: open `index.html` in browser
5. **Submit a PR** using the PR template

## Adding a New Command

Commands live in the `COMMANDS` object inside `index.html`:

```js
const COMMANDS = {
    // add your command here
    'your-command'(args) {
        print('<span class="c-val">your output here</span>');
    },
};
```

Rules for new commands:
- Always sanitize user-provided args with `sanitize(arg)`
- Use existing CSS token classes: `c-key`, `c-val`, `c-sys`, `c-err`, `c-warn`
- Add your command to the `help` command list

## Reporting Bugs

Use the **Bug Report** issue template. Include:
- Browser + OS
- Steps to reproduce
- What you expected vs what happened

## Suggesting Features

Use the **Feature Request** issue template.

## Commit Message Format

```
type: short description

feat:     new command or feature
fix:      bug fix
style:    CSS/visual change only
docs:     README, CONTRIBUTING, etc.
refactor: code restructure, no behavior change
chore:    workflow, config, tooling
```

Example: `feat: add ping command with simulated latency`
