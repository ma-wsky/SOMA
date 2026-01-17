import { View, Text, Pressable, TextInput, Modal, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

//hilfsfunk
export const secondsToMinSec = (totalSeconds: number) => ({
  mins: Math.floor(totalSeconds / 60),
  secs: totalSeconds % 60,
});
export const minSecToSeconds = (mins: string | number, secs: string | number) => 
  (Number(mins) || 0) * 60 + (Number(secs) || 0);

export const NumberStepper = ({ 
  value, 
  onChange, 
  label, 
  step = 1 
}: { 
  value: number; 
  onChange: (val: number) => void; 
  label: string; 
  step?: number 
}) => {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: "#aaa", marginBottom: 8, fontSize: 14 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#333", borderRadius: 8 }}>
        <Pressable 
          onPress={() => onChange(Math.max(0, value - step))} 
          style={{ padding: 15, borderRightWidth: 1, borderRightColor: "#444" }}>
          <Ionicons name="remove" size={24} color="white" />
        </Pressable>
        
        <TextInput
          value={value.toString()}
          onChangeText={(text) => onChange(Number(text) || 0)}
          keyboardType="numeric"
          style={{ flex: 1, color: "white", textAlign: "center", fontSize: 18, fontWeight: "bold" }}
        />

        <Pressable 
          onPress={() => onChange(value + step)} 
          style={{ padding: 15, borderLeftWidth: 1, borderLeftColor: "#444" }}>
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveText: {
    color: "white",
    fontWeight: "600",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  timeInput: {
    backgroundColor: "#333",
    color: "white",
    fontSize: 24,
    width: 80,
    textAlign: "center",
    padding: 10,
    borderRadius: 8,
  },
  label: { color: "#aaa", fontSize: 16 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 8,
  },
});