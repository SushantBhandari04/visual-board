import { useEffect, useState } from "react";

// This hook is used to manage the WebSocket connection
// It initializes the connection and provides the socket instance
export default function useSocket() {
    const [loading, setLoading] = useState<boolean>(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`);
        setSocket(ws);

        ws.onopen = () => {
            console.log("WebSocket connection established");
            setLoading(false);
        }
    }, [])

    return {
        loading,
        socket
    }
}