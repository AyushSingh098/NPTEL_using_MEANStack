
//express will refer to the main function in code of express module
var express = require('express');

//create an object of express module
var app = express();

//body-parser extract the entire body portion of an incoming request stream and exposes it on req.body
var bodyparser = require('body-parser');

//handling multipart/form-data , which is primarily used for uploading files.
var multer = require('multer');

//User defined modules import
var login_module = require('./login');
var course_module = require('./course');
var enroll_module = require('./enroll');

//File System Module
var fs = require('fs');
var Cookie = require('cookie-parser');
//var filename = "";

app.use(bodyparser.urlencoded({
    extended: true //can deal with nested objects and not only strings/arrays (false)
}));

//Serving static files(css,ejs etc)
app.use(express.static(__dirname + '/views'));

//Middleware functions are functions that have access to the request object (req), the response object (res), and the next function
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'POST', 'GET');

    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});


//app.use(bodyparser);
//var jsonParser = bodyparser.json();
//
//var urlParser = bodyparser.urlencoded({
//    extended: true
//});

//APP.METHOD(PATH, HANDLER)

//Tells the system that you want to use json
app.use(bodyparser.json());
app.use(Cookie());
app.set('view engine', 'ejs');

app.use(function(req,res,next) {
  res.set('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0');
  next();
})
app.get('/', function (req, res) {
    res.redirect('/login');
});

app.get('/logout', function(req, res) {
  console.log("Logging out");
  res.clearCookie('activeStudent');
  res.clearCookie('activeInstructor');
  res.set('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0');
  //res.cookie('activeStudent',"",{expires:Date.now()});
  res.redirect('/');
})
// app.get('/loginS', function (req, res) {
//      res.sendFile("/Users/ayushsingh/Desktop/myNptel-master/templates/test.html");
// });


app.get('/login', function (req, res) {
    res.sendFile("/Users/ayushsingh/Desktop/myNptel-master/templates/login.html");
});

//(path, associated handler)
app.post('/LogIntoAccount', login_module.login);

app.get('/register', function (req, res) {
    res.sendFile("/Users/ayushsingh/Desktop/myNptel-master/templates/register.html");
});

// app.post('/checkValidUsername', login_module.check_validity);

app.post('/fetchFiles', course_module.fetchFiles);
app.post('/removeArticle', course_module.removeArticle);
app.post('/removeCourse', course_module.removeCourse);

// app.post('/logintoAccount', login_module.verify_login);
app.post('/registered',login_module.register);

app.post('/registerStudentAccount', login_module.register_student_account);
app.post('/registerInstructorAccount', login_module.register_instructor_account);

// app.post('/editInfo', login_module.editInfo);
app.get('/overview', login_module.overview)
app.get('/i_overview', login_module.i_overview);
app.post('/addnewcourse', course_module.addNewCourse);
app.post('/publish', course_module.publish);
app.post('/finalTouchToCourse', course_module.decision);
app.get('/modifyCourse', course_module.modifyCourse);
app.get('/viewFile', course_module.viewFile)
app.post('/updateCourse', course_module.updateCourse);
app.post('/editCourse', course_module.editCourse);
app.get('/viewInsCourses', course_module.viewInsCourses);
app.get('/viewCourses', enroll_module.viewCourses);
app.get('/viewAllCourses', enroll_module.viewAllCourses);
// app.get('/takeQuiz', enroll_module.takeMyQuiz );
app.post('/enterCourse', enroll_module.enterCourse);
app.get('/viewArticle', enroll_module.viewArticle);
app.get('/downloadArticle', enroll_module.downloadArticle);
app.post('/updateRating', enroll_module.updateRating);
app.post('/sendFeedback', enroll_module.sendFeedback);
app.post('/registerCourse', enroll_module.registerCourse);
// app.get('/logout', login_module.logOut);
app.listen(3000);
