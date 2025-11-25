import { Text, View, Button } from 'react-native';
import { useState } from 'react';
import {useLocalSearchParams} from "expo-router";

export default function Clicker() {
    const [count, setCount] = useState(0);
    const { name } = useLocalSearchParams();

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', borderColor: 'blue', borderWidth: 2}}>
            <View style={{justifyContent: 'center', alignItems: 'center', borderColor: 'green', borderWidth: 2, padding: 20}}>
                <Text>{name} hat {count} mal geklickt</Text>
            </View>

            <View style={{flexDirection: 'row', borderWidth: 2, borderColor: 'red',  justifyContent: 'space-between', alignItems: 'center', width: '40%'}}>
                <View style={{flex: 1, marginRight: 20}}>
                    <Button title="Klick mich" onPress={()=>setCount(count + 1)}/>
                </View>

                <View style={{flex: 1}}>
                    <Button title="Reset" onPress={()=> setCount(0)} />
                </View>
            </View>
        </View>
    );
}
