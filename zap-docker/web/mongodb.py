import pymongo
import json
import os
import random
import time




class mongoDB():
	def __init__(self):
		self.mongoUri = 'mongodb://6456bf23-b6e7-4df5-ae94-7ae4501c7c8c:KyzPruBlnDgIt2ti3TnbCbn6P@61.218.118.241:27017/c834abf9-ebb7-461a-b13d-262a1c58e3ae?connectTimeoutMS=300000\u0026maxPoolSize=10'
		self.dbname = 'c834abf9-ebb7-461a-b13d-262a1c58e3ae'
		self.client = pymongo.MongoClient(self.mongoUri)
		self.db = self.client[self.dbname]
		self.collection = self.db.scans
		print("connect to mongoDB!")	
	def getCollection(self):
		coll_name = self.db.collection_names(session=None)
		return coll_name
	def addScan(self,data):
		result = self.collection.insert_one(data)
	def findScan(self,scanId):
		result = self.collection.find_one({"scanId":scanId})
		return result
	def listScans(self,userId):
		results = self.collection.find({"userId":userId},{"_id":0}).sort('timeStep',pymongo.DESCENDING)
		scans = []
		for result in results:
			scans.append(result)
		return scans
	def listAllScans(self):
		results = self.collection.find({},{"_id:0"}).sort('timeStep',pymongo.DESCENDING)
		scans = []
		for result in results:
			scans.append(result)
		return scans
	def deleteScan(self,scanId):
		result = self.collection.remove({'scanId': scanId})
	def deleteAllScans(self):
		result = self.collection.remove({})

if __name__ == '__main__':
	mongodb = mongoDB()
	
	for i in range(20):
		scanId = random.randint(1000000,9999999)
		nowtime = int(time.time())
		scandata1 = {
    "userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
    "scanId":scanId,
    "targetURL":"http://testphp.vulnweb.com",
    "dashbpardLInk":"http://xxxx.xxx.xx",
    "timeStep":nowtime,
    "reportPath":"http://zap-security-web.arfa.wise-paas.com/htmlreport/1564072276.html",
}
		#print(scanId)
		#print(nowtime)

		#mongodb.addScan(scandata1)
	

	#scans = mongodb.listScans('a7ea79a3-c2eb-4c79-b968-b279667f3747')
	#print(scans[0])
	#print(len(scans))
	#scan = mongodb.findScan(5057664)	
	#print(scan)

	#print(scans)
	#mongodb.deleteAllScans()
	scans = mongodb.listAllScans()
	print(len(scans))
	#print(mongodb.getCollection())
