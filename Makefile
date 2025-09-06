.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: install
install: ## Install dependencies for both backend and frontend
	cd backend && go mod download
	cd frontend && npm install

.PHONY: dev
dev: ## Start development environment with Docker Compose
	docker-compose up -d
	@echo "Services started:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8080"
	@echo "  Database: localhost:5432"
	@echo "  Redis:    localhost:6379"
	@echo "  Adminer:  http://localhost:8081"

.PHONY: dev-backend
dev-backend: ## Run backend in development mode
	cd backend && go run cmd/api/main.go

.PHONY: dev-frontend
dev-frontend: ## Run frontend in development mode
	cd frontend && npm run dev

.PHONY: build
build: ## Build Docker images
	docker-compose build

.PHONY: down
down: ## Stop all services
	docker-compose down

.PHONY: clean
clean: ## Stop services and remove volumes
	docker-compose down -v

.PHONY: logs
logs: ## Show logs from all services
	docker-compose logs -f

.PHONY: logs-backend
logs-backend: ## Show backend logs
	docker-compose logs -f backend

.PHONY: logs-frontend
logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

.PHONY: migrate-up
migrate-up: ## Run database migrations
	docker-compose exec postgres psql -U postgres -d shortenlink -f /docker-entrypoint-initdb.d/001_initial_schema.up.sql

.PHONY: migrate-down
migrate-down: ## Rollback database migrations
	docker-compose exec postgres psql -U postgres -d shortenlink -f /docker-entrypoint-initdb.d/001_initial_schema.down.sql

.PHONY: db-shell
db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d shortenlink

.PHONY: redis-cli
redis-cli: ## Open Redis CLI
	docker-compose exec redis redis-cli

.PHONY: test
test: test-backend test-frontend ## Run all tests

.PHONY: test-backend
test-backend: ## Run backend tests
	cd backend && go test -v -race ./...

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	cd frontend && npm test

.PHONY: lint
lint: lint-backend lint-frontend ## Run all linters

.PHONY: lint-backend
lint-backend: ## Run backend linter
	cd backend && golangci-lint run

.PHONY: lint-frontend
lint-frontend: ## Run frontend linter
	cd frontend && npm run lint

.PHONY: format
format: ## Format all code
	cd backend && go fmt ./...
	cd frontend && npx prettier --write .

.PHONY: security-scan
security-scan: ## Run security vulnerability scan
	docker run --rm -v "$(PWD):/src" aquasec/trivy fs /src

.PHONY: coverage
coverage: ## Generate test coverage reports
	cd backend && go test -coverprofile=coverage.out ./... && go tool cover -html=coverage.out

.PHONY: api-docs
api-docs: ## Generate API documentation
	@echo "API documentation available at http://localhost:8080/swagger when backend is running"

.PHONY: prod-build
prod-build: ## Build for production
	docker build -t shortenlink-backend:prod ./backend
	docker build -t shortenlink-frontend:prod ./frontend

.PHONY: prod-deploy
prod-deploy: ## Deploy to production (requires configuration)
	@echo "Deploying to production..."
	@echo "This requires proper production configuration in docker-compose.prod.yml"

.PHONY: benchmark
benchmark: ## Run performance benchmarks
	cd backend && go test -bench=. -benchmem ./...

.PHONY: check
check: lint test security-scan ## Run all checks (lint, test, security)