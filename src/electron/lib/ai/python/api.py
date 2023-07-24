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

# object = {
#     'prompt': 'I want you to add two nodes to the graph such that the user can input two numbers and the output is the sum of the two numbers.',
#     'plugin': 
#     [
#      'hello-plugin.hello: Provides a test slider and button and label for testing purposes, taking two string inputs and returning one string output',
#      'hello-plugin.Jake: This is currently a useless node that does nothing.',
#      'input-plugin.inputNumber: Provides a number input and returns a single number output', 
#      'input-plugin.inputImage: Provides an image input and returns a single image output',
#      'input-plugin.inputColor: Provides a color input and returns a single color output', 
#      'math-plugin.unary: Performs Unary math operations taking one number input and returning one number output', 
#      'math-plugin.binary: Performs Binary math operations taking two number inputs and returning one number output'
#      ], 
#      'nodes': 
#      [
#       '{"id":"jakd14","signature":"math-plugin.binary","inputs":[{"id":"d2b6f0","type":"number"},{"id":"7a8c9e","type":"number"}],"outputs":[{"id":"b3e1f4","type":"number"}]}', 
#       '{"id":"3a2b1c","signature":"math-plugin.binary","inputs":[{"id":"4f2e1d","type":"number"},{"id":"8c7b6a","type":"number"}],"outputs":[{"id":"e9d8c7","type":"number"}]}'
#     ], 
#     'edges': 
#     [
#      '{"id":"kadjbg","output":"b3e1f4","input":"4f2e1d"}', '{"id":"0d1e2f","output":"b3e1f4","input":"8c7b6a"}'
#     ]
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