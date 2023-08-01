from typing import Optional, Type, Dict, Union
from langchain.tools import format_tool_to_openai_function
from pydantic import BaseModel, Field
from typing import Type, List
from langchain.tools.base import BaseTool, ToolException
from api import get_api
import json


def _handle_error(error: ToolException) -> str:
    return (
        "The following errors occurred during tool execution:"
        + error.args[0]
        + "Please try another tool."
    )


class addNodeInput(BaseModel):
    signature: str = Field(
        ...,
        description="Signature/type of the node e.g 'math-plugin.binary', 'math-plugin.unary'",
    )


class removeNodeInput(BaseModel):
    id: str = Field(
        ..., description="Id of the node to be deleted e.g '15s2k3', '1m9j0kl'"
    )


class addEdgeInput(BaseModel):
    output: str = Field(
        ...,
        description="Id of the output anchor of a node to be connected to the edge. e.g 'l40plq', 'j5nm33'",
    )
    input: str = Field(
        ...,
        description="Id of the input anchor of a node to be connected to the edge. e.g 'az22m3', '0lpm5i'",
    )


class removeEdgeInput(BaseModel):
    id: str = Field(
        ..., description="Id of the edge to be removed. e.g '8kn5la', '1m9j0kl'"
    )


class updateInputValuesInput(BaseModel):
    nodeId: str = Field(..., description="Id of the node related to the input values")
    changedInputValues: Dict[str, float] = Field(
        ...,
        description="Map of input values to change. e.g. {'slider1`: 5.9, 'input2': 'hello'}",
    )

class updateInputValueInput(BaseModel):
    nodeId: str = Field(..., description="Id of the node related to the input values")
    inputValueId: str = Field(..., description="Id of the input value")
    newInputValue: float = Field(..., description="New input value")


class addNodesInput(BaseModel):
    signatures: List[str] = Field(
        ...,
        description="List of node signatures to be added to the graph. e.g math.sum, math.divide",
    )


class removeNodesInput(BaseModel):
    ids: List[str] = Field(
        ...,
        description="List of ids of nodes to be removed. e.g 2de2d4",
    )


class addEdgesInput(BaseModel):
    edges: List[addEdgeInput] = Field(
        ...,
        description="List of of objects representing edges to be added",
    )


class removeEdgesInput(BaseModel):
    ids: List[str] = Field(
        ...,
        description="List of ids of edges to be removed. e.g 2de2d4",
    )


class addNodeTool(BaseTool):
    name: str = "addNode"
    description: str = "Add a new node to the graph"
    args_schema: Type[BaseModel] = addNodeInput

    def _run(
        self,
        signature: str,
    ) -> str:
        data = {"type": "function", "name": "addNode", "args": {"signature": signature}}
        api = get_api()
        api.send(data)
        res = api.receive()
        return res

    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")


class removeNodeTool(BaseTool):
    name: str = "removeNode"
    description: str = "Remove a node from the graph"
    args_schema: Type[BaseModel] = removeNodeInput

    def _run(
        self,
        id: str,
    ) -> str:
        data = {"type": "function", "name": "removeNode", "args": {"id": id}}
        api = get_api()
        api.send(data)
        res = api.receive()
        return res

    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")


class addEdgeTool(BaseTool):
    name: str = "addEdge"
    description: str = "Adds an edge between an output anchor of a node and an input anchor of another node using their anchor id's"
    args_schema: Type[BaseModel] = addEdgeInput

    def _run(
        self,
        output: str,
        input: str,
    ) -> str:
        data = {
            "type": "function",
            "name": "addEdge",
            "args": {"output": output, "input": input},
        }
        api = get_api()
        api.send(data)
        res = api.receive()
        return res

    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")


class removeEdgeTool(BaseTool):
    name: str = "removeEdge"
    description: str = "Removes an edge between an output anchor of a node and an input anchor of another node using the edge id"
    args_schema: Type[BaseModel] = removeEdgeInput

    def _run(
        self,
        id: str,
    ) -> str:
        data = {"type": "function", "name": "removeEdge", "args": {"id": id}}
        api = get_api()
        api.send(data)
        res = api.receive()
        return res

    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")


class updateInputValuesTool(BaseTool):
    name: str = "updateInputValues"
    description: str = "Useful when the input values of nodes have to changed"
    args_schema: Type[BaseModel] = updateInputValuesInput

    def _run(
        self,
        nodeId: str,
        changedInputValues: Dict[str, float],
    ) -> str:
        data = {
            "type": "function",
            "name": "updateInputValues",
            "args": {"nodeId": nodeId, "changedInputValues": changedInputValues},
        }
        api = get_api()
        api.send(data)
        res = api.receive()
        return res

    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")

class updateInputValueTool(BaseTool):
    name: str = "updateInputValue"
    description: str = "Useful when the input value of a node has to be changed"
    args_schema: Type[BaseModel] = updateInputValueInput

    def _run(
        self,
        nodeId: str,
        inputValueId: str,
        newInputValue: float
    ) -> str:
        data = {
            "type": "function",
            "name": "updateInputValue",
            "args": {"nodeId": nodeId, "inputValueId": inputValueId, "newInputValue": newInputValue},
        }
        api = get_api()
        api.send(data)
        res = api.receive()
        return res

    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")


# ===================================================================
# TODO: Change these tools to work with new API format
# ===================================================================


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
        # commands.append({ "command": "addNodes", "signatures": signatures})
        return "addNodes command added\n"

    async def _arun(self) -> str:
        raise NotImplementedError("This tool does not support async execution")


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
        # commands.append({ "command": "removeNodes", "ids": ids})
        return "removeNodes command added\n"

    async def _arun(self) -> str:
        raise NotImplementedError("This tool does not support async execution")


class addEdges(BaseTool):
    """
                    Class to represent addEdges function to language model
                    ...
    class addEdgesInput(BaseModel):
            edges: List[addEdgeInput] = Field(
                    ...,
                    description="List of of objects representing edges to be added",
            )
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
    description: str = "Used to connect the output anchor from one node to the input anchor of another node."
    args_schema: Type[BaseModel] = addEdgesInput
    handle_tool_error = _handle_error

    def _run(self, edges: List[addEdgeInput]):

        # commands.append({ "command": "addEdges", "edges": edges})
        return "addEdges command added\n"

    async def _arun(self) -> str:
        raise NotImplementedError("This tool does not support async execution")


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
        # commands.append({ "command": "removeEdges", "ids": ids})
        return "removeEdges command added\n"

    async def _arun(self) -> str:
        raise NotImplementedError("This tool does not support async execution")


tools = [addNodeTool(), removeNodeTool(), addEdgeTool(), removeEdgeTool(), updateInputValueTool()]
