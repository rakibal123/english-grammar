import mongoose from 'mongoose';
import '@/models';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seeded: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var __mongoMemoryServer: { getUri(): string } | undefined;
}

const cached: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null, seeded: false };
global.__mongooseCache = cached;

async function startMemoryServer(): Promise<string> {
  if (!global.__mongoMemoryServer) {
    console.log('[db] Starting in-memory MongoDB...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const server = await MongoMemoryServer.create();
    global.__mongoMemoryServer = server;
    console.log('[db] In-memory MongoDB ready at', server.getUri());
  }
  return global.__mongoMemoryServer.getUri();
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const primaryUri = process.env.MONGODB_URI;

    cached.promise = (async () => {
      let useMemory = !primaryUri;

      if (primaryUri) {
        try {
          return await mongoose.connect(primaryUri, { bufferCommands: false, serverSelectionTimeoutMS: 3000 });
        } catch (err) {
          console.warn('[db] Primary MongoDB unreachable, falling back to in-memory:', (err as Error).message);
          useMemory = true;
        }
      }

      if (useMemory) {
        const memUri = await startMemoryServer();
        const conn = await mongoose.connect(memUri, { bufferCommands: false });

        // Auto-seed the in-memory DB on first boot
        if (!cached.seeded) {
          cached.seeded = true;
          try {
            const { seedDatabase } = await import('./seed');
            await seedDatabase();
            console.log('[db] In-memory DB seeded successfully');
          } catch (seedErr) {
            console.error('[db] Seed failed:', seedErr);
          }
        }

        return conn;
      }

      throw new Error('[db] Could not connect to any MongoDB instance');
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
