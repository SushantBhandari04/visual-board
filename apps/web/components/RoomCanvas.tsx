"use client"

import useSocket from "@/hooks/useSocket";
import Canvas from "./Canvas";

export default function RoomCanvas({roomId}: {roomId: string}){
    const { socket, loading } = useSocket(roomId);

    if(loading || !socket){
        return <div>Connecting to server...</div>
    }

    return <Canvas roomId={roomId} socket={socket}/>
}