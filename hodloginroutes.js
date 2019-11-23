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
        console.log("Database is connected ... hod databse");
    } else {
        console.log("Error connecting database ... nn");
    }
});


// registration
exports.register = function (req, res) {
    // console.log("req",req.body);
    const today = new Date();
    const hod = {
        "name": req.body.username,
        "phoneNumber": req.body.mobileNo,
        "TeacherId": req.body.registrationNo,
        "email": req.body.email,
        "password": req.body.password
    };
    connection.query('INSERT INTO Teacher SET ?', hod, function (error, hod, fields) {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error occurred"
            });
            throw error;
        } else {
            console.log('The solution is: ', hod);
            res.redirect('/');
        }
    });
};

// login
exports.login = function(req,res){
    const clgId= req.body.collegeId;
    // console.log(regNo);
    const mobileNo = req.body.mobileNo;
    // console.log(mobileNo);
    connection.query('SELECT * FROM Teacher WHERE TeacherId = ?',[clgId], function (error, Teacher, fields) {
        if (error) {
            throw error;
        }else{
            // console.log('The solution is: ', results[0].phoneNumber);
            if(Teacher.length >0){
                // console.log(typeof (results[0].phoneNumber));
                // console.log(typeof (JSON.parse(mobileNo)));
                if(Teacher[0].phoneNumber === JSON.parse(mobileNo)){
                    exports.collegeId = Teacher[0].TeacherId;
                    res.redirect('/hod/Options');
                    // res.send('loggedin successfully');
                }
                else{
                    res.send({
                        "code":204,
                        "success":"Email and password does not match"
                    });
                }
            }
            else{
                res.send({
                    "code":204,
                    "success":"Email does not exits"
                });
            }
        }
    });
};
