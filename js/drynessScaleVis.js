/* * * * * * * * * * * * * *
*        color Bars        *
* * * * * * * * * * * * * */

class DrynessScaleVis {

    /* Constructor method */
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.drynessScaleData = [
            {name: "Bone Dry", color: "#44BB6F", residualSugarStart: 0, residualSugarEnd: 1, carbs: "0-0.6"},
            {name: "Dry", color: "#6AD323", residualSugarStart: 1, residualSugarEnd: 16, carbs: "0-10"},
            {name: "Off-Dry", color: "#DAEC19", residualSugarStart: 16, residualSugarEnd: 35, carbs: "10-20"},
            {name: "Medium-Sweet", color: "#EAC41C", residualSugarStart: 35, residualSugarEnd: 120, carbs: "20-70"},
            {name: "Sweet", color: "#CB7D2F", residualSugarStart: 120, residualSugarEnd: 200, carbs: "70+"}
        ]
        // console.log(this.data)

        this.initVis();
    }


    /* Initialize visualization */
    initVis () {
        let vis = this;

        // setup margins, height, and width
        /*vis.margin = {top: 120, left: 10, right: 10, bottom: 0};

        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
         */

        //vis.margin = { top: 40, right: 0, bottom: 60, left: 0 };
        vis.margin = {top: 110, left: 0, right: 0, bottom: 60};

        vis.width = 1015 - vis.margin.left - vis.margin.right
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

        //console.log($("#" + vis.parentElement).width())
        //console.log(vis.height, vis.width)

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .append("g")
            .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Legend group
        vis.drynessChart = vis.svg.append("g")
            .attr('class', 'dryness-scale')
            .attr("transform", `translate (${vis.margin.left / 2}, ${vis.margin.top / 2})`);

        vis.x = d3.scaleLinear()
            .range([0, vis.width])
            .domain([0, d3.max(vis.drynessScaleData, d => d.residualSugarEnd)]);

        // Append tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "dryness-tip");

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

        vis.wrangleData();
    }


    /* Data wrangling */
    wrangleData () {
        let vis = this;

        // Update the visualization
        vis.updateVis();
    }

    /* Update visualization */
    updateVis() {
        let vis = this;

        // // color palette = one color per subgroup
        // let color = d3.scaleOrdinal()
        //     .domain(subgroups)
        //     .range(['#e41a1c','#377eb8','#4daf4a'])
        //
        // //stack the data? --> stack per subgroup
        // var stackedData = d3.stack()
        //     .keys(subgroups)
        //     (data)

        // Create legend here
        vis.drynessChart.selectAll().data(vis.drynessScaleData)
            .enter()
            .append("rect")
            .attr("x", function (d) { return vis.x(d.residualSugarStart); })
            .attr("y", 0)
            .attr("height", "50px")
            .attr("width", function (d) { return vis.x(d.residualSugarEnd); })
            .style("fill", function (d) { return d.color; })
            .on("mouseover", function(event, d) {
                // console.log(event.pageX)
                // console.log("scaled coordinates", vis.x(+d.data.price), vis.y(+d.data.points))
                vis.tooltip
                    .style("opacity", 0.85)
                    .style("background-color", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("padding", "20px")
                    // .style("text-align", "center")
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px")
                    .html('<b>' + d.name + " Wines" + '</b>' + "<br>" + d.residualSugarStart + "-" + d.residualSugarEnd + " g/L Residual Sugar" + "<br>" + d.carbs + " Carbohydrates");
            })
            .on("mouseout", function(event, d) {
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        vis.drynessChart.selectAll().data(vis.drynessScaleData)
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return `translate(${vis.x(d.residualSugarStart) + vis.x(d.residualSugarEnd - d.residualSugarStart)/2}, ${0})`;
            })
            .append("text")
            // .attr("x", function (d) { return vis.x(d.residualSugarStart) + vis.x(d.residualSugarEnd - d.residualSugarStart)/2; })
            .text(d=>"- "+d.name)
            .style("fill", "white")
            .style("font-family", "Montserrat")
            .style("font-size", "12px")
            .attr("dx", ".35em")
            .attr("dy", ".35em")
            .attr("transform", "rotate(-60)")


        // // Establish axis
        // vis.axis = vis.legend.append("g")
        //     .attr('class', 'axis')
        //
        // vis.x = d3.scaleLinear()
        //     .domain([0, 100])
        //     .range([0, 200])
        //
        // vis.xAxis = d3.axisTop()
        //     .scale(vis.x)
        //     .ticks(3)
        //
        // // Call legend axis inside the legend group
        // vis.svg.select(".axis")
        //     //.attr("transform", "translate(20,)")
        //     .call(vis.xAxis)


    }
}