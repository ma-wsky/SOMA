# SOMA - Fitness Tracking App

**Projektarbeit Mobile Computing**  
HRW - Wintersemester 2025/26

---

## Beschreibung

SOMA ist eine mobile Fitness-App zur Trainingsplanung und -dokumentation. Die App ermöglicht es Nutzern, eigene Workouts zu erstellen, durchzuführen und ihren Fortschritt zu verfolgen.

---

## Kernfunktionalitäten

### Training
- **Training-Vorlagen erstellen:** Eigene Trainingspläne mit beliebigen Übungen zusammenstellen
- **Aktives Training:** Live-Tracking mit Timer, Pausenzeiten und Abhaken von Sätzen
- **Trainingshistorie:** Alle absolvierten Trainings werden in einer Kalenderansicht angezeigt
- **Trainingserinnerungen:** Push-Benachrichtigungen und Erinnerungen für geplante Trainingstage
- **PDF-Export:** Trainingsverlauf als PDF-Datei exportieren

### Übungen
- **Übungsbibliothek:** Vordefinierte Übungen sowie die Möglichkeit, eigene Übungen zu erstellen
- **Favoriten:** Häufig genutzte Übungen können als Favoriten markiert werden
- **Detailansicht:** Anleitungen und Informationen zu jeder Übung
- **Statistiken:** Gewichtsverlauf pro Übung wird als Diagramm dargestellt

### Benutzerverwaltung
- **Registrierung und Login:** Anmeldung über E-Mail und Passwort
- **Gastmodus:** Die App kann ohne Account genutzt werden (anonyme Anmeldung)
- **Profilbearbeitung:** Name, Größe, Gewicht und Profilbild können bei angemeldeten Benutzern angepasst werden

### Einstellungen
- **Ton:** Sound-Feedback kann ein- oder ausgeschaltet werden
- **Vibration:** Vibration kann ein- oder ausgeschaltet werden
- **Auto-Helligkeit:** Bildschirmhelligkeit passt sich automatisch per Lichtsensor an, kann ein- oder ausgeschaltet werden
- **Erinnerungen:** Benachrichtigungen für Trainingseinheiten können konfiguriert werden

---

## Architektur

Die App folgt einer komponentenbasierten Architektur mit klarer Trennung der Verantwortlichkeiten:

```
app/                       Screens und Navigation (Expo Router)
    (tabs)/                Tab-Navigation (Startseite, Training, Statistik, Benutzer)
    screens/               Alle App-Screens, nach Funktion gruppiert

components/                Wiederverwendbare UI-Komponenten

hooks/                     Custom React Hooks zur Auslagerung von Logik
    useActiveWorkoutData   Verwaltet den Zustand des aktiven Trainings
    useWorkoutLoader       Lädt Trainings-Daten aus der Datenbank

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
- **Globaler Zustand:** Eigene Store-Implementierung mit Subscribe-Pattern (siehe utils/store/)
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
| Expo | 54.0 | Entwicklungsplattform mit Development Builds |
| TypeScript | 5.9 | JavaScript mit Typisierung |

### Navigation und Benutzeroberfläche

| Bibliothek | Beschreibung |
|------------|--------------|
| expo-router | Dateibasiertes Routing für die Navigation |
| @react-navigation | Bibliotheken für Stack- und Tab-Navigation |
| @gorhom/bottom-sheet | Einblendbare Panels von unten (für aktives Training) |
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
- Ein Android-Gerät oder einen Emulator

### Schritt 1: Repository klonen

```bash
git clone https://github.com/ma-wsky/SOMA
cd soma
```

### Schritt 2: Abhängigkeiten installieren

```bash
npm install
```

### Schritt 3: Firebase konfigurieren

Stellen Sie sicher, dass eine `.env` Datei mit den korrekten Firebase-Keys im Root-Verzeichnis liegt (orientieren Sie sich an der `.env.example`).


### Schritt 4: Development Build installieren

Da dieses Projekt native Module verwendet (z. B. Sensoren, Haptics), wird ein Android Development Build benötigt. Die Standard "Expo Go" App ist nicht kompatibel.

Vorhandenen Build installieren
- Besuchen Sie diesen Link: https://expo.dev/accounts/hrw-mobilecomputing/projects/fitnessapp/builds/8e83d97d-ad05-428f-b623-8c22cc5c9e3d
  
  oder scannen Sie diesen QR-Code:
  
  <img width="150" height="150" alt="grafik" src="https://github.com/user-attachments/assets/84306c44-0bfa-403e-a3e3-7bfa60e8e720" />

- Laden Sie die APK von der Website auf Ihr Android-Gerät herunter.
- Installieren Sie die APK (ggf. "Installation aus unbekannten Quellen" erlauben).
- Die App erscheint als "SOMA" auf Ihrem Homescreen.

### Schritt 5: Entwicklungs-Server starten

Starten Sie den lokalen Server:

```bash
npx expo start
```

Verbindung herstellen:

- Öffnen Sie die installierte SOMA-App auf Ihrem Handy.
- Stellen Sie sicher, dass sich Handy und PC im selben WLAN befinden.

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
