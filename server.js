// server.js

// set up ======================================================================
// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var User = require('./app/models/user');
var Patient = require('./app/models/patient');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));                                         // log every request to the console
mongoose.connect('mongodb://admin:admin@ds031561.mongolab.com:31561/telemedicina');
//mongoose.connect("mongodb://localhost/telemedicina");

var port = /*process.env.PORT || */8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/users')
    // create a user (accessed at POST http://localhost:8080/api/users)
    .post(function (req, res) {
        var new_user = new User(req.body);      // create a new instance of the Bear model
        console.log('Creating user' + req.body);
        new_user.save(function (err, user) {
            if (err) {
                console.warn('Error ' + err);
                res.status(400).send({message: err});
            } else {
                console.info('Success!');
                res.status(200).send({status: 200, message: 'User successfully created.', code: 1, user: user});
            }
        });
    })
    // get all the users (accessed at GET http://localhost:8080/api/users)
    .get(function (req, res) {
        User.find(function (err, users) {
            if (err) {
                console.warn('Error ' + err);
                res.status(500).send({message: err});
            } else {
                res.status(200).send({status: 1, code: 1, message: 'users found', users: users})
            }

        });
    });

router.route('/users/:user_id')

    // get the user with that id (accessed at GET http://localhost:8080/api/users/:user)
    .get(function (req, res) {
        User.findById(req.params.user_id, function (err, user) {
            if (err) {
                res.status(404).send(err);
            } else {
                res.status(200).send({user: user})
            }
        });
    })
    .put(function (req, res) {
        // use our user model to find the user we want
        var user = User.findOneAndUpdate(
            {_id:req.params.user_id},
            {$set:{first_name:req.body.firstName,last_name:req.body.lastName}},function (err, user) {

                if (err) {
                    res.status(404).send(err);
                }

                res.status(200).send({user: user})

            });

    });

//Patient routes
router.route('/patients')
    // create a patient (accessed at POST http://localhost:8080/api/patients)
    .post(function (req, res) {
        var new_patient = new Patient(req.body);
        console.log('Creating patient' + req.body);
        new_patient.save(function (err, patient) {
            if (err) {
                console.warn('Error ' + err);
                res.status(400).send({message: err});
            } else {
                console.info('Success!');
                res.status(200).send({
                    status: 200,
                    message: 'Patient successfully created.',
                    code: 1,
                    patient: patient
                });
            }
        });
    })
    // get all the patients (accessed at GET http://localhost:8080/api/patients)
    .get(function (req, res) {
        Patient.find(function (err, patients) {
            if (err) {
                console.warn('Error ' + err);
                res.status(500).send({message: err});
            } else {
                res.status(200).send({status: 1, code: 1, message: 'users found', patients: patients})
            }

        });
    });

router.route('/patients/:patient_healthId')

    // get the user with that id (accessed at GET http://localhost:8080/api/patients/:patient_id)
    .get(function (req, res) {
        console.warn('Patient ID ' + req.params.patient_healthId);

        Patient.findOne({health_insurance_data: {health_insurance_id: req.params.patient_healthId}}, function (err, patient) {
            if (err) {
                res.status(404).send({status: 404, message: err});
            } else {

                if(!patient){
                    res.status(404).send({status: 404, message: "Not found"});
                }else {
                    res.status(200).send({status: 200, message: "Patient found", patient: patient})
                }


            }
        });
    })
    .put(function (req, res) {
        // use our user model to find the user we want
        Patient.findById(req.params.patient_id, function (err, patient) {

            if (err) {
                res.status(404).send(err);
            }
            patient.personal_data.first_name = req.body.first_name;  // update the user info

            // save the user
            patient.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'User updated!'});
            });

        });
    });

router.route('/login')
    .post(function (req, res) {
        // use our user model to find the user we want
        var b = req.body;

        var uName = b.userName;
        var pass = b.password;

        if (uName && pass) {
            console.info('Searching for user with username ' + b.userName);

            var user = User.findOne({email: uName, password: pass}, function (err, user) {
                if (err) {
                    console.warn('Error in login' + err);
                }
                if (!user) {
                    res.send(400, {status: 400, code: 5, message: 'No such user'});
                }
                else {
                    res.send(200, {status: 200, message: 'User found', user: user});
                }

            });

        }
        else {
            res.send(400, {status: 400, code: 3, message: 'Username and password required'});
        }
    });

router.route('/patients/exams/:patientId')
    .post(function (req, res) {
        // use our user model to find the user we want
        var b = req.body;

        var anamnesis = b.anamnesis;
        var doctorFullName = b.doctorFullName;

        if (anamnesis) {
            console.info('Adding exam for user  '
            + req.params.patientId + ' with anamnesis and doctor' + anamnesis + ' ' + doctorFullName);

            var patient = Patient.findOneAndUpdate({health_insurance_data: {health_insurance_id: req.params.patientId}},
                {
                    $push: {
                        health_card: {
                            date_of_visit: new Date(),
                            anamnesis: anamnesis,
                            doctor: doctorFullName
                        }
                    }
                }, function (err, patient) {
                    if (err) {
                        console.warn('Error in login' + err);
                    }
                    if (!patient) {
                        res.send(400, {status: 400, code: 5, message: 'No such patient'});
                    }
                    else {
                        res.send(200, {status: 200, message: 'User found', patient: patient});
                    }

                });

        }
        else {
            res.send(400, {status: 400, code: 3, message: 'fields required'});
        }
    });

router.route('/')
	.get(unction (req, res) {
	  res.send(200, {status: 200, message: 'it works'});
	});

// routes ======================================================================
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);


// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);