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
var Main ={
        data() {
            return {
                tableData: [
                        {"name":"赵","tel":"156*****1987","hobby":"钢琴、书法、唱歌","address":"上海市黄浦区金陵东路569号17楼"},
                        {"name":"李","tel":"182*****1538","hobby":"钢琴、书法、唱歌","address":"上海市奉贤区南桥镇立新路12号2楼"},
                        {"name":"孙伟","tel":"161*****0097","hobby":"钢琴、书法、唱歌","address":"上海市崇明县城桥镇八一路739号"},
                        {"name":"周伟","tel":"197*****1123","hobby":"钢琴、书法、唱歌","address":"上海市青浦区青浦镇章浜路24号"},
                        {"name":"吴伟","tel":"183*****6678","hobby":"钢琴、书法、唱歌","address":"上海市松江区乐都西路867-871号"}
                     ],
                    columns: [
                        {width: 60, titleAlign: 'center',columnAlign:'center',type: 'selection'},
                        {
                            field: 'custome', title:'Number', width: 50, titleAlign: 'center', columnAlign: 'center',
                            formatter: function (rowData,rowIndex,pagingIndex,field) {
                                return rowIndex < 3 ? '<span style="color:#FF0000;font-weight: bold;">' + (rowIndex + 1) + '</span>' : rowIndex + 1
                            }, isFrozen: true,isResize:true
                        },
                        {field: 'name', title:'Target URL', width: 150, titleAlign: 'center',columnAlign:'center',isResize:true},
                        {field: 'tel', title: '', width: 150, titleAlign: 'center',columnAlign:'center',isResize:true},
                        {field: 'hobby', title: '爱好', width: 150, titleAlign: 'center',columnAlign:'center',isResize:true},
                        {field: 'address', title: '地址', width: 230, titleAlign: 'center',columnAlign:'left',isResize:true},
                        {field: 'custome-adv', title: '操作',width: 200, titleAlign: 'center',columnAlign:'center',componentName:'table-operation',isResize:true}
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

                    alert(`行号：${params.index} 姓名：${params.rowData['name']}`)
                }

            }
        }
    }

    // 自定义列组件
    Vue.component('table-operation',{
        template:`<span>
        <a href="" @click.stop.prevent="update(rowData,index)">编辑</a>&nbsp;
        <a href="" @click.stop.prevent="deleteRow(rowData,index)">删除</a>
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