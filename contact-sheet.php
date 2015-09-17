<?php
/*
Plugin Name: Contact Sheet Thumbnail Gallery
Plugin URI: http://cs.thedesignoffice.org
Description: A simple thumbnail gallery created from the native WordPress gallery.  Thumbnails are printed below a the featured image. When clicked, the thumbnail image swaps with the medium size featured image.  The featured image can also be clicked to see the large version in a lightbox. 
Version: 1.2
Author: Sarah Bostwick
Author URI: http://plant-projects.com
License: GPLv2
*/

/*  Copyright 2011  Sarah Bostwck  (email : sarah (at) plant (hyphen) projects (dot) com)

	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/


function cs_target_image($image_id, $size=medium, $num=1, $lighbox=1 ) {
	$image = get_post( $image_id );
	if ( !empty( $image ) ) {
		$attachmenturl=wp_get_attachment_url($image->ID);
		$attachmentimage=wp_get_attachment_link($image->ID, $size );
		$img_title = $image->post_title;
		$img_desc = $image->post_content;
		$img_capt = $image->post_excerpt;
		$output = "\n";
		$output .= "\t<div class='cs-main-image'>".$attachmentimage."</div>\n";
		$output .= "\t\t<p class='cs-main-description'>" . $img_desc . "</p>\n";
		$output .= "\t\t<p class='cs-main-caption'>" . $img_capt . "</p>\n";
	} else {
		$output =  "No Image";
	}

	return $output;
}


add_filter( 'post_gallery', 'cs_thumbnail_gallery', 10, 2 );

function cs_thumbnail_gallery( $output, $attr) {
	global $post, $wp_locale;

	static $instance = 0;
	$instance++;

	extract(shortcode_atts(array(
		'order'      => 'DESC',
		'orderby'    => 'menu_order ID',
		'id'         => $post->ID,
		'itemtag'    => 'ul',
		'icontag'    => 'li',
		'captiontag' => 'li',
		'descriptag' => 'li',
		'columns'    => -1,
		'size'       => 'thumbnail',
		'mainimage'  => 'medium',
		'lightbox'   => 'large',
		'include'    => '',
		'exclude'    => ''
	), $attr));

	$id = intval($id);
	if ( 'RAND' == $order )
		$orderby = 'none';

	if ( !empty($include) ) {
		$include = preg_replace( '/[^0-9,]+/', '', $include );
		$_attachments = get_posts( array('include' => $include, 'post_status' => 'inherit', 'post_type' => 'attachment', 'post_mime_type' => 'image', 'order' => $order, 'orderby' => $orderby) );

		$attachments = array();
		foreach ( $_attachments as $key => $val ) {
			$attachments[$val->ID] = $_attachments[$key];
		}
	} elseif ( !empty($exclude) ) {
		$exclude = preg_replace( '/[^0-9,]+/', '', $exclude );
		$attachments = get_children( array('post_parent' => $id, 'exclude' => $exclude, 'post_status' => 'inherit', 'post_type' => 'attachment', 'post_mime_type' => 'image', 'order' => $order, 'orderby' => $orderby) );
	} else {
		$attachments = get_children( array('post_parent' => $id, 'post_status' => 'inherit', 'post_type' => 'attachment', 'post_mime_type' => 'image', 'order' => $order, 'orderby' => $orderby) );
	}

	if ( empty($attachments) )
		return '';

	if ( is_feed() ) {
		$output = "\n";
		foreach ( $attachments as $att_id => $attachment )
			$output .= wp_get_attachment_link($att_id, $size, true) . "\n";
		return $output;
	}

	$itemtag = tag_escape($itemtag);
	$captiontag = tag_escape($captiontag);
	$descriptag = tag_escape($descriptag);
	$columns = intval($columns);
	$itemwidth = $columns > 0 ? floor(100/$columns) : 100;
	$float = is_rtl() ? 'right' : 'left';

	$selector = "gallery-{$instance}";
	
	//print large image once
	$output = "<div class='cs-content'>";

	reset($attachments);
	$first_id = key($attachments);
	$output .= cs_target_image( $first_id, $mainimage, 1 );

	$output .= apply_filters('gallery_style', "
		<style type='text/css'>
			#{$selector} .gallery-item {
				float: {$float};          
			}
		</style>
		<!-- see gallery_shortcode() in wp-includes/media.php -->
		<div id='$selector' class='cs-gallery galleryid-{$id}'>");

	$i = 0;
	foreach ( $attachments as $id => $attachment ) {
		$link = isset($attr['link']) && 'file' == $attr['link'] ? wp_get_attachment_link($id, $size, false, false) : wp_get_attachment_link($id, $size, true, false);
		$largerimage = wp_get_attachment_link($id, $mainimage );
		$lightboximage = wp_get_attachment_image($id, $lightbox );
		
		//$largerimage = isset($attr['link']) && 'file' == $attr['link'] ? wp_get_attachment_link($id, $mainimage, false, false) : wp_get_attachment_link($id, $mainimage, true, false);

		$output .= "<{$itemtag} class='gallery-item'>";
		$output .= "
			<li class='lightbox-img'>
				$lightboximage
			</li>";
		if ( $captiontag && trim($attachment->post_excerpt) ) {
			$output .= "
				<{$captiontag} class='gallery-caption'>
				" . wptexturize($attachment->post_excerpt) . "
				</{$captiontag}>";
		}
		if ( $descriptag && trim($attachment->post_content) ) {
			$output .= "
				<{$descriptag} class='gallery-description'>
				" . wptexturize($attachment->post_content) . "
				</{$descriptag}>";
		}
		$output .= "
			<{$icontag} class='gallery-icon'>
				$link
			</{$icontag}>";
			
		$output .= "
			<{$captiontag} class='gallery-larger'>
				$largerimage
			</{$captiontag}>";     
		
		
		$output .= "</{$itemtag}>";
		//if ( $columns > 0 && ++$i % $columns == 0 )
			//$output .= '<br style="clear: both" />';
	}
	
	$output .= "</div>\n";

	$output .= "</div>\n";
	return $output;
	
}

//enqueue plugin scripts
add_action('wp_enqueue_scripts', 'cs_thumbnail_gallery_scripts');
function cs_thumbnail_gallery_scripts() {   
	wp_enqueue_script( 'cs-thumbnail-swap', plugins_url( '/js/contact-sheet-functions.js', __FILE__ ), array( 'jquery' ) );
}

//enqueue plugin styles
add_action('wp_enqueue_scripts', 'cs_thumbnail_gallery_styles');
function cs_thumbnail_gallery_styles() {
	wp_enqueue_style( 'cs-thumbs-style', plugins_url( '/css/contact-sheet-style.css', __FILE__ ), false, '1.0', 'all' ); 
}


?>
