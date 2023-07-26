from langchain.chat_models import ChatOpenAI
from dotenv import load_dotenv
from langchain.agents import initialize_agent, AgentType
from prompt_template import template
from tools import tools
from api import get_api
import json
import os

load_dotenv()

def main():
    api = get_api()

    text_data = api.receive()
    data = json.loads(text_data)

    chat = ChatOpenAI(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-3.5-turbo-0613",
        temperature=0,
    )
    agent = initialize_agent(
        tools, chat, agent=AgentType.OPENAI_FUNCTIONS, verbose=False, max_iterations=5, 
    )
    res = agent.run(
        template.format(
            prompt=data["prompt"],
            graph=json.dumps(data["graph"]),
            toolbox=json.dumps(data["toolbox"]),
        )
    )

    api.send({"message": res})

main()