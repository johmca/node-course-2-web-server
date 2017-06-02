//Load Cloud Foundry Environment variable parsing library
const cfenv = require("cfenv");

//Load express library
const express = require('express');

//Load handlebars templating engine library
const hbs = require('hbs');

//Load fs libarary for local file system interaction
const fs = require('fs');

//Get port number.  If running locally this defaults to 6003.
//If running on Cloud Foundry this is obtained from VCAP environment variables
var appEnv = cfenv.getAppEnv();
var port = appEnv.port;

//Create our app as an instance of express
var app = express();

//Set up hbs template engine to use partials
//Partials are re-usable chunks of web pages such as common
//headers, footers etc.
//Tell hbs where to find these
hbs.registerPartials(__dirname + '/Views/partials');

//Use .set() to specify the view engine for express to be hbs
app.set('views', __dirname + '/Views');
app.set('view engine','hbs');

//Express middleware is a means of extending express functionality
//We use fucntion .use() to do this. .use() expects a fucntion to be passed in

//Note - Middleware executes stricty in the order we define it
//We originally defined our static middleware makign all our files available
//first. This meant that our help.html file was still accessable even
//though we added our maintenance middleware which prevented the program
//from reaching the route definitions. Solution is to move the static middleware
//down after the maintenance middleware



//Add more middlware - this time our own function to log user access
//This time we add a function that receives
// i) request object
// ii) response object
// iii) next function
//next() is very important. we MUST call .next() in order to exit our function
//and allow the rest of the program to execute
app.use((req,res,next)=>{
  var now = new Date().toString();
  var logText = `${now}:${req.method}:${req.url}`;
  console.log(logText);
  fs.appendFile('server.log',logText+'\n');
  next();
});

//Add another bit of middleware to render the site maintenance screen
//this time we don't want to move on - we want to stick on the maintenance screen
//so don't issue .next()
// app.use((req,res,next)=>{
//   res.render('maintenance.hbs');
// });

//Add in a bit of middleware called static which helps us serve up the content
//of a folder without the need to start defining lots of routes. The files
//within the folder become accessible from the browser.
//Static is a function which accepts the path to our folder as a parm
//Note that we should use the system variable __dirname to get our apps
//root and then concatenate the fodler onto it
app.use(express.static(__dirname + '/Public'));

//Use another feature of hbs to register helper functions
//This allows us to code some logic that needs to run in multiple places in
//our website in one place e.g. previously we had logic t get the current year
//in each hbs.render statement to pass the value in to hbs
//Create two helper functions below
// i) get the current year
// ii) convert lower case text to upp case text
hbs.registerHelper('getCurrentYear',()=>{
  return new Date().getFullYear();
});
hbs.registerHelper('screamIt',(text)=>{
  return text.toUpperCase();
});

//Set up HTTP route handlers i.e. fucntions to call when clients issue
//requests to particular URLs

//express's .get() fucntion allows us to do this. It requires 2 parms
// a) the URL where '/' is the app's root
// b) a callback function to execute when a request is received at this URL
//    This function always receives 2 parms
//    - request
//    - response
app.get ('/',(req, res)=>{
  // res.send('<h1>Hello from Express..<h1>');
  // res.send({
  //   name: 'John',
  //   likes:['cake','swimming','guitars']
  // });
  res.render('home.hbs',{
    pageTitle:'Home Page',
    // currentYear:new Date().getFullYear(),
    welcomeText:'Hi...and welcome to my web site'
  });
});

//Create a second route for an about page
//Render about page using hbs view engine by passing page file as first oarm
//Pass variable data into hbs view engine in second parm as an object
//    Use some Javascript code to get current year (Double curly braces
//    are required in the HTML so that hbs can isnert data)
app.get('/about',(req, res)=>{
//  res.send('This is the about page');
    res.render('about.hbs',{
      pageTitle:'About Page',
      // currentYear:new Date().getFullYear()
    });
});

//Create a route for projects page and render using projects.hbs
app.get('/projects',(req, res)=>{
    res.render('projects.hbs',{
      pageTitle:'Projects Page',
    });
});


//Create a 3rd route for errors
app.get('/bad',(req, res)=>{
  res.send({
    error: 000001,
    errorMessage:'Oooops somethign went wrong....'
  });
});

//Bind our app to a port - the server app will now listen fr requests on this
//port. When a request comes in that matches one of our routes it will
//invoke the function specified on the route.
//.listen() takes 2 parms
// a) The port number
// b) An optional callback function
app.listen(port,()=>{
  console.log(`Listening on port ${port}...`);
});
