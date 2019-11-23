create database EventsReport;

use EventsReport;

create table student(
registrationNo bigint(9) not null,
name varchar(100) not null,
block varchar(2) not null,
branch varchar(50) not null,
course varchar(100) not null,
phoneNumber bigint(20) not null,
roomNo int(3) not null,
email varchar(50) not null,
password varchar(200) not null,
primary key(registrationNo)
);

desc student;

select * from student;

drop table student;

create table EventForm(
name varchar(100) not null,
type varchar(100) not null,
coordinator varchar(100),
dateofevent datetime not null,
venue varchar(50) not null,
eventdetails nvarchar(1000),
brochure LONGBLOB,
studentId bigint(9),
primary key(name),
foreign key(studentId) references student(registrationNo)
);

select * from EventForm;

desc EventForm;

drop table EventForm;

select * from outpass;

create table Teacher(
TeacherId bigint(9) not null,
name varchar(100) not null,
phoneNumber bigint(20) not null,
email varchar(50) not null,
password varchar(200) not null,
primary key(TeacherId)
);

desc Teacher;

drop table Teacher;

select * from Teacher;










