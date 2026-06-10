import { Transform } from "./transform.js"
import { Material } from "../assets/material.js"

export default class SceneGraph
{
    // At this stage, this is essentially a list of other nodes.
    private root : SceneNode;

    constructor(private jsonString : string = "")
    {
        if(jsonString === "")
            this.root = new SceneNode();

        // I may have to try / catch here as well because the parsing may fail
        const rawObj = JSON.parse(jsonString, function(key, value) {
            // Reviver if needed?
        });

        this.root = SceneNode.fromJSON(rawObj);
    }

    public serializeJSON(pathToSeriralize : string) : void
    {
        // method for serializing the SceneGraph to JSON
    }

    
}

class SceneNode
{
    children?: Array<SceneNode>; 
    name?: string = "";
    transform?: Transform = new Transform();
    mesh?: any; //: Mesh = new Mesh();
    material?: Material  = new Material();

    static fromJSON(data: any): SceneNode {
        let result : SceneNode = new SceneNode();

        if("name" in data)
            result.name = data.name;

        if("transform" in data) {
            // construct Transform from data.transform
        }

        if("mesh" in data) {
            // construct Mesh from data.mesh
        }

        if("material" in data) {
            // construct Material from data.material
        }
        
        if("children" in data) {
            result.children = data.children.map((c: any) => SceneNode.fromJSON(c));
        }

        return result;
    }

}
