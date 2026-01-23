import {Redirect} from "expo-router";
import React, {useEffect, useState} from 'react';
import {onAuthStateChanged, User} from 'firebase/auth';
import {auth} from '@/firebaseConfig';
import LoadingOverlay from "@/components/LoadingOverlay";


export default function Index() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // firebase user change
    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (initializing) setInitializing(false);
        });
    }, []);

    if (initializing) return <LoadingOverlay visible={true}/>

    // is logged in or not
    if (user) {
        return <Redirect href="/(tabs)/HomeScreenProxy"/>;
    } else {
        return <Redirect href="/screens/auth/LandingScreen"/>;
    }
}