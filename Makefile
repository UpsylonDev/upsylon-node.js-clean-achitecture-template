.PHONY: help dev prod dev-build prod-build dev-down prod-down dev-logs prod-logs clean test

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build    - Build and start development environment"
	@echo "  make dev-down     - Stop development environment"
	@echo "  make dev-logs     - Show development logs"
	@echo ""
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build and start production environment"
	@echo "  make prod-down    - Stop production environment"
	@echo "  make prod-logs    - Show production logs"
	@echo ""
	@echo "  make clean        - Remove all containers and volumes"
	@echo "  make test         - Run tests"

# Development commands
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "API: http://localhost:3000"

dev-build:
	@echo "Building and starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d --build
	@echo "Development environment started!"

dev-down:
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
prod:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started!"
	@echo "API: http://localhost:3002"
	@echo "Grafana: http://localhost:3001"
	@echo "Prometheus: http://localhost:9090"

prod-build:
	@echo "Building and starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d --build
	@echo "Production environment started!"

prod-down:
	@echo "Stopping production environment..."
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Utility commands
clean:
	@echo "Stopping all containers and removing volumes..."
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.prod.yml down -v
	@echo "All cleaned up!"

test:
	@echo "Running tests..."
	pnpm test
