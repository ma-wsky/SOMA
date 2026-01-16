export type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    isFavorite: boolean;
    isOwn: boolean;
    // item
    ownerId?: string | null;
    isGlobal?: boolean;
    image?: string;
    // info
    equipment?: string;
    instructions?: string;
};