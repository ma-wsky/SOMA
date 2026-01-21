import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppSettings {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    autoBrightnessEnabled: boolean;
}

const STORAGE_KEY = '@app_settings';

const defaultSettings: AppSettings = {
    soundEnabled: true,
    vibrationEnabled: true,
    autoBrightnessEnabled: false,
};

let currentSettings: AppSettings = { ...defaultSettings };
let listeners: ((settings: AppSettings) => void)[] = [];



export const loadSettings = async (): Promise<AppSettings> => {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
            currentSettings = { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Fehler beim Laden der Einstellungen:', e);
    }
    return currentSettings;
};


const saveSettings = async () => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
    } catch (e) {
        console.error('Fehler beim Speichern der Einstellungen:', e);
    }
};


const notifyListeners = () => {
    listeners.forEach(listener => listener(currentSettings));
};


export const getSettings = (): AppSettings => currentSettings;
export const isSoundEnabled = (): boolean => currentSettings.soundEnabled;
export const isVibrationEnabled = (): boolean => currentSettings.vibrationEnabled;
export const isAutoBrightnessEnabled = (): boolean => currentSettings.autoBrightnessEnabled;


export const setSoundEnabled = async (enabled: boolean) => {
    currentSettings.soundEnabled = enabled;
    await saveSettings();
    notifyListeners();
};

export const setVibrationEnabled = async (enabled: boolean) => {
    currentSettings.vibrationEnabled = enabled;
    await saveSettings();
    notifyListeners();
};

export const setAutoBrightnessEnabled = async (enabled: boolean) => {
    currentSettings.autoBrightnessEnabled = enabled;
    await saveSettings();
    notifyListeners();
};

// Subscribe für React-Komponenten
export const subscribeToSettings = (callback: (settings: AppSettings) => void) => {
    listeners.push(callback);
    return () => {
        listeners = listeners.filter(l => l !== callback);
    };
};
