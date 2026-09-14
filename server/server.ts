import { defineServer, defineRoom } from "colyseus";
import { MyRoom } from "./rooms/MyRoom";

const server = defineServer({
    rooms: {
        my_room: defineRoom("MyRoom"),
    },
});

console.log("Hi");