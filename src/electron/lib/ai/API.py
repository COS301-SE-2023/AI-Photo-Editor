import sys
import json
from models import open

output = ""

for line in sys.stdin:
    # Process each line of input
    processed_line = line
    output += processed_line

object = json.loads(output)

print("\n")
print(object)
# open.sendPrompt(object["prompt"])

# Send the processed line to stdout
# print(object["prompt"])




