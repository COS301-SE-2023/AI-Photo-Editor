import sys
import json

output = ""

for line in sys.stdin:
    # Process each line of input
    processed_line = line
    output += processed_line

object = json.loads(output)


print(object["prompt"])

    # Send the processed line to stdout

# print(output.rstrip())# Read input from stdin



