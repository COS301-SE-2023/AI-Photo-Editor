functions = [
    {
        "name": "addNodes",
        "description": "Add a new nodes to the provided graph",
        "parameters": {
            "type": "object",
            "properties": {
                "signatures": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "An array of node signatures representing each node to be added. e.g math-plugin.binary, math-plugin.unary",
                },
            },
            "required": ["signatures"],
        },
    },
    {
        "name": "removeNodes",
        "description": "Remove nodes from the provided graphs",
        "parameters": {
            "type": "object",
            "properties": {
                "nodes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "An array of node IDs representing each node to be removed. e.g 'j2n43k', 'ia11ol'",
                },
            },
            "required": ["nodes"],
        },
    },
    {
        "name": "addEdges",
        "description": "Add an edge between an output and input",
        "parameters": {
            "type": "object",
            "properties": {
                "edges": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "from": {
                                "type": "string",
                                "description": "Id of the output connected to the edge. e.g 'l40plq', 'j5nm33'"
                            },
                            "to": {
                                "type": "string",
                                "description": "Id of the input connected to the edge. e.g 'az22m3', '0lpm5i'"
                            }
                        }
                    },
                    "description": "An array of objects representing the new edges to be added"
                }
            },
            "required": ["edges"]
        }
    },
    {
        "name": "removeEdges",
        "description": "Remove an edge between an output and input",
        "parameters": {
            "type": "object",
            "properties": {
                "edges": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "description": "Id of the edge to be removed. e.g '8kn5la', '1m9j0kl'"
                    },
                    "description": "An array of ids representing the edges which have to be removed. e.g 'k2no3b', '1b2nc8'"
                }
            },
            "required": ["edges"]
        }
    }
]