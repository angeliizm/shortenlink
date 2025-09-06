# Auth System Makefile

.PHONY: help build run clean test docker-build docker-run docker-compose-up docker-compose-down migrate-up migrate-down deps fmt vet

# Default target
help:
	@echo "Available commands:"
	@echo "  build          Build the application"
	@echo "  run            Run the application"
	@echo "  clean          Clean build artifacts"
	@echo "  test           Run tests"
	@echo "  deps           Download and tidy dependencies"
	@echo "  fmt            Format Go code"
	@echo "  vet            Run go vet"
	@echo "  lint           Run golangci-lint"
	@echo "  docker-build   Build Docker image"
	@echo "  docker-run     Run Docker container"
	@echo "  docker-compose-up    Start services with docker-compose"
	@echo "  docker-compose-down  Stop services with docker-compose"
	@echo "  migrate-up     Run database migrations up"
	@echo "  migrate-down   Run database migrations down"

# Application name and version
APP_NAME=auth-system
VERSION=1.0.0
BUILD_DIR=build
DOCKER_IMAGE=$(APP_NAME):$(VERSION)

# Build the application
build:
	@echo "Building $(APP_NAME)..."
	@mkdir -p $(BUILD_DIR)
	@go build -o $(BUILD_DIR)/$(APP_NAME) ./cmd/server

# Run the application
run:
	@echo "Running $(APP_NAME)..."
	@go run ./cmd/server

# Clean build artifacts
clean:
	@echo "Cleaning..."
	@rm -rf $(BUILD_DIR)
	@go clean

# Run tests
test:
	@echo "Running tests..."
	@go test -v -race -cover ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@go test -v -race -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Download and tidy dependencies
deps:
	@echo "Downloading dependencies..."
	@go mod download
	@go mod tidy

# Format Go code
fmt:
	@echo "Formatting code..."
	@go fmt ./...

# Run go vet
vet:
	@echo "Running go vet..."
	@go vet ./...

# Run golangci-lint (requires golangci-lint to be installed)
lint:
	@echo "Running golangci-lint..."
	@golangci-lint run

# Install development tools
install-tools:
	@echo "Installing development tools..."
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@go install github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	@docker build -f backend.Dockerfile -t $(DOCKER_IMAGE) .

# Run Docker container
docker-run:
	@echo "Running Docker container..."
	@docker run -p 8080:8080 --env-file .env $(DOCKER_IMAGE)

# Start services with docker-compose
docker-compose-up:
	@echo "Starting services with docker-compose..."
	@docker-compose up -d

# Stop services with docker-compose
docker-compose-down:
	@echo "Stopping services with docker-compose..."
	@docker-compose down

# Database migration up
migrate-up:
	@echo "Running database migrations up..."
	@migrate -path migrations -database "$(DATABASE_URL)" up

# Database migration down
migrate-down:
	@echo "Running database migrations down..."
	@migrate -path migrations -database "$(DATABASE_URL)" down

# Create a new migration
migrate-create:
	@read -p "Enter migration name: " name; \
	migrate create -ext sql -dir migrations $$name

# Development setup
dev-setup: deps install-tools
	@echo "Development environment setup complete!"
	@echo "1. Copy .env.example to .env and configure your settings"
	@echo "2. Start PostgreSQL and Redis services"
	@echo "3. Run 'make migrate-up' to set up the database"
	@echo "4. Run 'make run' to start the server"

# Production build
build-prod:
	@echo "Building for production..."
	@mkdir -p $(BUILD_DIR)
	@CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-w -s' -o $(BUILD_DIR)/$(APP_NAME) ./cmd/server

# Health check
health:
	@echo "Checking application health..."
	@curl -f http://localhost:8080/health || echo "Application is not responding"

# Show application logs (for Docker)
logs:
	@docker-compose logs -f app

# Run security checks
security:
	@echo "Running security checks..."
	@go list -json -m all | nancy sleuth

# Benchmark tests
bench:
	@echo "Running benchmarks..."
	@go test -bench=. -benchmem ./...