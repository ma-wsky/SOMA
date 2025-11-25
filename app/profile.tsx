import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ProfileScreen() {
    const { name } = useLocalSearchParams();

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>This is {name}&#39;s profile</Text>
        </View>
    );
}
