import pickle
import base64

def model_to_binary(model):
    return base64.b64encode(pickle.dumps(model)).decode('utf-8')

def binary_to_model(b64_string):
    return pickle.loads(base64.b64decode(b64_string.encode('utf-8')))
