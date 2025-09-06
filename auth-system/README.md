# Auth System

A complete, production-ready authentication system built with Go (backend) and Next.js (frontend).

## Features

### Security
- **Argon2id password hashing** - Industry standard password hashing
- **JWT HS256 tokens** - Secure access tokens (15 minutes)
- **Refresh token rotation** - Enhanced security with Redis-backed refresh tokens
- **httpOnly, Secure, SameSite=Strict cookies** - Protection against XSS and CSRF
- **CORS configuration** - Proper cross-origin resource sharing
- **Token blacklisting** - Immediate token revocation
- **Input validation** - Comprehensive request validation

### Architecture
- **Go backend** with PostgreSQL and Redis
- **Next.js frontend** with TypeScript and Tailwind CSS
- **Docker containerization** - Complete stack deployment
- **Database migrations** - Version-controlled schema changes
- **Health checks** - Monitoring and reliability
- **Graceful shutdown** - Proper resource cleanup

### Developer Experience
- **Comprehensive error handling** - Clear error messages
- **Automatic token refresh** - Seamless user experience
- **Type-safe API client** - TypeScript interfaces
- **Development tools** - Makefile, hot reload, linting
- **Production optimization** - Minification, compression

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Go 1.21+ (for local development)
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)
- Redis 7+ (for local development)

### Using Docker (Recommended)

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd auth-system
   cp .env.example .env
   cp .env.local.example .env.local
   ```

2. **Configure environment** (edit `.env`):
   ```bash
   # IMPORTANT: Change the JWT secret in production!
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-please-use-at-least-32-characters
   ```

3. **Start the stack**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Health check: http://localhost:8080/health

### Local Development

1. **Setup environment**:
   ```bash
   cp .env.example .env
   cp .env.local.example .env.local
   # Edit .env with your local database credentials
   ```

2. **Start dependencies**:
   ```bash
   # Start PostgreSQL and Redis (or use Docker for just these services)
   docker-compose up postgres redis -d
   ```

3. **Setup database**:
   ```bash
   # Install golang-migrate (if not already installed)
   go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
   
   # Run migrations
   make migrate-up
   ```

4. **Start backend**:
   ```bash
   make deps  # Download dependencies
   make run   # Start the Go server
   ```

5. **Start frontend**:
   ```bash
   npm install
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (requires auth)

### Health
- `GET /health` - Health check endpoint

## Project Structure

```
auth-system/
├── cmd/server/           # Application entry point
├── internal/
│   ├── db/              # Database models and queries
│   ├── redis/           # Redis client and operations
│   ├── security/        # Password hashing and JWT
│   └── http/
│       ├── handlers/    # HTTP request handlers
│       ├── middleware/  # Authentication middleware
│       └── validators/  # Input validation
├── migrations/          # Database migrations
├── app/                 # Next.js pages (App Router)
│   ├── login/          # Login page
│   ├── dashboard/      # Protected dashboard
│   └── layout.tsx      # Root layout
├── lib/                 # Frontend utilities
│   └── api.ts          # API client with auto-refresh
├── docker-compose.yml   # Complete stack deployment
├── backend.Dockerfile   # Backend container
├── web.Dockerfile      # Frontend container
├── Makefile            # Development commands
└── README.md           # This file
```

## Configuration

### Backend Environment Variables
```bash
# Database
DATABASE_URL=postgres://user:password@localhost:5432/auth_system

# Redis
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key
ACCESS_TOKEN_DURATION=15m
REFRESH_TOKEN_DURATION=168h

# Server
SERVER_PORT=8080
SERVER_HOST=localhost

# CORS
ALLOWED_ORIGINS=http://localhost:3000
ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS

# Cookies
COOKIE_DOMAIN=localhost
SECURE_COOKIES=false  # Set to true in production with HTTPS
```

### Frontend Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Security Considerations

### Production Deployment
1. **Change JWT Secret**: Use a strong, unique secret (at least 32 characters)
2. **Enable HTTPS**: Set `SECURE_COOKIES=true`
3. **Update CORS origins**: Set to your actual domain
4. **Use strong database credentials**
5. **Enable Redis authentication**
6. **Use environment-specific configurations**

### Token Management
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Refresh tokens are rotated on each use
- Tokens are stored in httpOnly cookies
- Blacklisted tokens are stored in Redis

## Development Commands

```bash
# Backend
make build          # Build the application
make run            # Run in development mode
make test           # Run tests
make deps           # Download dependencies
make fmt            # Format code
make vet            # Run go vet
make lint           # Run golangci-lint

# Database
make migrate-up     # Run migrations up
make migrate-down   # Run migrations down
make migrate-create # Create new migration

# Docker
make docker-build   # Build Docker image
make docker-run     # Run Docker container
make docker-compose-up    # Start with docker-compose
make docker-compose-down  # Stop docker-compose

# Frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

## Testing the API

### Register a new user
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### Access protected endpoint
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  # OR using cookies:
  -b cookies.txt
```

### Refresh token
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -b cookies.txt -c cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

## Monitoring

### Health Checks
- Backend: `GET /health`
- Database connection status
- Redis connection status
- Application uptime

### Docker Health Checks
All services include health checks:
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- Backend: HTTP health endpoint
- Frontend: HTTP request to root

## Troubleshooting

### Common Issues

1. **Database connection failed**:
   - Check PostgreSQL is running
   - Verify DATABASE_URL is correct
   - Ensure database exists

2. **Redis connection failed**:
   - Check Redis is running
   - Verify REDIS_ADDR is correct

3. **CORS errors**:
   - Add your frontend URL to ALLOWED_ORIGINS
   - Check protocol (http vs https)

4. **Token refresh fails**:
   - Check Redis is working
   - Verify refresh token hasn't expired
   - Check cookie settings

5. **Docker build fails**:
   - Check Docker daemon is running
   - Verify Dockerfile syntax
   - Check .dockerignore patterns

### Logs
```bash
# Docker logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs redis

# Follow logs
docker-compose logs -f backend
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using Go, Next.js, PostgreSQL, and Redis.