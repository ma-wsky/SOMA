export const getAuthErrorMessage = (code: string): string => {
    switch (code) {
        // Gemeinsame Fehler (Login & Register)
        case "auth/invalid-email":
            return "Bitte gib eine gültige E-Mail-Adresse ein.";
        case "auth/user-disabled":
            return "Dieser Account wurde deaktiviert.";
        case "auth/too-many-requests":
            return "Zu viele Versuche. Bitte warte einen Moment.";
        case "auth/missing-password":
            return "Bitte Passwort eingeben";
        case "auth/missing-email":
            return "Bitte E-mail eingeben";

        // Login-Fehler
        case "auth/invalid-credential":
            return "E-Mail oder Passwort ist nicht korrekt.";
        case "auth/user-not-found":
            return "Es wurde kein Konto mit dieser E-Mail gefunden.";

        // Register-Fehler
        case "auth/email-already-in-use":
            return "Diese E-Mail wird bereits für ein anderes Konto verwendet.";
        case "auth/weak-password":
            return "Das Passwort ist zu schwach (mindestens 6 Zeichen).";

        default:
            return "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es erneut.";
    }
};