#implement stdin and stdout implementation here
import json
import sys

class BASE:
   

   def addNode(self, signature):
        """
        Sends an add node command to blix as a json string object through stdin
        ...
        Parameters
        ----------
        signature : str
            signature of the node to add
        """

        output = {
            "command" : "addNode",
            "args" : {
                "signature" : signature
            }
        }
    
        json_object = json.dumps(output, indent = 4) 
        print(json_object)
        sys.stdout.flush()

   def removeNode(self, id):
        """
        Sends a remove node command to blix as a json string object through stdin
        ...
        Parameters
        ----------
        id : str
            id of the node to add
        """

        output = {
            "command" : "removeNode",
            "args" : {
                "id" : id
            }
        }
    
        json_object = json.dumps(output, indent = 4) 
        print(json_object)
        sys.stdout.flush()

   def addEdge(self, output,input):
        """
        Sends an add edge command to blix as a json string object through stdin
        ...
        Parameters
        ----------
        output : str
            id of the output node
        input : str
            id of the input node
        """

        output = {
            "command" : "addEdge",
            "args" : {
                "output" : output,
                "input" : input,
            }
        }
    
        json_object = json.dumps(output, indent = 4) 
        print(json_object)
        sys.stdout.flush()

   def removeEdge(self, id):
        """
        Sends a remove edge command to blix as a json string object through stdin
        ...
        Parameters
        ----------
        signature : str
            signature of the node to add
        """

        output = {
            "command" : "removeEdge",
            "args" : {
                "id" : id
            }
        }
    
        json_object = json.dumps(output, indent = 4) 
        print(json_object)
        sys.stdout.flush()

   def sendResponse(self,temp):
        """
        Sends a response command to blix as a json string object through stdin
        ...
        Parameters
        ----------
        temp : str
            response of the request
        """

        output = {
            "command" : "response",
            "args" : {
                "response" : temp
            }
        }
    
        json_object = json.dumps(output, indent = 4) 
        print(json_object)
        sys.stdout.flush()