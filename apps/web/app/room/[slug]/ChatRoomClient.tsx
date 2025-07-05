"use client"

import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { set } from "react-hook-form";

export default function ChatRoomClient({ chats, roomId }: { chats: any[], roomId: number }) {
    const { loading, socket } = useSocket();
    const [chat, setChats] = useState(chats);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (socket && !loading) {
            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);

                if (parsedData.roomId === roomId) {
                    if (parsedData.type === "chat") {
                        setChats(c => [...c, { message: parsedData.message }]);
                        setMsg(""); // Clear input after receiving message
                    }
                }
            }
        }
    }, [socket, loading,roomId])

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "join_room",
                roomId
            }));
        } else if (socket) {
            // Wait for the socket to open before sending
            const handleOpen = () => {
                socket.send(JSON.stringify({
                    type: "join_room",
                    roomId
                }));
            };
            socket.addEventListener("open", handleOpen);
            return () => socket.removeEventListener("open", handleOpen);
        }
    }, [socket, roomId])

    function sendMessage() {
        if (socket) {
            socket.send(JSON.stringify({
                type: "chat",
                roomId,
                message: msg
            }))

            
        }
    }



    return (
        <div>
            <h1>Chat Room</h1>
            <p>Room ID: {roomId}</p>
            <div>
                {chat.map((c, index) => (
                    <div key={index}>
                        <p> {c.message}</p>
                    </div>
                ))}
            </div>

            <input type="text" placeholder="message" value={msg} onChange={(e) => setMsg(e.target.value)} />
            <button onClick={sendMessage}>Send</button>
        </div>
    );

}