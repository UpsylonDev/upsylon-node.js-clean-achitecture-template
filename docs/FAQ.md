# Frequently Asked Questions (FAQ)

> [!NOTE]
> This document lists common issues and their resolutions to help you get up and running quickly.

## 📌 General

**Q: What Node.js version is required?**

- A: Node.js 20 or newer.

**Q: How do I install pnpm?**

- A: Run `npm install -g pnpm`.

## 🐳 Docker

**Q: Docker containers fail to start**

- A: Ensure Docker Desktop is running and you have enough memory allocated (at least 2 GB). Check logs with `docker-compose logs`.

**Q: Port 5432 or 6379 is already in use**

- A: Change the ports in `.env` and `docker-compose.yml` to free ports, then restart the containers.

## 🚀 Development

**Q: The app does not reload on changes**

- A: Make sure you are running `pnpm dev` (which uses nodemon). Verify `nodemon.json` is present.

**Q: Environment variables are not being read**

- A: Copy `.env.example` to `.env` and restart the app. Ensure there are no stray spaces or Windows line endings.

## 🧪 Testing

**Q: Tests are failing with database connection errors**

- A: Run the Docker services (`docker-compose up -d postgres redis`) before executing `pnpm test`.

**Q: Linting fails on formatting**

- A: Run `pnpm lint --fix` to automatically fix most issues.

---

If you encounter an issue not listed here, feel free to open an issue on GitHub with details.
