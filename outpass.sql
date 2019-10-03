use outpass;

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