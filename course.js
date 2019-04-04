var bodyparser = require('body-parser');
var multer = require('multer');
// var email = require('./email');
var Cookie = require('cookie-parser');
// var logout = require('express-passport-logout');
var path = require('path');
var fs = require('fs');
var upload_module = require('./upload');
var MongoClient = require('mongodb').MongoClient;
var rimraf = require('rimraf');
var url = 'mongodb://localhost:27017/';

exports.addNewCourse = function (req, res) {
    var user = req.cookies['activeInstructor'];
    var course_name = req.body.course_name;


    if (user != undefined) {

        MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');

                var cursor = dbs.collection('courses').find({'course_name': course_name, 'instructor': user}).toArray(function (err, result) {
                    if (err) {

                    }
                    else
                    {
                        if (result.length == 1) {
                            res.cookie('err_msg', 'err_dup_course');
                            res.redirect("http://localhost:3000/viewInsCourses");
                        } else {
                            var cursor = dbs.collection('courses').insert({course_name: course_name, instructor: user, articles: 0, status: 'public', popularity: 0.0, rating: 0.0, enroll_count: 0, rate_count: 0}, function (err) {
                                if (err) {

                                }
                                else
                                {
                                    if (!fs.existsSync('uploads/' + user + '/' + course_name)){
                                        fs.mkdirSync('uploads/' + user + '/' + course_name);
                                    }
                                    res.cookie('course_name', course_name);

                                    res.cookie('status', 'public');
                                    res.render("contribute", {
                                        whoami: user,
                                        course_name: course_name,

                                        articles: 0,
                                        status: 'public'
                                    });
                                }

                            });
                        }
                    }

                });
            }

        });

    } else {
      res.redirect("http://localhost:3000/");

    }
};

exports.modifyCourse = function (req, res) {
    var user = req.cookies['activeInstructor'];
    var course_name = req.cookies['course_name'];


    if (user != undefined) {

        MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('courses').find({'course_name': course_name, 'instructor': user}).toArray(function (err, result) {
                    if (err) {

                    }
                    else
                    {
                        if (result.length == 1) {
                            res.cookie('status', result[0].status);
                            res.render("contribute", {
                                whoami: user,
                                course_name: course_name,

                                articles: result[0].articles,
                                status: result[0].status
                            });
                        }
                    }

                });
            }

        });

    } else {
      res.redirect("http://localhost:3000/");

    }
};

exports.fetchFiles = function(req, res) {
    var user = req.body.instructor;
    var course_name = req.body.course_name;
    if (user == req.cookies['activeInstructor']) {
        var directoryPath = path.join(__dirname, 'uploads/' + user + '/' + course_name);
        fs.readdir(directoryPath, function (err, files) {
            if (err) {
                console.log('Unable to scan directory: ' + err);
            }
            // console.log(files);
            // files.forEach(function (file) {
            //     console.log(file);
            // });
            data = {
                'all_files': files
            };
            res.send(data);
        });
    }
};

exports.removeArticle = function(req, res) {
    var user = req.body.instructor;
    var course_name = req.body.course_name;
    var filename = req.body.article;

    if (user == req.cookies['activeInstructor']) {
        fs.unlink('uploads/' + user + '/' + course_name + '/' + filename, function (err) {
            if (err) throw err;
            data = {
            };
            res.send(data);
        });
    }
};

exports.updateCourse = function(req, res) {
    var user = req.cookies['activeInstructor'];
    var course_name = req.cookies['course_name'];

    // console.log(user);
    var upload = upload_module.uploadArticle('articles[]', 'uploads/' + user + '/' + course_name + '/');
    if (user != undefined) {
        upload(req, res, function (err) {
            if (err) {
                res.send(err);
            } else {
                MongoClient.connect(url, function(err, db) {
                    if (err) {

                    } else {
                        var dbs = db.db('nptel');
                        var cursor = dbs.collection('courses').update({'course_name': course_name, 'instructor': user}, {$set:{'articles': 1}}, function (err, result) {
                            if (err) {

                            }
                            else
                            {
                               res.redirect("http://localhost:3000/modifyCourse");
                            }

                        });
                    }

                });

            }
        });
    }
    else {
      res.redirect("http://localhost:3000/");
    }
};

exports.publish = function(req, res) {
    // console.log(user);
    if (req.cookies['activeInstructor'] != undefined) {
        res.render("publish", {
            whoami: req.cookies['activeInstructor'],
            course_name: req.cookies['course_name'],

            status: req.cookies['status']
        });
    }
    else {
      res.redirect("http://localhost:3000/");
    }
};

exports.decision = function(req, res) {
    var user = req.cookies['activeInstructor'];
    var course_name = req.cookies['course_name'];

    var stat = req.body.status;
    var status = "public";
    if (stat == "on") {
        status = "public"
    }
    console.log(status);
    if (user != undefined) {
        MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('courses').update({'course_name': course_name, 'instructor': user}, {$set:{'status': status}}, function (err, result) {
                    if (err) {

                    }
                    else
                    {

                        var cursor1 = dbs.collection('enrolled').update({'course_name': course_name, 'instructor': user}, {$set:{'status': status}}, function (err, result) {
                            if (err) {

                            }
                            else
                            {
                                res.cookie('course_name', 'none');

                                res.cookie('articles', 'none');
                                res.cookie('status', 'none');
                                res.redirect("http://localhost:3000/i_overview");
                            }

                        });
                    }

                });
            }

        });
    }
    else {
      res.redirect("http://localhost:3000/");
    }
};

exports.viewInsCourses = function(req, res) {
    var user = req.cookies['activeInstructor'];

    if (user != undefined) {
        MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('courses').find({'instructor': user}).toArray(function (err, result) {
                    if (err) {

                    }
                    else
                    {
                        var data = [];
                        //Contain the course names of that particular instructor
                        var temp = [];
                        for (var i = 0; i < result.length; i++) {
                            temp.push(path.join(__dirname, 'uploads/' + user + '/' + result[i].course_name));

                        }
                        upload_module.empty();
                        temp.forEach(upload_module.getAllFiles);
                        temp = [];
                        var files = upload_module.returnFiles();
                        // console.log(files);
                        for (var i = 0; i < result.length; i++) {
                            temp = [];
                            temp.push(result[i].course_name);

                            temp.push(result[i].status);
                            temp.push(result[i].rating);
                            temp.push(result[i].enroll_count);
                            temp.push(files[i]);
                            data.push(temp);

                        }
                        // console.log(data);

                        res.render("ins_courses", {
                            whoami: user,
                            data: data,

                            course_topics: req.cookies['course_topics'],
                            message: req.cookies['err_msg']
                        });

                    }

                });
            }

        });
    }
    else {
      res.redirect("http://localhost:3000/");
    }
};

exports.viewFile = function(req, res) {
    // console.log(user);
    var user = req.query.user;
    var filename = req.query.filename;
    var course_name = req.query.course_name;
    console.log(filename);

    if (req.cookies['activeInstructor'] == user) {
        res.sendFile(__dirname + '/uploads/' + user + '/' + course_name + '/' + filename);
    }
};

exports.editCourse = function(req, res) {
    // console.log(user);
    var user = req.body.instructor;

    var course_name = req.body.course_name;
    // console.log(filename);

    if (req.cookies['activeInstructor'] == user) {
        res.cookie('course_name', course_name);

        res.redirect("http://localhost:3000/modifyCourse");
    }
};

exports.removeCourse = function(req, res) {
    // console.log(user);
    var user = req.body.instructor;

    var course_name = req.body.course_name;
    // console.log(filename);
    if (req.cookies['activeInstructor'] == user) {
        MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('courses').find({'course_name': course_name,  'instructor': user}).toArray(function (err, result) {
                    if (err) {
                        res.cookie('err_msg', 'err_rem_course');
                        res.redirect("http://localhost:3000/viewInsCourses");
                    }
                    else
                    {
                        // console.log(result);
                        if (result.length == 1) {
                            var cursor1 = dbs.collection('courses').remove({'course_name': course_name,  'instructor': user}, function (err) {
                                if (err) {
                                    res.cookie('err_msg', 'err_rem_course');
                                    res.redirect("http://localhost:3000/viewInsCourses");
                                }
                                else
                                {
                                    rimraf('uploads/' + user + '/' + course_name, function (err) {
                                        if (err) throw err;
                                    });

                                    var cursor2 = dbs.collection('enrolled').remove({'course_name': course_name,  'instructor': user}, function (err) {
                                        if (err) {
                                            res.cookie('err_msg', 'err_rem_course');
                                            res.redirect("http://localhost:3000/viewInsCourses");
                                        }
                                        else
                                        {
                                            rimraf('uploads/' + user + '/' + course_name, function (err) {
                                                if (err) throw err;
                                            });
                                            res.cookie('err_msg', 'ok_rem_course');
                                            res.redirect("http://localhost:3000/viewInsCourses");
                                        }

                                    });
                                }

                            });
                        } else {
                            res.cookie('err_msg', 'err_no_course');
                            res.redirect("http://localhost:3000/viewInsCourses");
                        }
                    }

                });
            }

        });
    }
};
