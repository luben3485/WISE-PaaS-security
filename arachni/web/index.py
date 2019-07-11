#-*-coding:utf-8 -*-

import random
import os
from flask import Flask,request
from flask import jsonify,abort
import requests
import json
ssoUrl = 'https://portal-sso.wise-paas.io'
app = Flask(__name__,static_url_path='',root_path=os.getcwd())    
print(os.path.join(os.getcwd(), "static"))

@app.route('/')
def index():
	return app.send_static_file('index.html')


@app.route('/startScan')
def startScan():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		scanOption = request.args.get('scanOption')
		url = request.args.get('url')

	
		data = {
			"url" : url,
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
		response = requests.post('http://127.0.0.1:5000/scans',data=json.dumps(data),headers={'content-type': 'application/json'})

		if response.status_code == 200:
			response = response.json()
			result = {'id':response['id']}
			return jsonify(result)
		else:
			abort(500)
	else:
		result = {'code':401}
		return jsonify(result)

		

@app.route('/getScanResult')
def getScanResult():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		id = request.args.get('id')
		if id:
			response = requests.get('http://127.0.0.1:5000/scans/'+str(id)+'/report')
			response = response.json()
			return jsonify(response)
		else:
			abort(404)

	else:
		result = {'code':401}
		return jsonify(result)

if __name__ == '__main__':
	#app.run()
	app.run(host='0.0.0.0',port=8080,debug=False)
