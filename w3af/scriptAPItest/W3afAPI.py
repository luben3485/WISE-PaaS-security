import argparse
import requests
import json
import base64

def process_command():
	parser = argparse.ArgumentParser()
	parser.add_argument('--address', '-a', type=str, required=False, help='API server address',default="127.0.0.1:5000")
	parser.add_argument('--target', '-t', type=str, required=False, help='target URL',default="http://testphp.vulnweb.com")
	parser.add_argument('--scanmethod', '-m', type=str, required=True, help='scan methond')
	parser.add_argument('--profile', '-p', type=str, required=False, help='scan profile',default="full_audit.pw3af")
	parser.add_argument('--id', '-id', type=str, required=False, help='scan profile',default="0")
	parser.add_argument('--num', '-n', type=str, required=False, help='specific scan event',default="0")
	return parser.parse_args()
if __name__ == '__main__':
	args = process_command()
	if args.scanmethod == "delete":
		response = requests.delete('https://' + args.address  + '/scans/'+args.id,verify=False)
		print(response.text)
		#response = response.json()
		#print(response)
	elif args.scanmethod == "start":
		data = {'scan_profile': open('../profiles/'+ args.profile).read(),'target_urls': [args.target]}
		response = requests.post('https://' + args.address  + '/scans/',data=json.dumps(data),headers={'content-type': 'application/json'},verify=False)
		print(response.text)
	elif args.scanmethod == "status":
		response = requests.get('https://' + args.address  + '/scans/'+args.id+'/status',verify=False)
		print(response.text)
	elif args.scanmethod == "result":
		response = requests.get('https://' + args.address  + '/scans/'+args.id+'/kb',verify=False)
		print(response.text)
	elif args.scanmethod == "resultdetail":
		response = requests.get('https://' + args.address  + '/scans/'+args.id+'/kb/'+args.num ,verify=False)
		print(response.text)
	elif args.scanmethod == "scans":
		response = requests.get('https://' + args.address  + '/scans/',verify=False)
		print(response.text)
	elif args.scanmethod == "pause":
		response = requests.get('https://' + args.address  + '/scans/'+args.id+'/pause',verify=False)
		print(response.text)
	elif args.scanmethod == "stop":
		response = requests.get('https://' + args.address  + '/scans/'+args.id+'/stop',verify=False)
		print(response.text)
	elif args.scanmethod == "log":
		response = requests.get('https://' + args.address  + '/scans/'+args.id+'/log',verify=False)
		print(response.text)
	elif args.scanmethod == "version":
		response = requests.get('https://' + args.address  + '/version',verify=False)
		print(response.text)	
	elif args.scanmethod == "traffic":
		response = requests.get('https://' + args.address  + '/scans/'+args.id+'/kb/'+args.num ,verify=False)
		response = response.json()
		traffic_path = response['traffic_hrefs'][0]
		print(traffic_path)
		response = requests.get('https://' + args.address  + traffic_path ,verify=False)
		print(response.text)
	elif args.scanmethod == "urls":
		response = requests.get('https://' + args.address  + '/scans/'+args.id+'/urls/' ,verify=False)
		print(response.text)	

	elif args.scanmethod == "urlsdetail":
		response = requests.get('https://' + args.address  + '/scans/'+args.id+'/fuzzable-requests/' ,verify=False)
		response = response.json()
		text_base64_list = response['items']
		text_decode_list = [base64.b64decode(text).replace('\n','').replace('\r','') for text in text_base64_list]
		print(text_decode_list)
	elif args.scanmethod == "exceptions":
		response = requests.get('https://' + args.address  + '/scans/'+args.id+'/exceptions',verify=False)
		print(response.text)




 





