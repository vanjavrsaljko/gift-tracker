import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  VStack,
  HStack,
  Input,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { useQuery } from 'react-query';
import { contactsAPI, wishlistAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: contactsAPI.getAll });
  const { data: wishlists = [] } = useQuery({ queryKey: ['wishlists'], queryFn: wishlistAPI.getAllWishlists });

  const shareLink = user ? `${window.location.origin}/wishlist/${user._id}` : '';

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="xl" mb={2}>
          Welcome back, {user?.name}! 👋
        </Heading>
        <Text color="gray.600">
          Manage your contacts and keep track of gift ideas
        </Text>
      </Box>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Stat
          px={6}
          py={4}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor="gray.200"
        >
          <StatLabel>Total Contacts</StatLabel>
          <StatNumber>{contacts.length}</StatNumber>
          <StatHelpText>People you're tracking</StatHelpText>
        </Stat>

        <Stat
          px={6}
          py={4}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor="gray.200"
        >
          <StatLabel>Wishlist Items</StatLabel>
          <StatNumber>{wishlists.reduce((sum, w) => sum + w.items.length, 0)}</StatNumber>
          <StatHelpText>Items across all wishlists</StatHelpText>
        </Stat>

        <Stat
          px={6}
          py={4}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor="gray.200"
        >
          <StatLabel>Reserved Items</StatLabel>
          <StatNumber>
            {wishlists.reduce((sum, w) => sum + w.items.filter((item) => item.reserved).length, 0)}
          </StatNumber>
          <StatHelpText>Items reserved by others</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Quick Actions */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={4}>
          Quick Actions
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Button
            as={RouterLink}
            to="/contacts"
            leftIcon={<AddIcon />}
            colorScheme="blue"
            size="lg"
            height="auto"
            py={4}
          >
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">Add Contact</Text>
              <Text fontSize="sm" fontWeight="normal">
                Track a new person's interests
              </Text>
            </VStack>
          </Button>

          <Button
            as={RouterLink}
            to="/wishlist"
            leftIcon={<AddIcon />}
            colorScheme="green"
            size="lg"
            height="auto"
            py={4}
          >
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">Add Wishlist Item</Text>
              <Text fontSize="sm" fontWeight="normal">
                Add something you'd like
              </Text>
            </VStack>
          </Button>
        </SimpleGrid>
      </Box>

      {/* Share Wishlist */}
      {wishlists.length > 0 && (
        <Box bg="blue.50" p={6} borderRadius="lg" border="1px" borderColor="blue.200">
          <Heading size="md" mb={2}>
            Share Your Wishlists 🎁
          </Heading>
          <Text mb={4} color="gray.700">
            Share this link with friends and family so they can see your public wishlists and reserve items:
          </Text>
          <HStack>
            <Input
              value={shareLink}
              isReadOnly
              bg="white"
              fontFamily="mono"
              fontSize="sm"
            />
            <Button
              colorScheme="blue"
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                // TODO: Add toast notification
              }}
            >
              Copy Link
            </Button>
          </HStack>
        </Box>
      )}
    </VStack>
  );
};

export default Dashboard;
