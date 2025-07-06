
import { useEffect, useState } from "react";

// This hook is used to manage the WebSocket connection
// It initializes the connection and provides the socket instance
export default function useSocket(roomId: string) {
    const [loading, setLoading] = useState<boolean>(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`);
        
        ws.onopen = () => {
            setSocket(ws);
            setLoading(false);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }
    }, [])

    return {
        loading,
        socket
    }
}