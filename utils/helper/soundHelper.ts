import { createAudioPlayer } from 'expo-audio';
import { isSoundEnabled } from '@/utils/store/settingsStore';

export const playSound = async (soundFile: any) => {
    // Prüfe ob Sound aktiviert ist
    if (!isSoundEnabled()) return;
    
    try {
        const player = createAudioPlayer(soundFile);
        player.play();
        player.addListener('playbackStatusUpdate', (status) => {
            if (status.didJustFinish) {
                player.release();
            }
        });
    } catch (error) {
        console.warn("Error playing sound:", error);
    }
};
