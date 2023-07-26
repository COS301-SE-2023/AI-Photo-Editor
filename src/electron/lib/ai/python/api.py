from typing import Union
import socket
import json
import sys

class API:
    def send(self, data: Union[str, dict]):
        raise NotImplementedError

    def receive(self):
        raise NotImplementedError

class SocketAPI(API):
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.socket = None

    def connect(self):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.connect((self.host, self.port))

    def send(self, data):
        self.socket.sendall(data.encode())

    def receive(self):
        raise NotImplementedError

    def disconnect(self):
        self.socket.close()

class StdioAPI(API):
    def send(self, data):
        if isinstance(data, dict):
            data = json.dumps(data)

        sys.stdout.write(data)
        sys.stdout.flush()

    def receive(self):
        # data = ""
        # while True:
        #     line = sys.stdin.readline()
        #     if line.strip().endswith("#"):
        #         line += line.strip()
        #         break
        #     data += line
        # return data
        output = ""
        for line in sys.stdin:
            if(line == "end of transmission\n"):
                break
            output += line

        return output

# ========== API Config ==========

api = None

def set_api(a: API):
    global api
    api = a

def get_api() -> API:
    global api
    if not api:
        api = StdioAPI()

    return api