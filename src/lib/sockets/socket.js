import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const socket = io(URL, {
    transports: ["websocket"],
    autoConnect: true,
});