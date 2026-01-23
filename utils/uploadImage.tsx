import {getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";

export const uploadImage = async (uri: string, path: string) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error("Upload Fehler:", error);
        throw error;
    }
};