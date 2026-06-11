
export interface ITransform {
    position : [number, number, number],
    rotation : [number, number, number, number],
    scale    : [number, number, number]
}

export interface SceneData {
    name: string,
    transform: ITransform,
    meshRef: string,
    matRef: string,
    children: Array<SceneData>
}

export class SceneGraph
{
    private root : SceneNode;

    constructor(sceneData : SceneData) {
        this.root = SceneNode.fromSceneData(sceneData);
    }
    
}

class SceneNode
{
    children?: Array<SceneNode>; 
    name?: string = "";
    //transform?: Transform = new Transform();
    mesh?: any; //: Mesh = new Mesh();
    //material?: Material  = new Material();

    static fromSceneData(data: SceneData): SceneNode {
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
                (c: SceneData) => SceneNode.fromSceneData(c)
            );
        }

        return result;
    }

}
