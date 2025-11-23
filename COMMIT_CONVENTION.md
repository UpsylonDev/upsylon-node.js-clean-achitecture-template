# Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to ensure consistent and semantic commit messages.

## Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, whitespace, etc.)
- **refactor**: Code refactoring without changing behavior
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or dependencies changes
- **ci**: CI/CD configuration changes
- **chore**: Other maintenance tasks
- **revert**: Revert a previous commit
- **secu**: Security improvements

## Scope (optional)

The scope provides additional context about what part of the codebase is affected:
- `domain`: Domain layer changes
- `application`: Application layer changes
- `infrastructure`: Infrastructure layer changes
- `presentation`: Presentation layer changes
- `user`: User-related features
- `auth`: Authentication/authorization

## Subject

- Use lowercase
- No period at the end
- Maximum 100 characters for the entire header
- Use imperative mood ("add" not "added" or "adds")

## Examples

### Good commits

```bash
feat(user): add email validation in value object
fix(auth): resolve password hashing issue
docs: update api endpoints documentation
refactor(domain): simplify user entity creation
test(user): add unit tests for email value object
chore: update dependencies
secu(password): enhance password complexity requirements
```

### Bad commits

```bash
# Missing type
Updated readme

# Capitalized subject
feat: Add new feature

# Period at the end
fix: resolve bug.

# Past tense
feat: added new feature

# Not descriptive enough
fix: bug
chore: update
```

## Automated Checks

This project uses **Husky** with the following hooks:

### Pre-commit hook
Runs automatically before each commit:
- **ESLint**: Checks and fixes code quality issues
- **Prettier**: Formats code automatically
- **Jest**: Runs tests related to staged files

### Commit-msg hook
Validates commit message format:
- Ensures commit follows Conventional Commits format
- Checks type, scope, and subject formatting
- Enforces lowercase and length rules

## Bypassing Hooks (Not Recommended)

In exceptional cases, you can bypass hooks:

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip commit-msg validation
git commit --no-verify -m "your message"
```

⚠️ **Warning**: Only use `--no-verify` in emergency situations. Bypassing hooks may introduce code quality issues.

## Troubleshooting

### Hook not running

If hooks aren't executing:

```bash
# Reinstall Husky
pnpm prepare

# Check hooks permissions (Unix systems)
chmod +x .husky/*
```

### Commit message rejected

If your commit message is rejected:
1. Check the format matches: `type(scope): subject`
2. Ensure type is one of the allowed types
3. Use lowercase for type, scope, and subject
4. Keep header under 100 characters

## Benefits

- **Automated changelog generation**: Types enable automatic release notes
- **Semantic versioning**: Types map to version bumps (feat → minor, fix → patch)
- **Better collaboration**: Clear commit history helps team understand changes
- **Code quality**: Pre-commit checks ensure consistent code standards
