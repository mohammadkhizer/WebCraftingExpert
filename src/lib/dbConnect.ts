
// src/lib/dbConnect.ts
import mongoose from 'mongoose';
import { seedInitialAdminUser } from '@/services/adminUserService'; // Assuming this path is correct

// --- WARNING: HARDCODING CREDENTIALS ---
// This URI is being hardcoded as per explicit user request.
// For production, ALWAYS use environment variables.
const HARDCODED_MONGODB_URI_BASE: string = "mongodb+srv://mohmmadekhizers:khizer@cluster0.rebfj1b.mongodb.net/";
const DEFAULT_DB_NAME: string = "ByteBrustersDB";
const MONGO_QUERY_PARAMS: string = "?retryWrites=true&w=majority&appName=Cluster0";

let finalMongoURI = HARDCODED_MONGODB_URI_BASE;

try {
    const uriObject = new URL(HARDCODED_MONGODB_URI_BASE);
    if (uriObject.pathname === '/' || uriObject.pathname === '') {
        finalMongoURI = `${HARDCODED_MONGODB_URI_BASE.endsWith('/') ? HARDCODED_MONGODB_URI_BASE.slice(0, -1) : HARDCODED_MONGODB_URI_BASE}/${DEFAULT_DB_NAME}${MONGO_QUERY_PARAMS}`;
    } else {
        let tempURI = HARDCODED_MONGODB_URI_BASE;
        if (!tempURI.includes('retryWrites')) tempURI += (tempURI.includes('?') ? '&' : '?') + 'retryWrites=true';
        if (!tempURI.includes('w=majority')) tempURI += (tempURI.includes('?') ? '&' : '?') + 'w=majority';
        if (!tempURI.includes('appName=')) tempURI += (tempURI.includes('?') ? '&' : '?') + `appName=${uriObject.searchParams.get('appName') || 'Cluster0'}`; // Use existing appName or default
        finalMongoURI = tempURI;
    }
} catch (e: any) {
    console.error("[dbConnect] CRITICAL: Invalid base MongoDB URI provided in code:", HARDCODED_MONGODB_URI_BASE, e.message);
    // If URI is invalid at module load, subsequent calls to dbConnect will fail early.
    // This specific error means the hardcoded string itself is malformed.
    throw new Error("Critically invalid MongoDB URI configured in dbConnect.ts. Cannot proceed.");
}

console.log(`[dbConnect] Module Loaded. Final MongoDB URI to be used (credentials masked): ${finalMongoURI.replace(/:[^:]*@/, ':********@')}`);


interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  console.log('[dbConnect] dbConnect() function called.');

  if (cached.conn && cached.conn.connection.readyState === 1) {
    console.log('[dbConnect] Using cached and connected MongoDB connection.');
    return cached.conn;
  }

  if (cached.conn && cached.conn.connection.readyState !== 1) {
    console.warn(`[dbConnect] Cached connection found, but readyState is ${cached.conn.connection.readyState}. Attempting to clean up.`);
    try {
      await cached.conn.disconnect();
      console.log('[dbConnect] Stale connection disconnected.');
    } catch (disconnectErr: any) {
      console.error('[dbConnect] Error disconnecting stale connection:', disconnectErr.message);
    }
    cached.conn = null;
    cached.promise = null; // Crucial to reset promise if connection was bad
  }

  if (!cached.promise) {
    console.log('[dbConnect] No valid cached promise or connection, creating new connection promise.');
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, // Slightly increased timeout
    };

    console.log(`[dbConnect] Attempting mongoose.connect() with URI (credentials masked): ${finalMongoURI.replace(/:[^:]*@/, ':********@')}`);
    
    cached.promise = mongoose.connect(finalMongoURI, opts)
      .then((mongooseInstance) => {
        console.log('[dbConnect] mongoose.connect().then() handler reached.');
        if (!mongooseInstance || !mongooseInstance.connection || typeof mongooseInstance.connection.readyState !== 'number') {
          const state = mongooseInstance?.connection?.readyState;
          const errMsg = `[dbConnect] CRITICAL in .then(): Mongoose instance or connection is invalid. Received instance: ${!!mongooseInstance}, connection object: ${!!mongooseInstance?.connection}, readyState: ${state}`;
          console.error(errMsg);
          cached.promise = null;
          cached.conn = null; 
          throw new Error(errMsg); // This makes the promise reject
        }
        if (mongooseInstance.connection.readyState !== 1) {
           const state = mongooseInstance.connection.readyState;
           const errMsg = `[dbConnect] CRITICAL in .then(): Mongoose instance connection.readyState is ${state}, not 1 (connected). DB: ${mongooseInstance.connection.name}, Host: ${mongooseInstance.connection.host}`;
           console.error(errMsg);
           cached.promise = null;
           cached.conn = null;
           throw new Error(errMsg); // This makes the promise reject
        }

        console.log(`[dbConnect] connect().then(): mongooseInstance validated. Name: ${mongooseInstance.connection.name}, Host: ${mongooseInstance.connection.host}, Port: ${mongooseInstance.connection.port}, ReadyState: ${mongooseInstance.connection.readyState}`);
        cached.conn = mongooseInstance;
        console.log(`[dbConnect] connect().then(): cached.conn assigned. cached.conn.connection.readyState: ${cached.conn?.connection?.readyState}`);
        
        // Seed admin user (non-critical for connection itself)
        seedInitialAdminUser().catch(seedErr => {
            console.error('[dbConnect] Error during initial admin user seeding (non-critical for connection flow):', seedErr.message);
        });

        return mongooseInstance;
      })
      .catch(err => {
        console.error('--- [dbConnect] MongoDB Connection Error (within mongoose.connect().catch()) ---');
        console.error('URI Used (credentials masked):', finalMongoURI.replace(/:[^:]*@/, ':********@'));
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.reason) console.error('Error Reason (Driver):', JSON.stringify(err.reason, Object.getOwnPropertyNames(err.reason)));
        if (err.codeName) console.error('Error Code Name:', err.codeName);
        console.error('Stack (partial):', err.stack ? err.stack.substring(0, 500) : 'N/A');
        console.error('--------------------------------------------------------------------------------');
        console.error('Common causes: 1. Incorrect URI/credentials. 2. IP not whitelisted in MongoDB Atlas. 3. Atlas cluster paused/terminated. 4. Network issues (firewall, proxy, DNS).');
        console.error('--------------------------------------------------------------------------------');
        cached.promise = null; 
        cached.conn = null;
        throw new Error(`MongoDB connection error: ${err.message}. Review URI, credentials, and IP whitelist. Full error details in server logs.`);
      });
  } else {
    console.log('[dbConnect] Reusing existing connection promise.');
  }

  try {
    // Await the promise. If it was just created, it will attempt to connect.
    // If it was an existing promise, it will resolve with the existing connection or throw if it failed.
    await cached.promise; 
  } catch (error: any) {
    // This catch block handles errors from awaiting cached.promise.
    // These errors would have originated from the .catch() of mongoose.connect() or the .then() if it threw an error.
    console.error('[dbConnect] Error awaiting cached.promise during connect sequence:', error.message);
    // cached.promise should have been nullified by the .catch() of mongoose.connect() if that's where it failed.
    // Ensure cached.conn is also null.
    cached.conn = null; 
    // Re-throw the error that the service layer will catch.
    // The error object should already be a simple Error instance from the promise's .catch() or .then().
    throw error; 
  }

  // After awaiting, cached.conn should have been set by the successful .then() handler of the mongoose.connect() promise.
  // Perform the final check.
  if (!cached.conn || cached.conn.connection.readyState !== 1) {
    const criticalErrorMsg = `[dbConnect] CRITICAL: Main connection object (cached.conn) is null or not ready (readyState: ${cached.conn?.connection?.readyState}) after promise resolution. This indicates a severe issue with the Mongoose connection setup or caching.`;
    console.error(criticalErrorMsg);
    if (cached) {
        cached.promise = null;
        cached.conn = null;
    }
    throw new Error(criticalErrorMsg);
  }

  console.log(`[dbConnect] Connection established and verified. DB: ${cached.conn.connection.name}, Host: ${cached.conn.connection.host}, ReadyState: ${cached.conn.connection.readyState}`);
  return cached.conn;
}

export default dbConnect;
