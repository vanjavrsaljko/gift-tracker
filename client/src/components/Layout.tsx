import React from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  Container,
  Heading,
  HStack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLinks = () => (
    <>
      <Button
        as={RouterLink}
        to="/"
        variant="ghost"
        colorScheme="brand"
        onClick={onClose}
      >
        Dashboard
      </Button>
      <Button
        as={RouterLink}
        to="/contacts"
        variant="ghost"
        colorScheme="brand"
        onClick={onClose}
      >
        Contacts
      </Button>
      <Button
        as={RouterLink}
        to="/wishlist"
        variant="ghost"
        colorScheme="brand"
        onClick={onClose}
      >
        My Wishlist
      </Button>
    </>
  );

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Navigation Bar */}
      <Box bg="white" boxShadow="sm" position="sticky" top={0} zIndex={10}>
        <Container maxW="container.xl">
          <Flex h={16} alignItems="center" justifyContent="space-between">
            {/* Logo */}
            <Heading
              as={RouterLink}
              to="/"
              size="md"
              color="brand.500"
              cursor="pointer"
              _hover={{ color: 'brand.600' }}
            >
              🎁 Gift Tracker
            </Heading>

            {/* Desktop Navigation */}
            <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLinks />
              
              {/* User Menu */}
              <Menu>
                <MenuButton>
                  <HStack spacing={2} cursor="pointer">
                    <Avatar size="sm" name={user?.name} bg="brand.500" />
                    <Text fontSize="sm" fontWeight="medium">
                      {user?.name}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => navigate('/wishlist')}>
                    Share My Wishlist
                  </MenuItem>
                  <MenuItem onClick={handleLogout} color="red.500">
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>

            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              icon={<HamburgerIcon />}
              variant="ghost"
              aria-label="Open menu"
            />
          </Flex>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack>
              <Avatar size="sm" name={user?.name} bg="brand.500" />
              <Text>{user?.name}</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              <NavLinks />
              <Button
                colorScheme="red"
                variant="outline"
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
              >
                Logout
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;
