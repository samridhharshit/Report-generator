const express = require('express');
const app = express();
const MethodOverRide = require('method-override');
const port = 8000;

const studentroutes = require('./studentloginroutes');
const hodroutes = require('./hodloginroutes.js');

app.use(MethodOverRide("_method"));

const BodyParser = require('body-parser');
app.use(BodyParser.urlencoded({extended: false}));
app.use(BodyParser.json());

const path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('static'));

//SQL connection
//-----------/usr/bin/mysql -u root -p---------for opening mysql server locally

const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'outpass'
});

connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected ... main page");
    } else {
        console.log("Error connecting database ... nn");
    }
});


//Rendering main page
app.get('/', (req,res) => {
    res.render('main_page');
});


//Rendering student page
app.get('/student', (req,res) => {
    res.render('student-login');
});

app.post('/student/register',studentroutes.register);

app.post('/student/login', studentroutes.login);

//getting the studentForm page
app.get('/studentForm', (req,res)=> {
    let department = studentroutes.branch;
    //accessing the branch of student regNo render the all hods of the respective branch and show it in the template
    connection.query(`select * from hod where branch = ?`, [department], (err, hod, field)=> {
        if (err) throw err;
        // console.log(hod);
        res.render('studentForm', {hod});
    });

});

//posting on the studentForm page for saving the information in the outPass table
app.post('/studentForm', (req,res)=> {
    let studentId = studentroutes.regNo;
    let studentName = studentroutes.name;
    let studentBlock = studentroutes.block;
    let studentContact = studentroutes.contact;
    let studentRoom = studentroutes.roomNo;
    // console.log(studentId);
    let hodName = req.body.department_hod;
    let department = studentroutes.branch;
    connection.query(`select * from hod where branch = ? and name = ?`, [department, hodName], (err, hod, field)=> {
        if (err) throw err;
        let hodId = hod[0].collegeId;
        // console.log(hodId);
        const applicationForm = {
            journey_mode: req.body.mode,
            journey_from: req.body.journey_from,
            journey_to: req.body.journey_to,
            journey_state: req.body.journey_state,
            journey_city: req.body.journey_city,
            zipcode: req.body.zipcode,
            reason: req.body.reason,
            studentId: studentId,
            studentContact: studentContact,
            studentName: studentName,
            studentBlock: studentBlock,
            studentRoomNo: studentRoom,
            hodId: hodId,
        };
        connection.query(`insert into outpass set ?`, applicationForm, (err, result, fields) => {
            if(err) throw err;
            console.log(result);
        });
        res.redirect('/');
    });

});

//Rendering hod page
app.get('/hod', (req,res) => {

    res.render('hod-login');
});

//registering hod or coordinator
app.post('/hod/register',hodroutes.register);

//allowing the hod or coordinator to login
app.post('/hod/login',hodroutes.login);

//showing the requests made to the hod
app.get('/hod/requests', (req,res)=> {
    const hodId = hodroutes.collegeId;
    // console.log(hodroutes.collegeId);
    // console.log(`select * from outpass where hodId = 2 and status != 'Reject'`,[hodId]);
    connection.query(`select * from outpass where hodId = ? and status not like 'Reject'`,[hodId], (err, application, fields) => {
        if(err) throw err;
        // console.log(application[0]);
        res.render('requestsToHod', {application});
    });
});

//handling removal or approval of outPasses
app.put("/hod/:applicationId/requests", (req,res)=> {
    // const hodId = hodroutes.collegeId;
    let appId = JSON.parse(req.params.applicationId);
    // console.log(req.params.applicationId);
    // const status = "Reject";
    // console.log(`update outpass set status = ? where applicationId = ?`,[status, appId]);
    connection.query(`update outpass set status = 'Reject' where applicationId = ?`,[appId], (err, application, fields) => {
        if(err) throw err;
        // console.log(application.length);
        res.redirect('/hod/requests');
    });
});

app.listen(port, (req,res) => {
    console.log(`listening to port ${port}`);
});
