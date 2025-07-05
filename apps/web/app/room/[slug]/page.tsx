import axios from "axios";
import ChatRoom from "./ChatRoom";

async function getRoomId(slug: string) {
    const roomId = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room/${slug}`)
    return roomId;
}

export default async function RoomPage({
    params
}: { params: { slug: string } }) {

    const slug =  await params.slug;
    const roomId = await getRoomId(slug);
    // console.log("Room ID fetched:", roomId.data.id);
    return (
        <div>
            <ChatRoom roomId={roomId.data.id} />
        </div>
    );
}