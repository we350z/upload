// Create a YUI instance and load appropriate modules
YUI({
    base: '../../../../build/',
    lang: 'en',
    filter: 'raw',
    debug: true,
    useBrowserConsole: true
}).use('console', 'io-base', 'node', 'uploader', 'uploader-flash', 'uploader-html5', function(Y){

// hide "Stop Transfer", "Clear All", "Send" buttons at first opportunity
Y.one("#uploadBtn").hide();
Y.one("#cancelBtn").hide();
Y.one("#clearAllBtn").hide();

// IE hash title fix
if (Y.UA.ie > 0) {
	var originalTitle = document.title.split("#")[0];    
	document.attachEvent('onpropertychange', function (evt) {
	    if(evt.propertyName === 'title' && document.title !== originalTitle) {
	        setTimeout(function () {
	           document.title = originalTitle;
	        }, 1);
	    }
	});
}

//// variables

// input variables

// application name
var an = "app_name";
// application hosted redirect url support
var redirect_url; 

// validation variables

// illegal file extensions list
var dis_ext = "com|exe|vbs|js|htm|html|dll|ocx|asp|jsp|bat|app|asf|avi|cda|ceo|eml|fxp|grp|hlp|lnk|m1v|mdb|mde|mid|midi|mov|mp2|mp3|mpa|mpe|mpeg|mpg|otf|prg|rmi|swf|url|vbe|wav|wm|wma|wmv";
// maximum number of files
var max_nf = 5;
// minimum file size (bytes) - must be greater than
var min_size = 1
// maximum file size (bytes) - must be less than
var max_size = 26214400;
// maximum aggregate upload size (bytes) - must be less than
var maxUploadSize = 26214400;

// uploader control variables

// array to hold file list variables (for clearing file list)
var fileList = [];
// array to hold post variables 
var postVars = [];
// define myuploader control object
var myuploader;
// start time variable for transfer rate and ETA
var startTime;

// button variables

// clear all button style
var clearAllBtnStyle;
// upload button style
var uploadBtnStyle;

//// functions

// clear a single file
function clearFile(position) {
	// clear POST variable array element
	postVars = [];
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
		Y.one("#clearAllButton").hide();
		Y.one("#clearAllBtn").hide();
	}
}

// clear all files
function clearFileList() {
	// hide "Clear All" and "Send" button
	Y.one("#clearAllButton").hide();
	Y.one("#clearAllBtn").hide();
	Y.one("#uploadBtn").hide();
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

// function to handle the response data for HTTP GET calls 
function complete(id, o, args) {
	var id = id; // Transaction ID.
	var data = o.responseText; // Response data.
	var args = args[1]; // 'ipsum'.
	Y.one("#UploadDiv").setContent(data);
};

// draw file list
function drawFileList() {
	out.setContent("");
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
					'<div class=fileNum id=', fileId, '>',
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
	// run validate files function to prevent illegal files from being added and provided instant user feedback
	validateFiles();	
};

// upon cancellation request cancellation page from the backend
function getCancellation() {
	// clear divs
	out.one("");
	// hide legacy progress bar
	Y.one("#ProgressDiv").hide();
	// after upload is complete remove "Stop Transfer" button
	Y.one("#stopTransferButton").hide();

	// clear out divs
	Y.one("#uploadinfo").setContent("");

	// AJAX call to backend cancellation service

	// Make an HTTP request to cancellation page.
	// NOTE: This transaction does not use a configuration object.

	Y.on('io:complete', complete, Y, ['lorem', 'ipsum']);

	// get cancellation page
	var request = Y.io("cancel.html");
};

// upon successfull completion of all uploads request confirmation page from the backend
function getConfirmation() {
	// clear divs
	out.one("");
	// after upload is complete remove "Stop Transfer" button
	Y.one("#stopTransferButton").hide();

	// clear out divs
	Y.one("#clearAllBtn").setContent("");
	Y.one("#uploadinfo").setContent("");
	Y.one("#pageTitle").setContent("");

	// Show indeterminite progress bar while waiting for backend to respond - this can happen in scenarios where the backend is taking longer to process then normal
	Y.one("#fileselection").show();
	Y.one("#fileselection").setContent("<IMG SRC=poc/assets/indefinite_fast.gif><BR><IMG SRC=poc/assets/indefinite_fast_text.gif>");

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
	
	if (hours > 11) {
		meridian = "PM";
	} 

	else {
		meridian = "AM";
	}

	var confirmation = ([
		'<table width=100% border=0 cellspacing=0 cellpadding=0>', 
			'<tr>',
				'<td>',
					'<div class=printHeader>',
						'<h1>File Upload - Confirmation</h1>', 
							'<span class=right>',
								'<a href=javascript:window.print()>', 
									'<img src=poc/assets/icons/print.gif width=17 height=19 border=0 alt=Print />', 
								'</a>', 
								'<a href=javascript:window.print()>Print</a>', 
							'</span>',
					'</div>',
					'<div class=fillerFive>&nbsp;</div>',
						'Your files have been sent successfully.  They will be processed shortly.',
						'<div class=fillerFive>&nbsp;</div>',
						'<div class=greyBox>',
							'<div class=left4col1>Company <abbr title=Identification>ID</abbr>:',
						'</div>',
						'<div class=left4col2><strong>test_company_id</strong></div>',
						'<div class=left4col3>Transfer Date:</div>',
						'<div class=left4col4><strong>', month, '/', day, '/', year, '</strong></div>',
						'<div class=filler>&nbsp;</div>',
						'<div class=left4col1>User <abbr title=Identification>ID</abbr>:</div>',
						'<div class=left4col2><strong>test</strong></div>',
						'<div class=left4col3>Transfer Time:</div>',
						'<div class=left4col4><strong>', hours, ':',  minutes, ' ', meridian, ' PDT</strong></div>',
						'<div class=filler>&nbsp;</div>',
					'</div>',
					'<div class=fillerFive>&nbsp;</div>',
					'<div class=summaryBox>',
						'<h2>Transfer Summary</h2>',
						'<ul>'
	].join(''));

	var rowColor = "even";
	
	Y.each(myuploader.get("fileList"), function (value) {
		var fileId = value.get("id");
		var fileName = value.get("name");
		confirmation = confirmation + ([
							'<li class=', rowColor, '>',
								'<div class=left2col>',
									'<img src=poc/assets/icons/ok.gif width=22 height=24 alt=OK />',
								'</div>',
								'<div class=right2col>', fileName, '<br />',
									'<Strong>Successful</Strong> - Confirmation #: ', fileId, 
								'</div>',
								'<div class=filler>&nbsp;</div>',
							'</li>'
		].join(''));
		
		if (rowColor == "even") {
			rowColor = "odd";
		}
		
		else if (rowColor =="odd") {
			rowColor = "even";
		}
	});
	
	confirmation = confirmation + ([
							'</ul>',
							'</div>',
							'<div class=fillerTen>&nbsp;</div>',
								'<p><a href=upload-dev.html>File Upload Home</a></p>',
								'<div class=fillerTen>&nbsp;</div>',
							'</div>',
						'</div>',
					'</div>',
					'<div class=contentBottom></div>',
				'</div>',
				'</td>',
			'</tr>',
		'</table>'
		].join(''));
		Y.one("#UploadDiv").setContent(confirmation);
	}, 3000);
};

// unique client-side request id generation function this is sent to backend for async file upload aggregation before processing
function getUniqueId() {
	// generate a random number
	req = Y.guid();
	return req;
}

// perform file validations
// NOTE: these checks are also performed on the backend - this is just a first line of defense to conserve resources
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
                error = error +  "The file is empty. You tried to upload a blank file. Please send a completed file." + "\n";
                clearFile(nf-1);
        }

        // check for maximum file size
        if (filesize > max_size) {
                error = error +  filename + " (" + (Math.floor(filesize / 1024 / 1024)) + "MB) exceeds maximum file size limit (" + (Math.floor(max_size / 1024 / 1024)) + "MB)" + "\n";
                clearFile(nf-1);
        }
                
		// check for illegal extensions
        var regex_ext = new RegExp(dis_ext, "i");
		var parse_ext = regex_ext;
		var test_ext = parse_ext.test(filename);

        if (test_ext) {
                var extension = filename.substring(filename.lastIndexOf("."));
                error = error + 'Cannot upload files with extension"' + extension +'".' + "\n";
                clearFile(nf-1);
    	}
	});
		
	// no files selected
	if  (nf == 0) {
		//error = error + ("No files selected!" + "\n");
	}

	// TO:DO do a duplicate file check
	
	// maximum number of files exceeded
	if (nf > max_nf) {
		error = error + ("The file(s) exceed the maximum limit of " + max_nf + " files per request." + "\n");
	}
		
	// maximum upload size exceeded
	if (uploadSize > maxUploadSize) {
		error = error + "The file(s) exceed the maximum limit of " + (Math.floor(maxUploadSize / 1024 / 1024)) + " MB per request." + "\n";
		Y.one("#uploadBtn").hide();
	}

	// if there is error output, display it to the user
	if (error != "") {
			alert(error);
	}

	else {
		// validation passed, show upload button if files exist
		if (nf > 0) {
			Y.one("#uploadBtn").show();
			Y.one("#clearAllButton").show();
			Y.one("#clearAllBtn").show();
		}

		else {
			Y.one("#uploadBtn").hide();
			Y.one("#clearAllButton").hide();
			Y.one("#clearAllBtn").hide();
		}
	}
	validations = [nf, uploadSize, error]
	return validations;
}

//// setup uploader contol

// browser feature detection to select appropriate upoad control

if (Y.Uploader.TYPE != "none") {
	myuploader = new Y.Uploader({ multipleFiles: true,
		selectButtonLabel: 'Choose File', // for use with default SELECT_FILES_BUTTON static property
		selectFilesButton: Y.one('#chooseFileBtn'),  // specify custom file selection DIV
		tabIndex: "0",
		width: "640px",
		height: "100%",
		swfURL: "poc/assets/flashuploader.swf?t=" + Math.random()
	});
}

if (Y.Uploader.TYPE === "html5") {
	Y.one("#pageTitle").setContent("Using uploader: HTML5");
	//  adjust button positioning
	// TO:DO move this to css
	clearAllBtnStyle = "margin-left:565px;position:relative;bottom:49px;";
	uploadBtnStyle = "margin-left:146px;position:relative;bottom:30px;";
}

else if (Y.Uploader.TYPE === "flash") {
	Y.one("#pageTitle").setContent("Using uploader: Flash");
	// adjust button positioning
	// TO:DO move this to css
	clearAllBtnStyle = "margin-left:565px;position:relative;bottom:33px;";
	uploadBtnStyle = "margin-left:146px;position:relative;bottom:10px;";
}

myuploader.render("#fileselection");

//// buttons
// TO DO: move all css out of JS to CSS

// setup "Clear All" button
Y.one("#clearAllBtn").setContent("<input id='clearAllButton' type ='submit' class='redButton' value='Clear All' style='" + clearAllBtnStyle + "'>");

// setup "Choose File" button
Y.one("#chooseFileBtn").setContent("<input type='submit' class='redButton' value='Choose File' style='margin-left:146px;position:relative'>");
Y.one("#chooseFileBtn").setStyle('width', '200px');

// setup "Send" button
Y.one("#uploadBtn").setContent("<input id='uploadButton' type='submit' class='redButton' value='Send' style='" + uploadBtnStyle + "'>");

// set "Stop Transfer" button
Y.one("#cancelBtn").setContent("<input type='button' id='stopTransferButton' class='redButton' value='Stop Transfer'>");

/*
// auto-detect browser with user agent to determine appropriate upload control - HTML5 (preferred) or Flash (fallback)

// Chrome 10+, FireFox 4+, Opera 12+, Safari 4+ use HTML5
if (Y.UA.chrome >= 10 || Y.UA.gecko >= 4 ||  Y.UA.opera >= 12 || Y.UA.safari >= 4)  {
	// setup "Clear All" button
	Y.one("#clearAllBtn").setContent("<input id='clearAllButton' type ='submit' class='redButton' value='Clear All' style='margin-left:565px;position:relative;bottom:49px;'>");
	// setup "Send" button
	Y.one("#uploadBtn").setContent("<input id='uploadButton' type='submit' class='redButton' value='Send' style='margin-left:146px;position:relative;bottom:30px;'>");

	//Y.UploaderFlash.TYPE = "html5"; 
	myuploader = new Y.UploaderHTML5({
		boundingBox: '#fileselection',
		contentBox: "#fileselection",
		multipleFiles: true,
		//selectButtonLabel: 'Choose File', // for use with default SELECT_FILES_BUTTON static property
		selectFilesButton: Y.one('#chooseFileBtn'),  // specify custom file selection DIV
		//uploadURL: "upload.php",
		width: '640px'
	});

	// verbosely output on page that we are using HTML5 control
	Y.one("#pageTitle").setContent("Using uploader: HTML5");
	myuploader.render();
} 

// all other browsers use Flash (IE 6/7/8/9, Opera 11)
else {
	// setup "Clear All" button
	Y.one("#clearAllBtn").setContent("<input id='clearAllButton' type ='submit' class='redButton' value='Clear All' style='margin-left:565px;position:relative;bottom:33px;'>");
	// setup "Send" button
	Y.one("#uploadBtn").setContent("<input id='uploadButton' type='submit' class='redButton' value='Send' style='margin-left:146px;position:relative;bottom:10px;'>");
	
	//Y.UploaderFlash.TYPE = "flash";
	myuploader = new Y.UploaderFlash({
		// boundingBox/contentBox causes "Uncaught Error: HIERARCHY_REQUEST_ERR: DOM Exception 3"
		//boundingBox: '#fileselection',
		//contentBox: '#fileselection',
		multipleFiles: true,
		selectButtonLabel: 'Choose File', // for use with default SELECT_FILES_BUTTON static property
		selectFilesButton: Y.one('#chooseFileBtn'),  // specify custom file selection DIV
		swfURL: "poc/assets/flashuploader.swf?t=" + Math.random(),
		tabElements: {from: "#pageTitle", to: "#uploadButton"},
		tabIndex: "0",
		//uploadURL: "upload.php",	
		width: '640px'
	});
	// verbosely output on page that we are using Flash control
	Y.one("#pageTitle").setContent("Using uploader: Flash");
	myuploader.set("swfURL", "poc/assets/flashuploader.swf");
	myuploader.render("#fileselection");
}
*/

// set uploader class attributes

// multiple file selection 
myuploader.set("multipleFiles", true);
// newly selected files should be appended to the existing file list 
myuploader.set("appendNewFiles", true);
// a string specifying what should be the POST field name for the file content in the upload request. (Default: "Filedata")
myuploader.set("fileFieldName", "File"); 
// the number of files that can be uploaded simultaneously if the automatic queue management is used. This value can be in the range between 2 and 5. (Default: 2)
var simLimit = 2;
myuploader.set("simLimit", simLimit);

// output variable for uploadinfo div
var out = Y.one("#uploadinfo");

// event listener for after file list changes
myuploader.after("fileListChange", function (ev) {
	// (re)draw file list
	drawFileList();
});

// event listener for "Clear All" button
Y.one("#clearAllButton").on("click", function () {
	clearFileList();
	Y.one("#clearAllButton").hide();
	Y.one("#clearAllBtn").hide();
});

// output individual file upload progress percentage
myuploader.on("uploadprogress", function (ev) {
    out.one("#" + ev.file.get("id")).setContent(Math.floor(ev.percentLoaded) + "%");
});


//// progress bar

// if FireFox initialize progress bar variables
if (Y.UA.gecko > 0) {
	STATUS_MESSAGE = document.getElementById("STATUS_MESSAGE");
	BAR = document.getElementById("BAR");
	TIME_LEFT = document.getElementById("TIME_LEFT");
	RATE = document.getElementById("RATE");
}

// output total file upload progress percentage	 
myuploader.on("totaluploadprogress", function (ev) {
	//Y.one("#totalpercent").setContent("Total upload progress: " + ev.percentLoaded);
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
	Y.one("#STATUS_MESSAGE").setContent("Transferring content...");
	Y.one("#TIME_LEFT").setContent(eta + " sec");
	Y.one("#RATE").setContent(xferRate + " KB/sec");
});


//// event listeners

// event delegate for "Clear" link
out.delegate('click', function (ev) {
	var position = ev.target.get('id').replace('Clear', '');
	clearFile(position);
}, 'a.clearLink');

// notify user when an individual upload has completed
myuploader.on("uploadcomplete", function (ev) {
 	//out.one("#" + ev.file.get("id")).append("<p>DATA:<br> " + ev.data + "</p>");
 	out.one("#" + ev.file.get("id")).setContent("100%");
}); 

myuploader.on("alluploadscomplete", function (ev) {
 	//Y.one("#totalpercent").setContent("<p>Upload complete!</p>");
	// hide legacy progress DIV
	Y.one("#ProgressDiv").hide();
	// retreive confirmation page from backend
	getConfirmation();		 	
});	                                    	                                       

Y.one("#uploadButton").on("click", function () {
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
		// error - do not start uploading, user has been informed by validateFiles()
	}
	
	// start uploading
	else {
		// show legacy progress DIV
		Y.one("#ProgressDiv").show();
		// hide legacy upload header
		Y.one("#UploadPageHeader").hide();
		// hide choose file button
		Y.one("#chooseFileBtn").hide();
		// hide upload button
		Y.one("#uploadBtn").hide();
		// hide clear all button
		Y.one("#clearAllBtn").hide();
		// show cancel button div
		Y.one("#cancelBtn").show();
		// show "File Detail" header
		Y.one("#pageTitle").setContent("File Name(s):");

		// remove clear links
		var bodyNode = Y.one(document.body);
		bodyNode.all('.clearLink').hide();

		// record start time for calculating xfer rate and eta in progress bar
		startTime = new Date().getTime();

		// inititate upload
		//myuploader.uploadAll("upload.php?an=app_name&nf=" + nf + "&req=" + getUniqueId());
		myuploader.uploadThese(myuploader.get("fileList"), "upload.php?an=" + an + "&nf=" + nf + "&req=" + getUniqueId()), myuploader.get("postVarsPerFile");
	}
});

// cancellation logic - event listener for when "Stop Transfer" button is clicked
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