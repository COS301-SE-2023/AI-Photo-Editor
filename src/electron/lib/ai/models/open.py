from langchain.llms import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

def sendPrompt(body):
    llm = OpenAI(temperature=0.1,openai_api_key=os.getenv("OPENAI_API_KEY"))

    
    line = llm.predict(body)
# >> Feetful of Fun
    print(line)
