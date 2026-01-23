import {create} from 'zustand';


interface ExerciseState {
    filter: string;
    selectedCategory: string;
    setFilter: (text: string) => void;
    setSelectedCategory: (cat: string) => void;
    resetFilters: () => void;
}

export const listFilterStore = create<ExerciseState>((set) => ({
    filter: "",
    selectedCategory: "Alle",

    setFilter: (text) => set({filter: text}),
    setSelectedCategory: (cat) => set({selectedCategory: cat}),

    resetFilters: () => set({filter: "", selectedCategory: "Alle"}),
}));