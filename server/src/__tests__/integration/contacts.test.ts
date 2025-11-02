import request from 'supertest';
import createTestApp from '../testApp';

const app = createTestApp();

describe('Contacts API', () => {
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

  describe('POST /api/contacts - Add Contact', () => {
    it('should add a new contact', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        notes: 'Friend from college',
        interests: ['Reading', 'Gaming'],
      };

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send(contactData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', contactData.name);
      expect(response.body).toHaveProperty('email', contactData.email);
      expect(response.body).toHaveProperty('phone', contactData.phone);
      expect(response.body).toHaveProperty('notes', contactData.notes);
      expect(response.body.interests).toEqual(contactData.interests);
      expect(response.body.giftIdeas).toEqual([]);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send({ name: 'John Doe' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/contacts - Get All Contacts', () => {
    beforeEach(async () => {
      // Add some contacts
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          interests: ['Reading'],
        });

      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Jane Smith',
          interests: ['Cooking'],
        });
    });

    it('should get all contacts for authenticated user', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('interests');
    });

    it('should require authentication', async () => {
      await request(app).get('/api/contacts').expect(401);
    });
  });

  describe('GET /api/contacts/:id - Get Contact by ID', () => {
    let contactId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          interests: ['Reading'],
        });
      contactId = response.body._id;
    });

    it('should get contact by ID', async () => {
      const response = await request(app)
        .get(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', contactId);
      expect(response.body).toHaveProperty('name', 'John Doe');
    });

    it('should return 404 for non-existent contact', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/contacts/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Contact not found');
    });
  });

  describe('PUT /api/contacts/:id - Update Contact', () => {
    let contactId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          interests: ['Reading'],
        });
      contactId = response.body._id;
    });

    it('should update contact', async () => {
      const updatedData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '9876543210',
        notes: 'Updated notes',
        interests: ['Reading', 'Writing'],
      };

      const response = await request(app)
        .put(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('name', updatedData.name);
      expect(response.body).toHaveProperty('email', updatedData.email);
      expect(response.body.interests).toEqual(updatedData.interests);
    });
  });

  describe('DELETE /api/contacts/:id - Delete Contact', () => {
    let contactId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          interests: ['Reading'],
        });
      contactId = response.body._id;
    });

    it('should delete contact', async () => {
      const response = await request(app)
        .delete(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Contact removed');

      // Verify contact is deleted
      await request(app)
        .get(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /api/contacts/:id/gift-ideas - Add Gift Idea', () => {
    let contactId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          interests: ['Reading'],
        });
      contactId = response.body._id;
    });

    it('should add gift idea to contact', async () => {
      const giftIdeaData = {
        name: 'Book: The Great Gatsby',
        notes: 'Mentioned wanting to read this',
      };

      const response = await request(app)
        .post(`/api/contacts/${contactId}/gift-ideas`)
        .set('Authorization', `Bearer ${token}`)
        .send(giftIdeaData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', giftIdeaData.name);
      expect(response.body).toHaveProperty('notes', giftIdeaData.notes);
      expect(response.body).toHaveProperty('purchased', false);
    });
  });

  describe('PUT /api/contacts/:contactId/gift-ideas/:giftIdeaId - Toggle Gift Idea Purchased', () => {
    let contactId: string;
    let giftIdeaId: string;

    beforeEach(async () => {
      // Create contact
      const contactResponse = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          interests: ['Reading'],
        });
      contactId = contactResponse.body._id;

      // Add gift idea
      const giftResponse = await request(app)
        .post(`/api/contacts/${contactId}/gift-ideas`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Book',
          notes: 'A nice book',
        });
      giftIdeaId = giftResponse.body._id;
    });

    it('should toggle gift idea purchased status', async () => {
      // Toggle to purchased
      const response1 = await request(app)
        .put(`/api/contacts/${contactId}/gift-ideas/${giftIdeaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response1.body).toHaveProperty('purchased', true);

      // Toggle back to not purchased
      const response2 = await request(app)
        .put(`/api/contacts/${contactId}/gift-ideas/${giftIdeaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response2.body).toHaveProperty('purchased', false);
    });
  });
});
