$(document).ready(function(){
    var astart = 0 ;
    var intervalNum;
	var message;
    var myUrl = window.location.protocol + '//' + window.location.hostname;
    $('.menu .item').tab();
    $('.accordion').accordion({animateChildren: false});
    $('.ui.checkbox').checkbox();
    $('.message .close')
      .on('click', function() {
        $(this)
          .closest('.message')
          .transition('fade')
        ;
      });

    /*
    $('.accordion').click(function() {
        $('.title').toggleClass("active");
        $('.content').toggleClass("active");
    });
    */
    //progressPage();
    //$('.ui.tiny.modal').modal('hide');
    //progressUpdate(87,"Passive scan");
    //finishedDelay(2000,'Passive scan').then(() => {});
    $.ajax({
        url: '/setSSOurl',
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        error: function(xhr) {
            //alert('Ajax /setSSOurl error');

        },
        success: function(response) {        
            console.log('setSSOurl success');
            var ssoUrl = getCookie('SSO_URL');
            $.ajax({
                url: ssoUrl + '/v2.0/users/me',
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            }).done(function (user) {
                refreshTable().done(function(response){
                    while (Data.length > 0) Data.pop();
                    while (response.length > 0) Data.push(response.shift());
                    console.log("refresh table successfully")
                }).fail(function(){
                    console.log("refresh table fail") 
                });
                
                
                console.log('Hello! ' + user.lastName + ' ' + user.firstName);
            }).fail(function () {
               window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
                 
            });        
        }
    });
    function cancelScan(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            $('#downloadReport').removeClass('disabled');
            $('#dashboard').removeClass('disabled');
            checkStop();
            addHtml();
            $.ajax({
                url: '/spiderRemove',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    console.log('Ajax /spiderRemove from progressPage error');
                },
                success: function(response) {
                console.log('spiderRemove from progressPage '+response.Result)    
                }
            });
            
            $.ajax({
                url: '/ascanRemove',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    console.log('Ajax /ascanRemove from progressPage error');
                },
                success: function(response) {
                    console.log('ascanRemove from progressPage '+response.Result)    
                }
          
            });
           
            
        }).fail(function () {
        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /spiderRemove');
        });      
        
        return true;    
    }
    function spiderstatus(){
        return $.ajax({
                url: '/spiderStatus',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                }
          
        });
        
    }
    function ascanstatus(){
        return $.ajax({
                url: '/ascanStatus',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                }
          
        });
        
    }
    function ascanStart(){
        var recurse;
        var inScopeOnly;
        $("input[name=activeRecurse]:checked").each(function () { recurse = $(this).val()});
        $("input[name=inScopeOnly]:checked").each(function () { inScopeOnly = $(this).val()});
        var targetUrl = getCookie('targetUrl');
        return  $.ajax({
                url: '/ascan',
                type: 'GET',
                data: {
					'inScopeOnly': inScopeOnly,
                    'recurse':recurse
                },
                xhrFields: {
                    withCredentials: true
                }
        });	  
        
    }
    function spiderScanStart(){
        var subtreeOnly;
        var recurse;
        $("input[name=subtreeOnly]:checked").each(function () { subtreeOnly = $(this).val()});
        $("input[name=passiveRecurse]:checked").each(function () { recurse = $(this).val()});
        
        return  $.ajax({
                url: '/spiderScan',
                type: 'GET',
                data: {
                    'subtreeOnly': subtreeOnly,
                    'recurse': recurse,
                    'url': $('input[name="input_url"]').val()
                },
                xhrFields: {
                    withCredentials: true
                }
        });
    }
    
    
    function addScanPolicy(){
        var alertThreshold;
        var attackStrength;
        $("input[name=alertThreshold]:checked").each(function () { alertThreshold = $(this).val()});
        $("input[name=attackStrength]:checked").each(function () { attackStrength = $(this).val()});
        
        return  $.ajax({
                url: '/addScanPolicy',
                type: 'GET',
                data: {
                    'alertThreshold':alertThreshold,
                    'attackStrength':attackStrength
                },
                xhrFields: {
                    withCredentials: true
                }
        });	  
        
    }
    
    function checkScan(scanOption){
        if(scanOption == 0){
            spiderstatus().done(function(response){
                if(response.status < 100){
                    progressUpdate(response.status,"Passive scan");
                    console.log('spiderStatus '+ response.status);
                    document.cookie = "pscanStatus="+response.status;
                }else if(response.status==100){
                    document.cookie = "pscanStatus=100";
                    finishedDelay(2000,'Passive scan').then(() => {
                        $('.ui.tiny.modal').modal('hide')                 
                    });
                }
            }).fail(function(){
                alert('Ajax /spiderStatus error from checkScan');
            });
        }
        /*
        else if(scanOption == 1){
            ascanstatus().done(function(response){
                 if(response.status < 100){
                   progressUpdate(response.status,"Active scan");
                    console.log('ascanStatus '+ response.status)  
                }else if(response.status==100){
                    finishedDelay(2000,'Active scan').then(() => {
                        $('.ui.tiny.modal').modal('hide')                   
                    });
                }

            }).fail(function(){
                alert('Ajax /ascanStatus error from checkScan');
            });
        }
        */
                        
        else if(scanOption == 2){
            spiderstatus().done(function(response){
                if (response.status < 100){
                    progressUpdate(response.status,"Passive scan");
                    console.log('spiderStatus '+ response.status)
                    document.cookie = "pscanStatus="+response.status;
                }else if(response.status == 100){
                    if(astart == 0){
                        document.cookie = "pscanStatus=100";
                        progressUpdate(100,"Passive scan");
                        $('#header>h1').text('Scan task has not finished. Please be patient.')

                        addScanPolicy().done(function(res){
                            console.log(res.code);
                            ascanStart().done(function(){
                                astart = 1;
                                console.log('Start a new scan\n Set ascanId in cookie!');       
                            }).fail(function(){
                                console.log('Ajax /ascan error when scanOption=2')
                            });
                            
                        }).fail(function(){
                            console.log('Ajax /addScanPolicy error')
                        });
                        
                        
                        
                    }else if(astart == 1){
                        ascanstatus().done(function(res){
                            if(res.status < 100 && res.status > 0){
                                $('#header>h1').text('It takes a few seconds to minutes to scan your website.')
                                progressUpdate(res.status,"Active scan");
                                console.log('ascanStatus '+ res.status);
                                document.cookie = "ascanStatus="+res.status;
                            }else if(res.status==100){
                                document.cookie = "ascanStatus=100";
                                finishedDelay(2000,'Active scan').then(() => {
                                    $('.ui.tiny.modal').modal('hide');                  
                                });
                            }
                        }).fail(function(){
                            console.log('Ajax /ascanStatus error from checkScan scanOption 2');
                        });
                    }
                }
                
            }).fail(function(){
                alert('either /spiderStatus or /ascanStatus  ajax error from checkScan');
            });
            
            
        }else{
            alert("error scanOption:"+scanOption);
        }
        
    }
    function checkStop() {
        //stop function checkScan
        clearInterval(intervalNum);
    }
    
    function progressUpdate(percent,scantype){
        $('#progressbar').progress({
            percent: percent
        });
        $('#progressNumber').text(scantype +"   "+ percent+'%  Earned')
    }
    
    function progressPage() {
    
        $('.ui.tiny.modal')
            .modal({
            closable  : false,
            onDeny    : cancelScan,
            onApprove : function() {
                $.ajax({
                        url: '/dashboardLink',
                        type: 'GET'
                }).done(function(res){
                    window.open(res);
                }).fail(function(){
                    console.log('/dashboardLInk fail');
                });
                return false;
            }
            })
    .modal('show');
    }
    
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
    function deleteData(){
        //Delete all scan report before
        return $.ajax({
                url: '/clear',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                }
          
        });
        
    }
    function addScan(scanOption){
        //Delete all scan report before
        return $.ajax({
                url: '/addScan',
                type: 'GET',
                data: {
					'targetURL': $('input[name="input_url"]').val(),
                    'scanOption':scanOption
                }
        });
        
    }
    function refreshTable(){
        //Delete all scan report before
        return $.ajax({
                url: '/refreshTable',
                type: 'GET'
        });  
    }
    function addHtml(){
        $.ajax({
                url: '/addHtml',
                type: 'GET',
        }).done(function(){
            console.log("addHtml success")
        }).fail(function(){
            console.log("addHtml error")
        });  
           
        
    }
    function finishedDelay(ms,scantype) {
        checkStop();
        $('#progressbar').progress({
            percent: 100
        });
        $('#progressNumber').text(scantype +'  100%  Earned')
        $('#header>h1').text('Scan task has finished. Page will return immediately.')
        $('#cancelButton').css('display','none');
        $('#downloadReport').removeClass('disabled');
        $('#dashboard').removeClass('disabled');
        $('#succMsg').css('display','none');
        addHtml();
        
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    $('#startScan').click(function(){
        astart = 0
        var ssoUrl = getCookie('SSO_URL');
        var scanOption=$("#scanOption").val();
        document.cookie = "pscanStatus=0";
        document.cookie = "ascanStatus=0";
        $.ajax({
        url: ssoUrl + '/v2.0/users/me',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        }
        }).done(function (user) {

            progressPage();
            $('#succMsg').css('display','none');
            $('#header>h1').text('It takes a few seconds to minutes to scan your website.')
            $('#downloadReport').removeClass('disabled');
            $('#dashboard').removeClass('disabled');
            $('#downloadReport').addClass('disabled');
            $('#dashboard').addClass('disabled');
            $('#cancelButton').css('display','');
            progressUpdate(0,"Passive scan");

            
            
            deleteData().done(function(){    
                spiderScanStart().done(function(){
                    console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /spiderScan');
                    //start timer
                    intervalNum = setInterval(function(){ checkScan(scanOption) }, 600);
                    //alert('Start a  scan\n Set id in cookie!');
                    addScan(scanOption).done(function(){
                        refreshTable().done(function(response){
                            while (Data.length > 0) Data.pop();
                            while (response.length > 0) Data.push(response.shift());
                            console.log("refresh table successfully")
                        }).fail(function(){
                            console.log("refresh table fail") 
                        });
                        console.log("add scan to Database successfully")           
                    }).fail(function(){
                        console.log("add scan to Database fail")     
                    });
                    
                }).fail(function(){
                    console.log('Ajax /spiderScan error');    
                });
                
            }).fail(function () {
                console.log("deleteData error!")
            });

            
            
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            //alert(Data[0].targeturl)
            //console.log('User is not logged in! /spiderScan');
        });    
        
        
	});
    /*--------------------------------ACTIVE SCAN----------------------------*/
	$('#ascan').click(function(){
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
        url: ssoUrl + '/v2.0/users/me',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        }
    }).done(function (user) {
            
        $.ajax({
                url: '/ascan',
                type: 'GET',
                data: {
					'url': $('input[name="input_url"]').val()
                },
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
 
                    alert('Ajax /ascan error');
                },
                success: function(response) {
                    alert('Start a new scan\n Set ascanId in cookie!');
                }
          
        });	  
        console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /ascan');
    }).fail(function () {                
        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
        console.log('User is not logged in! /ascan');
    });    
        
        
	});
    
	$('#ascanStatus').click(function(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            $.ajax({
                url: '/ascanStatus',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /ascanStatus error');
                },
                success: function(response) {
                    console.log('ascanStatus '+ response.status)    
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /ascanStatus');
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /ascanStatus');
        });            
        
      
	});
    
    $('#ascanPause').click(function(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            $.ajax({
                url: '/ascanPause',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /ascanPause error');
                },
                success: function(response) {
                    console.log('ascanPause '+response.Result)
                    
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /ascanPause');
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /ascanPause');
        });            
        
      
    
	
	});
    $('#ascanResume').click(function(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            $.ajax({
                url: '/ascanResume',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /ascanResume error');
                },
                success: function(response) {
                    console.log('ascanResume '+response.Result)    
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /ascanResume');
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /ascanResume');
        });            
        
      
    
	
	});
    $('#ascanRemove').click(function(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            $.ajax({
                url: '/ascanRemove',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /ascanRemove error');
                },
                success: function(response) {
                    console.log('ascanRemove '+response.Result)    
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /ascanRemove');
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /ascanRemove');
        });            
        
      
    
	
	});
    /*--------------------------------ACTIVE SCAN----------------------------*/
    
    /*--------------------------------PASSIVE SCAN-----------------------------*/
    
    $('#spiderScan').click(function(){
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
        url: ssoUrl + '/v2.0/users/me',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        }
    }).done(function (user) {
            
        $.ajax({
                url: '/spiderScan',
                type: 'GET',
                data: {
					'url': $('input[name="input_url"]').val()
                },
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
 
                    alert('Ajax /spiderScan error');
                },
                success: function(response) {
                    alert('Start a new scan\n Set spiderId in cookie!');
                }
          
        });	  
        console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /spiderScan');
    }).fail(function () {                
        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
        console.log('User is not logged in! /spiderScan');
    });    
        
        
	});
    
	$('#spiderStatus').click(function(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            $.ajax({
                url: '/spiderStatus',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /spiderStatus error');
                },
                success: function(response) {
                    console.log('spiderStatus '+ response.status)    
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /spiderStatus');
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /spiderStatus');
        });            
        
      
	});
    
    $('#spiderPause').click(function(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            $.ajax({
                url: '/spiderPause',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /spiderPause error');
                },
                success: function(response) {
                    console.log('spiderPause '+response.Result)
                    
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /spiderPause');
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /spiderPause');
        });            
        
      
    
	
	});
    $('#spiderResume').click(function(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            $.ajax({
                url: '/spiderResume',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /spiderResume error');
                },
                success: function(response) {
                    console.log('spiderResume '+response.Result)    
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /spiderResume');
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /spiderResume');
        });            
        
      
    
	
	});
    $('#spiderRemove').click(function(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            $.ajax({
                url: '/spiderRemove',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /spiderRemove error');
                },
                success: function(response) {
                    console.log('spiderRemove '+response.Result)    
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /spiderRemove');
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /spiderRemove');
        });            
        
      
    
	
	});
    
    
    
    /*--------------------------------PASSIVE SCAN-----------------------------*/
    
    
    $('#downloadReport').click(function(){
        
        var ssoUrl = getCookie('SSO_URL');
        var scanId = getCookie('scanId');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
            window.location.href = myUrl + '/downloadHtml?scanId='+scanId;
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /downloadHtml');
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /downloadHtml');
        });            
     
	});
    $('#dashboard').click(function(){
        $.ajax({
                url: '/dashboardLink',
                type: 'GET'
        }).done(function(res){
            window.location.href = res;
        }).fail(function(){
            console.log('/dashboardLInk fail');
        });
    });
    
    
    $('#clear').click(function(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            
             $.ajax({
                url: '/clear',
                type: 'GET',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(xhr) {
                    alert('Ajax /clear error');
                },
                success: function(response) {
                    console.log('clear '+response.Result)    
                }
          
            });
    
            console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /clear');
        }).fail(function () {
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /clear');
        });            
     
	});
    
	
	
});


