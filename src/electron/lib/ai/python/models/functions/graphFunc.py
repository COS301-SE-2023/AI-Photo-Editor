from typing import Optional, Type
from langchain.tools import  format_tool_to_openai_function
from pydantic import BaseModel, Field

from langchain.tools.base import BaseTool


commands = []

class signature(BaseModel):

     signature : str =    Field(description="Signature/type of the node e.g 'math-plugin.binary', 'math-plugin.unary'")

class signatures(BaseModel):
     """The id's of the input and output connected to the edge"""

     From : str =    Field(description="Id of the output connected to the edge. e.g 'l40plq', 'j5nm33'")
     To : str =    Field(description="Id of the input connected to the edge. e.g 'az22m3', '0lpm5i'")

class Edge(BaseModel):
     
     signature : str =    Field(description="Id of the edge to be removed. e.g '8kn5la', '1m9j0kl'")

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


    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")
    
    args_schema: Optional[Type[BaseModel]] = signature

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
        signature: str,
    ) -> str:
            commands.append({ "command": "removeNode", "signature": signature })


    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")
    
    args_schema: Optional[Type[BaseModel]] = signature


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
    description: str = "Adds an edge between an output and input"

    def _run(
        self,
        From : str,
        To : str,
    ) -> str:
            commands.append({ "command": "addEdge", "from": From, "to": To })


    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")
    
    args_schema: Optional[Type[BaseModel]] = signatures


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
    description: str = "Removes an edge between an output and input"

    def _run(
        self,
        signature: str,
    ) -> str:
            commands.append({ "command": "removeEdge", "signature": signature})

    async def _arun(
        self,
    ) -> str:
        raise NotImplementedError("This tool does not support async execution yet")
    
    args_schema: Optional[Type[BaseModel]] = Edge

tools = [addNodeTool(),removeNodeTool(),addEdgeTool(),removeEdgeTool()]
functions = [format_tool_to_openai_function(t) for t in tools]

# To view the functions as schema
# from pprint import pprint
# pprint(functions)
