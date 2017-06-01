---
---

jQuery(function($){
	$(document).ready(function(){
        
		// Contact form validation
		$('input,textarea,select').bind('invalid', function(evt) {
			$(evt.target).parent().addClass('has-error');
			$(evt.target).parent().find('.help-block').show().removeClass('hidden');
			return false;
		});
        var validateField = function(event){
            if(event.target.checkValidity()){
				$(event.target).parent().removeClass('has-error');
				$(event.target).parent().find('.help-block').hide();
			}
        };
		$('input,textarea,select').blur(validateField).keyup(validateField);
        
        // Track Events
		$('a').click(function(){
			if ($(this).attr('href').indexOf('http') != -1) {
				_gaq.push(['_trackEvent', 'Outbound Link', 'Click', $(this).attr('href')]);
			}
		});
		$('.footer-search,.gsc-search-box').submit(function(){
			_gaq.push(['_trackEvent', 'Search', 'Search', $(this).find('input[name=q]').val()]);
		});
		$('.social-networks a').click(function(){
			_gaq.push(['_trackEvent', 'Social Link', 'Click', $(this).attr('id')]);
		});
		$('#contact-form').submit(function(){
			_gaq.push(['_trackEvent', 'Contact Form', 'Submit']);
		});
        
        
        
        // Home page article paging
		var totalPages = $('.articles-wrapper').attr('data-total-pages');
		var currentPage = 1;
		$('.loader').hide();
        var loadNext = function(){
            var dfd = jQuery.Deferred();
			var $btn = $('.next-page');
			var $ldr = $btn.siblings('.loader');
			window.location.hash = '#!' + $btn.attr('href');
			$btn.hide();
			$ldr.show();
            var link = $btn.attr('href');
			if(currentPage < totalPages){
				currentPage++;
				$btn.attr('href','/page'+(currentPage+1));
			} else {
				$btn.attr('disabled','disabled');
			}
			$("<div>").load(link+" .articles-wrapper", function() {
				$(".recent-activity").append($(this).html());
                $('#'+$(this).find('section.articles-wrapper').attr('id')).find('.pin').click(pinClick);
				$btn.show();
				$ldr.hide();
                window.scrollBy(0, window.innerHeight);
                dfd.resolve();
			});
			return dfd.promise();
		};
		$('.next-page').click(function(){
            loadNext();
            return false;
        });
        if(window.location.pathname == '/' && window.location.hash.match(/#!\/page\d+\/?/)){
            var page = parseInt(window.location.hash.match(/\d+\/?$/)[0],10);
            var loadPages = function(){
                if(page > 1){
                    loadNext().done(function(){
                        page--;
                        loadPages();
                    });
                } else {
                    window.scrollTo(0,2147483647);
                }
            }
            loadPages();
        }
        
        // Load the related articles
        var tags = [];
        $('#relatedPosts ul').each(function(){
            if(tags.length == 0){
                $('.tags a').each(function(idx, tag){
                    tags.push($.trim($(tag).text()));
                });
            }
            $.getJSON('/posts.json',function(posts){
                var related = 0;
                $.each(posts,function(idx, post){
                    var matches = 0;
                    $.each(post.tags,function(idx, tag){
                        if(tags.indexOf(tag) != -1){
                            matches++;
                        }
                    });
                    post.matches = matches;
                });
                posts.sort(function(pa,pb){
                    return pb.matches - pa.matches;
                });
                $.each(posts,function(idx, post){
                    if(related < 5 && location.pathname !== post.url){
                        $('#relatedPosts ul').append(post.post);
                        related++;
                    }
                });
           });
        });
	});
    
});
var track = true;
try {
    if (window.location.search == '?track=false') {
        window.localStorage.setItem('track', 'false');
        track = false;
    }
    if (window.localStorage.getItem('track') == 'false') {
        track = false;
    }
} catch(e) {
    // problem occurred with local storage
}
var _gaq = _gaq || [];
if (track) {
    _gaq.push(['_setAccount', '{{site.gaAccount}}']);
    _gaq.push(['_trackPageview']);
    (function() {
        if(navigator.userAgent.indexOf("Speed Insights") == -1) {
            function includeScript(src){
                var se = document.createElement('script'); se.type = 'text/javascript'; se.async = true;se.src = src;
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(se, s);
            }
            includeScript('https://ssl.google-analytics.com/ga.js');
            includeScript('https://platform.twitter.com/widgets.js');
        }
    })();
}
