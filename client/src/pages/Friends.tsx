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
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  InputGroup,
  InputLeftElement,
  Spinner,
  Wrap,
  WrapItem,
  Checkbox,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, SearchIcon, CheckIcon, CloseIcon, ExternalLinkIcon, InfoIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { friendAPI } from '../services/api';
import { Friend, FriendRequest, UserSearchResult, ContactData } from '../types';

const Friends: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Modal states
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const { isOpen: isRemoveDialogOpen, onOpen: onRemoveDialogOpen, onClose: onRemoveDialogClose } = useDisclosure();
  const { isOpen: isContactDataModalOpen, onOpen: onContactDataModalOpen, onClose: onContactDataModalClose } = useDisclosure();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [selectedFriendForContactData, setSelectedFriendForContactData] = useState<Friend | null>(null);
  const [contactData, setContactData] = useState<ContactData | null>(null);

  // Fetch friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: friendAPI.getAll,
  });

  // Fetch friend requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: friendAPI.getRequests,
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: friendAPI.sendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast({
        title: 'Friend request sent',
        status: 'success',
        duration: 3000,
      });
      handleSearch(); // Refresh search results
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending request',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: friendAPI.accept,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast({
        title: 'Friend request accepted',
        status: 'success',
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: 'Error accepting request',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Decline request mutation
  const declineMutation = useMutation({
    mutationFn: friendAPI.decline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast({
        title: 'Friend request declined',
        status: 'info',
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: 'Error declining request',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Remove friend mutation
  const removeMutation = useMutation({
    mutationFn: friendAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast({
        title: 'Friend removed',
        status: 'info',
        duration: 3000,
      });
      onRemoveDialogClose();
    },
    onError: () => {
      toast({
        title: 'Error removing friend',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await friendAPI.search(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: 'Error searching users',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = (email: string) => {
    sendRequestMutation.mutate(email);
  };

  const handleAcceptRequest = (requestId: string) => {
    acceptMutation.mutate(requestId);
  };

  const handleDeclineRequest = (requestId: string) => {
    declineMutation.mutate(requestId);
  };

  const handleRemoveFriend = (friend: Friend) => {
    setFriendToRemove(friend);
    onRemoveDialogOpen();
  };

  const confirmRemoveFriend = () => {
    if (friendToRemove) {
      removeMutation.mutate(friendToRemove._id);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'accepted') return <Badge colorScheme="green">Friends</Badge>;
    if (status === 'pending') return <Badge colorScheme="orange">Pending</Badge>;
    if (status === 'declined') return <Badge colorScheme="red">Declined</Badge>;
    return null;
  };

  const handleViewContactData = async (friend: Friend) => {
    try {
      const data = await friendAPI.getContactData(friend.friendId);
      setContactData(data);
      setSelectedFriendForContactData(friend);
      onContactDataModalOpen();
    } catch (error) {
      toast({
        title: 'Error fetching contact data',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box p={8}>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Friends</Heading>
            <Text color="gray.600">Manage your friends and friend requests</Text>
          </VStack>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onAddModalOpen}>
            Add Friend
          </Button>
        </HStack>

        {/* Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              My Friends
              {friends.length > 0 && (
                <Badge ml={2} colorScheme="blue">
                  {friends.length}
                </Badge>
              )}
            </Tab>
            <Tab>
              Friend Requests
              {requests.length > 0 && (
                <Badge ml={2} colorScheme="orange">
                  {requests.length}
                </Badge>
              )}
            </Tab>
          </TabList>

          <TabPanels>
            {/* My Friends Tab */}
            <TabPanel px={0}>
              {friendsLoading ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="xl" />
                </Box>
              ) : friends.length === 0 ? (
                <Card>
                  <CardBody>
                    <VStack spacing={4} py={8}>
                      <Text fontSize="lg" color="gray.500">
                        No friends yet
                      </Text>
                      <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onAddModalOpen}>
                        Add Your First Friend
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {friends.map((friend) => (
                    <Card key={friend._id}>
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" fontSize="lg">
                                {friend.name}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {friend.email}
                              </Text>
                            </VStack>
                            <IconButton
                              aria-label="Remove friend"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleRemoveFriend(friend)}
                            />
                          </HStack>

                          {friend.groups && friend.groups.length > 0 && (
                            <>
                              <Divider />
                              <HStack spacing={2} flexWrap="wrap">
                                {friend.groups.map((group) => (
                                  <Badge key={group} colorScheme="purple">
                                    {group}
                                  </Badge>
                                ))}
                              </HStack>
                            </>
                          )}

                          <Divider />
                          
                          <Text fontSize="xs" color="gray.500">
                            Friends since {new Date(friend.acceptedAt).toLocaleDateString()}
                          </Text>

                          <VStack align="stretch" spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<ExternalLinkIcon />}
                              colorScheme="blue"
                              onClick={() => navigate(`/wishlist/${friend.friendId}`)}
                            >
                              View Wishlist
                            </Button>
                            <Button
                              size="sm"
                              leftIcon={<InfoIcon />}
                              colorScheme="purple"
                              variant="outline"
                              onClick={() => handleViewContactData(friend)}
                            >
                              View Contact Notes
                            </Button>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* Friend Requests Tab */}
            <TabPanel px={0}>
              {requestsLoading ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="xl" />
                </Box>
              ) : requests.length === 0 ? (
                <Card>
                  <CardBody>
                    <VStack spacing={4} py={8}>
                      <Text fontSize="lg" color="gray.500">
                        No pending friend requests
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <VStack spacing={4} align="stretch">
                  {requests.map((request) => (
                    <Card key={request._id}>
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{request.requestedBy.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {request.requestedBy.email}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Requested {new Date(request.requestedAt).toLocaleDateString()}
                            </Text>
                          </VStack>
                          <HStack>
                            <Button
                              leftIcon={<CheckIcon />}
                              colorScheme="green"
                              size="sm"
                              onClick={() => handleAcceptRequest(request._id)}
                              isLoading={acceptMutation.isPending}
                            >
                              Accept
                            </Button>
                            <Button
                              leftIcon={<CloseIcon />}
                              colorScheme="red"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeclineRequest(request._id)}
                              isLoading={declineMutation.isPending}
                            >
                              Decline
                            </Button>
                          </HStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Add Friend Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Friend</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Search by Email</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <SearchIcon color="gray.500" />
                  </InputLeftElement>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter email address"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </InputGroup>
              </FormControl>

              <Button onClick={handleSearch} isLoading={isSearching} colorScheme="blue">
                Search
              </Button>

              <Divider />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <VStack spacing={3} align="stretch">
                  <Text fontWeight="bold">Search Results:</Text>
                  {searchResults.map((user) => (
                    <Card key={user._id} variant="outline">
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{user.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {user.email}
                            </Text>
                          </VStack>
                          <HStack>
                            {getStatusBadge(user.friendshipStatus)}
                            {!user.friendshipStatus && (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleSendRequest(user.email)}
                                isLoading={sendRequestMutation.isPending}
                              >
                                Send Request
                              </Button>
                            )}
                          </HStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && (
                <Text color="gray.500" textAlign="center">
                  No users found
                </Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onAddModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Remove Friend Dialog */}
      <AlertDialog isOpen={isRemoveDialogOpen} leastDestructiveRef={cancelRef} onClose={onRemoveDialogClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Remove Friend</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to remove {friendToRemove?.name} from your friends? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRemoveDialogClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmRemoveFriend}
                ml={3}
                isLoading={removeMutation.isPending}
              >
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Contact Data Modal */}
      <Modal isOpen={isContactDataModalOpen} onClose={onContactDataModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Contact Notes for {selectedFriendForContactData?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {contactData ? (
              <VStack align="stretch" spacing={4}>
                {contactData.interests && contactData.interests.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Interests:
                    </Text>
                    <Wrap>
                      {contactData.interests.map((interest, idx) => (
                        <WrapItem key={idx}>
                          <Badge colorScheme="purple" fontSize="sm">
                            {interest}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {contactData.giftIdeas && contactData.giftIdeas.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Gift Ideas:
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      {contactData.giftIdeas.map((idea) => (
                        <HStack key={idea._id} align="start">
                          <Checkbox isChecked={idea.purchased} isReadOnly>
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
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {(!contactData.interests || contactData.interests.length === 0) &&
                  (!contactData.giftIdeas || contactData.giftIdeas.length === 0) && (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No contact notes available for this friend yet.
                    </Text>
                  )}

                <Box bg="blue.50" p={3} borderRadius="md">
                  <Text fontSize="sm" color="blue.700">
                    💡 These are your personal notes about this friend from your Contacts page.
                  </Text>
                </Box>
              </VStack>
            ) : (
              <Text color="gray.500" textAlign="center" py={4}>
                No contact data linked for this friend.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onContactDataModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Friends;
