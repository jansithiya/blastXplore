/**
 * Created by Jansi on 10/5/16.
 */


var outfile = window.localStorage.getItem("data1");

var taxTree;

var tree;

textParser(outfile);

function textParser(dat) {

    var s = dat.replace(/# Fields: /, "");

    var myRegex = s.replace(/^#+.*/gm, "");

    var l = myRegex.replace(/^\s*[\r\n]/gm, "");

    var i = l.replace(/^.*/, function (m) {
        return m.replace(/, /g, "	");
    });


    var d = d3.tsvParse(i);

    /* Extract Taxonomy related data alone from the input file and store it in variable "data" */


    var data = [];

    d.map(function (d) {
        data.push({
            "BlastName": d['subject blast names'],
            "SuperKingdom": d['subject super kingdoms'],
            "SciName": d['subject sci names']
        })
    });


    /* Create source, target like data set one from SuperKingdom to BlastName and other BlastName to SciName */
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

    /* Map the unique SuperKingdom values in array to push it with info "null" parent;  */

    var unique = {};
    var rootData = [];
    for (var i in data) {
        if (typeof(unique[data[i].SuperKingdom]) == "undefined") {
            rootData.push(data[i].SuperKingdom);
        }
        unique[data[i].SuperKingdom] = 0;
    }

    var taxData = [];

    /* push SuperKingdom or nodes with no parent to taxData */

    taxData.push({
        "name": "root",
        "parent": null
    });

    rootData.forEach(function (d) {
        taxData.push({
            "name": d,
            "parent": "root"
        })
    });

    /* push BlastName and SciName to taxData with their parent info */

    result_1.forEach(function (d) {
        taxData.push({
            "name": d.BlastName,
            "parent": d.SuperKingdom
        });
    });

    result_2.forEach(function (d) {

        taxData.push({
            "parent": d.BlastName,
            "name": d.SciName,
            "value": +d.hits
        });
    });

    console.log(taxData);

    /* Map all the names of the nodes */

    var dataMap = taxData.reduce(function (map, node) {
        map[node.name] = node;
        return map;
    }, {});

    console.log(dataMap);

    /* taxTree variable has the transformed hierarchical json data */

    taxTree = [];

    taxData.forEach(function (node) {
        // find parent
        var parent = dataMap[node.parent];
        if (parent) {
            // create child array if it doesn't exist
            (parent.children || (parent.children = []))
            // add node to parent's child array
                .push(node);
        } else {
            // parent is null or missing
            taxTree.push(node);
        }
    });

    console.log(JSON.stringify(taxTree));

    /* convert taxTree to object under variable tree */


    tree = {};

    for (i = 0; i < taxTree.length; i++) {

        tree = taxTree[i];
    }
    console.log(JSON.stringify(tree));
}


var root = tree;


/* Font default value */

var fontType = $("#font").val();
var fontValue;
var fontSize = $("#fontSize").val();
var fontColor = "black";

var svg = d3.select("svg"),
    margin = 20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);


root = d3.hierarchy(root)
    .sum(function (d) {
        return d.value;
    })
    .sort(function (a, b) {
        return b.value - a.value;
    });


var maxDepth = d3.max(root.descendants(), function (d) {
    return d.depth;
})
var color = d3.scaleLinear()
    .domain([-1, maxDepth])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

var focus = root,
    nodes = pack(root).descendants(),
    view;

var circle = g.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("class", function (d) {
        return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
    })
    .style("fill", function (d) {
        return d.children ? color(d.depth) : null;
    })
    .on("click", function (d) {
        if (focus !== d) zoom(d), d3.event.stopPropagation();
    });

var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("class", "label")
    .style("fill-opacity", function (d) {
        return d.parent === root ? 1 : 0;
    })
    .style("font-family", fontType)
    .style("font-size", fontSize)
    .style("fill", fontColor)
    .style("display", function (d) {
        return d.parent === root ? "inline" : "none";
    })
    .text(function (d) {
        return d.data.name;
    });

var node = g.selectAll("circle,text");

svg
    .style("background", "#f0f0f0")
    .on("click", function () {
        zoom(root);
    });

zoomTo([root.x, root.y, root.r * 2 + margin]);

function zoom(d) {
    var focus0 = focus;
    focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function (d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
            return function (t) {
                zoomTo(i(t));
            };
        });

    transition.selectAll("text")
        .filter(function (d) {
            return d.parent === focus || this.style.display === "inline";
        })
        .style("fill-opacity", function (d) {
            return d.parent === focus ? 1 : 0;
        })
        .on("start", function (d) {
            if (d.parent === focus) this.style.display = "inline";
        })
        .on("end", function (d) {
            if (d.parent !== focus) this.style.display = "none";
        });
}

function zoomTo(v) {
    var k = diameter / v[2];
    view = v;
    node.attr("transform", function (d) {
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
    });
    circle.attr("r", function (d) {
        return d.r * k;
    });
}


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
