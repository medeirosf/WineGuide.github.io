/* * * * * * * * * * * * * *
*     class BrushVis       *
* * * * * * * * * * * * * */

BrushVis = function(parentElement, data) {
    this.parentElement = parentElement;
    this.data = data;

    // call method initVis
    this.initVis();
};

// init brushVis
BrushVis.prototype.initVis = function() {
    let vis = this;

    vis.margin = {top: 20, left: 20, right: 20, bottom: 20};
    vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // clip path
    vis.svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("height", vis.height)
        .attr("width", vis.width);

    // add title
    vis.svg.append('g')
        .attr('class', 'brush-title')
        .attr('transform', `translate(${vis.width/2}, ${-5})`)
        .append('text')
        // .style('text-anchor', 'middle')
        // .style("font-size", "11px")
        // .style("fill", "lightgray")
        .text('Range of Prices (US $)');

    // init y axis label group
    vis.svg.append("text")
        .attr("transform", `translate(${vis.margin.left}, ${-10})`)
        .attr('class', 'y-axis-lable')
        // .style("font-size", "11px")
        // .style("fill", "darkgrey")
        // .attr("font-weight", "bold")
        .style("text-anchor", "end")
        .text("Count");

    // init scales
    vis.x = d3.scaleLinear().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    // init x & y axis
    vis.xAxis = vis.svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate (${vis.margin.left}, ${vis.height})`);
    vis.yAxis = vis.svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", `translate (${vis.margin.left}, ${0})`);

    // init pathGroup
    vis.pathGroup = vis.svg.append('g').attr('class','pathGroup')
        .attr("transform", `translate (${vis.margin.left}, ${0})`);

    // init path
    vis.path = vis.pathGroup
        .append('path')
        .attr("class", "pathTwo");

    // init path generator
    vis.area = d3.area()
        .curve(d3.curveStep)
        .x(d=>vis.x(d.price))
        .y0(vis.y(0))
        .y1(d=>vis.y(d.reviews));

    // init brushGroup:
    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush")
        .attr("transform", `translate (${vis.margin.left}, ${0})`);

    // init brush
    vis.brush = d3.brushX()
        .extent([[0, 0], [vis.width , vis.height]]);

    // init basic data processing
    this.wrangleData();
};

// init data processing - prepares data for brush
BrushVis.prototype.wrangleData = function(){
    let vis = this;

    vis.filteredData = [];

    // filter
    let dataFilteredForCountry = [];
    if (selectedCountry !== "all countries") {
        vis.data.forEach((row) => {
            if (row.country === selectedCountry & +row.price > 0) {
                dataFilteredForCountry.push(row);
            }
        });
    } else {
        vis.data.forEach((row) => {
            if (row.top_ten === "True") {
                dataFilteredForCountry.push(row);
            }
        });
    }
    // console.log(dataFilteredForCountry);

    // filter list for selected wine style
    let dataFilteredForStyle = [];
    if (selectedStyle !== "all styles") {
        dataFilteredForCountry.forEach((row) => {
            if (row.style === selectedStyle) {
                dataFilteredForStyle.push(row);
            }
        });
    } else {
        dataFilteredForStyle = dataFilteredForCountry;
    }
    // console.log(dataFilteredForStyle);

    // filter list for selected wine color
    let dataFilteredForColor = [];
    if (selectedColor !== "all colors") {
        dataFilteredForStyle.forEach((row) => {
            if (row.color === selectedColor) {
                dataFilteredForColor.push(row);
            }
        });
    } else {
        dataFilteredForColor = dataFilteredForStyle;
    }
    // console.log(dataFilteredForColor);

    // filter list for selected wine sweetness levels
    vis.filteredData = [];
    if (selectedSweetness !== "all sweetness levels") {
        dataFilteredForColor.forEach((row) => {
            if (row.sweetness === selectedSweetness) {
                vis.filteredData.push(row);
            }
        });
    } else {
        vis.filteredData = dataFilteredForColor;
    }
    // console.log("scatterVis vis.filterData", vis.filteredData);

    // rearrange data structure and group by state
    let dataByPrice = Array.from(d3.group(vis.filteredData, d => +d.price), ([key, value]) => ({key, value})).sort((a, b) => { return a.key - b.key; });


    vis.displayData = [];

    // iterate over each year
    dataByPrice.forEach( price => {
        let tmpCountReviews = 0;
        price.value.forEach((entry, i) => {
            tmpCountReviews = i++;
        });

        vis.displayData.push({ price: price.key, reviews: tmpCountReviews });
    });

    // Update the visualization
    this.updateVis();
};

// updateVis
BrushVis.prototype.updateVis = function() {
    let vis = this;

    // update domains
    vis.x.domain([d3.min(vis.displayData, d => d.price) - 1, d3.max(vis.displayData, d => d.price) * 1.03]);
    vis.y.domain([0, d3.max(vis.displayData, d => d.reviews)]);

    vis.brush.on("brush end", function (event) {
        if (event.selection !== null) {
            selectedPriceRange = [vis.x.invert(event.selection[0]), vis.x.invert(event.selection[1])];
        } else {
            selectedPriceRange = [];
        }

        myBrushVis.updateVis();
        myCircularVis.wrangleData();
        myColorBarVis.wrangleData();
        myCountryBarVis.wrangleData();
        myMapVis.wrangleData();
        myScatterVis.wrangleData();
        myStyleBarVis.wrangleData();
        mySweetnessBarVis.wrangleData();
    });

    vis.brushGroup
        .call(vis.brush);

    // draw path
    vis.path.datum(vis.displayData, d=>d.price)
        .attr("opacity", .3)
        .transition()
        .duration(transitionDuration)
        .attr("opacity", 1)
        .attr("d", vis.area)
        .attr('fill', function () {
            if (selectedColor === "Rosé") {
                return roseWineColor;
            } else if (selectedColor === "White") {
                return whiteWineColor;
            } else {
                return redWineColor;
            }
        })
        .attr("stroke", function () {
            if (selectedColor === "Rosé") {
                return roseWineColor;
            } else if (selectedColor === "White") {
                return whiteWineColor;
            } else {
                return redWineColor;
            }
        })
        .attr("clip-path", "url(#clip)");

    // draw x & y axis
    vis.xAxis.transition()
        .attr("opacity", .3)
        .transition()
        .duration(transitionDuration)
        .attr("opacity", 1)
        .call(d3.axisBottom(vis.x));
    vis.yAxis
        .attr("opacity", .3)
        .transition()
        .duration(transitionDuration)
        .attr("opacity", 1)
        .call(d3.axisLeft(vis.y).ticks(2));

    // init brush tooltip
    vis.text = vis.svg.selectAll(".brush-tip").data([selectedPriceRange.length]);

    // enter and append brush tooltip
    vis.text.enter().append("text")
        .merge(vis.text)
        .attr("transform", `translate(${vis.width}, ${-5})`)
        .attr('class', 'brush-tip')
        .style("font-size", "0.7vw")
        .style("text-anchor", "end")
        .style("fill", function (d) {
            if (d !== 0) {
                return "gray";
            } else {
                return "none";
            }
        })
        .text("click chart area outside brush to reset price range");

    // remove brush tooltip
    vis.text.exit().remove();
}