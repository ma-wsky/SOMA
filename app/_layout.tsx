import { Slot, usePathname } from "expo-router";
import React from "react";

export default function Layout() {
    const path = usePathname();

    return (
        <>
            <Slot />
        </>
    );
}
