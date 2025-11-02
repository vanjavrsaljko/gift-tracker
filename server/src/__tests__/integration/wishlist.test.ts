import request from 'supertest';
import createTestApp from '../testApp';

const app = createTestApp();

describe('Wishlist API', () => {
  let token: string;
  let userId: string;

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

  describe('POST /api/wishlist - Add Wishlist Item', () => {
    it('should add a new wishlist item', async () => {
      const itemData = {
        name: 'Wireless Headphones',
        description: 'Noise-cancelling over-ear headphones',
        link: 'https://example.com/headphones',
        price: 299.99,
      };

      const response = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', itemData.name);
      expect(response.body).toHaveProperty('description', itemData.description);
      expect(response.body).toHaveProperty('link', itemData.link);
      expect(response.body).toHaveProperty('price', itemData.price);
      expect(response.body).toHaveProperty('reserved', false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/wishlist')
        .send({ name: 'Item' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/wishlist - Get User Wishlist', () => {
    beforeEach(async () => {
      // Add some wishlist items
      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Item 1',
          price: 50,
        });

      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Item 2',
          price: 100,
        });
    });

    it('should get all wishlist items for authenticated user', async () => {
      const response = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('reserved');
    });

    it('should require authentication', async () => {
      await request(app).get('/api/wishlist').expect(401);
    });
  });

  describe('GET /api/wishlist/public/:userId - Get Public Wishlist', () => {
    beforeEach(async () => {
      // Add wishlist items
      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Available Item',
          price: 50,
        });

      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Reserved Item',
          price: 100,
        });
    });

    it('should get public wishlist without authentication', async () => {
      const response = await request(app)
        .get(`/api/wishlist/public/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('userName', 'Test User');
      expect(response.body).toHaveProperty('wishlist');
      expect(Array.isArray(response.body.wishlist)).toBe(true);
    });

    it('should not show reserved items in public wishlist', async () => {
      // Get all items first
      const allItems = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`);

      const itemId = allItems.body[0]._id;

      // Reserve an item
      await request(app)
        .put(`/api/wishlist/${itemId}/reserve`)
        .send({ userId: null });

      // Get public wishlist
      const response = await request(app)
        .get(`/api/wishlist/public/${userId}`)
        .expect(200);

      // Should only show non-reserved items
      const reservedItems = response.body.wishlist.filter((item: any) => item.reserved);
      expect(reservedItems).toHaveLength(0);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/wishlist/public/${fakeUserId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('PUT /api/wishlist/:id - Update Wishlist Item', () => {
    let itemId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Original Item',
          price: 50,
        });
      itemId = response.body._id;
    });

    it('should update wishlist item', async () => {
      const updatedData = {
        name: 'Updated Item',
        description: 'Updated description',
        link: 'https://example.com/updated',
        price: 75,
      };

      const response = await request(app)
        .put(`/api/wishlist/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('name', updatedData.name);
      expect(response.body).toHaveProperty('description', updatedData.description);
      expect(response.body).toHaveProperty('price', updatedData.price);
    });
  });

  describe('PUT /api/wishlist/:id/reserve - Reserve Wishlist Item', () => {
    let itemId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Item to Reserve',
          price: 50,
        });
      itemId = response.body._id;
    });

    it('should reserve an available item', async () => {
      const response = await request(app)
        .put(`/api/wishlist/${itemId}/reserve`)
        .send({ userId: null })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Item reserved successfully');
      expect(response.body.item).toHaveProperty('reserved', true);
    });

    it('should not reserve an already reserved item', async () => {
      // Reserve the item first
      await request(app)
        .put(`/api/wishlist/${itemId}/reserve`)
        .send({ userId: null });

      // Try to reserve again
      const response = await request(app)
        .put(`/api/wishlist/${itemId}/reserve`)
        .send({ userId: null })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Item not found or already reserved');
    });

    it('should work without authentication (public endpoint)', async () => {
      const response = await request(app)
        .put(`/api/wishlist/${itemId}/reserve`)
        .send({ userId: null })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Item reserved successfully');
    });
  });

  describe('DELETE /api/wishlist/:id - Delete Wishlist Item', () => {
    let itemId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Item to Delete',
          price: 50,
        });
      itemId = response.body._id;
    });

    it('should delete wishlist item', async () => {
      const response = await request(app)
        .delete(`/api/wishlist/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Wishlist item removed');

      // Verify item is deleted
      const wishlist = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`);

      const deletedItem = wishlist.body.find((item: any) => item._id === itemId);
      expect(deletedItem).toBeUndefined();
    });

    it('should require authentication', async () => {
      await request(app).delete(`/api/wishlist/${itemId}`).expect(401);
    });
  });
});
