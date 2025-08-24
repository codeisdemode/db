"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAutoTheme = useAutoTheme;
const next_themes_1 = require("next-themes");
const react_1 = require("react");
const DAYTIME_HOURS = { start: 6, end: 18 }; // 6 AM to 6 PM
function useAutoTheme() {
    const { theme, setTheme } = (0, next_themes_1.useTheme)();
    const [autoThemeEnabled, setAutoThemeEnabled] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const updateThemeBasedOnTime = () => {
            if (!autoThemeEnabled)
                return;
            const now = new Date();
            const currentHour = now.getHours();
            // Set theme based on time of day
            const targetTheme = currentHour >= DAYTIME_HOURS.start && currentHour < DAYTIME_HOURS.end
                ? "light"
                : "dark";
            if (theme !== targetTheme) {
                setTheme(targetTheme);
            }
        };
        // Set initial theme
        updateThemeBasedOnTime();
        // Update theme every minute to handle time changes
        const interval = setInterval(updateThemeBasedOnTime, 60000);
        return () => clearInterval(interval);
    }, [setTheme, theme, autoThemeEnabled]);
    return {
        autoThemeEnabled,
        setAutoThemeEnabled
    };
}
