import {load} from '@loaders.gl/core'
import { GLB, GLBLoader } from '@loaders.gl/gltf'
import { Vec3, Vec2, vec3, vec2 } from 'wgpu-matrix'

export interface Mesh { 
    position: Vec3;
}

export async function loadGLB(pathToGlb : string) : Promise<Mesh>
{
    const glb : GLB = await load(pathToGlb, GLBLoader);

    const accessors   = glb.json.accessors;
    const bufferViews = glb.json.bufferViews;
    const binChunk    = glb.binChunks[0]; // there's only 1 bin chunk in a glb

    function getTypedArrayFromAccessor<TypedArray>(
        acessorIndex: Number,
        typedArrayCtor: new (buffer: ArrayBuffer, byteoffset: number, length: number) => TypedArray
    ) : TypedArray
    {
        const accessor   = accessors[0];
        const bufferView = bufferViews[accessor.bufferView];
        const byteOffset = bufferView.byteOffset;
        const byteLength = bufferView.byteLength;
        const count = accessor.count;

        const actualOffset = byteOffset + binChunk.byteOffset;
        
        return new typedArrayCtor(binChunk.arrayBuffer, actualOffset, count);
    }

    let positions : Float32Array = getTypedArrayFromAccessor<Float32Array>(0, Float32Array);
    let normals   : Float32Array = getTypedArrayFromAccessor<Float32Array>(1, Float32Array);
    let uvs       : Float32Array = getTypedArrayFromAccessor<Float32Array>(2, Float32Array);
    let indices = getTypedArrayFromAccessor<Uint16Array>(3, Uint16Array);

    let numVertices = 8;

    for(let i = 0; i < numVertices*3; i+=3)
    {
        console.log(`
            vertex ${i/3} is at (${positions[indices[i + 0]]}, ${positions[indices[i + 1]]}, ${positions[indices[i + 2]]}).
        `);
    }

    return {
        position: vec3.create(0.0,0.0,0.0) 
    };
}