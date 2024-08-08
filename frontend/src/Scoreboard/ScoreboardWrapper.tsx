import { useModal } from "../Modal/ModalContext"
import ScoreboardDisplay from "./ScoreboardDisplay"
import ScoreboardForm from "./ScoreboardForm"

import { useState, useEffect } from "react"

type ScoreboardEntry = {
    name: string,
    time: number // in seconds
}

function useSortedStateWithStorage(key: string, initialValue: ScoreboardEntry[]): [ScoreboardEntry[], (newValue: ScoreboardEntry[]) => void] {
    const [array, setArray] = useState(() => {
        const savedArray = localStorage.getItem(key)
        return savedArray ? JSON.parse(savedArray) : initialValue
    })

    const setProcessedValue = (newValue: ScoreboardEntry[]) => {
        const newEntries = [...newValue]
        newEntries.sort((a, b) => b.time - a.time)
        setArray(newEntries)
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            localStorage.setItem(key, JSON.stringify(array));
        }, 500) // Debounce: Save after 500ms of inactivity

        return () => {
            clearTimeout(handler);
        }
    }, [key, array])

    return [array, setProcessedValue]
}

const ScoreboardWrapper = () => {
    const maxEntries = 50;

    const [entries, setEntries] = useSortedStateWithStorage("scoreboard", []);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const { showModal } = useModal()


    const addEntry = (name: string, time: number) => {
        setEntries([...entries, { name, time }])
    }
    const onEntryDelete = (index: number) => {
        setEntries(entries.filter((_, i) => i !== index))
    }
    const clearEntries = () => {
        showModal(
            'Are you sure you want to clear the scoreboard?',
            () => {
                setEntries([])
            },
            () => {}
        );
    }

    useEffect(() => {
        const websocket = new WebSocket("ws://" + location.host);

        websocket.onopen = () => {
            console.log("WebSocket connection opened");
            setWs(websocket);
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error", error);
        };

        websocket.onclose = () => {
            console.log("WebSocket connection closed");
        };

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
        <div className="flex h-screen bg-gray-900">
            {
                entries.length > 0 && <button className="form-button fixed bottom-5 left-5" onClick={clearEntries}>Clear List</button>
            }
            <div className="w-1/4 text-gray-100 flex items-center justify-center min-h-screen">
                <ScoreboardForm onSubmit={addEntry} />
            </div>

            <div className="flex-1">
                <ScoreboardDisplay entries={entries} onEntryDeleted={onEntryDelete} maxLimit={maxEntries} />
            </div>
        </div>
    )
}

export default ScoreboardWrapper