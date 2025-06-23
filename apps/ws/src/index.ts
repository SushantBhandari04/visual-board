import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db/client"
import UserStore from "./UserStore";

const wss = new WebSocketServer({ port: 8080 });

const messageQueue: Array<{ roomId: string, userId: string, message: string }> = [];

// Background worker to process the queue and store messages in DB
setInterval(async () => {
    while (messageQueue.length > 0) {
        const msg = messageQueue.shift();
        if (msg) {
            await prisma.chat.create({
                data: {
                    roomId: Number(msg.roomId),
                    userId: msg.userId,
                    message: msg.message
                }
            });
        }
    }
}, 1000); // Process every second

wss.on("connection", function (socket, request) {
    const url = request.url;  // ws://localhost:8080?token=123123

    if (!url) {
        socket.close();
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get("token");

    if (!token) {
        socket.close();
        return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !(decoded as JwtPayload).userId) {
        socket.close();
        return;
    }

    const userId = (decoded as JwtPayload).userId;
    const userStore = UserStore.getInstance();
    userStore.addUser(userId, socket);

    // remove user from store when socket closes
    socket.on("close", () => {
        userStore.removeUser(userId);
        console.log(`User ${userId} disconnected`);
    })

    enum queryType {
        join_room = "join_room",
        leave_room = "leave_room",
        chat = "chat"
    }

    interface dataType {
        type: queryType,
        roomId: string,
        message?: string,
        senderId?: string
    }

    socket.on("message", async function (data) {
        const parsedData: dataType = JSON.parse(data as unknown as string);

        if (parsedData.type === queryType.join_room) {
            const room = await prisma.room.findFirst({
                where: {
                    id: Number(parsedData.roomId)
                }
            })

            if (!room) {
                socket.close();
                return;
            }

            // Add room to user in UserStore
            userStore.addRoomToUser(userId, parsedData.roomId);
            socket.send("Joined room: " + parsedData.roomId);
        }

        if (parsedData.type === queryType.leave_room) {
            const room = await prisma.room.findFirst({
                where: {
                    id: Number(parsedData.roomId)
                }
            })

            if (!room) {
                socket.close();
                return;
            }

            // Remove room from user in UserStore
            userStore.removeRoomFromUser(userId, parsedData.roomId);
            socket.send("Left room: " + parsedData.roomId);
        }
        if (parsedData.type === queryType.chat) {
            const room = await prisma.room.findFirst({
                where: {
                    id: Number(parsedData.roomId)
                }
            })

            if (!room) {
                socket.close();
                return;
            }

            // check if user is in the room
            const userRooms = userStore.getUserRooms(userId);
            if (!userRooms.includes(parsedData.roomId)) {
                socket.close();
                return;
            }

            // Push message to the queue for async DB storage
            messageQueue.push({
                roomId: parsedData.roomId,
                userId: userId,
                message: parsedData.message || ""
            });

            // Broadcast message to all users in the room
            const usersInRoom = userStore.getAllUsers();
            usersInRoom.forEach((userData) => {
                if (userData.rooms.includes(parsedData.roomId)) {
                    userData.socket.send(JSON.stringify({
                        type: "chat",
                        roomId: parsedData.roomId,
                        message: parsedData.message,
                        senderId: userId
                    }));
                }
            })
        }
    })
})