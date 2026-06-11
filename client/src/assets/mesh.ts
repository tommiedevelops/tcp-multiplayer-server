import {load} from '@loaders.gl/core'
import { GLB, GLBLoader } from '@loaders.gl/gltf'
import { Vec3, Vec2, vec3, vec2 } from 'wgpu-matrix'

export default class Mesh {

    static async fromGLB(pathToGLB: string) : Promise<Mesh>
    {
        const glb : GLB = await load(pathToGLB, GLBLoader);

        const accessors   = glb.json.accessors;
        const bufferViews = glb.json.bufferViews;
        const binChunk    = glb.binChunks[0]; // there's only 1 bin chunk in a glb

        type TypedArrayConstructor<T> = 
                new (buffer: ArrayBuffer, byteoffset: number, length: number) => T;

        function getTypedArrayFromAccessor<TypedArray>(
            accessorIndex: number,
            typedArrayCtor: TypedArrayConstructor<TypedArray>
        ) : TypedArray
        {
            const accessor   = accessors[accessorIndex];
            const bufferView = bufferViews[accessor.bufferView];
            const byteOffset = bufferView.byteOffset; // where the data actually starts
            const count = accessor.count; // number of this type in array

            const actualOffset = byteOffset + binChunk.byteOffset; // binary chunk may have preamble
        
            return new typedArrayCtor(binChunk.arrayBuffer, actualOffset, count);
        }

        let positions : Float32Array = getTypedArrayFromAccessor<Float32Array>(0, Float32Array);
        let normals   : Float32Array = getTypedArrayFromAccessor<Float32Array>(1, Float32Array);
        let uvs       : Float32Array = getTypedArrayFromAccessor<Float32Array>(2, Float32Array);
        let indices   : Uint16Array  = getTypedArrayFromAccessor<Uint16Array>(3, Uint16Array);

        return new Mesh(
            positions,
            normals,
            uvs,
            indices
        );
    }

    constructor(
        // temporary for now
        public positions : Float32Array,
        public normals?  : Float32Array,
        public uvs?      : Float32Array,
        public indices?  : Uint16Array
    )
    {}

}