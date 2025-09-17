// Development configuration for dev:full script
module.exports = {
  // Colors for different processes
  colors: {
    next: 'blue',
    typescript: 'green', 
    eslint: 'yellow',
    tailwind: 'cyan'
  },
  
  // Process configurations
  processes: {
    next: {
      command: 'npm run dev',
      name: 'Next.js',
      color: 'blue'
    },
    typescript: {
      command: 'npm run type-check:watch',
      name: 'TypeScript',
      color: 'green'
    },
    eslint: {
      command: 'npm run lint:watch', 
      name: 'ESLint',
      color: 'yellow'
    }
  },
  
  // Development server settings
  server: {
    port: 3000,
    host: 'localhost'
  }
};

