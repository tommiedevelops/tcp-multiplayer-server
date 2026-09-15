import { Client } from "@colyseus/sdk"

const client = new Client("http://localhost:2567");

async function main() {
    try {
        const room = await client.joinOrCreate("my_room");
        console.log("joined successfully", room);
    } catch (e) {
        console.error("join error", e);
    }
}

main();
