/**
 * Created by Jansi on 9/15/16.
 */

var fileSelect = document.getElementById("file1");
var uploadButton = document.getElementById("submitbutton");


$("#submitbutton").click(function () {


    if (fileSelect.files.length == 0) {

        alert("Please upload atleast one BLAST output file");
    }

    else {

        var uploadedFile = fileSelect.files[0];

        checkExtension(uploadedFile);
    }
});


function checkExtension(uploadedFile) {

    var fileName = uploadedFile.name;

    var file2 = fileSelect.files[0];
    var extension = fileName.substr(fileName.length - 4);

    var validExtensions = [".txt", ".tsv", ".xml"];

    window.localStorage.setItem("fileExtension", extension);

    if (extension == validExtensions[0] || extension == validExtensions[1] || extension == validExtensions[2]) {

        processUpload(file2);
    }

    else {

        alert("Please upload only valid files of extension .txt, .tsv or .xml")
    }
}


function processUpload(file1) {

    /* Script to send the file to upload.php using ajax request */
    /* basic ajax shorthand jquery  - $.ajax(url[, options]) */

    var fileNname = file1.name;


    var smessage = $('#uploadmessage').addClass("alert alert-success").addClass("run-animation").html("<strong> Success! </strong> file uploaded successfully please proceed to step 2").show();

            $("#file1").click(function () {

                smessage.hide();

                smessage.removeClass("run-animation");


            });


            // On clicking the explore button open a new window

            var f = new FileReader();

            f.readAsText(file1);

            f.onloadend = loadHandler;
            f.onload = loadHandler;


            function loadHandler(event) {

                var data = event.target.result;


                window.localStorage.setItem('data1', data);

                console.log(window.localStorage.getItem('data1'));

            }

            $("#Taxonomy").click(function (e) {

                e.preventDefault();

                window.open("./pages/Taxonomy/taxonomy.html");

            });


            $("#BlastCloud").click(function (e) {

                e.preventDefault();

                window.open("./pages/Wordle/titleCloud.html");
            });

            $("#SequenceAlignment").click(function (e) {

                e.preventDefault();

                window.open("./pages/Sequences/sequence_home.html");
            });



}

clickDefaultEvents(fileSelect);


/* handling click of buttons especially visualizatione explore buttons when no file is uploaded or submitted */

function clickDefaultEvents(fileSelect) {


    $("#Taxonomy").click(function () {

        if (fileSelect.files.length == 0) {

            alert("You need to SELECT a BLAST Output file first and then SUBMIT it to view visualization");

        }


    });

    $("#Overview").click(function () {

        if (fileSelect.files.length == 0) {

            alert("You need to SELECT a BLAST Output file first and then SUBMIT it to view visualization");

        }


    });

    $("#BlastCloud").click(function () {

        if (fileSelect.files.length == 0) {

            alert("You need to SELECT a BLAST Output file first and then SUBMIT it to view visualization");

        }


    });

    $("#SequenceAlignment").click(function () {

        if (fileSelect.files.length == 0) {

            alert("You need to SELECT a BLAST Output file first and then SUBMIT it to view visualization");

        }


    });

}


