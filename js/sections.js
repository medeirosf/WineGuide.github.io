class SectionsVis {

    /*
     *  Constructor method
     */
    constructor(parentElement, geoData, countries, states) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.countries = countries;
        this.states = states;

        this.initVis();
    }

    initVis () {
        let vis = this;

        var southWest = L.latLng(90, -170),
            northEast = L.latLng(-180, 180),
            bounds = L.latLngBounds(southWest, northEast);

        /*var southWest = L.latLng(-170, 90),
            northEast = L.latLng(180, -180),
            bounds = L.latLngBounds(southWest, northEast);*/

        // Initialize the map object
        vis.map = L.map('sections-vis', {
            attributionControl: false,
            zoomControl: false,
            scrollWheelZoom: false,
            dragging: false,
            maxBounds: bounds,
        })
            .setView([30, 10], 2);

        // Add a tile layer to the map
        // Light map
        /*L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
        }).addTo(vis.map);
         */

        // Dark map
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd'
        }).addTo(vis.map);

        //vis.map.fitBounds(bounds);

        var svg = d3.select(vis.map.getPanes().overlayPane).append("svg");
        var g = svg.append("g").attr("class", "leaflet-zoom-hide");

        // using d3 for convenience
        var main = d3.select("main");
        var scrolly = main.select("#scrolly");
        var figure = scrolly.select("figure");
        var article = scrolly.select("article");
        var step = article.selectAll(".step");

        // initialize the scrollama
        var scroller = scrollama();

        // generic window resize listener event
        function handleResize() {
            // 1. update height of step elements
            var stepH = Math.floor(window.innerHeight * 0.20);
            //console.log("stepH", stepH);
            step
                .style("height", stepH + "px")

            var figureHeight = window.innerHeight / 2;
            var figureMarginTop = (window.innerHeight - figureHeight) / 6;

            figure
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            // 3. tell scrollama to update new element dimensions
            scroller.resize();
        }


        // scrollama event handlers
        function handleStepEnter(response) {
            //console.log(response);
            //response = { element, direction, index }

            // add color to current step only
            step.classed("is-active", function(d, i) {
                return i === response.index;
            });

            // update graphic based on step
            figure.select("#sections-vis")
            if (response.index == 0 && response.direction == "down") {

                vis.geoLayer = L.geoJson([vis.countries, vis.states], {
                    style: function () {
                        return {
                            stroke: false,
                            color: 'white',
                            opacity: 0.0,
                            fillOpacity: 0.0,
                        }
                    }
                }).addTo(vis.map);

            } else if (response.index == 1 && response.direction == "down") {

                updateColors(warmFilterCountries, "#FF7373", 0.8);
                updateColors(warmFilterStates, "#FF7373", 0.8);

            } else if (response.index == 2 && response.direction == "down") {

                updateColors(coldFilterCountries, "#72D4FF", 0.8);
                updateColors(coldFilterStates, "#72D4FF", 0.8);
            } else if (response.index == 0 && response.direction == "up") {

                vis.map.removeLayer(vis.geoLayer)
                updateColors(warmFilterCountries, "#FF7373", 1.0);
                updateColors(warmFilterStates, "#FF7373", 1.0);

            } else if (response.index == 1 && response.direction == "up") {

                updateColors(coldFilterCountries, 'black', 1.0);
                updateColors(coldFilterStates, 'black', 1.0);

            }
        }

        function setupStickyfill() {
            d3.selectAll(".sticky").each(function() {
                Stickyfill.add(this);
            });
        }

        function init() {
            setupStickyfill();

            // 1. force a resize on load to ensure proper dimensions are sent to scrollama
            handleResize();

            // 2. setup the scroller passing options
            // this will also initialize trigger observations
            // 3. bind scrollama event handlers (this can be chained like below)
            scroller
                .setup({
                    step: "#scrolly article .step",
                    offset: 0.60,
                    debug: false
                })
                .onStepEnter(handleStepEnter);

            // setup resize event
            window.addEventListener("resize", handleResize);
        }

        // kick things off
        init();

        // sets color of each layer randomly
        function updateColors(filter, color_hex, opacity){

            vis.climateLayer = L.geoJson([vis.countries, vis.states], {
                filter: filter,
                //style: function (){
                //    return {color: color_hex}}
            }).addTo(vis.geoLayer);

            /*
            vis.geoLayer.eachLayer(function(layer){
                layer.setStyle({fillColor: color_hex});
            });
            */
            vis.geoLayer.eachLayer(function(layer){
                if (layer == vis.climateLayer){
                    layer.setStyle({
                        stroke: false,
                        color: color_hex,
                        opacity: opacity,
                        fillOpacity: opacity});
                }
            });
        }

        function warmFilterCountries(feature) {
            if (feature.properties.ADMIN === "Argentina" ||
                feature.properties.ADMIN === "Spain" ||
                feature.properties.ADMIN === "Portugal" ||
                feature.properties.ADMIN === "Italy" ||
                feature.properties.ADMIN === "Greece" ||
                feature.properties.ADMIN === "Israel" ||
                feature.properties.ADMIN === "Lebanon" ||
                feature.properties.ADMIN === "South Africa")
                return true
        }

        function warmFilterStates(feature) {
            if (feature.properties.NAME === "California" ||
                feature.properties.NAME === "Victoria" ||
                feature.properties.NAME === "New South Wales" ||
                feature.properties.NAME === "South Australia")
                return true
        }

        function coldFilterCountries(feature) {
            if (feature.properties.ADMIN === "France" ||
                feature.properties.ADMIN === "Germany" ||
                feature.properties.ADMIN === "New Zealand" ||
                feature.properties.ADMIN === "Austria" ||
                feature.properties.ADMIN === "Macedonia" ||
                feature.properties.ADMIN === "Hungary" ||
                feature.properties.ADMIN === "Switzerland" ||
                feature.properties.ADMIN === "United Kingdom" ||
                feature.properties.ADMIN === "Chile")
                return true
        }

        function coldFilterStates(feature) {
            if (feature.properties.NAME === "New York" ||
                feature.properties.NAME === "Oregon" ||
                feature.properties.NAME === "Washington" ||
                feature.properties.NAME === "Tasmania")
                return true
        }
    }
}

// Resources:
// https://pudding.cool/process/introducing-scrollama/
// https://github.com/russellgoldenberg/scrollama#examples
