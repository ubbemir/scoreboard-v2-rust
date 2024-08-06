import { useState, useRef } from "react";

type onSubmit = (name: string, time: number) => void

const ScoreboardForm = ({ onSubmit }: { onSubmit: onSubmit }) => {
    const [name, setName] = useState("")
    const [seconds, setSeconds] = useState("")
    const [minutes, setMinutes] = useState("")

    const nameInputRef = useRef<HTMLInputElement>(null)
    const resetForm = () => {
        setName("")
        setSeconds("")
        setMinutes("")

        if (nameInputRef.current) {
            nameInputRef.current.focus()
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const parsedMinutes = minutes.length > 0 ? parseInt(minutes, 10) : 0
        const parsedSeconds = seconds.length > 0 ? parseInt(seconds, 10) : 0

        if (isNaN(parsedMinutes) || isNaN(parsedSeconds)) {
            alert("Please enter valid numbers for minutes and seconds.")
            return
        }

        if (name.length == 0) {
            alert("Please enter a name")
            return
        }

        const time = parsedMinutes * 60 + parsedSeconds

        if (time <= 0) {
            alert("Total time must be greater than 0")
            return
        }

        onSubmit(name, time)
        resetForm()
    };

    return (
        <div className="w-full border-box p-4">
            <form onSubmit={handleSubmit} className="flex flex-col w-full">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    ref={nameInputRef}
                    className="form-input"
                    autoFocus
                />
                <input
                    type="text"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="Minutes"
                    className="form-input"
                />
                <input
                    type="text"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    placeholder="Seconds"
                    className="form-input"
                />
                <button type="submit" className="form-button">Add</button>
            </form>
        </div>
    )
}

export default ScoreboardForm