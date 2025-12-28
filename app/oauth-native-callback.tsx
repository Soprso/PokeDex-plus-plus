import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function OAuthCallback() {
    const router = useRouter();

    useEffect(() => {
        // Clerk handles the OAuth callback automatically
        // Redirect to profile screen after successful OAuth
        router.replace('/profile');
    }, []);

    return null;
}
