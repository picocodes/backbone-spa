<header class="entry-header">
	<h2 class="entry-title"><a href="<%- link %>" rel="bookmark"><%- title.rendered %></a></h2>
</header><!-- .entry-header -->

<div class="entry-content">
	<%= single ?  content.rendered: excerpt.rendered %>
	<% if(single) { %>
		<div class="author-info">
			<div class="author-avatar">
				<img alt="" src="<%= author_details.avatar_urls[48] %>" srcset="<%= author_details.avatar_urls[96] %>" class="avatar avatar-42 photo" height="42" width="42">
			</div><!-- .author-avatar -->

			<div class="author-description">
				<h2 class="author-title"><span class="author-heading">Author:</span> Iano The Spender</h2>

				<p class="author-bio">
					<%= author_details.description %> <a class="author-link" href="<%- author_details.link %>" rel="author"><?php _e('View all posts by ', 'backbone-spa');?> <%- author_details.name %> </a>
				</p><!-- .author-bio -->
			</div><!-- .author-description -->
		</div>
	<% } %> <!-- Endif -->
</div><!-- .entry-content -->

<footer class="entry-footer">
	<span class="byline">
		<span class="author vcard">
			<img alt="" src="<%= author_details.avatar_urls[48] %>" srcset="<%= author_details.avatar_urls[96] %>" class="avatar avatar-49 photo" height="49" width="49">
			<span class="screen-reader-text">Author </span>
			<a class="url fn n" href="<%- author_details.link%>"><%- author_details.name%></a>
		</span>
	</span>
	<span class="posted-on">
		<span class="screen-reader-text">Posted on </span>
		<a href="<%- link %>" rel="bookmark">
			<time class="entry-date published" datetime="<%- date %>"><%= new Date(date).toDateString() %></time>
			<time class="updated" datetime="<%- modified %>"><%= new Date(date).toDateString() %></time>
		</a>
	</span>

	<span class="cat-links">
		<span class="screen-reader-text"><?php _e('Categories', 'backbone-spa')?></span>
		<% _.each(cats, function(cat, index, list) {%>
			<a href="<%= cat.link %>" rel="category tag"><%= cat.name %></a>,
		<%}); %>
	</span>

	<span class="comments-link">
		<a href="<%- link %>#respond"><?php _e('Leaver A Comment', 'backbone-spa')?><span class="screen-reader-text"> on <%- title.rendered %></span></a>
	</span>

	<span class="edit-link">
		<a class="post-edit-link" href="<?php echo admin_url()?>/post.php?post=<%- id %>&amp;action=edit"><?php _e('Edit', 'backbone-spa')?><span class="screen-reader-text"> <%- title.rendered %></span></a>
	</span>
</footer>
