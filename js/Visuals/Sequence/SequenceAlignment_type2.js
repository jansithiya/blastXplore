/**
 * Created by Jansi on 9/13/16
 * JavaScript code to visualize sequence alignment related info based on horizontal layout
*/



dataPrep(parsedData);

var sortedData;

function dataPrep(data) {

    console.log(data);

    var dataBySubject = d3.nest()
        .key(function(d){ return d['subject id']})
        .entries(data);



    dataBySubject.forEach( function(d){


        d.values.hits = d.values.length;

    });

    dataBySubject.forEach(function(d){

        d.values.bsMedian = d3.median(d.values, function(d){ return d['bit score']});
        d.values.bsMean = d3.mean(d.values, function(d){ return d['bit score']});
        d.values.SubTitle = d.values[0]['subject title'] || d.values[0]['subject title'];
        d.values.titleLength =  d.values.SubTitle.length;
        d.values.words =  d.values.SubTitle.split(" ").length;
        d.values.titleA1 =  d.values.SubTitle.split(" ").slice(0, d.values.words/2);
        d.values.titleA2 =  d.values.SubTitle.split(" ").slice(d.values.words/2, d.values.words);
        d.values.title1 =   d.values.titleA1.join(" ");
        d.values.title2 =   d.values.titleA2.join(" ");

    });
    console.log(dataBySubject);

    //sort subject id by median score

     sortedData = dataBySubject.sort(function(a,b){ return b.values.bsMedian - a.values.bsMedian;})

    console.log(sortedData);


}


var data = sortedData;

/* -------------------------------  Data for bitscore ------------------------------------------------- */

var dataValues  = data.map(function(d){return d.values;});

var bitScoreValues = [];

for(var i=0; i < dataValues.length; i++){

    for(var j=0; j < dataValues[i].length; j++){

        bitScoreValues.push(dataValues[i][j]['bit score']);

    }

}

/* --------------------------------  Retrieve the query sequence related info ------------------------- */

var queryData = data.filter(function (d){

    return d.key == d.values[0]['query id'];

});

var queryLength = queryData[0]['values'][0]['alignment length'];

var queryStart = queryData[0]['values'][0]['q. start'];

var queryEnd = queryData[0]['values'][0]['q. end'];


/* --------------------------------- Define svg container attributes  --------------------------------- */
var width =1000;
var height = 30;
var margin = {top:40, right: 15, bottom:15, left:40};


/* -------------------------------- Define scales and axis for x and y / colors -------------------------------- */


var yMin = 0;
var yMax = (data.length) + 1;
var xStart = 160;
var xtranslate = -20;

// define y scale for holding each unique subject sequences

var yScale = d3.scale.linear().domain([yMin,yMax]).range([0, height*yMax]);


// define x scale and axis related parameters

var xScale = d3.scale.linear()
    .domain([queryStart,queryEnd])
    .range([xStart, width]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .tickFormat(d3.format(""))
    .orient("top");


// color Scale for bitScore

var divColor10 = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"];


var color = "steelblue";

var colorScale = d3.scale.linear()
    .domain(d3.extent(bitScoreValues))
    .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);



console.log(d3.extent(bitScoreValues));



/* ----------------------------------- Color for rectangle bitscore ------------------------------------ */

var bsBins = d3.layout.histogram()
    .bins(10)
    (bitScoreValues);

var m = bsBins.map(function(d){ return })
console.log(bsBins);

var col= d3.scale.quantile()
    .domain(bitScoreValues)
    .range(divColor10);

var c2= d3.scale.quantile()
    .domain(d3.range(10))
    .range(divColor10);
console.log(col);


/* ----------------------------------- ToolTip related ------------------------------------------------ */


var div = d3.select("#chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


/* ----------------------------------- Start drawing  ------------------------------------------------- */
var chart = d3.select("#chart")
.append('svg:svg')
.attr('width', width + margin.right + margin.left)
.attr('height', (height*yMax) + margin.top + margin.bottom)
.attr("class", "chart");


var main = chart.append('g')
    .attr('transform', 'translate(' + margin.left + ',0)')
    .attr('width', width)
    .attr('height', (height*yMax))
    .attr('class', 'main');


// draw lines to hold each unique subject

main.append('g').selectAll('.laneLines')
    .data(data)
    .enter().append('line')
    .attr('x1', xStart)
    .attr('y1', function(d,i) { return d3.round(yScale(i))+ 0.5; })
    .attr('x2', width)
    .attr('y2', function(d,i) { return d3.round(yScale(i)) + 0.5; })
    .attr('stroke', function(d) { return d.label === '' ? 'white' : 'lightgray' });

// render text of subject id and on mouse over show the title of the subject sequence

main.append('g').selectAll('.laneText')
    .data(data)
    .enter().append('text')
    .text(function(d) { return d.key; })
    .attr('x', -10)
    .attr('y', function(d,i) { return yScale(i + .5); })
    .attr('dy', '0.5ex')
    .attr('class', 'laneText')
    .style("font-size", 10)
    .on("mouseover", function(d) {
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div.html(d.values.SubTitle)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 90) + "px");
    })
    .on("mouseout", function(d) {
        div.transition()
            .duration(500)
            .style("opacity", 0);
    });

// draw x axis .....

var drawX =    d3.select("#queryAxis")
    .append('svg:svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', 50)
    .attr("class", "queryAxis")
    .append("g").attr("class", "xaxis")
    .attr('transform', 'translate(40,' + 40 + ')')
    .call(xAxis)
    .append("text")
    .attr("class", "xTitle")
    .text("Query Length ")
    .attr("text-align","center");



// rectangle to represent the alignment of subject sequences for each hits per subject

data.forEach(function(d,i) {



    var d2 = d.values;


    main.append("g").selectAll(".bar")
        .data(d2)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return xScale(d['q. start']);
        })
        .attr("y", function (d) {
            return yScale(i + .5)
        })
        .attr("width", function (d) {
            return xScale(d['q. end']-d['q. start'])-160;
        })
        .attr("height", "10px")
        .style("fill", function(d){ return col(d['bit score'])})
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d['bit score'])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 90) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

});


var colorLegend = d3.select("#colorScale")
    .append("svg")
    .attr("width", 400)
    .attr("height", 20);


colorLegend.selectAll("circle")
    .data(d3.range(10) )
    .enter()
    .append("circle")
    .attr("r", 10 )
    .attr("cx", d3.scale.linear().domain([-1, 20]).range([0, 400]) )
    .attr("cy", 10)
    .attr("fill", function (d) {return c2(d)} );