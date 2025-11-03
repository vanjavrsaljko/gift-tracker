import { Request, Response } from 'express';
import User from '../models/User';
import Friend from '../models/Friend';

// @desc    Add a contact
// @route   POST /api/contacts
// @access  Private
export const addContact = async (req: any, res: Response) => {
  try {
    const { name, email, phone, notes, interests } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
      const contact = {
        name,
        email,
        phone,
        notes,
        interests: interests || [],
        giftIdeas: [],
      };

      user.contacts.push(contact);
      await user.save();

      const newContact = user.contacts[user.contacts.length - 1];
      res.status(201).json(newContact);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
export const getContacts = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('contacts');
    
    if (user) {
      res.json(user.contacts);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get contact by ID
// @route   GET /api/contacts/:id
// @access  Private
export const getContactById = async (req: any, res: Response) => {
  try {
    const user = await User.findOne(
      { _id: req.user._id, 'contacts._id': req.params.id },
      { 'contacts.$': 1 }
    );

    if (user && user.contacts.length > 0) {
      res.json(user.contacts[0]);
    } else {
      res.status(404).json({ message: 'Contact not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a contact
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = async (req: any, res: Response) => {
  try {
    const { name, email, phone, notes, interests } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, 'contacts._id': req.params.id },
      {
        $set: {
          'contacts.$.name': name,
          'contacts.$.email': email,
          'contacts.$.phone': phone,
          'contacts.$.notes': notes,
          'contacts.$.interests': interests || [],
        },
      },
      { new: true }
    );

    if (user) {
      const updatedContact = user.contacts.find(
        (contact: any) => contact._id.toString() === req.params.id
      );
      res.json(updatedContact);
    } else {
      res.status(404).json({ message: 'Contact not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const contactIndex = user.contacts.findIndex(
        (contact: any) => contact._id.toString() === req.params.id
      );

      if (contactIndex !== -1) {
        user.contacts.splice(contactIndex, 1);
        await user.save();
        res.json({ message: 'Contact removed' });
      } else {
        res.status(404).json({ message: 'Contact not found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a gift idea to a contact
// @route   POST /api/contacts/:id/gift-ideas
// @access  Private
export const addGiftIdea = async (req: any, res: Response) => {
  try {
    const { name, notes } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
      const contact = user.contacts.find(
        (c: any) => c._id.toString() === req.params.id
      );

      if (contact) {
        contact.giftIdeas.push({
          name,
          notes,
          purchased: false,
        });

        await user.save();

        const newGiftIdea = contact.giftIdeas[contact.giftIdeas.length - 1];
        res.status(201).json(newGiftIdea);
      } else {
        res.status(404).json({ message: 'Contact not found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle gift idea purchased status
// @route   PUT /api/contacts/:contactId/gift-ideas/:giftIdeaId
// @access  Private
export const toggleGiftIdeaPurchased = async (req: any, res: Response) => {
  try {
    try {
      const user = await User.findOne({
        _id: req.user._id,
        'contacts._id': req.params.contactId,
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const contact = user.contacts.find(
        (c: any) => c._id.toString() === req.params.contactId
      );

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      const giftIdea = contact.giftIdeas.find(
        (g: any) => g._id.toString() === req.params.giftIdeaId
      );

      if (!giftIdea) {
        return res.status(404).json({ message: 'Gift idea not found' });
      }

      giftIdea.purchased = !giftIdea.purchased;
      await user.save();
      
      res.json(giftIdea);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a gift idea
// @route   PUT /api/contacts/:contactId/gift-ideas/:giftIdeaId/update
// @access  Private
export const updateGiftIdea = async (req: any, res: Response) => {
  try {
    const { name, notes } = req.body;

    const user = await User.findOne({
      _id: req.user._id,
      'contacts._id': req.params.contactId,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const contact = user.contacts.find(
      (c: any) => c._id.toString() === req.params.contactId
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const giftIdea = contact.giftIdeas.find(
      (g: any) => g._id.toString() === req.params.giftIdeaId
    );

    if (!giftIdea) {
      return res.status(404).json({ message: 'Gift idea not found' });
    }

    giftIdea.name = name || giftIdea.name;
    giftIdea.notes = notes !== undefined ? notes : giftIdea.notes;
    
    await user.save();
    
    res.json(giftIdea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a gift idea
// @route   DELETE /api/contacts/:contactId/gift-ideas/:giftIdeaId
// @access  Private
export const deleteGiftIdea = async (req: any, res: Response) => {
  try {
    const user = await User.findOne({
      _id: req.user._id,
      'contacts._id': req.params.contactId,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const contact = user.contacts.find(
      (c: any) => c._id.toString() === req.params.contactId
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const giftIdeaIndex = contact.giftIdeas.findIndex(
      (g: any) => g._id.toString() === req.params.giftIdeaId
    );

    if (giftIdeaIndex === -1) {
      return res.status(404).json({ message: 'Gift idea not found' });
    }

    contact.giftIdeas.splice(giftIdeaIndex, 1);
    await user.save();
    
    res.json({ message: 'Gift idea deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Link contact to friend
// @route   POST /api/contacts/:contactId/link/:friendId
// @access  Private
export const linkContactToFriend = async (req: any, res: Response) => {
  try {
    const { contactId, friendId } = req.params;
    const userId = req.user._id;

    // Find user and contact
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const contact = user.contacts.find(
      (c: any) => c._id.toString() === contactId
    );
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check if contact is already linked
    if (contact.linkedUserId) {
      return res.status(400).json({ message: 'Contact is already linked to a friend' });
    }

    // Verify friendship exists and is accepted
    const friendship = await Friend.findOne({
      $or: [
        { userId: userId, friendId: friendId, status: 'accepted' },
        { userId: friendId, friendId: userId, status: 'accepted' }
      ]
    });

    if (!friendship) {
      return res.status(400).json({ message: 'Friend relationship not found or not accepted' });
    }

    // Optional: Verify email match if both exist
    const friendUser = await User.findById(friendId);
    if (contact.email && friendUser?.email) {
      if (contact.email.toLowerCase() !== friendUser.email.toLowerCase()) {
        // Warning but not blocking
        console.warn(`Email mismatch: contact ${contact.email} vs friend ${friendUser.email}`);
      }
    }

    // Link contact to friend
    contact.linkedUserId = friendId;
    contact.linkedAt = new Date();
    await user.save();

    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unlink contact from friend
// @route   DELETE /api/contacts/:contactId/link
// @access  Private
export const unlinkContactFromFriend = async (req: any, res: Response) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const contact = user.contacts.find(
      (c: any) => c._id.toString() === contactId
    );
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (!contact.linkedUserId) {
      return res.status(400).json({ message: 'Contact is not linked to any friend' });
    }

    // Unlink contact
    contact.linkedUserId = undefined;
    contact.linkedAt = undefined;
    await user.save();

    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get link suggestions (contacts that match friends by email)
// @route   GET /api/contacts/link-suggestions
// @access  Private
export const getLinkSuggestions = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    // Get user with contacts
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get unlinked contacts with email
    const unlinkedContacts = user.contacts.filter(
      (c: any) => !c.linkedUserId && c.email
    );

    if (unlinkedContacts.length === 0) {
      return res.json([]);
    }

    // Get accepted friends
    const friendships = await Friend.find({
      $or: [
        { userId: userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' }
      ]
    });

    const friendIds = friendships.map(f => 
      f.userId.toString() === userId.toString() ? f.friendId : f.userId
    );

    // Get friend user data
    const friends = await User.find({ _id: { $in: friendIds } }).select('name email');

    // Match contacts to friends by email
    const suggestions = [];
    for (const contact of unlinkedContacts) {
      const matchingFriend = friends.find(
        f => f.email.toLowerCase() === contact.email?.toLowerCase()
      );

      if (matchingFriend) {
        suggestions.push({
          contact: contact,
          friend: {
            _id: matchingFriend._id,
            name: matchingFriend.name,
            email: matchingFriend.email
          },
          matchReason: 'email'
        });
      }
    }

    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
