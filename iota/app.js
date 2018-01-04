
var globData = {
	'seed':'',
	'plainaddr': '',
	'requri': ''
};

var gd_enc = {
	'pwhash':'',
	'gd_encoded': ''
};

var loginStatus = {
	'seedok': false,
	'cookieset': false,		/* cookie is set and data in globData is ok  */
	'currdiv': '#divLogin',
	'lastdiv': '#divLogin',
	'outpending': false
};

var scantofield = '#txtSendAddr';
var provider;

/* SETTINGS */
var depth = 100; 
var minWeightMagnitude = 14;

var setProviderCookie = function()
{
	if($('#selectNode').val() == 'custom')
	{
		provider = $('#txtCustomNode').val();
	}else{
		provider = $('#selectNode').val();
	}
	
	/* alert("Provider reset." + $.cookie('provurl') + '-->' + provider);  */
	$.cookie('provurl', provider);
}

var initIota = function()
{
/* iota = new IOTA({'provider': 'http://iotastyria.ddns.net:14265'});	*/

	if($.cookie('provurl'))
	{
		provider = $.cookie('provurl');
	}else{
		console.log("new provider cookie.");
		setProviderCookie();
	}

	if(iota)
		delete iota;

  	iota = new IOTA({'provider': provider});
	console.log("connecting to host " + provider);

	iota.api.getNodeInfo(function(error, success) {
		if (error) 
		{
			console.log("getNodeInfo failed. Connecting to local node.");
			$('#pConStat').html(provider + "<br>Was NOT able to connect.");
		    iota = new IOTA({'provider': 'http://localhost:14265'});
		}else{
			console.log("getNodeInfo success.");
			$('#pConStat').html(provider + "<br>Connected.<br>" + success.appName + " " + success.appVersion + 
			"<br>LatestMilestoneIndex: " + success.latestMilestoneIndex + "<br>latestSolidSubtangleMilestoneIndex: " + success.latestSolidSubtangleMilestoneIndex);
		}
	});
}

var setEnableScrolling = function(tf)
{ 
	try
	{
		if(tf){
			BridgeCommander.call("enableScrolling", "")
			.then(function(result) { console.log(result); })
			.catch(function(error) { console.log(error); }); 
		}else{
			BridgeCommander.call("disableScrolling", "")
			.then(function(result) { console.log(result); })
			.catch(function(error) { console.log(error); }); 
		}
	}catch(e)
	{
		console.log("IOS BridgeCommander not available!");
	}
}

var scanfile = function(id, callback){		/* id without # !*/
	console.log("scanfile();");
	var file = document.getElementById(id).files[0];
	var fr = new FileReader();

	fr.addEventListener("load", function () {
		qrcode.callback = callback;
		qrcode.decode(fr.result);
	}, false);

	if (file) {
		fr.readAsDataURL(file);
	}
}

var setEncWallet = function(data)
{
	try
	{
	  	JSON.parse(data);
		$.cookie("globData", data, { expires: 90 }); 
	}
	catch(e)
	{
	  	alert('ERROR: Invalid Code or cannot read QR-Code.');
		return false;
	}
	return true;
}

var globDataEnc = function(key)
{
	console.log("globDataEnc();");
	globData.seed = seed;
	gd_enc.pwhash = CryptoJS.MD5(key).toString();
	gd_enc.gd_encoded = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(globData.seed), key).toString(); 

	$.cookie("globData", JSON.stringify(gd_enc), { expires: 90 }); 	
	loginStatus.cookieset = true;
};

var globDataDec = function(key)
{
	console.log("globDataDec();");
	gd_enc = JSON.parse($.cookie("globData"));
	if(gd_enc.pwhash == CryptoJS.MD5(key).toString())
	{
		globData.seed = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(gd_enc.gd_encoded, key));
		$.cookie("globData", JSON.stringify(gd_enc), { expires: 90 }); 		/*  UPDATE COOKIE  */
		loginStatus.cookieset = true;
	}else{
		alert("Wrong password.");	
		return false;
	}

	/* write often used global variables */
	seed = globData.seed;
	return true;
};

var toggleMenu = function()
{
	if($('#divMainMenu').css('width') == '0px'){
		$('#divMainMenu').css("width","100%");
		$('#btnMainMenu').css("transform","rotate(90deg)");	
		
		/* select which buttons to show */
		$('#btnRefreshBalance').css('display', 'none');
		$('#btnShowSeed').css('display', 'none');
		$('#btnShowBackupPage').css('display', 'none');
		$('#btnHome').css('display', 'none');
		$('#btnShowTxList').css('display', 'none');	
		$('#btnLogout').css('display', 'none');
		
		if(loginStatus.seedok){
			$('#btnRefreshBalance').css('display', '');
			$('#btnShowSeed').css('display', '');
			$('#btnHome').css('display', '');
			$('#btnShowTxList').css('display', '');
			$('#btnLogout').css('display', '');
		}
		if(loginStatus.cookieset){
			$('#btnShowBackupPage').css('display', '');
		}
	
	}else{
		$('#divMainMenu').css("width","0px");
		$('#btnMainMenu').css("transform","");
	}
}

var showLastTab = function()
{
	showTab(loginStatus.lastdiv);
}

var showTab = function(strTabId)
{
	console.log("showTab();");

	var enscrol = false;
	if(loginStatus.lastdiv != loginStatus.currdiv){
		loginStatus.lastdiv = loginStatus.currdiv;
	}
	loginStatus.currdiv = strTabId;

	$('#divLogin').css("display","none");
	$('#divSafeLogin').css("display","none");
	$('#divLoginLoading').css("display","none");
	$('#divSend').css("display","none");
	$('#divReceive').css("display","none");
	$('#divMain').css("display","none");	
	$('#divLoginPw').css("display","none");	
	$('#divShowSeed').css("display","none");	
	$('#divAbout').css("display","none");
	$('#divTx').css("display","none");	
	$('#divNodeInfo').css("display","none");

	$(strTabId).css("display","");
	
	/* INIT values */
	switch(strTabId)
	{
		case '#divLoginPw':
			$('#logInPw').html("");
		case '#divLogin':	/* NO BREAK */
			$('#balance').html("myiota v0.1");
			break;

		case '#divSafeLogin':
			checkpw();
			$('#seedpw1').attr("disabled", false);
			$('#seedpw2').attr("disabled", false);
			$('#seedpw1').val("");
			$('#seedpw2').val("");
			break;

		case '#divShowSeed':
			$('#qrseed').empty();
			$("#qrseed").qrcode(JSON.stringify(gd_enc));
			break;

		case '#divTx':
		case '#divAbout':
			enscrol = true;
			break;

		default:
			break;
	}
	setEnableScrolling(enscrol);
}

var askSafeSeed = function()
{
	console.log("askSafeSeed();");
	seed = $('#txtSeed').val();

	if(iota.valid.isTrytes(seed, 81))
	{
		loginStatus.seedok = true;
		showTab('#divSafeLogin');
	}
	else
	{
		alert("Your seed is not a valid 81 Tryte seed!");
	}
}

var checkpw = function()
{
	if($('#seedpw1').val().length > 0 && $('#seedpw1').val() == $('#seedpw2').val())
	{
		$('#btnEncSeed').attr("disabled", false);
	}else{
		$('#btnEncSeed').attr("disabled", true);
		$('#aDownloadSeed').attr("href", "javascript:;");
		$('#aDownloadSeed').css("color", "#83d2fc");
		$('#btnSetSeedContinue').attr("disabled", true);
	}
}

var encSeed = function()
{
	if($('#seedpw1').val().length > 0 && $('#seedpw1').val() == $('#seedpw2').val())
	{
		$('#seedpw1').attr("disabled", true);
		$('#seedpw2').attr("disabled", true);
		$('#btnEncSeed').attr("disabled", true);
		
		globDataEnc($('#seedpw1').val());
		$('#btnSetSeedContinue').attr("disabled", false);
	}else{
		alert("ERROR: You have entered a incorrect password!");
	}
}

var reqLogin = function()
{
	console.log("reqLogin();");
	showTab('#divLoginLoading');
	
	setTimeout(login, 100);
}

var getNewSeed = function()
{
	console.log("getNewSeed();");

	var allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";
	var array = new Uint32Array(81);
	window.crypto.getRandomValues(array);
	
	var seed = Array();
	for(i = 0; i < 81; i++)
	{
		seed[i] = allowed.charAt(array[i] % 27);
	}
	return seed.join("");
}

var login = function()
{
	console.log("login();");
	if(iota.valid.isTrytes(seed, 81))
	{
		loginStatus.seedok = true;
		getBalance();
	/*	getAddr(); */
		showTab('#divMain');
		return true;
	}else{
		return false;
	}
}

var logout = function()
{
	console.log("logout();");
	if(loginStatus.cookieset == false || confirm("Are you sure you want to log out at this device? This will DELETE YOUR SEED! You will have to log in with your seed or the encrypted wallet QR-code to regain access to your funds!"))
	{
		loginStatus.seedok = false;
		loginStatus.cookieset = false;
		$.removeCookie('globData');
		seed = "";
		$('#txtSeed').val("");
		showTab('#divLogin');
	}
}

var showSend = function()
{
	console.log("showSend();");
	showTab('#divSend');
}

var showReceive = function()
{
	console.log("showReceive();");
	showTab('#divReceive');
}

/* Close Send menu */
var showMain = function()
{
	console.log("showMain();");
	showTab('#divMain');
}
/*
var getAddr = function()
{
	// TODO: Add manual setting for start/end index 
	iota.api.getNewAddress(seed, showAddr);
}

var showAddr = function(error, success)
{
	console.log("showAddr(e,s);");
	if(error)
	{
		alert("ERROR: " + error);
		return;
	}
	globData.plainaddr = iota.utils.addChecksum(success, 9, true);
	globData.requri = "iota:" + globData.plainaddr;
	$('#currUnusedAddr').html(globData.plainaddr);
	$('#qrRecieve').empty();
	$('#qrRecieve').qrcode(globData.requri);
}
*/
var getBalance = function(silent = false)
{
	console.log("getBalance(silent = false);");
	/* TODO: Add manual setting for start/end index */
	if(!silent)
	{
		$('#balance').html("loading...");
		$('#divTxList').html("loading...");
	}
	iota.api.getAccountData(seed, showBalance);
}

var showBalance = function(error, success)
{
	console.log("showBalance(e,s);");

	if(error)
	{
		alert(error);
		return false;
	}

	console.log(success);

	globData.plainaddr = iota.utils.addChecksum(success.latestAddress, 9, true);
	globData.requri = "{\"address\":\"" + globData.plainaddr + "\",\"amount\":\"\",\"message\":\"\",\"tag\":\"\"}";
	$('#currUnusedAddr').html(globData.plainaddr);
	$('#qrRecieve').empty();
	$('#qrRecieve').qrcode(globData.requri);

	if(error)
	{
		alert("ERROR: " + error);
		return;
	}
	
	$('#balance').html(getBalanceString(success.balance));

	addresses = success.addresses;
	transfers = success.transfers;

	var txlist = Array();
	var txlistinx = 0;
	var addr_self = Array();
	var addr_other = Array();

	// transfers.forEach(function(bundle);
	loginStatus.outpending = false;
	while(transfers.length > 0)
	{
		var bundle = transfers[0];
		var bundleVal = 0;
		addr_self = [];
		addr_other = [];

		for(j = 0, jlen = bundle.length; j < jlen; j++)
		{
			var tx = bundle[j];
			var ts = new Date(tx.timestamp * 1000);
			var strtime = ts.toDateString();
			if((index = addresses.indexOf(tx.address)) >= 0)
			{
				bundleVal += tx.value;
				addr_self.push(tx.address);
			}else{
				addr_other.push(tx.address);		
			}
		}

		reattaches = getReattaches(transfers, bundle);
		transfers = reattaches.transfers;  
		txlist[txlistinx++] = {	'type': (bundleVal < 0) ? 'output':'input', 
								'value': Math.abs(bundleVal),
								'address': (bundleVal < 0) ? addr_other : addr_self,
								'tx0hash': bundle[0].hash,
								'confirmed': reattaches.bconf,
								'reattaches':  reattaches.rcnt,
								'timestamp': strtime };

		loginStatus.outpending = (bundleVal < 0 && reattaches.bconf == 'unconf') ? true : loginStatus.outpending;
	}

	var txliststr = "";
	if(txlist.length > 0)
	{
		var onclick;
		for(i = txlist.length - 1; i >= 0; i--){
			if(txlist[i].confirmed == 'conf')
			{
				onclick = "alert('"+txlist[i].value+"i to "+txlist[i].address+"');";
			}else{
				onclick = "if(confirm('"+txlist[i].value+"i to "+txlist[i].address+" - Do you want to reattach this transaction to the tangle?')){ reattach('"+txlist[i].tx0hash+"'); };";
			}

			txliststr += "<div class='txList' onclick=\""+onclick+"\"><span class='txListType"+txlist[i].type+"'>["+txlist[i].type+"]</span> <span class='txListValue'>"+txlist[i].value+"i</span><br><span class='txList"+txlist[i].confirmed+"'>"+txlist[i].confirmed+".</span> <span class='txListDate'>"+txlist[i].timestamp+"</span> ("+txlist[i].reattaches+" reatt.)</div>";
		}
	}else{
		txliststr = "NO TRANSACTIONS FOUND";
	}

	$('#divTxList').html(txliststr);
	$('#warnOutputPending').css('display', loginStatus.outpending ? '':'none');
	
	console.log(txlist);
}

var sendTx = function()
{
	console.log("sendTx();");
	
	if(!loginStatus.outpending)
	{
		var amount = Number($('#valToSend').val());
		var unit = $('#sendSelectUnit').val();
		var toAddr = $('#txtSendAddr').val();

		amount = iota.utils.convertUnits(amount, unit, 'i');	

		if(toAddr == "" || !iota.valid.isAddress(toAddr))
		{
			alert("The address you entered is not correct!");
			return;
		}

		if (confirm('Are you sure you want to send ' + amount + 'i to Address ' + toAddr + '?')) 
		{
			transfers = [{'address': toAddr, 'value': amount, 'message':'', 'tag':'WWWMGAMESCC'}]; 
			iota.api.sendTransfer(seed, depth, minWeightMagnitude, transfers, txSent);
			alert("Server is taking care of attaching your Transaction. Please be patient.");
			showMain();
		}
	}else{
		alert("Double spend detected! Please wait until all pending transactions are confirmed. Try to reattach and refresh balance!");
	}
}

var getReattaches = function(transfers, bundle)
{
	console.log("getReattaches(transactions);");
	var rcnt = 0;
	var bundleConfirmed = false;
	
	for(i = 0, len = transfers.length; i < len; i++)
	{
		if(transfers[i].length == bundle.length)
		{
			var issame = true;
			for(j = 0, blen = bundle.length; j < blen; j++)
			{
				if(transfers[i][j].value != bundle[j].value || transfers[i][j].address != bundle[j].address)
				{
					issame = false;
				}
			}
			if(issame)
			{
				bundleConfirmed = transfers[i][0].persistence ? true : bundleConfirmed;
				transfers.splice(i, 1);  
				len--;  
				i--;
				rcnt++;
			}
		}
	}

	rcnt--;	 	/* Do not count bundle  */
	return {'transfers': transfers, 'rcnt': rcnt, 'bconf': bundleConfirmed?'conf':'unconf'};
}

var txSent = function(error, success)
{
	console.log("txSent(e,s);");

	if(error)
		alert("ERROR: " + error);
	else
		alert("Successfully attached transaction to Tangle.");
}

var reattach = function(tx0hash)
{
	iota.api.replayBundle(tx0hash, depth, minWeightMagnitude, function(error, success){
	if(error){
		alert(error);
	}else{
		alert("Successfully reattached transaction to tangle.");
	}
	});
	alert("The iota node will do the POW and reattach your transaction to the tangle. Please be patient.");
}


var checkscaninput = function() 
{ 
	if($('#txtToAddr').val() != "")
	{ 
		var qdata = $('#txtToAddr').val();
		$('#txtToAddr').val(''); 
		
		if(scantofield == '#txtSendAddr')
		{
			var addr = "";
			var info = {'amount':0, 'message':'', 'label':'', 'extra':''};

			try
			{
				if(qdata.substr(0, 5) == "iota:")	/* iota uri  */
				{		
					qdata = qdata.split(":")[1];
					qdata = qdata.split("?");
					addr = qdata[0];
					if(qdata.length > 1)
					{
						qdata = qdata[1].split("&");
						for(i = 0; i < qdata.length; i++)
						{
							dpair = qdata[i].split("=");
							switch(dpair[0])
							{
								case 'amount':
									info.amount = Number(dpair[1]);
									break;
								case 'message':
									info.message = dpair[1];
									break;
								case 'label':
									info.label = dpair[1];
									break;
								case 'extra':
									info.extra = dpair[1];
									break;
								default:
									alert("Unknown uri option " + dpair[0]);
									break;
							}
						}
					}	
				}else if(isJsonObject(qdata) != false){
					obj = isJsonObject(qdata);
					if(obj.address) { addr = obj.address; }
					if(obj.amount) { info.amount = obj.amount; }
					if(obj.message) { info.message = obj.message; }
					if(obj.tag) { info.label = obj.tag; }
				}else{		// take input as plain iota address
					addr = qdata;
				}

				if(iota.valid.isAddress(addr))
				{
					$('#txtSendAddr').val(addr); 
					if(info.amount > 0){ $('#valToSend').val(info.amount); }
				}else{
					$('#txtSendAddr').val(''); 
					$('#valToSend').val('0');
					alert("Invalid QR Code/Address!");				
				}
			}catch(e){
				alert(e);		
			}
		}else if(scantofield == '#txtSeed'){		/* SCAN Seed or encrypted wallet  */
			var dataType = 1;
			try
			{
				JSON.parse(qdata);
				if(setEncWallet(qdata)) { 
					showTab('#divLoginPw'); 
				}
			}catch(e){
				dataType = 0;
			}
			if(dataType == 0)	/* Import unencrypted seed  */
			{
				$('#txtSeed').val(qdata);
			}
		}
	}
}

var restoreWallet = function()
{ 
	if(confirm('Scan QR code using phones camera? (Cancel to use file input)'))
	{  
		scantofield = '#txtSeed';
		BridgeCommander.call("scanQR", "")
        	.then(function(result) { console.log(result); })
        	.catch(function(error) { console.log(error); }); 
	}else{
		$('#fileEncWalletQr').trigger('click'); 
	}
}

var getBalanceString = function(balance)
{
	var toUnit;
	balance = Number(balance);

	if(balance < 1000){
		toUnit = 'i';
	}else if(balance < 1000000){
		toUnit = 'Ki';
	}else if(balance < 1000000000){
		toUnit = 'Mi';
	}else if(balance < 1000000000000){
		toUnit = 'Gi';
	}else if(balance < 1000000000000000){
		toUnit = 'Ti';
	}else{
		toUnit = 'Pi';
	}
	
	return iota.utils.convertUnits(balance, 'i', toUnit) + toUnit;
}

var isJsonObject = function(string)
{
	var obj;
	try
	{
		obj = JSON.parse(string);
	}catch(e){
		return false;	
	}

	return obj;
}

/*
var getDollarValue = function()
{
	$.ajax({
	  method: "GET",
	  url: "https://api.bitfinex.com/v1/pubticker/iotusd",
	  dataType: "json",
	  success:function() {
                alert("ExRage IOTUSD: " + success.bid);
            },
	  error: function() {
				alert("ERROR");
		}
	});
}

*/




