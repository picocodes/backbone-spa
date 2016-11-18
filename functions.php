<?php 
    add_action( 'wp_enqueue_scripts', 'backbone_spa_enqueue_styles' );
    function backbone_spa_enqueue_styles(){
        // Add custom fonts, used in the main stylesheet.
	wp_enqueue_style( 'twentysixteen-fonts', twentysixteen_fonts_url(), array(), null );

	// Add Genericons, used in the main stylesheet.
	wp_enqueue_style( 'genericons', get_template_directory_uri() . '/genericons/genericons.css', array(), '3.4.1' );

	// Theme stylesheet.
	wp_enqueue_style( 'twentysixteen-style', get_template_directory_uri() . '/style.css' );
	
	// Theme stylesheet.
	wp_enqueue_style( 'bbspa-style', get_stylesheet_directory_uri() . '/style.css' );

	// Load the Internet Explorer specific stylesheet.
	wp_enqueue_style( 'twentysixteen-ie', get_template_directory_uri() . '/css/ie.css', array( 'twentysixteen-style' ), '20160816' );
	wp_style_add_data( 'twentysixteen-ie', 'conditional', 'lt IE 10' );

	// Load the Internet Explorer 8 specific stylesheet.
	wp_enqueue_style( 'twentysixteen-ie8', get_template_directory_uri() . '/css/ie8.css', array( 'twentysixteen-style' ), '20160816' );
	wp_style_add_data( 'twentysixteen-ie8', 'conditional', 'lt IE 9' );

	// Load the Internet Explorer 7 specific stylesheet.
	wp_enqueue_style( 'twentysixteen-ie7', get_template_directory_uri() . '/css/ie7.css', array( 'twentysixteen-style' ), '20160816' );
	wp_style_add_data( 'twentysixteen-ie7', 'conditional', 'lt IE 8' );

	// Load the html5 shiv.
	wp_enqueue_script( 'twentysixteen-html5', get_template_directory_uri() . '/js/html5.js', array(), '3.7.3' );
	wp_script_add_data( 'twentysixteen-html5', 'conditional', 'lt IE 9' );

	wp_enqueue_script( 'twentysixteen-skip-link-focus-fix', get_template_directory_uri() . '/js/skip-link-focus-fix.js', array(), '20160816', true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}

	if ( is_singular() && wp_attachment_is_image() ) {
		wp_enqueue_script( 'twentysixteen-keyboard-image-navigation', get_template_directory_uri() . '/js/keyboard-image-navigation.js', array( 'jquery' ), '20160816' );
	}

	wp_enqueue_script( 'twentysixteen-script', get_template_directory_uri() . '/js/functions.js', array( 'jquery' ), '20160816', true );

	wp_localize_script( 'twentysixteen-script', 'screenReaderText', array(
		'expand'   => __( 'expand child menu', 'twentysixteen' ),
		'collapse' => __( 'collapse child menu', 'twentysixteen' ),
	) );
	
    wp_register_script( 'backbone-fetch-cache', get_stylesheet_directory_uri() . '/backbone.fetch-cache.js' , array('wp-api'), null, true );
    wp_register_script( 'backbone-spa-script', get_stylesheet_directory_uri() . '/backbone-spa.js' , array('wp-api', 'backbone-fetch-cache'), null, true );
	
        
	/**
	 * @var WP_REST_Server $wp_rest_server
	 */
	global $wp_rest_server;
	// Ensure the rest server is intiialized.
	if ( empty( $wp_rest_server ) ) {
		/** This filter is documented in wp-includes/rest-api.php */
		$wp_rest_server_class = apply_filters( 'wp_rest_server_class', 'WP_REST_Server' );
		$wp_rest_server       = new $wp_rest_server_class();
		/** This filter is documented in wp-includes/rest-api.php */
		do_action( 'rest_api_init', $wp_rest_server );
	}
	// Load the schema.
	$schema_request  = new WP_REST_Request( 'GET', '/wp/v2' );
	$schema_response = $wp_rest_server->dispatch( $schema_request );
	$schema = null;
	if ( ! $schema_response->is_error() ) {
		$schema = $schema_response->get_data();
	}   
	    
        wp_localize_script( 'wp-api',  'wpApiSettings', array(

            'root' => esc_url_raw( rest_url() ), 

            'nonce' => wp_create_nonce( 'wp_rest' ),
	    'versionString' => 'wp/v2/',
	    'schema'        => $schema,
	    'cacheSchema'   => true,

        ));
		
		ob_start();
		
			get_template_part('template');			
			$template = ob_get_contents();
			
		ob_end_clean();
		wp_localize_script( 'backbone-spa-script',  'backbone_spa', array(	
		
		'non_blog_links' => array(esc_url( admin_url() ), esc_url( includes_url() ), esc_url( content_url() ), esc_url( wp_login_url() )),
		'template' => $template,
		'author_ids' => get_users(array(
			'fields' => 'ID',
			//'who' => 'authors' Uncomment this if none of your authors were imported; 
			//This is because imported users are  always assigned a role of subscriber
		)),

        ));
        
        wp_enqueue_script( 'backbone-spa-script');

    }


  