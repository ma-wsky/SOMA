import {useRouter} from "expo-router";
import { View, Button, TextInput } from 'react-native';
import {useState} from "react";

export default function Login(){
    const router = useRouter();
    const [value, setValue] = useState("");

    return(
        <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
            <View style={{marginBottom: 20, borderWidth: 2, borderColor: 'grey'}}>
                <TextInput placeholder="name" value={value} onChangeText={setValue}/>
            </View>

            <Button title="Login" onPress={() => router.push(`/clicker?name=${value}`)} disabled={value.trim() === ""}></Button>
        </View>
    );
}