/* global zoom, authObj, setHtmlFile, setText */

//-----------------------------
// https://javascript.info/promise-chaining
//------------------------------
/*function loadJson(url) {
  return fetch(url)
    .then(response => response.json());
}*/

// for now, these global variables are at 
// best a hack - needs refactoring 
var count = 0, errors = 0; 
var errorIDs = [];


console.log("Explore Promises");

function sleep2(ms) {
    console.log("Sleep function called for " + ms + " ms\n");
    return new Promise(resolve => setTimeout(resolve, ms))
        .then(() => console.log("Sleep done!"));
}

/* a verbose sleep function that uses three promises
   that have been chained together
   Credits: https://stackoverflow.com/a/53995436/307454
*/
function sleep(ms) {

    // A higher order function that introduces a delay of 'ms' millisec
    const pSleep = ms => () =>
        new Promise((resolve, reject) => window.setTimeout(resolve, ms));

    const changeCursor = c => () =>
        new Promise((resolve, reject) => {
            document.body.style.cursor = c;
            resolve();
        });

    return Promise.resolve()
        .then(() => console.log("Switching to busy cursor"))
        .then(changeCursor("wait"))
        .then(() => console.log("Sleep function called for " + ms + " ms\n"))
        .then(pSleep(ms))
        //.then(() => launchSampleGitterList())
        .then(() => console.log("Sleep done!"))
        .then(() => console.log("Switching to normal cursor"))
        .then(changeCursor("default"));
}

// activated by the "Test" button in the HTML
function simulateCallToFunction() {
  sleep(3000);
}

// The async-await version is provided below for 
// contrast and comparison 
/*
async function simulateCallToFunction() { 
    console.log ("Switching into busy cursor");
    document.body.style.cursor = "wait";
    await sleep(3000);
    console.log("Switching back to normal cursor");
    document.body.style.cursor = "default";
}
*/


// some initialization which are used in later functions
// gitter related inits need to obtained by 
// making the appropriate API calls
function initDefaultIds() {
    document.getElementById('userID').value =
        `iliakan, jeresig, remy,
    joekzbee, *^, undefined, ###,
    GokulPrasath, parisudhaandireyaa,
    apollovishwas, sudharsanRajendran`;
}

let gitterKey =
    "bad0cafba005887e3e7e97dd5a640030f0c7e1b8";

// to get room IDs
//https://api.gitter.im/v1/rooms?access_token=bad0cafba005887e3e7e97dd5a640030f0c7e1b8
let fortuneid = 
    "5c3386b6d73408ce4fb3e75e";
let cs8251 = 
    "5c7b60a7d73408ce4fb97445"; 
let campsiteid = 
    "570a5925187bb6f0eadebf05";

let roomDB = {
  "fortune":  {id: "5c3386b6d73408ce4fb3e75e", skipcount: 1},
  "cs8251" :  {id: "5c7b60a7d73408ce4fb97445", skipcount: 5},
  "campsite": {id: "570a5925187bb6f0eadebf05", skipcount: 24}  
};

var roomid = roomDB['campsite'].id; 



initDefaultIds();


function launchSampleGitterList() {
    // count = 0; errors = 0; 
    zoom.out();
  
    // helper function 1
    const changeCursor = c => () =>
      new Promise((resolve, reject) => {
          document.body.style.cursor = c;
          resolve();
      });
  
    let names = document.getElementById('userID').value;
    if (names.trim().length) {
      
        Promise.resolve()
          .then(changeCursor("wait"))
          .then(() => fetchGitInfoForGitterList(names))
          .then(changeCursor("default"));
    }
    else {
        var pNode = document.getElementById("progressStatus");
        pNode.innerHTML = "Enter some Gitter IDs!";

    }
}

// the main function that launches the parallel promise calls
// activated from the button in the HTML page 
// Why is it an async function - need to review
//
function launchHttpRequestsToGitter() {
    count = 0; errors = 0;
    var skiplist; 
  
    let roomstring =  document.getElementById("gitterRoom").value; 
    //console.log("room ", roomstring); 

    if (roomstring.length !== 0) {
        roomid = roomDB[roomstring].id; 
        let scount = roomDB[roomstring].skipcount;
        skiplist = // [0, 30, 60, 90, 120, 150, 180, 210, 240] ; 
            Array.from({
                length: scount
            }, (v, k) => k * 30);
    }
    else {
        roomid = roomDB['campsite'].id;
        let scount = roomDB['campsite'].skipcount;
        console.log("roomid", roomid);
        // https://stackoverflow.com/a/38213213/307454
        // this is quite arbitrary - Gitter room ID count must be 
        // used to calculate this properly 
        skiplist = // [0, 30, 60, 90, 120, 150, 180, 210, 240] ; 
            Array.from({
                length: scount
            }, (v, k) => k * 30);
    }
      
    changeProgressToBusy();
    Promise.all(
        skiplist.map(
            skip => fetchUserIdsFromGitterRoom(skip)
            .then(userlist => fetchGitInfoForGitterList(userlist))
        )
      ).then(()=>sleep(1000)).then(()=> changeProgressToCompleted());
  
    // helper function 1
    function changeProgressToBusy() {
        document.getElementById("userID").value = "";
        var pNode = document.getElementById("progressStatus");
        pNode.innerHTML = "Please wait....";
        document.body.style.cursor = "wait";
    }

    // helper function 2
    function changeProgressToCompleted() {
        var pNode = document.getElementById("progressStatus");
        pNode.append("Parallel requests completed! ");
        pNode.append("Errors: " + errorIDs.length);
        initDefaultIds();
        document.body.style.cursor = "default";
    }
  
    // an untested sequential approach to Http requests
    /*for (var i = 0; i < skiplist.length; i++) {
      fetchUserIdsFromGitterRoom(skiplist[i])
        .then(userlist =>
              fetchGitInfoForGitterList(userlist));
      //await sleep(9000);
    }*/


}

function fetchUserIdsFromGitterRoom(skip) {
    let userids = [];
    let gUrl =
      "https://api.gitter.im/v1/rooms/" +
      roomid +
      "/users?access_token=" +
      gitterKey;
  

    return loadJson(gUrl + "&skip=" + skip).then(users => {
        for (var user of users) {
            userids.push(user.username);
        }
        return userids.join(", ");
    });
    /*.then (userlist => { 
        document.getElementById("userID").value = userlist;
      });*/
}


function fetchGitInfoForGitterList(names) {
    names = names.split(",");
    console.log(names);

    const changeCursor = c => () =>
      new Promise((resolve, reject) => {
          document.body.style.cursor = c;
          resolve();
      });
      
    // https://quasar-rate.glitch.me/chapter-3/3-08-aggregate-all-outcomes.html
    // need to be applied and improved upon 
    var requests = 
        names.map(name =>
            getGitInfoForUserAndDisplay(name.trim())
                  //.catch(err => processError(err, name))
                 );
                            
    return settled(requests).then(function(outcomes) { 
        outcomes.forEach(function (outcome) {
            if (outcome.state == 'fulfilled') count++;
            else errors++;
        });
        console.log(count + " processed; " + "Errors? " + errors ); 
        document.getElementById("progressStatus").append(count + " processed...");
    });
  
    document.getElementById("userID").focus();
    document.getElementById("userID").select();

    // helper function 2
    function settled(promises) {
      var alwaysFulFilled = promises.map (function (p) {
        return p.then(
          function onFulFilled(value) {
            //console.log("inside onfulfilled", value); 
            return { state: 'fulfilled', value: value};
          },
          function onRejected(reason) { 
              var name = extractNameFrom(reason.response.url);
              //console.log("inside onRejected", reason, name);            
              processError(null, name);
            return { state: 'rejected', reason: reason};
          });
      });
      
      return Promise.all(alwaysFulFilled);
    }
  
    function extractNameFrom(reason) {
      //https://stackoverflow.com/a/6165387/307454
      var lastPart = reason.split("/").pop();
      //console.log("name ", lastPart);
      return lastPart;
    }
    // helper function 3
    function processError(err, name) {
        
        errorIDs.push(name);
        console.log("Failed: " + errorIDs /*+ err */ );
        document.getElementById("errorIDs").append(name, ",");
    }
    
}

// uses authObj which has been defined elsewhere in 
// loadFile.js (to be renamed). It contains the private 
// token which cannot be checked into github repos
// There is no equivalent of extern in C in JavaScript
// so need to use module export and import 
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
//
function getGitInfoForUserAndDisplay(name) {
    return loadJson(`https://api.github.com/users/${name}`, authObj)
        .then(user => {
            //alert(`Full name: ${user.name}.`); // (1)
            addUserDetails(name, user);
            return user;
        });
        /*
        .catch(err => {
            if (err instanceof HttpError && err.response.status == 404) { // (2)
                // document.getElementById("userID").focus();
                throw err;
            }
            else { 
              // how to handle other errors?
              throw err;
            } 
              
        });
        */

    /*
    <div class="container">
      <img src="img_avatar.png" alt="Avatar" class="image" style="width:100%">
      <div class="middle">
        <div class="text">John Doe</div>
      </div>
    </div>
    */
    // helper function
    function addUserDetails(name, user) {
        console.log(user);
        let img = document.createElement('img');
        img.src = user.avatar_url;
        //img.title = name + " == " + user.name + " == " + user.login;
        img.title = user.bio;
      
        let figure = document.createElement('figure');
        figure.class = "figure";
        let figcaption = document.createElement('figcaption');
        figcaption.class = "figure-caption";

        //figcaption.textContent = name + ", " + user.name + ",";
        //console.log(user.name);
        figcaption.textContent = user.name + "@";
        let gurl = document.createElement('a'); 
        gurl.setAttribute("href", "https://gitter.im/" + name);
        gurl.textContent = name + " "; 
        figcaption.append(gurl);
      
        let url = document.createElement('a'); 
        url.setAttribute("href", user.html_url);
        //url.textContent =  user.html_url.split('/').pop();
        url.textContent =  "github ";
        figcaption.append(url);
      
        if (user.blog.length) {
          console.log(user.blog);
          let burl = document.createElement('a'); 
          burl.setAttribute("href", processURL(user.blog));
          burl.textContent = " /blog"; 
          figcaption.append(burl);
        }
        
        figure.append(img);
        figure.append(figcaption);

        //$('#githubTarget').prepend(url);
        $('#githubTarget').prepend(figure);
        document.getElementById("userID").focus()
        document.getElementById("userID").select();

    }
  
    function processURL (url) {
        url.replace(/^\/+/g, '');
        if (url.indexOf("https://") === -1 || url.indexOf("https://") === -1)
          url = "https://" + url;
        return url;
    }

}

// The Http calls to Gitter and Github are routed
// through this function 
function loadJson(url, data = {}) { // (2)
    return fetch(url, data).then(response => {
        if (response.status == 200) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}
// helper class
class HttpError extends Error { // (1)
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.name = 'HttpError';
        this.response = response;
    }
}


// this function processes a test list of Github IDs to 
// mimic what happens elsewhere in a parallel promise execution
function fetchGitInfoForGitterList2(names) {

    names = names.split(",");
    console.log(names);
  
    // this is where https://quasar-rate.glitch.me/chapter-3/3-07-aggregate-tasks.html
    // and https://quasar-rate.glitch.me/chapter-3/3-08-aggregate-all-outcomes.html
    // need to be applied and improved upon 
    Promise.all(
        names.map(name => getGitInfoForUserAndDisplay(name.trim())
                  .catch(err => processError(err, name))
                  )
    ).then(() => {
      console.log("Parallel fetch completed"); 
      document.getElementById("progressStatus").append(" errors ", errorIDs.length);
    });
    // .then(await sleep (3000);

    document.getElementById("userID").focus();
    document.getElementById("userID").select();

    
    // helper function 
    function processError(err, name) {
        errorIDs.push(name);
        console.log("Failed: " + errorIDs /*+ err */ );
        document.getElementById("errorIDs").append(name, ",");
    }

}

//------------------------
//------------------------
// Miscellaneous functions
//------------------------
//------------------------

function loadScript(src) {
    return new Promise(function(resolve, reject) {
        let script = document.createElement('script');
        script.src = src;

        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error("Script load error: " + src));

        document.head.append(script);
    });
}

//let promise5 = loadScript("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.2.0/lodash.js");
let promise5 = loadScript("loadFile.js");

promise5.then(
    script => {
        //alert(`${script.src} is loaded!`);
        getHtmlFile();
    },
    error => alert(`Error: ${error.message}`)
);

promise5.then(script => {
    //alert('One more handler to do something else!');
    $("#scriptTarget").click(function() {
        setText();
    });
});




// ------------------------------------------
//
//   LEGACY CODE 
//
// ------------------------------------------
// Left here for review and reflection
//

/*
var promise6 = new Promise(function(resolve, reject) {

  setTimeout(() => resolve(1), 1000);

}).then(function(result) {

  alert(result);
  return result * 2; // <-- (1)

}) // <-- (2)
// .then…
*/

function parallelGithubUsers() {

    let names = document.getElementById('userID').value;
    if (names.indexOf(",") !== -1) { // is it a list?
        names = names.split(",");
        console.log(names);
    }
    let urls = names.map(name => 'https://api.github.com/users/' + name.trim());
    console.log(urls);
    let requests = urls.map(url => fetch(url));

    Promise.all(requests)
        .then(responses => responses.forEach(
            response => alert(`${response.url}: ${response.status}`)
        ));

}



/* ---------------------------
 * https://javascript.info/promise-basics
 *
 *
 * --------------------------
 */
// Using Promises for asynchronous code 
// https://javascript.info/promise-basics#example-loadscript

/*
function loadScript(src, callback) {
  let script = document.createElement('script');
  script.src = src;

  script.onload = () => callback(null, script);
  script.onerror = () => callback(new Error(`Script load error ` + src));

  document.head.append(script);
}
*/

/*
fetch('/user.json')
  .then(response => response.json())
  .then(user => fetch(`https://api.github.com/users/${user.name}`))
  .then(response => response.json())
  .then(githubUser => new Promise(function(resolve, reject) {
    let img = document.createElement('img'); 
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    //document.body.append(img);
    $('#textTarget').append(img);

    setTimeout(() => {
      img.remove();
      resolve(githubUser);
    }, 3000);
  }))
  // triggers after 3 seconds
  .then(githubUser => alert(`Finished showing ${githubUser.name}`));
*/

/*
// Make a request for user.json
fetch('/user.json')
  // Load it as json
  .then(response => response.json())
  // Make a request to github
  .then(user => fetch(`https://api.github.com/users/${user.name}`))
  // Load the response as json
  .then(response => response.json())
  // Show the avatar image (githubUser.avatar_url) for 3 seconds (maybe animate it)
  .then(githubUser => {
    let img = document.createElement('img');
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    //document.body.append(img);
    $('#textTarget').append(img);
    setTimeout(() => img.remove(), 4000); // (*)
  });

*/




// ------------

/*
let promise4 = new Promise(resolve => {
  setTimeout(() => resolve("done!"), 1000);
});

promise4.then(alert); // shows "done!" after 1 second
*/

// resolve runs the first function .then
/*
A Promise object serves as a link between the executor 
(the “producing code” or "singer) and the consuming functions 
(the “fans”), which will receive the result or error. 
Consuming functions can be registered (subscribed) using
the methods .then and .catch.
*/

/*
let promise1 = new Promise(function(resolve, reject) {
  // the function is executed automatically when the promise is constructed

  // after 1 second signal that the job is done with the result "done!"
  setTimeout(() => resolve("2 seconds passed!!"), 2000);
});

promise1.then(
  result => alert(result), // shows 'done!" after 1 second
  error => alert(error) // doesn't run
);

let promise2 = new Promise(function(resolve, reject) {
  // the function is executed automatically when the promise is constructed

  // after 1 second signal that the job is done with the result "done!"
  setTimeout(() => reject(new Error("Whoops!")), 4000);
});

// resolve runs the first function .then
promise2.then(
  result => alert(result), // doesn't run
  error => alert(error) // Shows "error: Whoops!"
);

*/


/*
let promise = new Promise(function(resolve, reject) {
  // executor (the producing code, "singer")
  console.log("Hello, World!"); 
  
});

*/
