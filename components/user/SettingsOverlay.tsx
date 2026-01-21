import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Modal, 
    Pressable, 
    StyleSheet, 
    Switch,
    Animated,
    Dimensions
} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/styles/theme";
import { userStyles } from "@/styles/userStyles";
import { 
    getSettings, 
    loadSettings,
    subscribeToSettings,
    setSoundEnabled,
    setVibrationEnabled,
    setAutoBrightnessEnabled 
} from "@/utils/store/settingsStore";
import { SafeAreaView } from "react-native-safe-area-context";


interface SettingsOverlayProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onLogout: () => void;
    onImpressum: () => void;
    isAnonymous?: boolean;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
    visible,
    onClose,
    onEdit,
    onLogout,
    onImpressum,
    isAnonymous = false,
}) => {
    const [settings, setSettings] = useState(getSettings());
    const slideAnim = useState(new Animated.Value(300))[0];

    useEffect(() => {
        // Settings beim Mount laden
        const loadInitialSettings = async () => {
            const loadedSettings = await loadSettings();
            setSettings(loadedSettings);
        };
        loadInitialSettings();

        const unsubscribe = subscribeToSettings(setSettings);
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            slideAnim.setValue(300);
        }
    }, [visible]);

    const handleToggleSound = async (newValue: boolean) => {
        setSettings(prev => ({ ...prev, soundEnabled: newValue }));
        await setSoundEnabled(newValue);
    };

    const handleToggleVibration = async (newValue: boolean) => {
        setSettings(prev => ({ ...prev, vibrationEnabled: newValue }));
        await setVibrationEnabled(newValue);
    };

    const handleToggleAutoBrightness = async (newValue: boolean) => {
        setSettings(prev => ({ ...prev, autoBrightnessEnabled: newValue }));
        await setAutoBrightnessEnabled(newValue);
    };

    const SettingsRow = ({ 
        icon, 
        label, 
        onPress,
        color = Colors.black 
    }: { 
        icon: string; 
        label: string; 
        onPress: () => void; 
        color?: string;
    }) => (
        <Pressable 
            style={userStyles.settingsRow} 
            onPress={onPress}
        >
            <View style={userStyles.rowWrap}>
                <Ionicons name={icon as any} size={25} color={color} />
                <Text style={{fontSize:16, color }}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
        </Pressable>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <SafeAreaView style={{flex:1,flexDirection:'row'}}>
                <Pressable style={{flex: 1,backgroundColor: 'rgba(0, 0, 0, 0.37)',
                    }} onPress={onClose} />
                
                <Animated.View 
                    style={[
                        userStyles.menu,
                        { transform: [{ translateX: slideAnim }] }
                    ]}
                >
                    <View style={userStyles.settingsRow}>
                        <Text style={userStyles.text}>Einstellungen</Text>
                        <Pressable onPress={onClose} style={{padding:5}}>
                            <Ionicons name="close" size={28} color={Colors.black} />
                        </Pressable>
                    </View>

                    <View style={{padding: 10}}>
                        <SettingsRow
                            icon={isAnonymous ? "person-add-outline" : "create-outline"}
                            label={isAnonymous ? "Registrieren" : "Profil bearbeiten"}
                            onPress={onEdit}
                        />

                        <View style={userStyles.line} />

                        <View style={userStyles.settingsRow}>
                            <View style={userStyles.rowWrap}>
                                <Ionicons 
                                    name={settings.soundEnabled ? "volume-high-outline" : "volume-mute-outline"} 
                                    size={24} 
                                    color={Colors.black} 
                                />
                                <Text style={{fontSize: 16}}>Ton</Text>
                            </View>
                            <Switch
                                value={settings.soundEnabled}
                                onValueChange={handleToggleSound}
                                trackColor={{ false: Colors.gray, true: Colors.primary }}
                                thumbColor={settings.soundEnabled ? Colors.white : Colors.gray}
                            />
                        </View>

                        <View style={userStyles.settingsRow}>
                            <View style={userStyles.rowWrap}>
                                <Ionicons 
                                    name="phone-portrait-outline" 
                                    size={24} 
                                    color={Colors.black} 
                                />
                                <Text style={{fontSize: 16}}>Vibration</Text>
                            </View>
                            <Switch
                                value={settings.vibrationEnabled}
                                onValueChange={handleToggleVibration}
                                trackColor={{ false: Colors.gray, true: Colors.primary }}
                                thumbColor={settings.vibrationEnabled ? Colors.white : Colors.gray}
                            />
                        </View>

                        <View style={userStyles.settingsRow}>
                            <View style={userStyles.rowWrap}>
                                <Ionicons 
                                    name="sunny-outline" 
                                    size={24} 
                                    color={Colors.black} 
                                />
                                <Text style={{fontSize: 16}}>Auto-Helligkeit</Text>
                            </View>
                            <Switch
                                value={settings.autoBrightnessEnabled}
                                onValueChange={handleToggleAutoBrightness}
                                trackColor={{ false: Colors.gray, true: Colors.primary }}
                                thumbColor={settings.autoBrightnessEnabled ? Colors.white : Colors.gray}
                            />
                        </View>

                        <View style={userStyles.line} />

                        <SettingsRow
                            icon="information-circle-outline"
                            label="Impressum"
                            onPress={onImpressum}
                        />

                        <View style={userStyles.line} />

                        <SettingsRow
                            icon="log-out-outline"
                            label="Abmelden"
                            onPress={onLogout}
                            color="#ff4444"
                        />
                    </View>
                </Animated.View>
            </SafeAreaView>
        </Modal>
    );
};
