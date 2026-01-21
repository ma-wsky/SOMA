/**
 * HELPER: vibrationHelper.ts
 * 
 * Wrapper für Vibration mit Settings-Check.
 * Vibriert nur wenn in den Einstellungen aktiviert.
 */

import { Vibration } from 'react-native';
import { isVibrationEnabled } from '@/utils/store/settingsStore';

/**
 * Vibriert das Gerät, wenn Vibration in den Einstellungen aktiviert ist.
 * @param pattern - Vibrationsmuster (z.B. [0, 200, 100, 200]) oder Dauer in ms
 */
export const vibrate = (pattern?: number | number[]) => {
    if (!isVibrationEnabled()) return;
    
    if (pattern) {
        Vibration.vibrate(pattern);
    } else {
        Vibration.vibrate();
    }
};

/**
 * Stoppt die Vibration
 */
export const cancelVibration = () => {
    Vibration.cancel();
};
