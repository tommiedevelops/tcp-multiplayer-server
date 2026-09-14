import { Room, Client } from "colyseus";
import { MyState } from "./MyState";

export class MyRoom extends Room {
    state = new MyState();

    onJoin(client: Client, options: any) {
        client.send("Welcome", "Welcome to the room!");
    }
};