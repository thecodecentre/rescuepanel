var socket = io.connect();

function getAccount() {
	socket.emit('getAccountRequest',"");
}

function getHierarchy() {
	socket.emit('getHierarchyRequest',"");
}

function getReportByChannel() {
	var nid = $('#nodeID').val();
	var bdate = $('#bdate').val();
	var edate = $('#edate').val();
	var params = {"id":nid,"bdate":bdate,"edate":edate};
	socket.emit('getReportByChannelRequest',params);
}

function getReportByNode() {
	var nid = $('#nodeID').val();
	var bdate = $('#bdate').val();
	var edate = $('#edate').val();
	var params = {"id":nid,"bdate":bdate,"edate":edate};
	socket.emit('getReportByNodeRequest',params);
}

function showNodeForm(id) {
	var nid,bdate,edate,params;
	if(id == 1)
		$('#report').on("click",function() {
			getReportByChannel();
		});
	else
		$('#report').on("click",function() {
			nid = $('#nodeID').val();
			bdate = $('#bdate').val();
			edate = $('#edate').val();
			params = {"nid":nid,"bdate":bdate,"edate":edate};
			console.log("report clicked. ID:"+nid);
			socket.emit('getReportByNodeRequest',params);			
		});
	$('#nodeid').show(500);
	$("#signinform").hide();
}

$(document).ready(function() {
	
	$('#nodeid').hide();
	$("#signinform").hide();
	
	checkSignedIn();
	
	$('#signinform').submit(function(event) {
		event.preventDefault();
		var name = $('#username').val();
		var pwd = $('#password').val();
		signin(name,pwd);
	});
	
	socket.on('errorResponse', function(data){
		$("#error").text(data);
	});
	socket.on('goodResponse', function(data){
		$("#message1").html(data);
	});
	socket.on('signinResponse', function(data) {
		saveCookie("username", data.name, 1);	// save as cookie for 1 day
		saveCookie("password", data.pwd, 1);
		$('#error').text("");
		$('#myname').text(data.name);
		$("#signinform").hide();
		console.log("Successfully signed in");
	});	
	// this returns an array of Cuser objects
	socket.on('getHierarchyResponse',function(data){
		var str="<table><tr><td>NodeID</td><td>Name</td><td>Group</td></tr>";
		console.log("Array size: "+data.length);
		for(var i in data)
		{
			str += "<tr><td>"+data[i].nodeID+"</td>";
			str += "<td>"+data[i].name+"</td>";
			str += "<td>"+data[i].type+"</td></tr>";
		}
		str += 	"</table>";	
		$("#message1").html(str);
	});
	
	socket.on('getReportByChannelResponse', function(data){		// this returns an array of objects
		$("#message1").text("");
		var report = "<table><tr><td>Session</td><td>Name</td><td>Department</td><td>Start</td><td>End</td><td>Incident</td><td>Resolved</td><td>Response</td>";
		for(var i in data)
		{
			report += "<tr>";
			report += "<td>"+data[i].sessionID+"</td>";
			report += "<td>"+data[i].name+"</td>";
			report += "<td>"+data[i].department+"</td>";
			report += "<td>"+data[i].start+"</td>";
			report += "<td>"+data[i].end+"</td>";
			report += "<td>"+data[i].incident+"</td>";
			report += "<td>"+data[i].resolved+"</td>";
			report += "<td>"+data[i].response+"</td>";
			report += "</tr>";
		}
		report += "</table>";
		$("#message1").html(report);
	});

});

function loginForm() {
str = '<div class="form-horizontal col-xs-9 col-xs-offset-3">' +
	'<form id="signinform">'+
		'<div class="form-group">'+
			'<label class="control-label col-xs-2">Username:</label>'+
			'<div class="col-xs-3">'+
				'<input class="form-control" id="username" type="text"></input>'+
			'</div>'+
		'</div>'+
		'<div class="form-group">'+
			'<label class="control-label col-xs-2">Password:</label>'+
			'<div class="col-xs-3">'+
				'<input class="form-control" id="password" type="password"></input>'+
			'</div>'+
			'<div class="col-xs-3">'+
				'<input class="btn btn-primary" type="submit" value="Sign In"></input>'+
			'</div>'+
		'</div>'+
	'</form>'+
'</div>';

document.write(str);
}

function showLoginForm()
{
	$("#signinform").show(500);
	$('#nodeid').hide();
}

function checkSignedIn()
{
	var name = readCookie("username");
	var pwd = readCookie("password");
//	console.log("User cookie: "+name+" and pwd "+pwd);
	if(name == null || pwd == null)
	{
		$('#myname').text("Log Me In");
		$("#signinform").show();
	}
	else
	{
		signin(name,pwd);
	}
}

function signin(uname, pwd) {
	var data = new Object();
	data = {name: uname,pwd: pwd};
//	console.log("Data object: "+data.name+" and "+data.pwd);
	socket.emit('signinRequest', data);
}

function readCookie(name)
{
  name += '=';
  var parts = document.cookie.split(/;\s*/);
  for (var i = 0; i < parts.length; i++)
  {
    var part = parts[i];
    if (part.indexOf(name) == 0)
      return part.substring(name.length);
  }
  return null;
}

/*
 * Saves a cookie for delay time. If delay is blank then no expiry.
 * If delay is less than 100 then assumes it is days
 * otherwise assume it is in seconds
 */
function saveCookie(name, value, delay)
{
  var date, expires;
  if(delay)
  {
	  if(delay < 100)	// in days
		  delay = delay*24*60*60*1000;	// convert days to milliseconds
	  else
		  delay = delay*1000;	// seconds to milliseconds

	  date = new Date();
	  date.setTime(date.getTime()+delay);	// delay must be in seconds
	  expires = "; expires=" + date.toGMTString();		// convert unix date to string
  }
  else
	  expires = "";

  document.cookie = name+"="+value+expires+"; path=/";
}
