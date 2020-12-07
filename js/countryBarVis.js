/* * * * * * * * * * * * * *
*       country Bars       *
* * * * * * * * * * * * * */

class CountryBarVis {

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
        vis.margin = {top: 20, left: 0, right: 0, bottom: 5};

        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .append("g")
            .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);

        // init vis tooltip
        vis.svg.append("text")
            .attr("transform", `translate(${vis.margin.left}, ${-10})`)
            // .attr('class', 'bar-tooltip')
            // .attr("font-family", "Arial Narrow")
            .style("font-size", "0.7vw")
            .style("fill", "gray")
            .attr("shape-rendering", "crispEdges")
            .text("Click country");

        vis.svg.append("text")
            .attr("transform", `translate(${vis.margin.left}, ${0})`)
            // .attr('class', 'bar-tooltip')
            // .attr("font-family", "Arial Narrow")
            .style("font-size", "0.7vw")
            .style("fill", "gray")
            .attr("shape-rendering", "crispEdges")
            .text("name to select!");

        // init vis titles
        vis.svg.append("text")
            .attr("transform", `translate(${vis.margin.left}, ${20})`)
            .attr('class', 'bar-title')
            // .style("font-size", "0.8vw")
            // .style("fill", "white")
            // .attr("font-weight", "bold")
            .attr("shape-rendering", "crispEdges")
            .text("Countries");

        // Set up scales
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

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

        // create list of all countries
        let list = Array.from(new Set(vis.data.map(d=>d.country)));

        // add all countries to selection list
        list.push("all countries");

        // sort selection list so that all countries is at the top
        // and country names are in alphabetical order
        vis.countryList = list.sort((a, b) => {
            return a.localeCompare(b, 'en', { sensitivity: 'base' });
        });
        // console.log(vis.countryList)

        // create counts by country
        vis.countryCounts = [];

        vis.countryList.forEach((entry) => {
            if (entry !== "") {
                let counts = 0;
                vis.filteredData.forEach((row) => {
                    if (entry === row.country) {
                        counts += +row.count;
                    }
                });
                vis.countryCounts.push({
                    country: entry,
                    count: counts
                });
            }
        });

        // Update the visualization
        vis.updateVis();
    }

    /* Update visualization */
    updateVis() {
        let vis = this;

        // Set x- & y-axis domains
        vis.x.domain([0, d3.max(vis.countryCounts, d=>+d.count)]);

        vis.text = vis.svg.selectAll(".country-text").data(vis.countryCounts, d=>d.country);

        // append legend rectangles
        vis.text.enter()
            .append("text")
            .merge(vis.text)
            .attr("class", "country-text")
            // .attr("x", 0)
            .attr("y", (d, i) => i * 30 + 40)
            .attr("dy", ".35em")
            // .style("font-family", "Montserrat")
            // .style("shape-rendering", "crispEdges")
            .style("font-size", function (d) {
                if (d.country === selectedCountry) {
                    return "0.85vw";
                } else {
                    return "0.8vw";
                }
            })
            .style("fill", function (d) {
                if (d.country === selectedCountry) {
                    return whiteWineColor;
                } else {
                    return "lightgray";
                }
            })
            .text(function (d) {
                // console.log(d);
                if (d.country === "United States of America") {
                    return "USA";
                } else if (d.country === "United Kingdom") {
                    return "UK";
                } else {
                    return d.country;
                }
            })
            .on("mouseover", function (event) {
                d3.select(this)
                    .style("fill", "white")
                    .style("font-size", "0.85vw")
                    .style("font-weigth", "bold");
            })
            .on("mouseout", function (event, d) {
                if (d.country === selectedCountry) {
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
                if (event.target.innerHTML === selectedCountry) {
                    console.log(this)
                    d3.select(this)
                        .style("fill", "lightgray")
                        .style("font-size", "0.8vw")
                        .style("font-weigth", "normal");

                    selectedCountry = "all countries"

                    myBrushVis.wrangleData();
                    myCircularVis.wrangleData();
                    myColorBarVis.wrangleData();
                    myCountryBarVis.wrangleData();
                    // myFilterList.wrangleData();
                    myImageVis.updateVis();
                    myMapVis.wrangleData();
                    myScatterVis.wrangleData();
                    myStyleBarVis.wrangleData();
                    mySweetnessBarVis.wrangleData();
                } else {
                    d3.selectAll(".country-text")
                        .style("fill", "lightgray")
                        .style("font-size", "0.8vw")

                    d3.select(this)
                        .style("fill", whiteWineColor)
                        .style("font-size", "0.85vw")
                        .style("font-weigth", "bold")

                    if (event.target.innerHTML === "USA") {
                        selectedCountry = "United States of America";
                    } else if (event.target.innerHTML === "UK") {
                        selectedCountry = "United Kingdom";
                    } else {
                        selectedCountry = event.target.innerHTML;
                    }

                    myBrushVis.wrangleData();
                    myCircularVis.wrangleData();
                    myColorBarVis.wrangleData();
                    myCountryBarVis.wrangleData();
                    // myFilterList.wrangleData();
                    myImageVis.updateVis();
                    myMapVis.wrangleData();
                    myScatterVis.wrangleData();
                    myStyleBarVis.wrangleData()
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

        // append legend histogram for color
        vis.rect = vis.svg.selectAll(".country-rect").data(vis.countryCounts, d => d.country);

        // draw circles
        vis.rect.enter()
            .append("rect")
            .merge(vis.rect)
            .attr("class", "country-rect")
            .attr("opacity", 0)
            // .attr("x", 0)
            .attr("y", (d, i) => i * 30 + 50)
            .attr("height", 5)
            .attr("width", d=>vis.x(0))
            .transition()
            .duration(transitionDuration)
            // .attr("x", 0)
            .attr("y", (d, i) => i * 30 + 50)
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