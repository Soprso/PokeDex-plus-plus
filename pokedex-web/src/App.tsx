import { ClerkProvider } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PokeHub from './pages/PokeHub';
import PokemonDetails from './pages/PokemonDetails';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import SSOCallback from './pages/SSOCallback';

// Google Analytics Tracker Component
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag('config', 'G-KNRBNQLS83', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.error("Missing Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/" signInUrl="/">
      <BrowserRouter>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/details/:name" element={<PokemonDetails />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/pokehub" element={<PokeHub />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sso-callback" element={<SSOCallback />} />
          {/* Handle potential typo path just in case */}
          <Route path="/ss-callback" element={<SSOCallback />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;
