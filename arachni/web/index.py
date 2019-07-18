#-*-coding:utf-8 -*-

import random
import os
from flask import Flask,request,redirect
from flask import jsonify,abort,Response, make_response
import requests
import json
import zipfile,io
import subprocess


ssoUrl=os.environ['SSO_URL'] or 'https://portal-sso.wise-paas.io'
app = Flask(__name__,static_url_path='',root_path=os.getcwd())    
print(os.path.join(os.getcwd(), "static"))

@app.route('/')
def home():
	return app.send_static_file('home.html')

@app.route('/report')
def index():
	return app.send_static_file('index.html')

@app.route('/setSSOurl')
def setSSOurl():
	res_cookie = make_response(redirect('/'),200)
	res_cookie.set_cookie('SSO_URL', ssoUrl)
	return res_cookie

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
		
		#print(json.dumps(data))
		try:
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
		except Exception as err:
			print('error: {}'.format(str(err)))
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
		try:
			if id:

				command = "rm -r "+os.path.join(os.getcwd())+"static/js" +os.path.join(os.getcwd())+"static/css " + os.path.join(os.getcwd())+"static/index.html"
				#command =  "rm -r static/index.html"
				process = subprocess.Popen(command,shell=True)
				ret = process.wait()
				response = requests.get('http://127.0.0.1:5000/scans/'+str(id)+'/report.html.zip')	
				z = zipfile.ZipFile(io.BytesIO(response.content))
				for filename in z.namelist():
					z.extract(filename, path="static/", pwd=None)
				return jsonify({'code':200,'ret':ret})

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)
		#result = {'code':401}
		#return jsonify(result)

@app.route('/downloadReport')
def downloadReport():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		id=request.cookies.get('id')
		try:
			r = requests.get('http://127.0.0.1:5000/scans/'+str(id)+'/report.html.zip')
			if r.status_code != 200:
				raise Exception("Cannot connect with oss server or file is not existed")
			response = make_response(r.content,200)
			response.headers['Content-Type'] = 'application/zip'
			response.headers['Content-Disposition'] = 'attachment; filename={}'.format('arachni_scan_report.zip')
			return response
		except Exception as err:
			print('download_file error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)
		#result = {'code':401}
		#return jsonify(result)

if __name__ == '__main__':
	#app.run()
	app.run(host='0.0.0.0',port=8080,debug=False)
