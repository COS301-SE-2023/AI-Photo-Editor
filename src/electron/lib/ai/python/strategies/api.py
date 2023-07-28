import json
import sys
import os
from models.gpt import GPT
from models.functions.graphFunc import Functions
from strategies.base import BASE
    

# Get the parent directory
# parent_dir = os.path.dirname(os.path.realpath(__file__))

# Add the parent directory to sys.path
# sys.path.append(parent_dir)



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

    # You can swap this out for a different strategy
    commands = BASE()

    def __init__(self):
        self.agent = GPT(self)

    # Pass user prompt input to AI agent
    def sendPrompt(self, body):
        self.agent.sendPrompt(body)

    def hello(self):
        print("hello")


def receive():
    data = ""
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        data += line
    return data




# data = receive()
sys.stdout.write()
sys.stdout.flush()
#     sys.stdout.write("Finished")
#     sys.stdout.flush()

# try:
# api = API()
# object = api.commands.receive()
# object = json.loads(object)
# api.sendPrompt(object)
# except Exception as e:
    # print(e)


# output: {
#     "commands" : Functions.commands,
#     "response" : temp
# }