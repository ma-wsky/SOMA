import { View,Text } from "react-native";
import { useLocalSearchParams } from "expo-router"


export default function ExerciseInfoScreen() {

    const { name } = useLocalSearchParams<{ name: string }>();

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', borderColor: 'blue', borderWidth: 2}}>
            <Text>
                {name}
            </Text>
        </View>
    );
}