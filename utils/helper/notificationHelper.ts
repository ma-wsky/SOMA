import * as Notifications from 'expo-notifications';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermissions() {
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return false;
    }
    return true;
}

export async function scheduleWorkoutReminder(
    title: string,
    body: string,
    triggerHour: number,
    triggerMinute: number
) {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Today
    const trigger = new Date();
    trigger.setHours(triggerHour);
    trigger.setMinutes(triggerMinute);
    trigger.setSeconds(0);

    //Next day
    if (trigger.getTime() <= Date.now()) {
        trigger.setDate(trigger.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: trigger
        },
    });

    return trigger;
}

export async function scheduleWeeklyWorkoutReminder(
    title: string,
    body: string,
    hour: number,
    minute: number,
    weekdays: number[]
) {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    for (const day of weekdays) {
        // Expo Notifications : 1 = Sunday... 7 = Saturday
        // We 1=Mon... 7=Sun

        const expoDay = day === 7 ? 1 : day + 1;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: expoDay,
                hour: hour,
                minute: minute,
            },
        });
    }
}


export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
