import { schema, t, type SchemaType } from "@colyseus/schema";

// This is an interesting pattern. const Player for runtime, type Player for compile
// Should look into this more when I have time
export const Player = schema({
    name: t.string(),
    x:    t.number(),
    y:    t.number(),
},  "Player");
export type Player = SchemaType<typeof Player>;

export const MyState = schema({
    players: t.map(Player),
}, "MyState");
export type MyState = SchemaType<typeof MyState>;