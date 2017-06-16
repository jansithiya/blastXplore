/**
 * Created by Jansi Thiyagarajan *
 * The script transforms the flat taxonomy related data to hierarchical json, i.e., flare like json suitable for d3 based hierarchy oriented visualizations
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


    var d = d3.tsv.parse(i);

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
