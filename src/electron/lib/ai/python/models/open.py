from langchain.chat_models import ChatOpenAI
from functions import graphFunc
from dotenv import load_dotenv
from langchain.agents import initialize_agent, AgentType

import sys, os
# setting path
sys.path.append('../')

from prompts import generic

import os


load_dotenv()

def sendPrompt(body):
    llm = ChatOpenAI(temperature=0.1,openai_api_key=os.getenv("OPENAI_API_KEY"))

    open_ai_agent = initialize_agent(graphFunc.tools,
                        llm,
                        agent=AgentType.OPENAI_FUNCTIONS,
                        verbose=True,
                        debug=True,                   
    )
    

    temp = open_ai_agent.run(generic.promt_template.format(prompt=body["prompt"],nodes=body["nodes"],edges=body["edges"],plugins=body["plugin"]))

    print(graphFunc.commands)
    print(temp)

