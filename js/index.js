$(function () {
	$('#inputtags').attr('autocomplete', 'off');
	$('#inputtags').tagSuggest({
		url: 'tags.php',
		delay: 250,
		separator: ', ',
		tagContainer: 'p',
	});
	
	var uploading = false;
	var nativeFiles = {};
	
	var uploader = new plupload.Uploader({
		runtimes : 'gears,html5,flash,silverlight,browserplus',
		browse_button : 'addimages',
		container : 'inputimagecontainer',
		max_file_size : '10mb',
		url : 'upload.php',
		flash_swf_url : '/js/plupload.flash.swf',
		silverlight_xap_url : '/js/plupload.silverlight.xap',
		multipart : true,
		drop_element: 'dropbox',
		max_file_size: $('input[name="MAX_FILE_SIZE"]').val() + 'b',
		filters : [
		           {title : "Image files", extensions : "jpg,gif,png,bmp"}
		           ]
	});
		
	uploader.bind('Init', function(up, params) {
		//$('#filelist').html("<div>Current runtime: " + params.runtime + "</div>");
	});
		
	$('#submit').click(function(e) {
		uploading = true;
		
		$('body').append('<div id="hide" />');
		
		$('body').css({'overflow':'hidden'});
		
		$('#hide').css({
		 'background-color': '#000000',
		 'position': 'absolute',
		 'top': 0,
		 'left': 0,
		 'opacity': 0.8,
		 'width': $(document).width(),
		 'height': $(document).height(),
		 'z-index': 100	 
		});
		
		$('#loading').css({'display': 'block'});
		
		uploader.settings['multipart_params'] = {
			'tags': $('#inputtags').val(),
			'uploadid': $('#inputuploadid').val(),
			'submit': 'Upload'
		};
		uploader.start();
		e.preventDefault();
	});
		
	uploader.init();
		
	uploader.bind('FilesAdded', function(up, files) {
		$('#imageslist').show();
		
		$.each(files, function(i, file) {
			$('#imageslist').append(
				'<div id="' + file.id + '">' +
				file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' +
				'</div>');
		});
	 
		up.refresh(); // Reposition Flash/Silverlight
	});
	
	uploader.bind('UploadProgress', function(up, file) {
		$('#' + file.id + " b").html(file.percent + "%");
	});
	
	uploader.bind('Error', function(up, err) {
		$('#imageslist').append("<div>Error: " + err.code +
			", Message: " + err.message +
			(err.file ? ", File: " + err.file.name : "") +
			"</div>");
	
		up.refresh(); // Reposition Flash/Silverlight
	});
		
	uploader.bind('FileUploaded', function(up, file) {
		$('#' + file.id + " b").html("100%");
	});
	
	uploader.bind('UploadComplete', function(up, files) {
		window.location = 'browse.php?upload=' + $('#inputuploadid').val();
	});

	$('#inputimages').hide();

	window.addEventListener('dragenter', function (e) {
		if (uploading) return;
		
		e.stopPropagation();
		e.preventDefault();
		
		$('#dropbox').fadeIn();
			
	}, false);
	
	var dropbox = document.getElementById('dropbox');			
	var dropboxHideTimer;
	
	dropbox.addEventListener('dragover', function(e) {
		e.stopPropagation();
		e.preventDefault();
		
		clearTimeout(dropboxHideTimer);
		dropboxHideTimer = setTimeout("$('#dropbox').fadeOut();", 250);
	}, false);
			
});
