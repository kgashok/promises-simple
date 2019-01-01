//-----------------------------
// https://javascript.info/promise-chaining
//------------------------------
/*function loadJson(url) {
  return fetch(url)
    .then(response => response.json());
}*/

var authObj; // for accessing the GithubAPI 

console.log("Explore Promises"); 

function sleep2(ms) {
  console.log("Sleep function called for " + ms + " ms\n");
  return new Promise(resolve => setTimeout(resolve, ms))
    .then(() => console.log("Sleep done!" ));
}

/* a verbose sleep function that uses three promises
   that have been chained together
   
   Credits: https://stackoverflow.com/a/53995436/307454
 
*/
function sleep(ms) {

  const pSleep = ms => () => 
    new Promise((resolve, reject) => window.setTimeout(resolve, ms));

  const changeCursor = c => () => 
    new Promise((resolve, reject) => {
      document.body.style.cursor = c; 
      resolve();
    });

  let names = document.getElementById('userID').value; 

  return Promise.resolve()
    .then(() => console.log("Switching to busy cursor"))
    .then(changeCursor("wait"))
    .then(() => console.log("Sleep function called for " + ms + " ms\n"))
    .then(pSleep(ms))
    .then(() => console.log("Sleep done!"))
    .then(() => console.log("Switching to normal cursor"))
    .then(changeCursor("default"));
}

function simulateCallToFunction() {sleep (3000);} 

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
    GokulPrasath, parisudhaandireyaa`;
}

  document.getElementById('progressStatus').innerHTML = "Status Ok";


let gitterKey =
    "bad0cafba005887e3e7e97dd5a640030f0c7e1b8";
let roomid =
    "570a5925187bb6f0eadebf05";
let gUrl =
    "https://api.gitter.im/v1/rooms/" + 
    roomid + 
    "/users?access_token=" + 
    gitterKey;

initDefaultIds();

function loadJson(url, data = {}) { // (2)
  return fetch(url,data).then(response => {
      if (response.status == 200) {
        return response.json();
      } else {
        // what is thrown here has to be captured
        // and made part of errorIDs? 
        throw new HttpError(response);
      }
    })
}

class HttpError extends Error { // (1)
  constructor(response) {
    super(`${response.status} for ${response.url}`);
    this.name = 'HttpError';
    this.response = response;
  }
}

/*
<div class="container">
  <img src="img_avatar.png" alt="Avatar" class="image" style="width:100%">
  <div class="middle">
    <div class="text">John Doe</div>
  </div>
</div>
*/
function addUserDetails(name, user) { 
  //$('#githubTarget').prepend("<p>"+name + " == " + user.name + "</p>");
  let img = document.createElement('img');
  img.src = user.avatar_url;
  //img.className = "promise-avatar-example";
 //img.class = "img-thumbnail img-responsive";
  //img.class = "figure-img img-fluid rounded";
  //img.class = "imgContainer";
  img.title = name + " == " + user.name;
  
  let figure = document.createElement('figure');
  figure.class = "figure";  
  let figcaption = document.createElement('figcaption');
  //figcaption.class = "figcaption";
  figcaption.class = "figure-caption";
  figcaption.textContent = name + ", " + user.name; 
  
  figure.append(img);
  figure.append(figcaption);
  
  $('#githubTarget').prepend(figure);
  //$('#githubTarget').prepend(img);
  document.getElementById("userID").focus()
  document.getElementById("userID").select();

}

function getUserIdsFromGitterRoom(skip) { 
  let userids = [];
  return loadJson(gUrl + "&skip=" + skip).then(users => { 
    for (var user of users) { 
      userids.push(user.username);
    }
    return userids.join(", ");
  });/*.then (userlist => { 
    document.getElementById("userID").value = userlist;
  });*/
}

  
  
function demoGitterList () { 

  zoom.out();

  let names = document.getElementById('userID').value; 
  if (names.trim().length) 
    fetchGitInfoForGitterList(names);
  else {  
    launchHttpRequestsToGitter();
  }

}
  
function changeProgressToBusy() { 
    document.getElementById("userID").value = "";    
    var pNode = document.getElementById("progressStatus");
    pNode.innerHTML = "Please wait...."; 
    document.body.style.cursor = "wait";
}
  
function changeProgressToCompleted() { 
    var pNode = document.getElementById("progressStatus");
    pNode.innerHTML = 'Parallel requests done. Await results!';
    initDefaultIds();
    document.body.style.cursor = "default";
}
  
async function launchHttpRequestsToGitter() { 
    // https://stackoverflow.com/a/38213213/307454
    
    changeProgressToBusy(); 
    
    let skiplist = // [0, 30, 60, 90, 120, 150, 180, 210, 240] ; 
      Array.from({length: 24}, (v, k) => k*30);

    Promise.all (
      skiplist.map (
        skip => getUserIdsFromGitterRoom(skip)
          .then(userlist => fetchGitInfoForGitterList(userlist))
      )
    ).then (() => { 
      sleep(5000)
        .then(() => {
          changeProgressToCompleted();
        });
    });


    // an untested sequential approach to Http requests
    /*for (var i = 0; i < skiplist.length; i++) {
      getUserIdsFromGitterRoom(skiplist[i])
        .then(userlist =>
              fetchGitInfoForGitterList(userlist));
      //await sleep(9000);
    }*/
}

function processError(errorIDs, err, name) { 
  errorIDs.push(name);
  console.log("Failed: " + errorIDs /*+ err */);
  document.getElementById("errorIDs").append(name, ",");
}
  
function fetchGitInfoForGitterList(names) {
 
  names = names.split(",");
  console.log(names);

  let errorIDs = [];

  let requests = names;
  Promise.all(
    requests.map(name => getGitInfoAndDisplay(name.trim())
        .catch(err => processError(errorIDs, err, name))
    )
  ); // .then(await sleep (3000);

  document.getElementById("userID").focus();
  document.getElementById("userID").select();

}

// uses authObj which has been defined elsewhere in 
// loadFile.js (to be renamed). It contains the private 
// token which cannot be checked into github repos
// There is no equivalent of extern in C in JavaScript
// so need to use module export and import 
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
//
function getGitInfoAndDisplay(name) {
  //let name = prompt("Enter a name?", "iliakan");
  //let name = document.getElementById('userID').value;
  
  return loadJson(`https://api.github.com/users/${name}`, authObj)
    .then(user => {
      //alert(`Full name: ${user.name}.`); // (1)
      addUserDetails(name, user);
      return user;
    })
    .catch(err => {
      if (err instanceof HttpError && err.response.status == 404) { // (2)
        //alert(name + ": No such user, please reenter.");
        document.getElementById("userID").focus();
      }
      throw err;
    });
}


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
  $("#scriptTarget").click(function(){
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
  let urls = names.map(name => 'https://api.github.com/users/'+ name.trim());
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





/*

// final tasks

function delay(ms) {
  // your code
  return new Promise(resolve => setTimeout(resolve, ms));
}

delay(3000).then(() => alert('runs after 3 seconds'));

console.log("Done");

*/
