class MapVis {

	/*
	 *  Constructor method
	 */
	constructor(parentElement, displayData, geoData, countries, states) {
		this.parentElement = parentElement;
		this.displayData = displayData;
		this.geoData = geoData;
		this.countries = countries;
		this.states = states

		this.initVis();
	}

	/*
	 *  Initialize vis
	 */

	initVis () {
		let vis = this;

		// Initialize the map object
		vis.map = L.map('mapDiv', {
			attributionControl: false,
			zoomControl: false,
			scrollWheelZoom: false,
			dragging: false
		}).setView([30, 10], 1);

		// Add a tile layer to the map
		L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd'
		}).addTo(vis.map);

		// Initialize tooltip
		vis.info = L.control();
		vis.info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
			this.update();
			return this._div;
		};

		// Initialize legend
		vis.map_legend = L.control({position: 'bottomleft'});
		vis.map_legend.onAdd = function (map) {

			var div = L.DomUtil.create('div', 'map_legend'),
				grades = [0, 1000, 10000, 30000],
				labels = [];

			for (var i = 0; i < grades.length; i++) {
				div.innerHTML +=
					'<i style="background:' + colorPalette(selectedColor, grades[i] + 1) + '"></i> ' +
					numberWithCommas(grades[i]) + (grades[i + 1] ? '&ndash;' + numberWithCommas(grades[i + 1])
					+ '<br>' : '+');}

			return div;
		};

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
			vis.displayData.forEach((row) => {
				if (row.country === selectedCountry & +row.price > 0) {
					dataFilteredForCountry.push(row);
				}
			});
		} else {
			dataFilteredForCountry = vis.displayData;
		}
		//console.log(dataFilteredForCountry);

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
		//console.log(dataFilteredForStyle);

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
		// console.log("scatterVis vis.filterData", vis.filteredData);

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

		vis.counter_country = [];
		vis.filteredData.reduce(function(total, value) {
			if (!total[value.country]) {
				total[value.country] = { country: value.country, count: 0 };
				vis.counter_country.push(total[value.country])
			}
			total[value.country].count += +value.count;
			return total;
		}, {});

		// Update the visualization
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		const getByKey = (arr,key) => (arr.find(x => Object.keys(x)[0] === key) || {})[key]

		// update legend
		vis.map_legend.update = function (map) {

			var div = L.DomUtil.create('div', 'map_legend'),
				grades = [0, 1000, 10000, 30000],
				labels = [];
			// loop through our density intervals and generate a label with a colored square for each interval
			for (var i = 0; i < grades.length; i++) {
				div.innerHTML +=
					'<i style="background:' + colorPalette(selectedColor, grades[i] + 1) + '"></i> ' +
					grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');}

			return div;
		};
		vis.map_legend.addTo(vis.map);

		// update tooltip
		vis.info.update = function (name, count) {
			this._div.innerHTML = (name ?
				'<b>' + name + '</b>' +
				'<br/>' + numberWithCommas(count) + ' reviews'
				: 'Hover over a country' + '<br>' + 'to see number of' + '<br>' + 'reviews available');
		};
		// add updated tooltip to map
		vis.info.addTo(vis.map);

		// define layer
		vis.geojson = L.geoJson(vis.countries, {
			filter: wineCountries,
			style: style,
			onEachFeature: onEachFeature}).addTo(vis.map);

		if (selectedCountry != "all countries") {
			if (selectedCountry == "New Zealand") {
				let zoom = getByKey(boundaries, 'NZL')
				vis.map.fitBounds(zoom)
			} else if (selectedCountry == "South Africa") {
				let zoom = getByKey(boundaries, 'SAF')
				vis.map.fitBounds(zoom)
			} else if (selectedCountry == "United Kingdom") {
				let zoom = getByKey(boundaries, 'UK')
				vis.map.fitBounds(zoom)
			} else if (selectedCountry == "United States of America") {
				let zoom = getByKey(boundaries, 'USA')
				vis.map.fitBounds(zoom)
			} else {
				let zoom = getByKey(boundaries,selectedCountry)
				vis.map.fitBounds(zoom)
			}
		} else {
			vis.map.fitBounds([[75.0619, -160.53125], [-52.4827,185.625]])
		}

		// style map (color) based on user selection
		function style(feature) {

			// set counter
			var count = 0;

			// match country names and calculate number of reviews
			vis.counter_country.forEach(function (d){
				if (d.country == feature.properties.ADMIN) {
					count = d.count}})

			// return updated map style
			return {
				fillColor: colorPalette(selectedColor, count),
				weight: 1,
				opacity: 0.6,
				color: 'black',
				fillOpacity: 1};
		}

		// add the listeners
		function onEachFeature(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				//click: zoomToFeature
			});
		}

		// mouseover effect -- highlight border
		function highlightFeature(e) {
			var layer = e.target;

			// highlight border of country hovered over
			layer.setStyle({
				weight: 1.5,
				color: 'black',
				opacity: 1,
				dashArray: '',
				fillOpacity: 1});

			if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
				layer.bringToFront();}

			// define variables for review count
			var reviews = 0;
			let name = layer.feature.properties.ADMIN;

			// match country names and calculate number of reviews
			vis.counter_country.forEach(function (d){
				if (d.country == name) {
					reviews = d.count}
			})

			// call function to update tooltip
			vis.info.update(name, reviews);
		}

		// mouseout  effect
		function resetHighlight(e) {

			vis.geojson.resetStyle(e.target);

			// call function to update tooltip
			vis.info.update();
		}

		/*function zoomToFeature(e) {
			console.log(e.target.getBounds())
			vis.map.fitBounds(e.target.getBounds());
		}
		 */

	}
}

// assign color based on number of reviews

function getColor(d) {
	return  d > 30000  ? '#660529' :
			d > 10000  ? '#E60B5B' :
			d > 1000   ? '#EA868A' :
			d > 0      ? '#FFFFFF' :
						 '#000000';
}

function getColorRose(d) {
	return  d > 30000  ? '#803953' :
			d > 10000  ? '#FF73A6' :
			d > 1000   ? '#FFBFD7' :
			d > 0      ? '#FFFFFF' :
				         '#000000';
}

function getColorWhite(d) {
	return  d > 30000  ? '#6B6515' :
			d > 10000  ? '#FFDB00' :
			d > 1000   ? '#FFF780' :
			d > 0      ? '#FFFFFF' :
				         '#000000';
}

function colorPalette(selected, d) {

	if (selected === "Rosé") { return getColorRose(d) }
	else if (selected === "White") { return getColorWhite(d) }
	else { return getColor(d) }

}

// filter for countries with wine reviews
function wineCountries(feature) {
	if (feature.properties.ADMIN === "Argentina" || feature.properties.ADMIN === "Australia" ||
		feature.properties.ADMIN === "Austria" || feature.properties.ADMIN === "Bulgaria" ||
		feature.properties.ADMIN === "Canada" || feature.properties.ADMIN === "Chile" ||
		feature.properties.ADMIN === "Croatia" || feature.properties.ADMIN === "France" ||
		feature.properties.ADMIN === "Germany" || feature.properties.ADMIN === "Greece" ||
		feature.properties.ADMIN === "Hungary" || feature.properties.ADMIN === "Italy" ||
		feature.properties.ADMIN === "New Zealand" || feature.properties.ADMIN === "Portugal" ||
		feature.properties.ADMIN === "Romania" || feature.properties.ADMIN === "South Africa" ||
		feature.properties.ADMIN === "Spain" || feature.properties.ADMIN === "United Kingdom" ||
		feature.properties.ADMIN === "United States of America")
		return true
}

// prints integer with commas as thousands separators
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let boundaries = [
	{Argentina: [[-55.1850761, -73.5600329], [-21.781168, -53.6374515]]},
	{Australia: [[-47.3228175, 95.2460938], [-9.0882278, 168.2249543]]},
	{Austria: [[46.3722761, 9.5307487], [49.0205305, 17.160776]]},
	{Bulgaria: [[41.2353929, 22.3571459], [44.2167064, 28.8875409]]},
	{Canada: [[43.6765556, -141.00275], [78.3362128, -52.3231981]]},
	{Chile: [[-56.725, -88.6795789], [-17.4983998, -66.0753474]]},
	{Croatia: [[42.1765993, 13.2104814], [46.555029, 19.4470842]]},
	{France: [[41.2632185, -5.4534286], [51.268318, 9.8678344]]},
	{Germany: [[47.2701114, 5.8663153], [55.099161, 15.0419319]]},
	{Greece: [[34.7006096, 19.2477876], [41.7488862, 29.7296986]]},
	{Hungary: [[45.737128, 16.1138867], [48.585257, 22.8977094]]},
	{Italy: [[35.2889616, 6.6272658], [47.0921462, 18.7844746]]},
	{NZL: [[-52.8213687, 155.059153], [-30.0303303, 179.3643594]]},
	{Portugal: [[30.8288021, -20.5575303], [42.1543112, 0]]},
	{Romania: [[42.618682, 19.2619773], [49.2653964, 31.045425]]},
	{SAF: [[-37.1788335, 16.3335213], [-20.1250301, 36.2898954]]},
	{Spain: [[27.4335426, -18.3936845], [43.9933088, 4.5918885]]},
	{UK: [[49.674, -14.015517], [61.061, 2.0919117]]},
	{USA: [[24.9493, -125.0011], [49.5904, -66.9326]]}
]

// Resources:
// https://leafletjs.com/examples/choropleth/
// https://colorbrewer2.org/#type=sequential&scheme=Purples&n=5
// https://www.d3-graph-gallery.com/graph/interactivity_button.html
// https://www.d3-graph-gallery.com/graph/bubblemap_circleFeatures.html
// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
// https://stackoverflow.com/questions/57209399/how-do-i-get-the-value-of-a-key-from-a-list-of-objects-in-javascript