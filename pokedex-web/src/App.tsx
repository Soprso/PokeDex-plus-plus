import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import PokeHub from './pages/PokeHub';
import PokemonDetails from './pages/PokemonDetails';
import Profile from './pages/Profile';
import Shop from './pages/Shop';

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.error("Missing Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/details/:name" element={<PokemonDetails />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/pokehub" element={<PokeHub />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;
