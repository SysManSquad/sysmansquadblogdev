jQuery(document).ready(function($) {

	"use strict";

    // Search
	$('#top-search a').on('click', function ( e ) {
		e.preventDefault();
    	$('.show-search').slideToggle('fast');
    });

});

$(document).ready(function(){
    $('#menu-top-menu').slicknav({
		prependTo:'#menu-mobile',
		label:'',
		allowParentLinks: true
    });
});