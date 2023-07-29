import sys
import os

# Get the parent directory
parent_dir = os.path.dirname(os.path.realpath(__file__))

# Add the parent directory to sys.path
sys.path.append(parent_dir)

from langchain.chat_models import ChatOpenAI
# from functions.graphFunc import Functions
from functions.tools import tools
from dotenv import load_dotenv
from langchain.agents import initialize_agent, AgentType
from prompts import generic
from api import get_api

load_dotenv()


class GPT:
    def sendPrompt(self, body) -> str:
        llm = ChatOpenAI(temperature=0.1, openai_api_key=os.getenv("OPENAI_API_KEY"))
        open_ai_agent = initialize_agent(
            tools,
            llm,
            agent=AgentType.OPENAI_FUNCTIONS,
            model="gpt-3.5-turbo-0613",
            # verbose=True,
            debug=True,
            max_iterations=20,
        )

        prompt = generic.prompt_template.format(
            prompt=body["prompt"],
            nodes=body["nodes"],
            edges=body["edges"],
            plugins=body["plugin"],
        )

        finalResponse = open_ai_agent.run(prompt)
        return finalResponse
