# 🚀 Development Scripts Quick Reference

## Main Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run dev` | Basic Next.js server | Quick development |
| `npm run dev:full` | **Full development suite** | **Daily development** ⭐ |
| `npm run dev:minimal` | Next.js + TypeScript | Performance testing |
| `npm run dev:clean` | Clean + Full suite | Troubleshooting |

## What `dev:full` Includes

```
🔵 Next.js Server    - Hot reloading, development server
🟢 TypeScript Check  - Real-time type checking  
🟡 ESLint Linting   - Real-time code quality
```

## Quick Start

```bash
# Install dependencies (first time only)
npm install

# Start full development environment
npm run dev:full

# Open browser to http://localhost:3000
```

## Troubleshooting

```bash
# Port in use? Kill it
npx kill-port 3000

# Cache issues? Clean and restart
npm run dev:clean

# Fix linting issues
npm run lint:fix
```

## Backend Note

- **No separate backend server needed**
- Uses Supabase cloud service
- All APIs in `/app/api/` directory
- Database operations via Supabase client

---

**Recommended**: Always use `npm run dev:full` for the best development experience! 🎯

