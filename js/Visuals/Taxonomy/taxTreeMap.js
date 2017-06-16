var jsonTree = tree;

/* Initial values for all parameters within the control panel */

getData();

function getData() {

    var hiData = d3.hierarchy(jsonTree, function (d) {
        return d.children;
    });
    render(hiData);

}

function render(hiData) {

    var w = 1200, h = 800, i = 0, duration = 750;
    var margin = {top: 20, right: 50, bottom: 20, left: 50},
        height = h - margin.top - margin.bottom,
        width = w - margin.left - margin.right;

    var maxDepth = d3.max(hiData.descendants(), function(d){return d.depth});

    var color = d3.scaleMagma()
        .domain([-maxDepth, maxDepth]);

    var svg = d3.select("#chart").append("svg")
        .style("width", width + margin.right + margin.left)
        .style("height", height + margin.top + margin.bottom);

    hiData.descendants().forEach(function (d, i) {
        d.id = i;
    });

    console.log(hiData)

    var toolTip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var nodes = hiData.descendants();
    var leaves = hiData.leaves();

    var treemap = d3.treemap()
        .size([width, height])
        .paddingOuter(3)
        .paddingTop(19)
        .paddingInner(1)
        .round(true);

    var root = hiData
        .sum(function (d) {
            return d.value;
        })
        .sort(function (a, b) {
            return b.height - a.height || b.value - a.value;
        });

    treemap(root);

    var cell = svg
        .selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + d.x0 + "," + d.y0 + ")";
        })
        .attr("class", "node")
        .each(function (d) {
            d.node = this;
        })
        .on("mouseover", hovered(true))
        .on("mouseout", hovered(false));

    cell.append("rect")
        .attr("id", function (d) {
            return "rect-" + d.id;
        })
        .attr("width", function (d) {
            return d.x1 - d.x0;
        })
        .attr("height", function (d) {
            return d.y1 - d.y0;
        })
        .style("fill", function (d) {
            return color(d.depth);
        });


    cell.append("clipPath")
        .attr("id", function (d) {
            return "clip-" + d.id;
        })
        .append("use")
        .attr("xlink:href", function (d) {
            return "#rect-" + d.id + "";
        });

    var label = cell.append("text")
        .attr("clip-path", function (d) {
            return "url(#clip-" + d.id + ")";
        });

    label
        .filter(function (d) {
            return d.children;
        })
        .selectAll("tspan")
        .data(function (d) {
            return d.data.name.split(/(?=[A-Z][^A-Z])/g).concat("\xa0" + d.value);
        })
        .enter().append("tspan")
        .attr("x", function (d, i) {
            return i ? null : 4;
        })
        .attr("y", 13)
        .text(function (d) {
            return d;
        });

    label
        .filter(function (d) {
            return !d.children;
        })
        .selectAll("tspan")
        .data(function (d) {
            return d.data.name.split(/(?=[A-Z][^A-Z])/g).concat((d.value));
        })
        .enter().append("tspan")
        .attr("x", 4)
        .attr("y", function (d, i) {
            return 13 + i * 10;
        })
        .text(function (d) {
            return d;
        });

    cell.append("title")
        .text(function (d) {
            return d.data.name + "\n" + (d.value);
        });
    /* *** Actions on change in parameter settings or mouse over/mouse out ***  */
    function hovered(hover) {
        return function (d) {
            d3.selectAll(d.ancestors().map(function (d) {
                return d.node;
            }))
                .classed("node--hover", hover)
                .select("rect")
                .attr("width", function (d) {
                    return d.x1 - d.x0 - hover;
                })
                .attr("height", function (d) {
                    return d.y1 - d.y0 - hover;
                });
        };
    }
    /*
     To show/hide text in treemap
     */
    d3.select("#textShow").on("change", function () {

        var textShow = $("#textShow").val();

        if (textShow == "HIDE") {

            d3.select("#chart").selectAll("text").style("fill-opacity", 0);
        }
        else {
            d3.select("#chart").selectAll("text").style("fill-opacity", 1);

        }
    });
    d3.select("#font").on("change", function () {

        var fontType = $("#font").val();

        d3.select("#chart").selectAll("text").style("font-family", fontType);

    });

    d3.select("#fontSize").on("change", function () {

        var fontSize = $("#fontSize").val();

        d3.select("#chart").selectAll("text").style("font-size", fontSize);

    });

    d3.select("#fontColor").on("change", function () {

        var fontColor = $("#fontColor").val();

        d3.select("#chart").selectAll("text").style("fill", fontColor);

    });


}

