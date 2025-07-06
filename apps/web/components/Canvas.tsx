"use client"

import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "rectangle" | "pencil" | "circle";

export default function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("rectangle");

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game])

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return (()=>g.destroy())
        }
    }, [canvasRef])

    return (
        <div className="h-full overflow-hidden">
            <canvas ref={canvasRef} height={window.innerHeight} width={window.innerWidth}>
            </canvas>
            <ToolBox selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
        </div>
    )
}

function ToolBox({ selectedTool, setSelectedTool }: { selectedTool: Tool, setSelectedTool: (selectedTool: Tool) => void }) {
    return <div className="flex gap-2 fixed top-5 left-5 bg-blue-200 p-2 rounded-lg">
        <Icon enable={selectedTool == "pencil"} icon={<Pencil />} onClick={() => setSelectedTool("pencil")} />
        <Icon enable={selectedTool == "rectangle"} icon={<RectangleHorizontalIcon />} onClick={() => setSelectedTool("rectangle")} />
        <Icon enable={selectedTool == "circle"} icon={<Circle />} onClick={() => setSelectedTool("circle")} />
    </div>
}