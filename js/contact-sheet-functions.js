jQuery(document).ready(function($) {
	
	/*
	 * A thumbnail gallery with a medium image preview that links to a large image in a lightbox
	 * Photo captions and descriptions swap out with images when thumbnails are clicked
	 */
	$(".cs-content").each(function (i) { 
        //detach main image, caption and description and prepend to div.gallery
        //this hack moves these items to within the printed loop, above and below the thumbnails
        var newLocation = $(this).children('.cs-gallery');
        var csMainImg = $(this).children('.cs-main-image').detach();   
        csMainImg.prependTo(newLocation);
        var csMainCap = $(this).children('p.cs-main-caption');
        csMainCap.appendTo(newLocation);
        var csMainDescrip = $(this).children('p.cs-main-description');
        csMainDescrip.appendTo(newLocation);  
        //replace image title with 'Enlarge'
        $('.cs-main-image a img').attr('title', 'Enlarge');
        $('.gallery-larger a img').attr('title', 'Enlarge');
        $('.gallery-icon a img').attr('title', 'Enlarge');
        $('.lightbox-img img').attr('title', 'Close lightbox');
        
        //wrap all ul.gallery-items in a div called .cs-thumbs
        $(this).children('.cs-gallery').children('ul.gallery-item').wrapAll('<div class="cs-thumbs" />');
                  
        //add .cs-current-img to 1st thumbnail
        var csThisGallery = $(this).children('.cs-gallery').children('div.cs-thumbs');
        var csCurrentImg = csThisGallery.children('ul.gallery-item:first').children('.gallery-icon');
        csCurrentImg.addClass('cs-current-img');
        //remove title from current image
        $('.cs-current-img a img, .cs-current-img a, .cs-current li img').attr('title', '');             

		//get id of child gallery
		var csGalleryID = $(this).children('.cs-gallery').attr('id');		
		//append lightbox image to div.gallery-item
		$("<div class='cs-lightbox-img cs-hide " + csGalleryID + "'></div>").appendTo('body');
		//add 1st image to lightbox
		var csThisLightbox = "div." + csGalleryID;
		
		//get all the image data for this gallery and hold it in cs-lightbox-img
		var csList = $(this).children('.cs-gallery').children('div.cs-thumbs').children('ul.gallery-item');
		
		//add class of index number to image data
		$(csList).each(function (index) {
			$(this).addClass("img-" + index);
		});
		csList = $(csList).clone();
		var csImageArray = jQuery.makeArray(csList);		
		$(csImageArray).appendTo(csThisLightbox);
		
		//remove .gallery-icon and .gallery-larger from .cs-lightbox-img
		$('.cs-lightbox-img.' + csGalleryID).children().children().remove('.gallery-icon, .gallery-larger');
		
		//hide all but first image in lightbox
		$('.cs-lightbox-img.' + csGalleryID).children('ul.gallery-item').not(':first').addClass('cs-hide');
		$('.cs-lightbox-img.' + csGalleryID).children('ul.gallery-item:first').addClass('cs-current');
		//remove size from lightbox images
		$('.cs-lightbox-img .lightbox-img img').attr('width', '');
		$('.cs-lightbox-img .lightbox-img img').attr('height', '');

    
		// On click swap the thumbnail image and info for the larger image and info
		$('li.gallery-icon').click(
			function($e) {
				$e.preventDefault();
				
				//remove .cs-current-img from thumbnail
				$('.gallery-icon').removeClass('cs-current-img');
								
				/*
				 * Medium image swap with caption and description
				 */
				 
				//get 1st medium image from gallery
				var csMainImg = $('ul.gallery-item:first-child').children('li.gallery-larger').clone();
				csMainImg = csMainImg.children('a');
				//get image from this thumbnail's sibling li.gallery-larger
				var newcsMainImg = $(this).siblings('li.gallery-larger').clone();
				newcsMainImg = newcsMainImg.children('a');	
				//find ancestor .cs-main-image a tag of this thumbnail
				var csThisMainImage = $(this).parent().parent().parent().children('div.cs-main-image').children('a');							
				//add this larger image to div#main-image 
				csThisMainImage.html(newcsMainImg);	
				
				//add this description text to main description div
				var newcsDescription = $(this).siblings('li.gallery-description');
				newcsDescription = newcsDescription.html();
				$(this).parent().parent().parent().children('p.cs-main-description').html(newcsDescription);
				
				//add this caption text to main caption div
				var newcsCaption = $(this).siblings('li.gallery-caption');
				newcsCaption = newcsCaption.html();
				$(this).parent().parent().parent().children('p.cs-main-caption').html(newcsCaption);
				
				
				/*
				 * Make current image visible in the Lightbox
				 */
				 
				//add .cs-hide to all children of .cs-lightbox-img for this gallery
				//gallery icon id
				var csGalleryIconID = $(this).parent().parent().parent().attr('id');
				$('div.cs-lightbox-img.' + csGalleryIconID ).children().addClass('cs-hide')
				$('div.cs-lightbox-img.' + csGalleryIconID ).children().removeClass('cs-current');
				//get class that starts with 'img-' and add a . 
				var csImageClassNum = $(this).parent().attr('class');	
				csImageClassNum = csImageClassNum.replace("gallery-item ", ".");			
				//remove .cs-hide from the img with the matching class in .cs-lightbox-img for this gallery
				$('div.cs-lightbox-img.' + csGalleryIconID ).children(csImageClassNum).removeClass('cs-hide');
				$('div.cs-lightbox-img.' + csGalleryIconID ).children(csImageClassNum).addClass('cs-current');
				
				//add .cs-current-img to thumbnail
				$(this).addClass('cs-current-img');		
				//remove title from current image
				$('.cs-current-img a img,.cs-current-img a').attr('title', '');	
			}
		);    
    });

		
	//click medium main image and get large image in lightbox
	$('.cs-main-image').click(
		function($e) {
			$e.preventDefault();
			
			var cs_close = $('.cs-lb-controls');
			if ($(cs_close).length) { // implies *not* zero
    			$(cs_close).remove();
  			}
			
			var posTop = $(window).scrollTop() + 30;
			
			//get the id of the gallery
			var csGalleryClassId = $(this).parent().attr("id");
			csGalleryClass = "div.cs-lightbox-img." + csGalleryClassId;
			
			//create lightbox div with absolute positioning and wrap around new img
			$(csGalleryClass).removeClass('cs-hide');
			$(csGalleryClass).css('top', posTop + 'px');
			//add blackout div over body
			$('<div id="blackout" title="close"></div>').prependTo('body');	
			//add user-select: none;to body
			$('body').css({'user-select':'none','-webkit-user-select':'none','-khtml-user-select':'none','-moz-user-select':'none','-ms-user-select':'none','-o-user-select':'none'});
			//add controls to lightbox	
			$('<div class="cs-lb-controls"><a class="cs-x" title="close">&#x00D7;</a><a class="cs-next" title="Next">&#62;</a><a class="cs-back" title="Previous">&#60;</a></a>').prependTo('body');
			
			//if first image then hide back button when opening lightbox
			if($(csGalleryClass + ' .cs-current').prev().length == 0) {
				$('a.cs-back').addClass('cs-no-back');
			}
			//if last image then hide next button when opening lightbox
			if($(csGalleryClass + ' .cs-current').next().length == 0) {
				$('a.cs-next').addClass('cs-no-next');
			}
			
			//.lightbox-img img is causing issue with skipping images
			//lightbox next button
			$('a.cs-next').click(
				function($e) {
					$e.preventDefault();
					
					$('a.cs-back').removeClass('cs-no-back');
							
					
					if($(csGalleryClass + ' .cs-current').next().length != 0) {
						//add .cs-hide to current
						$(csGalleryClass + ' .cs-current').addClass('cs-hide');					
						
						var csNext = $(csGalleryClass + ' .cs-current').next()
						//remove .cs-hide from sibling to .current
						$(csGalleryClass + ' .cs-current').removeClass('cs-current');
						csNext.removeClass('cs-hide');
						csNext.addClass('cs-current');
						
						if($(csGalleryClass + ' .cs-current').next().length == 0) {
							$('a.cs-next').addClass('cs-no-next');
						}
					}						
				}
			);
			
			//lightbox back button
			$('a.cs-back').click(
				function($e) {
					$e.preventDefault();
					
					$('a.cs-next').removeClass('cs-no-next');							
					
					if($(csGalleryClass + ' .cs-current').prev().length != 0) {						
						//add .cs-hide to current
						$(csGalleryClass + ' .cs-current').addClass('cs-hide');					
						
						var csPrev = $(csGalleryClass + ' .cs-current').prev()
						//remove .cs-hide from sibling to .current
						$(csGalleryClass + ' .cs-current').removeClass('cs-current');
						csPrev.removeClass('cs-hide');
						csPrev.addClass('cs-current');
						
						if($(csGalleryClass + ' .cs-current').prev().length == 0) {
							$('a.cs-back').addClass('cs-no-back');
						}
					}			
				}
			);			
			//close lightbox function
			$('#blackout, a.cs-x, .lightbox-img img').click(
				function($e) {
					$e.preventDefault();
		
					$('div.cs-lightbox-img').addClass('cs-hide');
					$('#blackout').remove();
					$('.cs-lb-controls').remove();
					$('body').css({'user-select':'','-webkit-user-select':'','-khtml-user-select':'','-moz-user-select':'','-ms-user-select':'','-o-user-select':''});
					
					//get current thumbnail image number
					var csCurImg = "#" + csGalleryClassId + " .cs-current-img";
					var csCurImgNum = $(csCurImg).parent().attr('class');
					csCurImgNum = csCurImgNum.replace('gallery-item ', '.');
					
					//hide all but image clicked to open lighbox in the lightbox div
					$('.cs-lightbox-img.' + csGalleryClassId).children('ul.gallery-item').not(csCurImgNum).addClass('cs-hide').removeClass('cs-current');
					$('.cs-lightbox-img.' + csGalleryClassId).children(csCurImgNum).addClass('cs-current').removeClass('cs-hide');	
											
				}
			);					
		}
	);
	
	
	
	
	
	
	
});