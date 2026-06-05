// Initialize renderer
// Initialize empty scene
// Hardcode some stuff into the scene for now

import { Renderer } from "./renderer/renderer"

async function main()
{
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    let renderer : Renderer = await Renderer.create(canvas);

    let {encoder, pass} = renderer.beginFrame();
    // RENDER STEPS. Need to create pipelines separately and set them in pass
    // Pipelines are created with shader modules (maybe create a pipeline class)

    renderer.endFrame(encoder, pass);

}

main();