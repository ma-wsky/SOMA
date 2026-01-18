import { useEffect } from 'react';
import { LightSensor } from 'expo-sensors';
import * as Brightness from 'expo-brightness';

export function useAutoBrightness() {
    useEffect(() => {
        let subscription: any;

        const setupBrightness = async () => {
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
    }, []);
}