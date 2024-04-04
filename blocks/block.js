((blocks, editor, i18n, element, components, _, blockEditor) => {
    const el = element.createElement;
    const { __ } = i18n;
    const {
        InspectorControls,
        useBlockProps,
    } = blockEditor;
    const {
        registerBlockType
    } = blocks;
    const {
        // BlockDescription,
        RangeControl,
        Button,
        ButtonGroup,
        PanelBody,
        RadioControl,
        TextControl,
        ToggleControl,
        FontSizePicker,
        ColorPalette,
    } = components;

    registerBlockType('mc-custom-block/mc-post-fetcher', {
        title: __('MC Post Fetcher', 'mc-custom-block'),
        description: __('Will fetch the latest post from WPTavern and display them as slideshow.', 'mc-custom-block'),
        apiVersion: 2,
        icon: 'book',
        category: 'layout',
        example: {},
        attributes: {
            content: {
                type: 'object',
                default: [],
            },
            lastFetch: {
                type: 'string',
                default: ''
            },
            fetchSite: {
                type: 'string',
                default: 'https://wptavern.com'
            },
            selectedDesign: {
                type: 'string',
                default: 'default'
            },
            arrowColor: {
                type: 'string',
                default: '#333'
            },
            arrowSize: {
                type: 'number',
                default: 24
            },
            arrowBg: {
                type: 'string',
                default: '#FFF'
            },
            autoSlide: {
                type: 'boolean',
                default: false
            },
            autoSlideDelay: {
                type: 'number',
                default: 3
            },
            slideTransitionEffect: {
                type: 'string',
                default: 'fade'
            },
        },

        edit: (props) => {
            const attributes = props.attributes;
            const fetchSite = attributes.fetchSite;
            const lastFetch = attributes.lastFetch;
            const selectedDesign = attributes.selectedDesign;

            const arrowColors = [
                { name: 'Black', slug: 'black', color: '#333' },
                { name: 'Gray', slug: 'gray', color: '#888' },
                { name: 'White', slug: 'white', color: '#fff' },
            ];
            const arrowColor = attributes.arrowColor;
            const arrowSize = attributes.arrowSize;
            const arrowBg = attributes.arrowBg;
            const autoSlide = attributes.autoSlide;
            const autoSlideDelay = attributes.autoSlideDelay;
            const slideTransitionEffect = attributes.slideTransitionEffect;

            let cachedContent = {};
            let cachedTimestamps = {};
            let expirationTime = 3600000; // 1 hour

            const onDesignChange = (value) => {
                props.setAttributes({ selectedDesign: value })
            }

            const updateLastFetch = () => {
                const currentTime = new Date().toString();
                props.setAttributes({ lastFetch: currentTime })
            }

            const updateContent = () => {
                fetchData()
            }

            const setFetchError = (error) => {
                const fetchErrorEl = document.getElementById('mc-fetch-error');
                fetchErrorEl.innerText = error;
            }

            const validateURL = (url) => {
                const urlPattern = /^(https?):\/\/([\w.-]+)(\/[^\s]*)?$/;

                if (!urlPattern.test(url)) {
                    throw new Error("Invalid URL format");
                }

                return true;
            }

            const fetchButtonLoading = (isLoading) => {
                const fetchBtn = document.getElementById('mc-fetch-button');
                fetchBtn.disabled = isLoading;
                fetchBtn.innerText = isLoading ? 'Fetching data..' : 'Fetch';
                fetchBtn.classList.toggle('mc-button-loading', isLoading);
            };

            const fetchData = () => {
                const defaultSite = "https://wptavern.com";
                const url = fetchSite ? fetchSite : defaultSite;
                const completeUrl = `${url}/wp-json/wp/v2/posts`

                setFetchError("");
                fetchButtonLoading(true);

                try {
                    if (!validateURL(url)) {
                        throw new Error("Invalid URL");
                    }

                    loadCachedData(completeUrl);
                } catch (error) {
                    setFetchError(`Invalid URL: ${error.message}`);
                    fetchButtonLoading(false);
                }
            }

            function clearAllCachedData() {
                Object.keys(localStorage).forEach(function (key) {
                    if (key.startsWith('mcPostFetcherContent_') || key.startsWith('mcPostFetcherCacheTimestamp_')) {
                        localStorage.removeItem(key);
                    }
                });
                alert('All cached data cleared successfully.');
            }

            function loadCachedData(url) {
                var cachedContentData = localStorage.getItem('mcPostFetcherContent_' + url);
                var cachedTimestamp = localStorage.getItem('mcPostFetcherCacheTimestamp_' + url);
                if (cachedContentData && cachedTimestamp) {
                    if ((Date.now() - parseInt(cachedTimestamp)) < expirationTime) {
                        content = JSON.parse(cachedContentData);
                        props.setAttributes({ content: content });
                    } else {
                        fetchFreshData(url);
                    }
                } else {
                    fetchFreshData(url);
                }
            }

            function fetchFreshData(url) {
                fetch(url)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status}`);
                        }

                        return response.json();
                    })
                    .then((posts) => {
                        localStorage.setItem('mcPostFetcherContent_' + url, JSON.stringify(posts));
                        localStorage.setItem('mcPostFetcherCacheTimestamp_' + url, Date.now());
                        props.setAttributes({ content: posts });

                        updateLastFetch();
                    })
                    .catch((error) => {
                        setFetchError(`Could not fetch posts: ${error}`);
                    })
                    .finally(() => {
                        fetchButtonLoading(false);
                    });
            }


            const renderView = () => {
                return [
                    el(
                        InspectorControls,
                        {},

                        el(
                            PanelBody,
                            { title: 'Content', initialOpen: true },

                            el(TextControl, {
                                help: __('Put Rest endpoint into the text box then click button fetch to get the posts', 'mc-custom-block'),
                                label: __('Fetch URL', 'mc-custom-block'),
                                value: fetchSite,
                                placeholder: __('Default to WPTavern'),
                                onChange: (value) => {
                                    props.setAttributes({ fetchSite: value });
                                },
                            }),

                            el(ButtonGroup,
                                {},

                                el(Button, {
                                    id: 'mc-fetch-button',
                                    children: __("Fetch", 'mc-custom-block'),
                                    variant: "primary",
                                    onClick: updateContent
                                }
                                ),

                                el(Button, {
                                    id: 'mc-clearcache-button',
                                    children: __("Clear Cache", 'mc-custom-block'),
                                    variant: "secondary",
                                    onClick: clearAllCachedData,
                                }
                                ),
                            ),

                            el("div", { id: 'mc-fetch-error', class: 'mc-fetch-error' },
                                el("small", null, ""),
                            ),

                            el("div", null,
                                el("small", null, sprintf(__('Last fetch on %s', 'mc-custom-block'), lastFetch)),
                            ),
                        ),

                        el(PanelBody,
                            { title: "Slides" },

                            // Auto slide toggle
                            el(ToggleControl,
                                {
                                    checked: autoSlide,
                                    label: __('Enable Auto Slide', 'mc-custom-block'),
                                    onChange: () => props.setAttributes({ autoSlide: !autoSlide })
                                }
                            ),

                            // Slide delay
                            el(RangeControl,
                                {
                                    label: "Auto slide delay",
                                    max: 5,
                                    min: 1,
                                    checked: autoSlideDelay,
                                    label: __('Enable Auto Slide', 'mc-custom-block'),
                                    onChange: (value) => props.setAttributes({ autoSlideDelay: value })
                                }
                            ),

                            // Slide transition effect
                            el(RadioControl, {
                                label: __('Transition effect', 'mc-custom-block'),
                                options: [
                                    {
                                        label: 'Fade',
                                        value: 'fade'
                                    },
                                    {
                                        label: 'Slide',
                                        value: 'slide'
                                    }
                                ],
                                selected: slideTransitionEffect,
                                onChange: (value) => props.setAttributes({ slideTransitionEffect: value })
                            }),
                        ),

                        el(PanelBody,
                            { title: "Design" },

                            // Select slide design
                            el(
                                "div",
                                {
                                    style: {
                                        'margin-top': "16px",
                                    }
                                },

                                el(RadioControl, {
                                    id: 'designChoice',
                                    label: __('Design choice', 'mc-custom-block'),
                                    options: [
                                        {
                                            label: 'Default',
                                            value: 'default'
                                        },
                                        {
                                            label: 'Design 2',
                                            value: 'design2'
                                        },
                                        {
                                            label: 'Design 3',
                                            value: 'design3'
                                        }
                                    ],
                                    selected: selectedDesign,
                                    onChange: (e) => { onDesignChange(e) },
                                }),
                            ),
                        ),

                        el(PanelBody,
                            { title: 'Arrow' },

                            el(ColorPalette, {
                                value: arrowBg,
                                disableCustomColors: true,
                                colors: [{
                                    colors: [
                                        ...arrowColors,
                                        { name: 'transparent', slug: 'transparent', color: 'transparent' },
                                    ],
                                    name: __('Background Color', 'mc-custom-block'),
                                }],
                                onChange: (value) => {
                                    props.setAttributes({ arrowBg: value || 'transparent' });
                                },
                            }),

                            // Arrow color
                            el(ColorPalette, {
                                name: 'Arrow Color',
                                value: arrowColor,
                                disableCustomColors: true,
                                colors: [{
                                    colors: [
                                        ...arrowColors,
                                    ],
                                    name: __('Arrow Color', 'mc-custom-block'),
                                }],
                                onChange: (value) => {
                                    props.setAttributes({ arrowColor: value });
                                },
                            }),

                            // Arrow size
                            el(FontSizePicker,
                                {
                                    fontSizes: [
                                        {
                                            name: 'Small',
                                            size: 24,
                                            slug: 'small'
                                        },
                                        {
                                            name: 'Normal',
                                            size: 32,
                                            slug: 'normal'
                                        },
                                        {
                                            name: 'Big',
                                            size: 40,
                                            slug: 'big'
                                        }
                                    ],
                                    units: [
                                        'px',
                                        'em',
                                        'rem'
                                    ],
                                    value: arrowSize,
                                    onChange: (value) => {
                                        props.setAttributes({ arrowSize: value || 24 });
                                    },
                                }
                            )
                        ),


                    ),

                    // Main code for preview
                    el(
                        "div",
                        useBlockProps({
                            className: selectedDesign,
                        }),

                        // Slideshow wrapper
                        el(
                            "div",
                            { class: "mc-slideshow" },

                            // Slide item
                            el(
                                "div",
                                { class: "mc-slide" },

                                // Image wrapper
                                el(
                                    "div", { class: "mc-image" },
                                    el("img", { src: "https://placehold.co/600x400?text=Placeholder", alt: "" }),
                                ),

                                // Text content
                                el(
                                    "div", { class: "mc-text-content" },
                                    el("h4", null, "Your awesome title"),
                                    el("p", null, "Your awesome paragraph"),
                                    el("small", null, `Posted on Jan 12, 2023`)
                                )
                            )
                        ),

                        // Previous arrow
                        el(
                            'div',
                            {
                                class: "mc-prev",
                                style: {
                                    'color': arrowColor,
                                    'font-size': arrowSize,
                                    'background-color': arrowBg,
                                },
                                onClick: () => changeSlide(-1)
                            },
                            "\u276E",
                        ),

                        // Next arrow
                        el(
                            "div",
                            {
                                class: 'mc-next',
                                style: {
                                    'color': arrowColor,
                                    'font-size': arrowSize,
                                    'background-color': arrowBg,
                                },
                                onclick: () => changeSlide(1),
                            },
                            "\u276F",
                        )
                    )
                ]
            }

            return (
                renderView()
            )
        },

        save: () => null,
    })
} )(
	window.wp.blocks,
	window.wp.editor,
	window.wp.i18n,
	window.wp.element,
	window.wp.components,
	window._,
	window.wp.blockEditor
);