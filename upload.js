// hide "Stop Transfer", "Clear All", "Send" buttons at first opportunity
document.getElementById("submitUploadBtn").style.display = "none";
document.getElementById("cancelBtn").style.display = "none";
document.getElementById("clearAllBtn").style.display = "none";

// parameters passed in
var an = "app_name";
//var redirect_url; // application hosted redirect url support

// Create a YUI instance and load appropriate modules
YUI({
    base: '../../../../build/',
    lang: 'en',
    filter: 'raw',
    debug: true,
    useBrowserConsole: true
}).use('console', 'io-base', 'node', 'uploader', 'uploader-html5', function(Y) {


function clearFile(position) {
	// this function will remove a specific file ID from the file list array by position
	// TO:DO remove POST variable array element and redim
	//postVars = [];
	// declare an array for the temporary (working) file list
	fileList = [];
	// get the file list from the uploader
	fileList = myuploader.get("fileList", fileList);
	// delete the selected file from the array
	fileList.splice(position, 1);
	// set file list back
	myuploader.set("fileList", fileList);
	// redraw new file list
	drawFileList();
	// remove "Clear All" button
	if (fileList.length < 1) {
		document.getElementById("clearAllButton").style.display = "none";
		document.getElementById("clearAllBtn").style.display = "none";	
	}
}

function clearFileList() {
	// hide "Clear All" and "Send" button
	document.getElementById("clearAllButton").style.display = "none";
	document.getElementById("clearAllBtn").style.display = "none";
	document.getElementById("submitUploadBtn").style.display = "none";

	// clear file list output
	out.setContent("");
	// clear POST variables array
	postVars = [];
	// clear file list array
	fileList = [];
	// clear file list
	myuploader.set("fileList", fileList);
	// allow time for file list to clear
	setTimeout(1000);
};

function drawFileList() {
	// clear POST variables array
	postVars = [];
	var showClearAll = false;
	
	// clear file list output
	out.setContent([
		'<table ID=UploadPageSelf width=100% border=0 cellspacing=0 cellpadding=0>', 
			'<tr>', 
				'<td>', 
					'<br />', 
				'</td>', 
			'</tr>', 
			'<tr>', 
				'<td>'
	].join(''));
	
	
	Y.each(myuploader.get("fileList"), function (value, fileNum) {
		var fileId = value.get("id");
		var fileName = value.get("name");
		var fileSize = Math.floor(value.get("size") / 1024);
		out.append([
					'<div class=fileNum id=File', fileId, '>',
						'<label for=file>File', (fileNum + 1), ':</label></div>',
						'<div class=fileName>', fileName, '</div>&nbsp;', 
				'</td>', 
				'<td width=50%>',
					'<a href=# class=clearLink id=', fileNum, '>Clear</a>',
					'<div class=fillerFive>&nbsp;</div>', 
					'<div class=fillerTen>&nbsp;</div>', 
				'</td>', 
			'</tr>', 
		'</table>'
		].join(''));
		
		// set showClearAll button flag
		showClearAll = true;

		// TO DO: consider adding TOTAL filesize
	});
	myuploader.set("postVarsPerFile", postVars);
	// run validate files function to provide instant feedback
	// TO DO: do not allow illegal files to be added to the file list
	validateFiles();	
};

function updateFileList() {
	var fileNum = 0;
	Y.each(myuploader.get("fileList"), function (value) {
		fileNum++
	});
	if (fileNum > 1) {
		document.getElementById("submitUploadBtn").style.display = "block";
	}
	else {
		document.getElementById("submitUploadBtn").style.display = "none";
	}
};

// Define a function to handle the response data for HTTP GET calls 
function complete(id, o, args) {
	var id = id; // Transaction ID.
	var data = o.responseText; // Response data.
	var args = args[1]; // 'ipsum'.
	document.getElementById('UploadDiv').innerHTML = data;
};

// upon cancellation request cancellation page from the IS.
function getCancellation() {
	// clear divs
	out.one("");
	// hide legacy progress bar
	document.getElementById('ProgressDiv').style.display = "none";
	// after upload is complete remove "Stop Transfer" button
	document.getElementById("stopTransferButton").style.display = "none";
	Y.one("#uploadinfo").setContent("");

	// AJAX call to backend cancellation service

	// Make an HTTP request to cancellation page.
	// NOTE: This transaction does not use a configuration object.

	Y.on('io:complete', complete, Y, ['lorem', 'ipsum']);

	// get cancellation page
	var request = Y.io("cancel.html");
};

// upon successfull completion of all uploads request confirmation page from the IS
function getConfirmation() {
	// clear divs
	out.one("");
	// after upload is complete remove "Stop Transfer" button
	document.getElementById("stopTransferButton").style.display = "none";
	Y.one("#clearAllBtn").setContent("");
	Y.one("#uploadinfo").setContent("");
	Y.one("#pageTitle").setContent("");
	// Show indeterminite progress bar while waiting for backend to respond - this can happen in scenarios where the backend is taking longer to process then normal
	document.getElementById("fileselection").style.display = "block";
	Y.one("#fileselection").setContent("<IMG SRC=assets/indefinite_fast.gif><BR><IMG SRC=assets/indefinite_fast_text.gif>");

	// AJAX call to backend confirmation service

	// Make an HTTP request to confirmation page.
	// NOTE: This transaction does not use a configuration object.
	// pause for a few seconds here to allow backend time to process files first then get confirmation page

	setTimeout(
	function() {
/*	
		Y.on('io:complete', complete, Y, ['lorem', 'ipsum']);
		// get confirmation page
		var request = Y.io("confirmation.html");
		// remove indeterminite progress bar
		Y.one("#fileselection").setContent("");
*/

	// for demo purposes without real backend confirmation response, build a mock confirmation page
	
	// prepare date and time
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	year = year.toString().slice(2);
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	var meridian = "";
	if (minutes < 10){
		minutes = "0" + minutes
	}
	
	if(hours > 11){
		meridian = "PM";
	} else {
		meridian = "AM";
	}

	var confirmation = "<table width=100% border=0 cellspacing=0 cellpadding=0><tr><td><div class=printHeader><h1>File Upload - Confirmation</h1><span class=right><a href=javascript:window.print()><img src=assets/icons/print.gif width=17 height=19 border=0 alt=Print /></a> <a href=javascript:window.print()>Print</a></span></div><div class=fillerFive>&nbsp;</div>			Your files have been uploaded successfully.			They will be processed shortly.<div class=fillerFive>&nbsp;</div><div class=greyBox><div class=left4col1>Company <abbr title=Identification>ID</abbr>:</div><div class=left4col2><strong>test_company_id</strong></div><div class=left4col3>Transfer Date:</div><div class=left4col4><strong>" + month + "/" + day + "/" + year + "</strong></div><div class=filler>&nbsp;</div><div class=left4col1>User <abbr title=Identification>ID</abbr>:</div><div class=left4col2><strong>test</strong></div><div class=left4col3>Transfer Time:</div><div class=left4col4><strong>" + hours + ":" + minutes + " " + meridian + " PDT</strong></div><div class=filler>&nbsp;</div></div><div class=fillerFive>&nbsp;</div><div class=summaryBox><h2>Transfer Summary</h2><ul>";

	var rowColor = "even";
	
	Y.each(myuploader.get("fileList"), function (value) {
		var fileId = value.get("id");
		var fileName = value.get("name");
		confirmation = confirmation + "<li class=" + rowColor + "><div class=left2col><img src=assets/icons/ok.gif width=22 height=24 alt=OK /></div><div class=right2col>" + fileName + "<br /><Strong>Successful</Strong> - Confirmation #: " + fileId + " 								</div><div class=filler>&nbsp;</div></li>"
		if (rowColor == "even") {
			rowColor = "odd";
		}
		else if (rowColor =="odd") {
			rowColor = "even";
		}
	});
	
	confirmation = confirmation + "</ul></div>  <!--summaryBox--><div class=fillerTen>&nbsp;</div><p><a href=uploader-dev.html>File Upload Home</a></p><div class=fillerTen>&nbsp;</div></div>   <!--contentMargins--></div> <!--upload confirmation--></div> <!--contentContainer--><div class=contentBottom><!--<div class=contentBottomRight>&nbsp;</div>--></div></div><!--content--></td></tr></table>"
	document.getElementById('UploadDiv').innerHTML = confirmation;	

	}, 3000);
};

// FUS unique client-side request id generation function this is sent to backend for async file upload aggregation before processing
function getUniqueId() {
	// generate a random number
	req = Y.guid();
	return req;
}

// validation parameters

// illegal file extensions list
var dis_ext = ["com","exe","vbs","js","htm","html","dll","ocx","asp","jsp","bat","app","asf","avi","cda","ceo","eml","fxp","grp","hlp","lnk","m1v","mdb","mde","mid","midi","mov","mp2","mp3","mpa","mpe","mpeg","mpg","otf","prg","rmi","swf","url","vbe","wav","wm","wma","wmv"];
// maximum number of files
var max_nf = 5;
// minimum file size (bytes) - must be greater than
var min_size = 1
// maximum file size (bytes) - must be less than
var max_size = 26214400;
// maximum aggregate upload size (bytes) - must be less than
var maxUploadSize = 26214400;

// perform file validations
// NOTE: these checks should also be performed on the backend - this is just a first line of defense to conserve resources
function validateFiles() {	
	var nf = 0;
	var error = "";
	var uploadSize = 0;
	var validations = [];
    Y.each(myuploader.get("fileList"), function (value)
    {
		// count number of files
		nf++;
		var filename = value.get("name");
		// get filesize (bytes)
		var filesize = Math.floor(value.get("size"));
		// keep track of combined file size total
		uploadSize = uploadSize + filesize;
	
        // check for 0 byte file size
        if (filesize >= min_size) {
                // do nothing
        }

        else {
                error = error + "* " + filename + " is a 0 byte file" + "\n";
                clearFile(nf-1);
        }

        // check for maximum file size
        if (filesize > max_size) {
                error = error + "* " + filename + " (" + (Math.floor(filesize / 1024)) + "KB) exceeds maximum file size limit (" + (Math.floor(max_size / 1024)) + "KB)" + "\n";
                clearFile(nf-1);
        }
                
		// check for illegal extensions
        // TO DO: replace with better regular expression check
        var len=dis_ext.length;
        for(var i=0; i<len; i++) {
                var extension = dis_ext[i];
                if (filename.indexOf(extension) > 1) {
                        error = error + filename + " has an illegal extension (." + extension + ")" + "\n" ;
                        clearFile(nf-1);
            }
		}
	});
		
	// no files selected
	if  (nf == 0) {
		//error = error + ("No files selected!" + "\n");
	}
	
	// maximum number of files exceeded
	if (nf > max_nf) {
		error = error + ("* Maximum number of files exceeded - you selected " + nf + " only " + max_nf + " allowed" + "\n");
	}
		
	// maximum upload size exceeded
	if (uploadSize > maxUploadSize) {
		error = error + ("* Maximum upload size exceeded (" + (Math.floor(uploadSize / 1024)) + "KB) only " + (Math.floor(maxUploadSize / 1024)) + "KB allowed" + "\n");
	}

	// if there is error output, display it to the user
	if (error != "") {
			alert(error);
	}

	else {
		// validation passed, show upload button if files exist
		if (nf > 0) {
			document.getElementById("submitUploadBtn").style.display = "block";
			document.getElementById("clearAllButton").style.display = "block";
			document.getElementById("clearAllBtn").style.display = "block";
		}
		else {
			document.getElementById("submitUploadBtn").style.display = "none";
			document.getElementById("clearAllButton").style.display = "none";
			document.getElementById("clearAllBtn").style.display = "none";
		}
	}
	validations = [nf, uploadSize, error]
	return validations;
}

// define myuploader control object
var myuploader;

// buttons
// TO DO: move all css out of JS to CSS

// setup "Choose File" button
Y.one("#chooseFileBtn").setContent("<input type='submit' class='redButton' value='Choose File' style='margin-left:146px;position:relative'>");
Y.one("#chooseFileBtn").setStyle('width', '200px');

// set "Stop Transfer" button
Y.one("#cancelBtn").setContent("<input type='button' id='stopTransferButton' class='redButton' value='Stop Transfer'>");

// auto-detect browser capabilities to determine appropriate upload control - HTML5 (preferred) or Flash (fallback)

// if FireFox set initialize progress bar variables
if (Y.UA.gecko > 0) {
	STATUS_MESSAGE = document.getElementById("STATUS_MESSAGE");
	BAR = document.getElementById("BAR");
	TIME_LEFT = document.getElementById("TIME_LEFT");
	RATE = document.getElementById("RATE");
} 

// if Microsoft Internet Explorer (IE) force SWFupload Flash Uploader control
// if FireFox force SWFuploader Flash Uploader control until HTML5 issues are resolved by YUI team
if (Y.UA.ie > 0) {
	// setup "Clear All" button
	Y.one("#clearAllBtn").setContent("<input id='clearAllButton' type ='submit' class='redButton' value='Clear All' style='margin-left:565px;position:relative;bottom:29px;'>");
	// setup "Send" button
	Y.one("#submitUploadBtn").setContent("<input id='submitUploadButton' type='submit' class='redButton' value='Send' style='margin-left:146px;position:relative;bottom:10px;'>");
	
	//Y.UploaderFlash.TYPE = "flash";
	myuploader = new Y.UploaderFlash({ 
		boundingBox: '#fileselection',
		contentBox: '#fileselection',
		multipleFiles: true,
		selectButtonLabel: 'Choose File', // for use with default SELECT_FILES_BUTTON static property
		selectFilesButton: Y.one('#chooseFileBtn'),  // specify custom file selection DIV
		swfURL: "assets/flashuploader.swf?t=" + Math.random(),
		tabElements: {from: "#pageTitle", to: "#submitUploadButton"},
		tabIndex: "0",
		uploadURL: "upload.php",	
		width: '640px'
	});
	// verbosely output on page that we are using Flash control
	Y.one("#pageTitle").setContent("Using uploader: Flash");
	myuploader.render("#fileselection");
/*
	myuploader.get('boundingBox').setStyles({
		position: 'relative',
		top: '-32px'
	});
*/
}

// any other browser use HTML5

else {
	// setup "Clear All" button
	Y.one("#clearAllBtn").setContent("<input id='clearAllButton' type ='submit' class='redButton' value='Clear All' style='margin-left:565px;position:relative;bottom:47px;'>");
	// setup "Send" button
	Y.one("#submitUploadBtn").setContent("<input id='submitUploadButton' type='submit' class='redButton' value='Send' style='margin-left:146px;position:relative;bottom:30px;'>");

	//Y.UploaderFlash.TYPE = "html5"; 
	myuploader = new Y.UploaderHTML5({
		boundingBox: '#fileselection',
		contentBox: "#fileselection",
		multipleFiles: true,
		//selectButtonLabel: 'Choose File', // for use with default SELECT_FILES_BUTTON static property
		selectFilesButton: Y.one('#chooseFileBtn'),  // specify custom file selection DIV
		uploadURL: "upload.php",
		width: '640px'
	});

	// verbosely output on page that we are using HTML5 control
	Y.one("#pageTitle").setContent("Using uploader: HTML5");
	myuploader.render();
}

// set uploader class attributes

// multiple file selection 
myuploader.set("multipleFiles", true);
// newly selected files should be appended to the existing file list 
myuploader.set("appendNewFiles", true);
// A String specifying what should be the POST field name for the file content in the upload request. (Default: "Filedata")
myuploader.set("fileFieldName", "File"); 
// The number of files that can be uploaded simultaneously if the automatic queue management is used. This value can be in the range between 2 and 5. (Default: 2)
var simLimit = 2;
myuploader.set("simLimit", simLimit);

// output variable for uploadinfo div
var out = Y.one("#uploadinfo");

// event delegate for "Clear" link
out.delegate('click', function (ev) {
	var position = ev.target.get('id').replace('Clear', '');
	clearFile(position);
}, 'a.clearLink');

// initialize array to hold file list variables (for clearing file list)
var fileList = [];

// initialize global variable to store total number of files
var nf = 0;

// initialize array to hold post variables 
var postVars = [];

// initialize global variable to store total upload size
var uploadSize = 0;

// event listener for after file list changes
myuploader.after("fileListChange", function (ev) {
	// (re)draw file list
	drawFileList();
});

// event listener for "Clear All" button
Y.one("#clearAllButton").on("click", function () {
	clearFileList();
	document.getElementById("clearAllButton").style.display = "none";
	document.getElementById("clearAllBtn").style.display = "none";
});

// output individual upload progress percentage
// TO DO: switch to working in bytes to avoid divide by 0 issue in FF
myuploader.on("uploadprogress", function (ev) {
	var percentLoaded = Math.floor(ev.percentLoaded * 100) / 100;
	var fileID = ev.file.get("id");
	var currTime = new Date().getTime(); // get current time stamp for computing elapsed time
	var fileSize = Math.floor(ev.file.get("size") / 1024); // total file size
	var kbytesSent = Math.floor( (percentLoaded / 100) * (ev.file.get("size") / 1024) ); // KB sent so far
	var kbytesLeft = fileSize - kbytesSent; // KB left to send
	var elapsedTime = (currTime - startTime) * .001; // elapsed time in seconds
	elapsedTime = Math.floor(elapsedTime * 100) / 100;
	var xferRate = kbytesSent / elapsedTime; // transfer rate (KBps)
	xferRate = Math.floor(xferRate * 100) / 100;
	var eta = kbytesLeft / xferRate * 100; // estimated time remaining
	eta = Math.floor(eta + 100) / 100;
		
	out.one("#" + ev.file.get("id")).setContent(ev.file.get("name") + " | " 
				+ percentLoaded + "% | "
				+ "[" + kbytesSent + "KB / " + fileSize + "KB] | " 
				+ "KB Remaining: " + kbytesLeft + "KB | "
				+ "Transfer Rate: " + xferRate + "KB/sec | "
				+ "Estimated Time Remaining: " + eta + " sec | "
				+ "Total Time Elapsed: " + elapsedTime + " sec"
				
	);		
});

// notify user when an individual upload has completed
myuploader.on("uploadcomplete", function (ev) {
	// shows per XHR backend response, need not display to user.  Also throws Uncaught TypeError
	//out.one("#" + ev.file.get("id")).append("<p>DATA:<br> " + ev.data + "</p>");
});
            	 
// output total upload progress percentage
// TO DO: switch to working in bytes to avoid divide by 0 issue in FF     	 
myuploader.on("totaluploadprogress", function (ev) {
	var percentLoaded = Math.floor(ev.percentLoaded * 100) / 100; // get percent of total transfer
	var currTime = new Date().getTime(); // get current time stamp for computing elapsed time
	var kbytesSent = Math.floor( (ev.percentLoaded / 100) * (Math.floor(uploadSize / 1024)) ); // KB sent so far
	var kbytesLeft = Math.floor(uploadSize / 1024) - kbytesSent; // KB left to send
	var elapsedTime = (currTime - startTime) * .001; // elapsed time in seconds
	elapsedTime = Math.floor(elapsedTime * 100) / 100;
	var xferRate = kbytesSent / elapsedTime; // transfer rate (KBps)
	xferRate = Math.floor(xferRate * 100) / 100;
	var eta = kbytesLeft / xferRate * 100; // estimated time remaining
	eta = Math.floor(eta + 100) / 100;	

	// draw progress bar
	BAR.style.width = percentLoaded + "%";

	// if FF outout using textContent method
	if (Y.UA.gecko > 0) {
		//STATUS_MESSAGE.textContent = "blah";
		document.getElementById('STATUS_MESSAGE').textContent = "Transferring content...";
		document.getElementById('TIME_LEFT').textContent = eta + " sec";
		document.getElementById('RATE').textContent = xferRate + " KB/sec";
	}
	// all other browsers use innerText
	else {
		STATUS_MESSAGE.innerText = "Transferring content...";
		TIME_LEFT.innerText = eta + " sec";
		RATE.innerText = xferRate + " KB/sec";
	}
	
	// workaround until "alluploadscomplete" event bug is fixed
	if (ev.percentLoaded >= 95) { // FireFox may never reach 100% on individual file uploads
		// hide legacy progress DIV
		document.getElementById('ProgressDiv').style.display = "none";
		// retreive confirmation page from IS
		getConfirmation();
	}	
});

// notify user when all uploads have been completed and send XHR request for confirmation
// NOTE: due to a bug in current YUI master this event will not fire
/*
myuploader.on("alluploadscomplete", function (ev) {
	Y.one("#totalpercent").setContent("<p>Upload complete!</p>");	
});	                                    	                                       
*/

// upload

var startTime; // initialize start time variable for transfer rate and ETA

// event listener for when "Send" button is clicked  
Y.one("#submitUploadButton").on("click", function () {
	// get validation info
	var validations = [];
	validations = validateFiles();
	// get number of files in file list
	nf = validations[0];
	// get total upload size
	uploadSize = validations[1];
	// get error info	
	var error = validations[2];
	// check if file list passes validations
	if (nf == 0 || (nf > max_nf) || error != "") {
		// do nothing
	}
	
	else {
		// redraw filelist to hide individual clear buttons
		out.setContent("");
		Y.each(myuploader.get("fileList"), function (value) {
			var fileId = value.get("id");
			var fileName = value.get("name");
			var fileSize = Math.floor(value.get("size") / 1024);
			out.append("<div id='" + fileId + "'>" + fileName + " | " + "[" + fileSize + "KB]" + "</div>");
		});
		// hide "Select Files" div
		document.getElementById('fileselection').style.display = "none";		
		// show legacy progress DIV
		document.getElementById('ProgressDiv').style.display = "block";
		// hide legacy upload header
		document.getElementById('UploadPageHeader').style.display = "none";
		// show cancel button div
		document.getElementById("cancelBtn").style.display = "block";
		// show "File Detail" header
		Y.one("#pageTitle").setContent("File Name(s):");

		// upload all files using automatic queue manager when "Upload Files" button is clicked, form variables are sent via HTTP GET method
		// hide "Upload Files", "Select Files" and "Clear All" buttons
		document.getElementById("submitUploadBtn").style.display = "none";
		document.getElementById("clearAllButton").style.display = "none";
		// show "Stop Transfer" button
		document.getElementById("stopTransferButton").style.display = "block";	
		// get start time for computing eta, xfer rate, etc..
		startTime = new Date().getTime();
		myuploader.uploadThese(myuploader.get("fileList"), "upload.php?an=" + an + "&nf=" + nf + "&req=" + getUniqueId()), myuploader.get("postVarsPerFile");	

	}
});

// cancellation logic
// event listener for when "Stop Transfer" button is clicked
Y.one("#stopTransferButton").on("click", function () {
	// javascript popup confirmation to cancel file transfer(s)
	// TO DO: consider replacing with a YUI overlay so progress bar will continue to draw
	if (confirm("Click Cancel to continue upload, click OK TO CANCEL UPLOAD.")) {    
		// abort any pending async XHR transfers
		// destroy uploader control and abort any pending XHR requests
		myuploader.destroy();
		// clear divs
		out.one("");
		// clear file list output
		out.setContent("");
		// remove "Stop Transfer" button
		document.getElementById("stopTransferButton").style.display = "none";
		// make an http request to cancellation page
		getCancellation();
	}
});

});