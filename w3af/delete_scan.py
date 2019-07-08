import requests
import json
 
 
response = requests.delete('https://127.0.0.1:5000/scans/1',verify=False)
                          
print(response.text)
