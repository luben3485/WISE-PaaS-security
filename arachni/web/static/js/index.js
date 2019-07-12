$(document).ready(function(){
    var id = 0;
	var message;
    var myUrl = window.location.protocol + '//' + window.location.hostname;
    var ssoUrl = 'https://portal-sso.wise-paas.io';
    $.ajax({
        url: ssoUrl + '/v2.0/users/me',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        }
    }).done(function (user) {
        console.log('Hello! ' + user.lastName + ' ' + user.firstName);
    }).fail(function () {
        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
        console.log('User is not logged in!');
    });
    
    
    
    
    function forcelogin() {
    
        $('.ui.basic.modal')
            .modal({
            closable  : false,
            onDeny    : function(){
                window.location.href = "https://wise-paas.advantech.com/en-us/marketplace";
                return false;
            },
            onApprove : function() {
                //window.alert('Approved!');
                window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
        
            }
            })
    .modal('show');
    
    
    }
    
    

	$('#startScan').click(function(){
    
        $.ajax({
        url: ssoUrl + '/v2.0/users/me',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        }
    }).done(function (user) {
            
        $.ajax({
                url: '/startScan',
                type: 'GET',
                data: {
                    'scanOption':1,
					'url': $('input[name="input_url"]').val()
                },
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax startScan error');
                },
                success: function(response) {
                    if(response.code == 401){
                        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;    
                    }else{
                        id = response.id;
                        alert('id:'+id);
                    }
                }
          
        });	  
        console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /startScan');
    }).fail(function () {
        //forcelogin();
        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
        console.log('User is not logged in! /startScan');
    });    
        
        
        
        
        
	});
    
	$('#getScanResult').click(function(){
        
        
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            $.ajax({
                url: '/getScanResult',
                type: 'GET',
                data: {
                    'id':id,
                },
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax getScanResult error');
                },
                success: function(response) {
                    if(response.code == 401){
                        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;    
                    }else{
					   var len = response.issues.length
					   var str="";
					   for(var i=0;i<len;i++){
						  str = str + response.issues[i].name+"\n"
					   }
					   alert(str);
                    }
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /getScanResult');
        }).fail(function () {
            //forcelogin();
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /getScanResult');
        });            
        
      
    
	
	});
    
	
	
});

