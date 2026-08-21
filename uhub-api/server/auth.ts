import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import path from 'path';
import fs from 'fs';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

/**
 * POST /api/auth/signup
 * Create a new user account
 * 
 * Body: {
 *   username: string (will be prefixed with 'u')
 *   password: string
 * }
 * 
 * Response: { message, user: { id, username } }
 * 
 * Automatically assigns admin roles if username matches known admins:
 * - "uAdmin", "uminion", "uminionunion", "uSalem" -> high-high-high admin
 * - (Other high-high admins can be added later)
 */
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  try {
    const prefixedUsername = 'u' + username;
    
    console.log(`[SIGNUP] User attempting to sign up with: "${username}"`);
    console.log(`[SIGNUP] Will be stored as: "${prefixedUsername}"`);

    // Check if either the unprefixed OR prefixed username already exists
    const existingUser = await db
      .selectFrom('users')
      .select('id')
      .where((eb) => eb.or([
        eb('username', '=', username),
        eb('username', '=', prefixedUsername)
      ]))
      .executeTakeFirst();

    if (existingUser) {
      console.log(`[SIGNUP] COLLISION: Username already taken (checked both "${username}" and "${prefixedUsername}")`);
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine admin roles
    const highHighHighAdmins = ['uAdmin', 'uminion', 'uminionunion', 'uSalem'];
    const highHighAdmins = ['uStorytellingSalem'];
    // Add more special user assignments here later as needed
    
    const isHighHighHighAdmin = highHighHighAdmins.includes(prefixedUsername) ? 1 : 0;
    const isHighHighAdmin = highHighAdmins.includes(prefixedUsername) ? 1 : 0;

    // Create the user with all role fields
   const newUser = await db
  .insertInto('users')
  .values({
    username: prefixedUsername,
    password: hashedPassword,
    is_high_high_high_admin: isHighHighHighAdmin,
    is_high_admin: 0,  // Only assign via database/admin panel
    is_high_high_admin: isHighHighAdmin,
    is_special_user: 0,
    is_special_special_user: 0,
    is_special_special_special_user: 0,
    is_blocked: 0,
    is_banned_from_chatrooms: 0,
    is_new_user: 1  // NEW: Mark all new signups as new users
  })
      .returning('id')
      .executeTakeFirstOrThrow();

    console.log(`[SIGNUP] SUCCESS: User \"${prefixedUsername}\" created with ID ${newUser.id}`);
      console.log(`[SIGNUP] Roles - HighHighHigh: ${isHighHighHighAdmin}, HighHigh: ${isHighHighAdmin}`);

      // Auto-assign default friends (IDs: 2, 9, 10)
      const defaultFriendIds = [2, 9, 10];
      let friendshipsCreated = 0;
      for (const friendId of defaultFriendIds) {
        try {
          const [user_id1, user_id2] = [newUser.id, friendId].sort((a, b) => a - b);
          await db.insertInto('friends')
            .values({
              user_id1: user_id1,
              user_id2: user_id2,
              status: 'accepted'
            })
            .execute();
          friendshipsCreated++;
          console.log(`[SIGNUP] ✅ Auto-assigned friendship: newUser ${newUser.id} <-> ${friendId}`);
        } catch (friendError) {
          console.error(`[SIGNUP] ❌ Error assigning friend ${friendId}:`, friendError);
        }
      }

      console.log(`[SIGNUP] ✅ User \"${prefixedUsername}\" created with ID ${newUser.id} and ${friendshipsCreated}/3 default friendships`);

      res.status(201).json({ 
        message: 'User created successfully',
        userId: newUser.id,
        friendshipsCreated: friendshipsCreated
      });
  } catch (error) {
    console.error('[SIGNUP] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * 
 * Body: {
 *   username: string (can be with or without 'u' prefix)
 *   password: string
 * }
 * 
 * Response: { id, username, is_high_high_high_admin, is_high_admin, etc. }
 * Sets httpOnly cookie with JWT token
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  try {
    console.log(`[LOGIN] User attempting to log in with: "${username}"`);

    // Step 1: Search for exact username as typed
    let user = await db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirst();

    console.log(`[LOGIN] Step 1 - Search for exact match "${username}": ${user ? 'FOUND' : 'NOT FOUND'}`);

    // Step 2: If not found and doesn't start with 'u', try adding 'u' prefix
    if (!user && !username.startsWith('u')) {
      const prefixedUsername = 'u' + username;
      user = await db
        .selectFrom('users')
        .selectAll()
        .where('username', '=', prefixedUsername)
        .executeTakeFirst();

      console.log(`[LOGIN] Step 2 - Search with 'u' prefix "${prefixedUsername}": ${user ? 'FOUND' : 'NOT FOUND'}`);
    }

    if (!user) {
      console.log(`[LOGIN] FAILED: User not found`);
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Check if user is banned from chatrooms
    if (user.is_banned_from_chatrooms === 1) {
      console.log(`[LOGIN] BLOCKED: User "${user.username}" is banned from chatrooms`);
      res.status(403).json({ error: 'Your account has been banned from chatrooms' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(`[LOGIN] FAILED: Invalid password for user "${user.username}"`);
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    console.log(`[LOGIN] SUCCESS: User "${user.username}" logged in`);
    console.log(`[LOGIN] Admin roles - HighHighHigh: ${user.is_high_high_high_admin}, HighHigh: ${user.is_high_high_admin}`);

    // Create JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict' 
    });
    
    // IMPORTANT: Return admin fields so frontend knows user is admin
   res.status(200).json({ 
  id: user.id, 
  username: user.username,
  profile_image_url: user.profile_image_url,
  is_high_high_high_admin: user.is_high_high_high_admin || 0,
  is_high_high_admin: user.is_high_high_admin || 0,
  is_high_admin: user.is_high_admin || 0,
  is_special_user: user.is_special_user,
  is_special_special_user: user.is_special_special_user,
  is_special_special_special_user: user.is_special_special_special_user,
  is_blocked: user.is_blocked,
  is_banned_from_chatrooms: user.is_banned_from_chatrooms,
  is_new_user: user.is_new_user || 0
});
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Clear authentication token
 * 
 * Response: { message }
 */
router.post('/logout', (req, res) => {
  res.cookie('token', '', { 
    expires: new Date(0), 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict' 
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current authenticated user info
 * Returns admin status from database
 * 
 * Response: { id, username, is_high_high_high_admin, is_high_high_admin, is_high_admin }
 */
router.get('/me', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    
    // Fetch fresh user data from database to get admin status
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', payload.userId)
      .executeTakeFirst();

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // IMPORTANT: Return admin fields
    res.status(200).json({ 
      id: user.id, 
      username: user.username,
      is_high_high_high_admin: user.is_high_high_high_admin || 0,
      is_high_high_admin: user.is_high_high_admin || 0,
      is_high_admin: user.is_high_admin || 0,
      is_special_user: user.is_special_user,
      is_special_special_user: user.is_special_special_user,
      is_special_special_special_user: user.is_special_special_special_user,
      is_blocked: user.is_blocked,
      is_banned_from_chatrooms: user.is_banned_from_chatrooms,
      is_new_user: user.is_new_user || 0
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});











/**
 * POST /api/auth/profile-image
 * Upload and update user's profile image using express-fileupload
 * 
 * Body: multipart/form-data with 'profileImage' file
 * Response: { success: true, profile_image_url: string }
 */
router.post('/profile-image', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    console.log('[AUTH] Profile image upload: No token provided');
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    console.log(`[AUTH] Uploading profile image for user ${payload.userId}`);

    // Check if file was uploaded (express-fileupload uses req.files)
    const files = req.files as any;
    if (!files || !files.profileImage) {
      console.log('[AUTH] No file uploaded in request');
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const uploadedFile = files.profileImage as any;
    console.log(`[AUTH] File received: ${uploadedFile.name}, size: ${uploadedFile.size} bytes`);

    // Create profile-images directory if it doesn't exist
    const profileImagesDir = path.join(process.cwd(), 'data', 'profile-images');
    if (!fs.existsSync(profileImagesDir)) {
      fs.mkdirSync(profileImagesDir, { recursive: true });
      console.log(`[AUTH] Created profile-images directory: ${profileImagesDir}`);
    }

    // Generate filename - use .jpg extension for consistency
    const fileName = `profile-${payload.userId}-${Date.now()}.jpg`;
    const filePath = path.join(profileImagesDir, fileName);

    // Save file to disk
    await uploadedFile.mv(filePath);
    console.log(`[AUTH] Profile image saved to disk: ${filePath}`);

     // Build the full URL path for serving
    const imageUrl = `/data/profile-images/${fileName}`;

    // Update user's profile_image_url in database
    const updatedUser = await db
      .updateTable('users')
      .set({ profile_image_url: imageUrl })
      .where('id', '=', payload.userId)
      .returning(['id', 'username', 'profile_image_url'])
      .executeTakeFirst();

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log(`[AUTH] Profile image updated for user ${payload.userId}: ${imageUrl}`);
    console.log(`[AUTH] Returning updated user data:`, updatedUser);
    
    res.status(200).json({ 
      success: true, 
      profile_image_url: updatedUser.profile_image_url,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        profile_image_url: updatedUser.profile_image_url
      }
    });
  } catch (error) {
    console.error('[AUTH] ❌ Error uploading profile image:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});




/**
 * GET /api/auth/user/:userIdentifier
 * Get public user profile data (for shared profile links)
 * Supports both numeric ID and username
 * No authentication required
 * 
 * Response: { id, username, profile_image_url, cover_photo_url }
 */
router.get('/user/:userIdentifier', async (req, res) => {
  const { userIdentifier } = req.params;

  try {
    let user;
    const numericId = parseInt(userIdentifier);
    
    // If it's a number, search by ID; otherwise search by username
    if (!isNaN(numericId)) {
      console.log(`[AUTH] Fetching user by ID: ${numericId}`);
      user = await db
        .selectFrom('users')
        .select(['id', 'username', 'profile_image_url', 'cover_photo_url'])
        .where('id', '=', numericId)
        .executeTakeFirst();
    } else {
      console.log(`[AUTH] Fetching user by username: ${userIdentifier}`);
      user = await db
        .selectFrom('users')
        .select(['id', 'username', 'profile_image_url', 'cover_photo_url'])
        .where('username', '=', userIdentifier)
        .executeTakeFirst();
    }

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log(`[AUTH] Public user data fetched for user ${userIdentifier}`);
    res.status(200).json(user);
  } catch (error) {
    console.error('[AUTH] Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});



export default router;
