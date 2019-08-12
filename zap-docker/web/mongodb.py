import pymongo
import json
import os
import random
import time
from datetime import datetime



class mongoDB():
    def __init__(self):
        self.mongoUri = 'mongodb://6456bf23-b6e7-4df5-ae94-7ae4501c7c8c:KyzPruBlnDgIt2ti3TnbCbn6P@61.219.26.35:27017/c834abf9-ebb7-461a-b13d-262a1c58e3ae?connectTimeoutMS=300000\u0026maxPoolSize=10'
        self.dbname = 'c834abf9-ebb7-461a-b13d-262a1c58e3ae'
        self.client = pymongo.MongoClient(self.mongoUri)
        self.db = self.client[self.dbname]
        self.collection = self.db.scans
        self.coll_html = self.db.htmls
        print("connect to mongoDB!")    
    def getCollection(self):
        coll_name = self.db.collection_names(session=None)
        return coll_name
    def addScan(self,data):
        result = self.collection.insert_one(data)
    def addHtml(self,data):
        result = self.coll_html.insert_one(data)
    def findScan(self,scanId):
        result = self.collection.find_one({"scanId":scanId})
        return result
    def modifyExistInfo(self,key,value,scanId):
        self.collection.update({'scanId':scanId},{'$set':{key:value}})
    def modifyExistHtml(self,key,value,scanId):
        self.coll_html.update({'scanId':scanId},{'$set':{key:value}})
    def findHtml(self,scanId):
        result = self.coll_html.find_one({"scanId":scanId})
        return result
    def listScans(self,userId):
        results = self.collection.find({
            "$and":[
                {'userId':userId},
                {'status':{ '$ne':'0' }}
 
            ]},{"_id":0}).sort('timeStamp',pymongo.DESCENDING)
        scans = []
        for result in results:
            scans.append(result)
        return scans
    def listAllScans(self):
        results = self.collection.find({},{"_id":0}).sort('timeStamp',pymongo.DESCENDING)
        scans = []
        for result in results:
            scans.append(result)
        return scans
    def listNotFinishedScans(self):
        results = self.collection.find({'status':{ '$ne':'3' }},{"_id":0}).sort('timeStamp',pymongo.DESCENDING)
        scans = []
        for result in results:
            scans.append(result)
        return scans
    def readyScans(self):
        results = self.collection.find({'status':'0'},{"_id":0}).sort('timeStamp',pymongo.ASCENDING)
        scans = []
        for result in results:
            scans.append(result)
        return scans
    def listUserNotFinishedScan(self,userId):
        scan = self.collection.find_one({
            "$and":[
                {'userId':userId},
                {'status':{ '$ne':'3' }}
            ]},{"_id":0})
        return scan
    def listScanning(self):
        # Not (0 or 3) => (not 0) and (not 3)
        scan = self.collection.find_one({
            "$and":[
                    {"status":{"$ne":"0"}},
                    {"status":{"$ne":"3"}}
                    
            ]},{"_id":0})
        return scan
    def deleteScan(self,scanId):
        result = self.collection.remove({'scanId': scanId})
        result_html = self.coll_html.remove({'scanId':scanId})
    def deleteScans(self,scanIdlist):
        for scanId in scanIdlist:
            result = self.collection.remove({'scanId': scanId})
            result_html = self.coll_html.remove({'scanId':scanId})
    def deleteAllScans(self):
        result = self.collection.remove({})

if __name__ == '__main__':
    mongodb = mongoDB()

    userId = 'hello'
    scanId = '666'
    targetURL = 'http://testphp.vulnweb.com'
    dashboardLink  = 'http://www.google.com'
    nowtime = int(time.time())
    scanOption = '0'
    precurse = 'true'
    subtreeOnly = 'false'

    html_info = {
             "userId":userId,
             "scanId":scanId,
             "html":""
         }
    mongodb.addHtml(html_info)





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
                "pscanId":'-1',
                "status":'0',
                "pscanInfo":{
                    "recurse": precurse,
                    "subtreeOnly": subtreeOnly,
                    "maxChildren":'',
                    "contextName":''
                },
                "ascanInfo":{
                    "recurse" : '',
                    "inScopeOnly" : '',
                    "method" : '',
                    "postData" : '',
                    "contextId" : '',
                    "alertThreshold" : '',
                    "attackStrength" : ''
                }
            }

    #mongodb.addScan(scandata)
    
    
    #scans = mongodb.listScans('b7ea79a3-c2eb-4c79-b968-b279667f3747')
    #print(scans)
    #print(len(scans))
    #scan = mongodb.findScan('6574903') 
    #print(scan)
    '''
    for scan in scans:
        ts = scan['timeStamp']
        time = datetime.fromtimestamp(ts).strftime('%Y/%m/%d %H:%M')
        time_info = {'time' : time}
        scan.update(time_info)
    '''
    #print(time_info)


    #print(scans)
    #mongodb.deleteAllScans()
    #mongodb.deleteScans(['8829705','2962665'])
    scans = mongodb.listAllScans()
    print(len(scans))
    print(scans)
    #print(mongodb.getCollection())
    #html = mongodb.findHtml('1988141')
    #print(html)
    #scanId =str(777)
    #mongodb.modifyExistInfo('ascanId','0',scanId)

    #scan = mongodb.findScan(scanId)    
    #print(scan)

    #scans = mongodb.listNotFinishedScans()
    #print(scans)
    
    #scan = mongodb.listScanning()
    #print(scan)

    #scans = mongodb.readyScans()
    #print(scans)
    #print(len(scans))
