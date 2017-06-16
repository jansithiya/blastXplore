/**
 * Created by Jansi on 8/28/16.*/

/*  import the data from the script input.js */

dataPrep(parsedData);

/* function to draw the sequence alignment by unique subject id */

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

    var sortedData = dataBySubject.sort(function(a,b){ return b.values.bsMedian - a.values.bsMedian;})

    console.log(sortedData);

    sequenceChart(sortedData);

}


function sequenceChart(data) {

    var margin = {top: 10, left: 20, right: 15, bottom: 20};
    var width = 200 - margin.left - margin.right;
    var height = 200 - margin.top - margin.bottom;

    /* -------------- query sequence related information --------------------- */

    // obtain the query sequence from the sorted data

    var queryData = data.filter(function (d){

        return d.key == d.values[0]['query id'];

    });

    // get query length, start and end positions

    var queryLength = queryData[0]['values'][0]['alignment length'];

    var queryStart = queryData[0]['values'][0]['q. start'];

    var queryEnd = queryData[0]['values'][0]['q. end'];






    data.forEach(function (d,i) {


        /* ---------- Create svg container and append title of every unique subject at the top ------------   */


        var svg = d3.selectAll("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var title1 = d.values.title1;

        svg.append("text")
            .attr("x", "30%")
            .attr("y", "10%")
            .text(title1)
            .style("text-anchor", "middle")
            .style("font-size","6");


        var title2 = d.values.title2;

        svg.append("text")
            .attr("x", "35%")
            .attr("y", "15%")
            .text(title2)
            .style("text-anchor", "middle")
            .style("font-size", "6");


        svg.append("text")
            .attr("x", "35%")
            .attr("y", "20%")
            .style("text-anchor", "middle")


        // Create invisible container to separate svg container for subjects

        var svg2 = d3.selectAll("#chart").append("svg")
            .attr("class", "dummybox")
            .attr("width",5)
            .attr("height", height + margin.top + margin.bottom);




        /* ------------ Define scale and axis for query sequence length and mapping the alignment -------------- */


        // set up x axis scale which represents the query length

        var xScale = d3.scale.linear()
            .domain([queryStart,queryEnd])
            .range([0, width]);

        var n = parseInt(queryEnd/5);

        var xTickValues = [queryStart, n, n*2, n*3, n*4, queryEnd];


        var xAxis = d3.svg.axis()
            .outerTickSize(0)
            .scale(xScale)
            .ticks(7)
            .tickValues(xTickValues)
            .tickFormat(d3.format(""))
        .orient("bottom");



        var drawX =    svg.append("g").attr("class", "xaxis")
            .attr("transform", "translate(0," + (height-10) + ")")
            .call(xAxis);



        // set up Y axis based on the number of hits

        var hitStart = 0;

        var hitEnd = d.values.hits;

        var yScale = d3.scale.linear()
            .domain([0, (hitEnd + 1)])
            .range([(height-70), 0]);


        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");




        /* ------------------ draw rectangle showing alignment length for each hit --------------------------- */



        /*  for(var i=0; i < d.values.hits; i++){

         var rect = svg.append("rect")
         .attr("class", "bar")
         .attr("x", xScale(d.values[i]['q. start']))
         .attr("width", xScale(d.values[i]['q. end']))
         .attr("y", yScale(i+1))
         .attr("height", "5px");


         }

         */
        var d2 = d.values;

        svg.selectAll(".bar")
            .data(d2)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return xScale(d['q. start']); })
            .attr("width", function(d){ return xScale(d['q. end']-d['q. start']);})
            .attr("y", function(d,i) { return yScale(i); })
            .attr("height", "5px");





    });


}

