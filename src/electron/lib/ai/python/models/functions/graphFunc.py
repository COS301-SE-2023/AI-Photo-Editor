from typing import Optional, Type
from langchain.tools import  format_tool_to_openai_function
from pydantic import BaseModel, Field
from typing import Type, List
from langchain.tools.base import BaseTool,ToolException
import json


commands = []

def _handle_error(error: ToolException) -> str:
    return (
        "The following errors occurred during tool execution:"
        + error.args[0]
        + "Please try another tool."
    )

class addNodeInput(BaseModel):

     signature : str =    Field(description="Signature/type of the node e.g 'math-plugin.binary', 'math-plugin.unary'")


class addNodeTool( BaseTool):
    """
    Class to represent addNode function to language model
    ...

    Attributes
    ----------
    name : str
        a formatted string to display the name of the function
    description : str
        a string that provides a descriptive summary of the function

    Methods
    -------
    run(self,signature)
        Pushes the command to add a node to the graph to the commands list

    _arun(self)
        Raises an error as this function does not support async execution
    """


    name: str = "addNode"
    description: str = "Add a new node to the graph"

    def _run(
        self,
        signature: str,
    ) -> str:
            commands.append({ "command": "addNode", "signature": signature })
            return "addNode command added\n"


    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")
    
    args_schema: Optional[Type[BaseModel]] = addNodeInput


class removeNodeInput(BaseModel):
     
    id : str =    Field(description="id of the node to be deleted e.g '15s2k3', '1m9j0kl'")
class removeNodeTool( BaseTool):
    """
    Class to represent removeNode function to language model
    ...

    Attributes
    ----------
    name : str
        a formatted string to display the name of the function
    description : str
        a string that provides a descriptive summary of the function

    Methods
    -------
    run(self,signature)
        Pushes the command to remove a node from the graph to the commands list
    
    _arun(self)
        Raises an error as this function does not support async execution
    """

    name: str = "removeNode"
    description: str = "Remove a node from the graph"

    def _run(
        self,
        id: str,
    ) -> str:
            commands.append({ "command": "removeNode", "id": id })
            return "removeNode command added\n"


    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")
    
    args_schema: Optional[Type[BaseModel]] = removeNodeInput


class addEdgeInput(BaseModel):


     output : str =    Field(description="Id of the output connected to the edge. e.g 'l40plq', 'j5nm33'")
     input : str =    Field(description="Id of the input connected to the edge. e.g 'az22m3', '0lpm5i'")

class addEdgeTool( BaseTool):
    """
    Class to represent addEdge function to language model
    ...

    Attributes
    ----------
    name : str
        a formatted string to display the name of the function
    description : str
        a string that provides a descriptive summary of the function

    Methods
    -------
    run(self,From,To)
        Pushes the command to add an edge (from output to input) to the graph to the commands list
    
    _arun(self)
        Raises an error as this function does not support async execution
    """
        

    name: str = "addEdge"
    description: str = "Adds an edge between an output anchor of a node and an input anchor of another node using these anchor id's"

    def _run(
        self,
        From : str,
        To : str,
    ) -> str:
            commands.append({ "command": "addEdge", "from": From, "to": To })
            return "addEdge command added\n"


    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")
    
    args_schema: Optional[Type[BaseModel]] = addEdgeInput

class removeEdgeInput(BaseModel):
     
     ids : str =    Field(description="Id of the edge to be removed. e.g '8kn5la', '1m9j0kl'")

class removeEdgeTool( BaseTool):
    """
    Class to represent removeEdge function to language model
    ...

    Attributes
    ----------
    name : str
        a formatted string to display the name of the function
    description : str
        a string that provides a descriptive summary of the function

    Methods
    -------
    run(self,signature)
        Pushes the command to remove an Edge from the graph to the commands list
    
    _arun(self)
        Raises an error as this function does not support async execution
    """

    name: str = "removeEdge"
    description: str = "Removes an edge between an output anchor of a node and an input anchor of another node using the edge id"

    def _run(
        self,
        ids: str,
    ) -> str:
            commands.append({ "command": "removeEdge", "ids": ids})
            return "removeEdge command added\n"

    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")
    
    args_schema: Optional[Type[BaseModel]] = removeEdgeInput

class addNodesInput(BaseModel):

    signatures: List[str] = Field(
        ...,
        description="List of node signatures to be added to the graph. e.g math.sum, math.divide",
    )


class addNodes(BaseTool):
    """
    Class to represent addNodes function to language model
    ...

    Attributes
    ----------
    name : str
        a formatted string to display the name of the function
    description : str
        a string that provides a descriptive summary of the function

    Methods
    -------
    run(self,signature)
        Pushes the command to add Nodes to the graph to the commands list
    
    _arun(self)
        Raises an error as this function does not support async execution
    """

    name: str = "addNodes"
    description: str = "Add new nodes to the graph"
    args_schema: Type[BaseModel] = addNodesInput
    handle_tool_error = _handle_error

    def _run(self, signatures: List[str]):
        commands.append({ "command": "addNodes", "signatures": signatures})
        return "addNodes command added\n"

    async def _arun(self) -> str:
        raise NotImplementedError("This tool does not support async execution")


class removeNodesInput(BaseModel):

    ids: List[str] = Field(
        ...,
        description="List of ids of nodes to be removed. e.g 2de2d4",
    )


class removeNodes(BaseTool):
    """
    Class to represent removeNodes function to language model
    ...

    Attributes
    ----------
    name : str
        a formatted string to display the name of the function
    description : str
        a string that provides a descriptive summary of the function
    args_schema : Type[BaseModel]
    handle_tool_error : Callable[[ToolException], str]

    Methods
    -------
    run(self,ids)
        Pushes the command to remove Nodes from the graph to the commands list
    
    _arun(self)
        Raises an error as this function does not support async execution
    """

    name: str = "removeNodes"
    description: str = "Remove nodes from the graph"
    args_schema: Type[BaseModel] = removeNodesInput
    handle_tool_error = _handle_error

    def _run(self, ids: List[str]):
        commands.append({ "command": "removeNodes", "ids": ids})
        return "removeNodes command added\n"

    async def _arun(self) -> str:
        raise NotImplementedError("This tool does not support async execution")
    
class addEdgesInput(BaseModel):

    edges: List[addEdgeInput] = Field(
        ...,
        description="List of of objects representing edges to be added",
    )
class addEdges(BaseTool):
    """
    Class to represent addEdges function to language model
    ...

    Attributes
    ----------
    name : str
        a formatted string to display the name of the function
    description : str
        a string that provides a descriptive summary of the function
    args_schema : Type[BaseModel]
    handle_tool_error : Callable[[ToolException], str]

    Methods
    -------
    run(self,ids)
        Pushes the command to addEdges to the graph to the commands list
    
    _arun(self)
        Raises an error as this function does not support async execution
    """

    name: str = "addEdges"
    description: str = (
        "Used to connect the output anchor from one node to the input anchor of another node."
    )
    args_schema: Type[BaseModel] = addEdgesInput
    handle_tool_error = _handle_error

    def _run(self, edges: List[addEdgeInput]):

        commands.append({ "command": "addEdges", "edges": edges})
        return "addEdges command added\n"

    async def _arun(self) -> str:
        raise NotImplementedError("This tool does not support async execution")



class removeEdgesInput(BaseModel):

    ids: List[str] = Field(
        ...,
        description="List of ids of edges to be removed. e.g 2de2d4",
    )


class removeEdges(BaseTool):
    """
    Class to represent removeEdges function to language model
    ...

    Attributes
    ----------
    name : str
        a formatted string to display the name of the function
    description : str
        a string that provides a descriptive summary of the function
    args_schema : Type[BaseModel]
    handle_tool_error : Callable[[ToolException], str]

    Methods
    -------
    run(self,ids)
        Pushes the command to removeEdges from the graph to the commands list
    
    _arun(self)
        Raises an error as this function does not support async execution
    """

    name: str = "removeEdges"
    description: str = "Remove edges from the graph"
    args_schema: Type[BaseModel] = removeEdgesInput
    handle_tool_error = _handle_error

    def _run(self, ids: List[str]):
        commands.append({ "command": "removeEdges", "ids": ids})
        return "removeEdges command added\n"
    async def _arun(self) -> str:
        raise NotImplementedError("This tool does not support async execution")

tools = [addNodeTool(),removeNodeTool(),addEdgeTool(),removeEdgeTool()]
functions = [format_tool_to_openai_function(t) for t in tools]

# To view the functions as scheme

# def write_dict_to_file(dict, path):
#     with open(path, "w") as f:
#         f.write(json.dumps(dict, indent=2))

# write_dict_to_file(functions, "functions.json") #This will write to root directory