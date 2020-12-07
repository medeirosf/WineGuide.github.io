
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class BarsVis {

    constructor (parentElement){
        this.parentElement = parentElement;

        this.acidScaleData = [
            { name: "0", color: "#99000d", start: 0, end: 70, info: ""},
            { name: "1", color: "#cb181d", start: 70, end: 140},
            { name: "2", color: "#ef3b2c", start: 140, end: 210, info: "Lemon", img: "lemon"},
            { name: "3", color: "#fb6a4a", start: 210, end: 260, info: "Sweet Whites"},
            { name: "3.1", color: "#fb6a4a", start: 260, end: 310, info: "Light-Bodied Whites"},
            { name: "3.5", color: "#fb6a4a", start: 310, end: 360, info: "Red and White Wines", img: "cups"},
            { name: "3.8", color: "#fb6a4a", start: 360, end: 410, info: "Low Acid Red Wines"},
            { name: "4", color: "#fc9272", start: 410, end: 460, info: "Very Low Acid Red Wines"},
            { name: "4.5", color: "#fc9272", start: 460, end: 510, info: "Coffee", img: "coffee"},
            { name: "5", color: "#fcbba1", start: 510, end: 580},
            { name: "6", color: "#fee0d2", start: 580, end: 650},
            { name: "7", color: "#FFFFFF", start: 650, end: 720, info: "Water", img: "water"},
            { name: "8", color: "#eff3ff", start: 720, end: 750},
            { name: "9", color: "#c6dbef", start: 750, end: 780},
            { name: "10", color: "#9ecae1", start: 780, end: 810},
            { name: "11", color: "#6baed6", start: 810, end: 840},
            { name: "12", color: "#4292c6", start: 840, end: 870},
            { name: "13", color: "#2171b5", start: 870, end: 900},
            { name: "14", color: "#084594", start: 900, end: 930}
        ]

        this.acidLabels = [
            { name: "High Acid", pos: 70},
            { name: "Acidic", pos: 360},
            { name: "Low Acid", pos: 545},
            { name: "Neutral", pos: 685},
            { name: "Alkaline", pos: 908}
        ]

        this.initVis();
    }

    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis(){
        let vis = this;

        vis.margin = { top: 110, right: 0, bottom: 60, left: 0 };

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
            vis.height = 300 - vis.margin.top - vis.margin.bottom;

        // console.log($("#" + vis.parentElement).width()) -> 1015
        // console.log(vis.height, vis.width) -> 200, 1015

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Legend group
        vis.acidityChart = vis.svg.append("g")
            .attr('class', 'acidity-scale')
            .attr("transform", `translate (${vis.margin.left / 2}, ${vis.margin.top / 2})`);

        vis.x = d3.scaleLinear()
            .range([0, vis.width])
            .domain([0, d3.max(vis.acidScaleData, d => d.end)]);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // acidity labels
        vis.svg.append("g")
            .attr('class', 'acidity title')
            .append("text")
            .text("pH Scale")
            .attr("transform", `translate(0, 149)`)
            .style("fill", "white")
            .style("font-family", "Montserrat")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .attr("text-anchor", "start")

        // acidity footnote
        vis.svg.append("g")
            .attr('class', 'acidity foot-note')
            .append("text")
            .text("Hover Over a Bar for Info")
            .attr("transform", `translate(500, 150)`)
            .style("fill", "darkgrey")
            .style("font-family", "Montserrat")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .attr("text-anchor", "middle")

        // acidity img references
        vis.svg.append('g')
            .data(vis.acidScaleData)
            .attr('class', 'acidity img')
            .append('svg:image')
            .attr('xlink:href', function (d) {
                if (d.name == 2 || d.name == 3.5 || d.name == 4.5 || d.name == 7) {
                    return 'img/' + d.img + '.svg'
                }})
            .attr('x', function (d) { return vis.x(d.end); })
            .attr('y', 0);

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData(){
        let vis = this;

        // No need to wrangleData

        // Update the visualization
        vis.updateVis();
    }


    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        // Create legend here
        vis.acidityChart.selectAll().data(vis.acidScaleData)
            .enter()
            .append("rect")
            .attr("x", function (d) { return vis.x(d.start); })
            .attr("y", 0)
            .attr("height", "50px")
            .attr("width", function (d) { return vis.x(d.end); })
            .style("fill", function (d) { return d.color; })
            .on('mouseover', function(event, d){
                if (d.name == "2" || d.name == "3" || d.name == "3.1" || d.name == "3.5" ||
                    d.name == "3.8" || d.name == "4" || d.name == "4.5" || d.name == "7") {
                    vis.tooltip
                        .style("opacity", 0.85)
                        .style("background-color", "white")
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("padding", "20px")
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + 10 + "px")
                        .html(`
         <div style="text-align: center;">
             <b>${d.info}</br>                                
         </div>`);
                }})

            .on('mouseout', function(event, d){
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

        vis.acidityChart.selectAll().data(vis.acidScaleData)
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return `translate(${vis.x(d.start) + vis.x(d.end - d.start)/2}, ${25})`;})
            .append("text")
            .text( function(d){
                if (d.name == "0" || d.name == "2" || d.name == "3" || d.name == "3.1" ||
                    d.name == "3.5" || d.name == "3.8" || d.name == "4" || d.name == "4.5" ||
                    d.name == "7" || d.name == "14")
                { return d.name; }
                else { return ""; }})
            .attr("dy", ".35em")
            .style("fill", function(d){
                if (d.name == 7) { return "black" }
                else {return "white"}})
            .style("font-family", "Montserrat")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .attr("text-anchor", "middle")
            //.attr("x", function (d) { return vis.x(0.5*d.start + 0.5*end); })
            //.attr("y", 0)
            .on('mouseover', function(event, d){
                if (d.name == "2" || d.name == "3" || d.name == "3.1" || d.name == "3.5" ||
                    d.name == "3.8" || d.name == "4" || d.name == "4.5" || d.name == "7") {
                    vis.tooltip
                        .style("opacity", 0.85)
                        .style("background-color", "white")
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("padding", "20px")
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + 10 + "px")
                        .html(`
         <div style="text-align: center;">
             <b>${d.info}</br>                                
         </div>`);
                }})

            .on('mouseout', function(event, d){
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

        vis.acidityChart.selectAll().data(vis.acidLabels)
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return `translate(${vis.x(d.pos)}, ${-25})`;})
            .append("text")
            .text( d => d.name)
            .style("fill", "white")
            .style("font-family", "Montserrat")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .attr("text-anchor", "middle")

    }
}
