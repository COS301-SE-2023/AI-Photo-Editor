class CoreGraphStore {  //Stores Graphs
    constructor(
        private graphs: CoreGraph[]
    ) {}
}

class CoreGraph {
	private subscribers: []	

    constructor(
        private nodes: { UUID: Node },
        private edges: { UUID: Edge }
    ) {}

	public createNode(node: Node) {
        // TODO
	}

    public removeNode(node: Node) {
        // TODO
    }
	
    public addEdge(anchorFrom: Node, anchorTo: Node) {
        // TODO
    }
    
    public removeEdge(id : string) { //nodeFrom: Node, nodeTo: Node switched this for edge id, since we have a handle to all edges
        // TODO
    }

    public copy() {
        // TODO
    }
	
	public subscribe() {
        // TODO
	}

	public unsubscribe() {
        // TODO
	}
}

type UUID = string;

class Node {
    constructor (
        private id : UUID,
        private anchors: Anchor[]
    ) {}
}

class Anchor { 
    constructor (
        private uuid : UUID,
        private parent : Node,
        private type : string //Maybe some enumeration?
    ){
        // GENERATE UUID
        // 32-bit hex string
    }

    public execute() {
        //Some generic execution function, that will be handled by extensions
    }
}

class Edge {
    constructor (
        private id : UUID,

        private anchorFrom: UUID,
        private anchorTo: UUID
    ) {}
}
