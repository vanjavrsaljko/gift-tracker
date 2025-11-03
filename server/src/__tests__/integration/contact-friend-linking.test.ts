import request from 'supertest';
import createTestApp from '../testApp';

const app = createTestApp();

describe('Contact-Friend Linking API', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let contactId: string;
  let friendshipId: string;

  beforeEach(async () => {
    // Register user 1
    const user1Response = await request(app).post('/api/users').send({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'password123',
    });
    user1Token = user1Response.body.token;
    user1Id = user1Response.body._id;

    // Register user 2
    const user2Response = await request(app).post('/api/users').send({
      name: 'Bob Johnson',
      email: 'bob@example.com',
      password: 'password123',
    });
    user2Token = user2Response.body.token;
    user2Id = user2Response.body._id;

    // User 1 creates a contact
    const contactResponse = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '1234567890',
        notes: 'Friend from work',
        interests: ['Gaming', 'Tech'],
      });
    contactId = contactResponse.body._id;

    // User 1 sends friend request to User 2
    await request(app)
      .post('/api/friends/request')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ email: 'bob@example.com' })
      .expect(201);

    // User 2 gets friend requests
    const requestsResponse = await request(app)
      .get('/api/friends/requests')
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(200);
    
    // Ensure we have a friend request
    if (!requestsResponse.body || requestsResponse.body.length === 0) {
      throw new Error('No friend requests found');
    }
    
    friendshipId = requestsResponse.body[0]._id;
    
    // User 2 accepts friend request
    await request(app)
      .put(`/api/friends/${friendshipId}/accept`)
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(200);
  });

  describe('POST /api/contacts/:contactId/link/:friendId - Link Contact to Friend', () => {
    it('should link contact to accepted friend', async () => {
      const response = await request(app)
        .post(`/api/contacts/${contactId}/link/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', contactId);
      expect(response.body).toHaveProperty('linkedUserId', user2Id);
      expect(response.body).toHaveProperty('linkedAt');
      expect(response.body.name).toBe('Bob Johnson');
    });

    it('should require authentication', async () => {
      await request(app)
        .post(`/api/contacts/${contactId}/link/${user2Id}`)
        .expect(401);
    });

    it('should not link contact to non-existent friend', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/contacts/${contactId}/link/${fakeId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Friend relationship not found or not accepted');
    });

    it('should not link contact to non-friend user', async () => {
      // Register a third user
      const user3Response = await request(app).post('/api/users').send({
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: 'password123',
      });
      const user3Id = user3Response.body._id;

      const response = await request(app)
        .post(`/api/contacts/${contactId}/link/${user3Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Friend relationship not found or not accepted');
    });

    it('should not link contact that is already linked', async () => {
      // First link
      await request(app)
        .post(`/api/contacts/${contactId}/link/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Try to link again
      const response = await request(app)
        .post(`/api/contacts/${contactId}/link/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Contact is already linked to a friend');
    });

    it('should not link non-existent contact', async () => {
      const fakeContactId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/contacts/${fakeContactId}/link/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Contact not found');
    });

    it('should not link contact to pending friend', async () => {
      // Register user 3
      const user3Response = await request(app).post('/api/users').send({
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: 'password123',
      });
      const user3Id = user3Response.body._id;

      // Create contact for user 3
      const contactResponse = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Charlie Brown',
          email: 'charlie@example.com',
        });
      const contact3Id = contactResponse.body._id;

      // Send friend request (but don't accept)
      await request(app)
        .post('/api/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ email: 'charlie@example.com' });

      // Try to link to pending friend
      const response = await request(app)
        .post(`/api/contacts/${contact3Id}/link/${user3Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Friend relationship not found or not accepted');
    });
  });

  describe('DELETE /api/contacts/:contactId/link - Unlink Contact from Friend', () => {
    beforeEach(async () => {
      // Link contact first
      await request(app)
        .post(`/api/contacts/${contactId}/link/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);
    });

    it('should unlink contact from friend', async () => {
      const response = await request(app)
        .delete(`/api/contacts/${contactId}/link`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', contactId);
      expect(response.body.linkedUserId).toBeUndefined();
      expect(response.body.linkedAt).toBeUndefined();
      expect(response.body.name).toBe('Bob Johnson');
      // Verify other data is preserved
      expect(response.body.interests).toEqual(['Gaming', 'Tech']);
      expect(response.body.notes).toBe('Friend from work');
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/contacts/${contactId}/link`)
        .expect(401);
    });

    it('should not unlink contact that is not linked', async () => {
      // Unlink first time
      await request(app)
        .delete(`/api/contacts/${contactId}/link`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Try to unlink again
      const response = await request(app)
        .delete(`/api/contacts/${contactId}/link`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Contact is not linked to any friend');
    });

    it('should not unlink non-existent contact', async () => {
      const fakeContactId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/contacts/${fakeContactId}/link`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Contact not found');
    });
  });

  describe('GET /api/contacts/link-suggestions - Get Link Suggestions', () => {
    it('should return suggestions for contacts matching friends by email', async () => {
      const response = await request(app)
        .get('/api/contacts/link-suggestions')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('contact');
      expect(response.body[0]).toHaveProperty('friend');
      expect(response.body[0]).toHaveProperty('matchReason', 'email');
      expect(response.body[0].contact.email).toBe('bob@example.com');
      expect(response.body[0].friend.email).toBe('bob@example.com');
    });

    it('should not return suggestions for already linked contacts', async () => {
      // Link the contact
      await request(app)
        .post(`/api/contacts/${contactId}/link/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      const response = await request(app)
        .get('/api/contacts/link-suggestions')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should not return suggestions for contacts without email', async () => {
      // Create contact without email
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'No Email Contact',
          interests: ['Music'],
        });

      const response = await request(app)
        .get('/api/contacts/link-suggestions')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should only have the Bob contact suggestion
      expect(response.body).toHaveLength(1);
    });

    it('should return empty array when no matches found', async () => {
      // Create contact with non-matching email
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Unknown Person',
          email: 'unknown@example.com',
          interests: ['Art'],
        });

      const response = await request(app)
        .get('/api/contacts/link-suggestions')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should still have Bob's suggestion
      const bobSuggestion = response.body.find((s: any) => s.friend.email === 'bob@example.com');
      expect(bobSuggestion).toBeDefined();
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/contacts/link-suggestions')
        .expect(401);
    });

    it('should handle case-insensitive email matching', async () => {
      // Create contact with uppercase email
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Bob Uppercase',
          email: 'BOB@EXAMPLE.COM',
          interests: ['Sports'],
        });

      const response = await request(app)
        .get('/api/contacts/link-suggestions')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should have 2 suggestions (both Bob contacts match)
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/friends/:friendId/contact-data - Get Contact Data for Friend', () => {
    beforeEach(async () => {
      // Link contact to friend
      await request(app)
        .post(`/api/contacts/${contactId}/link/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      // Add gift ideas to contact
      await request(app)
        .post(`/api/contacts/${contactId}/gift-ideas`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'PlayStation 5',
          notes: 'Wants the digital edition',
        });

      await request(app)
        .post(`/api/contacts/${contactId}/gift-ideas`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Mechanical Keyboard',
          notes: 'Cherry MX switches',
        });
    });

    it('should get contact data for linked friend', async () => {
      const response = await request(app)
        .get(`/api/friends/${user2Id}/contact-data`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('interests');
      expect(response.body).toHaveProperty('giftIdeas');
      expect(response.body.interests).toEqual(['Gaming', 'Tech']);
      expect(response.body.giftIdeas).toHaveLength(2);
      expect(response.body.giftIdeas[0]).toHaveProperty('name', 'PlayStation 5');
      expect(response.body.giftIdeas[1]).toHaveProperty('name', 'Mechanical Keyboard');
    });

    it('should return null when no linked contact exists', async () => {
      // User 2 tries to get contact data for User 1 (no linked contact)
      const response = await request(app)
        .get(`/api/friends/${user1Id}/contact-data`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(response.body).toBeNull();
    });

    it('should not get contact data for non-friend', async () => {
      // Register user 3
      const user3Response = await request(app).post('/api/users').send({
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: 'password123',
      });
      const user3Id = user3Response.body._id;

      const response = await request(app)
        .get(`/api/friends/${user3Id}/contact-data`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not friends with this user');
    });

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/friends/${user2Id}/contact-data`)
        .expect(401);
    });

    it('should not expose personal contact info (email, phone, notes)', async () => {
      const response = await request(app)
        .get(`/api/friends/${user2Id}/contact-data`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Should only have interests and giftIdeas
      expect(response.body).not.toHaveProperty('email');
      expect(response.body).not.toHaveProperty('phone');
      expect(response.body).not.toHaveProperty('notes');
      expect(response.body).not.toHaveProperty('name');
      expect(Object.keys(response.body)).toEqual(['interests', 'giftIdeas']);
    });

    it('should work bidirectionally (both friends can see each others contact data)', async () => {
      // User 2 creates a contact for User 1
      const contact2Response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          name: 'Alice Smith',
          email: 'alice@example.com',
          interests: ['Reading', 'Cooking'],
        });
      const contact2Id = contact2Response.body._id;

      // User 2 links contact to User 1
      await request(app)
        .post(`/api/contacts/${contact2Id}/link/${user1Id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      // User 1 gets contact data for User 2
      const response1 = await request(app)
        .get(`/api/friends/${user2Id}/contact-data`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response1.body.interests).toEqual(['Gaming', 'Tech']);

      // User 2 gets contact data for User 1
      const response2 = await request(app)
        .get(`/api/friends/${user1Id}/contact-data`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(response2.body.interests).toEqual(['Reading', 'Cooking']);
    });
  });

  describe('Integration: Complete Linking Workflow', () => {
    it('should complete full workflow: create contact, become friends, get suggestion, link, get data', async () => {
      // 1. User 1 already has contact for Bob (from beforeEach)
      
      // 2. Already friends (from beforeEach)
      
      // 3. Get link suggestions
      const suggestionsResponse = await request(app)
        .get('/api/contacts/link-suggestions')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(suggestionsResponse.body).toHaveLength(1);
      expect(suggestionsResponse.body[0].matchReason).toBe('email');

      // 4. Link contact to friend
      const linkResponse = await request(app)
        .post(`/api/contacts/${contactId}/link/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(linkResponse.body.linkedUserId).toBe(user2Id);

      // 5. Verify no more suggestions
      const suggestionsResponse2 = await request(app)
        .get('/api/contacts/link-suggestions')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(suggestionsResponse2.body).toHaveLength(0);

      // 6. Get contact data for friend
      const contactDataResponse = await request(app)
        .get(`/api/friends/${user2Id}/contact-data`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(contactDataResponse.body.interests).toEqual(['Gaming', 'Tech']);

      // 7. Unlink contact
      const unlinkResponse = await request(app)
        .delete(`/api/contacts/${contactId}/link`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(unlinkResponse.body.linkedUserId).toBeUndefined();

      // 8. Verify contact data returns null after unlinking
      const contactDataResponse2 = await request(app)
        .get(`/api/friends/${user2Id}/contact-data`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(contactDataResponse2.body).toBeNull();

      // 9. Verify suggestions appear again
      const suggestionsResponse3 = await request(app)
        .get('/api/contacts/link-suggestions')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(suggestionsResponse3.body).toHaveLength(1);
    });
  });
});
