import express from "express"
import { prisma } from "@repo/db/client"
import { UserSignupSchema, UserSigninSchema, CreateRoomSchema } from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authMiddleware } from "./middleware";
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req, res) => {
    res.send("Hello");
})

// Signup endpoint
app.post("/signup", async (req, res) => {
    const input = await req.body;
    try {
        const validatedInput = UserSignupSchema.safeParse(input);
        if (!validatedInput.success) {
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        const { email, password, name } = input;
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword, // Store the hashed password
                name
            }
        })

        res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
})

// Signin endpoint
app.post("/signin", async (req, res) => {
    const input = await req.body;
    try {
        const validatedInput = UserSigninSchema.safeParse(input);
        if (!validatedInput.success) {
            res.status(400).json({ message: "Invalid input" });
        }

        const { email, password } = input;
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password); // check if the password matches the hashed password

        if (!isPasswordValid) {
            res.status(400).json({ message: "Invalid password" });
            return;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        res.status(200).json({ message: "Signin successful", token });
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
})

// Create room endpoint
app.post("/create-room", authMiddleware, async (req, res) => {
    const input = await req.body;
    try {
        const validatedInput = CreateRoomSchema.safeParse(input);
        if (!validatedInput.success) {
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const room = await prisma.room.create({
            data: {
                slug: input.name,
                adminId: userId
            }
        })

        res.status(201).json({ message: "Room created successfully", roomId: room.id });
    }
    catch {
        res.status(500).json({ message: "Internal server error" });
    }
})

// Get all chats in a room
app.get("/chats/:roomId", authMiddleware, async (req,res) => {
    const roomId = Number(req.params.roomId);

    try {
        const chats = await prisma.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 50
        })

        res.status(200).json(chats);
    } catch{
        res.status(500).json({ message: "Internal server error" });
    }
})

app.listen(3001, ()=>{
    console.log("Server is running on port 3001")
})