import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useState } from "react";
import { Button, Text, View } from "react-native";

//npm install react-native-modal-datetime-picker
interface DateInputProps {
    date: Date;
    setDate: React.Dispatch<React.SetStateAction<Date | null>>;
}
export default function DateInput({ date, setDate }: DateInputProps) {
    const [isVisible, setIsVisible] = useState(false);

    const handleConfirm = (selectedDate: Date) => {
        setDate(selectedDate);
        setIsVisible(false);
    };

    return (
        <View>
            <Text>Datum: {date.toDateString()}</Text>
            <Button title="Datum auswählen" onPress={() => setIsVisible(true)} />
            <DateTimePickerModal
                isVisible={isVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={() => setIsVisible(false)}
            />
        </View>
    );
}
