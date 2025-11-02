import User from '../../models/User';

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'plainPassword123',
      };

      const user = await User.create(userData);

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toHaveLength(60); // bcrypt hash length
    });

    it('should not rehash password if not modified', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const originalHash = user.password;
      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('matchPassword Method', () => {
    it('should return true for correct password', async () => {
      const password = 'password123';
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password,
      });

      const isMatch = await user.matchPassword(password);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const isMatch = await user.matchPassword('wrongPassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('User Schema Validation', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user).toHaveProperty('_id');
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.wishlist).toEqual([]);
      expect(user.contacts).toEqual([]);
    });

    it('should require name field', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require email field', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require password field', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      await User.create(userData);

      // Try to create another user with same email
      await expect(
        User.create({
          name: 'Another User',
          email: 'test@example.com',
          password: 'password456',
        })
      ).rejects.toThrow();
    });
  });

  describe('Contacts Management', () => {
    it('should add contact to user', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      user.contacts.push({
        name: 'John Doe',
        email: 'john@example.com',
        interests: ['Reading'],
        giftIdeas: [],
      });

      await user.save();

      expect(user.contacts).toHaveLength(1);
      expect(user.contacts[0].name).toBe('John Doe');
      expect(user.contacts[0].interests).toEqual(['Reading']);
    });

    it('should add gift idea to contact', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      user.contacts.push({
        name: 'John Doe',
        interests: [],
        giftIdeas: [
          {
            name: 'Book',
            notes: 'A nice book',
            purchased: false,
          },
        ],
      });

      await user.save();

      expect(user.contacts[0].giftIdeas).toHaveLength(1);
      expect(user.contacts[0].giftIdeas[0].name).toBe('Book');
      expect(user.contacts[0].giftIdeas[0].purchased).toBe(false);
    });
  });

  describe('Wishlist Management', () => {
    it('should add item to wishlist', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      user.wishlist.push({
        name: 'Headphones',
        description: 'Wireless headphones',
        price: 100,
        reserved: false,
      });

      await user.save();

      expect(user.wishlist).toHaveLength(1);
      expect(user.wishlist[0].name).toBe('Headphones');
      expect(user.wishlist[0].reserved).toBe(false);
    });

    it('should mark wishlist item as reserved', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      user.wishlist.push({
        name: 'Headphones',
        reserved: false,
      });

      await user.save();

      user.wishlist[0].reserved = true;
      await user.save();

      expect(user.wishlist[0].reserved).toBe(true);
    });
  });
});
