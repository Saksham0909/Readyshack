// ------------------------------------------------ Dependencies used ------------------------------------------------
var express = require("express");
var fileuploader = require("express-fileupload");
var nodemailer = require("nodemailer");
var mysql = require("mysql2");
var app = express();


// ------------------------------------------------ Port configuration ------------------------------------------------
var PORT = 3000;
app.listen(PORT, () => {
  console.log(`\nWelcome to "Readyshack" \nServer started at port:- ${PORT}`);
});


// ------------------------------------------------ Dependencies configuration ------------------------------------------------
app.use(express.static("public"));
app.use(fileuploader());
app.use(express.urlencoded(true));

var dbConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "Kumar@29",
  database: "readyshackform",
};

var dbCon = mysql.createConnection(dbConfig);
dbCon.connect((err) => {
  if (err == null) {
    console.log(`Successfully connected to:- ${dbConfig.database}`);
  } else {
    console.log(err);
  }
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sakshamkumar98766@gmail.com",
    pass: "ipghdugaolcwstdb",
  }
});


// ------------------------------------------------ Index page API's started ------------------------------------------------
// ------------------------------------------------ Signup email check function ------------------------------------------------
app.get("/signup-chk-email", (req, resp) => {
  var email = req.query.emailentered;
  dbCon.query("select * from users where email = ?", [email], (err, result) => {
      if (err == null) {
        if (result.length == 1) {
          resp.send(" Email already exists, please login...");
        } else {
          resp.send(" Available...");
        }
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Do signup function ------------------------------------------------
app.get("/dosignup", function (req, resp) {
  var email = req.query.emailentered;
  var pwd = req.query.pwdentered;
  var type = req.query.typeentered;

  var mailOptions = {
    from: "sakshamkumar98766@gmail.com",
    to: email,
    subject: "Account has been created on Readyshack.com",
    text: `Welcome ${email}, you have been successfully registed as a ${type} on our website. If not please just ignore this mail. With regards from Readyshack`
  };

  dbCon.query("insert into users values(?,?,?,current_date(),1)", [email, pwd, type], function (err) {
      if (err == null) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log(`Email successfully sent to ${email}`);
          }
        });
        resp.send("Record saved successfully");
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Do login function ------------------------------------------------
app.get("/dologin", function (req, resp) {
  var email = req.query.emailentered;
  var pwd = req.query.pwdentered;

  var mailOptions = {
    from: "sakshamkumar98766@gmail.com",
    to: email,
    subject: "Account login on Readyshack.com",
    text: `Your email:- ${email} has been used to login on our website. If not please please check your account activity and if possible change your account password to something secure. With regards from Readyshack`
  };

  dbCon.query("select * from users where email = ?", [email], function (err, result) {
      if (err == null) {
        if (result.length == 1) {
          if (result[0].pwd == pwd) {
            if (result[0].status == 1) {
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log(`Email successfully sent to ${email}`);
                }
              });
              resp.send(result[0].type);
            } else {
              resp.send(" The user has been blocked...");
            }
          } else {
            resp.send(" Invalid password...");
          }
        } else {
          resp.send(" No user found...");
        }
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Index page API's ended ------------------------------------------------


// ------------------------------------------------ Provider profile page API's started ------------------------------------------------
// ------------------------------------------------ Do provider profile search function ------------------------------------------------
app.get("/profile-provider-search", function (req, resp) {
  var email = req.query.emailentered;
  dbCon.query("select * from serviceprovider where email = ?", [email], function (err, result) {
      if (err == null) {
        resp.send(result);
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Do provider profile submit function ------------------------------------------------
app.post("/profile-provider-submit", function (req, resp) {
  var email = req.body.txtemail;
  var name = req.body.txtname;
  var contact = req.body.txtcontact;
  var address = req.body.txtaddress;
  var city = req.body.txtcity;
  var proof = req.body.txtid;
  var pic = "nopic.jpg";
  var ahours = req.body.fromtime + "," + req.body.totime;

  if (req.files != null) {
    pic = req.files.txtimage.name;
    var path = process.cwd() + "/public/uploads/" + pic;
    req.files.txtimage.mv(path);
  }

  dbCon.query("insert into serviceprovider values(?,?,?,?,?,?,?,?)", [email, name, contact, address, city, proof, pic, ahours], function (err) {
      if (err == null) {
        resp.sendFile(process.cwd()+"/public/record-saved.html");
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Do provider profile update function ------------------------------------------------
app.post("/profile-provider-update", function (req, resp) {
  var email = req.body.txtemail;
  var name = req.body.txtname;
  var contact = req.body.txtcontact;
  var address = req.body.txtaddress;
  var city = req.body.txtcity;
  var proof = req.body.txtid;
  var pic = "nopic.jpg";
  var ahours = "";
  ahours = req.body.fromtime + "," + req.body.totime;

  if (req.files != null) {
    pic = req.files.txtimage.name;
    var path = process.cwd() + "/public/uploads/" + pic;
    req.files.txtimage.mv(path);
  } else {
    pic = req.body.hdnpicname;
  }

  dbCon.query("update serviceprovider set name = ?, mobile = ?, address = ?, city = ?, proof = ?, pic = ?, ahours = ? where email = ?", [name, contact, address, city, proof, pic, ahours, email], function (err) {
      if (err == null) {
        resp.sendFile(process.cwd()+"/public/record-saved.html");
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Providers profile page API's ended ------------------------------------------------


// ------------------------------------------------ Add services page API's started ------------------------------------------------
// ------------------------------------------------ Provider do add services function ------------------------------------------------
app.get("/doadd", function (req, resp) {
  var email = req.query.emailsent;
  var name = req.query.txtNameSent;
  var mobile = req.query.txtContactSent;
  var services = req.query.txtServicesSent;
  var charges = req.query.txtChargesSent;
  dbCon.query("insert into servicesavailable value(0,?,?,?,?,?)", [email, name, mobile, services, charges], function (err) {
      if (err == null) {
        resp.send("Added successfully");
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Add services page API's ended ------------------------------------------------


// ------------------------------------------------ Providers dashboard page API's started ------------------------------------------------
// ------------------------------------------------ Change password function ------------------------------------------------
app.get("/changepassword", function (req, resp) {
  var email = req.query.emailsent;
  var oldpassword = req.query.oldpasswordsent;
  var confirmedpassword = req.query.confirmedpassword;

  dbCon.query("select * from users where email = ? and pwd = ?", [email, oldpassword], function (err, result) {
      if (err == null) {
        if (result.length == 1 && result[0].status == 1) {
          dbCon.query("update users set pwd = ? where email = ?", [confirmedpassword, email], function (err) {
              if (err == null) {
                resp.send("Password changed successfully");
              } else {
                resp.send(err);
              }
            });
        } else {
          resp.send("No user found");
        }
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Provider dashboard page API's ended ------------------------------------------------


// ------------------------------------------------ Service availer profile page API's started ------------------------------------------------
// ------------------------------------------------ Service availer check data function ------------------------------------------------
app.get("/check-data", function (req, resp) {
  var email = req.query.emailsent;

  dbCon.query("select * from serviceavailer where email = ?", [email], function (err, result) {
      if (err == null) {
        if (result.length == 1) {
          resp.send("User exists");
        } else {
          resp.send("User does not exist");
        }
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Availer fetch data function ------------------------------------------------
app.get("/fetch-data", function (req, resp) {
  var email = req.query.emailsent;
  dbCon.query("select * from serviceaviler where email = ?", [email], function (err, result) {
      if (err == null) {
        resp.send(result);
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Do availer profile submit function ------------------------------------------------
app.post("/profile-availer-submit", function (req, resp) {
  var email = req.body.txtemail;
  var name = req.body.txtname;
  var contact = req.body.txtcontact;
  var dob = req.body.txtdob;
  var gender = req.body.txtgender;
  var city = req.body.txtcity;
  var address = req.body.txtaddress;
  var pic = "nopic.jpg";

  if (req.files != null) {
    pic = req.files.txtid.name;
    var path = process.cwd() + "/public/uploads/" + pic;
    req.files.txtid.mv(path);
  }

  dbCon.query("insert into serviceavailer values(?,?,?,?,?,?,?,?)", [email, name, contact, dob, gender, city, address, pic], function (err) {
      if (err == null) {
        resp.sendFile(process.cwd()+"/public/record-saved.html");
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Do availer profile update function ------------------------------------------------
app.post("/profile-availer-update", function (req, resp) {
  var email = req.body.txtemail;
  var name = req.body.txtname;
  var contact = req.body.txtcontact;
  var dob = req.body.txtdob;
  var gender = req.body.txtgender;
  var city = req.body.txtcity;
  var address = req.body.txtaddress;
  var pic = "nopic.jpg";

  if (req.files != null) {
    pic = req.files.txtid.name;
    var path = process.cwd() + "/public/uploads/" + pic;
    req.files.txtid.mv(path);
  } else {
    pic = req.body.hdnpicname;
  }

  dbCon.query("update serviceavailer set name = ?, mobile = ?, dob = ?, gender = ?, city = ?, address = ?, pic = ? where email = ?", [name, contact, dob, gender, city, address, pic, email], function (err) {
      if (err == null) {
        resp.sendFile(process.cwd()+"/public/record-saved.html");
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Service availer profile page API's ended ------------------------------------------------


// ------------------------------------------------ Admin users panel page API's started ------------------------------------------------
// ------------------------------------------------ Fetching users data function ------------------------------------------------
app.get("/fetch-users-data", function (req, resp) {
  dbCon.query("select * from users", function (err, result) {
    if (err == null) {
      resp.send(result);
    } else {
      resp.send(err);
    }
  });
});

// ------------------------------------------------ Deleting users data function ------------------------------------------------
app.get("/delete-users-data", function (req, resp) {
  var email = req.query.email;
  dbCon.query("delete from users where email = ?", [email], function (err, result) {
      if (err == null) {
        resp.send("Account deleted successfully");
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Blocking users data function ------------------------------------------------
app.get("/block-users-data", function (req, resp) {
  var email = req.query.email;
  dbCon.query("update users set status = 0 where email = ?", [email], function (err, result) {
      if (err == null) {
        resp.send("Account blocked");
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Resuming users data function ------------------------------------------------
app.get("/resume-users-data", function (req, resp) {
  var email = req.query.email;
  dbCon.query("update users set status = 1 where email = ?", [email], function (err, result) {
      if (err == null) {
        resp.send("Account resumed");
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Admin users panel page API's ended ------------------------------------------------


// ------------------------------------------------ Admin service provider panel page API's started ------------------------------------------------
// ------------------------------------------------ Fetching service provider data function ------------------------------------------------
app.get("/fetch-service-provider-data", function (req, resp) {
  dbCon.query("select * from serviceprovider", function (err, result) {
    if (err == null) {
      resp.send(result);
    } else {
      resp.send(err);
    }
  });
});

// ------------------------------------------------ Admin service provider panel page API's ended ------------------------------------------------


// ------------------------------------------------ Admin service availer panel page API's started ------------------------------------------------
// ------------------------------------------------ Fetching service availer data function ------------------------------------------------
app.get("/fetch-service-availer-data", function (req, resp) {
  dbCon.query("select * from serviceavailer", function (err, result) {
    if (err == null) {
      resp.send(result);
    } else {
      resp.send(err);
    }
  });
});

// ------------------------------------------------ Admin service availer panel page API's ended ------------------------------------------------


// ------------------------------------------------ Services manager page API's started ------------------------------------------------
// ------------------------------------------------ Fetching services function ------------------------------------------------
app.get("/fetch-services", function (req, resp) {
  var email = req.query.email;
  dbCon.query("select * from servicesavailable where email = ?", [email], function (err, result) {
    if (err == null) {
      resp.send(result);
    } else {
      resp.send(err);
    }
  });
});

// ------------------------------------------------ Unavailing services function ------------------------------------------------
app.get("/unavail-service", function (req, resp) {
  var id = req.query.id;
  dbCon.query("delete from servicesavailable where id = ?", [id], function (err, result) {
      if (err == null) {
        resp.send("Service unavailed successfully");
      } else {
        resp.send(err);
      }
    });
});

// ------------------------------------------------ Service manager page API's ended ------------------------------------------------


// ------------------------------------------------ Service finder page API's started ------------------------------------------------
// ------------------------------------------------ Fetching cities function ------------------------------------------------
app.get("/fetch-cities", function (req, resp) {
  dbCon.query("select distinct city from serviceprovider", function (err, result) {
    if (err == null) {
      resp.send(result);
    } else {
      resp.send(err);
    }
  });
});

// ------------------------------------------------ Fetching services function ------------------------------------------------
app.get("/fetch-services-book", function (req, resp) {
  dbCon.query("select distinct services from servicesavailable", function (err, result) {
    if (err == null) {
      resp.send(result);
    } else {
      resp.send(err);
    }
  });
});

// ------------------------------------------------ Fetching providers function ------------------------------------------------
app.get("/fetch-providers",function(req,resp){
  var service=req.query.serviceselected;
  var city=req.query.cityselected;
  dbCon.query("select serviceprovider.email, serviceprovider.name, serviceprovider.mobile, serviceprovider.address, serviceprovider.city, serviceprovider.ahours, servicesavailable.services from serviceprovider inner join servicesavailable on serviceprovider.email = servicesavailable.email where servicesavailable.services = ? and serviceprovider.city=?", [service,city], function(err,result){
    if(err==null){
      resp.send(result);
    }else{
      resp.send(err);
    }
  });
});

// ------------------------------------------------ Service finder page API's ended ------------------------------------------------