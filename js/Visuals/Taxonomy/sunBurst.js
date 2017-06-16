/**
 * Created by Jansi Thiyagarajan
 *
 *
 */

var root = tree;
var width = 960,
    height = 700,
    radius = Math.min(width, height) / 2;

var fontType = $("#font").val();
var fontValue;
var fontSize = $("#fontSize").val();
var fontColor = "black";

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.linear()
    .range([0, radius]);

var color = d3.scale.category20c();

var svg = d3.selectAll("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 ) + ")");

var partition = d3.layout.partition()
    .value(function (d) {
        return d.value;
    });

var arc = d3.svg.arc()
    .startAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
    })
    .endAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
    })
    .innerRadius(function (d) {
        return Math.max(0, y(d.y));
    })
    .outerRadius(function (d) {
        return Math.max(0, y(d.y + d.dy));
    });

var g = svg.selectAll("g")
    .data(partition.nodes(root))
    .enter().append("g");

var path = g.append("path")
    .attr("d", arc)
    .style("fill", function (d) {
        return color((d.children ? d : d.parent).name);
    })
    .on("click", click);

var text = g.append("text")
    .attr("transform", function (d) {
        return "rotate(" + computeTextRotation(d) + ")";
    })
    .attr("x", function (d) {
        return y(d.y);
    })
    .attr("dx", "6") // margin
    .attr("dy", ".35em") // vertical-align
    .style("font-family", fontType)
    .style("font-size", fontSize)
    .style("fill", fontColor)
    .text(function (d) {
        return d.name;
    });

function click(d) {
    // fade out all text elements
    text.transition().attr("opacity", 0);

    path.transition()
        .duration(750)
        .attrTween("d", arcTween(d))
        .each("end", function (e, i) {
            // check if the animated element's data e lies within the visible angle span given in d
            if (e.x >= d.x && e.x < (d.x + d.dx)) {
                // get a selection of the associated text element
                var arcText = d3.select(this.parentNode).select("text");
                // fade in the text element and recalculate positions
                arcText.transition().duration(750)
                    .attr("opacity", 1)
                    .attr("transform", function () {
                        return "rotate(" + computeTextRotation(e) + ")"
                    })
                    .attr("x", function (d) {
                        return y(d.y);
                    });
            }
        });
}

d3.select(self.frameElement).style("height", height + "px");

// Interpolate the scales!
function arcTween(d) {
    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
        yd = d3.interpolate(y.domain(), [d.y, 1]),
        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
    return function (d, i) {
        return i
            ? function (t) {
            return arc(d);
        }
            : function (t) {
            x.domain(xd(t));
            y.domain(yd(t)).range(yr(t));
            return arc(d);
        };
    };
}

function computeTextRotation(d) {
    return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
}



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


