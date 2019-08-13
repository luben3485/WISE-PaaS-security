$(document).ready(function(){
    var checkAnyScanTimer;
    var intervalNum;
    var passiveScanTimer;
    var activeScanTimer;
	var message;
    var myUrl = window.location.protocol + '//' + window.location.hostname;
    var hostname = window.location.hostname;
    var domainName = hostname.substr(hostname.indexOf("."));
    var ssoUrl = 'https://portal-sso' + domainName;
    var timerStart = 0;
    //set cookies
    document.cookie="appUrl="+myUrl+";domain="+domainName+"; path=/";
    document.cookie="SSO_URL="+ssoUrl+";domain="+domainName+"; path=/";
    $('#timepicker').calendar();
    
    //animation setting
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
    
    //initial
    $.ajax({
        url: ssoUrl + '/v2.0/users/me',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        }
    }).done(function (user) {
        
        //refresh table
        refreshTable().done(function(response){
            while (Data.length > 0) Data.pop();
            while (response.length > 0) Data.push(response.shift());
            console.log("refresh table successfully");
        }).fail(function(){
            console.log("refresh table fail") 
        });
        
        
        refreshScheduleTable().done(function(response){
            while (schedule.length > 0) schedule.pop();
            while (response.length > 0) schedule.push(response.shift());
            console.log("refresh  schedule table successfully");
        }).fail(function(){
            console.log("refresh schedule table fail") 
        });
        
        checkUserScan();
        //var checkUserScanTimer = setInterval(function(){ checkUserScan() }, 1000);
                
        console.log('Hello! ' + user.lastName + ' ' + user.firstName);
    }).fail(function () {
        //window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
    });        
    
    function isValidDate(date) {
        return date instanceof Date && !isNaN(date.getTime())
    }
    autoRefreshTableTimer = setInterval(function(){ autoRefreshTable() }, 10000);
    function autoRefreshTable(){
        /*
        console.log($('input[name="date"]').val());
        time = 'August 5, 2019 5:22 PM'
        var date = new Date(time);
        console.log(date)
        console.log(Math.floor(date.getTime()/1000));
        console.log(isValidDate(date));
        */
        refreshTable().done(function(response){
            console.log(response.length)
            while (Data.length > 0) Data.pop();
            while (response.length > 0) Data.push(response.shift());
            console.log("refresh table successfully");
        }).fail(function(){
            console.log('refreshTable error')
        });
        
        refreshScheduleTable().done(function(response){
            while (schedule.length > 0) schedule.pop();
            while (response.length > 0) schedule.push(response.shift());
            console.log("refresh  schedule table successfully");
        }).fail(function(){
            console.log("refresh schedule table fail") 
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
    

    
    function checkUserScan(){
        $.ajax({
            url: '/checkUserScan',
            method: 'GET'    
            }).done(function (res){
                if(res.Result == 'NOSCAN'){
                    $('#startScan').removeClass('disabled');
                    $('#cancelButton').addClass('disabled');
                    $('#scanningmessage').css('display','none');
                    //$('#message').css('display','none');
                    console.log("NOSCAN");
                }else if(res.Result == 'SCANNING'){
                    $('#startScan').addClass('disabled');
                    $('#cancelButton').removeClass('disabled');
                    if(res.scanOption == '0' && timerStart == 0){
                        checkPassiveScan();
                        //passiveScanTimer = setInterval(function(){ checkPassiveScan() }, 1000);
                        timerStart = 1;
                    }else if(res.scanOption == '2' && timerStart == 0){
                        checkActiveScan();
                        //activeScanTimer = setInterval(function(){ checkActiveScan() }, 1000);
                        timerStart = 1;
                    }
                    console.log("SCANNING");
                }else if(res.Result == 'NEEDWAITING'){
                     //showScanning('Other scan task is running.','Your scan task will be scheduled to start autoly later.')
                    if(timerStart == 0){
                        //waitScan(res.scanOption);
                        timerStart = 1;
                    }
                    console.log("NEEDWAITING");
                    
                }
                
            }).fail(function(){
                console.log("check user scan table fail") 
            });
        
    }
    
    
    function clearAllTimer() {
        var highestTimeoutId = setTimeout(";");
        for (var i = 0 ; i < highestTimeoutId ; i++) {
            clearTimeout(i); 
        }
    };
    
    function cancelScan(){
            clearAllTimer();
            autoRefreshTableTimer = setInterval(function(){ autoRefreshTable() }, 10000);
            timerStart = 0;
            //checkUserScan();
            //var checkUserScanTimer = setInterval(function(){ checkUserScan() }, 5000);
        
            $.ajax({
                url: '/waitScan',
                type: 'GET'
            }).done(function(res){
                if(res.Result == 'SCANNING'){
                    $.ajax({
                        url: '/cancelStartScan',
                        type: 'GET',
                        error: function(xhr) {
                            console.log('Ajax /cancelStartScan error');
                        },
                        success: function(response) {
                            console.log('cancelStartScan '+response.Result)    
                        }
                    });
                    $('#scanningmessage').css('display','none');
                    showMessage('You have stopped the scan.','You can still downlaod report below','negative');
                    /*showDelay(100).then(() => {
                        showMessage('You have stopped the scan.','You can still downlaod report below','negative');
                    });*/
                    
                }else if(res.Result == 'NEEDWAITING'){
                    $.ajax({
                        url: '/cancelNotStartScan',
                        type: 'GET',
                        error: function(xhr) {
                            console.log('Ajax /cancelNotStartScan error');
                        },
                        success: function(response) {
                            console.log('cancelNotStartScan '+response.Result)    
                        }
                    });
                    
                    $('#scanningmessage').css('display','none');
                     showMessage('You have stopped the scan.','you can still add scan task.','negative');
                }
            }).fail(function(){
                console.log('/waitScan fail on cancelScan')
            }); 
        

            
  
            
  
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
    function waitScan(scanOption){
        window.setTimeout(function(){
            $.ajax({
                url: '/waitScan',
                type: 'GET'
            }).done(function(res){
                if(res.Result == 'SCANNING'){
                    if(scanOption == '1')
                        checkPassiveScan();
                    else if(scanOption == '2')
                        checkActiveScan();
                }else if(res.Result == 'NEEDWAITING'){
                    waitScan();
                }
            });
        },1000);
    }
    

    /*passive scan begin*/
    function Scan(targetURL,arecurse,inScopeOnly,alertThreshold,attackStrength,scanOption,precurse,subtreeOnly,timeStamp,period){
        $.ajax({
            url: '/Scan',
            type: 'GET',
            data:{
                'targetURL': targetURL,
                'scanOption':scanOption,
                'arecurse': arecurse,
                'inScopeOnly':inScopeOnly,
                'alertThreshold':alertThreshold,
                'attackStrength':attackStrength,
                'precurse': precurse,
                'subtreeOnly':subtreeOnly,
                'timeStamp':timeStamp,
                'period':period
            }
        }).done(function(res){
                
                
                
                refreshTable().done(function(response){
                    while (Data.length > 0) Data.pop();
                    while (response.length > 0) Data.push(response.shift());
                    console.log("refresh table successfully");
                }).fail(function(){
                    console.log("refresh table fail") 
                });
            
                refreshScheduleTable().done(function(response){
                    while (schedule.length > 0) schedule.pop();
                    while (response.length > 0) schedule.push(response.shift());
                    console.log("refresh  schedule table successfully");
                }).fail(function(){
                    console.log("refresh schedule table fail") 
                });
            
                if(res.Result == 'SCANNING'){
                    $('#cancelButton').removeClass('disabled');
                    $('#startScan').addClass('disabled');
                    if(scanOption == '0'){
                        showScanning('Passive scan... 0%','It takes a few seconds to minutes to scan your website.');
                        console.log('/Scan SCANNING p');
                        
                        //start timer
                        checkPassiveScan();
                    }else if(scanOption == '2'){
                        showScanning('Active scan... 0%','It takes a few seconds to minutes to scan your website.');
                        console.log('/Scan SCANNING a');
                        
                        //start timer
                        checkActiveScan();
                    }
                    
                    //open dashboard link
                    $.ajax({
                        url: '/dashboardLink',
                        type: 'GET'
                    }).done(function(res){
                        window.open(res);
                    }).fail(function(){
                        console.log('/dashboardLInk fail');
                    });
                
                }else if(res.Result == 'NEEDWAITING'){
                    $('#startScan').removeClass('disabled');
                    $('#scanningmessage').css('display','none');
                    showMessage('Other scan task is running.','Your scan task will be scheduled to start autoly later.','negative')
                    $('#startScan').addClass('disabled');
                    console.log('NEEDWAITING');
                    //start timer
                    //waitScan(scanOption);
                }
                else if(res.Result == 'SCHEDULE'){
                    $('#startScan').removeClass('disabled');
                    $('#scanningmessage').css('display','none');
                    showMessage('Add scan to schedule successfully!','Scan will run autoly depending on your setting.','successful');
                }
            
        }).fail(function(){
             console.log('passsive scan error')
        });
        //showScanning('Initializing...','Please wait a moment.');
        
    }

    function checkPassiveScan(){
        window.setTimeout(function(){
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
                    checkPassiveScan();
                }else if(response.status==100){
                    showScanning('Passive scan... 100%','It takes a few seconds to minutes to scan your website.');
                    pscanFinish(100).then(() => {
                        //clearInterval(passiveScanTimer);
                        //clearInterval(activeScanTimer); 
                        showMessage('Scan task has finished successfully.','You can downlaod report below','successful');

                    });

                }
            }).fail(function(){
                console.log('Ajax /pscanStatus error from checkPassiveScan');
            });

        },1000);
        
    }
    function pscanFinish(ms) {
        timerStart = 0;
        $('#scanningmessage').css('display','none');
        $('#startScan').removeClass('disabled');
        $('#cancelButton').addClass('disabled');
        
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /*passive scan end */
    
    
    /*active scan begin*/
    function checkActiveScan(){
        window.setTimeout(function(){
            $.ajax({
                url: '/fullScanStatusDB',
                type: 'GET'
            }).done(function(response){
                if(response.status == -1){
                    //init
                    $('#startScan').removeClass('disabled');
                    $('#cancelButton').addClass('disabled');
                    $('#scanningmessage').css('display','none');
                    $('#message').css('display','none');
                }else if(response.status == 100 && response.scanType=='Active scan'){

                    showScanning('Active scan... 100%','It takes a few seconds to minutes to scan your website.');
                    ascanFinish(100).then(() => {
                        showMessage('Scan task has finished successfully.','You can downlaod report below','successful');

                    });

                }else{
                    showScanning(response.scanType+'... '+response.status+'%','It takes a few seconds to minutes to scan your website.');
                    console.log(response.scanType+' '+ response.status);
                    checkActiveScan();
                }
            }).fail(function(){
                console.log('Ajax /pscanStatus error from checkActiveScan');
            });
        },1000);
    }
    function ascanFinish(ms) {
        timerStart = 0;
        $('#scanningmessage').css('display','none');
        $('#startScan').removeClass('disabled');
        $('#cancelButton').addClass('disabled');
        
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /*active scan end*/
    
    //check URL
    function checkURL(URL){
        var str=URL;
        var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
        var objExp=new RegExp(Expression);
        if(objExp.test(str)==true){
            return true;
        }else{
            return false;
        }
    } 

    //startScan button
    $('#startScan').click(function(){
        EIToken_verification().done(function(){
            //clearInterval(checkAnyScanTimer);
            $('#startScan').addClass('disabled');
            var scanOption=$("#scanOption").val();
            $('#message').css('display','none');
            
             time = $('input[name="date"]').val()
            var date = new Date(time);
            var day =$("#period").val();
            var period = day*24*60*60;
            
                if(scanOption == 0){
                    var subtreeOnly;
                    var precurse;
                    var targetURL;
                    $("input[name=subtreeOnly]:checked").each(function () { subtreeOnly = $(this).val()});
                    $("input[name=passiveRecurse]:checked").each(function () { precurse = $(this).val()});
                    targetURL = $('input[name="input_url"]').val();
                    if(checkURL(targetURL)==true){
                        if(isValidDate(date)){
                            timeStamp = Math.floor(date.getTime()/1000);
                            Scan(targetURL,'','','','',scanOption,precurse,subtreeOnly,timeStamp,period);
                            $('#startScan').removeClass('disabled');
                            showMessage('Add scan to schedule successfully!','scan will run autoly depending on your setting.','successful');
                        }
                        else{
                            Scan(targetURL,'','','','',scanOption,precurse,subtreeOnly,'0','0');
                        }
                    }
                    else{
                        showMessage('Illegal URL format','Please input the URL once again.','negative');
                        $('#startScan').removeClass('disabled');
                    }
                }else if(scanOption == 2){
                    var arecurse;
                    var inScopeOnly;
                    var targetURL;
                    var alertThreshold;
                    var attackStrength;
                    var precurse;
                    var subtreeOnly;
                    $("input[name=alertThreshold]:checked").each(function () { alertThreshold = $(this).val()});
                    $("input[name=attackStrength]:checked").each(function () { attackStrength = $(this).val()});
                    $("input[name=activeRecurse]:checked").each(function () { arecurse = $(this).val()});
                    $("input[name=inScopeOnly]:checked").each(function () { inScopeOnly = $(this).val()});
                    targetURL = $('input[name="input_url"]').val();
                    $("input[name=subtreeOnly]:checked").each(function () { subtreeOnly = $(this).val()});
                    $("input[name=passiveRecurse]:checked").each(function () { precurse = $(this).val()}); 
                    if(checkURL(targetURL)==true){
                        if(isValidDate(date)){
                            timeStamp = Math.floor(date.getTime()/1000);
                            Scan(targetURL,arecurse,inScopeOnly,alertThreshold,attackStrength,scanOption,precurse,subtreeOnly,timeStamp,period);
                        }else{
                            Scan(targetURL,arecurse,inScopeOnly,alertThreshold,attackStrength,scanOption,precurse,subtreeOnly,'0','0');
                        }
                    }else{
                        showMessage('illegal URL format','Please input the URL once again.','negative');
                        $('#startScan').removeClass('disabled');
                    }
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
    function refreshScheduleTable(){
        //Delete all scan report before
        return $.ajax({
                url: '/refreshScheduleTable',
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
        $('#scanningmessage').css('display','block');
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
        EIToken_verification().done(function(){
            $('#cancelButton').addClass('disabled');
            $('#startScan').removeClass('disabled');
            $('#scanningmessage').css('display','none');
            cancelScan();
            
            
        }).fail(function(){
            window.location.href = ssoUrl + '/web/signIn.html?redirectUri=' + myUrl;
        });
        
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


