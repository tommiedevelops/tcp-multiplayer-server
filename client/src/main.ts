// Initialize renderer
// Initialize empty scene
// Hardcode some stuff into the scene for now

import { Renderer } from "./renderer/renderer"
import { SceneGraph, SceneData }  from "./scene/scene_graph.js"
import Mesh from "./assets/mesh"


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

    console.log(sceneData);

    let scene = new SceneGraph(sceneData);
    
    const mesh = Mesh.fromGLB("./public/models/cube.glb");
    
    console.log();

    let renderer : Renderer = await Renderer.create(canvas);

    let {encoder, pass} = renderer.beginFrame();

    renderer.endFrame(encoder, pass);
}

main();
