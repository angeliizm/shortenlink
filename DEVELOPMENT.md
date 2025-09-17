# Development Guide

## Available Scripts

### 🚀 Development Scripts

#### `npm run dev`
- Runs Next.js development server only
- Fast startup, minimal resource usage
- Good for quick development

#### `npm run dev:full` ⭐ **RECOMMENDED**
- Runs multiple development processes concurrently:
  - **Next.js** (blue) - Main development server
  - **TypeScript** (green) - Real-time type checking
  - **ESLint** (yellow) - Real-time linting
- Provides comprehensive development feedback
- All processes run simultaneously with colored output

#### `npm run dev:minimal`
- Runs Next.js + TypeScript only
- Good balance between features and performance
- No ESLint (faster startup)

#### `npm run dev:clean`
- Cleans cache and runs full development suite
- Use when experiencing build issues
- Fresh start with all development tools

### 🔧 Utility Scripts

#### `npm run build`
- Production build
- Optimizes code for deployment

#### `npm run start`
- Runs production server
- Requires `npm run build` first

#### `npm run lint`
- One-time linting check
- Reports all ESLint issues

#### `npm run lint:watch`
- Continuous linting
- Shows errors as you type

#### `npm run lint:fix`
- Automatically fixes ESLint issues
- Run before committing code

#### `npm run type-check`
- One-time TypeScript check
- Validates all type definitions

#### `npm run type-check:watch`
- Continuous TypeScript checking
- Shows type errors in real-time

#### `npm run clean`
- Removes build cache
- Cleans `.next` and `node_modules/.cache`

## 🎯 Recommended Workflow

### For Daily Development
```bash
npm run dev:full
```
This gives you:
- ✅ Hot reloading
- ✅ Real-time type checking
- ✅ Real-time linting
- ✅ Colored output for easy identification

### For Performance Testing
```bash
npm run dev:minimal
```
When you need:
- ✅ Faster startup
- ✅ Less resource usage
- ✅ Still get TypeScript checking

### For Troubleshooting
```bash
npm run dev:clean
```
When you have:
- ❌ Build cache issues
- ❌ Strange development behavior
- ❌ Need a fresh start

## 🛠️ Development Tools

### Concurrently
- Runs multiple npm scripts simultaneously
- Colored output for each process
- Automatic process management

### TypeScript
- Real-time type checking
- Catches errors before runtime
- Better IDE integration

### ESLint
- Code quality enforcement
- Consistent code style
- Catches potential bugs

## 📊 Process Colors

- 🔵 **Blue**: Next.js development server
- 🟢 **Green**: TypeScript type checking
- 🟡 **Yellow**: ESLint linting
- 🔴 **Red**: Error messages

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev:full
```

### Cache Issues
```bash
npm run clean
npm run dev:full
```

### TypeScript Errors
```bash
npm run type-check
# Fix errors, then restart
npm run dev:full
```

### ESLint Errors
```bash
npm run lint:fix
# Then restart development
npm run dev:full
```

## 🔗 Backend Integration

This project uses **Supabase** as the backend service:
- No local backend server needed
- All API routes are in `/app/api/`
- Database operations through Supabase client
- Authentication handled by Supabase Auth

### Environment Setup
Make sure you have:
- ✅ `.env.local` file with Supabase credentials
- ✅ Supabase project configured
- ✅ Database migrations applied

## 📝 Best Practices

1. **Always use `dev:full`** for comprehensive development
2. **Fix TypeScript errors** before continuing development
3. **Address ESLint warnings** for code quality
4. **Use `dev:clean`** when experiencing issues
5. **Commit clean code** using `lint:fix` before pushing

