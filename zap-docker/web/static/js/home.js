$(document).ready(function(){
    var checkAnyScanTimer;
    var astart = 0 ;
    var intervalNum;
    var passiveScanTimer;
    var activeScanTimer;
	var message;
    var myUrl = window.location.protocol + '//' + window.location.hostname;
    var hostname = window.location.hostname;
    var domainName = hostname.substr(hostname.indexOf("."));
    var ssoUrl = 'https://portal-sso' + domainName;
    document.cookie="appUrl="+myUrl+";domain="+domainName+"; path=/";
    document.cookie="SSO_URL="+ssoUrl+";domain="+domainName+"; path=/";
    
    //showMessage('aaa','fffff','successful')
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
    //checkAnyScan();
    //checkAnyScanTimer = setInterval(function(){ checkAnyScan() }, 5000);
    autoRefreshTableTimer = setInterval(function(){ autoRefreshTable() }, 10000);
    function autoRefreshTable(){
        refreshTable().done(function(response){
            while (Data.length > 0) Data.pop();
            while (response.length > 0) Data.push(response.shift());
        }).fail(function(){
            console.log('refreshTable error')
        });
    }
    
    // check EIToken
    function EIToken_verification(){
        var ssoUrl = getCookie('SSO_URL');
        return  $.ajax({
                    url: ssoUrl + '/v2.0/users/me',
                    method: 'GET',
                    xhrFields: {
                        withCredentials: true
                    }
                });
    }
    
    function checkAnyScan(){
        $.ajax({
            url: 'checkAnyScan',
            method: 'GET'    
            }).done(function (res){
                if(res.Result == 'OK'){
                    $('#checkScanMsg').css('display','none');
                    $('#startScan').removeClass('disabled');
                    console.log("No one scan");
                }else if(res.Result == 'NO'){
                    $('#checkScanMsg').css('display','block');
                    $('#startScan').addClass('disabled');
                    console.log("Someone is scanning");
                }
                
            }).fail(function(){
                //window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
                console.log("check any scan table fail") 
            });
        
    }
    
    
    
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
    function cancelScan(){
        
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
            url: ssoUrl + '/v2.0/users/me',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            }
        }).done(function (user) {
            //$('#downloadReport').removeClass('disabled');
            //$('#dashboard').removeClass('disabled');
            checkStop();
            updateHtml();
            finishStatus();
            
            $('#startScan').removeClass('disabled');
            
            showDelay(10).then(() => {
                showMessage('You have stopped the scan.','You can still downlaod report below','negative');
            });
            
           
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
           
            checkAnyScan()
            checkAnyScanTimer = setInterval(function(){ checkAnyScan() }, 5000);
        }).fail(function () {
        window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
            console.log('User is not logged in! /spiderRemove');
        });      
        
        return true;    
    }
    function spiderstatus(){
        return $.ajax({
                url: '/spiderStatus',
                type: 'GET'
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
    /*passive scan begin*/
    function passiveScan(targetURL,recurse,subtreeOnly){
        
        $.ajax({
            url: '/passiveScan',
            type: 'GET',
            data:{
                'targetURL': targetURL,
                'recurse': recurse,
                'subtreeOnly':subtreeOnly,
                'scanOption':scanOption
            }
        }).done(function(){
            $('#cancelButton').removeClass('disabled');
            $('#scanningmessage').css('display','block');
            showScanning('Passive scan... 0%','It takes a few seconds to minutes to scan your website.');
            console.log('/passiveScan success');
            //TIMER
            checkPassiveScan();
            passiveScanTimer = setInterval(function(){ checkPassiveScan() }, 1000);
            
            refreshTable().done(function(response){
                while (Data.length > 0) Data.pop();
                while (response.length > 0) Data.push(response.shift());
                $.ajax({
                        url: '/dashboardLink',
                        type: 'GET'
                }).done(function(res){
                        window.open(res);
                }).fail(function(){
                        console.log('/dashboardLInk fail');
                });
                console.log("refresh table successfully")
            }).fail(function(){
                console.log("refresh table fail") 
            });
            
        }).fail(function(){
             window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl; 
        });
        
        
    }
    
    function checkPassiveScan(){
        $.ajax({
            url: '/pscanStatusDB',
            type: 'GET'
        }).done(function(response){
            if(response.status == -1){
                //init
                $('#startScan').removeClass('disabled');
                $('#cancelButton').addClass('disabled');
                $('#scanningmessage').css('display','none');
                $('#message').css('display','none');
            }else if(response.status < 100){
                showScanning('Passive scan... '+response.status+'%','It takes a few seconds to minutes to scan your website.');
                console.log('pscanStatus '+ response.status);
            }else if(response.status==100){
                showScanning('Passive scan... 100%','It takes a few seconds to minutes to scan your website.');
                pscanFinish(500).then(() => {
                    $('#scanningmessage').css('display','none');
                    showMessage('Scan task has finished successfully.','You can downlaod report below','successful');
                    /*
                    checkAnyScan();
                    checkAnyScanTimer = setInterval(function(){ checkAnyScan() }, 5000);   });
                    */
            }
        }).fail(function(){
            console.log('Ajax /pscanStatus error from checkPassiveScan');
        });
        
    }
    function pscanFinish(ms) {
        clearInterval(passiveScanTimer);
        $('#startScan').removeClass('disabled');
        $('#cancelButton').addClass('disabled');
        
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /*passive scan end */
    
    
    
    //startScan button
    $('#startScan').click(function(){
        EIToken_verification().done(function(){
            //clearInterval(checkAnyScanTimer);
            $('#startScan').addClass('disabled');
            var scanOption=$("#scanOption").val();
            $('#message').css('display','none');
        
            if(scanOption == 0){
                var subtreeOnly;
                var recurse;
                var targetURL;
                $("input[name=subtreeOnly]:checked").each(function () { subtreeOnly = $(this).val()});
                $("input[name=passiveRecurse]:checked").each(function () { recurse = $(this).val()});
                targetURL = $('input[name="input_url"]').val();
                passiveScan(targetURL,recurse,subtreeOnly,scanOption);
            }else if(scanOption == 2){
                
            }
            
        }).fail(function(){
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl; 
        });
    });
    




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
        $.ajax({
                url: '/checkScan',
                type: 'GET'
        }).done(function(res){
            if(res.Result == 'SCAN'){
                checkStatus(scanOption);
            }else{
                //checkStop();
                //updateHtml();
                //stop from dashboard
                showDelay(10).then(() => {
                showMessage('You have stopped the scan.','You can still downlaod report below','negative');
            });
            }
        
        }).fail(function(){
            console.log('/checkScan error');
        });
    }
    function checkStatus(scanOption){
        if(scanOption == 0){
            spiderstatus().done(function(response){
                if(response.status < 100){
                    //progressUpdate(response.status,"Passive scan");
                    showScanning('Passive scan... '+response.status+'%','It takes a few seconds to minutes to scan your website.');
                    console.log('spiderStatus '+ response.status);
                }else if(response.status==100){
                    showScanning('Passive scan... 100%','It takes a few seconds to minutes to scan your website.');
                    finishedDelay(500,'Passive scan').then(() => {
                        $('#scanningmessage').css('display','none');
                        showMessage('Scan task has finished successfully.','You can downlaod report below','successful');
                        checkAnyScan();
                        checkAnyScanTimer = setInterval(function(){ checkAnyScan() }, 5000);
                        //$('.ui.tiny.modal').modal('hide')                 
                    });
                }
            }).fail(function(){
                alert('Ajax /spiderStatus error from checkScan');
            });
        }               
        else if(scanOption == 2){
            spiderstatus().done(function(response){
                if (response.status < 100){
                    showScanning('Passive scan... '+response.status+'%','It takes a few seconds to minutes to scan your website.');
                    //progressUpdate(response.status,"Passive scan");
                    console.log('spiderStatus '+ response.status)
                }else if(response.status == 100){
                    if(astart == 0){
                        //progressUpdate(100,"Passive scan");
                        //$('#header>h1').text('Scan task has not finished. Please be patient.')
                        showScanning('Passive scan... 100%','Scan task has not finished. Please be patient.');

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
                                //$('#header>h1').text('It takes a few seconds to minutes to scan your website.')
                                showScanning('Active scan... '+res.status+'%','It takes a few seconds to minutes to scan your website.');
                                //progressUpdate(res.status,"Active scan");
                                console.log('ascanStatus '+ res.status);
                            }else if(res.status==100){
                                showScanning('Active scan... 100%','It takes a few seconds to minutes to scan your website.');
                                finishedDelay(500,'Active scan').then(() => {
                                    $('#scanningmessage').css('display','none');
                                    showMessage('Scan task has finished successfully.','You can downlaod report below','successful');
                                    //$('.ui.tiny.modal').modal('hide');                  
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
    function updateHtml(){
        $.ajax({
                url: '/updateHtml',
                type: 'GET',
        }).done(function(){
            console.log("updateHtml success")
        }).fail(function(){
            console.log("updateHtml error")
        });  
           
        
    }
    function finishStatus(){
        $.ajax({
                url: '/finishStatus',
                type: 'GET',
        }).done(function(){
            console.log("finishStatus success")
        }).fail(function(){
            console.log("finishStatus error")
        });   
    }
    
    function showMessage(msg,submsg,type){
        if(type == 'successful'){
            $('#message').addClass('positive');
            $('#message').removeClass('negative');
        }else if(type == 'negative'){
            $('#message').addClass('negative');
            $('#message').removeClass('positive');
        }

        $('#msg').text(msg);
        $('#submsg').text(submsg);
        $('#message').css('display','block');
        
    }
    function showScanning(msg,submsg){
        $('#scanningMsg').text(msg);
        $('#scanningSubmsg').text(submsg);
        
    }
    
    function showDelay(ms) {
        $('#scanningmessage').css('display','none');
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    function finishedDelay(ms,scantype) {
        checkStop();
        $('#startScan').removeClass('disabled');
        $('#cancelButton').addClass('disabled');
        updateHtml();
        finishStatus();
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    $('#cancelButton').click(function(){

        $(this).addClass('disabled');
        cancelScan();
        
        showMessage('Scan has been stopped','You can still dowload the report below.');
    });
    /*
    $('#startScan').click(function(){
        $(this).addClass('disabled');
        clearInterval(checkAnyScanTimer);
        var ssoUrl = getCookie('SSO_URL');
        $.ajax({
        url: ssoUrl + '/v2.0/users/me',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        }
        }).done(function (user) {
            astart = 0
            var scanOption=$("#scanOption").val();
            $('#cancelButton').removeClass('disabled');

            
            
            deleteData().done(function(){    
                spiderScanStart().done(function(){
                    $('#message').css('display','none');
                    $('#scanningmessage').css('display','block');
                    showScanning('Passive scan... 0%','It takes a few seconds to minutes to scan your website.');
                    console.log('Hello! ' + user.lastName + ' ' + user.firstName + ', you call /spiderScan');
                    //start timer
                    intervalNum = setInterval(function(){ checkScan(scanOption) }, 1000);
                    //alert('Start a  scan\n Set id in cookie!');
                    addScan(scanOption).done(function(){
                        refreshTable().done(function(response){
                            while (Data.length > 0) Data.pop();
                            while (response.length > 0) Data.push(response.shift());
                            $.ajax({
                                url: '/dashboardLink',
                                type: 'GET'
                            }).done(function(res){
                                window.open(res);
                            }).fail(function(){
                                console.log('/dashboardLInk fail');
                            });
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
    
    */
    
    
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


