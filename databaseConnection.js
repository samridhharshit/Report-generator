//-----------/usr/bin/mysql -u root -p---------for opening mysql server locally

const mysql = require('mysql');

exports.connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'EventsReport'
});