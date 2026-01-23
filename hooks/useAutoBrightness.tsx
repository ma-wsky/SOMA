import {useEffect, useState} from 'react';
import {LightSensor} from 'expo-sensors';
import * as Brightness from 'expo-brightness';
import {isAutoBrightnessEnabled, subscribeToSettings} from '@/utils/store/settingsStore';

export function useAutoBrightness() {
    const [enabled, setEnabled] = useState(isAutoBrightnessEnabled());

    useEffect(() => {
        const unsubscribe = subscribeToSettings((settings) => {
            setEnabled(settings.autoBrightnessEnabled);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        let subscription: any;

        const setupBrightness = async () => {

            if (!enabled) {
                if (subscription) subscription.remove();
                return;
            }

            const {status} = await Brightness.requestPermissionsAsync();
            if (status !== 'granted') return;

            // update interval
            LightSensor.setUpdateInterval(2000);

            subscription = LightSensor.addListener(({illuminance}) => {
                // helligkeit
                let targetBrightness = 0.5;

                if (illuminance < 50) {
                    targetBrightness = 0.2; // Dunkler Raum
                } else if (illuminance > 500) {
                    targetBrightness = 1.0; // Direktes Sonnenlicht
                } else {
                    targetBrightness = 0.6; // Normales Licht
                }

                Brightness.setBrightnessAsync(targetBrightness);
            });
        };

        setupBrightness();

        return () => {
            if (subscription) subscription.remove();
        };
    }, [enabled]);
}