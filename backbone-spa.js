(function($){
	
	'use strict';
	
	//Kick of our app after the wp.api has loaded
	wp.api.loadPromise.done( function() {
		//The top level namespace containing all objects and methods
		var bbspa = {};
		
		//Utility function that extracts a pathname from the url, e.g, path/to/file.php
		bbspa.get_full_pathname = function(elem) {			
			return bbspa.unslashit(elem.pathname);			
		}
		
		//Utility function that extracts a file name from a url e.g file.php
		bbspa.get_pathname = function(elem) {	
			var pathname = bbspa.get_full_pathname(elem);
			
			//Returns the last part of the path; or null
			var last_slash = pathname.lastIndexOf("/");
			if(last_slash != -1) {
				return pathname.substr(last_slash + 1);
			}
				
			return null; 
				
		}
		
		//Unslashes a url/path
		bbspa.unslashit = function(path) {
			return path.replace(/\/\s*$/, "");
		}
		
		//Holds the value of the current page
		bbspa.current_path = bbspa.get_full_pathname(window.location);
		
		//Determines whether or not a given path is the current path
		bbspa.is_current_path = function(path) {
			return path === bbspa.current_path;
		}
		
		
		//Utility function to determine whether a given link is local or external
		bbspa.is_local_link = function(elem) {				
			return (elem.host ===window.location.host);				
		}
		
		//Utility function that determines whether or not a given link refers to a blog post or archive page
		bbspa.is_blog_page_link = function(elem) {
			
			//To update the list of non-blog urls; edit the functions.php page
			if(_.some(backbone_spa.non_blog_links, function(link) {

				return elem.href.indexOf(backbone_spa.content_url) > -1
				
			}, this)) {
				
				return false;
				
			}
			
			//In this demo, we only need urls that have blog in it (i.e blog posts)			
			var full_path = bbspa.get_full_pathname(elem);
			if(full_path.indexOf("/blog") != 0)
				return false;
				
			return true; //Neither admin, includes, login or content url
				
		}
				
		//wp.api creates a post model and its collection
		
		bbspa.posts = new wp.api.collections.Posts();
		
		//We cache a list of non-empty categories
		
		bbspa.cats = new wp.api.collections.Categories();
		bbspa.cats.fetch({
			data: {
				per_page: 100,
				hide_empty: true,
			},
			cache: true
		}); //This will load in the background 
		
		//We cache a list of autors
		
		bbspa.authors = new wp.api.collections.Users();
		bbspa.authors.fetch({
			data: {
				per_page: 100,
				include: backbone_spa.author_ids,
			},
			cache: true
		}); //This will load in the background 
		
		//Next we create our postView
		bbspa.postView = Backbone.View.extend({	
			tagName: "article",
			
			//This template renders a single post
			template: _.template(backbone_spa.template),
			
			initialize: function(options) {
				this.options = options || {};
				//Bind events to the models change and destroy events
				this.listenTo(this.model, 'change', this._render);
				this.listenTo(this.model, 'destroy', this.remove);
			},
				
			// The main render function
			render: function(custom_values) {
				var data = custom_values || this.model.toJSON();
				var dom_id = "post-" + data.id;
				var className = data.dom_id  + " post type-post status-publish format-standard";
				data.single = typeof(this.options.single) == 'undefined' ?true : this.options.single;

				var cats = bbspa.cats.filter(function(cat){
					return _.contains(data.categories, cat.attributes.id);
				});
				
				data.cats = [];
				
				_.each(cats, function(cat){ 
					data.cats.push(cat.toJSON());
				}, this);
								
				data.author_details = bbspa.authors.get(data.author).toJSON();
				
				this.$el.prop('id', dom_id);
				this.$el.prop('class', className);
				
				this.$el.html(this.template(data));
				return this; //important for chaining
			},
			
			// A proxy to the render function
			_render: function() {
				//In single model views, toJSON returns an array instead of an object
				$("#main").html(this.render(this.model.toJSON()[0]).el);
				$('html').off('click.bbspa');
				bbspa.controller = bbspa.controller_obj();
			},
			
		});
		
		//Our appView is the element with an id of #main(in twentysixteen; might be different on other themes)
		bbspa.appView = Backbone.View.extend({	
			el: $("#main"),
			
			initialize: function() {
				//This event is triggered whenever a new collection of posts is fetched from the server
				this.listenTo(bbspa.posts, 'reset', this.render);
				//When the current route changes, we update it
				this.listenTo(bbspa.router, 'route', this.updateCurrent);
				
			},
				
			//Updates our copy of the current url
			updateCurrent: function(route, params) {
				bbspa.current_path = bbspa.get_full_pathname(window.location);
				
				//Uncomment the following line if you are using google analytics
				//ga('set', 'page', bbspa.current_path);
				//ga('send', 'pageview');
			},
			
			//Renders one post
			renderOne: function(post) {
				var view = new bbspa.postView({model: post, single: false});
				this.$el.append(view.render().el);
			},
			
			// Renders all posts, provided that we have not been instructed not to do that
			render: function() {
				
				//Remove the page loader
				this.$el.html('');
				bbspa.posts.each(this.renderOne, this);
				//We remove previous event listeners and add a new one specific to our new content
				$('html').off('click.bbspa');
				bbspa.controller = bbspa.controller_obj();
				
			},
			
		});
		
		//This is our controller
		bbspa.controller_obj = function(){
			$("body a").on("click.bbspa", function(e){
			
				//If its not a post/archives link; delegate to default behaviour
				if(!bbspa.is_local_link(this) || !bbspa.is_blog_page_link(this)) {
					return;
				}
				//Only re-render the content if this is not the current path
				if(! bbspa.is_current_path(bbspa.get_full_pathname(this))) {
					
					$("#main").html('<div id="loader"></div>');
					bbspa.router.navigate(bbspa.get_full_pathname(this) + '/', {trigger: true});
					
				} else {
					
					$("body").animate({
						scrollTop: 0 ,
						}, 300
					); //simply scroll to the top
					
				}
				
				e.preventDefault();
			});
		}
		
		//Route manager
			bbspa.router_obj = Backbone.Router.extend({
				
				//Feel free to add more roots here if you need to support more post types
				routes: {
					"blog(/)":                 "load_posts",
					"blog/page/:page(/)":                 "load_posts",
					"blog/:name(/)":           "load_post",
					"blog/author/:name(/)":    "load_author_posts",
					"blog/author/:name/page/:page(/)":       "load_author_posts",
					"blog/category/:name(/)":        "load_category_posts",
					"blog/category/:name/page/:page(/)": "load_category_posts",
					"blog/tag/:name(/)":        "load_tag_posts",
					"blog/tag/:name/page/:page(/)": "load_tag_posts"
				},
				
				load_posts: function(page){
					var page_number = page || 1;
					bbspa.posts.fetch({
						data: {
							page: page_number
						},
						reset: true,
						cache: true
					});
				},
				
				load_post: function(name){	
					//If the model is already in the collection; no need to fetch it from the server
					if (bbspa.post = bbspa.posts.findWhere({slug: name})) {
						var postView = new bbspa.postView({model: bbspa.post});
						bbspa.post.trigger("change", bbspa.post);
						
					} else {
						bbspa.post = new wp.api.models.Post();
						var postView = new bbspa.postView({model: bbspa.post});
						bbspa.post.fetch({
							data: {
								filter: {name: name}
							},
							cache: true
						});
						
					}

				},
				
				load_author_posts: function(name, page){
					var page_number = page || 1;
					bbspa.posts.fetch({
						data: {
							page: page_number,
							filter: {author_name: name}
						},
						reset: true,
						cache: true
					});
					
				},
				
				load_category_posts: function(name, page){
					var page_number = page || 1;
					bbspa.posts.fetch({
						data: {
							page: page_number,
							filter: {category_name: name}

						},
						reset: true,
						cache: true
					});
					
				},
				
				load_tag_posts: function(name, page){
					var page_number = page || 1;
					bbspa.posts.fetch({
						data: {
							page: page_number,
							filter: {tag: name}
						},
						reset: true,
						cache: true
					});
				}				
			});
			
			//Instantiate the router
			bbspa.router = new bbspa.router_obj();
			//Followed by the controller
			bbspa.controller = bbspa.controller_obj();
			//Then activate the history api
			Backbone.history.start({pushState: true, silent: true});
			// Finally, we kick things off by creating the **App**.
			var App = new bbspa.appView;
		
	})
})(jQuery)