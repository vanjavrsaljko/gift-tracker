import request from 'supertest';
import createTestApp from '../testApp';

const app = createTestApp();

describe('Wishlists API', () => {
  let token: string;
  let userId: string;
  let wishlistId: string;

  beforeEach(async () => {
    // Register a user and get token
    const response = await request(app).post('/api/users').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    token = response.body.token;
    userId = response.body._id;
  });

  describe('POST /api/wishlists - Create Wishlist', () => {
    it('should create a new wishlist', async () => {
      const wishlistData = {
        name: 'Christmas 2024',
        description: 'My Christmas wishlist',
        visibility: 'public',
      };

      const response = await request(app)
        .post('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .send(wishlistData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', wishlistData.name);
      expect(response.body).toHaveProperty('description', wishlistData.description);
      expect(response.body).toHaveProperty('visibility', wishlistData.visibility);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);

      wishlistId = response.body._id;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/wishlists')
        .send({ name: 'Test Wishlist' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/wishlists - Get All Wishlists', () => {
    beforeEach(async () => {
      // Create a wishlist
      const response = await request(app)
        .post('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Wishlist', visibility: 'public' });
      wishlistId = response.body._id;
    });

    it('should get all user wishlists', async () => {
      const response = await request(app)
        .get('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('visibility');
      expect(response.body[0]).toHaveProperty('items');
    });

    it('should require authentication', async () => {
      await request(app).get('/api/wishlists').expect(401);
    });
  });

  describe('PUT /api/wishlists/:id - Update Wishlist', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Original Name', visibility: 'public' });
      wishlistId = response.body._id;
    });

    it('should update wishlist', async () => {
      const updatedData = {
        name: 'Updated Name',
        description: 'Updated description',
        visibility: 'private',
      };

      const response = await request(app)
        .put(`/api/wishlists/${wishlistId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('name', updatedData.name);
      expect(response.body).toHaveProperty('description', updatedData.description);
      expect(response.body).toHaveProperty('visibility', updatedData.visibility);
    });
  });

  describe('DELETE /api/wishlists/:id - Delete Wishlist', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', visibility: 'public' });
      wishlistId = response.body._id;
    });

    it('should delete wishlist', async () => {
      const response = await request(app)
        .delete(`/api/wishlists/${wishlistId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Wishlist deleted');

      // Verify it's deleted
      const wishlists = await request(app)
        .get('/api/wishlists')
        .set('Authorization', `Bearer ${token}`);

      const deletedWishlist = wishlists.body.find((w: any) => w._id === wishlistId);
      expect(deletedWishlist).toBeUndefined();
    });
  });

  describe('POST /api/wishlists/:id/items - Add Item to Wishlist', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Wishlist', visibility: 'public' });
      wishlistId = response.body._id;
    });

    it('should add item to wishlist', async () => {
      const itemData = {
        name: 'Wireless Headphones',
        description: 'Noise-cancelling headphones',
        link: 'https://example.com/headphones',
        price: 299.99,
      };

      const response = await request(app)
        .post(`/api/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', itemData.name);
      expect(response.body).toHaveProperty('description', itemData.description);
      expect(response.body).toHaveProperty('price', itemData.price);
      expect(response.body).toHaveProperty('reserved', false);
    });
  });

  describe('PUT /api/wishlists/:wishlistId/items/:itemId - Update Item', () => {
    let itemId: string;

    beforeEach(async () => {
      // Create wishlist
      const wishlistResponse = await request(app)
        .post('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Wishlist', visibility: 'public' });
      wishlistId = wishlistResponse.body._id;

      // Add item
      const itemResponse = await request(app)
        .post(`/api/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Original Item', price: 50 });
      itemId = itemResponse.body._id;
    });

    it('should update wishlist item', async () => {
      const updatedData = {
        name: 'Updated Item',
        description: 'Updated description',
        price: 75,
      };

      const response = await request(app)
        .put(`/api/wishlists/${wishlistId}/items/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('name', updatedData.name);
      expect(response.body).toHaveProperty('description', updatedData.description);
      expect(response.body).toHaveProperty('price', updatedData.price);
    });
  });

  describe('DELETE /api/wishlists/:wishlistId/items/:itemId - Delete Item', () => {
    let itemId: string;

    beforeEach(async () => {
      // Create wishlist
      const wishlistResponse = await request(app)
        .post('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Wishlist', visibility: 'public' });
      wishlistId = wishlistResponse.body._id;

      // Add item
      const itemResponse = await request(app)
        .post(`/api/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', price: 50 });
      itemId = itemResponse.body._id;
    });

    it('should delete wishlist item', async () => {
      const response = await request(app)
        .delete(`/api/wishlists/${wishlistId}/items/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Wishlist item removed');

      // Verify item is deleted
      const wishlistResponse = await request(app)
        .get(`/api/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${token}`);

      const deletedItem = wishlistResponse.body.find((item: any) => item._id === itemId);
      expect(deletedItem).toBeUndefined();
    });
  });

  describe('GET /api/wishlists/public/:userId - Get Public Wishlists', () => {
    beforeEach(async () => {
      // Create public wishlist with item
      const wishlistResponse = await request(app)
        .post('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Public Wishlist', visibility: 'public' });
      wishlistId = wishlistResponse.body._id;

      await request(app)
        .post(`/api/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Public Item', price: 100 });

      // Create private wishlist
      await request(app)
        .post('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Private Wishlist', visibility: 'private' });
    });

    it('should get public wishlists for user', async () => {
      const response = await request(app)
        .get(`/api/wishlists/public/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('userName');
      expect(response.body).toHaveProperty('wishlists');
      expect(Array.isArray(response.body.wishlists)).toBe(true);
      
      // Should only show public wishlists
      const privateWishlist = response.body.wishlists.find(
        (w: any) => w.name === 'Private Wishlist'
      );
      expect(privateWishlist).toBeUndefined();

      // Should show public wishlist
      const publicWishlist = response.body.wishlists.find(
        (w: any) => w.name === 'Public Wishlist'
      );
      expect(publicWishlist).toBeDefined();
    });

    it('should not show reserved items in public wishlist', async () => {
      // Add and reserve an item
      const itemResponse = await request(app)
        .post(`/api/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Reserved Item', price: 50 });
      const itemId = itemResponse.body._id;

      await request(app)
        .put(`/api/wishlists/${wishlistId}/items/${itemId}/reserve`)
        .send({ userId: null });

      // Get public wishlists
      const response = await request(app)
        .get(`/api/wishlists/public/${userId}`)
        .expect(200);

      const publicWishlist = response.body.wishlists.find(
        (w: any) => w.name === 'Public Wishlist'
      );

      // Should not show reserved items
      const reservedItem = publicWishlist.items.find(
        (item: any) => item.name === 'Reserved Item'
      );
      expect(reservedItem).toBeUndefined();
    });
  });

  describe('PUT /api/wishlists/:wishlistId/items/:itemId/reserve - Reserve Item', () => {
    let itemId: string;

    beforeEach(async () => {
      // Create wishlist
      const wishlistResponse = await request(app)
        .post('/api/wishlists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Wishlist', visibility: 'public' });
      wishlistId = wishlistResponse.body._id;

      // Add item
      const itemResponse = await request(app)
        .post(`/api/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Item to Reserve', price: 100 });
      itemId = itemResponse.body._id;
    });

    it('should reserve an available item', async () => {
      const response = await request(app)
        .put(`/api/wishlists/${wishlistId}/items/${itemId}/reserve`)
        .send({ userId: null })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Item reserved successfully');
      expect(response.body.item).toHaveProperty('reserved', true);
    });

    it('should not reserve an already reserved item', async () => {
      // Reserve the item first
      await request(app)
        .put(`/api/wishlists/${wishlistId}/items/${itemId}/reserve`)
        .send({ userId: null });

      // Try to reserve again
      const response = await request(app)
        .put(`/api/wishlists/${wishlistId}/items/${itemId}/reserve`)
        .send({ userId: null })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Item already reserved');
    });

    it('should work without authentication (public endpoint)', async () => {
      const response = await request(app)
        .put(`/api/wishlists/${wishlistId}/items/${itemId}/reserve`)
        .send({ userId: null })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Item reserved successfully');
    });
  });
});
