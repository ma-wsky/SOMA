import { useEffect, useState } from 'react';
import { LightSensor } from 'expo-sensors';
import * as Brightness from 'expo-brightness';
import { isAutoBrightnessEnabled, subscribeToSettings } from '@/utils/store/settingsStore';

export function useAutoBrightness() {
    const [enabled, setEnabled] = useState(isAutoBrightnessEnabled());

    // Subscribe to settings changes
    useEffect(() => {
        const unsubscribe = subscribeToSettings((settings) => {
            setEnabled(settings.autoBrightnessEnabled);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        let subscription: any;

        const setupBrightness = async () => {
            // Nur aktivieren wenn in Settings eingeschaltet
            if (!enabled) {
                if (subscription) subscription.remove();
                return;
            }

            // Berechtigung anfragen (Wichtig für iOS/Android)
            const { status } = await Brightness.requestPermissionsAsync();
            if (status !== 'granted') return;

            // Sensor-Update-Intervall (z.B. alle 2 Sekunden, um Akku zu sparen)
            LightSensor.setUpdateInterval(2000);

            subscription = LightSensor.addListener(({ illuminance }) => {
                // Logik für die Helligkeit (Illuminance ist in Lux)
                // 0.0 (dunkel) bis 1.0 (hell)
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