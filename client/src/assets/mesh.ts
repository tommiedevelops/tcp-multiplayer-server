import {OBJLoader, OBJLoaderOptions} from "@loaders.gl/obj"
import {load} from "@loaders.gl/core"

export class Mesh {

    constructor(
        public vertices : Float32Array,
        public normals  : Float32Array,
        public uvs      : Float32Array,
        public indices  : Uint32Array
    )
    {}

}