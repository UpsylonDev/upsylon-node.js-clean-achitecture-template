# Contributing Guide

> [!NOTE]
> Thank you for considering contributing to this project! Your help makes it better for everyone.

## 📦 Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/upsylon-node.js-clean-achitecture-template.git
   cd upsylon-node.js-clean-achitecture-template
   ```
3. **Install dependencies** using pnpm:
   ```bash
   pnpm install
   ```
4. **Set up the development environment** (Docker services):
   ```bash
   docker-compose up -d postgres redis
   ```
5. **Run the application** in development mode:
   ```bash
   pnpm dev
   ```

## 🛠️ Development Workflow

- **Create a new branch** for your work:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- **Make changes** and ensure the code follows the existing style (ESLint, Prettier).
- **Run tests** to verify everything works:
  ```bash
  pnpm test
  ```
- **Run lint** to catch style issues:
  ```bash
  pnpm lint
  ```
- **Commit your changes** with clear messages:
  ```bash
  git add .
  git commit -m "feat: brief description of the change"
  ```
- **Push the branch** and open a Pull Request on GitHub.

## ✅ Pull Request Checklist

- [ ] Code builds without errors.
- [ ] All tests pass.
- [ ] Linting passes (`pnpm lint`).
- [ ] Documentation is updated if needed.
- [ ] The PR description explains the purpose and any relevant context.

## 📚 Documentation

If you add or modify features, please update the relevant documentation files in `docs/` (e.g., `GETTING_STARTED.md`, `NEW_FEATURE.md`).

## 🐛 Reporting Issues

- Use the **GitHub Issues** page.
- Provide a clear title and description.
- Include steps to reproduce, expected behavior, and actual behavior.
- Attach logs or screenshots if helpful.

## 🙏 Thanks!

Your contributions are greatly appreciated. Happy coding!
