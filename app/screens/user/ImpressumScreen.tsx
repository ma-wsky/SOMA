import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { TopBar } from "@/components/TopBar";
import { Colors } from "@/styles/theme";
import { SafeAreaView } from "react-native-safe-area-context";


export default function ImpressumScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <TopBar 
                isSheet={false}
                leftButtonText="Zurück"
                titleText="Impressum"
                onLeftPress={() => router.back()}
            />
            
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
            >
                <Text style={styles.heading}>Angaben nach § 5 Absatz 1 Digitale-Dienste-Gesetz (DDG)</Text>
                <Text style={styles.text}>
                    Angaben zur SOMA App{"\n"}
                    Hochschulprojekt der Hochschule:{"\n"}{"\n"}
                    Hochschule Ruhr West{"\n"}
                    Duisburger Straße 100{"\n"}
                    45479 Mülheim an der Ruhr

                </Text>

                <Text style={styles.heading}>Kontakt der Hochschule</Text>
                <Text style={styles.text}>
                    Telefon: 0208 882 54 -0{"\n"}
                    Fax: 0208 882 54 -109{"\n"}
                    E-Mail: kontakt@hs-ruhrwest.de
                </Text>

                <Text style={styles.heading}>Verantwortlich für den Inhalt</Text>
                <Text style={styles.text}>
                    Studenten der Hochschule:{"\n"}
                    - maximilian.dregewsky@stud.hs-ruhrwest.de{"\n"}
                    - matthew.rade@stud.hs-ruhrwest.de
                </Text>

                <Text style={styles.heading}>Medien der App</Text>
                <Text style={styles.text}>
                    Sound-Assets von Pixabay.com, Usern : {"\n"}
                    - Universfield{"\n"}
                    - Superpuyofans1234{"\n"}{"\n"}
                    Bild-Assets von Storyset.com, Kategorien:{"\n"}
                    - People Illustration{"\n"}
                    - Medical Illustraion{"\n"}
                    - Media Illustraion
                </Text>

                <Text style={styles.heading}>Datenschutz</Text>
                <Text style={styles.text}>
                    Diese App verwendet Firebase zur Speicherung von Nutzerdaten wie 
                    Accounts, Workouts und Trainingsstatistiken.
                    Die Datenverarbeitung erfolgt gemäß der Firebase-Datenschutzerklärung. 
                    Personenbezogene Daten werden nur zur Bereitstellung der App-Funktionalität 
                    verwendet und nicht an Dritte weitergegeben.
                </Text>

                <Text style={styles.heading}>Urheberrecht</Text>
                <Text style={styles.text}>
                    Die App-Software und deren Design unterliegen dem deutschen
                    Urheberrecht. Von Nutzern erstellte Inhalte (Workouts, Daten)
                    verbleiben im Eigentum des jeweiligen Nutzers. Die App-Betreiber
                    erheben keinen Anspruch auf Nutzerinhalte.
                </Text>

                <Text style={styles.heading}>Haftungsausschluss</Text>
                <Text style={styles.text}>
                    Die Inhalte dieser App dienen ausschließlich der allgemeinen
                    Information und ersetzen keine professionelle medizinische 
                    oder technische Beratung. Wir übernehmen keine Gewähr für die Richtigkeit,
                    Vollständigkeit oder Aktualität der bereitgestellten
                    Übungsbeschreibungen. Jede Nutzung der App erfolgt auf
                    eigenes Risiko. Bei gesundheitlichen Problemen konsultieren
                    Sie bitte einen Arzt.
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © {new Date().getFullYear()} SOMA
                    </Text>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.black,
        marginTop: 20,
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        color: Colors.black,
        lineHeight: 22,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom:20,
        borderTopWidth: 1,
        borderTopColor: Colors.gray,
    },
    footerText: {
        fontSize: 12,
        color: Colors.darkGray,
    },
    versionText: {
        fontSize: 11,
        color: Colors.darkGray,
        marginTop: 5,
    },
});
