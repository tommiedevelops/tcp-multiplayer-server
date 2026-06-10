import { Vec4, vec4 } from "wgpu-matrix";

export class Material 
{
    public albedo  : Vec4   = vec4.create(1,1,1,1); // default is white
    public diffuse : Number = 1.0;

    constructor(
        private _pathToFragmentShader : string = "",
        private _pathToVertexShader   : string = ""
    ) {}

}