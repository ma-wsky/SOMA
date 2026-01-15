import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useImagePicker() {

    const [image, setImage] = useState<string | null>(null);

    const pickImage = async (useCamera: boolean = true) => {
        const permissionResult = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Berechtigung erforderlich", "Der Zugriff auf die Kamera/Galerie wurde verweigert.");
            return null;
        }

        const result = useCamera
            ? await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            })
            : await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImage(uri);
            return uri;
        }
        return null;
    };

    return { image, setImage, pickImage };
}