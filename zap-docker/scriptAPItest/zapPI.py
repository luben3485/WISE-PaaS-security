import argparse
import requests
import json
import zipfile,io

def process_command():
    parser = argparse.ArgumentParser()
    parser.add_argument('--address', '-a', type=str, required=False, help='API server address',default="127.0.0.1:5000")
    parser.add_argument('--target', '-t', type=str, required=False, help='target URL',default="http://testphp.vulnweb.com")
    parser.add_argument('--scanmethod', '-m', type=str, required=True, help='scan methond')
    parser.add_argument('--id', '-id', type=str, required=False, help='id number')
    return parser.parse_args()
if __name__ == '__main__':
    args = process_command()
    if args.scanmethod == "start":
        url = args.target
        maxChildren=''
        recurse=''
        contextName=''
        subtreeOnly=''

        payload = {'url': url, 'maxChildren': maxChildren,'recurse':recurse,'contextName':contextName ,'subtreeOnly':subtreeOnly}
        #response = requests.get('http://' + args.address  + 'JSON/spider/action/scan',params=payload)
        r = requests.get('http://127.0.0.1:8080/JSON/spider/action/scan/?url=http%3A%2F%2Fcrackme.cenzic.com%2F&maxChildren=&recurse=&contextName=&subtreeOnly=')
        print(r.text)
	#response = response.json()
	#print(response)
    elif args.scanmethod == "result":
        response = requests.get('http://' + args.address  + '/scans/'+args.id+'/report')
        print(response.text)

