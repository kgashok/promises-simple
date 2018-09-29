//-----------------------------
// https://javascript.info/promise-chaining
//------------------------------
/*function loadJson(url) {
  return fetch(url)
    .then(response => response.json());
}*/



document.getElementById('userID').value = 
  "iliakan, jeresig, remy, \
  joekzbee, *^, undefined, ###, \
  GokulPrasath, parisudhaandireyaa";     

let gitterKey =
    "bad0cafba005887e3e7e97dd5a640030f0c7e1b8";
let roomid =
    "570a5925187bb6f0eadebf05";
let gUrl =
    "https://api.gitter.im/v1/rooms/" + 
    roomid + 
    "/users?access_token=" + 
    gitterKey;

/*
fetch('URL_GOES_HERE', { 
   method: 'post', 
   headers: new Headers({
     'Authorization': 'Basic '+btoa('username:password'), 
     'Content-Type': 'application/x-www-form-urlencoded'
   }), 
   body: 'A=1&B=2'
 }); 
*/
// thanks to https://stackoverflow.com/a/35780539/307454
let authObj = {
  method: 'get',
  headers: new Headers({
  'Authorization': 'Basic ' + btoa(
      ) 
  }) 
  //body: 'A=1&B=2'

  // function encode(string) {
      //     var array = string.split("");
      //     var output = [];
      //     array.forEach(letter => {
      //         output.push(letter.charCodeAt() + 1);
      //     });
      //     string = output.join(",");
      //     return string;
      // }


      // function decode(string) {
      //     var array = string.split(",");
      //     var output = [];
      //     array.forEach(charCode => {
      //         output.push(String.fromCharCode(charCode - 1));
      //     });
      //     string = output.join("");
      //     return string;
      // }

      // usage:
      // var definitelyNotMySecretAPIKey = encode("e8e3ee385207b5df5983a572fb185dd429ef04ec");
      // var apiKey = decode(definitelyNotMySecretAPIKey);
  
}

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
  //img.height = "90";
  img.width = "120";
  img.hspace = "10";
  //img.class = "img-thumbnail img-responsive";
  img.class = "figure-img img-fluid rounded";
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

    //img.class = "img-thumbnail img-responsive";
  //document.body.append(img);
  /*let imgC = document.createElement('div');
  //imgC.class = "container"; 
  let middle = document.createElement('div');
  middle.class = "middle"; 
  let textDiv = document.createElement('div');
  textDiv.class = "text";
  textDiv.value = name + " == " + user.name;
  imgC.append(img);
  imgC.append(middle);
  imgC.append(textDiv);
  $('#githubTarget').prepend(imgC);
  */

}

function getUserIds(skip) { 
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
  
  let names = document.getElementById('userID').value; 
  if (names.trim().length) 
    demoGithubUserList(names);
  else {  
    let skiplist = [0, 30, 60, 90, 120, 150] ;  

    Promise.all (
      skiplist.map (
        skip => getUserIds(skip)
          .then(userlist => demoGithubUserList(userlist))
      )
    );

    /*for (var i = 0; i < skiplist.length; i++) {
      getUserIds(skiplist[i])
        .then(userlist =>
              demoGithubUserList(userlist));
      //await sleep(9000);
    }*/
  }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
    .then(console.log("Sleep done! " ));
}

function demoGithubUserList(names) { 
  //parallelGithubUsers();
  //getUserIds(skip);  
  
  
  if (names.indexOf(",") !== -1) { // is it a list?
    names = names.split(",");
    console.log(names);    
  
    //for (let name of names) 
    //  demoGithubUser(name.trim());
    //let requests = names.map(name => demoGithubUser(name.trim()));
    let errorIDs = []; 
    
    let requests = names;
    Promise.all(
      requests.map(
        name => 
          demoGithubUser(name.trim())
            .catch(err => { 
              errorIDs.push(name);
              console.log("Failed: " + errorIDs /*+ err */);
              document.getElementById("errorIDs")
                      .innerHTML = 
                        "<b>" + errorIDs + "</b>";
            }
          )
      )
    ); // .then(await sleep (3000);

    document.getElementById("userID").focus();
    document.getElementById("userID").select();

  }
  else
    demoGithubUser(names); 
}

function demoGithubUser(name) {
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
        //return demoGithubUser();
        document.getElementById("userID").focus();
        throw err;
      } else {
        throw err;
      }
    });
}

//demoGithubUser();

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

/*
var promise6 = new Promise(function(resolve, reject) {

  setTimeout(() => resolve(1), 1000);

}).then(function(result) {

  alert(result);
  return result * 2; // <-- (1)

}) // <-- (2)
// .then…
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
A Promise object serves as a link between the executor (the “producing code” or "singer) and the consuming functions (the “fans”), which will receive the result or error. Consuming functions can be registered (subscribed) using the methods .then and .catch.
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


console.log("Explore Promises"); 

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
