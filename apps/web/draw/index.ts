import axios from "axios";

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

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    let existingShapes: Shape[] = await getExistingShapes(roomId);

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "chat") {
            const parsedShape = JSON.parse(message.message);
            existingShapes.push(parsedShape);
            clearCanvas(canvas, ctx, existingShapes);
        }
    }
    clearCanvas(canvas, ctx, existingShapes);


    let clicked = false;
    let startX: number;
    let startY: number;

    canvas.addEventListener("mousedown", function (e) {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    })

    canvas.addEventListener("mouseup", function (e) {
        clicked = false;
        const height = e.clientX - startX;
        const width = e.clientY - startY;

        let currentShape: Shape | null = null;  
        //@ts-ignore
        const type = window.selectedTool;

        if (type == "rectangle") {
            currentShape = {
                type: type,
                x: startX,
                y: startY,
                height,
                width
            }
        }
        else if (type == 'circle') {
            currentShape = {
                type: type,
                centerX: startX+height/2,
                centerY: startY+width/2,
                radius: Math.max(Math.abs(height), Math.abs(width))/2,
            }
        }

        if(!currentShape){
            return;
        }

        existingShapes.push(currentShape);

        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify(currentShape),
            roomId
        }))
    })

    canvas.addEventListener("mousemove", function (e) {
        if (clicked) {
            const height = e.clientX - startX;
            const width = e.clientY - startY;
            clearCanvas(canvas, ctx, existingShapes);
            //@ts-ignore
            const selectedTool = window.selectedTool;

            if (selectedTool == "rectangle") ctx.strokeRect(startX, startY, height, width);
            else if (selectedTool == "circle") {
                const centerX = startX + height / 2;
                const centerY = startY + width / 2;
                const radius = Math.max(Math.abs(height), Math.abs(width)) / 2;

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();
            }
        }
    })
}

function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, existingShapes: Shape[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    existingShapes.map(shape => {
        if (shape.type == "rectangle") {
            ctx.strokeRect(shape.x, shape.y, shape.height, shape.width);
        }
        else if (shape.type == 'circle') {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
        }
    })
}

async function getExistingShapes(roomId: string) {
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