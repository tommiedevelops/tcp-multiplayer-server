import { Transform } from "./transform.js"
import { Material } from "./material.js"

export default class SceneGraph
{
    constructor(private pathToJSON : string = "")
    {}
}

class SceneNode
{
    private _children : Array<SceneNode>; 

    transform : Transform = new Transform();
    material  : Material  = new Material();

    constructor()
    {
        this._children = new Array<SceneNode>();
    }

}