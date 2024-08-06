import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

import ScoreboardDisplay from "../Scoreboard/ScoreboardDisplay"

type ScoreboardEntry = {
    name: string,
    time: number
}

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

const safeParseInt = (value: string | null, fallback: number) => {
    if (value === null) return fallback;

    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
};

const View = () => {
    const [entries, setEntries] = useState<ScoreboardEntry[]>([]);
    const query = useQuery();
    const maxLimit = safeParseInt(query.get("max"), 3);

    useEffect(() => {
        console.log("max limit:", maxLimit);
        const port = import.meta.env.VITE_WEBSOCKET_PORT;
        const ws = new WebSocket(`ws://localhost:${port}`);

        ws.onopen = () => {
            console.log("WebSocket connection opened");
        };

        ws.onmessage = (event) => {
            try {
                const receivedEntries = JSON.parse(event.data);
                if (Array.isArray(receivedEntries) && receivedEntries.every(entry => typeof entry.name === 'string' && typeof entry.time === 'number')) {
                    setEntries(receivedEntries);
                } else {
                    console.error("Invalid data format received");
                }
            } catch (error) {
                console.error("Failed to parse WebSocket message", error, event.data);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error", error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div className="h-screen">
            <ScoreboardDisplay entries={entries} maxLimit={maxLimit} onEntryDeleted={() => { }} />
        </div>
    )
}

export default View;
