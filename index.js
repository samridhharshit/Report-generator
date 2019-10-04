const express = require('express');
const app = express();
const MethodOverRide = require('method-override');
const port = 8000;

const studentroutes = require('./studentloginroutes');
const hodroutes = require('./hodloginroutes.js');
const wardenroutes = require('./wardenloginroutes');

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
        let studentName = studentroutes.name;
        let studentId = studentroutes.regNo;
        res.render('studentForm', { hod, studentName, studentId });
    });

});

//rendering all the applications using studentId from the parameters
app.get('/studentForm/status/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    connection.query(`select * from outpass where studentId = ?`, [studentId], (err, application, field) => {
        // console.log(application[0].status_by_hod);
        // console.log(application[0].status_by_chiefWarden);
        // if (application[0].status_by_hod === application[0].status_by_chiefWarden) {
        //     connection.query(`update outpass set status_at_initiater = 'Approved'  where applicationId`)
        // }
        res.render('status', { application });
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
    connection.query(`select * from outpass where hodId = ? and status_by_hod like 'In Progress'`,[hodId], (err, application, fields) => {
        if(err) throw err;
        // console.log(application[0]);
        res.render('requestsToHod', {application});
    });
});



//handling removal or approval of outPasses
app.put("/hod/status/:applicationId/requests", (req,res)=> {
    // const hodId = hodroutes.collegeId;
    let appId = JSON.parse(req.params.applicationId);
    let status = req.body.status;
    // console.log(req.body.status);
    if (status === 'Rejected') {
        connection.query(`update outpass set status_by_hod = 'Rejected', status_at_initiater = 'Rejected' where applicationId = ?`,[appId], (err, application, fields) => {
            if(err) throw err;
            // console.log(application.length);
            res.redirect('/hod/requests');
        });
    } else if (status === 'Approved') {
        connection.query(`update outpass set status_by_hod = 'Approved' where applicationId = ?`,[appId], (err, application, fields) => {
            if(err) throw err;
            // console.log(application.length);
            res.redirect('/hod/requests');
        });
    }
});


//Rendering CHief Warden Page
app.get('/chiefWarden', (req, res) => {
   res.render('wardenLogin');
});

//warden login
app.post('/warden/login', wardenroutes.login);

//requests to warden
app.get('/warden/requests', (req,res) => {
    connection.query(`select * from outpass where status_by_hod = 'Approved' and status_by_chiefWarden not like 'Approved'`,(err, application, fields) => {
        if(err) throw err;
        // console.log(application[0]);
        res.render('requestsTOWarden', {application});
    });
});

//handling removal or approval of outPasses
app.put("/warden/status/:applicationId/requests", (req,res)=> {
    let appId = JSON.parse(req.params.applicationId);
    let status = req.body.status;
    // console.log(req.body.status);
    if (status === 'Rejected') {
        connection.query(`update outpass set status_by_chiefWarden = 'Rejected', status_at_initiater = 'Rejected' where applicationId = ?`,[appId], (err, application, fields) => {
            if(err) throw err;
            res.redirect('/warden/requests');
        });
    } else if (status === 'Approved') {
        connection.query(`update outpass set status_by_chiefWarden = 'Approved', status_at_initiater = 'Approved' where applicationId = ?`,[appId], (err, application, fields) => {
            if(err) throw err;
            // console.log(application.length);
            res.redirect('/warden/requests');
        });
    }
});

app.listen(port, (req,res) => {
    console.log(`listening to port ${port}`);
});
