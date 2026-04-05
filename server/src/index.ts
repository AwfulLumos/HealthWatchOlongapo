import { createApp } from './app.js';
import { config, validateEnv } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

async function bootstrap(): Promise<void> {
  try {
    // Validate environment variables
    validateEnv();

    // Connect to database
    await connectDatabase();

    // Create and start server
    const app = createApp();
    
    const server = app.listen(config.port, () => {
      console.log(`
🚀 HealthWatch Olongapo API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Environment: ${config.nodeEnv}
🌐 Server:      http://localhost:${config.port}
📚 API:         http://localhost:${config.port}${config.apiPrefix}
🔗 Health:      http://localhost:${config.port}${config.apiPrefix}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
