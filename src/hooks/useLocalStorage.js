import { useState, useEffect } from 'react';

// Simple persistence hook
export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        const jsonValue = localStorage.getItem(key);
        if (jsonValue != null) return JSON.parse(jsonValue);
        return initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

// Initial Data Structure
// Profile: { id, name, diet (enum), weight (current, target), avatar_color }
