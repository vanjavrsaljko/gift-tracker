import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Link,
  Container,
  Divider,
} from '@chakra-ui/react';
import { ExternalLinkIcon, CheckIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { wishlistAPI } from '../services/api';
import { PublicWishlist as PublicWishlistType, WishlistItem } from '../types';

const PublicWishlist: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selectedItem, setSelectedItem] = useState<{ wishlistId: string; itemId: string } | null>(null);
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Fetch public wishlist
  const { data, isLoading, error } = useQuery<PublicWishlistType>({
    queryKey: ['publicWishlist', userId],
    queryFn: () => wishlistAPI.getPublic(userId!),
    enabled: !!userId,
  });

  // Reserve item mutation
  const reserveMutation = useMutation({
    mutationFn: ({ wishlistId, itemId }: { wishlistId: string; itemId: string }) => 
      wishlistAPI.reserve(wishlistId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicWishlist', userId] });
      toast({
        title: 'Item reserved!',
        description: 'The item has been reserved for this person',
        status: 'success',
        duration: 5000,
      });
      setIsReserveOpen(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast({
        title: 'Error reserving item',
        description: 'This item may already be reserved',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const handleReserveClick = (wishlistId: string, itemId: string) => {
    setSelectedItem({ wishlistId, itemId });
    setIsReserveOpen(true);
  };

  const handleReserveConfirm = () => {
    if (selectedItem) {
      reserveMutation.mutate(selectedItem);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading mb={4}>Loading wishlist...</Heading>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Heading size="lg">Wishlist Not Found</Heading>
          <Text color="gray.600">
            This wishlist doesn't exist or is no longer available.
          </Text>
        </VStack>
      </Container>
    );
  }

  const totalItems = data.wishlists.reduce((sum, w) => sum + w.items.length, 0);
  const totalReserved = data.wishlists.reduce((sum, w) => 
    sum + w.items.filter((item: WishlistItem) => item.reserved).length, 0
  );
  const totalAvailable = totalItems - totalReserved;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Heading size="2xl" mb={2}>
            🎁 {data.userName}'s Wishlist
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Help make their wishes come true!
          </Text>
        </Box>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} maxW="md" mx="auto">
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="sm" color="gray.600">Available Items</Text>
              <Text fontSize="3xl" fontWeight="bold" color="green.500">
                {totalAvailable}
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="sm" color="gray.600">Reserved Items</Text>
              <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                {totalReserved}
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Divider />

        {/* Info Box */}
        <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
          <CardBody>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="blue.800">
                ℹ️ How it works:
              </Text>
              <Text fontSize="sm" color="blue.700">
                • Click "Reserve This Item" to let {data.userName} know you'll get it
              </Text>
              <Text fontSize="sm" color="blue.700">
                • Reserved items are hidden from others to avoid duplicates
              </Text>
              <Text fontSize="sm" color="blue.700">
                • {data.userName} will see that someone reserved it, but not who
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Wishlists */}
        {data.wishlists.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.500">
              {data.userName} hasn't created any public wishlists yet.
            </Text>
          </Box>
        ) : (
          <VStack spacing={8} align="stretch">
            {data.wishlists.map((wishlist) => {
              const availableItems = wishlist.items.filter((item: WishlistItem) => !item.reserved);
              const reservedCount = wishlist.items.length - availableItems.length;

              return (
                <Box key={wishlist._id}>
                  {/* Wishlist Header */}
                  <Card mb={4}>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" width="full">
                          <Heading size="lg">{wishlist.name}</Heading>
                          <Badge colorScheme="blue" fontSize="md">
                            {availableItems.length} available
                          </Badge>
                        </HStack>
                        {wishlist.description && (
                          <Text color="gray.600">{wishlist.description}</Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Wishlist Items */}
                  {availableItems.length === 0 ? (
                    <Card bg="orange.50" borderColor="orange.200" borderWidth="1px">
                      <CardBody>
                        <Text textAlign="center" color="orange.800">
                          {reservedCount > 0
                            ? `All items in this wishlist have been reserved! 🎉`
                            : `This wishlist is empty.`}
                        </Text>
                      </CardBody>
                    </Card>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {availableItems.map((item: WishlistItem) => (
                        <Card key={item._id} borderWidth="2px" borderColor="green.200">
                          <CardHeader>
                            <Heading size="md">{item.name}</Heading>
                          </CardHeader>
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              {item.description && (
                                <Text fontSize="sm" color="gray.600">
                                  {item.description}
                                </Text>
                              )}
                              
                              {item.price && (
                                <Text fontSize="xl" fontWeight="bold" color="green.600">
                                  €{item.price.toFixed(2)}
                                </Text>
                              )}

                              {item.link && (
                                <Link
                                  href={item.link}
                                  isExternal
                                  color="blue.500"
                                  fontSize="sm"
                                  display="flex"
                                  alignItems="center"
                                >
                                  View Product <ExternalLinkIcon ml={1} />
                                </Link>
                              )}

                              <Divider />

                              <Button
                                leftIcon={<CheckIcon />}
                                colorScheme="green"
                                onClick={() => handleReserveClick(wishlist._id, item._id)}
                                size="md"
                                width="full"
                              >
                                Reserve This Item
                              </Button>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}

                  {/* Reserved items message for this wishlist */}
                  {reservedCount > 0 && availableItems.length > 0 && (
                    <Card bg="orange.50" borderColor="orange.200" borderWidth="1px" mt={4}>
                      <CardBody>
                        <Text fontSize="sm" color="orange.800" textAlign="center">
                          🎁 {reservedCount} {reservedCount === 1 ? 'item has' : 'items have'} been reserved in this wishlist
                        </Text>
                      </CardBody>
                    </Card>
                  )}
                </Box>
              );
            })}
          </VStack>
        )}
      </VStack>

      {/* Reserve Confirmation Dialog */}
      <AlertDialog
        isOpen={isReserveOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsReserveOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Reserve This Item?
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="start" spacing={3}>
                <Text>
                  By reserving this item, you're letting {data?.userName} know that you plan to get it for them.
                </Text>
                <Text fontWeight="bold" color="orange.600">
                  ⚠️ Important:
                </Text>
                <Text fontSize="sm">
                  • This item will be hidden from others to prevent duplicates
                </Text>
                <Text fontSize="sm">
                  • {data?.userName} will see it's reserved but won't know who reserved it
                </Text>
                <Text fontSize="sm">
                  • Make sure you actually plan to get this item!
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsReserveOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleReserveConfirm}
                ml={3}
                isLoading={reserveMutation.isPending}
              >
                Yes, Reserve It
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default PublicWishlist;
