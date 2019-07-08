#-*-coding:utf-8 -*-

import random
import os
from flask import Flask,request
from flask import jsonify
import requests
import json

app = Flask(__name__,static_url_path='',root_path=os.getcwd())    
print(os.path.join(os.getcwd(), "static"))

@app.route('/')
def index():
	print("index")
	return app.send_static_file('index.html')


@app.route('/startScan')
def startScan():
	scanOption = request.args.get('scanOption')
	url = request.args.get('url')

	data = {'scan_profile': open('../profiles/full_audit.pw3af').read(),
	'target_urls': [url]}
	
	response = requests.post('https://127.0.0.1:5000/scans/',
	data=json.dumps(data),
	headers={'content-type': 'application/json'},verify=False)
	
	response = response.json()
	message = response['message']
	if message == "Success":
		result = {'message':message,'id':response['id']}
	else:
		result = {'message':'fail','id':id}
		
	#result = ['aa',5]
	return jsonify(result)

@app.route('/getScanResult')
def getScanResult():
	id = request.args.get('id')
	response = requests.get('https://127.0.0.1:5000/scans/'+id+'/kb/',
                        verify=False)
	response = response.json()
	return jsonify(response)

@app.route('/deleteScan')
def deleteScan():
	id = request.args.get('id')
	response = requests.delete('https://127.0.0.1:5000/scans/'+id,verify=False) 
	response = response.json()
	result = {'message':response['message']}
	return jsonify(result)
if __name__ == '__main__':
	#app.run()
	app.run(host='0.0.0.0',port=8080,debug=False)
