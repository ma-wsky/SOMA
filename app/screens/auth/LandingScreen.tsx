import { useRouter } from "expo-router";
import { Text, View,ScrollView } from 'react-native';
import { authStyles } from "@/styles/authStyles";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useGuestLogin } from "@/hooks/useGuestLogin";
import { AuthButton } from "@/components/auth/authButton"
import { DividingLine } from "@/components/auth/dividingLine";


export default function LoginScreen(){

    const router = useRouter();
    const { handleGuestLogin, isGuestLoading } = useGuestLogin();

    return(
        <ScrollView>
        <View style={authStyles.container}>

            {/* Title */}
            <View style={authStyles.titleWrapper}>
                <Text style={authStyles.appnameText}>SOMA</Text>
                <Text style={authStyles.titleText}>Dein Körper. Dein Fortschritt.</Text>
            </View>

            {/* Buttons */}
            <View style={authStyles.buttonWrapper}>

                {/* Register */}
                <AuthButton
                    title="Konto erstellen"
                    onPress={() => router.push("/screens/auth/RegisterScreen")}
                />

                <DividingLine text="Oder" />

                {/* Guest Login */}
                <AuthButton
                    title="Als Gast beitreten"
                    onPress={handleGuestLogin}
                    disabled={isGuestLoading}
                />

            </View>

            {/* Bereits ein Konto */}
            <View style={{marginTop: 50}}>

                <DividingLine text="Bereits ein Konto?" />

                {/* to LoginScreen */}
                <AuthButton
                    title="Einloggen"
                    onPress={() => router.push("/screens/auth/LoginScreen")}
                    variant={"secondary"}
                />

            </View>

            {/* Loading Overlay */}
            <LoadingOverlay visible={isGuestLoading} />
            
        </View>
        </ScrollView>
    );
}