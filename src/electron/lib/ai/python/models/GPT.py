import sys
import os
import json

# Get the parent directory
parent_dir = os.path.dirname(os.path.realpath(__file__))

# Add the parent directory to sys.path
sys.path.append(parent_dir)

from langchain.chat_models import ChatOpenAI
from functions.graphFunc import Functions
from dotenv import load_dotenv
from langchain.agents import initialize_agent, AgentType
from prompts import generic


load_dotenv()

class gpt: 

    def __init__(self, api):
        Functions.api = api
        print("GPT INIT", Functions.api)
        print("NEW AGENT CREATED")

    def sendPrompt(self, body):
        llm = ChatOpenAI(temperature=0.1,openai_api_key=os.getenv("OPENAI_API_KEY"))
        open_ai_agent = initialize_agent(Functions.tools,
                            llm,
                            agent=AgentType.OPENAI_FUNCTIONS,
                            model="gpt-3.5-turbo-0613",
                            verbose=True,
                            debug=True,                   
        )
    
        print(Functions.api)
        
        prompt = generic.prompt_template.format(prompt=body["prompt"],nodes=body["nodes"],edges=body["edges"],plugins=body["plugin"])
    
        # print(prompt)
    
        temp = open_ai_agent.run(prompt)
    
        output = {
            "response" : temp
        }
    
        json_object = json.dumps(output, indent = 8) 
        print(json_object)