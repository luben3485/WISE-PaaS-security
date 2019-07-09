import requests
import json
 
 
response = requests.get('https://127.0.0.1:5000/scans/0/kb/',
                       verify=False)
                          
response = response.json()

print(response)
