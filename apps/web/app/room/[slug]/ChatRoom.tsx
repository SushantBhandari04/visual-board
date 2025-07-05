import axios from "axios";
import ChatRoomClient from "./ChatRoomClient";
import { cookies } from "next/headers"; // Next.js API

async function getChats(id: number) {
  // Get the token cookie from the incoming request
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Forward the cookie to your backend
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${id}`,
    {
      headers: {
        Cookie: `token=${token}`,
      },
    }
  );
  return response.data;
}

export default async function ChatRoom({ roomId }: { roomId: number }) {
  const chats = await getChats(roomId);
  return <div><ChatRoomClient chats={chats} roomId={roomId} /></div>;
}