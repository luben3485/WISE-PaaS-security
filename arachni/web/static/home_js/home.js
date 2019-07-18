$(document).ready(function(){
    
	var message;
    var myUrl = window.location.protocol + '//' + window.location.hostname;
    //var ssoUrl = 'https://portal-sso.wise-paas.io';
    
    $.ajax({
                url: '/setSSOurl',
                type: 'GET',
                data: {
                    'scanOption':1,
                },
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /setSSOurl error');
                },
                success: function(response) {
                    
                    console.log('setSSOurl success');
                    var ssoUrl = getCookie('SSO_URL');
                    //alert(ssoUrl);
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
                    
                }
          
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
    

	$('#startScan').click(function(){
        var ssoUrl = getCookie('ssoUrl');
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
                    //$(".ui dimmer").removeClass("active");
                    //$(".ui negative message").css("display","block"); 
                    alert('Ajax /startScan error');
                },
                success: function(response) {
                    //$(".ui dimmer").removeClass("active");
                    //$(".ui success message").css("display","block"); 
                    
                    /*if(response.code == 401){
                        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;    
                    }else{
                        id = response.id;
                        alert('id:'+id);
                        
                    }*/
                    
                    alert('Start a new scan\n Set scan id in cookie!');
                }
          
        });	  
        console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /startScan');
    }).fail(function () {                
        //forcelogin();
        //
        
            //$(".ui success message").css("display","block"); 
            
        //
        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
        console.log('User is not logged in! /startScan');
    });    
        
        
        
        
        
	});
    
	$('#getScanResult').click(function(){
        
        var ssoUrl = getCookie('ssoUrl');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            data: {
                    'scanOption':1,
                },
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
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
                    /*
                    else{
					   var len = response.issues.length
					   var str="";
					   for(var i=0;i<len;i++){
						  str = str + response.issues[i].name+"\n"
					   }
					   alert(str);
                    }
                    */
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /getScanResult');
        }).fail(function () {
            //forcelogin();
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /getScanResult');
        });            
        
      
    
	
	});
    
    $('#downloadReport').click(function(){
        
        var ssoUrl = getCookie('ssoUrl');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            data: {
                    'scanOption':1,
                },
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            window.location.href = myUrl + '/downloadReport';
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /downloadReport');
        }).fail(function () {
            //forcelogin();
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /getScanResult');
        });            
        
      
    
	
	});
    
	
	
});


