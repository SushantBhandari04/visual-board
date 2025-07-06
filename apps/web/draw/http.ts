import axios from "axios";

export async function getExistingShapes(roomId: string) {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${roomId}`, {
        withCredentials: true
    });
    const message = response.data;

    const shapes = message.map((x: { message: string }) => {
        const messageData = JSON.parse(x.message);
        return messageData;
    })

    return shapes;
}