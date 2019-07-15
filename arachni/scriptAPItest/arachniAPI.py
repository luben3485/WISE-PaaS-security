import argparse
import requests
import json
import zipfile,io

def process_command():
	parser = argparse.ArgumentParser()
	parser.add_argument('--address', '-a', type=str, required=False, help='API server address',default="127.0.0.1:5000")
	parser.add_argument('--target', '-t', type=str, required=False, help='target URL',default="http://testphp.vulnweb.com")
	parser.add_argument('--scanmethod', '-m', type=str, required=True, help='scan methond')
	parser.add_argument('--id', '-id', type=str, required=True, help='id number')
	return parser.parse_args()
if __name__ == '__main__':
	args = process_command()
	if args.scanmethod == "start":
		
		data = {
			"url" : args.target,
			"checks": [
				"*"
			],
		"audit": {
			"forms": True,
			"cookies": False,  
			"headers": False
		},
		"scope": {
			"page_limit": 5,
			"exclude_path_patterns": [
				"logout",
				"security",
				"login",
				"setup"
			]  
		}
		}
		
		print(json.dumps(data))
		response = requests.post('http://' + args.address  + '/scans',data=json.dumps(data),headers={'content-type': 'application/json'})
		print(response.text)
		#response = response.json()
		#print(response)
	elif args.scanmethod == "result":
		response = requests.get('http://' + args.address  + '/scans/'+args.id+'/report')
		print(response.text)
	elif args.scanmethod == "resulthtml":
		response = requests.get('http://' + args.address  + '/scans/'+args.id+'/report.html.zip')
		z = zipfile.ZipFile(io.BytesIO(response.content))
		#print(z.namelist())
		for filename in z.namelist():
				z.extract(filename, path="static/", pwd=None)


