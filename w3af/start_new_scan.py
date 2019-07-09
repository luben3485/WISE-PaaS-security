import requests
import json
 
data = {'scan_profile': open('./profiles/full_audit.pw3af').read(),
        'target_urls': ['http://testphp.vulnweb.com/']}
 
response = requests.post('https://127.0.0.1:5000/scans/',
                         data=json.dumps(data),
                         headers={'content-type': 'application/json'},verify=False)
                          
print(response.text)
