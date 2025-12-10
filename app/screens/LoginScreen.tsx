import {useRouter} from "expo-router";
import {Text, View, Button, TextInput,TouchableOpacity,StyleSheet,Image } from 'react-native';
import {useState} from "react";



export default function LoginScreen(){
    console.log("App executed");

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [eye, setEye] = useState(false);

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Anmelden</Text>
            <Text style={styles.text}>Email</Text>
            <TextInput style={styles.emailInput} placeholder="email@domain.com" value={email} onChangeText={setEmail}/>
            <Text style={styles.text}>Passwort</Text>
            <View style={{flexDirection: 'row', justifyContent:"flex-start", alignItems: "center"}}>
                <TextInput style={styles.pasInput} placeholder="********" value={password} onChangeText={setPassword} secureTextEntry={!eye}/>
                <TouchableOpacity style={{flex:0.2}} onPress={()=>{if(!eye){setEye(true);}else{setEye(false);}}}>
                    <Image source={require("../assets/icons/EyeOff.png")} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <Button title="Einloggen" onPress={() => router.push("../(tabs)/HomeScreenProxy")}></Button>


            <View style={{flexDirection:"row",justifyContent:"space-around",alignItems: "center"}}>
                <View style={styles.line}/>
                <Text>Oder</Text>
                <View style={styles.line}/>
            </View>


            <Button title="Konto erstellen" onPress={() => router.push("/screens/RegisterScreen")}></Button>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    pasInput:{
        flex:0.8,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'grey'
    },
    emailInput:{
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'grey'
    },
    title: {
        fontSize: 40,
        fontWeight: "bold",
        alignSelf: "center",
    },
    text:{
        fontSize: 24,
        justifyContent: "flex-start",
    },
    icon:{
        width: 24,
        height: 24,
        marginBottom: 2
    },
    line: {
        flex: 1,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        marginVertical: "5%",
        marginHorizontal:5
    }
})