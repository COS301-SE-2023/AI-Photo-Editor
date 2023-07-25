import json
import sys
import os
from models.gpt import GPT
from models.functions.graphFunc import Functions
from strategies.base import BASE
    

# Get the parent directory
parent_dir = os.path.dirname(os.path.realpath(__file__))

# Add the parent directory to sys.path
sys.path.append(parent_dir)



output = ""
for line in sys.stdin:
    if(line == "end of transmission\n"):
        break
    output += line
object = json.loads(output)



class API:
    """
    Provides an interface for the AI agent to communicate with the electron app

    attributes:
        commands - the communication strategy for the interface
        agent - the AI agent that uses a model
    methods:
        sendPrompt(body) - sends the user prompt to the AI agent
    
    """

    logs = []

    commands = BASE()

    def __init__(self):
        self.agent = GPT(self)

    # Pass user prompt input to AI agent
    def sendPrompt(self, body):
        self.agent.sendPrompt(body)

    def hello(self):
        print("hello")


# try:
api = API()
api.sendPrompt(object)
# except Exception as e:
    # print(e)


# output: {
#     "commands" : Functions.commands,
#     "response" : temp
# }