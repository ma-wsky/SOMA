import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { StyleSheet } from 'react-native';


export const networkToastConfig: ToastConfig = {

    success: (props) => (
        <BaseToast
            {...props}
            style={ styles.successToast }
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' }}
            text2Style={{ fontSize: 14, color: '#4a4a4a' }}
        />
    ),

    error: (props) => (
        <ErrorToast
            {...props}
            style={ styles.errorToast }
            text1Style={{ fontSize: 17 }}
            text2Style={{ fontSize: 15 }}
        />
    ),
};

const styles = StyleSheet.create({
    errorToast: {
        borderLeftColor: '#e74c3c',
        backgroundColor: '#fff5f5',
        borderRadius: 10
    },
    successToast: {
        borderLeftColor: '#2ecc71',
        backgroundColor: '#f0fff4',
        borderRadius: 10
    },

})