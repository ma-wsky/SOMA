import * as ImagePicker from 'expo-image-picker';
import {useState} from 'react';
import {Alert} from 'react-native';

export function useImagePicker() {
    const [image, setImage] = useState<string | null>(null);

    const launchPicker = async (fromCamera: boolean) => {
        const permissionResult = fromCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Berechtigung erforderlich", "Zugriff verweigert.");
            return null;
        }

        const options: ImagePicker.ImagePickerOptions = {
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        };

        const result = fromCamera
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync(options);

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImage(uri);
            return uri;
        }
        return null;
    };

    const pickImage = (): Promise<string | null> => {
        return new Promise((resolve) => {
            Alert.alert(
                "Bildquelle wählen",
                "Möchtest du ein Foto aufnehmen oder eines aus der Galerie wählen?",
                [
                    {
                        text: "Abbrechen",
                        style: "cancel",
                        onPress: () => resolve(null)
                    },
                    {
                        text: "Galerie",
                        onPress: async () => {
                            const uri = await launchPicker(false);
                            resolve(uri);
                        }
                    },
                    {
                        text: "Kamera",
                        onPress: async () => {
                            const uri = await launchPicker(true);
                            resolve(uri);
                        }
                    }
                ],
                {cancelable: true}
            );
        });
    };

    return {image, setImage, pickImage};
}