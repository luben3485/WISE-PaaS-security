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
        results = self.collection.find({"userId":userId},{"_id":0}).sort('timeStamp',pymongo.DESCENDING)
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
    def listUserNotFinishedScan(self,userId):
        scan = self.collection.find_one({'userId':userId,'status':{ '$ne':'3' }},{"_id":0})
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
    
    for i in range(1):
        #scanId = random.randint(1000000,9999999)
        scanId = '777'
        nowtime = int(time.time())
        dashboardLink = 'http://www.google.com'
        scanOption = '0'
        spiderId = '0'
        targetURL = 'http://testphp.vulnweb.com'
        scandata = {
             "userId":'b7ea79a3-c2eb-4c79-b968-b279667f3747',
             "scanId":scanId,
             "targetURL":targetURL,
             "dashboardLInk":dashboardLink,
             "timeStamp":nowtime,
             "ascanStatus":'0',
             "pscanStatus":'0',
             "scanOption":scanOption,
             "ascanId":'-1',
             "spiderId":spiderId,
             "status":'3'
         }

        
        #print(scanId)
        #print(nowtime)

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
    mongodb.deleteAllScans()
    #mongodb.deleteScans(['8829705','2962665'])
    #scans = mongodb.listAllScans()
    #print(len(scans))
    #print(scans)
    #print(mongodb.getCollection())
    #html = mongodb.findHtml('1988141')
    #print(html)
    #scanId =str(777)
    #mongodb.modifyExistInfo('ascanId','0',scanId)

    #scan = mongodb.findScan(scanId)    
    #print(scan)

    #scans = mongodb.listNotFinishedScans()
    #print(scans)
    
