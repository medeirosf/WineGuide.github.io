
/*
 *  ImageVis - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with wine magazine data
 */

class ImageVis {

	/*
	 *  Constructor method
	 */
	constructor(parentElement) {
		this.parentElement = parentElement;

		this.initVis();
	}


	/*
	 *  Initialize vis
	 */
	initVis () {
		let vis = this;

		vis.wrangleData();
	}


	/*
	 *  Data wrangling
	 */
	wrangleData () {
		let vis = this;

		// Update the visualization
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		if (selectedCountry === "all countries") {
			// console.log(selectedCountry)
			$("#" + vis.parentElement).html(`<p class="center" style="align-self: center; font-size: 1.5vw; font-family: Montserrat; color: gray;">Select a country to</p>
											 <p class="center" style="align-self: center; font-size: 1.5vw; font-family: Montserrat; color: gray;"><br><br>view its wine regions map.</p>`);
		} else if (selectedCountry === "Greece" || selectedCountry === "Romania") {
			$("#" + vis.parentElement).html(`<img src="img/${selectedCountry}.png" alt="${selectedCountry}" class="center" width="90%">`);
		} else if (selectedCountry === "Canada" || selectedCountry === "Portugal" || selectedCountry === "South Africa" || selectedCountry === "United States of America") {
			$("#" + vis.parentElement).html(`<img src="img/${selectedCountry}.png" alt="${selectedCountry}" class="center" width="80%">`);
		} else {
			// console.log(`"img/${selectedCountry}.png"`)
			$("#" + vis.parentElement).html(`<img src="img/${selectedCountry}.png" alt="${selectedCountry}" class="center" height="90%">`);
		}
	}
}

