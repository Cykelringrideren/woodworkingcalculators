<?php
/**
 * Plugin Name:  Woodworkers Tools
 * Description:  Custom woodworking calculators: Board‑Foot, Sheet‑Yield, Wood Movement, and Weight Calculator.
 * Version:      0.2.8
 * Author:       Aske
 * Text Domain:  woodworkers-tools
 * License:      GPL‑2.0+
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/* Constants */
define( 'WWT_VERSION', '0.2.0' );
define( 'WWT_DIR',      plugin_dir_path( __FILE__ ) );
define( 'WWT_URL',      plugin_dir_url ( __FILE__ ) );

/* Shortcodes */
require_once WWT_DIR . 'includes/shortcodes.php';


function wwt_register_assets() {
    wp_register_style(
        'wwt-style',
        WWT_URL . 'assets/css/woodtools.css',
        [],
        WWT_VERSION
    );

    wp_register_script( 'wwt-board',  WWT_URL . 'assets/js/boardfoot.js',   [],            WWT_VERSION, true );
    wp_register_script( 'wwt-weight', WWT_URL . 'assets/js/weight.js',      [],            WWT_VERSION, true );
    wp_register_script( 'wwt-move',   WWT_URL . 'assets/js/movement.js',    [ 'chartjs' ], WWT_VERSION, true );
    wp_register_script(
      'chartjs',
      'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
      [], '4.4.0', true
    );

    wp_register_script(
        'wwt-binpack',
        WWT_URL . 'assets/js/binpack.js',
        [],               
        WWT_VERSION,
        true
    );

    wp_register_script(
        'wwt-yield',
        WWT_URL . 'assets/js/sheetyield.js',
        [ 'wwt-binpack' ], 
        WWT_VERSION,
        true
    );
}
add_action( 'wp_enqueue_scripts', 'wwt_register_assets' );
