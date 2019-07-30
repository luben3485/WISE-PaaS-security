/*var scanApp = new Vue({
    el: '#start',
    methods: {
        addTable: function (event) {
            tableApp.counter+=1;
        }
    }
})

var tableApp = new Vue({
    el: '#table',
    data: {
        counter: 0
    }
})
*/

/*
 {"targeturl":"http://testphp.vulnweb.com","time":"2019-07-25 15:30:56","dashboardLink":"dd"},
                        {"targeturl":"http://testphp.vulnweb.com","time":"2019-07-25 15:30:56","dashbpardLInk":"dd"},
                        {"targeturl":"http://testphp.vulnweb.com","time":"2019-07-25 15:30:56","dashbpardLInk":"dd"},
                        {"targeturl":"http://testphp.vulnweb.com","time":"2019-07-25 15:30:56","dashbpardLInk":"dd"}
*/
/*
var Data =[
        {
          "userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
          "scanId":1,
          "targetURL":"http://testphp.aaaaaaaa.com",
          "dashboardLInk":"https://www.google.com",
          "timeStamp":24,
            "time":87,
         "reportPath":"http://zap-security-web.arfa.wise-paas.com/htmlreport/1564072276.html",
        },
        {
          "userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
          "scanId":2,
          "targetURL":"http://testphp.vulnweb.com",
          "dashboardLInk":"https://www.google.com",
          "timeStamp":431241234,
            "time":87,
         "reportPath":"http://zap-security-web.arfa.wise-paas.com/htmlreport/1564072276.html",
        },
    {
          "userId":"a7ea79a3-c2eb-4c79-b968-b279667f3747",
          "scanId":3,
          "targetURL":"http://testphp.vulnweb.com",
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
var checked = [];
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
            
            window.location.href = window.location.protocol + '//' + window.location.hostname + '/downloadHtml?'+'scanId='+scanId;
            console.log("download html successfully")
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log("download html fail") 
        });         
    
}


function deleteScan(scanId){
    $.ajax({
                url: '/deleteScan',
                type: 'GET',
                 data: {
                    'scanId':scanId
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
                            field: 'custome', title:'Number', width: 50, titleAlign: 'center', columnAlign: 'center',
                            formatter: function (rowData,rowIndex,pagingIndex,field) {
                                return rowIndex >=0 ? '<span style="color:#000000;font-weight: bold;">' + (rowIndex + 1) + '</span>' : rowIndex + 1
                            }, isFrozen: true,isResize:true
                        },
                        {field: 'targetURL', title:'Target URL', width: 350, titleAlign: 'center',columnAlign:'center',isResize:true},
                        {field: 'time', title: 'Time', width: 100, titleAlign: 'center',columnAlign:'center',isResize:true},
                        {field: 'dashboard', title: 'Dashboard', width: 50, titleAlign: 'center',columnAlign:'center',componentName:'table-dashboard',isResize:true},
                        {field: 'custome-adv', title: 'Operation',width: 150, titleAlign: 'center',columnAlign:'center',componentName:'table-operation',isResize:true}
                    ]

            }
        },
        methods:{
            selectALL(selection){
                console.log('select-aLL',selection);
                if(selection.length ==0){
                    
                    console.log("??")
                }
            },
            selectChange(selection,rowData){
                console.log('select-change',selection,rowData);

            },

            selectGroupChange(selection){
                console.log('select-group-change',selection);
                checked.length = 0
                selection.forEach(function(item, index, array){
                    for(var i=0;i<Data.length;i++){
                        if(Data[i].scanId == item.scanId){
                            checked.push(i);
                        }   
                        
                    }
                    console.log(checked)
                    
                });
                //console.log(selection[0]['targetURL'])
            },
            customCompFunc(params){

                console.log(params);

                if (params.type === 'delete'){ // do delete operation
                    deleteScan(params.rowData['scanId']);
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
                    window.location.href = params.rowData['dashboardLInk'];
                }

            },
            remove(){
                alert(this.tableData[0]['targetURL']);
                var index = this.tableData.indexof(this.tableData);
                this.tableData.splice(index,1)
                
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
