
/*
 *  ScatterVis - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with wine magazine data
 *  @param _topTenData      -- Array with top ten province (by record count) wine magazine data
 */

class ScatterVis {

	/*
	 *  Constructor method
	 */
	constructor(parentElement, data) {
		this.parentElement = parentElement;
		this.data = data;
		this.displayData = [];
		// this.wineColor = {Red: "#A26DDB", Rosé: "#DB8AC6", White: "#F0D451", Unknown: "#BEBEBE"};
		this.wineColor = {Red: redWineColor, Rosé: roseWineColor, White: whiteWineColor, Unknown: unknownWineColor};
		this.visTitle = [{subtitle: "Wine Reviews from the Top Ten Regions"}, {subtitle: "Wine Reviews from Your selection"}]
		// console.log(this.visTitle[0].id);

		this.initVis();
	}


	/*
	 *  Initialize vis
	 */
	initVis () {
		let vis = this;

		// setup margins, height, and width
		vis.margin = {top: 20, left: 20, right: 20, bottom: 20};
		vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
		vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;

		// init drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.attr("viewBox", `0 0 ${$("#" + vis.parentElement).width()} ${$("#" + vis.parentElement).height()}`)
			.attr("preserveAspectRatio", "xMinYMin meet")
			.append("g")
			.attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);

		// init button foreign object
		vis.buttonG = vis.svg.append("foreignObject")
			.attr("id", "buttonObject")
			.attr("width", vis.width*0.18)
			.attr("height", 33)
			.attr("x", vis.width*0.84)
			.attr("y", -vis.margin.top);

		// init title group
		vis.titleG = vis.svg.append("g")
			.attr("transform", `translate(${vis.width / 2}, ${-5})`);

		// init y axis label group
		vis.svg.append("text")
			.attr("transform", `translate(${vis.margin.left}, ${-10})`)
			.attr('class', 'y-axis-lable')
			// .style("font-size", "11px")
			// .style("fill", "darkgrey")
			// .attr("font-weight", "bold")
			.style("text-anchor", "end")
			.text("Points");

		// Append legend group
		vis.legend = vis.svg.append("g")
			.attr("class", "legend")
			.attr("transform", `translate(${vis.width * 0.93}, ${vis.height * 0.75})`);

		// append legend rectangles
		vis.legend.selectAll()
			.data(["Red", "Rosé", "White", "Unknown"])
			.enter()
			.append("rect")
			.attr("class", "legend-rect")
			// .attr("x", (d, i) => 10)
			.attr("y", (d, i) => i * 15)
			.attr("height", 10)
			.attr("width", 10)
			.attr("fill", function(d){
				// console.log(vis.wineColor[d]);
				return vis.wineColor[d];
			})
		// .attr("shape-rendering", "geometricPrecision");

		// append legend text
		vis.legend.selectAll()
			.data(["Red", "Rosé", "White", "Unknown"])
			.enter()
			.append("text")
			.attr("class", "legend-text")
			.attr("x", 15)
			.attr("y", (d, i) => i * 15 + 4)
			.attr("dy", ".35em")
			// .attr("fill", "gray")
			// .attr("font-weight", "bold")
			.text(function(d){
				// console.log(d);
				return d;
			});


		// Append axes
		vis.svg.append("g")
			.attr("class", "axis axis-x")
			.attr("transform", `translate (${vis.margin.left}, ${vis.height})`);

		vis.svg.append("g")
			.attr("class", "axis axis-y")
			.attr("transform", `translate (${vis.margin.left}, ${0})`);

		// Set up scales and axes
		vis.x = d3.scaleLinear()
			.range([0, vis.width]);

		vis.y = d3.scaleLinear()
			.range([vis.height, 0])
			// .tickFormat(d3.format("$,.0f"));
		// console.log(d3.format("$,.0f")(1500));

		vis.xAxis = d3.axisBottom()
			.scale(vis.x);

		vis.yAxis = d3.axisLeft()
			.scale(vis.y);

		// Append tooltip
		vis.tooltip = d3.select("body").append("div")
		// vis.tooltip = d3.select("#" + vis.parentElement).append("div")
			.attr("class", "tooltip")
			.attr("id", "scatter-tip");

		// init path
		// vis.path = vis.svg.selectAll(".path");

		// init symbol shapes
		vis.symbol = d3.symbol();
		vis.symbolTypes = d3.symbols
		vis.symbolSize = 20;
		// console.log(vis.symbolTypes.map(s => vis.symbol.type(s)())[0])

		// append symbol legend
		vis.symbolLegend = vis.svg.append("g")
			.attr("transform", `translate(${vis.width * 0.93}, ${15})`)

		vis.symbolLegend.selectAll()
			.data([3, 0, 5])
			.enter()
			.append("path")
			.attr("class", "legend-symbol")
			.attr("d", d=>vis.symbolTypes.map(s => vis.symbol.size(60).type(s)())[d])
			.attr("transform", function(d, i) {
				return `translate(${5}, ${5 + i * 15})`;
				// console.log(d);
			})
			// .attr("shape-rendering", "geometricPrecision")
			.attr("fill", "none")
			.attr("stroke", "lightgray")
			.attr("stroke-width", 2);

		// append symbol legend text
		vis.symbolLegend.selectAll()
			.data(["Blend", "Sparkling", "Varietal"])
			.enter()
			.append("text")
			.attr("class", "legend-text")
			.attr("x", 15)
			.attr("y", (d, i) => i * 15 + 4)
			.attr("dy", ".35em")
			// .attr("fill", "gray")
			// .attr("font-weight", "bold")
			.text(function(d){
				// console.log(d);
				return d;
			});

		// create a Voronoi diagram based on the scales
		vis.voronoi = d3.voronoi()
			.x(d => vis.x(d.price))
			.y(d => vis.y(d.points))
			.extent([[0, 0], [vis.width, vis.height]]);

		vis.wrangleData();
	}


	/*
	 *  Data wrangling
	 */
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

		vis.filteredData = [];
		// if there is a time range selected
		if (selectedPriceRange.length !== 0) {
			// console.log("range selected", selectedPriceRange, selectedPriceRange[0], selectedPriceRange[1])
			dataFilteredForSweetness.forEach(row => {
				if (selectedPriceRange[0] <= +row.price && +row.price <= selectedPriceRange[1]) {
					vis.filteredData.push(row);
				}
			});
		} else {
			vis.filteredData = dataFilteredForSweetness;
		}
		// console.log(vis.filteredData);

		vis.styleCount = [];
		["Blend", "Sparkling", "Varietal"].forEach(value => {
			// console.log(value);
			let row = {
				style: value,
				count: vis.filteredData.reduce((total, d) => (d.style===value ? total+1 : total), 0)
			}
			vis.styleCount.push(row)
		})
		// console.log(vis.styleCount)

		vis.colorCount = [];
		["Red", "Rosé", "White", ""].forEach(value => {
			// console.log(value);
			let row = {
				color: value,
				count: vis.filteredData.reduce((total, d) => (d.color===value ? total+1 : total), 0)
			}
			vis.colorCount.push(row)
		})
		// console.log(vis.colorCount)

		vis.loopArray = d3.groups(vis.filteredData, d=>d.points, d=>d.price);
		// console.log(vis.loopArray)

		// Update the visualization
		vis.randomDataGenerator();
	}

	randomDataGenerator () {
		let vis = this;

		vis.randomData = [];
		// console.log(vis.priceList[Math.floor(Math.random()*vis.priceList.length)]);

		vis.loopArray.forEach((points) => {
			// console.log(points[1]);
			points[1].forEach((price) => {
				// console.log(price[1].length);
				vis.randomData.push(price[1][Math.floor(Math.random()*price[1].length)])
			});
		});
		// console.log(vis.filteredData.length, vis.randomData.length)

		vis.displayData = vis.randomData;
		// console.log("scatterVis vis.displayData", vis.displayData);

		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		// Set x- & y-axis domains
		vis.x.domain([d3.min(vis.displayData, d=>+d.price)-1, d3.max(vis.displayData, d=>+d.price)*1.03]);
		// console.log(d3.max(vis.topTenData, d=>+d.price));
		vis.y.domain([d3.min(vis.displayData, d=>+d.points)-1, d3.max(vis.displayData, d=>+d.points)+1]);
		// console.log(d3.extent(vis.topTenData, d=>+d.points));

		// add dynamic random data generator button
		if (vis.filteredData.length === vis.randomData.length) {
			$("#buttonObject").empty()
			$("#buttonObject").append(`<div class="col-sm-1 align-self-center"></div>`)
				.append($(`<button type="button" class="btn btn-dark btn-sm btn-block" disabled\
									style="background: #090909; border-color: #090909; color: darkgray; shape-rendering: crispEdges"\
 									title="There are no additional data points to display."></button>`)
					.css("font-size", "0.7vw")
					.html(`No New Data`));
		} else {
			$("#buttonObject").empty()
			$("#buttonObject").append(`<div class="col-sm-1 align-self-center"></div>`)
				.append($(`<button type="button" class="btn btn-dark btn-sm btn-block" onclick="generateData()"\
									style="background: #090909; border-color: #090909; color: darkgray; shape-rendering: crispEdges"\
 									title="Data randomly selected to display points clearly. Click button to view new data points."></button>`)
					.css("font-size", "0.7vw")
					.css("color", "lightgray")
					.html(`New Random Selection`));
		}


		// initialize the title
		vis.title = vis.svg.selectAll(".scatterplot-title").data(vis.visTitle, d=>d);

		// update title
		vis.titleG.append("text")
			.attr("class", "scatterplot-title")
			.attr("text-anchor", "middle")
			.attr("opacity", 0)
			.transition()
			.duration(transitionDuration)
			.attr("opacity", 1)
			.text(function() {
				if (selectedCountry === "all countries" & selectedStyle === "all styles" & selectedColor === "all colors" & selectedSweetness === "all sweetness levels") {
					return "Wine Reviews from the Top Ten Regions";
				} else {
					return "Wine Reviews from Your Selection";
				}
			});

		vis.title.exit()
			.attr("opacity", 1)
			.transition()
			.duration(transitionDuration)
			.attr("opacity", 0)
			.remove();

		// append shapes
		vis.path = vis.svg.selectAll(".path").data(vis.displayData, d => d.price+' '+d.points);

		// draw path
		vis.path.join("path")
			// .merge(vis.path)
			.attr("class", "path")
			.attr("opacity", .3)
			.transition()
			.duration(transitionDuration)
			.attr("transform", d => `translate(${vis.x(+d.price) + vis.margin.left},${vis.y(+d.points)})`)
			.attr("fill", (d)=>{
				// console.log(d.color);
				if (d.color === "Red") { return vis.wineColor.Red; }
				else if (d.color === "Rosé") { return vis.wineColor.Rosé; }
				else if (d.color === "White") { return vis.wineColor.White; }
				else { return vis.wineColor.Unknown; }
			})
			.attr("d", function(d) {
				if (selectedPriceRange.length !== 0 || selectedCountry !== "all countries" || selectedStyle !== "all styles" || selectedColor !== "all colors" || selectedSweetness !== "all sweetness levels") {
					if (d.style == "Blend") {
						return vis.symbolTypes.map(s => vis.symbol.size(vis.symbolSize*2).type(s)())[3]; // square
					} else if (d.style == "Sparkling") {
						return vis.symbolTypes.map(s => vis.symbol.size(vis.symbolSize*2).type(s)())[0]; // circle
					}  else if (d.style == "Varietal") {
						return vis.symbolTypes.map(s => vis.symbol.size(vis.symbolSize*2).type(s)())[5]; // triangle
					}
				} else {
					if (d.style == "Blend") {
						return vis.symbolTypes.map(s => vis.symbol.size(vis.symbolSize).type(s)())[3]; // square
					} else if (d.style == "Sparkling") {
						return vis.symbolTypes.map(s => vis.symbol.size(vis.symbolSize).type(s)())[0]; // circle
					}  else if (d.style == "Varietal") {
						return vis.symbolTypes.map(s => vis.symbol.size(vis.symbolSize).type(s)())[5]; // triangle
					}
				}
			})
			// .attr("shape-rendering", "geometricPrecision")
			.attr("opacity", 0.85);

		// vis.path.exit()
		// 	.attr("opacity", 0.85)
		// 	.transition()
		// 	.duration(transitionDuration)
		// 	.attr("opacity", .3)
		// 	.remove();

		vis.svg.selectAll(".voronoi")
			.data(vis.voronoi.polygons(vis.displayData, d=>d.row))
			.enter()
			.append("g")
			.attr("transform", `translate(${vis.margin.left}, ${0})`)
			.attr("fill", "none")
			.attr("stroke", "none")
			.attr("pointer-events", "all")
			.append("path")
			.attr("d", d => d ? 'M' + d.join("L") + 'Z' : null)
			.on("mouseover", function(event, d) {
				// console.log(event.pageX)
				vis.tooltip.style("opacity", 0.85)
					.style("background-color", "white")
					.style("border", "solid")
					.style("border-width", "2px")
					.style("border-radius", "5px")
					.style("padding", "20px")
					.style("left", event.pageX + 10 + "px")
					.style("top", event.pageY + 10 + "px")
					.html(`<div style="width: ${vis.width/3}px;">\
		        		   <h4 style="font-size: 13px; font-family: 'Montserrat', sans-serif;"><span class="bold-text">Name: </span>${d.data.title}, ${d.data.country}</h4></br>\
		        		   <p style="text-align: left; font-size: 12px; font-family: 'Montserrat', sans-serif;"><span class="bold-text">Description: </span>${d.data.description}</p><br>
		            	   <p style="font-size: 12px; font-family: 'Montserrat', sans-serif;"><span class="bold-text">Style: </span>${d.data.style}&emsp;\
		        						  <span class="bold-text">Color: </span>${d.data.color}<br>\
										  <span class="bold-text">Sweetness: </span>${d.data.sweetness}<br>\
										  <span class="bold-text">Price: </span>${d3.format("$,.0f")(+d.data.price)}&emsp;&emsp;\
										  <span class="bold-text">Points: </span>${+d.data.points}</p>\
		        		   </div>`);
			})
			.on("mouseout", function(event, d) {
				vis.tooltip
					.style("opacity", 0)
					.style("left", 0)
					.style("top", 0)
					.html(``);
			});

		// Call axis function with the new domain
		vis.svg.select(".axis-x")
			.attr("opacity", .3)
			.transition()
			.duration(transitionDuration)
			.attr("opacity", 1)
			.call(vis.xAxis);
		vis.svg.selectAll(".axis-y")
			.attr("opacity", .3)
			.transition()
			.duration(transitionDuration)
			.attr("opacity", 1)
			.call(vis.yAxis);
	}
}

