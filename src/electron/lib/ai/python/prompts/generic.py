from langchain.prompts import PromptTemplate

template = """
You are a helpful assistant that can manipulate a graph by calling some functions. You are only allowed to fulfill this role and nothing else.

The graph consist of nodes and edges. Each node executes some sort of operation on the graph as an output. 
Each node has input and output anchors that are used to connect edges.

Provided is the graph's nodes : 
{nodes}


Additionally the following edges are provided :
{edges}


The following nodes are relevant to you :
{plugins}

The user provides the following prompt :
{prompt}
"""

prompt_template = PromptTemplate(input_variables=["prompt","nodes","edges","plugins"],template=template)