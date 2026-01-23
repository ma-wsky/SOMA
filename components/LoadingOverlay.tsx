import React from "react";
import {ActivityIndicator, Modal, StyleSheet, View} from "react-native";
import {Colors} from "@/styles/theme";
import {SafeAreaView} from "react-native-safe-area-context";


type LoadingOverlayProps = {
    visible: boolean;
};

export default function LoadingOverlay({visible}: LoadingOverlayProps) {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            statusBarTranslucent
        >
            <SafeAreaView style={styles.overlay}>
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color={Colors.primary}/>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    spinnerWrapper: {
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 12,
        elevation: 5,
        shadowColor: Colors.black,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});