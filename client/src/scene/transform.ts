import { Vec3, Quat, vec3, quat } from "wgpu-matrix"

export class Transform
{
    public position : Vec3;
    public rotation : Quat;
    public scale    : Vec3;

    constructor(
        position: [number, number, number],
        rotation: [number, number, number, number], 
        scale:    [number, number, number],
    )
    {
        this.position = vec3.create(+position[0], +position[1], +position[2]);
        this.rotation = quat.create(+rotation[0], +rotation[1], +rotation[2], +rotation[3]);
        this.scale    = vec3.create(+scale[0], +scale[1], +scale[2]);
    }

}