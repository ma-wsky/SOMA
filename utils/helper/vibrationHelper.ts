import { Vibration } from 'react-native';
import { isVibrationEnabled } from '@/utils/store/settingsStore';


export const vibrate = (pattern?: number | number[]) => {
    if (!isVibrationEnabled()) return;
    
    if (pattern) {
        Vibration.vibrate(pattern);
    } else {
        Vibration.vibrate();
    }
};

export const cancelVibration = () => {
    Vibration.cancel();
};
