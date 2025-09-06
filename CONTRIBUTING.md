# Contributing to SHORTENLINK

Thank you for your interest in contributing to SHORTENLINK! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully

## Getting Started

1. **Fork the repository** and clone it locally
2. **Set up your development environment**:
   ```bash
   make install
   make dev
   ```
3. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Before You Start Coding

- Check existing issues and pull requests to avoid duplicating work
- For new features, open an issue first to discuss the implementation
- For bug fixes, ensure the bug is documented in an issue

### 2. Development Guidelines

#### Backend (Go)
- Follow Go conventions and idioms
- Use `gofmt` for formatting
- Write tests for new functionality
- Maintain test coverage above 80%
- Use meaningful variable and function names

#### Frontend (TypeScript/React)
- Follow the existing component structure
- Use TypeScript strictly (no `any` types)
- Write unit tests for utilities and components
- Follow the established styling patterns with Tailwind CSS

### 3. Commit Guidelines

We follow Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Maintenance tasks

Example:
```
feat(api): add rate limiting to link creation endpoint

Implements sliding window rate limiting using Redis
Limits: 100 links per hour for authenticated users

Closes #123
```

### 4. Testing

Run tests before submitting:
```bash
make test          # Run all tests
make test-backend  # Run backend tests only
make test-frontend # Run frontend tests only
make coverage      # Generate coverage report
```

### 5. Code Quality

Ensure your code passes all quality checks:
```bash
make lint          # Run linters
make format        # Format code
make security-scan # Run security scan
make check         # Run all checks
```

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Ensure all tests pass**: `make check`
4. **Update the README.md** if necessary
5. **Submit the pull request**:
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

### PR Review Process

- At least one maintainer review is required
- All CI checks must pass
- Code coverage should not decrease
- No merge conflicts

## Development Setup

### Prerequisites
- Go 1.21+
- Node.js 20+
- Docker & Docker Compose
- Make

### Local Development

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Start services:
   ```bash
   make dev
   ```

3. Run migrations:
   ```bash
   make migrate-up
   ```

4. Access services:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080
   - Database: localhost:5432
   - Redis: localhost:6379

## Project Structure

```
shortenlink/
├── backend/         # Go API server
│   ├── cmd/        # Application entrypoints
│   ├── internal/   # Private application code
│   └── pkg/        # Public packages
├── frontend/       # Next.js application
│   ├── app/        # App router pages
│   ├── components/ # React components
│   └── lib/        # Utilities
├── migrations/     # Database migrations
└── docs/          # Documentation
```

## API Development

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement proper error handling
- Document endpoints in OpenAPI format
- Include request/response examples

## Database Changes

1. Create migration files:
   ```sql
   -- migrations/XXX_description.up.sql
   -- migrations/XXX_description.down.sql
   ```

2. Test migrations:
   ```bash
   make migrate-up
   make migrate-down
   ```

## Debugging

### Backend Debugging
```bash
docker-compose logs -f backend
make db-shell  # Access PostgreSQL
make redis-cli # Access Redis
```

### Frontend Debugging
```bash
docker-compose logs -f frontend
```

## Common Issues

### Port Already in Use
```bash
make clean  # Stop all services and clean volumes
make dev    # Restart services
```

### Database Connection Issues
```bash
make down
docker-compose up -d postgres redis
make migrate-up
```

## Getting Help

- Open an issue for bugs or feature requests
- Join our Discord community
- Check the documentation at `/docs`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.