import { useState, useEffect, useCallback } from "react";
import { auth } from "@/firebaseConfig";
import { WorkoutService } from "@/services/WorkoutService";
import { Workout } from "@/types/Workout";

export function useLoadTemplates() {
    const [templates, setTemplates] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTemplates = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await WorkoutService.fetchAllTemplates(user.uid);

            if (!data) return;

            // Filtern von null-Werten, falls ein Template fehlerhaft war
            setTemplates(data as Workout[]);
        } catch (error) {
            console.error("Fehler im useLoadTemplates Hook:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return {
        templates,
        loading,
        refetch: fetchTemplates
    };
}