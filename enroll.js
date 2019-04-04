var bodyparser = require('body-parser');
var multer = require('multer');
// var email = require('./email');
var Cookie = require('cookie-parser');
// var logout = require('express-passport-logout');
var nodemailer = require('nodemailer');
var path = require('path');
var fs = require('fs');
var upload_module = require('./upload');
var MongoClient = require('mongodb').MongoClient;
var rimraf = require('rimraf');
var url = 'mongodb://localhost:27017/';
var xml2js = require('xml2js');
var parser = new xml2js.Parser();


// exports.takeMyQuiz = function(req,res){
//
// 	var xmlfile = __dirname + "./bookstore.xml";
//     fs.readFile(xmlfile, "utf-8", function (error, text) {
//         if (error) {
//             throw error;
//         }else {
//             parser.parseString(text, function (err, result) {
//                 var books = result['bookstore']['book'];
//                 res.render('takeQuiz', { books:  books });
//             });
//         }
//    });
// }

exports.viewCourses = function (req, res) {
	var user = req.cookies['activeStudent'];
	if (user != undefined) {
		MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('enrolled').aggregate([
                	{
										//left outer join
                		$lookup:
                		{
											//<collection to join>
	                		from: 'Instructor_login',
											//<field from the input documents>
	                		localField: 'instructor',
											//<field from the documents of the "from" collection>
	                		foreignField: 'username',
											//<output array field>
	                		as: 'instructor_details'
                		}
                	}
                ]).toArray(function (err, result) {
                    if (err) {

                    }
                    else
                    {
                    	var send = [];
                    	for(var i=0; i<result.length; i++) {
                    		if(result[i].student == user && result[i].status == 'public') {
                    			send.push(result[i]);
                    		}
                    	}
                        res.render("registered_course", {
                            whoami: user,
                            enrolled: send
                        });

                    }

                });
            }

        });
	} else {
			res.redirect("http://localhost:3000/");
	}
};

exports.viewAllCourses = function (req, res) {
	var user = req.cookies['activeStudent'];
	if (user != undefined) {
		MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');

                var cursor = dbs.collection('courses').aggregate([
                	{
                		$lookup:
                		{
	                		from: 'Instructor_login',
	                		localField: 'instructor',
	                		foreignField: 'username',
	                		as: 'instructor_details'
                		}
                	}
                ]).toArray(function (err, result) {
                    if (err) {

                    }
                    else
                    {
                    	// console.log(result);
                    	var send = [];
            			var cursor1 = dbs.collection('enrolled').find({'student': user}).toArray(function (err, results) {
                            if (err) {

                            }
                            else
                            {

		                    	for(var i=0; i<result.length; i++) {
		                    		if(result[i].status == 'public') {
		                    			var j = 0;
	                            		for(j=0; j<results.length; j++) {
	                            			if (results[j].course_name == result[i].course_name) {
	                            				result[i].isEnrolled = 'yes';
	                            				break;
	                            			}
	                            		}
	                               		if (j == results.length) {
	                               			result[i].isEnrolled = 'no';
	                               		}
            							send.push(result[i]);
            						}
                               	}
                               	res.render("all_courses", {
		                            whoami: user,
		                            enrolled: send
		                        });
                            }

                        });


                    }

                });
            }

        });
	} else {res.redirect("http://localhost:3000/");

	}
};

exports.enterCourse = function (req, res) {
	var user = req.body.student;
	var instructor = req.body.instructor;
	var instructor_fn = req.body.instructor_fn;
	var course_name = req.body.course_name;
	var topic_name = req.body.topic_name;
	// console.log(course_name);
	// console.log(topic_name);
	// console.log(instructor);

	if (user == req.cookies['activeStudent']) {
		MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');

                var cursor = dbs.collection('enrolled').find({"student": user, "course_name": course_name, "instructor": instructor}).toArray(function (err, result) {
                    if (err) {

                    }
                    else
                    {
                    	if(result.length == 1)
                    	{
                    		var directoryPath = path.join(__dirname, 'uploads/' + instructor + '/' + course_name);
					        fs.readdir(directoryPath, function (err, files) {
					            if (err) {
					                console.log('Unable to scan directory: ' + err);
					            }
					            // console.log(files);
					            var cursor = dbs.collection('courses').find({"course_name": course_name, "instructor": instructor}).toArray(function (err, results) {
					                if (err) {

					                }
					                else
					                {
					                	// console.log(results);
					                    if (results.length == 1) {
					                    	res.render("read_course", {
			                                    whoami: user,
			                                    course_name: course_name,

			                                    instructor: instructor,
			                                    instructor_fn: instructor_fn,

			                                    all_articles: files,
			                                    overall_rating: results[0].rating,
			                                    individual_rating: result[0].rating,
			                                    rated: result[0].rated,
			                                    enroll_count: results[0].enroll_count,
			                                    rate_count: results[0].rate_count
			                                });

					                    } else {
					                        res.redirect("http://localhost:3000/viewCourses");
					                    }
					                }

					            });

					        });
                    	} else {
                    		res.redirect("http://localhost:3000/viewCourses");
                    	}

                    }

                });
            }

        });
	} else {
		// console.log('hello');
	}
};

exports.registerCourse = function(req, res) {
	var user = req.body.student;
	var course_name = req.body.course_name;
	var topic_name = req.body.topic_name;
	var instructor = req.body.instructor;

	if (req.cookies['activeStudent'] == user) {

    	MongoClient.connect(url, function(err, db) {
            if (err) {
            	data = {
	                'message': 'err_register'
	            };
	            res.send(data);
            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('enrolled').insert({'student': user, 'course_name': course_name, 'topic_name': topic_name, 'instructor': instructor, 'rated': 'no', 'rating': 0.0, 'status': 'public'}, function (err) {
                    if (err) {
                    	data = {
			                'message': 'err_register'
			            };
			            res.send(data);
                    }
                    else
                    {
                    	var cursor = dbs.collection('courses').update({'course_name': course_name, 'topic_name': topic_name, 'instructor': instructor}, {$inc: {'enroll_count': 1}}, function (err) {
		                    if (err) {
		                    	data = {
					                'message': 'ok_register'
					            };
					            res.send(data);
		                    }
		                    else
		                    {
		                    	data = {
					                'message': 'ok_register'
					            };
					            res.send(data);
		                    }

		                });
                    }

                });
            }

        });

    }
};

exports.viewArticle = function(req, res) {
    // console.log(user);
    var user = req.query.user;
    var filename = req.query.filename;
    var course_name = req.query.course_name;
    var instructor = req.query.instructor;
    // console.log(filename);

    if (req.cookies['activeStudent'] == user) {

    	MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('enrolled').find({'course_name': course_name, 'student': user, 'instructor': instructor}).toArray(function (err, result) {
                    if (err) {

                    }
                    else
                    {
                    	if (result.length == 1) {
                    		res.sendFile(__dirname + '/uploads/' + instructor + '/' + course_name + '/' + filename);
                    	}
                    }

                });
            }

        });

    }
};

exports.downloadArticle = function (req, res) {
	// console.log(user);
    var user = req.query.user;
    var filename = req.query.filename;
    var course_name = req.query.course_name;
    var instructor = req.query.instructor;
    // console.log(filename);

    if (req.cookies['activeStudent'] == user) {

    	MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('enrolled').find({'course_name': course_name, 'student': user, 'instructor': instructor}).toArray(function (err, result) {
                    if (err) {

                    }
                    else
                    {
                    	if (result.length == 1) {
                    		res.download("./uploads/" + instructor + '/' + course_name + '/' + filename);
                    	}
                    }

                });
            }

        });

    }
};

exports.updateRating = function (req, res) {
	// console.log(user);
    var user = req.body.user;
    var course_name = req.body.course_name;
    var instructor = req.body.instructor;
    var topic_name = req.body.topic_name;
    var new_rating = req.body.new_rating;
    var old_rating = req.body.old_rating;
    var overall_rating = req.body.overall_rating;
    var rate_count = parseInt(req.body.rate_count);
    var isRated = req.body.isRated;

    // console.log(filename);

    if (req.cookies['activeStudent'] == user) {

    	MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('enrolled').update({'course_name': course_name, 'student': user, 'instructor': instructor}, {$set: {"rated": "yes","rating": new_rating}}, function (err) {
                    if (err) {
                    	data = {
			                'message': 'err_rating_update'
			            };
			            res.send(data);
                    }
                    else
                    {
                    	var new_overall_rating = 0;
                    	if (isRated == 'no') {
                    		new_overall_rating = ((overall_rating*rate_count)+new_rating)/(rate_count+1);
                    		rate_count = rate_count + 1;
                    	} else {
                    		new_overall_rating = ((overall_rating*rate_count)-old_rating+new_rating)/(rate_count);
                    	}
                    	var cursor1 = dbs.collection('courses').update({'course_name': course_name, 'topic_name': topic_name, 'instructor': instructor}, {$set: {"rate_count": rate_count,"rating": new_overall_rating}}, function (err) {
		                    if (err) {
		                    	data = {
					                'message': 'err_rating_update'
					            };
					            res.send(data);
		                    }
		                    else
		                    {
		                    	data = {
					                'new_overall_rating': new_overall_rating,
					                'new_rate_count': rate_count,
					                'new_individual_rating': new_rating,
					                'isRated': 'yes',
					                'message': 'ok_rating_update'
					            };
					            res.send(data);

		                    }

		                });
                    }

                });
            }

        });

    }
};

exports.sendFeedback = function (req, res) {

	var sender = req.body.sender;
	var recipient = req.body.recipient;
	var course = req.body.course_name;
	var message = req.body.message;

	if (sender == req.cookies['activeStudent']) {
		MongoClient.connect(url, function(err, db) {
            if (err) {

            } else {
                var dbs = db.db('nptel');
                var cursor = dbs.collection('Instructor_login').find({'username': recipient}).toArray(function (err, result) {
                    if (err) {
                    	data = {
			        		'message': 'err_send_feedback'
			        	};
			            res.send(data);
                    }
                    else
                    {
                    	if (result.length == 1) {
                    		recipient = result[0].email;
                    		var transporter = nodemailer.createTransport({
						        service: 'gmail',
						        auth: {
						            user: 'pritam.ndp@gmail.com',
						            pass: 'chotushkon'
						        }
						    });

						    console.log(recipient);
						    console.log(message);

						    var mailOptions = {
						        from: 'pritam.ndp@gmail.com',
						        to: recipient,
						        subject: "no-reply: Productivo | Feedback from " + sender + " on " + course,
						        html: message
						    };

						    transporter.sendMail(mailOptions, function (error, info) {
						        if (error) {
						            data = {
						        		'message': 'err_send_feedback'
						        	};
						            res.send(data);
						        } else {
						        	data = {
						        		'message': 'ok_send_feedback'
						        	};
						            res.send(data);
						        }
						    });
                    	} else {
                    		data = {
				        		'message': 'err_send_feedback'
				        	};
				            res.send(data);
                    	}
                    }

                });
            }

        });
	}

};
