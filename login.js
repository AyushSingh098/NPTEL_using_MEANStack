// var conn = require('./connection');
// var upload_module = require('./upload');
var bodyparser = require('body-parser');
var multer = require('multer');
// var email = require('./email');
var Cookie = require('cookie-parser');
// var logout = require('express-passport-logout');
var path = require('path');
var fs = require('fs');

//Retrieve
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';

exports.login = function (req, res) {
  var user = req.body.myUsername;
  var pass = req.body.myPassword;
  var type = req.body.type;
  if(type == 'student')
  {
    MongoClient.connect(url, function(err, db)
    {
      if (err)
      {
      }
      else
      {
        var dbs = db.db('nptel');
                //The toArray() method returns an array that contains all the documents from a cursor.
                //The method iterates completely the cursor, loading all the documents into RAM and exhausting the cursor.
        var cursor = dbs.collection('Student_login').find({'username': user, 'password': pass}).toArray(function (err, result) {
        if (err)
        {
        }
        else
        {
          console.log(result);
          console.log();
          if (result.length == 1)
          {
            res.cookie('activeStudent', user);
            res.redirect("http://localhost:3000/overview");
            // Student profile
          }
          else
          {
            console.log("Incorrect Credentials");
            res.redirect("http://localhost:3000/");
          }
        }

        });
      }
      });
    }
    //If Instructor Login
    else{

        MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('Instructor_login').find({'username': user, 'password': pass}).toArray(function (err, result) {
                    if (err) {

                    }
                    else
                    {
                        if (result.length == 1) {

                            res.cookie('activeInstructor', user);
                            // res.redirect("http://localhost:8080/profile");
                            res.redirect("http://localhost:3000/i_overview");
                            // Instructor profile
                        } else {
                          console.log("Incorrect Credentials");
                          res.redirect("http://localhost:3000/");
                        }
                    }

                });
            }

        });
    }

};



exports.register= function(req,res){

    if(req.body.type == "student")
    {
        res.redirect(307,"http://localhost:3000/registerStudentAccount");
    }
    else
    {
        res.redirect(307,"http://localhost:3000/registerInstructorAccount");
    }
}
exports.register_student_account = function (req, res) {
    var user = req.body.username;
    var pass = req.body.password;
    var email = req.body.email;
    var name = req.body.name;
    var type = req.body.type;
    // console.log(req.body);
    MongoClient.connect(url, function(err, db) {
        if (err) {

        } else {
            var dbs = db.db('nptel');
            var cursor = dbs.collection('Student_login').insert({username: user, password: pass, email: email, name: name, type: type}, function (err) {
                if (err) {
                    res.sendFile(__dirname + "/Users/ayushsingh/Desktop/myNptel-master/templates/register.html");
                }
                else
                {
                    res.redirect("http://localhost:3000/");
                }

            });
        }

    });
};

exports.register_instructor_account = function (req, res) {
    var user = req.body.username;
    var pass = req.body.password;
    var email = req.body.email;
    var name = req.body.name;
    var type = req.body.type;
    // console.log(req.body);
    MongoClient.connect(url, function(err, db) {
        if (err) {

        } else {
            var dbs = db.db('nptel');
            var cursor = dbs.collection('Instructor_login').insert({username: user, password: pass, email: email, name: name,type : type}, function (err) {
                if (err) {
                    res.sendFile(__dirname + "/Users/ayushsingh/Desktop/myNptel-master/templates/register.html");
                }
                else
                {
                  //Test whether or not the given path exists by checking with the file system
                    if (!fs.existsSync('uploads/' + user)){
                        fs.mkdirSync('uploads/' + user);
                    }
                    res.redirect("http://localhost:3000/");
                }

            });
        }

    });
};



exports.overview = function (req, res) {
    var user = req.cookies['activeStudent'];
    console.log(user);
    console.log("In overview");
    if (user != undefined) {
        // res.send("logged into haha!");
        //SENT TO INDEX.ejs PAGE IN VIEWS FOLDER WITH DATA PASSED IN WHOMAI
        res.render("index", {
            whoami: user
        });
        console.log(user);
    } else {
        // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        // res.render("wrong_login", {
        //     message: "Login First . . ."
        // });
        res.redirect("http://localhost:3000/");
    }
};

exports.i_overview = function (req, res) {
    var user = req.cookies['activeInstructor'];
    if (user != undefined) {
        // res.send("logged into haha!");

        MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('course_topics').find().toArray(function (err, result) {
                    if (err) {

                    }
                    else
                    {
                        res.cookie('course_topics', result);
                        res.cookie('err_msg', 'ok');
                        res.render("ins_index", {
                            whoami: user,
                            course_topics: result
                        });
                    }

                });

            }

        });



    } else {
        // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        // res.render("wrong_login", {
        //     message: "Login First . . ."
        // });
        res.redirect("http://localhost:3000/");
    }
};
