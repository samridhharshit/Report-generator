///usr/bin/mysql -u root -p  terminal command for using mysql locally

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
    database: 'EventsReport'
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

//PreEventOrPostEvent option
app.get('/PreEventOrPostEvent', (req, res) => {
    res.render('PreEventOrPostEvent');
});

//getting the preeventstudentForm page
app.get('/preeventstudentForm', (req,res)=> {
    let studentId = studentroutes.regNo;

    //accessing the branch of student regNo render the all hods of the respective branch and show it in the template
    connection.query(`select * from student where registrationNo = ?`, [studentId], (err, student, field)=> {
        if (err) throw err;
        let studentName = studentroutes.name;
        console.log(studentName);
        res.render('preeventstudentForm', { studentName, studentId });
    });
});

//posting on the studentForm page for saving the information in the preeventform table
app.post('/preeventstudentForm', (req,res)=> {

    let form = {
        name : req.body.name,
        type : req.body.type,
        coordinator : req.body.coordinator,
        dateofevent : req.body.eventDate,
        venue : req.body.venue,
        eventdetails : req.body.eventdetails,
        brochure : req.body.brochure,
        studentId : studentroutes.regNo
    };

    connection.query(`insert into PreEventForm set ?`, form, (err, result, fields) => {
        if(err) throw err;
        console.log(result);
    });
    res.redirect('/');

});

//getting the posteventstudentForm page
app.get('/posteventForm', (req,res)=> {
    let studentId = studentroutes.regNo;

    //accessing the branch of student regNo render the all hods of the respective branch and show it in the template
    connection.query(`select * from student where registrationNo = ?`, [studentId], (err, student, field)=> {
        if (err) throw err;
        let studentName = studentroutes.name;
        console.log(studentName);
        res.render('posteventform', { studentName, studentId });
    });
});

//posting on the studentForm page for saving the information in the posteventstudentform table
app.post('/posteventstudentForm', (req,res)=> {
    let form = {
        name : req.body.name,
        type : req.body.type,
        coordinator : req.body.coordinator,
        dateofevent : req.body.eventDate,
        venue : req.body.venue,
        eventdetails : req.body.eventdetails,
        brochure : req.body.brochure,
        studentId : studentroutes.regNo
    };

    connection.query(`insert into PostEventForm set ?`, form, (err, result, fields) => {
        if(err) throw err;
        console.log(result);
    });
    res.redirect('/');

});

//Rendering hod page
app.get('/hod', (req,res) => {
    res.render('hod-login');
});

//registering hod or coordinator
app.post('/hod/register',hodroutes.register);

//allowing the hod or coordinator to login
app.post('/hod/login',hodroutes.login);

//PreEventOrPostEvent status option
app.get('/hod/Options', (req, res) => {
   res.render("OptionsForTeachers");
});

//showing the pre event status to the teacher
app.get('/preeventstatus', (req,res)=> {
    connection.query(`select * from PreEventForm`, (err, application, fields) => {
        if(err) throw err;
        // console.log(application[0]);
        res.render('PreEventStatus', {application});
    });
});

//showing the post event status to the teacher
app.get('/posteventstatus', (req,res)=> {
    connection.query(`select * from PostEventForm`, (err, application, fields) => {
        if(err) throw err;
        // console.log(application[0]);
        res.render('PostEventStatus', {application});
    });
});

app.listen(port, (req,res) => {
    console.log(`listening to port ${port}`);
});
