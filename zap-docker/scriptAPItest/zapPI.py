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
    if args.scanmethod == "spider":
        url = args.target
        maxChildren=''
        recurse=''
        contextName=''
        subtreeOnly=''

        payload = {'url': url, 'maxChildren': maxChildren,'recurse':recurse,'contextName':contextName ,'subtreeOnly':subtreeOnly}
        r = requests.get('http://' + args.address  + '/JSON/spider/action/scan',params=payload)
        print(r.text)
	#response = response.json()
	#print(response)
    elif args.scanmethod == "report":
        baseurl = args.target
        start = ''
        count = ''
        riskId = ''
        payload = {'baseurl' : baseurl,'start':start,'count':count,'riskId':riskId}
        response = requests.get('http://' + args.address  + '/JSON/core/view/alerts/',params=payload)
        print(response.text)
    elif args.scanmethod == "reporthtml":
        response = requests.get('http://' + args.address  + '/OTHER/core/other/htmlreport/')
        print(response.text)
    elif args.scanmethod == "spiderstatus":
        payload = {'scanId':args.id}
        response = requests.get('http://' + args.address  + '/JSON/spider/view/status/',params=payload)
        print(response.text)
    elif args.scanmethod == "spiderpause":
        payload = {'scanId':args.id}
        response = requests.get('http://' + args.address  + '/JSON/spider/action/pause/',params=payload)
        print(response.text)
    elif args.scanmethod == "spiderresume":
        payload = {'scanId':args.id}
        response = requests.get('http://' + args.address  + '/JSON/spider/action/resume/',params=payload)
        print(response.text)
    elif args.scanmethod == "spiderremove":
        payload = {'scanId':args.id}
        response = requests.get('http://' + args.address  + '/JSON/spider/action/removeAllScans/',params=payload)
        print(response.text)
    elif args.scanmethod == "spiderdelete":
        response = requests.get('http://' + args.address  + '/JSON/core/action/deleteAllAlerts')
        print(response.text)
    elif args.scanmethod == "delete":
        response = requests.get('http://' + args.address  + '/JSON/core/action/deleteAllAlerts')
        print(response.text)
    elif args.scanmethod == "ascan":
        url = args.target
        resurse = True
        inScopeOnly = False
        scanPolicyName = ''
        method =''
        postData = ''
        contextId = ''
        payload = {'url' : url,'inScopeOnly':inScopeOnly,'scanPolicyName':scanPolicyName,'method':method,'postData':postData,'contextId':contextId}
        response = requests.get('http://' + args.address  + '/JSON/ascan/action/scan/',params=payload)
        print(response.text)
    elif args.scanmethod == "ascanstatus":
        payload = {'scanId':args.id}
        response = requests.get('http://' + args.address  + '/JSON/ascan/view/status/',params=payload)
        print(response.text)
    elif args.scanmethod == "ascanpause":
        payload = {'scanId':args.id}
        response = requests.get('http://' + args.address  + '/JSON/ascan/action/pause/',params=payload)
        print(response.text)
    elif args.scanmethod == "ascanresume":
        payload = {'scanId':args.id}
        response = requests.get('http://' + args.address  + '/JSON/ascan/action/resume/',params=payload)
        print(response.text)
    elif args.scanmethod == "ascanremove":
        payload = {'scanId':args.id}
        response = requests.get('http://' + args.address  + '/JSON/ascan/action/removeAllScans/',params=payload)
        print(response.text)
    elif args.scanmethod == "urls":
        payload = {'baseurl':args.target}
        response = requests.get('http://' + args.address  + '/JSON/core/view/urls/',params=payload)
        print(response.text)


