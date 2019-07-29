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

from datetime import datetime
import base64
import random
import time
import mongodb
db = mongodb.mongoDB()
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

@app.route('/deleteScan',methods=['GET'])
def deleteScan():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		scanId = request.args.get('scanId')
		db.deleteScan(int(scanId))
		return jsonify({'Result':'OK'})
	else:
		abort(401)


@app.route('/addHtml',methods=['GET'])
def addHtml():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		info_token = EIToken.split('.')[1]
		userId = json.loads(base64.b64decode(info_token))['userId']
		scanId = int(request.cookies.get('scanId'))
		r = requests.get('http://127.0.0.1:5000/OTHER/core/other/htmlreport/')
		if r.status_code == 200:
			html_info = {
				"userId":userId,
				"scanId":scanId,
				"html":r.content
			}
			db.addHtml(html_info)
			return jsonify({'Result':'OK'})
		else:
			abort(500)
	else:
		abort(401)

@app.route('/downloadHtml',methods=['GET'])
def downloadHtml():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		try:
			scanId = int(request.args.get('scanId'))
			html_info = db.findHtml(scanId)
			html= html_info['html']
			response = make_response(html,200)
			response.headers['Content-Type'] = 'application/html'
			response.headers['Content-Disposition'] = 'attachment; filename={}'.format('scan_report.html')
			return response
		except Exception as err:
			print('download_file error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)
	
	



@app.route('/addScan',methods=['GET'])
def addScan():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		targetURL = request.args.get('targetURL')
		scanId = random.randint(1000000,9999999)
		nowtime = int(time.time())
		info_token = EIToken.split('.')[1]
		userId = json.loads(base64.b64decode(info_token))['userId']
		
		#call Dashboard API getting dashboardLink
		dashboardLink = 'http://www.google.com'
		
		scandata = {
    		"userId":userId,
    		"scanId":scanId,
    		"targetURL":targetURL,
    		"dashboardLInk":dashboardLink,
    		"timeStep":nowtime,
    		"report":'',
		}
		db.addScan(scandata)
		
		res_cookie = make_response(redirect('/'),200)
		res_cookie.set_cookie('scanId', scanId)
		return res_cookie
	else:
		abort(401)

@app.route('/refreshTable',methods=['GET'])
def refreshTable():

	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		info_token = EIToken.split('.')[1]
		userId = json.loads(base64.b64decode(info_token))['userId']
		scans = db.listScans(userId)

		for scan in scans:
			ts = scan['timeStep']
			time = datetime.fromtimestamp(ts).strftime('%Y/%m/%d %H:%M')
			time_info = {'time' : time}
			scan.update(time_info)
		return jsonify(scans)
	else:
		abort(401)
	'''
	scandata1 = {
    	"userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
    	"scanId":1324,
    	"targetURL":"http://testphp.vulnweb.com",
    	"dashboardLInk":"http://xxxx.xxx.xx",
    	"timeStep":11111234,
    	"reportPath":"http://zap-security-web.arfa.wise-paas.com/htmlreport/1564072276.html",
	}
	scandata2 = {
    	"userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
    	"scanId":21341234,
    	
		targetURL":"http://testphp.vulnweb.com",
    	"dashboardLInk":"http://xxxx.xxx.xx",
    	"timeStep":4312412,
    	"reportPath":"http://zap-security-web.arfa.wise-paas.com/htmlreport/1564072276.html",
	}
	
	return jsonify([scandata1,scandata2])
	'''


@app.route('/setSSOurl')
def setSSOurl():
	res_cookie = make_response(redirect('/'),200)
	res_cookie.set_cookie('SSO_URL', ssoUrl)
	return res_cookie
'''
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
		recurse = request.args.get('recurse')
		contextName=''
		subtreeOnly= request.args.get('subtreeOnly')

		try:
			payload = {'url': url, 'maxChildren': maxChildren,'recurse':recurse,'contextName':contextName ,'subtreeOnly':subtreeOnly}
			r = requests.get('http://127.0.0.1:5000/JSON/spider/action/scan',params=payload)
			
			if r.status_code == 200:
				r = r.json()
				#result = {'id':response['id']}
				#return jsonify(result)
				res_cookie = make_response(redirect('/'),200)
				res_cookie.set_cookie('spiderId', r['scan'])
				res_cookie.set_cookie('targetUrl', url)
			
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
		try:
			r = requests.get('http://127.0.0.1:5000/JSON/spider/action/removeAllScans/')	
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
		url = request.cookies.get('targetUrl')
		recurse = request.args.get('recurse')
		inScopeOnly = request.args.get('inScopeOnly')
		scanPolicyName = 'custom'
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
				abort(400)
		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(403)
		
	else:
		abort(401)

@app.route('/addScanPolicy')
def addScanPolicy():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		try:
			scanPolicyName = 'custom'
			remove_payload = {'scanPolicyName':scanPolicyName}
			r_remove = requests.get('http://127.0.0.1:5000/JSON/ascan/action/removeScanPolicy/',params=remove_payload)
			if r_remove.status_code == 200 or r_remove.status_code == 400:
				alertThreshold = request.args.get('alertThreshold')
				attackStrength = request.args.get('attackStrength')
				payload = {'scanPolicyName':scanPolicyName,'alertThreshold':alertThreshold,'attackStrength':attackStrength}
				r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/addScanPolicy',params=payload)
				#r = r.json()
				result = {'code':r.status_code}
				return jsonify(result)
				#return 'OK'
			else:
				abort(400)
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
		try:
			r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/removeAllScans/')	
			r = r.json()
			result = {'Result':r['Result']}
			return jsonify(result)

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)







@app.route('/clear')
def clear():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		try:
			r = requests.get('http://127.0.0.1:5000/JSON/core/action/deleteAllAlerts')
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
