#-*-coding:utf-8 -*-
import time
import random
import os
from flask import Flask,request,redirect
from flask import jsonify,abort,Response, make_response
import requests
import json
import zipfile,io
import subprocess
ssoUrl = ''
try:
	app_env = json.loads(os.environ['VCAP_APPLICATION'])
	ssoUrl = 'https://portal-sso' + app_env['application_uris'][0][app_env['application_uris'][0].find('.'):]
except Exception as err:
	print('Can not get environment variables form: {}'.format(str(err)))
	ssoUrl = 'https://portal-sso.arfa.wise-paas.com'
#ssoUrl=os.environ['SSO_URL'] or 'https://portal-sso.wise-paas.io'
app = Flask(__name__,static_url_path='',root_path=os.getcwd())    
#print(os.path.join(os.getcwd(), "static"))

@app.route('/')
def home():
	return app.send_static_file('home.html')


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
		try:
			if scanOption == '0':
				maxChildren=''
				recurse=''
				contextName=''
				subtreeOnly=''
				payload = {'url': url, 'maxChildren': maxChildren,'recurse':recurse,'contextName':contextName ,'subtreeOnly':subtreeOnly}
				r = requests.get('http://127.0.0.1:5000/JSON/spider/action/scan',params=payload)
				if r.status_code == 200:
					r = r.json()
					#result = {'id':response['id']}
					#return jsonify(result)
					res_cookie = make_response(redirect('/'),200)
					res_cookie.set_cookie('spiderId', r['scan'])
					return res_cookie
			
			elif scanOption == '1':
				recurse = True
				inScopeOnly = False
				scanPolicyName = ''
				method =''
				postData = ''
				contextId = ''
				payload = {'url' : url,'recurse':recurse,'inScopeOnly':inScopeOnly,'scanPolicyName':scanPolicyName,'method':method,'postData':postData,'contextId':contextId}
				r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/scan/',params=payload)
				
				if r.status_code == 200:
					r = r.json()
					res_cookie = make_response(redirect('/'),200)
					res_cookie.set_cookie('ascanId', r['scan'])
					return res_cookie

			elif scanOption == '2':
				maxChildren=''
				recurse=''
				contextName=''
				subtreeOnly=''
				payload = {'url': url, 'maxChildren': maxChildren,'recurse':recurse,'contextName':contextName ,'subtreeOnly':subtreeOnly}
				r_spider = requests.get('http://127.0.0.1:5000/JSON/spider/action/scan',params=payload)

				time.sleep(3)

				recurse = True
				inScopeOnly = False
				scanPolicyName = ''
				method =''
				postData = ''
				contextId = ''
				payload = {'url' : url,'inScopeOnly':inScopeOnly,'recurse':recurse,'scanPolicyName':scanPolicyName,'method':method,'postData':postData,'contextId':contextId}
				r_ascan = requests.get('http://127.0.0.1:5000/JSON/ascan/action/scan/',params=payload)


				if r_spider.status_code == 200 and r_ascan.status_code == 200:
					r_spider = r_spider.json()
					r_ascan = r_ascan.json()
					res_cookie = make_response(redirect('/'),200)
					res_cookie.set_cookie('spiderId', r_spider['scan'])
					res_cookie.set_cookie('ascanId', r_ascan['scan'])
					return res_cookie

			else:
				abort(500)
		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)
		
	else:
		abort(401)

'''
SPIDER + PASSIVE SCAN
'''
@app.route('/spiderScan')
def spiderScan():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		url = request.args.get('url')
		maxChildren=''
		recurse=''
		contextName=''
		subtreeOnly=''

		try:
			payload = {'url': url, 'maxChildren': maxChildren,'recurse':recurse,'contextName':contextName ,'subtreeOnly':subtreeOnly}
			r = requests.get('http://127.0.0.1:5000/JSON/spider/action/scan',params=payload)
			
			if r.status_code == 200:
				r = r.json()
				#result = {'id':response['id']}
				#return jsonify(result)
				res_cookie = make_response(redirect('/'),200)
				res_cookie.set_cookie('spiderId', r['scan'])
				return res_cookie
			else:
				abort(500)
		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)
		
	else:
		abort(401)

		

@app.route('/spiderStatus')
def spiderStatus():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		#id = request.args.get('id')
		spiderId=request.cookies.get('spiderId')
		try:
			if id:
				payload = {'scanId':spiderId}
				r = requests.get('http://127.0.0.1:5000/JSON/spider/view/status/',params=payload)	
				r = r.json()
				result = {'status':r['status']}
				return jsonify(result)

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)


@app.route('/spiderPause')
def spiderPause():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		#id = request.args.get('id')
		spiderId=request.cookies.get('spiderId')
		try:
			if id:
				payload = {'scanId':spiderId}
				r = requests.get('http://127.0.0.1:5000/JSON/spider/action/pause/',params=payload)	
				r = r.json()
				result = {'Result':r['Result']}
				return jsonify(result)

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)


@app.route('/spiderResume')
def spiderResume():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		#id = request.args.get('id')
		spiderId=request.cookies.get('spiderId')
		try:
			if id:
				payload = {'scanId':spiderId}
				r = requests.get('http://127.0.0.1:5000/JSON/spider/action/resume/',params=payload)	
				r = r.json()
				result = {'Result':r['Result']}
				return jsonify(result)

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)

@app.route('/spiderRemove')
def spiderRemove():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		#id = request.args.get('id')
		spiderId=request.cookies.get('id')
		try:
			if id:
				payload = {'scanId':spiderId}
				r = requests.get('http://127.0.0.1:5000/JSON/spider/action/removeAllScans/',params=payload)	
				r = r.json()
				result = {'Result':r['Result']}
				return jsonify(result)

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)



'''
ACTIVE SCAN
'''
@app.route('/ascan')
def ascan():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		url = request.args.get('url')
		recurse = True
		inScopeOnly = False
		scanPolicyName = ''
		method =''
		postData = ''
		contextId = ''

		
		try:
			payload = {'url' : url,'inScopeOnly':inScopeOnly,'recurse':recurse,'scanPolicyName':scanPolicyName,'method':method,'postData':postData,'contextId':contextId}
			r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/scan/',params=payload)
			
			if r.status_code == 200:
				r = r.json()
				#result = {'id':response['id']}
				#return jsonify(result)
				res_cookie = make_response(redirect('/'),200)
				res_cookie.set_cookie('ascanId', r['scan'])
				return res_cookie
			else:
				abort(500)
		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)
		
	else:
		abort(401)

		

@app.route('/ascanStatus')
def ascanStatus():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		#id = request.args.get('id')
		ascanId=request.cookies.get('ascanId')
		try:
			if ascanId:
				payload = {'ascanId':ascanId}
				r = requests.get('http://127.0.0.1:5000/JSON/ascan/view/status/',params=payload)	
				r = r.json()
				result = {'status':r['status']}
				return jsonify(result)
		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)


@app.route('/ascanPause')
def ascanPause():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		#id = request.args.get('id')
		ascanId=request.cookies.get('ascanId')
		try:
			if ascanId:
				payload = {'scanId':ascanId}
				r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/pause/',params=payload)	
				r = r.json()
				result = {'Result':r['Result']}
				return jsonify(result)

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)


@app.route('/ascanResume')
def ascanResume():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		ascanId=request.cookies.get('ascanId')
		try:
			if ascanId:
				payload = {'scanId':ascanId}
				r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/resume/',params=payload)	
				r = r.json()
				result = {'Result':r['Result']}
				return jsonify(result)

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)

@app.route('/ascanRemove')
def ascanRemove():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		ascanId=request.cookies.get('ascanId')
		try:
			if ascanId:
				payload = {'scanId':ascanId}
				r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/removeAllScans/',params=payload)	
				r = r.json()
				result = {'Result':r['Result']}
				return jsonify(result)

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)





'''
REPORT
'''

@app.route('/downloadReport')
def downloadReport():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		try:
			r = requests.get('http://127.0.0.1:5000/OTHER/core/other/htmlreport/')
			if r.status_code == 200:
				response = make_response(r.content,200)
				response.headers['Content-Type'] = 'application/html'
				response.headers['Content-Disposition'] = 'attachment; filename={}'.format('zap_report.html')
				return response
		except Exception as err:
			print('download_file error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)


@app.route('/clear')
def clear():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		try:
			r = response = requests.get('http://127.0.0.1:5000/JSON/core/action/deleteAllAlerts')
			r = r.json()
			result = {'Result':r['Result']}
			return jsonify(result)

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)


if __name__ == '__main__':
	app.run(host='0.0.0.0',port=8080,debug=False)
