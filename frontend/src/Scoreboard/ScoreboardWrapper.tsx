import ScoreboardDisplay from "./ScoreboardDisplay"
import ScoreboardForm from "./ScoreboardForm"

import { useState, useEffect } from "react"

type ScoreboardEntry = {
    name: string,
    time: number // in seconds
}

function useSortedState(initialValue: ScoreboardEntry[]): [ScoreboardEntry[], (newValue: ScoreboardEntry[]) => void] {
    const [value, setValue] = useState<ScoreboardEntry[]>(initialValue)

    const setProcessedValue = (newValue: ScoreboardEntry[]) => {
        const newEntries = [...newValue]
        newEntries.sort((a, b) => b.time - a.time)
        setValue(newEntries)
    }

    return [value, setProcessedValue]
}

const ScoreboardWrapper = () => {
    const maxEntries = 50;

    const [entries, setEntries] = useSortedState([]);
    const [ws, setWs] = useState<WebSocket | null>(null);


    const addEntry = (name: string, time: number) => {
        setEntries([...entries, { name, time }])
    }
    const onEntryDelete = (index: number) => {
        setEntries(entries.filter((_, i) => i !== index))
    }

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        const port = import.meta.env.VITE_WEBSOCKET_PORT;
        const websocket = new WebSocket(`ws://localhost:${port}`);

        websocket.onopen = () => {
            console.log("WebSocket connection opened");
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error", error);
        };

        websocket.onclose = () => {
            console.log("WebSocket connection closed");
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, []);

    useEffect(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(entries));
        }
    }, [entries, ws]);

    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-gray-900 text-gray-100 flex items-center justify-center min-h-screen">
                <ScoreboardForm onSubmit={addEntry} />
            </div>

            <div className="flex-1 bg-gray-900">
                <ScoreboardDisplay entries={entries} onEntryDeleted={onEntryDelete} maxLimit={maxEntries} />
            </div>
        </div>
    )
}

export default ScoreboardWrapper