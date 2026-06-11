import {load} from '@loaders.gl/core'
import { GLB, GLBLoader } from '@loaders.gl/gltf'
import { Vec3, Vec2, vec3, vec2 } from 'wgpu-matrix'

export default class Mesh {

    static async fromGLB(pathToGLB: string) : Promise<Mesh>
    {
        const glb : GLB = await load(pathToGLB, GLBLoader);

        console.log(glb);

        return new Mesh();
    }

    constructor(
        // temporary for now
        public vertices? : Float32Array,
        public normals?  : Float32Array,
        public uvs?      : Float32Array,
        public indices?  : Uint32Array
    )
    {}

}