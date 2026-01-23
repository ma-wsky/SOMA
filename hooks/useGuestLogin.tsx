import {useState} from 'react';
import {signInAnonymously} from 'firebase/auth';
import {auth} from '@/firebaseConfig';
import {useRouter} from 'expo-router';
import {Alert} from 'react-native';

export const useGuestLogin = () => {
    const [isGuestLoading, setIsGuestLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleGuestLogin = async () => {
        setIsGuestLoading(true);
        try {
            await signInAnonymously(auth);
            Alert.alert("Geschafft!", "Als Gast angemeldet.");
            router.replace("/(tabs)/HomeScreenProxy");
        } catch (error: any) {
            console.error("Login error:", error.code);
            Alert.alert("Fehler", "Gast-Login fehlgeschlagen.");
        } finally {
            setIsGuestLoading(false);
        }
    };

    return {handleGuestLogin, isGuestLoading};
};

