#-*-coding:utf-8 -*-

import random
import os
from flask import Flask,request,redirect
from flask import jsonify,abort,Response, make_response
import requests
import json
import zipfile,io
ssoUrl = 'https://portal-sso.wise-paas.io'
app = Flask(__name__,static_url_path='',root_path=os.getcwd())    
print(os.path.join(os.getcwd(), "static"))

@app.route('/')
def home():
	return app.send_static_file('home.html')

@app.route('/report')
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
			#result = {'id':response['id']}
			#return jsonify(result)
			res_cookie = make_response(redirect('/'),200)
			res_cookie.set_cookie('id', response['id'])
			return res_cookie
		else:
			abort(500)
	else:
		abort(401)
		#result = {'code':401}
		#return jsonify(result)

		

@app.route('/getScanResult')
def getScanResult():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		#id = request.args.get('id')
		id=request.cookies.get('id')
		if id:
			response = requests.get('http://127.0.0.1:5000/scans/'+str(id)+'/report.html.zip')
			z = zipfile.ZipFile(io.BytesIO(response.content))
			for filename in z.namelist():
				z.extract(filename, path="static/", pwd=None)

			#response = response.json()
			#return jsonify(response)
			return jsonify({'code':200})
		else:
			abort(404)

	else:
		result = {'code':401}
		return jsonify(result)

if __name__ == '__main__':
	#app.run()
	app.run(host='0.0.0.0',port=8080,debug=False)
