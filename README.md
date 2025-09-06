# SHORTENLINK

A production-grade link shortener platform with advanced analytics, custom domains, and enterprise features.

## Features

- 🚀 High-performance redirects (10k RPS, <50ms p95 latency)
- 📊 Advanced analytics with real-time tracking
- 🔒 Enterprise-grade security (OWASP ASVS L2)
- 🌍 Custom domains with DNS verification
- 📱 QR code generation
- 🔑 API-first architecture with webhooks
- 🛡️ Advanced anti-abuse protection
- 📈 GDPR/KVKK compliant

## Tech Stack

- **Backend**: Go (Fiber framework)
- **Database**: PostgreSQL + Redis
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Infrastructure**: Docker + Cloudflare
- **Monitoring**: Prometheus + OpenTelemetry

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Go 1.21+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/shortenlink.git
cd shortenlink
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start services with Docker Compose:
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
make migrate-up
```

5. Start the development servers:
```bash
# Backend
cd backend && go run cmd/api/main.go

# Frontend (new terminal)
cd frontend && npm run dev
```

6. Access the application:
- Frontend: http://localhost:3000
- API: http://localhost:8080
- API Docs: http://localhost:8080/swagger

## Project Structure

```
shortenlink/
├── backend/           # Go API server
│   ├── cmd/          # Application entrypoints
│   ├── internal/     # Private application code
│   ├── pkg/          # Public packages
│   └── migrations/   # Database migrations
├── frontend/         # Next.js application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   └── lib/          # Utilities
├── docker/           # Docker configurations
├── scripts/          # Utility scripts
└── docs/            # Documentation
```

## API Documentation

The API follows OpenAPI 3.1 specification. Full documentation available at `/swagger` when running the API server.

### Authentication

```bash
# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

### Create Short Link

```bash
curl -X POST http://localhost:8080/api/v1/links \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://example.com/very/long/url"}'
```

## Testing

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run e2e tests
make test-e2e

# Run load tests
make test-load
```

## Deployment

### Production with Docker

```bash
# Build production images
docker build -t shortenlink/api:latest ./backend
docker build -t shortenlink/frontend:latest ./frontend

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n shortenlink
```

## Configuration

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| REDIS_URL | Redis connection string | - |
| JWT_SECRET | JWT signing secret | - |
| API_URL | Backend API URL | http://localhost:8080 |
| NEXT_PUBLIC_API_URL | Frontend API URL | http://localhost:8080 |

See `.env.example` for complete list.

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Security

For security concerns, please email security@shortenlink.com instead of using the issue tracker.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [https://docs.shortenlink.com](https://docs.shortenlink.com)
- Issues: [GitHub Issues](https://github.com/yourusername/shortenlink/issues)
- Discord: [Join our community](https://discord.gg/shortenlink)