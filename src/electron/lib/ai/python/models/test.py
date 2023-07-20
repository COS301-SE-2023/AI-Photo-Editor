import open
import json
from functions import graphFunc





# This is an example of the object that is passed in from the ai Manager to the API
object = {
    'prompt': 'I want you to add two nodes to a new graph',
    'plugin': 
    [
     'hello-plugin.hello: Provides a test slider and button and label for testing purposes, taking two string inputs and returning one string output',
     'hello-plugin.Jake: This is currently a useless node that does nothing.',
     'input-plugin.inputNumber: Provides a number input and returns a single number output', 
     'input-plugin.inputImage: Provides an image input and returns a single image output',
     'input-plugin.inputColor: Provides a color input and returns a single color output', 
     'math-plugin.unary: Performs Unary math operations taking one number input and returning one number output', 
     'math-plugin.binary: Performs Binary math operations taking two number inputs and returning one number output'
     ], 
     'nodes': 
     [
      '{"id":"jakd14","signature":"math-plugin.binary","inputs":[{"id":"d2b6f0","type":"number"},{"id":"7a8c9e","type":"number"}],"outputs":[{"id":"b3e1f4","type":"number"}]}', 
      '{"id":"3a2b1c","signature":"math-plugin.binary","inputs":[{"id":"4f2e1d","type":"number"},{"id":"8c7b6a","type":"number"}],"outputs":[{"id":"e9d8c7","type":"number"}]}'
    ], 
    'edges': 
    [
     '{"id":"kadjbg","from":"b3e1f4","to":"4f2e1d"}', '{"id":"0d1e2f","from":"b3e1f4","to":"8c7b6a"}'
    ]
}

open.sendPrompt(object)