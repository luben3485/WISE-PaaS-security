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

app = Flask(__name__,static_url_path='',root_path=os.getcwd())    

apiURL='https://dashboard-grafana-1-3-2.arfa.wise-paas.com'
ssoUrl = ''
appURL = ''

try:
    app_env = json.loads(os.environ['VCAP_APPLICATION'])
    ssoUrl = 'https://portal-sso' + app_env['application_uris'][0][app_env['application_uris'][0].find('.'):]
    appURL = 'https://'+app_env['application_uris'][0]
    print('get environment variables!')
except Exception as err:
    print('Can not get environment variables form: {}'.format(str(err)))
    ssoUrl = 'https://portal-sso.arfa.wise-paas.com'
    appURL = 'https://zap-security-web-v4.arfa.wise-paas.com'
domainName = ssoUrl[ssoUrl.find('.'):]


#decorator
def EIToken_verification(func):
    @wraps(func)
    def warp(*args, **kwargs):
        global ssoUrl
        EIToken =request.cookies.get('EIToken')
        res=requests.get(ssoUrl + "/v2.0/users/me",cookies={'EIToken': EIToken})    
        if res.status_code == 200:
            return func(*args, **kwargs)
        else:
            return abort(401)
    return warp

def checkPassiveStatus(scanId):
    try:
        while True:
            scan_info = db.findScan(scanId)
            pscanId = scan_info['pscanId']
            payload = {'scanId':pscanId}
            r = requests.get('http://127.0.0.1:5000/JSON/spider/view/status/',params=payload)   
            if r.status_code == 200:
                r = r.json()
                status = r['status']
                db.modifyExistInfo('pscanStatus',status,scanId)
  
            r_html = requests.get('http://127.0.0.1:5000/OTHER/core/other/htmlreport/')
            if r_html.status_code == 200:
                db.modifyExistHtml('html',r_html.content,scanId)

            #scan finish
            if status == '100':
                db.modifyExistInfo('status','3',scanId)
                break
            time.sleep(1)
    except Exception as err:
        print('error: {}'.format(str(err)))
    



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
#apiURL='https://dashboard-grafana-1-3-2.arfa.wise-paas.com'
#appURL='https://ensaas-security-scanner-0730.arfa.wise-paas.com/'

High = {}
Medium = {}
Low = {}
Informational = {}
search_count = [High, Medium, Low, Informational]

pscanid, Passive_Scan_Progress = 0, {}
ascanid, Active_Scan_Progress = 0, {}
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
        template["panels"][4]["content"] = '''<html>
    <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.11.8/semantic.min.css"/>
    </head>
    <body>
      <button id="downloadReport" class="ui  blue button" style="font-size:1.3rem;">
            <i class="file alternate outline icon"></i>
            Download
        </button>
    
        
        <!--<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>-->
        <script>
            $(document).ready(function(){
                function getCookie(cname) {
                    var name = cname + "=";
                    var decodedCookie = decodeURIComponent(document.cookie);
                    var ca = decodedCookie.split(';');
                    for(var i = 0; i <ca.length; i++) {
                        var c = ca[i];
                        while (c.charAt(0) == ' ') {
                            c = c.substring(1);
                        }
                        if (c.indexOf(name) == 0) {
                            return c.substring(name.length, c.length);
                        }
                    }
                    return "";
                }

                function getScanId(){
                  var url = window.location.toString();
                  var tmp1 =url.split("web-app-scanner-")[1];
                  var tmp2 = tmp1.split("?")[0]
                  return tmp2;
                  
                }
                $('#downloadReport').click(function(){
                    scanId = getScanId();
                    appUrl = getCookie('appUrl');
                    $.ajax({
                        url: appUrl+'/downloadHtml',
                        method: 'GET',
                        data:{'scanId':scanId}
                    }).done(function (res) {
                        if(res=='fail'){

                            console.log('now u cannot download report');
                        }else{
                            var a = document.createElement('a');
                            var url = window.URL.createObjectURL(new Blob([res], {type: "application/html"}));
                            a.href = url;
                            a.download = 'scan_report.html';
                            document.body.append(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);

                        }

                    }).fail(function () {
                        console.log("/downloadHtml fail") 
                    });
                    
                });

                function getCookie(cname) {
                    var name = cname + "=";
                    var decodedCookie = decodeURIComponent(document.cookie);
                    var ca = decodedCookie.split(';');
                    for(var i = 0; i <ca.length; i++) {
                        var c = ca[i];
                        while (c.charAt(0) == ' ') {
                            c = c.substring(1);
                        }
                        if (c.indexOf(name) == 0) {
                            return c.substring(name.length, c.length);
                        }
                    }
                    return "";
                }
                
                
            });

        </script>
    
    </body>
</html>'''
        #These are Buttons.
        template["panels"][5]["url"] = appURL+'/datasource/report/'+str(scanId) #for new template
        #template["panels"][5]["content"] = '<iframe id="iframe" src="'+appURL+'/datasource/report/'+str(scanId)+'" width=100%" height="100%" frameborder="0"></iframe>' 
        #for old template
        res = requests.post(apiURL + "/api/dashboards/db", headers=my_headers, json=payload)
        print( res.text )
        dashboardLink = apiURL +res.json()["url"]
        datasource_init(scanId)
        return dashboardLink
    except Exception as err:
        print('error: {}'.format(str(err)))
def delete_dashboard(scanId, EIToken):
    my_headers = {'Content-Type':'application/json',
               'Authorization': 'Bearer {}'.format(EIToken)}
    res = requests.delete(apiURL + "/api/dashboards/uid/" + scanId, headers=my_headers)
    res_json = res.json()
    print( res_json["title"]+" has been deleted." )
    return res.json()
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
    EIToken = request.cookies.get('EIToken')
    scanIdArr = request.form.getlist('scanIdArr[]')
    for scanId in scanIdArr:
        status = db.findScan(scanId)['status']
        if status == '3':
            db.deleteScan(scanId)
            delete_dashboard(scanId, EIToken)
    return jsonify({'Result':'OK'})


@app.route('/dashboardLink',methods=['GET'])
@EIToken_verification
def dashboardLInk():
    scanId =request.cookies.get('scanId')
    scan = db.findScan(scanId)
    url = scan['dashboardLInk']
    return url




@app.route('/finishStatus',methods=['GET'])
@EIToken_verification
def finishStatus():
    scanId = request.cookies.get('scanId')
    db.modifyExistInfo('status','3',scanId)
    return 'OK' 



@app.route('/updateHtml',methods=['GET'])
@EIToken_verification
def updateHtml():
    scanId = request.cookies.get('scanId')      
    r = requests.get('http://127.0.0.1:5000/OTHER/core/other/htmlreport/')
    if r.status_code == 200:
        db.modifyExistHtml('html',r.content,scanId)
        return jsonify({'Result':'OK'})
    else:
        abort(500)

@app.route('/downloadHtml',methods=['GET'])
@cross_origin()
def downloadHtml():
    try:
        scanId = request.args.get('scanId')
        html_info = db.findHtml(scanId)
        if html_info == None:
            return 'fail'
        else:
            html= html_info['html']
            #response = make_response(html,200)
            #response.headers['Content-Type'] = 'application/html'
            #response.headers['Content-Disposition'] = 'attachment; filename={}'.format('scan_report.html')
            #return response
            return html
    except Exception as err:
        print('download_file error: {}'.format(str(err)))
        abort(500)


@app.route('/passiveScan',methods=['GET'])
@EIToken_verification
def passiveScan():
    try:
        # Delete all previous datas on ZAP server
        r_delete = requests.get('http://127.0.0.1:5000/JSON/core/action/deleteAllAlerts')
        if r_delete.status_code == 200:
            # Get params from user setting
            targetURL = request.args.get('targetURL')
            recurse = request.args.get('recurse')
            subtreeOnly= request.args.get('subtreeOnly')
            
            maxChildren=''
            contextName=''

            payload = {'url': url, 'maxChildren': maxChildren,'recurse':recurse,'contextName':contextName ,'subtreeOnly':subtreeOnly}
            r_passive = requests.get('http://127.0.0.1:5000/JSON/spider/action/scan',params=payload)
            if r_passive.status_code == 200:
                
                pscanId = r_passive['scan']
                scanId = str(random.randint(1000000,9999999))
                nowtime = int(time.time())
                EIToken = request.cookies.get('EIToken')
                info_token = EIToken.split('.')[1]
                userId = getUserIdFromToken(EIToken)
                
                #call Dashboard API getting dashboardLink
                dashboardLink = create_dashboard(scanId,EIToken)
    
                # timeStamp => int type
                # other info  => str type
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
                    "pscanId":pscanId,
                    "status":'0'
                }
                db.addScan(scandata)
    
                html_info = {
                    "userId":userId,
                    "scanId":scanId,
                    "html":""
                }
                db.addHtml(html_info)
                
                #thread
                checkStatusThread = threading.Thread(target=checkPassiveStatus,args=[scanId])
                checkStatusThread.start()
                
                #set scanId to cookie
                res_cookie = make_response(redirect('/'),200)
                res_cookie.set_cookie('scanId',scanId,domain=domainName)
                return res_cookie
            else:
                print('passive scan start error!')


        else:
            print('passive scan delete error!')
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)
    


@app.route('/pscanStatusDB',methods=['GET'])
@EIToken_verification
def pscanStatusDB():
    try:
        scanId = request.cookies.get('scanId')
        if scanId:
            scan_info = db.findScan(scanId)
            pscanStatus = scan_info['pscanStatus']
            result = {'status':pscanStatus}
            return jsonify(result)
        else:
            result = {'status':'-1'}
            return status
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)






@app.route('/addScan',methods=['GET'])
@EIToken_verification
def addScan():
    targetURL = request.args.get('targetURL')
    scanOption = request.args.get('scanOption')
    spiderId =request.cookies.get('spiderId')  
    scanId = str(random.randint(1000000,9999999))
    nowtime = int(time.time())
    EIToken = request.cookies.get('EIToken')
    info_token = EIToken.split('.')[1]
    userId = getUserIdFromToken(EIToken)
        
    #call Dashboard API getting dashboardLink
    #dashboardLink = 'https://portal-sso.arfa.wise-paas.com'
    dashboardLink = create_dashboard(scanId,EIToken)
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
    
    html_info = {
        "userId":userId,
        "scanId":scanId,
        "html":""
    }
    db.addHtml(html_info)
    res_cookie = make_response(redirect('/'),200)
    res_cookie.set_cookie('scanId',scanId,domain=domainName)
    return res_cookie

@app.route('/refreshTable',methods=['GET'])
@EIToken_verification
def refreshTable():
    EIToken =request.cookies.get('EIToken')
    info_token = EIToken.split('.')[1]
    userId = getUserIdFromToken(EIToken)
    scans = db.listScans(userId)
    for scan in scans:
        ts = scan['timeStamp']
        time = datetime.fromtimestamp(ts).strftime('%Y/%m/%d %H:%M')
        time_info = {'time' : time}
        scan.update(time_info)
    return jsonify(scans)
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
        
@app.route('/pscanStatus')
@EIToken_verification
def pscanStatus():
    try:
        scanId = request.cookies.get('scanId')
        scan_info = db.findScan(scanId)
        pscanId = scan_info['pscanId']
        payload = {'scanId':pscanId}
        r = requests.get('http://127.0.0.1:5000/JSON/spider/view/status/',params=payload)   
        r = r.json()
        status = r['status']
        db.modifyExistInfo('pscanStatus',status,scanId)
        
        r_html = requests.get('http://127.0.0.1:5000/OTHER/core/other/htmlreport/')
        if r_html.status_code == 200:
            db.modifyExistHtml('html',r_html.content,scanId)

        result = {'status':status}
        return jsonify(result)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

@app.route('/spiderPause')
@EIToken_verification
def spiderPause():
    try:
        spiderId=request.cookies.get('spiderId')
        payload = {'scanId':spiderId}
        r = requests.get('http://127.0.0.1:5000/JSON/spider/action/pause/',params=payload)  
        r = r.json()
        result = {'Result':r['Result']}
        return jsonify(result)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

@app.route('/spiderResume')
@EIToken_verification
def spiderResume():
    try:
        spiderId=request.cookies.get('spiderId')
        payload = {'scanId':spiderId}
        r = requests.get('http://127.0.0.1:5000/JSON/spider/action/resume/',params=payload) 
        r = r.json()
        result = {'Result':r['Result']}
        return jsonify(result)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

@app.route('/spiderRemove')
@EIToken_verification
def spiderRemove():
    try:
        r = requests.get('http://127.0.0.1:5000/JSON/spider/action/removeAllScans/')    
        r = r.json()
        result = {'Result':r['Result']}
        return jsonify(result)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)
'''
ACTIVE SCAN
'''
@app.route('/ascan')
@EIToken_verification
def ascan():
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
            abort(500)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

@app.route('/addScanPolicy')
@EIToken_verification
def addScanPolicy():
    try:
        scanPolicyName = 'custom'
        remove_payload = {'scanPolicyName':scanPolicyName}
        r_remove = requests.get('http://127.0.0.1:5000/JSON/ascan/action/removeScanPolicy/',params=remove_payload)
        if r_remove.status_code == 200 or r_remove.status_code == 400:
            alertThreshold = request.args.get('alertThreshold')
            attackStrength = request.args.get('attackStrength')
            payload = {'scanPolicyName':scanPolicyName,'alertThreshold':alertThreshold,'attackStrength':attackStrength}
            r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/addScanPolicy',params=payload)
            result = {'code':r.status_code}
            return jsonify(result)
        else:
            abort(400)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

@app.route('/ascanStatus')
@EIToken_verification
def ascanStatus():
    try:
        scanId = request.cookies.get('scanId')
        scan_info = db.findScan(scanId)
        ascanId = scan_info['ascanId']
        #ascanId=request.cookies.get('ascanId')
        payload = {'ascanId':ascanId}
        r = requests.get('http://127.0.0.1:5000/JSON/ascan/view/status/',params=payload)    
        r = r.json()
        status = r['status']
        db.modifyExistInfo('ascanStatus',status,scanId)
        
        r_html = requests.get('http://127.0.0.1:5000/OTHER/core/other/htmlreport/')
        if r_html.status_code == 200:
            db.modifyExistHtml('html',r_html.content,scanId)
        
        result = {'status':r['status']}
        return jsonify(result)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

@app.route('/ascanPause')
@EIToken_verification
def ascanPause():
    try:
        ascanId=request.cookies.get('ascanId')
        payload = {'scanId':ascanId}
        r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/pause/',params=payload)   
        r = r.json()
        result = {'Result':r['Result']}
        return jsonify(result)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

@app.route('/ascanResume')
@EIToken_verification
def ascanResume():
    try:
        ascanId=request.cookies.get('ascanId')
        payload = {'scanId':ascanId}
        r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/resume/',params=payload)  
        r = r.json()
        result = {'Result':r['Result']}
        return jsonify(result)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

@app.route('/ascanRemove')
@EIToken_verification
def ascanRemove():
    try:
        r = requests.get('http://127.0.0.1:5000/JSON/ascan/action/removeAllScans/') 
        r = r.json()
        result = {'Result':r['Result']}
        return jsonify(result)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

@app.route('/clear')
@EIToken_verification
def clear():
    try:
        r = requests.get('http://127.0.0.1:5000/JSON/core/action/deleteAllAlerts')
        r = r.json()
        result = {'Result':r['Result']}
        return jsonify(result)
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)


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
        report = db.findHtml(target_id)['html']
        source = report.decode("utf-8")
        print("summary is extracted from DB.(with id {})".format(target_id))
    except Exception as err:
        report = session.get('http://127.0.0.1:5000/OTHER/core/other/htmlreport/?')
        source = report.html.raw_html.decode("utf-8")
        print("summary is extracted from ZAP. Because {}.".format(err))

    global High
    global Medium
    global Low
    global Informational

    #find high_count
    hr = re.search(r'<td><a href=\"#high\">High</a></td><td align=\"center\">(.*)</td>', source, flags=0)
    High[target_id] = int( hr.group(1) )

    #find medium_count
    mr = re.search(r'<td><a href=\"#medium\">Medium</a></td><td align=\"center\">(.*)</td>', source, flags=0)
    Medium[target_id] = int( mr.group(1) )
    
    #find low_count
    lr = re.search(r'<td><a href=\"#low\">Low</a></td><td align=\"center\">(.*)</td>', source, flags=0)
    Low[target_id] = int( lr.group(1) )

    #find informational_count
    ir = re.search(r'<td><a href=\"#info\">Informational</a></td><td align=\"center\">(.*)</td>', source, flags=0)
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
                [Low[target_id], 1563761410]
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
    Passive_Scan_Progress[target_id] = 0
    Active_Scan_Progress[target_id] = 0
    try:
        status = db.findScan(target_id)["status"]
        pscanid = db.findScan(target_id)["spiderId"]
        ascanid = db.findScan(target_id)["ascanId"]
        Passive_Scan_Progress[target_id] = int (db.findScan(target_id)["pscanStatus"])
        Active_Scan_Progress[target_id] = int (db.findScan(target_id)["ascanStatus"])
        print ("status: {} | spiderId is {}, and ascanId is {} (from DB)(target_id={})".format(status,pscanid, ascanid, target_id) )
    except Exception as err:
        pscanid = 0
        ascanid = 0
        print ("fail to findScan in DB. Because {}".format(err))
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

@app.route('/datasource/report/<scanId>', methods=['GET'])
@cross_origin()
def datasource_report(scanId):
    try: 
        report = db.findHtml(str(scanId))
        source = report['html'].decode("utf-8")
        print("report is extracted from DB.")
    except Exception as err:
        report = session.get('http://127.0.0.1:5000/OTHER/core/other/htmlreport/?')
        source = report.html.raw_html.decode("utf-8")
        print("Report is extracted from ZAP. Becasue {}".format(err))
        print("You're scanId is {}".format(scanId))
    head = source.split("<h1>",1)
    body = head[1].split("<h3>Alert Detail</h3>",1)
    html = "".join(head[0]+body[1])
    response = make_response(html,200)
    response.headers['Content-Type'] = 'text/html'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

'''
Newly Added End
'''


## Web check scan

@app.route('/checkScan',methods=['GET'])
@cross_origin()
def checkScan():
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
    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

# Dashboard cancel button
@app.route('/cancelScan',methods=['GET'])
@cross_origin()
def cancelScan():
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



'''
checkAnyScan is for checking if there is any scan on ZAP api server
it prevents zap api server from multi-scanning.(Now only support scanning once for one browser page) 
when starting a new scan,browser will stop timer of calling checkAnyScan.
If scan has finished or been stopped,timer would resume to check it.
'''
@app.route('/checkAnyScan',methods=['GET'])
@EIToken_verification
def checkAnyScan():
    try:
        scans = db.listNotFinishedScans()
        if len(scans) !=0:
            result = {'Result':'NO'}
            return jsonify(result)
        elif len(scans) == 0:
            result = {'Result':'OK'}
            return jsonify(result)

    except Exception as err:
        print('error: {}'.format(str(err)))
        abort(500)

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8080,debug=False)
