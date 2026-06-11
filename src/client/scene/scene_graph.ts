import { Transform } from "./transform.js"
import { Material } from "../assets/material.js"

export default class SceneGraph
{
    // At this stage, this is essentially a list of other nodes.
    private root : SceneNode;

    constructor(sceneData : any) // change to be of type SceneData
    {
        this.root = SceneNode.fromSceneData(sceneData);
    }
    
}

class SceneNode
{
    children?: Array<SceneNode>; 
    name?: string = "";
    transform?: Transform = new Transform();
    mesh?: any; //: Mesh = new Mesh();
    material?: Material  = new Material();

    static fromSceneData(data: any): SceneNode {
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
            result.children = data.children.map(
                (c: any) => SceneNode.fromSceneData(c)
            );
        }

        return result;
    }

}
