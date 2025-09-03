<?php
// Enqueue parent theme styles
function enqueue_parent_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
}
add_action( 'wp_enqueue_scripts', 'enqueue_parent_styles' );

// Add custom functionality only to the homepage
function custom_homepage_code() {
    if ( is_front_page() ) {
        // Custom homepage content
        ?>
        <style>
            body {
                background-color: #f0f0f0;
                /* Additional custom styles */
            }
        </style>
        <script>
            console.log("Custom homepage JavaScript code executed.");
        </script>
        <?php
    }
}
add_action( 'wp_head', 'custom_homepage_code' );

// Ensure custom code doesn't interfere with cart, checkout, and shop pages
function custom_page_code_exclusions() {
    if ( is_page( 'cart' ) || is_page( 'checkout' ) || is_page( 'shop' ) ) {
        // Exclude custom code from these pages
    } else {
        // Your custom code for other pages
    }
}
add_action( 'wp_head', 'custom_page_code_exclusions' );

// Start session and generate CSRF token
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>
