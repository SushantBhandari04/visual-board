import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rectangle",
    x: number,
    y: number,
    height: number,
    width: number
} | {
    type: "circle",
    centerX: number,
    centerY: number,
    radius: number
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private socket: WebSocket;
    private clicked: boolean;
    private startX: number = 0;
    private startY: number = 0;
    private selectedTool: Tool = "rectangle";

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.init();
        this.socket = socket;
        this.initHandlers();
        this.initMouseHandlers();
        this.clicked = false;
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape);
                this.clearCanvas();
            }
        }
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.existingShapes.map(shape => {
            if (shape.type == "rectangle") {
                this.ctx.strokeRect(shape.x, shape.y, shape.height, shape.width);
            }
            else if (shape.type == 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        })
    }

    mouseDownHandler = (e) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    }
    mouseMoveHandler = (e) => {
        if (this.clicked) {
            const height = e.clientX - this.startX;
            const width = e.clientY - this.startY;
            this.clearCanvas();
            //@ts-ignore
            const selectedTool = this.selectedTool;

            if (selectedTool == "rectangle") this.ctx.strokeRect(this.startX, this.startY, height, width);
            else if (selectedTool == "circle") {
                const centerX = this.startX + height / 2;
                const centerY = this.startY + width / 2;
                const radius = Math.max(Math.abs(height), Math.abs(width)) / 2;

                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    }
    mouseUpHandler = (e) => {
        this.clicked = false;
        const height = e.clientX - this.startX;
        const width = e.clientY - this.startY;

        let currentShape: Shape | null = null;
        const type = this.selectedTool;

        if (type == "rectangle") {
            currentShape = {
                type: type,
                x: this.startX,
                y: this.startY,
                height,
                width
            }
        }
        else if (type == 'circle') {
            currentShape = {
                type: type,
                centerX: this.startX + height / 2,
                centerY: this.startY + width / 2,
                radius: Math.max(Math.abs(height), Math.abs(width)) / 2,
            }
        }

        if (!currentShape) {
            return;
        }

        this.existingShapes.push(currentShape);

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify(currentShape),
            roomId: this.roomId
        }))
    }


    initMouseHandlers() {
        // Why using arrow function here is better ?  =>  find out
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)
    }
}
