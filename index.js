// ------------------------------------------------ Modules and configuration files used ------------------------------------------------
const express = require("express");
const fileuploader = require("express-fileupload");
const nodemailer = require("nodemailer");
const mysql = require("mysql2");
const path = require("path");
const {PORT, dbConfig, mailConfig} = require("./config/config");
const app = express();


// ------------------------------------------------ Server configuration ------------------------------------------------
const dbCon = mysql.createConnection(dbConfig);
dbCon.connect((err) => {
  if(err == null){
    app.listen(PORT)
    console.log(`Server started at port:- ${PORT}\nConnected to ${dbConfig.database} successfully`);
  }else{
    console.log(err);
  }
});

app.use(express.static("public"));
app.use(fileuploader());
app.use(express.urlencoded(true));
const transporter = nodemailer.createTransport(mailConfig);


// ------------------------------------------------ Index page API ------------------------------------------------
app.get("/signup-chk-email", (req, resp) => {
  let email = req.query.emailentered;
  dbCon.query("select * from users where email = ?", [email], (err, result) => {
      if (err == null) {
        (result.length == 1) ? resp.send(" Email already exists, please login...") : resp.send(" Available...");
      } else {
        resp.send(err);
      }
    });
});

app.get("/dosignup", (req, resp) => {
  let email = req.query.emailentered;
  let pwd = req.query.pwdentered;
  let type = req.query.typeentered;

  let mailOptions = {
    from: mailConfig.user,
    to: email,
    subject: "Account has been created on Readyshack.com",
    text: `Welcome ${email}, you have been successfully registed as a ${type} on our website. If not please just ignore this mail. With regards from Readyshack`
  };

  dbCon.query("insert into users values(?,?,?,current_date(),1)", [email, pwd, type], (err) => {
      if (err == null) {
        transporter.sendMail(mailOptions, (error, info) => {
          (error) ? console.log(error) : console.log(`Email sent`);
        });
        resp.send("Record saved successfully");
      } else {
        resp.send(err);
      }
    });
});

app.get("/dologin", (req, resp) => {
  let email = req.query.emailentered;
  let pwd = req.query.pwdentered;

  let mailOptions = {
    from: mailConfig.user,
    to: email,
    subject: "Account login on Readyshack.com",
    text: `Your email:- ${email} has been used to login on our website. If not please please check your account activity and if possible change your account password to something secure. With regards from Readyshack`
  };

  dbCon.query("select * from users where email = ?", [email], (err, result) => {
      if (err == null) {
        if (result.length == 1 && result[0].status == 1 && result[0].pwd == pwd) {
              transporter.sendMail(mailOptions, (error, info) => {
                (error) ? console.log(error) : console.log(`Email sent`);
              });
              resp.send(result[0].type);
        } else {
          resp.send(" Invalid password...");
        }
      } else {
        resp.send(err);
      }
    });
});

app.get("/forgot-password", (req, resp) => {
  let email = req.query.emailentered;
  let otp = "";

  for(let i = 0; i < 6; i++){
    otp += Math.floor(10 * (Math.random()));
  }

  let mailOptions = {
    from: mailConfig.user,
    to: email,
    subject: "Forgotton password request on Readyshack.com",
    text: `Your OTP to retrieve your password is:- ${otp}. With regards from Readyshack`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if(error == null){
      console.log(`Email sent`);
      resp.send(otp);
    }else{
      console.log(error);
    }
  });
});

app.get("/send-password", (req, resp) => {
  let email = req.query.emailentered;
  dbCon.query("select pwd from users where email = ?", [email], (err, result) => {
    if (err == null) {
      let mailOptions = {
        from: mailConfig.user,
        to: email,
        subject: "Retrieved password on Readyshack.com",
        text: `Your password to login on Readyshack.com is:- ${result[0].pwd}. With regards from Readyshack`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        (error) ? console.log(error) : console.log(`Email sent`);
      });
      resp.send("Your password has been sent on your mail id")
    } else {
      resp.send(err);
    }
  });
});


// ------------------------------------------------ Provider profile page API ------------------------------------------------
app.get("/profile-provider-search", (req, resp) => {
  let email = req.query.emailentered;
  dbCon.query("select * from serviceprovider where email = ?", [email], (err, result) => {
      (err == null) ? resp.send(result) : resp.send(err);
    });
});

app.post("/profile-provider-submit", (req, resp) => {
  let email = req.body.txtemail;
  let name = req.body.txtname;
  let contact = req.body.txtcontact;
  let address = req.body.txtaddress;
  let city = req.body.txtcity;
  let proof = req.body.txtid;
  let pic = "nopic.jpg";
  let ahours = req.body.fromtime + "," + req.body.totime;

  if (req.files != null) {
    pic = new Date().getTime() + req.files.txtimage.name;
    let imagePath = path.join(__dirname, "/public/uploads/", pic);
    req.files.txtimage.mv(imagePath);
  }

  dbCon.query("insert into serviceprovider values(?,?,?,?,?,?,?,?)", [email, name, contact, address, city, proof, pic, ahours], (err) => {
      (err == null) ? resp.sendFile(process.cwd()+"/public/record-saved.html") : resp.send(err);
    });
});

app.post("/profile-provider-update", (req, resp) => {
  let email = req.body.txtemail;
  let name = req.body.txtname;
  let contact = req.body.txtcontact;
  let address = req.body.txtaddress;
  let city = req.body.txtcity;
  let proof = req.body.txtid;
  let pic = "nopic.jpg";
  let ahours = req.body.fromtime + "," + req.body.totime;

  if (req.files != null) {
    pic = new Date().getTime() + req.files.txtimage.name;
    let imagePath = path.join(__dirname, "/public/uploads/", pic);
    req.files.txtimage.mv(imagePath);
  } else {
    pic = req.body.hdnpicname;
  }

  dbCon.query("update serviceprovider set name = ?, mobile = ?, address = ?, city = ?, proof = ?, pic = ?, ahours = ? where email = ?", [name, contact, address, city, proof, pic, ahours, email], (err) => {
      (err == null) ? resp.sendFile(process.cwd()+"/public/record-saved.html") : resp.send(err);
    });
});


// ------------------------------------------------ Add services page API ------------------------------------------------
app.get("/doadd", (req, resp) => {
  let email = req.query.emailsent;
  let name = req.query.txtNameSent;
  let mobile = req.query.txtContactSent;
  let services = req.query.txtServicesSent;
  let charges = req.query.txtChargesSent;

  dbCon.query("insert into servicesavailable value(0,?,?,?,?,?)", [email, name, mobile, services, charges], (err) => {
      (err == null) ? resp.send("Added successfully") : resp.send(err);
    });
});


// ------------------------------------------------ Common dashboard page API ------------------------------------------------
app.get("/changepassword", (req, resp) => {
  let email = req.query.emailsent;
  let oldpassword = req.query.oldpasswordsent;
  let confirmedpassword = req.query.confirmedpassword;
  dbCon.query("update users set pwd = ? where email = ? and pwd = ? and status = 1", [confirmedpassword, email, oldpassword], (err) => {
    (err==null) ? resp.send("Password changed successfully") : resp.send("Password cannot be changed");
  });
});


// ------------------------------------------------ Providers dashboard page API ------------------------------------------------
app.get("/fetch-notifications", (req, resp) => {
  let userEmail = req.query.user;
  dbCon.query("select * from notifications where providerEmail = ?", [userEmail], (err,result) => {
    (err==null) ? resp.send(result) : resp.send(err);
  });
});


// ------------------------------------------------ Service availer profile page API ------------------------------------------------
app.get("/check-data", (req, resp) => {
  let email = req.query.emailsent;

  dbCon.query("select * from serviceavailer where email = ?", [email], (err, result) => {
      if (err == null) {
        (result.length == 1) ? resp.send("User exists") : resp.send("User does not exist");
      } else {
        resp.send(err);
      }
    });
});

app.get("/fetch-data", (req, resp) => {
  let email = req.query.emailsent;
  dbCon.query("select * from serviceaviler where email = ?", [email], (err, result) => {
    (err==null) ? resp.send(result) : resp.send(err);
    });
});

app.post("/profile-availer-submit", (req, resp) => {
  let email = req.body.txtemail;
  let name = req.body.txtname;
  let contact = req.body.txtcontact;
  let dob = req.body.txtdob;
  let gender = req.body.txtgender;
  let city = req.body.txtcity;
  let address = req.body.txtaddress;
  let pic = "nopic.jpg";

  if (req.files != null) {
    pic = new Date().getTime() + req.files.txtid.name;
    let imagePath = path.join(__dirname, "/public/uploads/", pic);
    req.files.txtimage.mv(imagePath);
  }

  dbCon.query("insert into serviceavailer values(?,?,?,?,?,?,?,?)", [email, name, contact, dob, gender, city, address, pic], (err) => {
    (err == null) ? resp.send(process.cwd()+"/public/record-saved.html") : resp.send(err);
  });
});

app.post("/profile-availer-update", (req, resp) => {
  let email = req.body.txtemail;
  let name = req.body.txtname;
  let contact = req.body.txtcontact;
  let dob = req.body.txtdob;
  let gender = req.body.txtgender;
  let city = req.body.txtcity;
  let address = req.body.txtaddress;
  let pic = "nopic.jpg";

  if (req.files != null) {
    pic = new Date().getTime() + req.files.txtid.name;
    let imagePath = path.join(__dirname, "/public/uploads/", pic);
    req.files.txtimage.mv(imagePath);
  } else {
    pic = req.body.hdnpicname;
  }

  dbCon.query("update serviceavailer set name = ?, mobile = ?, dob = ?, gender = ?, city = ?, address = ?, pic = ? where email = ?", [name, contact, dob, gender, city, address, pic, email], (err) => {
    (err == null) ? resp.send(process.cwd()+"/public/record-saved.html") : resp.send(err);
  });
});


// ------------------------------------------------ Admin users panel page API ------------------------------------------------
app.get("/fetch-users-data", (req, resp) => {
  dbCon.query("select * from users", (err, result) => {
    (err == null) ? resp.send(result) : resp.send(err);
  });
});

app.get("/delete-users-data", (req, resp) => {
  let email = req.query.email;
  dbCon.query("delete from users where email = ?", [email], (err, result) => {
      (err == null) ? resp.send("Account deleted successfully") : resp.send(err);
    });
});

app.get("/block-users-data", (req, resp) => {
  let email = req.query.email;
  dbCon.query("update users set status = 0 where email = ?", [email], (err, result) => {
      (err == null) ? resp.send("Account blocked") : resp.send(err);
    });
});

app.get("/resume-users-data", (req, resp) => {
  let email = req.query.email;
  dbCon.query("update users set status = 1 where email = ?", [email], (err, result) => {
      (err == null) ? resp.send("Account resumed") : resp.send(err);
    });
});


// ------------------------------------------------ Admin service provider panel page API ------------------------------------------------
app.get("/fetch-service-provider-data", (req, resp) => {
  dbCon.query("select * from serviceprovider", (err, result) => {
    (err == null) ? resp.send(result) : resp.send(err);
  });
});


// ------------------------------------------------ Admin service availer panel page API ------------------------------------------------
app.get("/fetch-service-availer-data", (req, resp) => {
  dbCon.query("select * from serviceavailer", (err, result) => {
    (err == null) ? resp.send(result) : resp.send(err);
  });
});


// ------------------------------------------------ Services manager page API ------------------------------------------------
app.get("/fetch-services", (req, resp) => {
  let email = req.query.email;
  dbCon.query("select * from servicesavailable where email = ?", [email], (err, result) => {
    (err == null) ? resp.send(result) : resp.send(err);
  });
});

app.get("/unavail-service", (req, resp) => {
  let id = req.query.id;
  dbCon.query("delete from servicesavailable where id = ?", [id], (err, result) => {
      (err == null) ? resp.send("Service unavailed successfully") : resp.send(err);
    });
});


// ------------------------------------------------ Service finder page API ------------------------------------------------
app.get("/fetch-cities", function (req, resp) {
  dbCon.query("select distinct city from serviceprovider", (err, result) => {
    (err == null) ? resp.send(result) : resp.send(err);
  });
});

app.get("/fetch-services-book", (req, resp) => {
  dbCon.query("select distinct services from servicesavailable", (err, result) => {
    (err == null) ? resp.send(result) : resp.send(err);
  });
});

app.get("/fetch-providers", (req,resp) => {
  let service = req.query.serviceselected;
  let city = req.query.cityselected;
  dbCon.query("select serviceprovider.email, serviceprovider.name, serviceprovider.mobile, serviceprovider.address, serviceprovider.city, serviceprovider.ahours, servicesavailable.services from serviceprovider inner join servicesavailable on serviceprovider.email = servicesavailable.email where servicesavailable.services = ? and serviceprovider.city=?", [service,city], (err,result) => {
    (err==null) ? resp.send(result) : resp.send(err);
  });
});

app.get("/book-service", (req,resp) => {
  let userEmail = req.query.userEmail;
  let serviceSelected = req.query.serviceSelected;
  let providerEmail = req.query.providerEmail;

  let mailOptions = {
    from: mailConfig.user,
    to: providerEmail,
    subject: "Someone has ordered your service",
    text: `Welcome ${providerEmail}, your service ${serviceSelected} has been booked by ${userEmail} through our website. With regards from Readyshack`
  };

  dbCon.query("insert into notifications values(?,?,?)", [userEmail, serviceSelected, providerEmail], (err) => {
    if(err==null){
      transporter.sendMail(mailOptions, (error) => {
        (error) ? console.log(error) : console.log(`Email sent`);
      });
      resp.send("Your service has been booked successfully");
    }else{
      resp.send(err);
    }
  });
});