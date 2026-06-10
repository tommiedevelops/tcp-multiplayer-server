import { Vec3, Quat, vec3, quat } from "wgpu-matrix"

export class Transform
{
    public position : Vec3 = vec3.create(0,0,0);
    public rotation : Quat = quat.create(0,0,0,0);
    public scale    : Vec3 = vec3.create(1,1,1);
}