// Initialize renderer
// Initialize empty scene
// Hardcode some stuff into the scene for now

import { Renderer } from "./renderer/renderer"
import { SceneGraph, SceneData }  from "./scene/scene_graph.js"
import Mesh from "./assets/mesh"

// Temporary
import { Mat3, mat3, Mat4, mat4, Vec3, vec3, Vec2, vec2, Vec4, vec4, quat } from "wgpu-matrix"

async function main()
{

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    // Maybe worth doing some validation here. 
    // Is canvas a valid object, is it what I expect for a WebGPU app?

    // Retrieve Scene (for now hardcoded but in future from server and probably part of main loop)
    const httpResponse = await fetch("./scenes/scene.json");

    if(!httpResponse.ok) {
        console.error("HTTP-Error: " + httpResponse.status);
        return;
    }

    let sceneData : SceneData = await httpResponse.json(); // Validate success?

    console.log(sceneData);

    let scene = new SceneGraph(sceneData);
    
    // Hard coded values for testing the renderer
    const mesh = await Mesh.fromGLB("./models/cube.glb");

    const mesh_position = vec3.create(0,0,0);
    const mesh_rotation = quat.create(0,0,0,0);
    const mesh_scale    = vec3.create(1,1,1);

    const cam_position = vec3.create(0,0,-5);
    const cam_target = vec3.create(0,0,0);
    const cam_up = vec3.create(0,1,0);
    const cam_fov = 45 * Math.PI / 180; // radians
    const cam_near = 1;
    const cam_far = 20;
    const cam_aspect = canvas.width / canvas.height; 

    const meshTranslation : Mat4 = mat4.translation(mesh_position);
    const meshRotation    : Mat4 = mat4.fromQuat(mesh_rotation);
    const meshScale       : Mat4 = mat4.scaling(mesh_scale);

    const modelMat : Mat4 = mat4.multiply(mat4.multiply(meshTranslation, meshRotation), meshScale);
    const viewMat  : Mat4 = mat4.lookAt(cam_position, cam_target, cam_up);
    const projMat  : Mat4 = mat4.perspective(cam_fov, cam_aspect, cam_near, cam_far);

    let renderer : Renderer = await Renderer.create(canvas);

    const modelUniformBufferSize : number = 64;  //mat4x4<f32>
    const viewUniformBufferSize  : number = 64;  //mat4x4<f32>
    const projUniformBufferSize  : number = 64;  //mat4x4<f32>

    const modUniformBuffer  = renderer.createBuffer(modelUniformBufferSize, GPUBufferUsage.UNIFORM);
    const viewUniformBuffer = renderer.createBuffer(viewUniformBufferSize, GPUBufferUsage.UNIFORM);
    const projUniformBuffer = renderer.createBuffer(projUniformBufferSize, GPUBufferUsage.UNIFORM);

    // Write shaders first then write buffers and pipelines to match them

    // Meshes should own their own vertex and index buffers
    // and a uniform model buffer

    // The camera will store the uniform view / projection buffer

    // Materials will own their own GPURenderPipeline as well as a BindGroupLayout
    // BindGroupLayout declares what resources are required by the shaders inside the GPURenderPipeline as well as tehri shape 

    //const pipeline = renderer.createPipeline();

    const shaderFileResponse = await fetch("./shaders/brick_tower.wgsl");
    const source = await shaderFileResponse.text();

    let {encoder, pass} = renderer.beginFrame();

    renderer.endFrame(encoder, pass);
}

main();
