import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { TopBar } from "@/components/TopBar";
import { Colors } from "@/styles/theme";
import { SafeAreaView } from "react-native-safe-area-context";


export default function ImpressumScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <TopBar 
                leftButtonText="Zurück"
                titleText="Impressum"
                onLeftPress={() => router.back()}
            />
            
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
            >
                <Text style={styles.heading}>Angaben gemäß § 5 DDG (TMG)</Text>
                <Text style={styles.text}>
                    SOMA App{"\n"}
                    Unsere Adresse/Anschrift - evtl Hochschule
                </Text>

                <Text style={styles.heading}>Kontakt</Text>
                <Text style={styles.text}>
                    E-Mail - Telefon eher nicht
                </Text>

                <Text style={styles.heading}>Verantwortlich für den Inhalt</Text>
                <Text style={styles.text}>
                    Wir mit Namen evtl adres/kontakt
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
                    Die Nutzung dieser App ist in der Regel ohne Angabe 
                    personenbezogener Daten möglich. Soweit personenbezogene 
                    Daten erhoben werden, erfolgt dies stets auf freiwilliger Basis.
                    Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht 
                    an Dritte weitergegeben.
                </Text>

                <Text style={styles.heading}>Urheberrecht</Text>
                <Text style={styles.text}>
                    Die durch die App-Betreiber erstellten Inhalte und Werke 
                    unterliegen dem deutschen Urheberrecht.
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
