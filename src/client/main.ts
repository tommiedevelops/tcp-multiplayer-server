// Initialize renderer
// Initialize empty scene
// Hardcode some stuff into the scene for now

import { Renderer } from "./renderer/renderer"
import { readFileSync } from "fs";

import SceneGraph from "./scene/scene_graph.js"

async function main()
{
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    // Maybe worth doing some validation here. 
    // Is canvas a valid object, is it what I expect for a WebGPU app?

    let renderer : Renderer = await Renderer.create(canvas);

    // Retrieve Scene (for now hardcoded but in future from server and probably part of main loop)
    const response = await fetch("/assets/scene.json");

    if(!response.ok) {
        console.error("HTTP-Error: " + response.status);
        return -1;
    }

    let sceneJSON : string;
    try {
        sceneJSON = await response.json();
    } catch(e) {
        console.error(e);
        return -1;
    }

    // Construct Scene Graph
    const scene: SceneGraph = new SceneGraph(sceneJSON);

    // Main Loop
    while(true)
    {
        // Graph Walk 1: Walk Scene Graph and update each node 
        // (Node's custom logic)

        // Graph Walk 2: Walk Scene Graph to collect all relevant 
        // render data and store in a TypedArray 

        let {encoder, pass} = renderer.beginFrame();
        // renderer.createBuffer() <-- fill with render data
        // --- render steps ---
        // Pipelines are created with shader modules (maybe create a pipeline class)
        renderer.endFrame(encoder, pass); // Submitted here

    }

}

main();

/*

Th main loop will actually look more like this and 
function loop() {
    // walk 1: update
    // walk 2: gather
    // render
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

Delta time obtained hrough something like thiis

let lastTime = 0;
function loop(timestamp: number) {
    const delta = (timestamp - lastTime) / 1000; // seconds
    lastTime = timestamp;
    requestAnimationFrame(loop);
}
*/