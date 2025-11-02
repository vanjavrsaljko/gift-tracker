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
  InputGroup,
  InputLeftElement,
  Link,
  Divider,
  useClipboard,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Switch,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, LinkIcon, ExternalLinkIcon, CopyIcon, CheckIcon, SettingsIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { wishlistAPI } from '../services/api';
import { Wishlist, WishlistItem } from '../types';
import { useAuth } from '../context/AuthContext';

const WishlistPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();
  
  // Modal states
  const { isOpen: isWishlistModalOpen, onOpen: onWishlistModalOpen, onClose: onWishlistModalClose } = useDisclosure();
  const { isOpen: isItemModalOpen, onOpen: onItemModalOpen, onClose: onItemModalClose } = useDisclosure();
  const { isOpen: isDeleteWishlistOpen, onOpen: onDeleteWishlistOpen, onClose: onDeleteWishlistClose } = useDisclosure();
  const { isOpen: isDeleteItemOpen, onOpen: onDeleteItemOpen, onClose: onDeleteItemClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // State
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [editingWishlist, setEditingWishlist] = useState<Wishlist | null>(null);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [wishlistToDelete, setWishlistToDelete] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ wishlistId: string; itemId: string } | null>(null);
  
  const [wishlistFormData, setWishlistFormData] = useState({
    name: '',
    description: '',
    visibility: 'public' as 'public' | 'private',
  });

  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    link: '',
    price: '',
  });

  const shareLink = user ? `${window.location.origin}/wishlist/${user._id}` : '';
  const { hasCopied, onCopy } = useClipboard(shareLink);

  // Fetch all wishlists
  const { data: wishlists = [], isLoading } = useQuery({
    queryKey: ['wishlists'],
    queryFn: wishlistAPI.getAllWishlists,
  });

  // Set first wishlist as selected when data loads
  React.useEffect(() => {
    if (wishlists.length > 0 && !selectedWishlist) {
      setSelectedWishlist(wishlists[0]);
    }
  }, [wishlists, selectedWishlist]);

  // Wishlist mutations
  const createWishlistMutation = useMutation({
    mutationFn: wishlistAPI.createWishlist,
    onSuccess: (newWishlist) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      setSelectedWishlist(newWishlist);
      toast({
        title: 'Wishlist created',
        status: 'success',
        duration: 3000,
      });
      onWishlistModalClose();
      resetWishlistForm();
    },
    onError: () => {
      toast({
        title: 'Error creating wishlist',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const updateWishlistMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => wishlistAPI.updateWishlist(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      toast({
        title: 'Wishlist updated',
        status: 'success',
        duration: 3000,
      });
      onWishlistModalClose();
      resetWishlistForm();
    },
    onError: () => {
      toast({
        title: 'Error updating wishlist',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const deleteWishlistMutation = useMutation({
    mutationFn: wishlistAPI.deleteWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      setSelectedWishlist(null);
      toast({
        title: 'Wishlist deleted',
        status: 'success',
        duration: 3000,
      });
      onDeleteWishlistClose();
    },
    onError: () => {
      toast({
        title: 'Error deleting wishlist',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Item mutations
  const createItemMutation = useMutation({
    mutationFn: ({ wishlistId, item }: { wishlistId: string; item: any }) =>
      wishlistAPI.createItem(wishlistId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      toast({
        title: 'Item added',
        status: 'success',
        duration: 3000,
      });
      onItemModalClose();
      resetItemForm();
    },
    onError: () => {
      toast({
        title: 'Error adding item',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ wishlistId, itemId, item }: { wishlistId: string; itemId: string; item: any }) =>
      wishlistAPI.updateItem(wishlistId, itemId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      toast({
        title: 'Item updated',
        status: 'success',
        duration: 3000,
      });
      onItemModalClose();
      resetItemForm();
    },
    onError: () => {
      toast({
        title: 'Error updating item',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ wishlistId, itemId }: { wishlistId: string; itemId: string }) =>
      wishlistAPI.deleteItem(wishlistId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      toast({
        title: 'Item deleted',
        status: 'success',
        duration: 3000,
      });
      onDeleteItemClose();
    },
    onError: () => {
      toast({
        title: 'Error deleting item',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Form handlers
  const resetWishlistForm = () => {
    setWishlistFormData({ name: '', description: '', visibility: 'public' });
    setEditingWishlist(null);
  };

  const resetItemForm = () => {
    setItemFormData({ name: '', description: '', link: '', price: '' });
    setSelectedItem(null);
  };

  const handleCreateWishlist = () => {
    setEditingWishlist(null);
    resetWishlistForm();
    onWishlistModalOpen();
  };

  const handleEditWishlist = (wishlist: Wishlist) => {
    setEditingWishlist(wishlist);
    setWishlistFormData({
      name: wishlist.name,
      description: wishlist.description || '',
      visibility: wishlist.visibility,
    });
    onWishlistModalOpen();
  };

  const handleDeleteWishlist = (wishlistId: string) => {
    setWishlistToDelete(wishlistId);
    onDeleteWishlistOpen();
  };

  const handleWishlistSubmit = () => {
    if (editingWishlist) {
      updateWishlistMutation.mutate({
        id: editingWishlist._id,
        data: wishlistFormData,
      });
    } else {
      createWishlistMutation.mutate(wishlistFormData);
    }
  };

  const handleAddItem = () => {
    if (!selectedWishlist) {
      toast({
        title: 'Please select a wishlist first',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    setSelectedItem(null);
    resetItemForm();
    onItemModalOpen();
  };

  const handleEditItem = (item: WishlistItem) => {
    setSelectedItem(item);
    setItemFormData({
      name: item.name,
      description: item.description || '',
      link: item.link || '',
      price: item.price?.toString() || '',
    });
    onItemModalOpen();
  };

  const handleDeleteItem = (wishlistId: string, itemId: string) => {
    setItemToDelete({ wishlistId, itemId });
    onDeleteItemOpen();
  };

  const handleItemSubmit = () => {
    if (!selectedWishlist) return;

    const itemData = {
      ...itemFormData,
      price: itemFormData.price ? parseFloat(itemFormData.price) : undefined,
    };

    if (selectedItem) {
      updateItemMutation.mutate({
        wishlistId: selectedWishlist._id,
        itemId: selectedItem._id,
        item: itemData,
      });
    } else {
      createItemMutation.mutate({
        wishlistId: selectedWishlist._id,
        item: itemData,
      });
    }
  };

  const currentWishlist = wishlists.find(w => w._id === selectedWishlist?._id) || selectedWishlist;
  const items = currentWishlist?.items || [];
  const totalItems = items.length;
  const reservedItems = items.filter(item => item.reserved).length;
  const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0);

  if (isLoading) {
    return (
      <Box p={8}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg">My Wishlists</Heading>
            <Text color="gray.600">Manage your wishlists and share them with others</Text>
          </VStack>
          <HStack>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreateWishlist}>
              New Wishlist
            </Button>
          </HStack>
        </HStack>

        {/* Share Link */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="bold">Share Your Public Wishlists</Text>
                <Badge colorScheme="green">Public Link</Badge>
              </HStack>
              <InputGroup>
                <InputLeftElement>
                  <LinkIcon color="gray.500" />
                </InputLeftElement>
                <Input value={shareLink} isReadOnly />
                <Button
                  ml={2}
                  leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                  onClick={onCopy}
                  colorScheme={hasCopied ? 'green' : 'blue'}
                >
                  {hasCopied ? 'Copied!' : 'Copy'}
                </Button>
              </InputGroup>
              <Text fontSize="sm" color="gray.500">
                Anyone with this link can view your public wishlists and reserve items
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Wishlists */}
        {wishlists.length === 0 ? (
          <Card>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Text fontSize="lg" color="gray.500">
                  No wishlists yet
                </Text>
                <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreateWishlist}>
                  Create Your First Wishlist
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Wishlist Tabs */}
            <Tabs
              variant="enclosed"
              colorScheme="blue"
              index={wishlists.findIndex(w => w._id === selectedWishlist?._id)}
              onChange={(index) => setSelectedWishlist(wishlists[index])}
            >
              <TabList>
                {wishlists.map((wishlist) => (
                  <Tab key={wishlist._id}>
                    <HStack spacing={2}>
                      <Text>{wishlist.name}</Text>
                      <Badge colorScheme={wishlist.visibility === 'public' ? 'green' : 'orange'} fontSize="xs">
                        {wishlist.visibility}
                      </Badge>
                      <Badge>{wishlist.items.length}</Badge>
                    </HStack>
                  </Tab>
                ))}
              </TabList>

              <TabPanels>
                {wishlists.map((wishlist) => (
                  <TabPanel key={wishlist._id} px={0}>
                    {selectedWishlist?._id === wishlist._id && (
                      <VStack align="stretch" spacing={4}>
                        {/* Wishlist Header */}
                        <Card>
                          <CardBody>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Heading size="md">{wishlist.name}</Heading>
                                {wishlist.description && (
                                  <Text color="gray.600">{wishlist.description}</Text>
                                )}
                              </VStack>
                              <HStack>
                                <IconButton
                                  aria-label="Edit wishlist"
                                  icon={<SettingsIcon />}
                                  onClick={() => handleEditWishlist(wishlist)}
                                />
                                <IconButton
                                  aria-label="Delete wishlist"
                                  icon={<DeleteIcon />}
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleDeleteWishlist(wishlist._id)}
                                />
                              </HStack>
                            </HStack>
                          </CardBody>
                        </Card>

                        {/* Stats */}
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Card>
                            <CardBody>
                              <Text fontSize="sm" color="gray.600">
                                Total Items
                              </Text>
                              <Text fontSize="2xl" fontWeight="bold">
                                {totalItems}
                              </Text>
                            </CardBody>
                          </Card>
                          <Card>
                            <CardBody>
                              <Text fontSize="sm" color="gray.600">
                                Reserved
                              </Text>
                              <Text fontSize="2xl" fontWeight="bold">
                                {reservedItems}
                              </Text>
                            </CardBody>
                          </Card>
                          <Card>
                            <CardBody>
                              <Text fontSize="sm" color="gray.600">
                                Total Value
                              </Text>
                              <Text fontSize="2xl" fontWeight="bold">
                                €{totalValue.toFixed(2)}
                              </Text>
                            </CardBody>
                          </Card>
                        </SimpleGrid>

                        {/* Items */}
                        <Card>
                          <CardHeader>
                            <HStack justify="space-between">
                              <Heading size="md">Items</Heading>
                              <Button leftIcon={<AddIcon />} colorScheme="green" size="sm" onClick={handleAddItem}>
                                Add Item
                              </Button>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            {items.length === 0 ? (
                              <VStack py={8}>
                                <Text color="gray.500">No items in this wishlist</Text>
                                <Button leftIcon={<AddIcon />} colorScheme="green" size="sm" onClick={handleAddItem}>
                                  Add Your First Item
                                </Button>
                              </VStack>
                            ) : (
                              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                {items.map((item) => (
                                  <Card key={item._id} variant="outline">
                                    <CardBody>
                                      <VStack align="stretch" spacing={3}>
                                        <HStack justify="space-between">
                                          <Heading size="sm">{item.name}</Heading>
                                          {item.reserved && (
                                            <Badge colorScheme="orange">Reserved</Badge>
                                          )}
                                        </HStack>

                                        {item.description && (
                                          <Text fontSize="sm" color="gray.600">
                                            {item.description}
                                          </Text>
                                        )}

                                        {item.price && (
                                          <Text fontWeight="bold" color="blue.600">
                                            €{item.price.toFixed(2)}
                                          </Text>
                                        )}

                                        {item.link && (
                                          <Link href={item.link} isExternal color="blue.500" fontSize="sm">
                                            <HStack>
                                              <ExternalLinkIcon />
                                              <Text>View Item</Text>
                                            </HStack>
                                          </Link>
                                        )}

                                        {item.reserved && (
                                          <Text fontSize="xs" color="orange.600" fontStyle="italic">
                                            This item has been reserved by someone
                                          </Text>
                                        )}

                                        <Divider />

                                        <HStack justify="flex-end">
                                          <IconButton
                                            aria-label="Edit item"
                                            icon={<EditIcon />}
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEditItem(item)}
                                            isDisabled={item.reserved}
                                          />
                                          <IconButton
                                            aria-label="Delete item"
                                            icon={<DeleteIcon />}
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="red"
                                            onClick={() => handleDeleteItem(wishlist._id, item._id)}
                                            isDisabled={item.reserved}
                                          />
                                        </HStack>
                                      </VStack>
                                    </CardBody>
                                  </Card>
                                ))}
                              </SimpleGrid>
                            )}
                          </CardBody>
                        </Card>
                      </VStack>
                    )}
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </>
        )}
      </VStack>

      {/* Wishlist Modal */}
      <Modal isOpen={isWishlistModalOpen} onClose={onWishlistModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingWishlist ? 'Edit Wishlist' : 'Create Wishlist'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={wishlistFormData.name}
                  onChange={(e) => setWishlistFormData({ ...wishlistFormData, name: e.target.value })}
                  placeholder="e.g., Christmas 2024, Wedding, Birthday"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={wishlistFormData.description}
                  onChange={(e) => setWishlistFormData({ ...wishlistFormData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Visibility</FormLabel>
                <Select
                  value={wishlistFormData.visibility}
                  onChange={(e) => setWishlistFormData({ ...wishlistFormData, visibility: e.target.value as 'public' | 'private' })}
                >
                  <option value="public">Public - Anyone with link can view</option>
                  <option value="private">Private - Only specific friends (coming soon)</option>
                </Select>
                {wishlistFormData.visibility === 'private' && (
                  <Text fontSize="sm" color="orange.500" mt={2}>
                    Note: Private wishlist sharing with friends is coming soon. For now, private wishlists won't be visible in your public link.
                  </Text>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onWishlistModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleWishlistSubmit}
              isLoading={createWishlistMutation.isPending || updateWishlistMutation.isPending}
            >
              {editingWishlist ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Item Modal */}
      <Modal isOpen={isItemModalOpen} onClose={onItemModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedItem ? 'Edit Item' : 'Add Item'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                  placeholder="Item name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Link</FormLabel>
                <Input
                  value={itemFormData.link}
                  onChange={(e) => setItemFormData({ ...itemFormData, link: e.target.value })}
                  placeholder="https://..."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Price (€)</FormLabel>
                <Input
                  type="number"
                  value={itemFormData.price}
                  onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value })}
                  placeholder="0.00"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onItemModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleItemSubmit}
              isLoading={createItemMutation.isPending || updateItemMutation.isPending}
            >
              {selectedItem ? 'Update' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Wishlist Dialog */}
      <AlertDialog
        isOpen={isDeleteWishlistOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteWishlistClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Wishlist</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This will delete the wishlist and all its items. This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteWishlistClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  if (wishlistToDelete) {
                    deleteWishlistMutation.mutate(wishlistToDelete);
                  }
                }}
                ml={3}
                isLoading={deleteWishlistMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Delete Item Dialog */}
      <AlertDialog
        isOpen={isDeleteItemOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteItemClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Item</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteItemClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  if (itemToDelete) {
                    deleteItemMutation.mutate(itemToDelete);
                  }
                }}
                ml={3}
                isLoading={deleteItemMutation.isPending}
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

export default WishlistPage;
