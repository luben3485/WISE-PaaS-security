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
		data = {'scan_profile': open('../profiles/full_audit.pw3af').read(),
		'target_urls': [url]}
		response = requests.post('https://127.0.0.1:5000/scans/',
		data=json.dumps(data),
		headers={'content-type': 'application/json'},verify=False)
	
		#print(response)
		response = response.json()
		message = response['message']
		if message == "Success":
			result = {'message':message,'id':response['id']}
			return jsonify(result)
		else:
			result = {'message':'fail','id':-1}
			return jsonify(result)
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
			response = requests.get('https://127.0.0.1:5000/scans/'+str(id)+'/kb/',verify=False)
			response = response.json()
			return jsonify(response)
		else:
			abort(404)

	else:
		result = {'code':401}
		return jsonify(result)

@app.route('/deleteScan')
def deleteScan():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		id = request.args.get('id')
		if id:
			response = requests.delete('https://127.0.0.1:5000/scans/'+str(id),verify=False) 
			response = response.json()
			result = {'message':response['message']}
			return jsonify(result)
		else:
			abort(404)

	else:
		result = {'code':401}
		return jsonify(result)
if __name__ == '__main__':
	#app.run()
	app.run(host='0.0.0.0',port=8080,debug=False)
