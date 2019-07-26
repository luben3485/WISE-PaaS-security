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
 new Vue({
        el: '#app',
        data: function() {
            return {
                tableData: [
                    {"name":"赵伟","tel":"156*****1987","hobby":"钢琴、书法、唱歌","address":"上海市黄浦区金陵东路569号17楼"},
                    {"name":"李伟","tel":"182*****1538","hobby":"钢琴、书法、唱歌","address":"上海市奉贤区南桥镇立新路12号2楼"},
                    {"name":"孙伟","tel":"161*****0097","hobby":"钢琴、书法、唱歌","address":"上海市崇明县城桥镇八一路739号"},
                    {"name":"周伟","tel":"197*****1123","hobby":"钢琴、书法、唱歌","address":"上海市青浦区青浦镇章浜路24号"},
                    {"name":"吴伟","tel":"183*****6678","hobby":"钢琴、书法、唱歌","address":"上海市松江区乐都西路867-871号"}
                ],
                columns: [
                    {field: 'name', title:'姓名', width: 100, titleAlign: 'center',columnAlign:'center'},
                    {field: 'tel', title: '手机号码', width: 260, titleAlign: 'center',columnAlign:'center'},
                    {field: 'hobby', title: '爱好', width: 330, titleAlign: 'center',columnAlign:'center'},
                    {field: 'address', title: '地址', titleAlign: 'center',columnAlign:'left'}
                ]
            }
        }
})
*/
var Data =[
                        {"targeturl":"http://testphp.vulnweb.com","time":"2019-07-25 15:30:56","dashboardLink":"dd"},
                        {"targeturl":"http://testphp.vulnweb.com","time":"2019-07-25 15:30:56","dashbpardLInk":"dd"},
                        {"targeturl":"http://testphp.vulnweb.com","time":"2019-07-25 15:30:56","dashbpardLInk":"dd"},
                        {"targeturl":"http://testphp.vulnweb.com","time":"2019-07-25 15:30:56","dashbpardLInk":"dd"}
            ];
$(document).ready(function(){
    $('#tabledelete').click(function(){
        //Data.push({"targeturl":"http://abcdefg.vulnweb.com","time":"2019-07-25 15:30:56"});
    });
    
});   
console.log(Data[0]);
    
var Main ={
        data() {
            return {
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
                        {field: 'targeturl', title:'Target URL', width: 350, titleAlign: 'center',columnAlign:'center',isResize:true},
                        {field: 'time', title: 'Time', width: 100, titleAlign: 'center',columnAlign:'center',isResize:true},
                        {field: 'dashboard', title: 'Dashboard', width: 50, titleAlign: 'center',columnAlign:'center',componentName:'table-dashboard',isResize:true},
                        {field: 'custome-adv', title: 'Operation',width: 150, titleAlign: 'center',columnAlign:'center',componentName:'table-operation',isResize:true}
                    ]

            }
        },
        methods:{
            selectALL(selection){
                console.log('select-aLL',selection);
            },
            selectChange(selection,rowData){
                console.log('select-change',selection,rowData);
            },

            selectGroupChange(selection){
                console.log('select-group-change',selection);
            },
            customCompFunc(params){

                console.log(params);

                if (params.type === 'delete'){ // do delete operation

                    this.$delete(this.tableData,params.index);

                }else if (params.type === 'edit'){ // do edit operation

                    alert(`Number：${params.index} Target URL：${params.rowData['targeturl']}  time：${params.rowData['dashboardLink']}`)
                    //dashboard link
                    //window.location.href = params.rowData['link']
                }

            }
        }
    }

    Vue.component('table-dashboard',{
        template:`<span>
        <!--<button id="dashboardlink" style="font-size:1rem;width:auto;" class="ui  green  button" @click.stop.prevent="update(rowData,index)">
            <i class="external alternate icon"></i>
            
        </button>-->
        <a href="" @click.stop.prevent="update(rowData,index)">Link</a>
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
            update(){

               // 参数根据业务场景随意构造
               let params = {type:'edit',index:this.index,rowData:this.rowData};
               this.$emit('on-custom-comp',params);
            },

            deleteRow(){

                // 参数根据业务场景随意构造
                let params = {type:'delete',index:this.index};
                this.$emit('on-custom-comp',params);

            }
        }
    })


    Vue.component('table-operation',{
        template:`<span>
        <a href="" @click.stop.prevent="update(rowData,index)">Download</a>&nbsp;&nbsp;&nbsp;&nbsp;
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
            update(){

               // 参数根据业务场景随意构造
               let params = {type:'edit',index:this.index,rowData:this.rowData};
               this.$emit('on-custom-comp',params);
            },

            deleteRow(){

                // 参数根据业务场景随意构造
                let params = {type:'delete',index:this.index};
                this.$emit('on-custom-comp',params);

            }
        }
    })
var Ctor = Vue.extend(Main)
new Ctor().$mount('#app')
