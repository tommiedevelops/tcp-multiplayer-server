// Initialize renderer
// Initialize empty scene
// Hardcode some stuff into the scene for now

import { Renderer } from "./renderer/renderer"
import { readFileSync } from "fs";

import { SceneGraph, SceneData }  from "./scene/scene_graph.js"

async function main()
{

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    // Maybe worth doing some validation here. 
    // Is canvas a valid object, is it what I expect for a WebGPU app?

    // Retrieve Scene (for now hardcoded but in future from server and probably part of main loop)
    const httpResponse = await fetch("./public/scenes/scene.json");

    if(!httpResponse.ok) {
        console.error("HTTP-Error: " + httpResponse.status);
        return;
    }

    let sceneData : SceneData = await httpResponse.json(); // Validate success?

    let scene = new SceneGraph(sceneData);

    console.log(scene);

    let renderer : Renderer = await Renderer.create(canvas);

    // Main Loop

    //while(true)
    //{
        // Graph Walk 1: Walk Scene Graph and update each node 
        // (Node's custom logic)

        // Graph Walk 2: Walk Scene Graph to collect all relevant 
        // render data and store in a TypedArray 

      //  let {encoder, pass} = renderer.beginFrame();
        // renderer.createBuffer() <-- fill with render data
        // --- render steps ---
        // Pipelines are created with shader modules (maybe create a pipeline class)
     //   renderer.endFrame(encoder, pass); // Submitted here

    //}

}

main();
