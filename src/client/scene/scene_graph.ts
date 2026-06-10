import { Transform } from "./transform.js"
import { Material } from "../assets/material.js"

export default class SceneGraph
{
    private root : SceneNode = new SceneNode();

    constructor(private pathToJSON : string = "")
    {
        // recursively construct SceneGraph from JSON file
        // validate JSON file
        // use a JSON Schema to ensure consistent structure
    }

    public serializeJSON(pathToSeriralize : string) : void
    {
        // method for serializing the SceneGraph to JSON
    }

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