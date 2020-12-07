/* * * * * * * * * * * * * *
*      sweetness Bars      *
* * * * * * * * * * * * * */

class SweetnessBarVis {

    /* Constructor method */
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        // console.log(this.data)

        this.initVis();
    }


    /* Initialize visualization */
    initVis () {
        let vis = this;

        // setup margins, height, and width
        vis.margin = {top: 20, left: 0, right: 20, bottom: 5};

        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .append("g")
            .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);

        // init vis titles
        vis.svg.append("text")
            .attr("transform", `translate(${vis.margin.left}, ${-10})`)
            .attr('class', 'bar-title')
            // .style("font-size", "0.8vw")
            // .style("fill", "white")
            // .attr("font-weight", "bold")
            .attr("shape-rendering", "crispEdges")
            .text("Sweetness Levels");

        // init vis scale tooltip
        vis.svg.append("g")
            .attr("transform", `translate(${vis.width - vis.margin.right / 2}, ${50})`)
            .append("text")
            // .attr('class', 'bar-tooltip')
            .attr("font-size", "0.8vw")
            .attr("fill", "gray")
            .attr("font-anchor", "start")
            .attr("shape-rendering", "crispEdges")
            .attr("transform", `rotate(90)`)
            .text("less sweet");

        vis.svg.append("g")
            .attr("transform", `translate(${vis.width - vis.margin.right / 2}, ${120})`)
            .append("text")
            // .attr('class', 'bar-tooltip')
            .attr("font-size", "0.8vw")
            .attr("fill", "gray")
            .attr("font-anchor", "end")
            .attr("shape-rendering", "crispEdges")
            .attr("transform", `rotate(90)`)
            .text("more sweet");

        // Add the arrowhead marker definition to the svg element
        vis.svg.append('defs')
            .append('marker')
            .attr('id', 'arrow-start')
            .attr('viewBox', [0, 0, 20, 20])
            .attr('refX', 10)
            .attr('refY', 10)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', d3.line()([[0, 0], [0, 20], [20, 10]]))
            .attr('stroke', 'gray')
            .attr('fill', "gray");

        vis.svg
            .append('defs')
            .append('marker')
            .attr('id', 'arrow-end')
            .attr('viewBox', [0, 0, 20, 20])
            .attr('refX', 10)
            .attr('refY', 10)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', d3.line()([[0, 0], [0, 20], [20, 10]]))
            .attr('stroke', 'gray')
            .attr('fill', "gray");

        // Add the line with arrowhead at the end
        vis.svg.append('path')
            .attr('d', d3.line()([[vis.width - vis.margin.right / 1.5, 40], [vis.width - vis.margin.right / 1.5, 191]]))
            .attr('stroke', 'gray')
            .attr('marker-start', 'url(#arrow-start)')
            .attr('marker-end', 'url(#arrow-end)')
            .attr('fill', 'none');

        // Set up scales
        vis.x = d3.scaleLinear()
            .range([0, vis.width - vis.margin.right]);

        vis.wrangleData();
    }


    /* Data wrangling */
    wrangleData () {
        let vis = this;

        // filter list for selected country
        let dataFilteredForCountry = [];
        if (selectedCountry !== "all countries") {
            vis.data.forEach((row) => {
                if (row.country === selectedCountry & +row.price > 0) {
                    dataFilteredForCountry.push(row);
                }
            });
        } else {
            // vis.data.forEach((row) => {
            //     if (row.top_ten === "True") {
            //         dataFilteredForCountry.push(row);
            //     }
            // });
            dataFilteredForCountry = vis.data;
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
        let dataFilteredForSweetness = [];
        if (selectedSweetness !== "all sweetness levels") {
            dataFilteredForColor.forEach((row) => {
                if (row.sweetness === selectedSweetness) {
                    dataFilteredForSweetness.push(row);
                }
            });
        } else {
            dataFilteredForSweetness = dataFilteredForColor;
        }

        // Add brush loop here
        vis.filteredData = [];
        if (selectedPriceRange.length !== 0) {
            // console.log('range selected', selectedPriceRange, selectedPriceRange[0], selectedPriceRange[1])
            dataFilteredForSweetness.forEach(row => {
                if (selectedPriceRange[0] <= +row.price && +row.price <= selectedPriceRange[1]) {
                    vis.filteredData.push(row);
                }
            });
        } else {
            vis.filteredData = dataFilteredForSweetness;
        }

        // create list of all sweetness levels
        let list = Array.from(new Set(vis.data.map(d=>d.sweetness)));

        // add all countries to selection list
        list.push("all sweetness levels");

        // sort selection list so that all sweetness levels is at the top
        // and sweetness levels are in dryness order
        vis.sweetnessList = list.sort((a, b) => {
            return sweetnessSorter.getOrderNumber(a) - sweetnessSorter.getOrderNumber(b)});
        // console.log(vis.sweetnessList)

        // create counts by sweetness level
        vis.sweetnessCounts = [];

        vis.sweetnessList.forEach((entry) => {
            if (entry !== "") {
                let counts = 0;
                vis.filteredData.forEach((row) => {
                    if (entry === row.sweetness) {
                        // get full state name
                        counts += +row.count;
                    }
                });
                vis.sweetnessCounts.push({
                    sweetness: entry,
                    count: counts
                });
            }
        });
        // console.log(vis.sweetnessCounts)

        // Update the visualization
        vis.updateVis();
    }

    /* Update visualization */
    updateVis() {
        let vis = this;

        // Set x- & y-axis domains
        vis.x.domain([0, d3.max(vis.sweetnessCounts, d=>+d.count)]);

        vis.text = vis.svg.selectAll(".sweetness-text").data(vis.sweetnessCounts, d=>d.sweetness);

        // append legend rectangles
        vis.text.enter()
            .append("text")
            .merge(vis.text)
            .attr("class", "sweetness-text")
            // .attr("x", 0)
            .attr("y", (d, i) => i * 30 + 10)
            .attr("dy", ".35em")
            // .style("font-family", "Montserrat")
            // .style("shape-rendering", "crispEdges")
            .style("font-size", function (d) {
                if (d.sweetness === selectedSweetness) {
                    return "0.85vw";
                } else {
                    return "0.8vw";
                }
            })
            .style("fill", function (d) {
                if (d.sweetness === selectedSweetness) {
                    return whiteWineColor;
                } else {
                    return "lightgray";
                }
            })
            .text(d=>d.sweetness)
            .on("mouseover", function (event) {
                d3.select(this)
                    .style("fill", "white")
                    .style("font-size", "0.85vw")
                    .style("font-weigth", "bold");
            })
            .on("mouseout", function (event, d) {
                if (d.sweetness === selectedSweetness) {
                    d3.select(this)
                        .style("fill", whiteWineColor)
                        .style("font-size", "0.85vw")
                        .style("font-weigth", "bold");
                } else {
                    d3.select(this)
                        .style("fill", "lightgray")
                        .style("font-size", "0.8vw")
                        .style("font-weigth", "normal");
                }
            })
            .on("click", function (event) {
                // console.log(event.target.innerHTML)
                if (event.target.innerHTML === selectedSweetness) {
                    d3.select(this)
                        .style("fill", "lightgray")
                        .style("font-size", "0.8vw")
                        .style("font-weigth", "normal");

                    selectedSweetness = "all sweetness levels"

                    myBrushVis.wrangleData();
                    myCircularVis.wrangleData();
                    myColorBarVis.wrangleData();
                    myCountryBarVis.wrangleData();
                    // myFilterList.wrangleData();
                    myMapVis.wrangleData();
                    myScatterVis.wrangleData();
                    myStyleBarVis.wrangleData();
                    mySweetnessBarVis.wrangleData();
                } else {
                    d3.selectAll(".sweetness-text")
                        .style("fill", "lightgray")
                        .style("font-size", "0.8vw")

                    d3.select(this)
                        .style("fill", whiteWineColor)
                        .style("font-size", "0.85vw")
                        .style("font-weigth", "bold")

                    selectedSweetness = event.target.innerHTML;

                    myBrushVis.wrangleData();
                    myCircularVis.wrangleData();
                    myColorBarVis.wrangleData();
                    myCountryBarVis.wrangleData();
                    // myFilterList.wrangleData();
                    myMapVis.wrangleData();
                    myScatterVis.wrangleData();
                    myStyleBarVis.wrangleData();
                    mySweetnessBarVis.wrangleData();
                }
            });

        vis.text.exit()
            .style("fill", "white")
            .style("font-size", "0.85vw")
            .style("font-weigth", "bold")
            .transition()
            .duration(transitionDuration)
            .style("fill", "lightgray")
            .style("font-size", "0.8vw")
            .remove();

        // append legend histogram for sweetness
        vis.rect = vis.svg.selectAll(".sweetness-rect").data(vis.sweetnessCounts, d => d.sweetness);

        // draw circles
        vis.rect.enter()
            .append("rect")
            .merge(vis.rect)
            .attr("class", "sweetness-rect")
            .attr("opacity", 0)
            // .attr("x", 0)
            .attr("y", (d, i) => i * 30 + 20)
            .attr("height", 5)
            .attr("width", d=>vis.x(0))
            .transition()
            .duration(transitionDuration)
            // .attr("x", 0)
            .attr("y", (d, i) => i * 30 + 20)
            .attr("height", 5)
            .attr("width", d=>vis.x(d.count))
            .attr("fill", coolClimateColor)
            // .attr("shape-rendering", "geometricPrecision")
            .attr("opacity", 1);

        vis.rect.exit()
            .attr("opacity", 1)
            .transition()
            .duration(transitionDuration)
            .attr("opacity", 0)
            .remove();
    }
}

/* * * * * * * * * * * * * *
*     SweetnessSorter      *
* * * * * * * * * * * * * */

class SweetnessSorter {
    constructor() {
        this.sweetness = [
            ["all sweetness levels", 0],
            ["Bone-Dry", 1],
            ["Brut Nature", 2],
            ["Extra Brut", 3],
            ["Brut", 4],
            ["Dry", 5],
            ["Off-Dry", 6],
            ["Semi-Sweet", 7],
            ["Sweet", 8],
            ["Very Sweet", 9]
        ]
    }

    getOrderNumber(input) {
        let that = this
        let output = '';
        that.sweetness.forEach(row => {
            if (row[0] === input) {
                output = row[1]
            }
        })
        return output
    }
}

let sweetnessSorter = new SweetnessSorter()
