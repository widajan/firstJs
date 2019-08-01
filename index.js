const express = require('express'); 
const app = express();
const Joi = require('joi');
const path = require('path');
const mysql = require('mysql');
const port = process.env.port || 5000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static("public"));

app.set("view engine","ejs");
app.set("views", './view');

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "ali_db",
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});
con.connect((err) =>{
    if (err) {
        console.log(err);
    }
    console.log("Connected");
});

app.get('/add', (req, res) => {
    res.sendFile(path.join(__dirname+'/view/add-form.html'));

});

// View
app.get('/view/:id', (req, res, next) => {
    con.query("SELECT * FROM users WHERE id= ? ",req.params.id, (err, result) => {
        //res.sendFile(path.join(__dirname+'/add-edit.ejs'));
        if(err)
        {
            res.send(err);
        }
            res.render("view-user", {userView: result});
    });
});

// List
app.get('/', function(req, res) {
    const records = con.query("SELECT * FROM users LIMIT 2 ", function(err, result) {
        if(err){
            res.send(err);
        }
            res.render("list",{userList: result});
    });
});

// Insert
app.post('/submitForm', function(req, res, next) {
    con.query("INSERT INTO users(fullname, email, age, address, gender) VALUES ('"+req.body.name+"', '"+req.body.email+"', "+req.body.age+", '"+req.body.address+"', '"+req.body.gender+"')", (err, result) =>{
        const schema =  Joi.object().keys({
            name:       Joi.string().min(3).required(),
            email:      Joi.string().trim().email().required(),
            age:        Joi.number().integer().min(7).max(120).required(),
            address:    Joi.string().min(3).required(),
            gender:     Joi.string().required()
        });
        Joi.validate(req.body, schema, (err, result) => {
            if(err)
        {
            res.send(err);
        }   
            console.log(result);
            res.redirect("Data inserted successfully");
        });
        
    });
});

//Edit
app.get('/edit/:id', (req, res) => {
    con.query("SELECT * FROM users WHERE id = ? ",req.params.id, (err, result) => {
        
        if(err)
        {
            res.send(err);
        }   
            res.render("edit", {editUser: result});
    });
});

app.post('/edit/:id', function(req, res) {
    con.query("UPDATE users SET fullname = '"+req.body.name+"', email = '"+req.body.email+"', age = '"+req.body.age+"', address = '"+req.body.address+"', gender = '"+req.body.gender+"' WHERE id = "+req.params.id, (err, result) => {
        if(err) {
            res.send(err)
        }   
            res.redirect('/');
    });
});

// Delete
app.get('/delete/:id', (req, res) => {
    con.query("DELETE FROM users WHERE id = "+req.params.id, function(err, result){
        if(err){
            res.send(err);
        }
            res.redirect('/');
    });
});

app.listen(port, (req, res) => {
    console.log('Your application is running on port', port);
});