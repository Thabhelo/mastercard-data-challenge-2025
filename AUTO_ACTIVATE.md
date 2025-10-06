# Auto-Activate Virtual Environment

## Option 1: Using direnv (Recommended)

If you have direnv installed, it will automatically activate the virtual environment when you enter this directory.

Install direnv:
```bash
brew install direnv
```

Add to your `~/.zshrc`:
```bash
eval "$(direnv hook zsh)"
```

Then allow direnv for this project:
```bash
cd /Users/thabhelo/mastercard-data-challenge-2025
direnv allow
```

## Option 2: Manual zsh hook

Add this function to your `~/.zshrc`:

```bash
# Auto-activate Python venv
function auto_activate_venv() {
  if [[ -f "venv/bin/activate" ]]; then
    if [[ "$VIRTUAL_ENV" != "$(pwd)/venv" ]]; then
      source venv/bin/activate
    fi
  fi
}

# Run on every directory change
autoload -U add-zsh-hook
add-zsh-hook chpwd auto_activate_venv

# Run on shell start if in a directory with venv
auto_activate_venv
```

After adding, reload your shell:
```bash
source ~/.zshrc
```

## Option 3: VS Code/Cursor

If using VS Code or Cursor, the editor will automatically detect and activate the virtual environment.

Set in `.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/venv/bin/python",
  "python.terminal.activateEnvironment": true
}
```

## Option 4: Simple alias

Add to your `~/.zshrc`:
```bash
alias cdproject="cd /Users/thabhelo/mastercard-data-challenge-2025 && source venv/bin/activate"
```

Then just use:
```bash
cdproject
```

