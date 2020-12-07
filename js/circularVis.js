
/*
 *  CircularVis - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with wine magazine data
 */

class CircularVis {

	/*
	 *  Constructor method
	 */
	constructor(parentElement, data, topTenData) {
		this.parentElement = parentElement;
		this.data = data;
		this.visTitle = [{title: "Count of Reviews from the Top Ten Regions"}, {title: "Count of Reviews from your Selection"}]

		this.initVis();
	}


	/*
	 *  Initialize vis
	 */
	initVis () {
		let vis = this;

		vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
		vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
		vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

		// init drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("class", "bubble")
			.append("g")
			.attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

		vis.svg.append("rect")
			.attr("x", -vis.margin.left)
			.attr("y", -vis.margin.top)
			.attr("height", vis.margin.top)
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.style("fill", "#262626");

		// init title group
		vis.titleG = vis.svg.append("g")
			.attr("transform", `translate(${vis.width / 2}, ${-5})`);

		// Circle tooltip
		vis.tooltip = d3.select("body")
			.append("div")
			//.style("opacity", 0)
			.attr("class", "tooltip")
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "2px")
			.style("border-radius", "5px")
			.style("padding", "5px")

		// Initiate node group
		vis.nodeGroup = vis.svg.append("g")

		// Set color range
		// vis.color = d3.scaleOrdinal()
		// 	.domain([d3.min(vis.topTenData), d3.max(vis.topTenData)])
		// 	.range(d3.schemeSet1);

		// Size scale for bubbles
		vis.size = d3.scaleLinear()
			// .range([7, 55])
			.range([10, 35])

		// Location scale for bubbles
		vis.bubbleScale = d3.scaleLinear()
			.range([50, vis.height])

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
				if (row.country === selectedCountry) {
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

		// console.log(vis.filteredData);
		// prepare data by grouping all rows by province
		vis.bubbleInfo = [];

		vis.dataByProvince = Array.from(d3.group(vis.filteredData, d =>d.province), ([key, value]) => ({key, value}))

		// console.log(vis.dataByProvince);

		vis.dataByProvince.forEach(province => {

			// get full province name
			let provinceName = province.key

			// init counters
			let counter = 0;
			let red = 0;
			let white = 0;
			let rose = 0;

			// look up population for the state in the census data set
			province.value.forEach(entry => {
				counter = counter + +entry.count;
				if (entry.color === "Red") {
					red = red + +entry.count;
				}
				else if (entry.color === "White") {
					white = white + +entry.count;
				}
				else if (entry.color === "Rosé") {
					rose = rose + +entry.count;
				}
			})

			// populate the final data structure
			vis.bubbleInfo.push(
				{
					province: provinceName,
					counter: counter,
					red: red,
					white: white,
					rose: rose
				}
			)
		});

		// console.log("vis.bubbleInfo", vis.bubbleInfo)

		// Update the visualization
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		// Update size and bubble scales
		vis.size.domain([0, d3.max(vis.bubbleInfo, d => d.counter)])
		vis.bubbleScale.domain([0, d3.max(vis.bubbleInfo, d => d.counter)])

		// Calculate values for legend
		let intLength = d3.max(vis.bubbleInfo, d => d.counter).toString().length;
		let firstInt = d3.max(vis.bubbleInfo, d => d.counter).toString().charAt(0);
		//console.log(legendMax, vis.size(legendMax))
		let intLengthMin = d3.min(vis.bubbleInfo, d => d.counter).toString().length;
		let firstIntMin = d3.min(vis.bubbleInfo, d => d.counter).toString().charAt(0);
		//console.log(legend_Min, vis.size(legend_Min));

		let legendMax = parseInt(firstInt.padEnd(intLength, "0"));
		let legendMid = legendMax / 2;
		let legendMin = parseInt(firstIntMin.padEnd(intLengthMin, "0"));

		//let legendMin = legendMax / 5;


		// Add legend: circles
		vis.valuesToShow = [legendMax, legendMid, legendMin];
		vis.xCircle = vis.width*0.15;
		vis.xLabel = vis.width*0.15;
		vis.yCircle = vis.height;

		// init legend svg
		vis.legend = vis.svg.selectAll("g.bubble-legend").data(vis.valuesToShow);

		// exit
		vis.legend.exit().remove();

		// new
		vis.legendG = vis.legend.enter()
			.append("g")
			.attr('class', "bubble-legend");

		vis.legendG.append('circle');
		//vis.legendG.append('line')
		vis.legendG.append('text');

		// update
		vis.legend = vis.legendG.merge(vis.legend);

		vis.legend.select('circle')
			.attr("cx", vis.xCircle)
			.attr("cy", function(d){ return vis.yCircle - vis.size(d) } )
			.attr("r", function(d){ return vis.size(d) })
			.style("fill", "none")
			.attr("stroke", "darkgray")
			.attr("shape-rendering", "geometricPrecision");

		/*vis.legend.select('line')
			.attr('x1', function(d){ return vis.xCircle } )
			.attr('x2', vis.xLabel)
			.attr('y1', function(d){ return vis.yCircle - 2*vis.size(d) } )
			.attr('y2', function(d){ return vis.yCircle - 2*vis.size(d) } )
			.attr('stroke', 'darkgray')
			.style('stroke-dasharray', ('2,2'));*/

		vis.legend.select('text')
			.attr('x', vis.xLabel)
			.attr('y', function(d){ return vis.yCircle - 2*vis.size(d) - 2} )
			.text( function(d){ return d } )
			.style("font-size", 8)
			.style('fill', 'darkgray')
			.style('text-anchor', 'middle');

		// initialize the title
		vis.title = vis.svg.selectAll(".bubble-title").data(vis.visTitle, d=>d);

		// update title
		vis.titleG
			.append("text")
			.attr("class", "bubble-title")
			.attr("text-anchor", "middle")
			.attr("opacity", 0)
			.transition()
			.duration(transitionDuration)
			.attr("opacity", 1)
			.text(function() {
				if (selectedCountry === "all countries" & selectedStyle === "all styles" & selectedColor === "all colors" & selectedSweetness === "all sweetness levels") {
					return "Count of Reviews from the Top Ten Regions";
				} else {
					return "Count of Reviews from your Selection";
				}
			});

		vis.title.exit()
			.attr("opacity", 1)
			.transition()
			.duration(transitionDuration)
			.attr("opacity", 0)
			.remove();

		// Three function that change the tooltip when user hover / move / leave a cell
		vis.mouseover = function(event, d) {
			vis.tooltip
				.style("opacity", 0.85)
				.style("font-family", "Montserrat, sans-serif")
				.style("left", event.pageX + "px")
				.style("top", event.pageY + 20 + "px")
				.html(`<h4 style="font-size: 13px; font-family: 'Montserrat', sans-serif;">${d.province} has ${d3.format(",.0f")(+d.counter)} reviews</h4>`);
			// .style("left", (d3.select(this)[0]+20) + "px")
			// .style("top", (d3.select(this)[1]) + "px")
		}

		vis.mouseleave = function(event, d) {
			vis.tooltip
				.style("opacity", 0);
			vis.node
				.style("stroke", "black");
		}

		// Initialize the circle: all located at the center of the svg area
		vis.node = vis.svg
			.selectAll(".node")
			.data(vis.bubbleInfo, d => d.province);

		vis.node.exit().remove();

		vis.node = vis.node.enter()
			.append("circle")
			.attr("class", "node")
			.merge(vis.node)
			.attr("cx", vis.width / 2)
			.attr("cy", vis.height / 2);

			vis.node
				.transition()
				.duration(transitionDuration)
				// .attr("cx", vis.width / 2)
				// .attr("cy", vis.height / 2)
				.attr("r", function(d){
					// console.log(vis.size(d.counter))
					return (vis.size(d.counter))
				});

			vis.node
				.style("fill", function(d) {
					if (d.red > (d.white || d.rose)) {
						return redWineColor;
					}
					else if (d.white > (d.red || d.rose)) {
						return whiteWineColor;
					}
					else if (d.rose > (d.red || d.white)) {
						return roseWineColor;
					}
					else {
						return redWineColor;
					}
				})
				.style("fill-opacity", 1)
				.attr("stroke", "black")
				.style("stroke-width", 1)
				.on("mouseover", vis.mouseover) // What to do when hovered
				.on("mouseout", vis.mouseleave);

			vis.node
				// .transition()
				// .duration(transitionDuration)
				.call(d3.drag() // call specific function when circle is dragged
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));

		// Features of the forces applied to the nodes:
		vis.simulation = d3.forceSimulation()
			.force("center", d3.forceCenter().x(vis.width / 2.25).y(vis.height / 2.75)) // Attraction to the center of the svg area
			.force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
			.force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (vis.size(d.counter)+1) }).iterations(1)) // Force that avoids circle overlapping
			.force('y', d3.forceY().y(function(d) { return vis.bubbleScale(d.counter)*0.3;}))
			.force('x', d3.forceX().x(function(d) { return vis.bubbleScale(d.counter)*0.2;}))

		// Apply these forces to the nodes and update their positions.
		// Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
		vis.simulation
			.nodes(vis.bubbleInfo)
			.on("tick", function(d){
				vis.node
					.attr("cx", function(d){
						if ((d.x > vis.width) || (d.x < 0))
						{
							return vis.width;
						}
						else {
							return d.x;
						}
					 })
					.attr("cy", function(d){
						if ((d.y > vis.height) || (d.y < 0))
						{
							return vis.height - 50;
						}
						else {
							return d.y;
						}
					})
			});

		// What happens when a circle is dragged?
		function dragstarted(event, d) {
			// console.log(d);
			if (!event.active) vis.simulation.alphaTarget(.03).restart();
			d.fx = d.x;
			d.fy = d.y;
		}
		function dragged(event, d) {
			d.fx = event.x;
			d.fy = event.y;
		}
		function dragended(event, d) {
			if (!event.active) vis.simulation.alphaTarget(.03);
			d.fx = null;
			d.fy = null;
		}
	}
}

