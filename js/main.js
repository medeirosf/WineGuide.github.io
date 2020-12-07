/*
 *  Main.js
 */

// init global variables, switches, helper functions
let myBrushVis,
    myCircularVis,
    myColorBarVis,
    myCountryBarVis,
    // myFilterList,
    myImageVis,
    myMapVis,
    myScatterVis,
    mySectionVis,
    myStyleBarVis,
    mySweetnessBarVis,
    myBarsVis,
    myDrynessScaleVis;

let countryList,
    styleList,
    sweetnessList,
    colorList;

let selectedPriceRange = [];

let transitionDuration = 1000;

// create global colors
let warmClimateColor = "#FF73A6",
    coolClimateColor = "#72D4FF",
    coolColorOther = "#007DB3",
    textColor = "#FF4D4D", // DO WE NEED TO ADJUST THIS TO THE RED WINE COLOR?
    redWineColor = "#B80050",
    roseWineColor = "#FF73A6",
    whiteWineColor = "#FFEE00",
    unknownWineColor = "#BEBEBE";

// (1) Load data with promises
let promises = [
    d3.csv("data/wineMagazineData.csv"),
    d3.csv("data/wineAggMagazineData.csv"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
    d3.json("data/countries.json"),
    d3.json("data/us-states.json")
];

Promise.all(promises)
    .then( function(data){ createVis(data)})
    .catch( function (err){console.log(err)} );

// create visualizations
function createVis(data) {

    // log data
    // console.log(data[1]);

    // initialize visualizations
    myBrushVis = new BrushVis("brushDiv", data[0]);
    myCircularVis = new CircularVis("bubble-vis", data[1]);
    myColorBarVis = new ColorBarVis("colorBar", data[1]);
    myCountryBarVis = new CountryBarVis("countryBar", data[1]);
    // myFilterList = new FilterList("countrySelector", "styleSelector", "colorSelector", "sweetnessSelector");
    myImageVis = new ImageVis("country-image");
    myMapVis = new MapVis('mapDiv', data[1], data[2], data[3], data[4]);
    myScatterVis = new ScatterVis("scatter-vis", data[0]);
    mySectionVis = new SectionsVis("sections-vis", data[2], data[3], data[4]);
    myStyleBarVis = new StyleBarVis("styleBar", data[1]);
    mySweetnessBarVis = new SweetnessBarVis("sweetnessBar", data[1]);
    myBarsVis = new BarsVis("barsVis");
    myDrynessScaleVis = new DrynessScaleVis("dryness-scale");
    // console.log(topTenData);
}

let selectedCountry = "all countries"
// let selectedCountry = $('#countrySelector').val();
// function countryChange() {
//     selectedCountry = $('#countrySelector').val();
//     myBrushVis.wrangleData();
//     myCircularVis.wrangleData();
//     myColorBarVis.wrangleData();
//     myFilterList.wrangleData();
//     myImageVis.updateVis();
//     myMapVis.wrangleData();
//     myScatterVis.wrangleData();
//     mySweetnessBarVis.wrangleData();
// }

let selectedColor = "all colors"
// let selectedColor = $('#colorSelector').val();
// function colorChange() {
//     selectedColor = $('#colorSelector').val();
//     myBrushVis.wrangleData();
//     myCircularVis.wrangleData();
//     myCountryBarVis.wrangleData();
//     myFilterList.wrangleData();
//     myImageVis.updateVis();
//     myMapVis.wrangleData();
//     myScatterVis.wrangleData();
//     mySweetnessBarVis.wrangleData();
// }

let selectedStyle = "all styles"
// let selectedStyle = $('#styleSelector').val();
// function styleChange() {
//     selectedStyle = $('#styleSelector').val();
//     myBrushVis.wrangleData();
//     myCircularVis.wrangleData();
//     myColorBarVis.wrangleData();
//     myCountryBarVis.wrangleData();
//     myFilterList.wrangleData();
//     myImageVis.updateVis();
//     myMapVis.wrangleData();
//     myScatterVis.wrangleData();
//     mySweetnessBarVis.wrangleData();
// }

let selectedSweetness = "all sweetness levels"
// let selectedSweetness = $('#sweetnessSelector').val();
// function sweetnessChange() {
//     selectedSweetness = $('#sweetnessSelector').val();
//     myBrushVis.wrangleData();
//     myCircularVis.wrangleData();
//     myColorBarVis.wrangleData();
//     myCountryBarVis.wrangleData();
//     myFilterList.wrangleData();
//     myImageVis.updateVis();
//     myMapVis.wrangleData();
//     myScatterVis.wrangleData();
// }

function resetSelection () {
    selectedCountry = "all countries";
    selectedColor = "all colors";
    selectedStyle = "all styles";
    selectedSweetness = "all sweetness levels";
    // selectedPriceRange = [];

    myBrushVis.wrangleData();
    myCircularVis.wrangleData();
    myColorBarVis.wrangleData();
    myCountryBarVis.wrangleData();
    myImageVis.updateVis();
    myMapVis.wrangleData();
    myScatterVis.wrangleData();
    myStyleBarVis.wrangleData();
    mySweetnessBarVis.wrangleData();
}

function generateData () {
    myScatterVis.randomDataGenerator();
}