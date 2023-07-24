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
    # Process each line of input
    processed_line = line
    output += processed_line
object = json.loads(output)

# object: {
#     "prompt": "...",
#     "nodes": "...",
#     "edges": "...",
#     "plugin": "...",
# }


# print("\n")
# print(object["prompt"])
# opengpt.sendPrompt(object["prompt"])

# Send the processed line to stdout
# print(object["nodes"])



# def write_dict_to_file(dict, path):
#     with open(path, "w") as f:
#         f.write(json.dumps(dict, indent=2))

# write_dict_to_file(object, "output.json")


class API:

    commands = BASE()

    def __init__(self):
        self.agent = GPT(self)

    # Pass user prompt input to AI agent
    def sendPrompt(self, body):
        self.agent.sendPrompt(body)

    def addNode(self, inputs):
        print("hello")


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