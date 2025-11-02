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
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { contactsAPI } from '../services/api';
import { Contact } from '../types';

const Contacts: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
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
    </Box>
  );
};

export default Contacts;
