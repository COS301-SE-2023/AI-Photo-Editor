import json
import sys
import os
from models import gpt


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

# print("\n")
# print(object["prompt"])
# opengpt.sendPrompt(object["prompt"])

# Send the processed line to stdout
# print(object["nodes"])


gpt.sendPrompt(object)

def write_dict_to_file(dict, path):
    with open(path, "w") as f:
        f.write(json.dumps(dict, indent=2))

write_dict_to_file(object, "output.json")


