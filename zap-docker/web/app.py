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

from functools import wraps
from datetime import datetime
import base64
import random
import time
import mongodb
db = mongodb.mongoDB()
domainName = ssoUrl[ssoUrl.find('.'):]

app = Flask(__name__,static_url_path='',root_path=os.getcwd())    


def EIToken_verification(func):
	@wraps(func)
	def warp(*args, **kwargs):
		EIToken =request.cookies.get('EIToken')
		ssoUrl =request.cookies.get('SSO_URL')
		res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
		if res.status_code == 200:
			return func(*args, **kwargs)
		else:
			return abort(401)
	return warp
'''
Newly Added Begin
'''
import sys
import re
from requests_html import HTMLSession
from flask_cors import cross_origin
session = HTMLSession()

null = None
false = False
true = True
apiURL='https://dashboard-grafana-1-3-2.arfa.wise-paas.com'

High = {}
Medium = {}
Low = {}
Informational = {}
search_count = [High, Medium, Low, Informational]

pscanid, Passive_Scan_Progress = {}, {}
ascanid, Active_Scan_Progress = {}, {}
search_progress = [Passive_Scan_Progress, Active_Scan_Progress]

uid_list = []
def datasource_init(scanId):
	global High, Medium, Low, Informational, Passive_Scan_Progress, Active_Scan_Progress
	High[scanId] = 0
	Medium[scanId] = 0
	Low[scanId] = 0
	Informational[scanId] = 0
	Passive_Scan_Progress[scanId] = 0    
	Active_Scan_Progress[scanId] = 0
def create_dashboard(scanId, EIToken):
	my_headers = {'Content-Type':'application/json','Authorization': 'Bearer {}'.format(EIToken)}
	try:
		with open('template.json') as json_file:
			template = json.load(json_file)
		payload ={
       	 "dashboard": template,
    	    "folderId": 0,
    	    "overwrite": false
		}
		template["uid"] = scanId
		template["title"] = template["title"] + "-" + str(scanId)
		template["panels"][0]["datasource"] = "ZAP-Progress"
		template["panels"][1]["datasource"] = "ZAP-Summary"
		template["panels"][3]["datasource"] = "ZAP-Summary"
		template["panels"][0]["targets"][0]["target"] = "Passive_Scan_Progress"+"-"+str(scanId)
		template["panels"][0]["targets"][1]["target"] = "Active_Scan_Progress"+"-"+str(scanId)
		template["panels"][1]["targets"][0]["target"] = "High"+"-"+str(scanId)
		template["panels"][1]["targets"][1]["target"] = "Medium"+"-"+str(scanId)
		template["panels"][1]["targets"][2]["target"] = "Low"+"-"+str(scanId)
		template["panels"][1]["targets"][3]["target"] = "Informational"+"-"+str(scanId)
		template["panels"][3]["targets"][0]["target"] = "High" +"-"+str(scanId)
		template["panels"][3]["targets"][0]["target"] = "Medium"+"-"+str(scanId)
		template["panels"][3]["targets"][0]["target"] = "Low"+"-"+str(scanId)
		template["panels"][3]["targets"][0]["target"] = "Informational"+"-"+str(scanId)
		#template["panels"][5]["content"] = "" #The last panel for report.
		res = requests.post(apiURL + "/api/dashboards/db", headers=my_headers, json=payload)
		print( res.text )
		dashboardLink = apiURL +res.json()["url"]
		datasource_init(scanId)
		return dashboardLink
	except Exception as err:
		print('error: {}'.format(str(err)))
'''
Newly Added End
'''
def getUserIdFromToken(EIToken):
	info = EIToken.split('.')[1]
	lenx = len(info)%4
	if lenx == 1:
		info += '==='
	if lenx == 2:
		info += '=='
	if lenx == 3:
		info += '='
	userId = json.loads(base64.b64decode(info))['userId']
	return userId



@app.route('/')
def home():
	return app.send_static_file('home.html')

@app.route('/deleteScans',methods=['POST'])
@EIToken_verification
def deleteScans():
	scanIdArr = request.form.getlist('scanIdArr[]')
	db.deleteScans(scanIdArr)
	return jsonify({'Result':'OK'})


@app.route('/dashboardLink',methods=['GET'])
@EIToken_verification
def dashboardLInk():
	scanId =request.cookies.get('scanId')
	scan = db.findScan(scanId)
	url = scan['dashboardLInk']
	return url


@app.route('/addHtml',methods=['GET'])
def addHtml():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		info_token = EIToken.split('.')[1]
		userId = getUserIdFromToken(EIToken)
		scanId = request.cookies.get('scanId')
		ascanStatus =request.cookies.get('ascanStatus')
		pscanStatus =request.cookies.get('pscanStatus')
		
		# add scanStatus to db
		db.modifyExistInfo('ascanStatus',ascanStatus,scanId)
		db.modifyExistInfo('pscanStatus',pscanStatus,scanId)
		db.modifyExistInfo('status','3',scanId)
		
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
			scanId = request.args.get('scanId')
			html_info = db.findHtml(scanId)
			if html_info == None:
				return redirect('/')
			else:
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
		scanOption = request.args.get('scanOption')
		spiderId =request.cookies.get('spiderId')  
		scanId = str(random.randint(1000000,9999999))
		nowtime = int(time.time())
		info_token = EIToken.split('.')[1]
		userId = getUserIdFromToken(EIToken)

		#call Dashboard API getting dashboardLink
		dashboardLink = 'https://portal-sso.arfa.wise-paas.com'
		#dashboardLink = create_dashboard(scanId,EIToken)
		# timeStamp => int
		# other info  => str
		scandata = {
    		"userId":userId,
    		"scanId":scanId,
    		"targetURL":targetURL,
    		"dashboardLInk":dashboardLink,
    		"timeStamp":nowtime,
    		"ascanStatus":'0',
			"pscanStatus":'0',
			"scanOption":scanOption,
			"ascanId":'-1',
			"spiderId":spiderId,
			"status":'0'
		}
		db.addScan(scandata)
		
		res_cookie = make_response(redirect('/'),200)
		res_cookie.set_cookie('scanId',scanId,domain=domainName)
		return res_cookie
	else:
		abort(401)

@app.route('/refreshTable',methods=['GET'])
def refreshTable():

	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		info_token = EIToken.split('.')[1]
		userId = getUserIdFromToken(EIToken)
		scans = db.listScans(userId)

		for scan in scans:
			ts = scan['timeStamp']
			time = datetime.fromtimestamp(ts).strftime('%Y/%m/%d %H:%M')
			time_info = {'time' : time}
			scan.update(time_info)
		return jsonify(scans)
	else:
		abort(401)

'''
@app.route('/setSSOurl')
def setSSOurl():
	res_cookie = make_response(redirect('/'),200)
	res_cookie.set_cookie('SSO_URL', ssoUrl,domain=domainName)
	return res_cookie
'''

'''
SPIDER + PASSIVE SCAN
'''
@app.route('/spiderScan')
@EIToken_verification
def spiderScan():
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
			res_cookie = make_response(redirect('/'),200)
			res_cookie.set_cookie('spiderId', r['scan'],domain=domainName)
			res_cookie.set_cookie('targetUrl', url,domain=domainName)
		
			return res_cookie
		else:
			abort(500)
	except Exception as err:
		print('error: {}'.format(str(err)))
		abort(500)
		

		

@app.route('/spiderStatus')
def spiderStatus():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
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
		scanId = request.cookies.get('scanId')
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
				res_cookie = make_response(redirect('/'),200)
				res_cookie.set_cookie('ascanId', r['scan'],domain=domainName)
				db.modifyExistInfo('ascanId',r['scan'],scanId)
				db.modifyExistInfo('status','2',scanId)
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


'''
Newly Added
'''
'''
Data Source 
'''
@app.route('/summary/')
def health_check():
	return "This datasource is healthy"

@app.route('/progress/')
def health_check_p():
	return "This datasource is healthy"

# return a list of data that can be queried
@app.route('/summary/search', methods=['POST'])
def search():
	count_list = []
	for key in High.keys():
		count_list.append( "High" + "-" + str(key) )
		count_list.append( "Medium" + "-" + str(key) )
		count_list.append( "Low" + "-" + str(key) )
		count_list.append( "Informational" + "-" + str(key) )
	return jsonify( count_list )

@app.route('/progress/search', methods=['POST'])
def search_p():
	progress_list = []
	for key in Passive_Scan_Progress.keys():
		progress_list.append( "Passive_Scan_Progress" + "-" + str(key) )
		progress_list.append( "Active_Scan_Progress" + "-" + str(key) )
	return jsonify( progress_list )

@app.route('/summary/query', methods=['POST'])
def query():
	req = request.get_json()
	target = req['targets'][0]['target']
	target_id = re.findall(r'\d*$',target)[0]
	try: 
		r = session.get('http://127.0.0.1:5000/OTHER/core/other/htmlreport/?')
	except Exception as err:
		print('error: {}'.format(str(err)))
		abort(400)

	global High
	global Medium
	global Low
	global Informational

	#find high_count
	hr = re.search(r'<td><a href=\"#high\">High</a></td><td align=\"center\">(.*)</td>', r.html.raw_html.decode("utf-8"), flags=0)
	High[target_id] = int( hr.group(1) )

	#find medium_count
	mr = re.search(r'<td><a href=\"#medium\">Medium</a></td><td align=\"center\">(.*)</td>', r.html.raw_html.decode("utf-8"), flags=0)
	Medium[target_id] = int( mr.group(1) )
	
	#find low_count
	lr = re.search(r'<td><a href=\"#low\">Low</a></td><td align=\"center\">(.*)</td>', r.html.raw_html.decode("utf-8"), flags=0)
	Low[target_id] = int( lr.group(1) )

	#find informational_count
	ir = re.search(r'<td><a href=\"#info\">Informational</a></td><td align=\"center\">(.*)</td>', r.html.raw_html.decode("utf-8"), flags=0)
	Informational[target_id] = int( ir.group(1) )

	data = [
        {
            "target": "High" + "-" + str(target_id),
            "datapoints": [
                [High[target_id], 1563761410]
            ]
        },
        {
            "target": "Medium" + "-" + str(target_id),
            "datapoints": [
                [Medium[target_id],1563761410]
            ]
        },
        {
            "target": "Low" + "-" + str(target_id),
            "datapoints": [
                [Medium[target_id], 1563761410]
            ]
        },
        {
            "target": "Informational" + "-" + str(target_id),
            "datapoints": [
                [Informational[target_id], 1563761410]
            ]
        }
    ]
	return jsonify(data)

@app.route('/progress/query', methods=['POST'])
def query_p():
	req = request.get_json()
	target = req['targets'][0]['target']
	target_id = re.findall(r'\d*$',target)[0]

	global pscanid
	global ascanid
	global Passive_Scan_Progress
	global Active_Scan_Progress
	status = db.findScan(target_id)["status"]
	#pscanid = db.findScan(target_id)["spiderId"]
	#ascanid = db.findScan(target_id)["ascanId"]
	if(status!="3"):
		try: 
			p =  session.get('http://127.0.0.1:5000/JSON/spider/view/status/?scanId='+str(pscanid))
			a =  session.get('http://127.0.0.1:5000/JSON/ascan/view/status/?scanId='+str(ascanid))
		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(400)
	if(status != "3"):
		pr = re.search(r'\"status\":\"(.*)\"', p.html.raw_html.decode("utf-8"), flags=0)
		if(pr): Passive_Scan_Progress[target_id] = int( pr.group(1) )
		ar = re.search(r'\"status\":\"(.*)\"', a.html.raw_html.decode("utf-8"), flags=0)
		if(ar): Active_Scan_Progress[target_id] = int( ar.group(1) )
	else:
		Passive_Scan_Progress[target_id] = 100
		Active_Scan_Progress[target_id] = 100

	#Passive_Scan_Progress = db.findScan(uid)["pscanStatus"]
	#Active_Scan_Progress = db.findScan(uid)["ascanStatus"]

	progress = [
            {
                "target": "Passive_Scan_Progress"+"-"+ str(target_id),
                "datapoints":[
                    [Passive_Scan_Progress[target_id], 1563761410]
                    ]
            },
            {
                "target": "Active_Scan_Progress"+"-"+ str(target_id),
                "datapoints":[
                    [Active_Scan_Progress[target_id], 1563761410]
                    ]
            }
    ]
	return jsonify(progress)

@app.route('/datasource/report/<uid>', methods=['GET'])
@cross_origin()
def datasource_report(uid):
	try: 
		report = db.findHtml(uid)['html']
		#report = session.get('http://127.0.0.1:5000/OTHER/core/other/htmlreport/?')
	except Exception as err:
		print('error: {}'.format(str(err)))
		abort(400)
	source = report.html.raw_html.decode("utf-8")
	head = source.split("<h1>",1)
	body = head[1].split("<h3>Alert Detail</h3>",1)
	html = "".join(head[0]+body[1])
	response = make_response(html,200)
	response.headers['Content-Type'] = 'text/html'
	response.headers['Access-Control-Allow-Origin'] = '*'
	return response
'''
Delete Dashboard
'''
app.route('/dashboard/delete/<uid>', methods=['GET'])
def dash_delete(uid):
	EIToken =request.cookies.get('EIToken')
	my_headers = {'Content-Type':'application/json',
               'Authorization': 'Bearer {}'.format(EIToken)}
	res = requests.delete(apiURL + "/api/dashboards/uid/" + uid, headers=my_headers)
	res_json = res.json()
	print( res_json["title"]+" has been deleted." )
	return res.json()
'''
Newly Added End
'''

## Web check scan
@app.route('/checkScan',methods=['GET'])
def checkScan():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		try:
			scanId =request.cookies.get('scanId') 
			scan = db.findScan(scanId)
			scanOption = scan['scanOption']
			spiderId = scan['spiderId']
			status = scan['status']
			if status == 3:
				result = {'Result':'OK'}
				return jsonify(result)		
			else:
				result = {'Result':'SCAN'}
				return jsonify(result)		
			'''	
			if scanOption == '0':
				r = requests.get('http://127.0.0.1:5000/JSON/spider/view/scans/?')	
				r = r.json()
				scanList = r['scans']
				for scan in scanList:
					if scan['id'] == spiderId:
						result = {'Result':'OK'}
						return jsonify(result)		
				result = {'Result':'NO'}
				return jsonify(result)
				
			elif scanOption == '2':
				r = requests.get('http://127.0.0.1:5000/JSON/spider/view/scans/?')	
				r = r.json()
				scanList = r['scans']
				for scan in scanList:
					if scan['id'] == spiderId:
						result = {'Result':'OK'}
						return jsonify(result)		
				
				ascanId = scan['ascanId']
				r = requests.get('http://127.0.0.1:5000/JSON/ascan/view/scans/?')	
				r = r.json()
				scanList = r['scans']
				for scan in scanList:
					if scan['id'] == ascanId:
						result = {'Result':'OK'}
						return jsonify(result)		
	
				result = {'Result':'NO'}
				return jsonify(result)
			
			else:
				abort(500)
			'''

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

			

# Dashboard cancel button
@app.route('/cancelScan',methods=['GET'])
def cancelScan():
	EIToken =request.cookies.get('EIToken')  
	res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})	
	if res.status_code == 200:
		try:
			rp = requests.get('http://127.0.0.1:5000/JSON/spider/action/removeAllScans/')	
			ra = requests.get('http://127.0.0.1:5000/JSON/ascan/action/removeAllScans/')	
			rp = rp.json()
			ra = ra.json()
			if rp['Result'] == 'OK' and ra['Result']=='OK':
				result = {'Result':'OK'}
				return jsonify(result)
			else:
				abort(500)

		except Exception as err:
			print('error: {}'.format(str(err)))
			abort(500)

	else:
		abort(401)



if __name__ == '__main__':
	app.run(host='0.0.0.0',port=8080,debug=False)
