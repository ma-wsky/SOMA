import {Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Colors} from "@/styles/theme";


export const secondsToMinSec = (totalSeconds: number) => ({
    mins: Math.floor(totalSeconds / 60),
    secs: totalSeconds % 60,
});
export const minSecToSeconds = (mins: string | number, secs: string | number) =>
    (Number(mins) || 0) * 60 + (Number(secs) || 0);


export const NumberStepper = ({
                                  value,
                                  onChange,
                                  label,
                                  step = 1
                              }: {
    value: number | null;
    onChange: (val: number | null) => void;
    label: string;
    step?: number
}) => {
    return (
        <View style={{marginBottom: 16}}>
            {label ? <Text style={{color: Colors.gray, marginBottom: 8, fontSize: 14}}>{label}</Text> : null}
            <View style={{flexDirection: "row", alignItems: "center", backgroundColor: Colors.black, borderRadius: 8}}>
                <Pressable
                    onPress={() => onChange(Math.max(0, (value ?? 0) - step))}
                    style={{padding: 15, borderRightWidth: 1, borderRightColor: Colors.darkGray}}>
                    <Ionicons name="remove" size={24} color={Colors.white}/>
                </Pressable>

                <TextInput
                    value={value !== null ? value.toString() : ""}
                    onChangeText={(text) => {
                        if (text === "") {
                            onChange(null);
                        } else {
                            const num = Number(text);
                            onChange(isNaN(num) ? null : num);
                        }
                    }}
                    keyboardType="numeric"
                    selectTextOnFocus={true}
                    style={{flex: 1, color: Colors.white, textAlign: "center", fontSize: 18, fontWeight: "bold"}}
                />

                <Pressable
                    onPress={() => onChange((value ?? 0) + step)}
                    style={{padding: 15, borderLeftWidth: 1, borderLeftColor: Colors.darkGray}}>
                    <Ionicons name="add" size={24} color={Colors.white}/>
                </Pressable>
            </View>
        </View>
    );
};

export const newStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignContent: 'space-between',
        justifyContent: 'center',
    },
    content: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.darkGray,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.darkGray,
    },
    headerTitle: {
        color: Colors.black,
        fontSize: 18,
        fontWeight: "bold",
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    saveText: {
        color: Colors.white,
        fontWeight: "600",
    },
    timeInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginBottom: 20,
    },
    timeInput: {
        backgroundColor: Colors.black,
        color: Colors.white,
        fontSize: 24,
        width: 80,
        textAlign: "center",
        padding: 10,
        borderRadius: 8,
    },
    label: {color: Colors.gray, fontSize: 16},
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        padding: 10,
        backgroundColor: Colors.black,
        borderRadius: 8,
    },
});