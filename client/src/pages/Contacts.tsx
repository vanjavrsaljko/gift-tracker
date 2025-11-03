import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, LinkIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { contactsAPI, friendAPI } from '../services/api';
import { Contact, Friend, LinkSuggestion } from '../types';

const Contacts: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isLinkModalOpen, onOpen: onLinkModalOpen, onClose: onLinkModalClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [contactToLink, setContactToLink] = useState<Contact | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    interests: [] as string[],
  });
  const [newInterest, setNewInterest] = useState('');
  const [newGiftIdea, setNewGiftIdea] = useState({ name: '', notes: '' });
  const [editingGiftIdea, setEditingGiftIdea] = useState<{ contactId: string; ideaId: string; name: string; notes: string } | null>(null);

  // Fetch contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsAPI.getAll,
  });

  // Fetch friends for linking
  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: friendAPI.getAll,
  });

  // Fetch link suggestions
  const { data: linkSuggestions = [] } = useQuery({
    queryKey: ['linkSuggestions'],
    queryFn: contactsAPI.getLinkSuggestions,
  });

  // Create contact mutation
  const createMutation = useMutation({
    mutationFn: contactsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Contact created',
        status: 'success',
        duration: 3000,
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: 'Error creating contact',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Update contact mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) =>
      contactsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Contact updated',
        status: 'success',
        duration: 3000,
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: 'Error updating contact',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: contactsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Contact deleted',
        status: 'success',
        duration: 3000,
      });
      onDeleteClose();
    },
    onError: () => {
      toast({
        title: 'Error deleting contact',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Add gift idea mutation
  const addGiftIdeaMutation = useMutation({
    mutationFn: ({ contactId, giftIdea }: { contactId: string; giftIdea: { name: string; notes: string } }) =>
      contactsAPI.addGiftIdea(contactId, giftIdea),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Gift idea added',
        status: 'success',
        duration: 3000,
      });
      setNewGiftIdea({ name: '', notes: '' });
    },
  });

  // Update gift idea mutation
  const updateGiftIdeaMutation = useMutation({
    mutationFn: ({ contactId, giftIdeaId, giftIdea }: { contactId: string; giftIdeaId: string; giftIdea: { name: string; notes: string } }) =>
      contactsAPI.updateGiftIdea(contactId, giftIdeaId, giftIdea),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Gift idea updated',
        status: 'success',
        duration: 3000,
      });
      setEditingGiftIdea(null);
    },
    onError: () => {
      toast({
        title: 'Error updating gift idea',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Delete gift idea mutation
  const deleteGiftIdeaMutation = useMutation({
    mutationFn: ({ contactId, giftIdeaId }: { contactId: string; giftIdeaId: string }) =>
      contactsAPI.deleteGiftIdea(contactId, giftIdeaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Gift idea deleted',
        status: 'success',
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: 'Error deleting gift idea',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Toggle gift idea purchased
  const togglePurchasedMutation = useMutation({
    mutationFn: ({ contactId, giftIdeaId }: { contactId: string; giftIdeaId: string }) =>
      contactsAPI.toggleGiftIdeaPurchased(contactId, giftIdeaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  // Link contact to friend mutation
  const linkMutation = useMutation({
    mutationFn: ({ contactId, friendId }: { contactId: string; friendId: string }) =>
      contactsAPI.linkToFriend(contactId, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['linkSuggestions'] });
      toast({
        title: 'Contact linked to friend',
        status: 'success',
        duration: 3000,
      });
      onLinkModalClose();
      setContactToLink(null);
      setSelectedFriendId('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error linking contact',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Unlink contact from friend mutation
  const unlinkMutation = useMutation({
    mutationFn: (contactId: string) => contactsAPI.unlinkFromFriend(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['linkSuggestions'] });
      toast({
        title: 'Contact unlinked',
        status: 'info',
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: 'Error unlinking contact',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData({
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        notes: contact.notes || '',
        interests: contact.interests || [],
      });
    } else {
      setSelectedContact(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: '',
        interests: [],
      });
    }
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      notes: '',
      interests: [],
    });
    onClose();
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Name is required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (selectedContact) {
      updateMutation.mutate({ id: selectedContact._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteClick = (contactId: string) => {
    setContactToDelete(contactId);
    onDeleteOpen();
  };

  const handleDeleteConfirm = () => {
    if (contactToDelete) {
      deleteMutation.mutate(contactToDelete);
      setContactToDelete(null);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const handleAddGiftIdea = (contactId: string) => {
    if (newGiftIdea.name.trim()) {
      addGiftIdeaMutation.mutate({ contactId, giftIdea: newGiftIdea });
    }
  };

  const handleOpenLinkModal = (contact: Contact) => {
    setContactToLink(contact);
    setSelectedFriendId('');
    onLinkModalOpen();
  };

  const handleLinkContact = () => {
    if (contactToLink && selectedFriendId) {
      linkMutation.mutate({ contactId: contactToLink._id, friendId: selectedFriendId });
    }
  };

  const handleUnlinkContact = (contactId: string) => {
    if (window.confirm('Are you sure you want to unlink this contact from the friend?')) {
      unlinkMutation.mutate(contactId);
    }
  };

  const getLinkedFriendName = (linkedUserId?: string): string | null => {
    if (!linkedUserId) return null;
    const friend = friends.find((f: Friend) => f.friendId === linkedUserId);
    return friend ? friend.name : null;
  };

  if (isLoading) {
    return (
      <Box>
        <Heading mb={4}>Contacts</Heading>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="xl">Contacts</Heading>
          <Text color="gray.600">Manage your contacts and gift ideas</Text>
        </Box>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => handleOpenModal()}>
          Add Contact
        </Button>
      </HStack>

      {contacts.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            No contacts yet. Add your first contact to get started!
          </Text>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => handleOpenModal()}>
            Add Your First Contact
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {contacts.map((contact: Contact) => (
            <Card key={contact._id}>
              <CardHeader>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Heading size="md">{contact.name}</Heading>
                    <HStack>
                      <IconButton
                        aria-label="Edit contact"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleOpenModal(contact)}
                      />
                      <IconButton
                        aria-label="Delete contact"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(contact._id)}
                      />
                    </HStack>
                  </HStack>
                  {contact.linkedUserId && (
                    <Badge colorScheme="green" display="flex" alignItems="center" gap={1} width="fit-content">
                      <LinkIcon boxSize={3} />
                      Linked to {getLinkedFriendName(contact.linkedUserId)}
                    </Badge>
                  )}
                </VStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  {contact.email && (
                    <Text fontSize="sm" color="gray.600">
                      📧 {contact.email}
                    </Text>
                  )}
                  {contact.phone && (
                    <Text fontSize="sm" color="gray.600">
                      📱 {contact.phone}
                    </Text>
                  )}
                  {contact.notes && (
                    <Text fontSize="sm" color="gray.600">
                      📝 {contact.notes}
                    </Text>
                  )}

                  {contact.interests && contact.interests.length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" mb={2}>
                        Interests:
                      </Text>
                      <Wrap>
                        {contact.interests.map((interest, idx) => (
                          <WrapItem key={idx}>
                            <Badge colorScheme="purple">{interest}</Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  )}

                  <Divider />

                  <Accordion allowToggle>
                    <AccordionItem border="none">
                      <AccordionButton px={0}>
                        <Box flex="1" textAlign="left">
                          <Text fontSize="sm" fontWeight="bold">
                            Gift Ideas ({contact.giftIdeas?.length || 0})
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel px={0}>
                        <VStack align="stretch" spacing={2}>
                          {contact.giftIdeas && contact.giftIdeas.length > 0 ? (
                            contact.giftIdeas.map((idea) => (
                              <HStack key={idea._id} justify="space-between" align="start">
                                <Checkbox
                                  isChecked={idea.purchased}
                                  onChange={() =>
                                    togglePurchasedMutation.mutate({
                                      contactId: contact._id,
                                      giftIdeaId: idea._id,
                                    })
                                  }
                                  flex={1}
                                >
                                  <VStack align="start" spacing={0}>
                                    <Text
                                      fontSize="sm"
                                      textDecoration={idea.purchased ? 'line-through' : 'none'}
                                    >
                                      {idea.name}
                                    </Text>
                                    {idea.notes && (
                                      <Text fontSize="xs" color="gray.500">
                                        {idea.notes}
                                      </Text>
                                    )}
                                  </VStack>
                                </Checkbox>
                                <HStack spacing={1}>
                                  <IconButton
                                    aria-label="Edit gift idea"
                                    icon={<EditIcon />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingGiftIdea({
                                        contactId: contact._id,
                                        ideaId: idea._id,
                                        name: idea.name,
                                        notes: idea.notes || '',
                                      });
                                    }}
                                  />
                                  <IconButton
                                    aria-label="Delete gift idea"
                                    icon={<DeleteIcon />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this gift idea?')) {
                                        deleteGiftIdeaMutation.mutate({
                                          contactId: contact._id,
                                          giftIdeaId: idea._id,
                                        });
                                      }
                                    }}
                                  />
                                </HStack>
                              </HStack>
                            ))
                          ) : (
                            <Text fontSize="sm" color="gray.500">
                              No gift ideas yet
                            </Text>
                          )}

                          <Divider />

                          {editingGiftIdea && editingGiftIdea.contactId === contact._id ? (
                            <VStack align="stretch" spacing={2} bg="blue.50" p={2} borderRadius="md">
                              <Text fontSize="xs" fontWeight="bold" color="blue.600">
                                Editing Gift Idea
                              </Text>
                              <Input
                                size="sm"
                                placeholder="Gift idea name"
                                value={editingGiftIdea.name}
                                onChange={(e) =>
                                  setEditingGiftIdea({ ...editingGiftIdea, name: e.target.value })
                                }
                              />
                              <Input
                                size="sm"
                                placeholder="Notes (optional)"
                                value={editingGiftIdea.notes}
                                onChange={(e) =>
                                  setEditingGiftIdea({ ...editingGiftIdea, notes: e.target.value })
                                }
                              />
                              <HStack>
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => {
                                    updateGiftIdeaMutation.mutate({
                                      contactId: editingGiftIdea.contactId,
                                      giftIdeaId: editingGiftIdea.ideaId,
                                      giftIdea: {
                                        name: editingGiftIdea.name,
                                        notes: editingGiftIdea.notes,
                                      },
                                    });
                                  }}
                                  isLoading={updateGiftIdeaMutation.isPending}
                                  flex={1}
                                >
                                  Update
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingGiftIdea(null)}
                                >
                                  Cancel
                                </Button>
                              </HStack>
                            </VStack>
                          ) : (
                            <VStack align="stretch" spacing={2}>
                              <Input
                                size="sm"
                                placeholder="Gift idea name"
                                value={newGiftIdea.name}
                                onChange={(e) =>
                                  setNewGiftIdea({ ...newGiftIdea, name: e.target.value })
                                }
                              />
                              <Input
                                size="sm"
                                placeholder="Notes (optional)"
                                value={newGiftIdea.notes}
                                onChange={(e) =>
                                  setNewGiftIdea({ ...newGiftIdea, notes: e.target.value })
                                }
                              />
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleAddGiftIdea(contact._id)}
                                isLoading={addGiftIdeaMutation.isPending}
                              >
                                Add Gift Idea
                              </Button>
                            </VStack>
                          )}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>

                  <Divider />

                  {/* Link/Unlink and View Wishlist Buttons */}
                  <VStack align="stretch" spacing={2}>
                    {contact.linkedUserId ? (
                      <>
                        <Button
                          size="sm"
                          leftIcon={<ExternalLinkIcon />}
                          colorScheme="blue"
                          onClick={() => navigate(`/wishlist/${contact.linkedUserId}`)}
                        >
                          View Friend's Wishlist
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="gray"
                          onClick={() => handleUnlinkContact(contact._id)}
                          isLoading={unlinkMutation.isPending}
                        >
                          Unlink Contact
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        leftIcon={<LinkIcon />}
                        colorScheme="green"
                        onClick={() => handleOpenLinkModal(contact)}
                        isDisabled={friends.length === 0}
                      >
                        {friends.length === 0 ? 'No Friends to Link' : 'Link to Friend'}
                      </Button>
                    )}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Add/Edit Contact Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedContact ? 'Edit Contact' : 'Add New Contact'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Interests</FormLabel>
                <HStack>
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                  />
                  <Button onClick={handleAddInterest}>Add</Button>
                </HStack>
                <Wrap mt={2}>
                  {formData.interests.map((interest, idx) => (
                    <WrapItem key={idx}>
                      <Tag size="md" colorScheme="purple" borderRadius="full">
                        <TagLabel>{interest}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveInterest(interest)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {selectedContact ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Contact
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This will permanently delete this contact and all their gift ideas.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Link to Friend Modal */}
      <Modal isOpen={isLinkModalOpen} onClose={onLinkModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Link Contact to Friend</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Link "{contactToLink?.name}" to one of your friends. This will allow you to view their wishlist directly from this contact.
              </Text>
              
              <FormControl isRequired>
                <FormLabel>Select Friend</FormLabel>
                <Box>
                  {friends.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                      You don't have any friends yet. Add friends first to link contacts.
                    </Text>
                  ) : (
                    <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                      {friends.map((friend: Friend) => {
                        // Check if this friend is already linked to another contact
                        const isLinked = contacts.some(
                          (c: Contact) => c.linkedUserId === friend.friendId && c._id !== contactToLink?._id
                        );
                        
                        return (
                          <Card
                            key={friend.friendId}
                            variant={selectedFriendId === friend.friendId ? 'filled' : 'outline'}
                            cursor={isLinked ? 'not-allowed' : 'pointer'}
                            opacity={isLinked ? 0.5 : 1}
                            onClick={() => !isLinked && setSelectedFriendId(friend.friendId)}
                            bg={selectedFriendId === friend.friendId ? 'green.50' : 'white'}
                            borderColor={selectedFriendId === friend.friendId ? 'green.500' : 'gray.200'}
                            _hover={!isLinked ? { borderColor: 'green.300' } : {}}
                          >
                            <CardBody py={3}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{friend.name}</Text>
                                  <Text fontSize="xs" color="gray.500">{friend.email}</Text>
                                </VStack>
                                {isLinked && (
                                  <Badge colorScheme="gray" fontSize="xs">Already Linked</Badge>
                                )}
                                {selectedFriendId === friend.friendId && (
                                  <Badge colorScheme="green">Selected</Badge>
                                )}
                              </HStack>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </VStack>
                  )}
                </Box>
              </FormControl>

              {contactToLink?.email && (
                <Box bg="blue.50" p={3} borderRadius="md">
                  <Text fontSize="sm" color="blue.700">
                    💡 Tip: We'll automatically suggest friends whose email matches this contact's email ({contactToLink.email})
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onLinkModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleLinkContact}
              isDisabled={!selectedFriendId}
              isLoading={linkMutation.isPending}
            >
              Link Contact
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Contacts;
