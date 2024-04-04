<?php
/*
    Plugin Name: MC Post Fetcher
    Description: This plugin will give you one new custom Gutenberg block that allows you to fetch posts from multiple WP sites (Default WPTavern) and display them as slideshow on your WordPress site.
    Version: 0.1
    Author: Miretazam Ciptaprima
*/

function mc_custom_block_assets() {
    wp_enqueue_script(
        'mc-custom-block-editor',
        plugins_url('blocks/block.js', __FILE__),
        array('wp-blocks', 'wp-editor'),
        filemtime(plugin_dir_path(__FILE__) . 'blocks/block.js')
    );

    wp_enqueue_style(
        'mc-custom-block-editor-style',
        plugins_url('blocks/editor.css', __FILE__),
        array('wp-edit-blocks'),
        filemtime(plugin_dir_path(__FILE__) . 'blocks/editor.css')
    );
}

add_action('enqueue_block_editor_assets', 'mc_custom_block_assets');

function mc_custom_block_script()
{   
    wp_enqueue_style( 
        'mc_blocks_popover_style', 
        plugin_dir_url( __FILE__ ) . 'blocks/style.css' 
    );

    wp_enqueue_script( 
        'mc_blocks_popover_script', 
        plugin_dir_url( __FILE__ ) . 'blocks/script.js' 
    );
}
add_action('wp_enqueue_scripts', 'mc_custom_block_script');

function render_mc_custom_block($attributes) {
    $slides = $attributes['content'];
    $selectedDesign = $attributes['selectedDesign'] ?? 'default';
    $containerClass = get_block_wrapper_attributes(['class' => $selectedDesign]);
    $arrowColor = $attributes['arrowColor'] ?? '#333';
    $arrowSize = $attributes['arrowSize'] ?? '24px';
    $arrowBg = $attributes['arrowBg'] ?? '#FFF';
    $autoSlideEnabled = $attributes['autoSlide'] ?? false;
    $autoSlideDelay = $attributes['autoSlideDelay'] ?? 3;
    $slideTransitionEffect = $attributes['slideTransitionEffect'] ?? 'fade';
    
    ob_start();
    ?>
    <?php if($slides): ?>
    <style>
        .wp-block-mc-custom-block-mc-post-fetcher .mc-arrow {
            color: <?php echo $arrowColor; ?>;
            font-size: <?php echo $arrowSize; ?>px;
            background-color: <?php echo $arrowBg; ?>;
        }
    </style>

    <div <?php echo $containerClass; ?>>
        <div class="mc-slideshow">
            <?php foreach ($slides as $slide) : 
                $title = $slide['title']['rendered'];
                $image = $slide['jetpack_featured_media_url'];
                $date = new DateTime($slide['date']);
                $date_formatted = $date->format('d M Y');
                $link = $slide['link'];
                $excerpt = $slide['excerpt']['rendered'];
            ?>
                <div class="mc-slide">
                    <div class="mc-image">
                        <img src="<?php echo $image ?>" alt="<?php echo $title ?>" />   
                        <a class="mc-link" href="<?php echo $link ?>" target="_blank">
                        </a>
                    </div>
                    <div class="mc-text-content">
                        <h4><?php echo $title ?></h4>
                        <p><?php echo $excerpt ?></p>
                        <small><span>Posted on </span><?php echo $date_formatted ?></small>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        <div class="mc-prev mc-arrow" onclick="changeSlide(-1)">&#10094;</div>
        <div class="mc-next mc-arrow" onclick="changeSlide(1)">&#10095;</div>
    </div>

    <script>
        let mcSlideAutoSlideEnabled = <?php echo json_encode($autoSlideEnabled); ?>;
        let mcSlideAutoSlideDelay = <?php echo json_encode($autoSlideDelay) * 1000; ?>;
        let mcSlideTransitionStyle = <?php echo json_encode($slideTransitionEffect); ?>;
    </script>
    <?php endif; ?>
    <?php
    return ob_get_clean();
}

function mc_custom_block_register_block() {
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}
    register_block_type(
        'mc-custom-block/mc-post-fetcher',
        array(
            'api_version' => 2,
            'attributes'      => array(
                'content'    => array(
                    'type'      => 'object',
                    'default'   => [],
                ),
                'slides' => array(
                    'type'      => 'array',
                    'default'   => [],
                ),
                'lastFetch' => array(
                    'type'      => 'string',
                    'default'   => "0",
                ),
            ),
            'editor_script' => 'mc-custom-block-editor',
            'editor_style' => 'mc-custom-block-editor-style',
            'style' => 'mc-custom-block-style',
            'render_callback' => 'render_mc_custom_block',
        )
    );
}

add_action('init', 'mc_custom_block_register_block');
