# SOMA - Fitness Tracking App

**Projektarbeit Mobile Computing**  
HRW - Wintersemester 2025/26

---

## Beschreibung

SOMA ist eine mobile Fitness-App zur Trainingsplanung und -dokumentation. Die App ermöglicht es Nutzern, eigene Workouts zu erstellen, durchzuführen und ihren Fortschritt über Zeit zu verfolgen.

---

## Kernfunktionalitäten

### Training und Workouts
- **Workout-Vorlagen erstellen:** Eigene Trainingspläne mit beliebigen Übungen zusammenstellen
- **Aktives Training:** Live-Tracking mit Timer, Pausenzeiten und Abhaken von Sätzen
- **Trainingshistorie:** Alle absolvierten Workouts werden in einer Kalenderansicht angezeigt
- **PDF-Export:** Trainingsverlauf als PDF-Datei exportieren und teilen

### Übungen
- **Übungsbibliothek:** Vordefinierte Übungen sowie die Möglichkeit, eigene Übungen zu erstellen
- **Favoriten:** Häufig genutzte Übungen können als Favoriten markiert werden
- **Detailansicht:** Anleitungen und Informationen zu jeder Übung
- **Statistiken:** Gewichtsverlauf pro Übung wird als Diagramm dargestellt

### Benutzerverwaltung
- **Registrierung und Login:** Anmeldung über E-Mail und Passwort
- **Gastmodus:** Die App kann ohne Account getestet werden (anonyme Anmeldung)
- **Profilbearbeitung:** Name, Größe, Gewicht und Profilbild können angepasst werden

### Einstellungen
- **Ton:** Sound-Feedback kann ein- oder ausgeschaltet werden
- **Vibration:** Vibration kann ein- oder ausgeschaltet werden
- **Auto-Helligkeit:** Bildschirmhelligkeit passt sich automatisch per Lichtsensor an

---

## Architektur

Die App folgt einer komponentenbasierten Architektur mit klarer Trennung der Verantwortlichkeiten:

```
app/                       Screens und Navigation (Expo Router)
    (tabs)/                Tab-Navigation (Home, Workout, Stats, User)
    screens/               Alle App-Screens, nach Funktion gruppiert

components/                Wiederverwendbare UI-Komponenten

hooks/                     Custom React Hooks zur Auslagerung von Logik
    useActiveWorkoutData   Verwaltet den Zustand des aktiven Workouts
    useWorkoutLoader       Lädt Workout-Daten aus der Datenbank

services/                  Kommunikation mit dem Backend
    exerciseService        Lädt Übungen und Historie aus Firebase

utils/                     Hilfsfunktionen und Zustandsverwaltung
    store/                 Globaler Zustand der App
    helper/                Hilfsfunktionen (Sound, Vibration, Export)

styles/                    Zentrale Style-Definitionen
    theme                  Farbpalette und Design-Konstanten

types/                     TypeScript-Typdefinitionen
```

### Zustandsverwaltung

- **Lokaler Zustand:** React useState für Screen-spezifische Daten
- **Globaler Zustand:** Eigene Store-Implementierung mit Subscriber-Pattern (siehe utils/store/)
- **Persistierung:** AsyncStorage für lokale Einstellungen, Firebase für Nutzerdaten

### Navigation

- Expo Router mit dateibasiertem Routing
- Tab-Navigation für die vier Hauptbereiche
- Stack-Navigation für Detailseiten innerhalb der Bereiche

---

## Technologien und Bibliotheken

### Grundlegende Technologien

| Technologie | Version | Beschreibung |
|-------------|---------|--------------|
| React Native | 0.81.5 | Framework für mobile App-Entwicklung |
| Expo | 54.0 | Entwicklungsplattform und Build-Tools |
| TypeScript | 5.9 | JavaScript mit Typisierung |

### Navigation und Benutzeroberfläche

| Bibliothek | Beschreibung |
|------------|--------------|
| expo-router | Dateibasiertes Routing für die Navigation |
| @react-navigation | Bibliotheken für Stack- und Tab-Navigation |
| @gorhom/bottom-sheet | Einblendbare Panels von unten (für aktives Workout) |
| react-native-calendars | Kalender-Komponente für die Trainingshistorie |
| react-native-chart-kit | Diagramme für die Statistikansicht |

### Backend und Datenbank

| Technologie | Beschreibung |
|-------------|--------------|
| Firebase Authentication | Benutzeranmeldung und -verwaltung |
| Firebase Firestore | Datenbank für alle Nutzerdaten |
| Firebase Storage | Speicherung von Bildern (Profilbilder, Übungsbilder) |

### Gerätefunktionen

| Bibliothek | Beschreibung |
|------------|--------------|
| expo-sensors | Zugriff auf den Lichtsensor (für Auto-Helligkeit) |
| expo-brightness | Steuerung der Bildschirmhelligkeit |
| expo-image-picker | Auswahl von Bildern aus der Galerie |
| expo-audio | Abspielen von Sounds |
| expo-haptics | Vibrationsfeedback |
| expo-print, expo-sharing | Erstellung und Teilen von PDF-Dateien |

### Weitere Bibliotheken

| Bibliothek | Beschreibung |
|------------|--------------|
| @react-native-async-storage | Lokale Speicherung von Einstellungen |
| react-native-toast-message | Kurze Benachrichtigungen am Bildschirmrand |
| @react-native-community/netinfo | Prüfung des Netzwerkstatus |

---

## Installation und Ausführung

### Voraussetzungen

- Node.js (Version 18 oder höher empfohlen)
- npm oder yarn als Paketmanager
- Expo Go App auf dem Smartphone (iOS oder Android)
- Alternativ: Android Studio Emulator oder Xcode iOS Simulator

### Schritt 1: Repository klonen

```bash
git clone <repository-url>
cd soma
```

### Schritt 2: Abhängigkeiten installieren

```bash
npm install
```

### Schritt 3: Firebase konfigurieren

Im Wurzelverzeichnis muss eine Datei `firebaseConfig.ts` mit den Firebase-Zugangsdaten erstellt werden:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  //TODO FILL
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

**Hinweis:** Die Firebase-Konfiguration ist aus Sicherheitsgründen nicht im Repository enthalten. Ein eigenes Firebase-Projekt kann unter https://console.firebase.google.com erstellt werden.

### Schritt 4: App starten

```bash
npx expo start
```

Nach dem Start gibt es folgende Möglichkeiten:
- Expo Go App öffnen und den angezeigten QR-Code scannen
- Taste "a" drücken für den Android Emulator
- Taste "i" drücken für den iOS Simulator

---

## Firebase Backend

### Datenstruktur in Firestore

Die Datenbank ist wie folgt strukturiert:

```
users/{userId}
    name, email, height, weight, profilePicture
    
    workouts/{workoutId}
        name, date, duration, type ("template" oder "history")
        
        exerciseSets/{setId}
            exerciseId, exerciseName, weight, reps, isDone, breaktime
    
    exercises/{exerciseId}           (eigene Übungen des Nutzers)
        name, muscleGroup, equipment, instructions, image
    
    favorites/{exerciseId}           (favorisierte Übungen)

exercises/{exerciseId}               (globale Übungen für alle Nutzer)
    name, muscleGroup, equipment, instructions, image
```

### Authentifizierung

- Registrierung und Login über E-Mail und Passwort
- Anonyme Anmeldung für den Gastmodus
- Möglichkeit, einen Gast-Account später in einen vollständigen Account umzuwandeln

---

## Abhängigkeiten

Alle Abhängigkeiten werden über den Befehl `npm install` automatisch installiert. Die vollständige Liste befindet sich in der Datei `package.json`.

**Wichtige Dependencies:**
- @expo/vector-icons
- @gorhom/bottom-sheet
- @react-native-async-storage/async-storage
- @react-native-community/datetimepicker
- @react-native-community/netinfo
- @react-navigation/bottom-tabs
- @react-navigation/native
- @react-navigation/native-stack
- expo (sowie diverse expo-Pakete)
- firebase
- react und react-native
- react-native-calendars
- react-native-gesture-handler
- react-native-reanimated
- react-native-toast-message

**DevDependencies:**
- @types/react
- eslint und eslint-config-expo
- prettier
- typescript
- react-native-chart-kit

---

## Rechtliches

Die App enthält ein Impressum (erreichbar über Einstellungen), welches folgende Informationen bereitstellt:
- Angaben gemäß § 5 TMG
- Kontaktinformationen
- Medien-Credits
- Datenschutzhinweise

---

## Autoren

Maximilian Dregewsky, Matthew Rade.
Erstellt im Rahmen der Projektarbeit Mobile Computing.

---

## Lizenz

Dieses Projekt wurde für Bildungszwecke erstellt.  
Alle Rechte vorbehalten.
