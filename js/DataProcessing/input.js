/* JavaScript to Parse and Format the input file uploaded by the user depending on the data type */



/* ---------- Fetch the data from LocalStorage using the name provided in upload script ------------*/

var blastFile = window.localStorage.getItem("data1");

var fileExtension = window.localStorage.getItem("fileExtension");

var parsedData;

console.log(fileExtension);

parseFile(blastFile);


function parseFile(blastFile) {

    if (fileExtension === ".tsv" || fileExtension === ".txt") {

        var getFields = blastFile.replace(/# Fields: /, "");


        var processFields = getFields.replace(/^#+.*/gm, "");

        var removeComments = processFields.replace(/^\s*[\r\n]/gm, "");



        var processedData = removeComments.replace(/^.*/, function (m) {
            return m.replace(/, /g, "	");
        });



        parsedData = d3.tsv.parse(processedData);

        console.log(parsedData);
    }
/* ---------------------------- space for implementing rest of the format parsing ------------------------------- */

    parsedData.forEach(function (d) {

        d['% identity'] = +d['% identity'];
        d['% positives'] = +d['% positives'];
        d['% query coverage per subject'] = +d['% query coverage per subject'];
        d['% query coverage per uniq subject'] = +d['% query coverage per uniq subject'];
        d['alignment length'] = +d['alignment length'];
        d['bit score'] = +d['bit score'];
        d.evalue = +d.evalue;
        d['gap opens'] = +d['gap opens'];
        d.gaps = +d.gaps;
        d.identical = +d.identical;
        d['mismatches'] = +d['mismatches'];
        d['positives'] = +d['positives'];
        d['q. start'] = +d['q. start'];
        d['q. end'] = +d['q. end'];
        d['s. end'] = +d['s. end'];
        d['s. start'] = +d['s. start'];
        d.score = +d.score;
    });


}




