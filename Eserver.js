const express = require('express'),
mysql = require('mysql'),
bodyParser = require('body-parser'),
session = require('express-session');
var app = express(),
    ssn,
    con;
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret:"XASDWASD"}));

con = mysql.createConnection({
  host:'localhost',
  user:'admin',
  password:'admin'
});
function useDb(sql) {
    con.query("use db_project",function(err,result){
      if(err)console.log(err);;
    });
}

// con.connect(function(err){
//   if(err)response="złe dane";
//   else {
//     // ssn.pass=req.body.login;
//   }
// });
// con.query("use bd_project",function(err,result){
//   if(err)console.log(err);
// });
function test(s) {
  return /^([a-zA-Z 0-9]{1,14})$/.test(s);
}
function testI(s) {
  return /^([a-zA-Z]{1,20})$/.test(s);
}
function testEmail(s) {
  return /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/.test(s);
}
function testTelefon(s) {
  return /^((\+[0-9]{2}|[0-9]{3})?(( |-|)[0-9]{3}){3})$/.test(s);
}
function testDate(s){
  return /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/.test(s);
}
function sendErr(res) {
  res.send("Wprowadź niepusty ciąg liter!\n (bez polskich znaków)");
}
function sendLoginErr(res) {
  res.send("Musisz być zalogowany");
}
Array.prototype.memset = function (val) {
  for (var i = 0; i < this.length; i++) {
    this[i]=val;
  }
}
app.post("/login",(req,res)=>{
  var response = 0,
  ssn=req.session;
  ssn.pass=undefined;
  if(test(req.body.user) && test(req.body.passwd)){
    con=mysql.createConnection({
      host:'localhost',
      user:req.body.user,
      password:req.body.passwd
    });
    con.connect(function(err){
      if(err)response="złe dane";
      else {
        response="połączono";
        ssn.pass=req.body.user;
      }
      res.send(response);
    });
  }
    else{
      sendErr(res);
    }
});

app.post("/logout",(req,res)=>{
  req.session.destroy();
  res.json({});
});

con.connect(function (err) {
  if(err)console.log(err);;
  app.post("/chose",function (req,res) {
    ssn=req.session;
    if(ssn.pass){
    var body = req.body;
      res.json(body);
    }
  });
  app.post("/build",function(req,res) {
    ssn=req.session;
    if(ssn.pass){
      useDb();
      let sql="SELECT * FROM uzyte_pola";
      con.query(sql,function(err,result) {
        res.json(result);
      });
    }
  });

  app.post("/naglowekSciany",function (req,res) {
    ssn=req.session;
    if(ssn.pass){
      let naglowek = req.body.naglowek,
          side = req.body.side;
      if(test(naglowek)){
        let sql="UPDATE kostka as k SET naglowek = '"+naglowek+"' WHERE sciana_nazwa='"+side+"'";
        useDb();
        con.query(sql,function(err,result){
          if(err) err;
        });
      }
      else sendErr(res);
    }
  });
  app.post("/nazwaPola",function (req,res) {
    ssn=req.session;
    if(ssn.pass){
      let body = req.body;
      if(test(body.naglowek)){
        let sql="call nazwa_update_insert_error("+body.x+","+body.y+",'"+body.current+"','"+body.naglowek+"')";
        useDb();
        con.query(sql,function(err,result){
          if(err)console.log(err);
          res.send(result[0][0].re);
        });
      }
      else sendErr(res);
    }
  });
  app.post("/updateHeaders",function(req,res){
    ssn=req.session;
    if(ssn.pass){
    let body = req.body,
      sql = "call nazwaStronaPole("+body.x+","+body.y+",'"+body.current+"')";
    useDb();
    con.query(sql,function (err,result) {
      if(err)console.log(err);;
      res.json(result[0]);
    });
  }
  });
  app.post("/osoba",function(req,res){
    ssn=req.session;
    if(ssn.pass){
      let body = req.body,
      dobre=new Array(8),
      text="",sql="";
      dobre.memset(null);
      dobre[0]=body.x;
      dobre[1]=body.y;
      dobre[2]=body.side;
      if( body.imie)testI(body.imie)?dobre[3]=body.imie:text+="nieprawidłowe imie (bez polskich znaków)\n";
      if(body.nazwisko)testI(body.nazwisko)?dobre[4]=body.nazwisko:text+="nieprawidłowe nazwisko (bez polskich znaków)\n";
      if(body.dataUrodzenia)testDate(body.dataUrodzenia)?dobre[5]=body.dataUrodzenia:text+="nieprawidłowa data urodzenia\n";
      if(body.telefon)testTelefon(body.telefon)?dobre[6]=body.telefon:text+="nieprawidłowy telefon\n";
      if(body.email)testEmail(body.email)?dobre[7]=body.email:text+="nieprawidłowy email\n";
      if(text!="")res.send(text);
      else{
        sql+="call osoba_update_insert("
        for (var i = 0; i < dobre.length; i++) {
          if(i<2)sql+=dobre[i];
          else{
               (dobre[i]==null)?sql+=dobre[i]:sql+='"'+dobre[i]+'"';
          }
          if(i!=dobre.length-1)sql+=",";
        }
        sql+=")";
        useDb();
        con.query(sql,function (err,result) {
          if(err)console.log(err);
        });
        res.send("ok");
      }
    }
  });
  app.post("/updateDisplay",function(req,res) {
    ssn=req.session;
    if(ssn.pass){
      let r = req.body;
      useDb();
      var sql="SELECT DATE_FORMAT(u.utworzenie,'%d.%c.%y %T') as utworzenie , o.imie, o.nazwisko,(SELECT YEAR(current_timestamp))-YEAR(o.urodzenie) as wiek, o.telefon, o.email from uzyte_pola as u inner join osoba as o on u.nazwa_pola=o.nazwa_pola where u.pole_x="+r.x+" and u.pole_y="+r.y+" and u.sciana_nazwa='"+r.current+"';";
      con.query(sql,function(err,result) {
      if(err)console.log(err);
        res.json(result)
      });
    }
  });
  app.post("/delete",function(req,res) {
    ssn=req.session;
    if(ssn.pass){
      let r=req.body;
      useDb();
      let sql="call delete_osoba_uzyte_pola("+r.x+","+r.y+",'"+r.side+"')";
      con.query(sql,function(err,result) {
        if(err)console.log(err);
      });
    }
  });
  app.post("/isName",function(req,res) {
    ssn=req.session;
    if(ssn.pass){
      let r=req.body;
      useDb();
      let sql="SELECT nazwa_pola FROM uzyte_pola where pole_x="+r.x+" and pole_y="+r.y+" and sciana_nazwa='"+r.current+"'";
      con.query(sql,function(err,result) {

        res.json(result);
      });
    }
  });
});

app.listen(3000);
