import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Wishlist from './pages/Wishlist';
import PublicWishlist from './pages/PublicWishlist';
import Friends from './pages/Friends';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Box minH="100vh" bg="gray.50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/wishlist/:userId" element={<PublicWishlist />} />
                
                {/* Protected Routes */}
                <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/friends" element={<Friends />} />
                </Route>
              </Routes>
            </Box>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
