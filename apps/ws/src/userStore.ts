import { WebSocket } from "ws";

type UserData = {
    socket: WebSocket;
    rooms: string[];
};

class UserStore {
    private static instance: UserStore;
    private users: Map<string, UserData> = new Map();

    private constructor() { }

    public static getInstance(): UserStore {
        if (!UserStore.instance) {
            UserStore.instance = new UserStore();
        }
        return UserStore.instance;
    }

    public addUser(userId: string, socket: WebSocket) {
        this.users.set(userId, { socket, rooms: [] });
    }

    public removeUser(userId: string) {
        this.users.delete(userId);
    }

    public getUser(userId: string): UserData | undefined {
        return this.users.get(userId);
    }

    public getAllUsers(): Map<string, UserData> {
        return this.users;
    }

    public addRoomToUser(userId: string, roomId: string) {
        const user = this.users.get(userId);
        if (user && !user.rooms.includes(roomId)) {
            user.rooms.push(roomId);
        }
    }

    public removeRoomFromUser(userId: string, roomId: string) {
        const user = this.users.get(userId);
        if (user) {
            user.rooms = user.rooms.filter(r => r !== roomId);
        }
    }

    public getUserRooms(userId: string): string[] {
        return this.users.get(userId)?.rooms || [];
    }
}

export default UserStore;