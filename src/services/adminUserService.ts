
'use server';
import dbConnect from '@/lib/dbConnect';
import AdminUserModel, { type IAdminUser } from '@/models/AdminUserModel';
import type { AdminUser } from '@/types';

// Helper function to convert Mongoose document to AdminUser type (plain object)
function docToAdminUser(doc: IAdminUser | any): AdminUser {
  if (!doc) {
    console.error("[Service:AdminUser] docToAdminUser received a null or undefined document.");
    return { id: 'error-id', username: 'ErrorUser', email: 'error@example.com', createdAt: new Date().toISOString() };
  }
  const plainDoc = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object' || !plainDoc._id) {
    console.error('[Service:AdminUser] docToAdminUser: plainDoc is not a valid object or missing _id after toObject/spread.', plainDoc);
    return { id: 'error-id', username: 'ErrorUser', email: 'error@example.com', createdAt: new Date().toISOString() };
  }

  return {
    id: plainDoc._id.toString(),
    username: plainDoc.username,
    email: plainDoc.email,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function verifyAdminCredentials(username: string, plainPassword: string): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
  console.log(`[Service:AdminUser] Verifying credentials for username: '${username}'`);
  try {
    await dbConnect();
    // IMPORTANT: Do NOT use .lean() here, as we need the comparePassword method from the Mongoose document instance.
    const adminDoc = await AdminUserModel.findOne({ username: username });

    if (!adminDoc) {
      console.warn(`[Service:AdminUser] Admin user not found with username: '${username}'`);
      return { success: false, message: 'Invalid username or password.' };
    }

    console.log(`[Service:AdminUser] Admin user '${username}' found. Comparing password...`);
    const isMatch = await adminDoc.comparePassword(plainPassword);

    if (isMatch) {
      console.log(`[Service:AdminUser] Password match for username: '${username}'`);
      return { success: true, user: docToAdminUser(adminDoc) };
    } else {
      console.warn(`[Service:AdminUser] Password mismatch for username: '${username}'`);
      return { success: false, message: 'Invalid username or password.' };
    }
  } catch (error: any) {
    console.error(`[Service:AdminUser] Error in verifyAdminCredentials for username '${username}':`, error.name, error.message, error.stack);
    // Throw a simple Error object for Server Action compatibility
    throw new Error(`Authentication error. Original: ${error.message}. Check server logs for details.`);
  }
}


export async function seedInitialAdminUser(): Promise<void> {
  try {
    await dbConnect();
    const adminCount = await AdminUserModel.countDocuments();
    if (adminCount === 0) {
      const defaultAdminUsername = 'admin';
      const defaultAdminEmail = 'admin@example.com';
      console.log(`[Service:AdminUser] No admin users found. Seeding initial admin user. Username: ${defaultAdminUsername}, Email: ${defaultAdminEmail}, Password: 'admin'.`);

      const initialAdmin = new AdminUserModel({
        username: defaultAdminUsername,
        email: defaultAdminEmail.toLowerCase(),
        password: 'admin', // Password will be hashed by pre-save hook
      });
      await initialAdmin.save();
      console.log('[Service:AdminUser] Initial admin user seeded successfully.');
    } else {
      // console.log('[Service:AdminUser] Admin users already exist. Skipping seed.');
    }
  } catch (error: any) {
    console.error('[Service:AdminUser] Error during initial admin user seeding:', error.name, error.message, error.stack);
    // Not re-throwing as this shouldn't block app start if DB connection is otherwise fine
  }
}

export async function createAdminUser({ username, email, password }: Pick<AdminUser, 'username' | 'email' | 'password'>): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  console.log(`[Service:AdminUser] Attempting to create admin user. Username: ${username}, Email: ${email}`);
  if (!password) {
    console.warn('[Service:AdminUser] Password missing for createAdminUser.');
    return { success: false, error: 'Password is required for admin user creation.' };
  }
  try {
    await dbConnect();

    const existingUserByEmail = await AdminUserModel.findOne({ email: email.toLowerCase() }).lean();
    if (existingUserByEmail) {
      console.warn(`[Service:AdminUser] Email already exists: ${email}`);
      return { success: false, error: 'Email already exists. Please choose a different email.' };
    }

    const existingUserByUsername = await AdminUserModel.findOne({ username: username }).lean();
    if (existingUserByUsername) {
      console.warn(`[Service:AdminUser] Username already exists: ${username}`);
      return { success: false, error: 'Username already exists. Please choose a different username.' };
    }

    const newAdmin = new AdminUserModel({
      username: username,
      email: email.toLowerCase(),
      password: password, // Password will be hashed by pre-save hook
    });
    const savedAdmin = await newAdmin.save();
    console.log(`[Service:AdminUser] Admin user created successfully: ${savedAdmin.username}`);
    return {
      success: true,
      user: docToAdminUser(savedAdmin),
    };
  } catch (error: any) {
    console.error('[Service:AdminUser] Error creating admin user:', error.name, error.message, error.stack);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to create admin user. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    await dbConnect();
    const adminDocs = await AdminUserModel.find({}).sort({ createdAt: -1 }).lean();
    return adminDocs.map(docToAdminUser);
  } catch (error: any) {
    console.error('[Service:AdminUser] Error in getAdminUsers:', error.name, error.message, error.stack);
    throw new Error(`Failed to fetch admin users. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteManyAdminUsers(ids: string[]): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  if (!ids || ids.length === 0) {
    return { success: false, deletedCount: 0, error: "No admin user IDs provided for deletion." };
  }
  try {
    await dbConnect();
    // Basic check to ensure IDs are somewhat valid before sending to DB
    for (const id of ids) {
      if (typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
        // This basic check might not be strictly necessary if Mongoose handles invalid IDs gracefully,
        // but it's a good practice to validate input.
        console.warn(`[Service:AdminUser] Invalid admin user ID format in batch delete: ${id}`);
        // Depending on strictness, you might throw an error here or filter out invalid IDs.
        // For now, let Mongoose handle it.
      }
    }
    const result = await AdminUserModel.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0 && ids.length > 0) {
        console.warn('[Service:AdminUser] deleteManyAdminUsers: No admin users found matching the provided IDs for deletion.');
    }
    return { success: true, deletedCount: result.deletedCount || 0 };
  } catch (error: any) {
    console.error('[Service:AdminUser] Error in deleteManyAdminUsers:', error.name, error.message, error.stack);
    throw new Error(`Failed to delete admin users. Original: ${error.message}. Check server logs for details.`);
  }
}
