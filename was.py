# -*- coding: utf8 -*-
from twisted.web import server, resource, static
from twisted.internet import reactor, endpoints
import json
import sqlite3
import itertools
import operator
import datetime

conn = sqlite3.connect('db.db')
c = conn.cursor()

class getToDos(resource.Resource):
    isLeaf = True

    def render_POST(self, request):
        request.setHeader("content-type", "application/json")
        userName = (request.args['userName'][0]).decode('utf-8')

        return_keyword = []

        yesterdayDatetime = datetime.datetime.now() - datetime.timedelta(days=1)
        yesterdayStr = yesterdayDatetime.strftime('%Y%m%d000000')

        keyword_1 = '%모두%'.decode('utf-8')

        sql_str = """select uuid, sender, receiver, contents, statusSender, statusReceiver from
(
select * from toDo where removeFlag != 'Y' and ( sender='%s' or receiver='%s' or receiver='%s' ) and statusSender||statusReceiver!='OO'
union all
select * from toDo where ( sender='%s' or receiver='%s' or receiver='%s"' ) and statusSender||statusReceiver='OO' and updateDateTime > '%s'
)""" %(userName, userName, keyword_1, userName, userName, keyword_1, yesterdayStr)
        
        #print sql_str
        try:
            c.execute(sql_str)
            results = c.fetchall()
        except sqlite3.Error, e:
            print "DB Error %s:" % e.args[0]
            return 'False'

        for result in results:
            r = {"uuid":result[0], "sender":result[1], "receiver" : result[2], "contents" : result[3], "statusSender" : result[4], "statusReceiver" : result[5]}
            #print(r)
            return_keyword.append(r)        

        return json.dumps(return_keyword)

class regNew(resource.Resource):
    isLeaf = True

    def render_POST(self, request):
        request.setHeader("content-type", "application/json")
        #print request.args
        uuid = (request.args['uuid'][0]).decode('utf-8')
        sender = (request.args['sender'][0]).decode('utf-8')
        receiver = (request.args['receiver'][0]).decode('utf-8')
        contents = (request.args['contents'][0]).decode('utf-8')
        statusSender = (request.args['statusSender'][0]).decode('utf-8')
        statusReceiver = (request.args['statusReceiver'][0]).decode('utf-8')

        todayDatetime = datetime.datetime.now()
        todayStr = todayDatetime.strftime('%Y%m%d%H%M%S')

        sql_str = ""        

        if(sender=="DNA" and receiver=="DNA" and contents=="DNA"):
            if(statusSender!="DNA"):
                sql_str = "update toDo set statusSender='%s' , updateDateTime='%s' where uuid='%s' " %(statusSender, todayStr, uuid)
            else:
                sql_str = "update toDo set statusReceiver='%s' , updateDateTime='%s' where uuid='%s' " %(statusReceiver, todayStr, uuid)
        else:
            sql_str = "select uuid, receiver from toDo where uuid='%s' " %(uuid)
            try:
                c.execute(sql_str)
                results = c.fetchall()
            except sqlite3.Error, e:
                print "DB Error %s:" % e.args[0]
                return 'False'
            if(len(results)!=0):                
                #sql_str = "update toDo set receiver='%s', contents='%s' where uuid='%s' " %(receiver, contents, uuid)
                sql_str = "update toDo set contents='%s' , updateDateTime='%s' where uuid='%s' " %(contents, todayStr, uuid)
            else:
                sql_str = "insert into toDo('uuid','sender','receiver','contents', 'createDateTime' ) values ('%s','%s','%s','%s','%s')" %(uuid, sender, receiver, contents, todayStr)

        try:
            c.execute(sql_str)
            conn.commit()
        except sqlite3.Error, e:
            print "DB Error %s:" % e.args[0]
            return 'False'

        #print sql_str

        return json.dumps({"result":"success"})

class delete(resource.Resource):
    isLeaf = True

    def render_POST(self, request):
        request.setHeader("content-type", "application/json")
        uuid = (request.args['uuid'][0]).decode('utf-8')

        todayDatetime = datetime.datetime.now()
        todayStr = todayDatetime.strftime('%Y%m%d%H%M%S')

        sql_str = "update toDo set removeFlag='Y', updateDateTime='%s' where uuid='%s' " %(todayStr, uuid)
        print sql_str
        try:
            c.execute(sql_str)
            results = c.fetchall()
        except sqlite3.Error, e:
            print "DB Error %s:" % e.args[0]
            return 'False'

        return json.dumps({"result":"success"})

root = static.File("./ui")
root.putChild("regNew", regNew())
root.putChild("getToDos", getToDos())
root.putChild("delete", delete())

factory = server.Site(root) 
reactor.listenTCP(80, factory)

print '=Jellyfish='

reactor.run()