var deleted=[];
var deletedFlag = 0;
/*var Data =[
        {
          "userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
          "scanId":1,
          "targetURL":"ahttp://testphp.aaaaaaaa.com",
          "dashboardLInk":"https://www.google.com",
          "timeStamp":24,
            "time":87,
         "reportPath":"http://zap-security-web.arfa.wise-paas.com/htmlreport/1564072276.html",
        },
        {
          "userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
          "scanId":2,
          "targetURL":"bhttp://testphp.vulnweb.com",
          "dashboardLInk":"https://www.google.com",
          "timeStamp":431241234,
            "time":87,
         "reportPath":"http://zap-security-web.arfa.wise-paas.com/htmlreport/1564072276.html",
        },
    {
          "userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
          "scanId":3,
          "targetURL":"chttp://testphp.vulnweb.com",
          "dashboardLInk":"https://www.google.com",
          "timeStamp":1431241234,
        "time":87,
         "reportPath":"http://zap-security-web.arfa.wise-paas.com/htmlreport/1564072276.html",
        },
    {
          "userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
          "scanId":4,
          "targetURL":"http://testphp.vulnweb.com",
          "dashboardLInk":"https://www.google.com",
          "timeStamp":5431241234,
          "time":87,
         "reportPath":"http://zap-security-web.arfa.wise-paas.com/htmlreport/1564072276.html",
        },
    {
          "userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
          "scanId":5,
          "targetURL":"http://testphp.vulnweb.com",
          "dashboardLInk":"https://www.google.com",
          "timeStamp":431241234,
         "time":87,
         "reportPath":"http://zap-security-web.arfa.wise-paas.com/htmlreport/1564072276.html",
        },
                 
        ];
*/
var Data = [];
$(document).ready(function(){
    
    $('#tabledelete').click(function(){


        
        
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

function downloadHtml(scanId){
    var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
             $.ajax({
                    url: '/downloadHtml',
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
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log("download html fail") 
        });         
    
}


function deleteScans(scanIdArr){
    $.ajax({
                url: '/deleteScans',
                type: 'POST',
                 data: {
                    'scanIdArr':scanIdArr
                }
    }).done(function(){
        console.log("delete scan success");       
        $.ajax({
                url: '/refreshTable',
                type: 'GET'
        }).done(function(response){
            while (Data.length > 0) Data.pop();
            while (response.length > 0) Data.push(response.shift());
            console.log("refresh table successfully")
        }).fail(function(){
            console.log("refresh table fail") 
        });
        
    }).fail(function(){
        
        console.log("delete scan error");
        
    });

    
}
    
var Main ={
        data() {
            return {
                isLoading: true,
                tableData: Data,
                    columns: [
                        {width: 50, titleAlign: 'center',columnAlign:'center',type: 'selection' 
                        },
                        {
                            field: 'custome', title:'Number', width: 40, titleAlign: 'center', columnAlign: 'center',
                            formatter: function (rowData,rowIndex,pagingIndex,field) {
                                return rowIndex >=0 ? '<span style="color:#000000;font-weight: bold;">' + (rowIndex + 1) + '</span>' : rowIndex + 1
                            }, isFrozen: true,isResize:true
                        },
                        {field: 'targetURL', title:'Target URL', width: 250, titleAlign: 'center',columnAlign:'center',isResize:true},
                        {field: 'time', title: 'Time', width: 100, titleAlign: 'center',columnAlign:'center',isResize:true},
                        {field: 'dashboard', title: 'Dashboard', width: 40, titleAlign: 'center',columnAlign:'center',componentName:'table-dashboard',isResize:true},
                        {field: 'custome-adv', title: 'Operation',width: 120, titleAlign: 'center',columnAlign:'center',componentName:'table-operation',isResize:true}
                    ]

            }
        },
        methods:{
            selectALL(selection){
                
                //console.log('select-aLL',selection);
                if(selection.length !=0){
                    deletedFlag = 1;
                    while (deleted.length > 0) deleted.pop();
                    selection.forEach(function(item, index, array){
                        deleted.push(index);
                    });
                    console.log('deleted:'+deleted)
                }else{
                    deletedFlag = 0;
                }
            },
            selectChange(selection,rowData){
                //console.log('select-change',selection,rowData);
                
            },

            selectGroupChange(selection){
                deletedFlag = 1;
                //console.log('select-group-change',selection);
                while (deleted.length > 0) deleted.pop();
                selection.forEach(function(item, index, array){
                    for(var i=0;i<Data.length;i++){
                        if(Data[i].scanId == item.scanId){
                            deleted.push(i);
                        }   
                        
                    }

                });
                console.log('deleted:'+deleted)
                    
            },
            customCompFunc(params){

                console.log(params);

                if (params.type === 'delete'){ // do delete operation
                    deleteScans([params.rowData['scanId']]);
                    //this.$delete(this.tableData,params.index);

                }else if (params.type === 'download'){ // do download operation
                    /*
                    alert(`Number：${params.index} Target URL：${params.rowData['targetURL']}  time：${params.rowData['time']}  scanId：${params.rowData['scanId']}`)
                    */
                    scanId = params.rowData['scanId'];
                    //userId = params.rowData['userId'];    
                    downloadHtml(scanId);

                }else if (params.type === 'dashboard'){ // do download operation
                    
                    //dashboard link
                    window.open(params.rowData['dashboardLInk']);
                    //window.location.href = params.rowData['dashboardLInk'];
                }

            },
            remove(){
                //alert(this.tableData[0]['targetURL']);
                //var index = this.tableData.indexof(this.tableData);
                //this.tableData.splice(index,1)

                if(deletedFlag == 1){
                    var scanIdArr = [];
                    deleted.forEach(function(element, index){
                        scanIdArr.push(Data[element]['scanId']);
                        
                    });
                    deleteScans(scanIdArr)
                    //alert(scanIdArr);
                    deletedFlag = 0;
                }else{
                    
                    //alert('no');
                }
                    
                
                
                
            }
        }
    }

    Vue.component('table-dashboard',{
        template:`<span>
        <!--<button id="dashboardlink" style="font-size:1rem;width:auto;" class="ui  green  button" @click.stop.prevent="update(rowData,index)">
            <i class="external alternate icon"></i>
            
        </button>--> 
        <a href="" @click.stop.prevent="dashboardLink(rowData,index)">Link</a>
        </span>`,
        props:{
            rowData:{
                type:Object
            },
            field:{
                type:String
            },
            index:{
                type:Number
            }
        },
        methods:{
            dashboardLink(){

               let params = {type:'dashboard',index:this.index,rowData:this.rowData};
               this.$emit('on-custom-comp',params);
            }
        }
    })


    Vue.component('table-operation',{
        template:`<span>
        <a href="" @click.stop.prevent="download(rowData,index)">Download</a>&nbsp;&nbsp;&nbsp;&nbsp;
        <a href="" @click.stop.prevent="deleteRow(rowData,index)">Delete</a>
        </span>`,
        props:{
            rowData:{
                type:Object
            },
            field:{
                type:String
            },
            index:{
                type:Number
            }
        },
        methods:{
            download(){

               let params = {type:'download',index:this.index,rowData:this.rowData};
               this.$emit('on-custom-comp',params);
            },

            deleteRow(){

                let params = {type:'delete',index:this.index,rowData:this.rowData};
                this.$emit('on-custom-comp',params);

            }
        }
    })
var Ctor = Vue.extend(Main)
new Ctor().$mount('#app')








/*


var scanningCtor = Vue.extend(Main)
new scanningCtor().$mount('#scanningApp')
*/