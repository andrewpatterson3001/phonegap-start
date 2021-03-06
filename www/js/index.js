/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// var app = {
//     // Application Constructor
//     initialize: function() {
//         this.bindEvents();
//     },
//     // Bind Event Listeners
//     //
//     // Bind any events that are required on startup. Common events are:
//     // 'load', 'deviceready', 'offline', and 'online'.
//     bindEvents: function() {
//         document.addEventListener('deviceready', this.onDeviceReady, false);
//     },
//     // deviceready Event Handler
//     //
//     // The scope of 'this' is the event. In order to call the 'receivedEvent'
//     // function, we must explicitly call 'app.receivedEvent(...);'
//     onDeviceReady: function() {
//         // app.receivedEvent('deviceready');
//         var xhr = new XMLHttpRequest();
//             xhr.open('GET', 'https://api.github.com/legacy/repos/search/javascript', true);
//                 //Event Handlers
//                 xhr.onload = function() {
//                     var repos = JSON.parse(xhr.response), i, reposHTML =  "";
//                     for (i = 0; i < repos.repositories.length; i++) {
//                         reposHTML += "<p><a href='https://github.com/" + repos.repositories[i].username + "/" + repos.repositories[i].name + "'>" + repos.repositories[i].name + "</a><br>" + repos.repositories[i].description + "</p>";
//                     }
//                     document.getElementById("allRepos").innerHTML = reposHTML;
//                 };

//                 xhr.onerror = function(){
//                     alert('error making the request.');
//                 }
//         xhr.send();
//     },
//     // Update DOM on a Received Event
//     receivedEvent: function(id) {
//         var parentElement = document.getElementById(id);
//         var listeningElement = parentElement.querySelector('.listening');
//         var receivedElement = parentElement.querySelector('.received');

//         listeningElement.setAttribute('style', 'display:none;');
//         receivedElement.setAttribute('style', 'display:block;');

//         console.log('Received Event: ' + id);
//     }
// };
                //VERSION 2
// $.ajax("https://api.github.com/legacy/repos/search/javascript").done(function(data) {
//      var i, repo;
//      $.each(data.repositories, function (i, repo) {
//         $("#allRepos").append("<p><a href='https://github.com/" + repo.username + "/" + repo.name + "'>" + repo.name + "</a><br>"+ repo.description + "&glt;/p>");
//      });
// });


                    // VERSION 3
// $('#reposHome').bind('pageinit', function(event) {
//     loadRepos();
// });

// function loadRepos() {
//     $.ajax("https://api.github.com/legacy/repos/search/javascript").done(function(data) {
//         var i, repo;
//         $.each(data.repositories, function (i, repo) { //VERSION 4
//             $("#allRepos").append("<li><a href='repo-detail.html?owner=" + repo.username + "&name=" + repo.name + "'>"
//             + "<h4>" + repo.name + "</h4>"
//             + "<p>" + repo.username + "</p></a></li>");
//         });
//         $('#allRepos').listview('refresh');
//     });
// }

// function getUrlVars() {
//     var vars = [], hash;
//     var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
//     for(var i = 0; i < hashes.length; i++)
//     {
//         hash = hashes[i].split('=');
//         vars.push(hash[0]);
//         vars[hash[0]] = hash[1];
//     }
//     return vars;
// }

// // $('#reposDetail').live('pageshow', function(event) {
// $(document).on('pageshow', '#reposDetail', function(event) {
//     var owner = getUrlVars().owner;
//     var name = getUrlVars().name;
//     loadRepoDetail(owner,name);
// });

// function loadRepoDetail(owner,name) {
//      $.ajax("https://api.github.com/repos/" + owner + "/" + name).done(function(data) {
//          var repo = data;
//          console.log(data);

//          $('#repoName').html("<a href='" + repo.homepage + "'>" + repo.name + "</a>");
//          $('#description').text(repo.description);
//          $('#forks').html("<strong>Forks:</strong> " + repo.forks + "<br><strong>Watchers:</strong> " + repo.watchers);

//          $('#avatar').attr('src', repo.owner.avatar_url);
//          $('#ownerName').html("<strong>Owner:</strong> <a href='" + repo.owner.url + "'>" + repo.owner.login + "</a>");
//      });
// }

                    //VERSION 5 for adding a DB

var db;

$('#reposHome').bind('pageinit', function(event) {
    loadRepos();
    db = window.openDatabase("repodb","0.1","GitHub Repo Db", 1000);
    db.transaction(createDb, txError, txSuccess);
});

function createDb(tx) {
    tx.executeSql("DROP TABLE IF EXISTS repos");
    tx.executeSql("CREATE TABLE repos(user,name)");
}

function txError(error) {
    console.log(error);
    console.log("Database error: " + error);
}

function txSuccess() {
    console.log("Success");
}
/////////////////////////////////////////////////
//Manipulate the star when saving a favorite to the DB
function saveFave() {
    db = window.openDatabase("repodb","0.1","GitHub Repo Db", 1000);
    db.transaction(saveFaveDb, txError, txSuccessFave);
}

function saveFaveDb(tx) {
    var owner = getUrlVars().owner;
    var name = getUrlVars().name;

    tx.executeSql("INSERT INTO repos(user,name) VALUES (?, ?)",[owner,name]);
}

function txSuccessFave() {
    console.log("Save success");

    disableSaveButton();
}

function disableSaveButton() {
    // change the button text and style
    var ctx = $("#saveBtn").closest(".ui-btn");
    $('span.ui-btn-text',ctx).text("Saved").closest(".ui-btn-inner").addClass("ui-btn-up-b");

    $("#saveBtn").unbind("click", saveFave);
}

function checkFave() {
    db.transaction(checkFaveDb, txError);
}

function checkFaveDb(tx) {
    var owner = getUrlVars().owner;
    var name = getUrlVars().name;

    tx.executeSql("SELECT * FROM repos WHERE user = ? AND name = ?",[owner,name],txSuccessCheckFave);
}

function txSuccessCheckFave(tx,results) {
    console.log("Read success");
    console.log(results);

    if (results.rows.length)
         disableSaveButton();
}

/////////////////////////////////////////////////
function loadRepos() {
    $.ajax("https://api.github.com/legacy/repos/search/javascript").done(function(data) {
        var i, repo;
        $.each(data.repositories, function (i, repo) {
            $("#allRepos").append("<li><a href='repo-detail.html?owner=" + repo.username + "&name=" + repo.name + "'>"
            + "<h4>" + repo.name + "</h4>"
            + "<p>" + repo.username + "</p></a></li>");
        });
        $('#allRepos').listview('refresh');
    });
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

// $('#reposDetail').live('pageshow', function(event) {
$(document).on('pageshow', '#reposDetail', function(event) {
    var owner = getUrlVars().owner;
    var name = getUrlVars().name;
    $("#saveBtn").bind("click", saveFave);
    checkFave();
    loadRepoDetail(owner,name);
});

function loadRepoDetail(owner,name) {
     $.ajax("https://api.github.com/repos/" + owner + "/" + name).done(function(data) {
         var repo = data;
         console.log(data);

         $('#repoName').html("<a href='" + repo.homepage + "'>" + repo.name + "</a>");
         $('#description').text(repo.description);
         $('#forks').html("<strong>Forks:</strong> " + repo.forks + "<br><strong>Watchers:</strong> " + repo.watchers);

         $('#avatar').attr('src', repo.owner.avatar_url);
         $('#ownerName').html("<strong>Owner:</strong> <a href='" + repo.owner.url + "'>" + repo.owner.login + "</a>");
     });
}