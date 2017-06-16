

dataPrep(parsedData);

/* ************  Basic data processing from raw file *********** */

var dataBySubject;

console.log(parsedData);

function dataPrep(data) {

    dataBySubject = d3.nest()
        .key(function (d) {
            return d['subject id']
        })
        .entries(data);


    dataBySubject.forEach(function (d) {

        d.values.hits = d.values.length;

    });

    dataBySubject.forEach(function (d) {

        d.values.bsMedian = d3.median(d.values, function (d) {
            return d['bit score']
        });
        d.values.bsMean = d3.mean(d.values, function (d) {
            return d['bit score']
        });
        d.values.SubTitle = d.values[0]['subject title'] || d.values[0]['subject title'];

    });

    dataProcess(dataBySubject);

}


/* ******** work on data structure - extract the words from title, handle weird characters in the  text and prepare the data to pass to cloud script ******* */

var BlastWords;
var layout;
var fill;
var wordposition;
var freqMax;
var freqMin;
var i;
var m;
var svg;
var wordvalue = $("#positiondropdown").val();
var fonttype = $("#fontdropdown").val();
var fontvalue;
function dataProcess() {


    /* Remove all commas and weird characters from the text */

    dataBySubject.forEach(function (d) {

        d.values.title = d.values.SubTitle.replace(/\s[\d]/g, "").replace(/,/g, "").replace(/#/g, "");
        d.values.titleArray = d.values.title.split(" ");
    });


    /* Get the array of words from titleArray and form a new flattened array */


    var words = [];

    m = dataBySubject.map(function (d) {
        return d.values.titleArray;
    });


    if (wordvalue == "All") {

        for (i = 0; i < m.length; i++) {

            wordposition = m[i].length;

            for (var j = 0; j < wordposition; j++) {

                words.push(m[i][j]);

            }
        }

    } else {

        for (i = 0; i < m.length; i++) {

            for (var j = 0; j < wordposition; j++) {

                words.push(m[i][j]);

            }
        }


    }
    console.log(wordposition);


    console.log(words);

    /* Calculate the count or the number of occurrences for each word in the array words */


    var wordsWithCount = words.reduce(function (w, i) {

        if (!w[i]) {

            w[i] = 1;
        } else {

            w[i] = w[i] + 1;
        }

        return w;

    }, {});

    console.log(wordsWithCount);

    BlastWords = d3.entries(wordsWithCount);

    freqMax = d3.max(BlastWords, function (d) {
        return d.value;

    });

    freqMin = d3.min(BlastWords, function (d) {
        return d.value;
    });


    console.log(freqMax);

    console.log(freqMin);

    fill = d3.scale.category20b();

    var max = d3.max(BlastWords, function (d) {
        return d.value;
    });

    layout = d3.layout.cloud()
        .size([800, 600])
        .words(BlastWords.map(function (d) {
            return {text: d.key, size: d.value / max * 90};
        }))
        .padding(5)
        .rotate(function () {
            return ~~(Math.random() * 2) * 90;
        })
        .font(fonttype)
        .fontSize(function (d) {
            return d.size;
        })
        .on("end", draw);


    layout.start();


}

console.log(BlastWords);


function slide() {

    $(function () {
        $("#slider-range").slider({
            range: true,
            min: freqMin,
            max: freqMax,
            values: [freqMin, freqMax],
            slide: function (event, ui) {
                $("#freqRange").val("" + ui.values[0] + " - " + ui.values[1]);

                var filteredData = BlastWords.filter(function (d) {

                    return (d.value >= ui.values[0] && d.value <= ui.values[1]);

                });

                var max = d3.max(filteredData, function (d) {
                    return d.value;
                });

                var updatedData = filteredData.map(function (d) {
                    return {text: d.key, size: d.value / max * 120};
                });

                layout.words(updatedData);
                layout.start();
                layout.on("end", draw);
            }
        });

        $("#freqRange").val("" + $("#slider-range").slider("values", 0) +
            " - " + $("#slider-range").slider("values", 1));


    });


}


function draw(words) {

    d3.select("svg").remove();

    svg = d3.select("#content").append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")");

    svg.selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function (d) {
            return d.size + "px";
        })
        .style("font-family", fonttype)
        .style("fill", function (d, i) {
            return fill(i);
        })
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) {
            return d.text;
        });
}


$("#positiondropdown").change(function () {

    wordvalue = $(this).val();

    console.log(wordvalue);

    wordposition = wordvalue;

    dataProcess();

    slide();


});


$("#fontdropdown").change(function () {

    fontvalue = $(this).val();

    fonttype = fontvalue;
    dataProcess();
    slide();
    draw(words);

})


dataProcess();
slide();


/* Obtaining new file input and process the same */


