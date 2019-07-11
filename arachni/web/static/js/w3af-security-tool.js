$(document).ready(function(){
    
	var idi = 0;
	var message;
	$('#startScan').click(function(){
      $.ajax({
                url: '/startScan',
                type: 'GET',
                data: {
                    'scanOption':1,
					'url': $('input[name="input_url"]').val()
                },
                error: function(xhr) {
                    alert('Ajax startScan error');
                },
                success: function(response) {
                    id = response.id;
					message = response.message;
					alert('id:' + id + ' message:'+message);
                }
          
        });	
	});
    
	$('#deleteScan').click(function(){
      $.ajax({
                url: '/deleteScan',
                type: 'GET',
                data: {
                    'id':id,
                },
                error: function(xhr) {
                    alert('Ajax deleteScan error');
                },
                success: function(response) {
					message = response.message;
         			alert(message);
		 		}
          
        });
    
	
	});
    
	$('#getScanResult').click(function(){
      $.ajax({
                url: '/getScanResult',
                type: 'GET',
                data: {
                    'id':id,
                },
                error: function(xhr) {
                    alert('Ajax getScanResult error');
                },
                success: function(response) {

					var len = response.items.length
					var str="";
					for(var i=0;i<len;i++){
						str = str + response.items[i].name+"\n"
	
					}
					alert(str);
				/*
					for(var i=0;i<response.items.length;i++){
						var div=$('<div></div>');      
    					div.addclass('item');    
    					div.appendto(ui list);
						div.text(response.items[i]);
					}
*/
//					$("#scanResult").text('result:'+response.items);
                }
          
        });
    
	
	});
    
	
	
});


