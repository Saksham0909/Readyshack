# ---------------------------------------------------- Run these query to create database and use them ----------------------------------------------------
create database readyshackform;
use readyshackform;


# ---------------------------------------------------- Creating table to store users login data ----------------------------------------------------
create table users(email varchar(50) primary key, pwd varchar(20), type varchar(10), dos date, status int);
select * from users;
delete from users;


# ---------------------------------------------------- Admin account for managing website through admin panel ----------------------------------------------------
insert into users values("admin0000@gmail.com", "adminlogin", "admin", current_date(), 1);


# ---------------------------------------------------- Creating table to store servicer providers profile data ----------------------------------------------------
create table serviceprovider(email varchar(100) primary key, name varchar(30), mobile varchar(12), address varchar(100),city varchar(20), proof varchar(20), pic varchar(200), ahours varchar(20));
select * from serviceprovider;
delete from serviceprovider;


# ---------------------------------------------------- Creating table to store service availers profile data ----------------------------------------------------
create table serviceavailer(email varchar(100) primary key, name varchar(30), mobile varchar(12), dob date, gender varchar(10), city varchar(20), address varchar(100), pic varchar(200));
select * from serviceavailer;
delete from serviceavailer;


# ---------------------------------------------------- Creating table to store available services data ----------------------------------------------------
create table servicesavailable(id int AUTO_INCREMENT primary key, email varchar(50), name varchar(30), mobile varchar(12), services varchar(50), charges int);
select * from servicesavailable;
delete from servicesavailable;


# ---------------------------------------------------- Creating table to store notifications data ----------------------------------------------------
create table notifications(userEmail varchar(50), service varchar(30), providerEmail varchar(50));
select * from notifications;
delete from notifications;


# ---------------------------------------------------- Run these queries if you want to delete the database or a table ----------------------------------------------------
# DROP DATABASE readyshackform;
# DROP TABLE {table_name};