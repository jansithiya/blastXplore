
var outfile = window.localStorage.getItem("data1");

var dat = outfile;

var units = "hits";



var fontType = $("#font").val();
var fontValue;
var fontSize = $("#fontSize").val();
var fontColor = "black";

var margin = {top: 10, right: 30, bottom: 10, left: 30},
    width = 1200 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function (d) {
        return formatNumber(d) + " " + units;
    };


var color = d3.scale.category20("99d8c9e5f5f9");

var colors = d3.scale.ordinal().range(["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd",
    "#ccebc5", "#ffed6f"]);

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        return "<strong>Name:</strong> <span style='color:red'>" + d.name + "</span>";
    })


var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);


// Set the sankey diagram properties


var sankey = d3.sankey()
    .nodeWidth(30)
    .nodePadding(0.5)
    .size([width, height]);

var path = sankey.link();






    var s = dat.replace(/# Fields: /, "");

    var myRegex = s.replace(/^#+.*/gm, "");

    var l = myRegex.replace(/^\s*[\r\n]/gm, "");

    var i = l.replace(/^.*/, function (m) {
        return m.replace(/, /g, "	");
    });


    var d = d3.tsv.parse(i);

    var data = [];

    d.map(function (d) {
        data.push({
            "BlastName": d['subject blast names'],
            "SuperKingdom": d['subject super kingdoms'],
            "SciName": d['subject sci names']
        })
    });


    console.log(data);

    var result_1 = [];
    data.forEach(function (e) {
        if (!this[e.SuperKingdom + '|' + e.BlastName]) {
            this[e.SuperKingdom + '|' + e.BlastName] = {
                SuperKingdom: e.SuperKingdom,
                BlastName: e.BlastName,
                hits: 0
            }
            result_1.push(this[e.SuperKingdom + '|' + e.BlastName]);
        }
        this[e.SuperKingdom + '|' + e.BlastName].hits++;
    });


    console.log(result_1);


    var result_2 = [];
    data.forEach(function (e) {
        if (!this[e.BlastName + '|' + e.SciName]) {
            this[e.BlastName + '|' + e.SciName] = {
                BlastName: e.BlastName,
                SciName: e.SciName,
                hits: 0
            }
            result_2.push(this[e.BlastName + '|' + e.SciName]);
        }
        this[e.BlastName + '|' + e.SciName].hits++;
    });


    graph = {"nodes": [], "links": []};

    result_1.forEach(function (d) {
        graph.nodes.push({"name": d.SuperKingdom});
        graph.nodes.push({"name": d.BlastName});
        graph.links.push({
            "source": d.SuperKingdom,
            "target": d.BlastName,
            "value": +d.hits
        });
    });

    result_2.forEach(function (d) {
        graph.nodes.push({"name": d.BlastName});
        graph.nodes.push({"name": d.SciName});
        graph.links.push({
            "source": d.BlastName,
            "target": d.SciName,
            "value": +d.hits
        });
    });

    console.log(graph);

    graph.nodes = d3.keys(d3.nest()
        .key(function (d) {
            return d.name;
        })
        .map(graph.nodes));

    graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    graph.nodes.forEach(function (d, i) {
        graph.nodes[i] = {"name": d};
    });


    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

// add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function (d) {
            return Math.max(1, d.dy);
        })
        .sort(function (a, b) {
            return b.dy - a.dy;
        })
        .append("title")     //check this
        .attr("class", "label")
        .text(function (d) {
            return d.source.name + " → " +
                d.target.name + "\n" + format(d.value);
        })

// add in the nodes


    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });


// add the rectangles for the nodes
    node.append("rect")
        .attr("height", function (d) {
            return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
            return d.color = color(d.name.replace(/ .*/, ""));
        })
        .style("stroke", function (d) {
            return d3.rgb(d.color).darker(1);
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .append("title")
        .text(function (d) {
            return d.name + "\n" + format(d.value);
        });


// add in the title for the nodes
    var text = node.append("text")
        .attr("x", -6)
        .attr("y", function (d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .style("font-family", fontType)
        .style("font-size", fontSize)
        .style("fill", fontColor)
        .text(function (d) {
            return d.name;
        })
        .filter(function (d) {
            return d.x < width / 2;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");



$("#font").change(function () {
    fontValue = $(this).val();
    fontType = fontValue;
    text.style("font-family", fontValue);
});

$("#fontSize").change(function () {
    fontSize = $(this).val();
    text.style("font-size", fontSize);
});

$("#fontColor").change(function () {
    fontColor = $(this).val();
    text.style("fill", fontColor);
});

$("#labelHide").click(function () {

    $("#labelHide").attr("class", "btn btn-xs btn-primary active");
    $("#labelShow").attr("Class", "btn btn-xs btn-default");
    text.text("");

})
$("#labelShow").click(function () {

    $("#labelShow").attr("class", "btn btn-xs btn-primary active");
    $("#labelHide").attr("Class", "btn btn-xs btn-default");
    text.text(function (d) {
        return d.name;
    });

})
