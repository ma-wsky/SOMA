import { createAudioPlayer } from 'expo-audio';

export const playSound = async (soundFile: any) => {
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
