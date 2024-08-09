import { FC } from "react"

type ScoreboardEntry = {
    name: string,
    time: number
}

type ScoreboardDisplayProps = {
    entries: ScoreboardEntry[],
    maxLimit: number | null
    onEntryDeleted: (index: number) => void
}

const ScoreboardDisplay: FC<ScoreboardDisplayProps> = ({ entries, maxLimit, onEntryDeleted }) => {
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        return `${minutes}min ${seconds}s`
    }

    const getColor = (index: number) => {
        if (index == 0) {
            return "bg-[#DAA520]";
        }

        if (index == 1) {
            return "bg-[#C0C0C0]"
        }

        if (index == 2) {
            return "bg-[#CD7F32]"
        }

        return "text-white"
    }

    return (
        <div className="h-full flex ">
            <div>
                <ul className="flex flex-col align-top justify-center mt-10">
                    {entries.map((entry, index) => {
                        if (maxLimit && (index + 1) > maxLimit) { return }

                        return (
                            <li key={index} onClick={() => { onEntryDeleted(index) }} className="flex flex-auto justify-left items-center cursor-pointer select-none p-1">
                                <p className={getColor(index) + " p-2.5 rounded-md mx-2.5 font-bold text-white text-shadow"}>{index + 1}</p>
                                <p className="text-white mx-2.5">{entry.name}</p>
                                <p className="text-white font-bold">{formatTime(entry.time)}</p>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

export default ScoreboardDisplay
