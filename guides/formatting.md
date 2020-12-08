# Formatting

Formatting rules are set by eslint and prettier, there are a few plugins to help with things like Vue. Any questions, comments or ideas submit via PR

## VSCode Setup

To get this working in VSCode simply install the prettier and eslint plugins via the command palette:

```
ext install esbenp.prettier-vscode
ext install dbaeumer.vscode-eslint
```

Open workspace settings via command palette:

```
Preferences: Open Workspace Settings (JSON)
```

Modify and save settings.json

```
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
}
```
