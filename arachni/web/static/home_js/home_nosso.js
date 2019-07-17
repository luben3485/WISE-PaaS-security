$(document).ready(function(){
	var message;
    var port = 8080
    var myUrl = window.location.protocol + '//' + window.location.hostname+':'+port;
    var ssoUrl = 'https://portal-sso.wise-paas.io';
 
    function forcelogin() {
    
        $('.ui.basic.modal')
            .modal({
            closable  : false,
            onDeny    : function(){
                window.location.href = "https://wise-paas.advantech.com/en-us/marketplace";
                return false;
            },
            onApprove : function() {
                window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
        
            }
            })
    .modal('show');
    
    
    }
    
    

	$('#startScan').click(function(){
        
        $.ajax({
                url: '/startScan',
                type: 'GET',
                data: {
					'url': $('input[name="input_url"]').val()
                },
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /startScan error');
                },
                success: function(response) {
                    
                    alert('Start a new scan\n Set scan id in cookie!');
                }
          
        });	  

	});
    
	$('#getScanResult').click(function(){
        
            
            $.ajax({
                url: '/getScanResult',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /getScanResult error');
                },
                success: function(response) {
                    if(response.code == 401){
                        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;    
                    }else if(response.code == 200){
                        console.log(response.ret)

                        window.location.href =  myUrl+'/report'; 
                        
                    }
 
                }
          
            });

	});
    

    $('#downloadReport').click(function(){
        
      window.location.href = myUrl + '/downloadReport';
   
	});
    
	
	
});


