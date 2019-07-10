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
        forcelogin();
        console.log('User is not logged in!');
    });
    
    
    
    
    function forcelogin() {
    
        $('.ui.basic.modal')
            .modal({
            closable  : false,
            onDeny    : function(){
                window.location.href = "https://wise-paas.advantech.com/en-us/marketplace";
        
        /*
        $.ajax({
        url: 'https://portal-sso.wise-paas.io/v2.0/auth/native',
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin":"*"
        },
        data: {
            "username":"Ben.Lu@advantech.com.tw",
            "password":""    
        },
        xhrFields: {
            withCredentials: true
        }
    }).done(function (res) {
        alert(res);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(textStatus+":)");
    });
        
        */

        /*
        var d = new Date();
        d.setTime(d.getTime()+(60*60*1000));
        var expires = "expires="+d.toGMTString();
        cvalue = "tokenbrabrabra~~~"
        document.cookie = "EIToken" + "=" + cvalue + "; "// + expires+";domain=.wise-paas.io; path=/";

        alert(document.cookie);
        */
        
        
                return false;
            },
            onApprove : function() {
                //window.alert('Approved!');
                //window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
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
                error: function(xhr) {
                    alert('Ajax startScan error');
                },
                success: function(response) {
                    id = response.id;
					message = response.message;
					alert('id:' + id + ' message:'+message);
                }
          
        });	  
        console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /startScan');
    }).fail(function () {
        forcelogin();
        console.log('User is not logged in! /startScan');
    });    
        
        
        
        
        
	});
    
	$('#deleteScan').click(function(){
        
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
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
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /deleteScan');
        }).fail(function () {
            forcelogin();
            console.log('User is not logged in! /deleteScan');
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
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /getScanResult');
        }).fail(function () {
            forcelogin();
            console.log('User is not logged in! /getScanResult');
        });            
        
      
    
	
	});
    
	
	
});


