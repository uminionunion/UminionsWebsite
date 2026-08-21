import { Router } from 'express';
import { db } from './db.js';
import { authenticate } from './auth-middleware.js';
import path from 'path';
import { promises as fs } from 'fs';

const router = Router();

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), 'data', 'uploads');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('[PRODUCTS] Error creating upload directory:', error);
  }
};

// POST - Create a new product
router.post('/', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  console.log('[PRODUCTS] POST /api/products called');
  console.log('[PRODUCTS] req.body:', req.body);
  console.log('[PRODUCTS] req.files:', (req as any).files);

  // Handle both form data and JSON
  let name = req.body.name;
  let subtitle = req.body.subtitle;
  let description = req.body.description;
  let price = req.body.price;
  let payment_method = req.body.payment_method;
  let payment_url = req.body.payment_url;
  let store_id = req.body.store_id;
  let sku_id = req.body.sku_id;
  let user_store_id = req.body.user_store_id;

  // Validate required fields
  if (!name || price === undefined || price === '') {
    res.status(400).json({ message: 'Name and price are required' });
    return;
  }

  try {
    // Check if user is blocked
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!user || user.is_blocked) {
      res.status(403).json({ message: 'Your account is blocked' });
      return;
    }

    // Handle file upload
    let imageUrl: string | null = null;
    if ((req as any).files && (req as any).files.image) {
      await ensureUploadDir();
      const uploadedFile = (req as any).files.image;
      const uploadDir = path.join(process.cwd(), 'data', 'uploads');
      const filename = `${Date.now()}-${uploadedFile.name}`;
      const filepath = path.join(uploadDir, filename);

      await uploadedFile.mv(filepath);
      imageUrl = `/api/uploads/${filename}`;
      console.log('[PRODUCTS] Image uploaded:', imageUrl);
    }

    // Determine store type based on user role
    let storeType: 'main' | 'user' | 'store' = 'user';
    let finalStoreId: number | null = null;

    if (user.is_high_high_high_admin === 1) {
      // HIGH-HIGH-HIGH admin: can add to main store
      storeType = 'main';
      finalStoreId = 0;
      console.log(`[PRODUCTS] HIGH-HIGH-HIGH admin ${user.username} adding to main store (store_id=0)`);
    } else if (user.is_high_high_admin === 1) {
      // HIGH-HIGH admin: can add to specific stores #01-#30
      if (!store_id) {
        res.status(400).json({ message: 'HIGH-HIGH admin must specify store_id (1-30)' });
        return;
      }
      const parsedStoreId = parseInt(store_id);
      if (isNaN(parsedStoreId) || parsedStoreId < 1 || parsedStoreId > 30) {
        res.status(400).json({ message: 'store_id must be between 1 and 30' });
        return;
      }
      storeType = 'store';
      finalStoreId = parsedStoreId;
      console.log(`[PRODUCTS] HIGH-HIGH admin ${user.username} adding to store #${finalStoreId}`);
    } else {
      // Regular user: personal store
      storeType = 'user';
      finalStoreId = null;
      console.log(`[PRODUCTS] User ${user.username} adding to personal store`);
    }

    // Create the product
    const product = await db
       .insertInto('MainHubUpgradeV001ForProducts')
       .values({
         name,
         subtitle: subtitle || null,
         description: description || null,
         price: price ? parseFloat(price) : null,
         image_url: imageUrl,
         store_type: storeType,
         user_id: storeType === 'user' ? req.user.userId : null,
         store_id: finalStoreId,
         payment_method: payment_method || null,
         payment_url: payment_url || null,
         sku_id: sku_id || null,
         user_store_id: user_store_id ? parseInt(user_store_id) : null,
         is_in_trash: 0,
       })
       .returning('id')
       .executeTakeFirstOrThrow();

    console.log(`[PRODUCTS] Product created: ID=${product.id}, type=${storeType}, store_id=${finalStoreId}, user_store_id=${user_store_id || 'none'}, sku=${sku_id || 'none'}`);

    res.status(201).json({
      message: 'Product created successfully',
      productId: product.id,
    });
  } catch (error) {
    console.error('[PRODUCTS] Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
   }
});

// PATCH - Update product
router.patch('/:productId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;

  try {
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parseInt(productId))
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if user owns the product OR is HIGH-HIGH-HIGH admin
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    const isAdmin = user && user.is_high_high_high_admin === 1;
    const isOwner = product.user_id === req.user.userId;

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'You do not have permission to edit this product' });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.subtitle !== undefined) updateData.subtitle = req.body.subtitle || null;
    if (req.body.description !== undefined) updateData.description = req.body.description || null;
    if (req.body.price !== undefined) updateData.price = req.body.price ? parseFloat(req.body.price) : null;
    if (req.body.payment_method) updateData.payment_method = req.body.payment_method;
    if (req.body.payment_url !== undefined) updateData.payment_url = req.body.payment_url || null;
    if (req.body.sku_id !== undefined) updateData.sku_id = req.body.sku_id || null;
    if (req.body.store_id !== undefined) updateData.store_id = parseInt(req.body.store_id) || null;

    // Handle image upload if provided
    if ((req as any).files && (req as any).files.image) {
      await ensureUploadDir();
      const uploadedFile = (req as any).files.image;
      const uploadDir = path.join(process.cwd(), 'data', 'uploads');
      const filename = `${Date.now()}-${uploadedFile.name}`;
      const filepath = path.join(uploadDir, filename);

      await uploadedFile.mv(filepath);
      updateData.image_url = `/api/uploads/${filename}`;
    }

    // Update the product
    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set(updateData)
      .where('id', '=', parseInt(productId))
      .execute();

    console.log(`[PRODUCTS] Product ${productId} updated by user ${req.user.userId}`);

    res.json({ message: 'Product updated successfully', productId: parseInt(productId) });
  } catch (error) {
    console.error('[PRODUCTS] Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// GET - Get products by store
router.get('/store/:storeId', async (req, res) => {
  const { storeId } = req.params;

  try {
    const products = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('store_id', '=', parseInt(storeId))
      .where('is_in_trash', '=', 0)
      .orderBy('created_at', 'desc')
      .execute();

    res.json(products);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching store products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET - Get user's products
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const products = await db
      .selectFrom('MainHubUpgradeV001ForProducts as p')
      .leftJoin('user_stores as us', 'p.user_store_id', 'us.id')
      .select([
        'p.id',
        'p.name',
        'p.price',
        'p.image_url',
        'p.store_type',
        'p.user_id',
        'p.store_id',
        'p.payment_method',
        'p.payment_url',
        'p.sku_id',
        'p.created_at',
        'p.subtitle',
        'p.description',
        'us.id as user_store_id',
        'us.name as user_store_name',
      ])
      .where('p.user_id', '=', parseInt(userId))
      .where('p.is_in_trash', '=', 0)
      .orderBy('p.id', 'desc')
      .execute();

    res.json(products);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching user products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET - Get all products for "Everything" (all sources, no duplicates)
router.get('/everything/all', async (req, res) => {
  try {
    // Fetch ALL products from ALL users, ALL stores, and main store
    // This includes: store_type='main', store_type='user' (ANY user), store_type='store'
    const allProducts = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .leftJoin(
        'users',
        'MainHubUpgradeV001ForProducts.user_id',
        'users.id'
      )
      .select([
        'MainHubUpgradeV001ForProducts.id',
        'MainHubUpgradeV001ForProducts.name',
        'MainHubUpgradeV001ForProducts.subtitle',
        'MainHubUpgradeV001ForProducts.description',
        'MainHubUpgradeV001ForProducts.price',
        'MainHubUpgradeV001ForProducts.image_url',
        'MainHubUpgradeV001ForProducts.store_type',
        'MainHubUpgradeV001ForProducts.user_id',
        'MainHubUpgradeV001ForProducts.store_id',
        'MainHubUpgradeV001ForProducts.payment_method',
        'MainHubUpgradeV001ForProducts.payment_url',
        'MainHubUpgradeV001ForProducts.sku_id',
        'MainHubUpgradeV001ForProducts.created_at',
        'users.username as creator_username',
      ])
      .where('MainHubUpgradeV001ForProducts.is_in_trash', '=', 0)
      .orderBy('MainHubUpgradeV001ForProducts.created_at', 'desc')
      .execute();

    // Deduplicate by product ID
    const seen = new Set<number>();
    const uniqueProducts = allProducts.filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });

    console.log(`[PRODUCTS] Fetched ${uniqueProducts.length} unique products for Everything store (from all users and stores, deduped from ${allProducts.length})`);
    res.json(uniqueProducts);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching everything products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});


// POST - Move product to trash (soft delete)
router.post('/:productId/trash', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;

  try {
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parseInt(productId))
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You do not own this product' });
      return;
    }

    // Move to trash
    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set({ is_in_trash: 1 })
      .where('id', '=', parseInt(productId))
      .execute();

    // Create trash record
    await db
      .insertInto('MainHubUpgradeV001ForProductTrash')
      .values({
        product_id: parseInt(productId),
        user_id: req.user.userId,
      })
      .execute();

    res.json({ message: 'Product moved to trash' });
  } catch (error) {
    console.error('[PRODUCTS] Error moving to trash:', error);
    res.status(500).json({ message: 'Failed to move to trash' });
  }
});

// POST - Restore product from trash
router.post('/:productId/restore', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;

  try {
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parseInt(productId))
      .executeTakeFirst();

    if (!product || !product.is_in_trash) {
      res.status(404).json({ message: 'Product not found or not in trash' });
      return;
    }

    if (product.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You do not own this product' });
      return;
    }

    // Restore from trash
    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set({ is_in_trash: 0 })
      .where('id', '=', parseInt(productId))
      .execute();

    // Remove from trash table
    await db
      .deleteFrom('MainHubUpgradeV001ForProductTrash')
      .where('product_id', '=', parseInt(productId))
      .execute();

    res.json({ message: 'Product restored' });
  } catch (error) {
    console.error('[PRODUCTS] Error restoring product:', error);
    res.status(500).json({ message: 'Failed to restore product' });
  }
});





// POST - Add item to internal cart
router.post('/cart/add', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { product_id, quantity = 1 } = req.body;

  try {
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', product_id)
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Add or update cart item
    const existingItem = await db
      .selectFrom('MainHubUpgradeV001ForInternalCart')
      .selectAll()
      .where('user_id', '=', req.user.userId)
      .where('product_id', '=', product_id)
      .executeTakeFirst();

    if (existingItem) {
      await db
        .updateTable('MainHubUpgradeV001ForInternalCart')
        .set({ quantity: existingItem.quantity + quantity })
        .where('id', '=', existingItem.id)
        .execute();
    } else {
      await db
        .insertInto('MainHubUpgradeV001ForInternalCart')
        .values({
          user_id: req.user.userId,
          product_id,
          quantity,
        })
        .execute();
    }

    res.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('[PRODUCTS] Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// GET - Get user's cart
router.get('/cart', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const cartItems = await db
      .selectFrom('MainHubUpgradeV001ForInternalCart')
      .leftJoin(
        'MainHubUpgradeV001ForProducts',
        'MainHubUpgradeV001ForInternalCart.product_id',
        'MainHubUpgradeV001ForProducts.id'
      )
      .selectAll('MainHubUpgradeV001ForInternalCart')
      .selectAll('MainHubUpgradeV001ForProducts')
      .where('MainHubUpgradeV001ForInternalCart.user_id', '=', req.user.userId)
      .execute();

    res.json(cartItems);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// DELETE - Remove item from cart
router.delete('/cart/:itemId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const { itemId } = req.params;

    const cartItem = await db
      .selectFrom('MainHubUpgradeV001ForInternalCart')
      .selectAll()
      .where('id', '=', parseInt(itemId))
      .executeTakeFirst();

    if (!cartItem || cartItem.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You do not own this cart item' });
      return;
    }

    await db
      .deleteFrom('MainHubUpgradeV001ForInternalCart')
      .where('id', '=', parseInt(itemId))
      .execute();

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('[PRODUCTS] Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
});

// POST - Add item to "Looking For"
router.post('/looking-for/add', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { store_id, item_name, description } = req.body;

  if (!store_id || !item_name) {
    res.status(400).json({ message: 'store_id and item_name are required' });
    return;
  }

  console.log(`[Looking For] User ${req.user.userId} adding item to store #${store_id}`);

  try {
    await db
      .insertInto('MainHubUpgradeV001ForLookingFor')
      .values({
        user_id: req.user.userId,
        store_id: parseInt(store_id),
        item_name,
        description: description || null,
      })
      .execute();

    res.json({ message: 'Item added to looking for' });
  } catch (error) {
    console.error('[PRODUCTS] Error adding to looking for:', error);
    res.status(500).json({ message: 'Failed to add to looking for' });
  }
});

// GET - Get "Looking For" items for a store
router.get('/looking-for/store/:storeId', async (req, res) => {
  const { storeId } = req.params;

  console.log(`[Looking For] Fetching items for store #${storeId}`);

  try {
    const items = await db
      .selectFrom('MainHubUpgradeV001ForLookingFor')
      .selectAll()
      .where('store_id', '=', parseInt(storeId))
      .orderBy('created_at', 'desc')
      .execute();

    res.json(items);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching looking for items:', error);
    res.status(500).json({ message: 'Failed to fetch looking for items' });
  }
});

// GET - Get "Looking For" items for current user across all stores
router.get('/looking-for/user/:userId', async (req, res) => {
  const { userId } = req.params;

  console.log(`[Looking For] Fetching items for user ${userId}`);

  try {
    const items = await db
      .selectFrom('MainHubUpgradeV001ForLookingFor')
      .selectAll()
      .where('user_id', '=', parseInt(userId))
      .orderBy('created_at', 'desc')
      .execute();

    res.json(items);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching user looking for items:', error);
    res.status(500).json({ message: 'Failed to fetch user looking for items' });
  }
});

// DELETE - Remove item from "Looking For"
router.delete('/looking-for/:itemId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { itemId } = req.params;

  console.log(`[Looking For] User ${req.user.userId} deleting item ${itemId}`);

  try {
    const item = await db
      .selectFrom('MainHubUpgradeV001ForLookingFor')
      .selectAll()
      .where('id', '=', parseInt(itemId))
      .executeTakeFirst();

    if (!item || item.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You do not own this item' });
      return;
    }

    await db
      .deleteFrom('MainHubUpgradeV001ForLookingFor')
      .where('id', '=', parseInt(itemId))
      .execute();

    res.json({ message: 'Item removed from looking for' });
  } catch (error) {
    console.error('[PRODUCTS] Error removing from looking for:', error);
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

// GET - All products (for HIGH-HIGH-HIGH admin viewing)
router.get('/admin/all', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Only HIGH-HIGH-HIGH admins can see all products
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!user || user.is_high_high_high_admin !== 1) {
      res.status(403).json({ message: 'Only HIGH-HIGH-HIGH admins can view all products' });
      return;
    }

    // Get ALL products from ALL sources, with creator info
    const products = await db
  .selectFrom('MainHubUpgradeV001ForProducts')
  .leftJoin('users', 'MainHubUpgradeV001ForProducts.user_id', 'users.id')
  .selectAll('MainHubUpgradeV001ForProducts')
  .select('users.username as creator_username')
  .where('MainHubUpgradeV001ForProducts.is_in_trash', '=', 0)
  .orderBy('MainHubUpgradeV001ForProducts.created_at', 'desc')
  .execute();

    res.json(products);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching admin products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET - Get products by high-high admin user (different from regular user products)
router.get('/high-high-admin/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;

  try {
    // Verify user is high-high admin
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', parseInt(userId))
      .executeTakeFirst();

    if (!user || user.is_high_high_admin !== 1) {
      res.status(400).json({ message: 'User is not a high-high admin' });
      return;
    }

    // Fetch all products added by this high-high admin across all stores
    const products = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('store_type', '=', 'store')
      .where('is_in_trash', '=', 0)
      .orderBy('id', 'desc')
      .execute();

    res.json(products);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching high-high admin products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});



// DELETE - Delete product as HIGH-HIGH-HIGH admin
router.delete('/admin/:productId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;

  try {
    // Check if user is HIGH-HIGH-HIGH admin
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!user || user.is_high_high_high_admin !== 1) {
      res.status(403).json({ message: 'Only HIGH-HIGH-HIGH admins can delete products' });
      return;
    }

    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parseInt(productId))
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Move to trash
    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set({ is_in_trash: 1 })
      .where('id', '=', parseInt(productId))
      .execute();

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('[PRODUCTS] Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});










// DELETE - Delete user store and all its products (cascade delete)
router.delete('/user-stores/:userStoreId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { userStoreId } = req.params;
  const parsedStoreId = parseInt(userStoreId);

  try {
    console.log(`[PRODUCTS] User ${req.user.userId} deleting uStore ${parsedStoreId}`);

    // Verify the user store exists and belongs to the user
    const userStore = await db
      .selectFrom('user_stores')
      .selectAll()
      .where('id', '=', parsedStoreId)
      .where('user_id', '=', req.user.userId)
      .executeTakeFirst();

    if (!userStore) {
      res.status(404).json({ message: 'User store not found or does not belong to you' });
      return;
    }

    // Get all products in this uStore
    const productsInStore = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('user_store_id', '=', parsedStoreId)
      .where('is_in_trash', '=', 0)
      .execute();

    console.log(`[PRODUCTS] Found ${productsInStore.length} products in uStore ${parsedStoreId}`);

    // Soft delete all products (move to trash)
    if (productsInStore.length > 0) {
      await db
        .updateTable('MainHubUpgradeV001ForProducts')
        .set({ is_in_trash: 1 })
        .where('user_store_id', '=', parsedStoreId)
        .execute();

      // Create trash records for each product
      for (const product of productsInStore) {
        await db
          .insertInto('MainHubUpgradeV001ForProductTrash')
          .values({
            product_id: product.id,
            user_id: req.user.userId,
          })
          .execute();
      }

      console.log(`[PRODUCTS] ✅ Moved ${productsInStore.length} products to trash`);
    }

    // Delete the user store
    await db
      .deleteFrom('user_stores')
      .where('id', '=', parsedStoreId)
      .execute();

    console.log(`[PRODUCTS] ✅ User store ${parsedStoreId} deleted successfully by user ${req.user.userId}`);

    res.status(200).json({
      message: 'User store and all its products have been deleted',
      storeId: parsedStoreId,
      productsDeleted: productsInStore.length,
    });
  } catch (error) {
    console.error('[PRODUCTS] ❌ Error deleting user store:', error);
    res.status(500).json({
      message: 'Failed to delete user store',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});


















// Add product to user store (update existing product)
router.put('/products/:productId/user-store', async (req, res) => {
  try {
    const { userStoreId } = req.body;
    const productId = parseInt(req.params.productId);

    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set({ user_store_id: userStoreId || null })
      .where('id', '=', productId)
      .execute();

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product user store:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Get all user stores with their products (for quadrants page 10+)
router.get('/user-stores/all', async (req, res) => {
  try {
    const stores = await db
  .selectFrom('user_stores')
  .leftJoin('MainHubUpgradeV001ForProducts', 'user_stores.id', 'MainHubUpgradeV001ForProducts.user_store_id') 
  .selectAll('user_stores')
  .select([
    'MainHubUpgradeV001ForProducts.id as product_id',
    'MainHubUpgradeV001ForProducts.name as product_name',
    'MainHubUpgradeV001ForProducts.price',
    'MainHubUpgradeV001ForProducts.image_url',
    'MainHubUpgradeV001ForProducts.description as product_description',
  ])
  .orderBy('user_stores.created_at', 'desc')
  .execute();

    // Transform flat results into nested structure
    const storesMap = new Map();
    stores.forEach(row => {
      if (!storesMap.has(row.id)) {
        storesMap.set(row.id, {
          id: row.id,
          user_id: row.user_id,
          name: row.name,
          subtitle: row.subtitle,
          description: row.description,
          badge_url: row.badge_url,
          banner_url: row.banner_url,
          created_at: row.created_at,
          products: [],
        });
      }
      if (row.product_id) {
        storesMap.get(row.id).products.push({
          id: row.product_id,
          name: row.product_name,
          price: row.price,
          image_url: row.image_url,
          description: row.product_description,
        });
      }
    });

    res.json(Array.from(storesMap.values()));
  } catch (error) {
    console.error('Error fetching user stores:', error);
    res.status(500).json({ error: 'Failed to fetch user stores' });
  }
});


// PUT - Assign product to user store (with full error handling & authentication)
router.put('/:productId/user-store', authenticate, async (req, res) => {
  if (!req.user) {
    console.log('[PRODUCTS] PUT user-store: No authenticated user');
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;
  const { userStoreId } = req.body;

  console.log(`[PRODUCTS] PUT /:productId/user-store called: productId=${productId}, userStoreId=${userStoreId}, userId=${req.user.userId}`);

  // Validate productId is a number
  const parsedProductId = parseInt(productId);
  if (isNaN(parsedProductId)) {
    console.log('[PRODUCTS] Invalid productId:', productId);
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  try {
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parsedProductId)
      .executeTakeFirst();

    if (!product) {
      console.log(`[PRODUCTS] Product ${parsedProductId} not found`);
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if user owns the product
    if (product.user_id !== req.user.userId) {
      console.log(`[PRODUCTS] User ${req.user.userId} does not own product ${parsedProductId} (owner: ${product.user_id})`);
      res.status(403).json({ message: 'You do not own this product' });
      return;
    }

    // Verify the user store exists and belongs to the user (if userStoreId is provided)
    if (userStoreId) {
      const parsedStoreId = parseInt(userStoreId);
      if (isNaN(parsedStoreId)) {
        console.log('[PRODUCTS] Invalid userStoreId:', userStoreId);
        res.status(400).json({ message: 'Invalid user store ID' });
        return;
      }

      const userStore = await db
        .selectFrom('user_stores')
        .selectAll()
        .where('id', '=', parsedStoreId)
        .where('user_id', '=', req.user.userId)
        .executeTakeFirst();

      if (!userStore) {
        console.log(`[PRODUCTS] User store ${parsedStoreId} not found for user ${req.user.userId}`);
        res.status(404).json({ message: 'User store not found or does not belong to you' });
        return;
      }

      console.log(`[PRODUCTS] Verified user store ${parsedStoreId} belongs to user ${req.user.userId}`);
    }

    // Update product with user store assignment
    const updatePayload: any = {};
    if (userStoreId) {
      updatePayload.user_store_id = parseInt(userStoreId);
    } else {
      updatePayload.user_store_id = null;
    }

    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set(updatePayload)
      .where('id', '=', parsedProductId)
      .execute();

    console.log(`[PRODUCTS] ✅ Product ${parsedProductId} assigned to user store ${userStoreId || 'null'} by user ${req.user.userId}`);
    res.status(200).json({ 
      message: 'Product updated successfully', 
      productId: parsedProductId,
      userStoreId: userStoreId ? parseInt(userStoreId) : null
    });
  } catch (error) {
    console.error('[PRODUCTS] ❌ Error updating product user store:', error);
    res.status(500).json({ 
      message: 'Failed to update product', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});


router.get('/stores/all/with-products', async (req, res) => {
  try {
    console.log('[PRODUCTS] Fetching all user stores with their products');

    // Get all user stores with their associated products
    const stores = await db
      .selectFrom('user_stores')
      .leftJoin(
        'MainHubUpgradeV001ForProducts',
        'user_stores.id',
        'MainHubUpgradeV001ForProducts.user_store_id'
      )
      .leftJoin(
        'users',
        'user_stores.user_id',
        'users.id'
      )
      .select([
        'user_stores.id',
        'user_stores.user_id',
        'user_stores.name',
        'user_stores.subtitle',
        'user_stores.description',
        'user_stores.badge_url',
        'user_stores.banner_url',
        'user_stores.created_at',
        'MainHubUpgradeV001ForProducts.id as product_id',
        'MainHubUpgradeV001ForProducts.name as product_name',
        'MainHubUpgradeV001ForProducts.price',
        'MainHubUpgradeV001ForProducts.image_url',
        'MainHubUpgradeV001ForProducts.description as product_description',
        'MainHubUpgradeV001ForProducts.subtitle as product_subtitle',
        'users.username as store_owner_username',
      ])
      .where('MainHubUpgradeV001ForProducts.is_in_trash', '=', 0)
      .orderBy('user_stores.created_at', 'desc')
      .execute();

    // Transform flat results into nested structure
    const storesMap = new Map();
    stores.forEach(row => {
      if (!storesMap.has(row.id)) {
        storesMap.set(row.id, {
          id: row.id,
          name: row.name,
          subtitle: row.subtitle,
          description: row.description,
          badge_url: row.badge_url,
          banner_url: row.banner_url,
          user_id: row.user_id,
          store_owner_username: row.store_owner_username,
          created_at: row.created_at,
          products: [],
        });
      }
      if (row.product_id) {
        storesMap.get(row.id).products.push({
          id: row.product_id,
          name: row.product_name,
          price: row.price,
          image_url: row.image_url,
          description: row.product_description,
          subtitle: row.product_subtitle,
        });
      }
    });

    const result = Array.from(storesMap.values());
    console.log(`[PRODUCTS] ✅ Fetched ${result.length} user stores with products`);
    res.json(result);
  } catch (error) {
    console.error('[PRODUCTS] ❌ Error fetching user stores:', error);
    res.status(500).json({ message: 'Failed to fetch user stores' });
  }
});

// GET - Get user's custom stores (PUBLIC - anyone can view any user's stores)
// This is used in the Friend Profile Modal to display friend's products
router.get('/user/:userId/stores', async (req, res) => {
  const { userId } = req.params;
  const parsedUserId = parseInt(userId);

  try {
    console.log(`[PRODUCTS] Fetching stores for user ${parsedUserId} (PUBLIC endpoint)`);

    // Fetch stores for ANY user (public endpoint - no authentication required)
    const stores = await db
  .selectFrom('user_stores as us')
  .leftJoin(
    'MainHubUpgradeV001ForProducts as p',
    'us.id',
    'p.user_store_id'
  )
  .selectAll('us')
  .select([
    'p.id as product_id',
    'p.name as product_name',
    'p.price as product_price',
    'p.image_url as product_image_url',
    'p.description as product_description',
    'p.subtitle as product_subtitle',
    'p.payment_method as product_payment_method',
    'p.payment_url as product_payment_url',
  ])
  .where('us.user_id', '=', parsedUserId)
  .where('p.is_in_trash', '=', 0)
  .orderBy('us.created_at', 'desc')
  .orderBy('p.created_at', 'desc')
  .execute();

    console.log(`[PRODUCTS] ✅ Fetched ${stores.length} records for user ${parsedUserId}`);

    // Transform flat results into nested structure: uStore → products
    const storesMap = new Map<number, any>();
    
    stores.forEach(row => {
      if (!storesMap.has(row.id)) {
        storesMap.set(row.id, {
          id: row.id,
          user_id: row.user_id,
          name: row.name,
          subtitle: row.subtitle,
          description: row.description,
          badge_url: row.badge_url,
          banner_url: row.banner_url,
          created_at: row.created_at,
          products: [],
        });
      }
      
      if (row.product_id) {
  storesMap.get(row.id)!.products.push({
    id: row.product_id,
    name: row.product_name,
    price: row.product_price,
    image_url: row.product_image_url,
    description: row.product_description,
    subtitle: row.product_subtitle,
    payment_method: row.product_payment_method,
    payment_url: row.product_payment_url,
  });
}
    });

    const result = Array.from(storesMap.values());

    
    res.json(result);
  } catch (error) {
    console.error('[PRODUCTS] ❌ Error fetching user stores:', error);
    res.status(500).json({ message: 'Failed to fetch user stores' });
  }
});

// POST - Create a new user store (for regular users adding from Add Product modal)
router.post('/user/:userId/stores', authenticate, async (req, res) => {
  const { userId } = req.params;
  const parsedUserId = parseInt(userId);

  // Verify the user is creating stores for themselves only
  if (parsedUserId !== req.user?.userId) {
    console.log(`[PRODUCTS] User ${req.user?.userId} tried to create store for user ${parsedUserId}`);
    res.status(403).json({ message: 'You can only create stores for yourself' });
    return;
  }

  const { name, subtitle, description } = req.body;

  // Validate required field
  if (!name || !name.trim()) {
    console.log('[PRODUCTS] Store creation failed: name is required');
    res.status(400).json({ message: 'Store name is required' });
    return;
  }

  try {
    console.log(`[PRODUCTS] Creating new store for user ${parsedUserId}: "${name}"`);

    // Check if user exists and is not blocked
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', parsedUserId)
      .executeTakeFirst();

    if (!user) {
      console.log(`[PRODUCTS] User ${parsedUserId} not found`);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.is_blocked) {
      console.log(`[PRODUCTS] User ${parsedUserId} is blocked, cannot create store`);
      res.status(403).json({ message: 'Your account is blocked' });
      return;
    }

    // Handle badge image upload (for default image of when user creates a store? of that yes? maybe more too?)
    let badgeUrl = '/defaultUminionUassets/defaultUminionUbadge.png';
    if ((req as any).files && (req as any).files.badgeImage) {
      await ensureUploadDir();
      const uploadedFile = (req as any).files.badgeImage;
      const uploadsDir = path.join(process.cwd(), 'data', 'uploads', 'store-images');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const ext = uploadedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `badge-${parsedUserId}-${Date.now()}.${ext}`;
      const filepath = path.join(uploadsDir, filename);
      
      await uploadedFile.mv(filepath);
      badgeUrl = `/data/uploads/store-images/${filename}`;
      console.log('[PRODUCTS] Badge image uploaded:', badgeUrl);
    }

    // Handle banner image upload
    let bannerUrl = '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg';
    if ((req as any).files && (req as any).files.bannerImage) {
      await ensureUploadDir();
      const uploadedFile = (req as any).files.bannerImage;
      const uploadsDir = path.join(process.cwd(), 'data', 'uploads', 'store-images');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const ext = uploadedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `banner-${parsedUserId}-${Date.now()}.${ext}`;
      const filepath = path.join(uploadsDir, filename);
      
      await uploadedFile.mv(filepath);
      bannerUrl = `/data/uploads/store-images/${filename}`;
      console.log('[PRODUCTS] Banner image uploaded:', bannerUrl);
    }

    // NEW: Check uStore limit for NEW users (is_new_user = 1)
    if (user.is_new_user === 1) {
      const storeCount = await db
        .selectFrom('user_stores')
        .select(db.fn.count('id').as('count'))
        .where('user_id', '=', parsedUserId)
        .executeTakeFirst();

      const currentCount = (storeCount?.count as number) || 0;
      const MAX_STORES_FOR_NEW_USERS = 7;

      if (currentCount >= MAX_STORES_FOR_NEW_USERS) {
        console.log(`[PRODUCTS] NEW USER ${parsedUserId} has reached max uStore limit (${MAX_STORES_FOR_NEW_USERS})`);
        res.status(403).json({ 
          message: `New users can only create a maximum of ${MAX_STORES_FOR_NEW_USERS} stores. You have reached the limit.`,
          current: currentCount,
          max: MAX_STORES_FOR_NEW_USERS
        });
        return;
      }
      console.log(`[PRODUCTS] NEW USER ${parsedUserId} store count: ${currentCount}/${MAX_STORES_FOR_NEW_USERS}`);
    }

    // Create the user store
   const newStore = await db
  .insertInto('user_stores')
  .values({
    user_id: parsedUserId,
    name: name.trim(),
    subtitle: subtitle && subtitle.trim() ? subtitle.trim() : null,
    description: description && description.trim() ? description.trim() : null,
    badge_url: badgeUrl,
    banner_url: bannerUrl,
  })
      .returning(['id', 'user_id', 'name', 'subtitle', 'description', 'created_at'])
      .executeTakeFirstOrThrow();

    console.log(`[PRODUCTS] ✅ Store created successfully: ID=${newStore.id}, name="${newStore.name}", user=${parsedUserId}`);
    
    res.status(201).json({
      id: newStore.id,
      user_id: newStore.user_id,
      name: newStore.name,
      subtitle: newStore.subtitle,
      description: newStore.description,
      created_at: newStore.created_at,
      message: 'Store created successfully',
    });
  } catch (error) {
    console.error('[PRODUCTS] ❌ Error creating store:', error);
    res.status(500).json({ 
      message: 'Failed to create store', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



// GET - Get friends' products for Friends' Stores quadrant
// NEW: Restructured to show uStore hierarchy (friend → uStore → products)
router.get('/friends/stores/all', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    console.log(`[FRIENDS STORES] Fetching friends' uStores and products for user ${req.user.userId}`);

    // Get all friends of the logged-in user
    const friendships = await db
      .selectFrom('friends')
      .selectAll()
      .where((eb) => eb.or([
        eb('user_id1', '=', req.user.userId),
        eb('user_id2', '=', req.user.userId)
      ]))
      .where('status', '=', 'accepted')
      .execute();

    console.log(`[FRIENDS STORES] Found ${friendships.length} friendships`);

    // Extract friend IDs
    const friendIds = friendships.map(f => 
      f.user_id1 === req.user.userId ? f.user_id2 : f.user_id1
    );

    if (friendIds.length === 0) {
      console.log(`[FRIENDS STORES] No friends found`);
      res.json([]);
      return;
    }

    // NEW: Query uStores and their products separately
    const friendsUStoresData = await db
      .selectFrom('user_stores as us')
      .leftJoin(
        'MainHubUpgradeV001ForProducts as p',
        'us.id',
        'p.user_store_id'
      )
      .leftJoin(
        'users as u',
        'us.user_id',
        'u.id'
      )
      .select([
        'us.id',
        'us.user_id',
        'us.name',
        'us.subtitle',
        'us.description',
        'us.badge_url',
        'us.banner_url',
        'us.created_at',
        'u.id as friend_id',
        'u.username as friend_username',
        'u.profile_image_url as friend_profile_image_url',
        'p.id as product_id',
        'p.name as product_name',
        'p.price as product_price',
        'p.image_url as product_image_url',
        'p.description as product_description',
        'p.subtitle as product_subtitle',
        'p.payment_method as product_payment_method',
        'p.payment_url as product_payment_url',
      ])
      .where('us.user_id', 'in', friendIds)
      .where('p.is_in_trash', '=', 0)
      .orderBy('u.username')
      .orderBy('us.created_at', 'desc')
      .orderBy('p.created_at', 'desc')
      .execute();

    console.log(`[FRIENDS STORES] Fetched ${friendsUStoresData.length} records from friends' uStores`);

    // Transform flat results into hierarchical structure: friend → uStore → products
    const friendsMap = new Map<number, any>();
    
    friendsUStoresData.forEach(row => {
      // Create friend entry if not exists
      if (!friendsMap.has(row.friend_id)) {
        friendsMap.set(row.friend_id, {
          friend_id: row.friend_id,
          friend_username: row.friend_username,
          friend_profile_image_url: row.friend_profile_image_url,
          uStores: new Map<number, any>(),  // uStore ID → uStore data
        });
      }

      const friend = friendsMap.get(row.friend_id)!;

      // Create uStore entry if not exists
      if (!friend.uStores.has(row.id)) {
        friend.uStores.set(row.id, {
          id: row.id,
          name: row.name,
          badge_url: row.badge_url,
          banner_url: row.banner_url,
          products: [],
        });
      }

      // Add product to uStore
      if (row.product_id) {
        friend.uStores.get(row.id)!.products.push({
          id: row.product_id,
          name: row.product_name,
          price: row.product_price,
          image_url: row.product_image_url,
          description: row.product_description,
          subtitle: row.product_subtitle,
          payment_method: row.product_payment_method,
          payment_url: row.product_payment_url,
        });
      }
    });

    // Convert Maps to arrays for JSON response
    const result = Array.from(friendsMap.values()).map(friend => ({
      friend_id: friend.friend_id,
      friend_username: friend.friend_username,
      friend_profile_image_url: friend.friend_profile_image_url,
      uStores: Array.from(friend.uStores.values()),
    }));

    console.log(`[FRIENDS STORES] ✅ Fetched ${result.length} friends with hierarchical uStore structure`);
    res.json(result);
  } catch (error) {
    console.error('[FRIENDS STORES] ❌ Error fetching friends products:', error);
    res.status(500).json({ message: 'Failed to fetch friends products' });
  }
});






// PUT - Update uStore badge or banner image
router.put('/user-stores/:userStoreId/:imageType', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { userStoreId, imageType } = req.params;
  const parsedStoreId = parseInt(userStoreId);

  if (imageType !== 'badge' && imageType !== 'banner') {
    res.status(400).json({ message: 'imageType must be "badge" or "banner"' });
    return;
  }

  try {
    // Verify the user store exists and belongs to the user
    const userStore = await db
      .selectFrom('user_stores')
      .selectAll()
      .where('id', '=', parsedStoreId)
      .where('user_id', '=', req.user.userId)
      .executeTakeFirst();

    if (!userStore) {
      res.status(404).json({ message: 'User store not found or does not belong to you' });
      return;
    }

    // Check if file was uploaded
    const files = req.files as any;
    if (!files || !files.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const uploadedFile = files.file;

    // Validate file type
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validMimes.includes(uploadedFile.mimetype)) {
      res.status(400).json({ message: 'Only JPG, JPEG, and PNG files are allowed' });
      return;
    }

    // Validate file size (max 5MB)
    if (uploadedFile.size > 5 * 1024 * 1024) {
      res.status(400).json({ message: 'File size must be less than 5MB' });
      return;
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads', 'store-images');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate filename
    const ext = uploadedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userStoreId}-${imageType}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    await uploadedFile.mv(filePath);
    const imageUrl = `/data/uploads/store-images/${fileName}`;

    console.log(`[PRODUCTS] ✅ Store ${imageType} uploaded: ${imageUrl}`);

    // Update database
    const updateData: any = {};
    updateData[`${imageType}_url`] = imageUrl;

    await db
      .updateTable('user_stores')
      .set(updateData)
      .where('id', '=', parsedStoreId)
      .execute();

    console.log(`[PRODUCTS] ✅ User store ${userStoreId} ${imageType} updated in database`);

    res.status(200).json({
      message: `${imageType} updated successfully`,
      imageUrl,
      userStoreId: parsedStoreId,
    });
  } catch (error) {
    console.error(`[PRODUCTS] Error updating ${imageType}:`, error);
    res.status(500).json({
      message: `Failed to update ${imageType}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});









export default router;
