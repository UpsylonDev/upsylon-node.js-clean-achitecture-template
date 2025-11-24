# Getting Started Guide

Welcome to the project! This guide aims to help you launch the application quickly, even if you are new to these technologies.

## 📋 Prerequisites

Before starting, make sure you have the following tools installed on your machine:

1.  **Node.js** (version 20 or higher): [Download Node.js](https://nodejs.org/)
2.  **Docker Desktop**: [Download Docker](https://www.docker.com/products/docker-desktop/) (Required for the database and Redis)
3.  **pnpm**: A fast package manager.
    - To install it: `npm install -g pnpm`

## 🚀 Installation

1.  **Clone the project** (if not already done)
2.  **Install dependencies**
    Open a terminal in the project folder and run:
    ```bash
    pnpm install
    ```

## ⚙️ Configuration

The project needs environment variables to function (database connection, secret keys, etc.).

1.  Copy the example file `.env.example` to a new file named `.env`:
    ```bash
    cp .env.example .env
    # On Windows (PowerShell):
    # Copy-Item .env.example .env
    ```
2.  (Optional) Modify the `.env` file if you need specific settings. For a local start, the default values usually work very well.

## ▶️ Launch

### 1. Start Services (Database & Redis)

We use Docker to run PostgreSQL and Redis without having to install them manually on your system.

```bash
docker-compose up -d
```

_The `-d` option runs the containers in the background._

### 2. Start the Application (Development Mode)

Once the Docker services are running, start the API:

```bash
pnpm dev
```

The application should be accessible at: `http://localhost:3000` (or the port defined in your `.env`).

## ✅ Verification

To verify that everything is working correctly:

1.  Open your browser at `http://localhost:3000/health`.
2.  You should see a message indicating that the status is "ok".

## 🛠 Useful Commands

- `pnpm dev`: Starts the server in development mode (automatically restarts on changes).
- `pnpm test`: Runs unit tests to ensure your code doesn't break anything.
- `pnpm lint`: Checks code quality.
- `pnpm build`: Compiles the project for production.

## ❓ Troubleshooting

- **Port Error**: If port 3000 or 5432 is already in use, check that no other service is running on these ports. You can change the ports in the `.env` file and `docker-compose.yml`.
- **Docker not responding**: Make sure Docker Desktop is running.
