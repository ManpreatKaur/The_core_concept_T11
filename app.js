const express=require('express');
const bodyParser=require("body-parser");
const ejs=require('ejs');
const session=require('express-session');
const mongoose=require("mongoose");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");



const app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

app.use(session({
    secret: "cookie_secret",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://Ayu:apk@cluster0.xggcojd.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser:true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connection to the database established successfully!');

});
//mongoose.set('createIndexes',true);
const userSchema= new mongoose.Schema({
    firstname:String,
    lastname:String,
    username:String,
    usertype:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);
const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Logged in page
app.get("/main",function(req,res){
    if(req.isAuthenticated()){
        res.render("main.ejs"); 
    }else{
        res.redirect("/")
    }
     
})

app.post("/main",function(req,res){

})
//Logged in page-end
//Root-route
app.get("/",function(req,res){
    res.render("login.ejs");
})

app.post("/",function(req,res){
 console.log(req);
 const user=new User({
    username:req.body.login,
    password:req.body.loginPass,

 })
 req.login(user,function(err){
    if(err){
        console.log(err)
        res.redirect("/");
    }else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/main");
        })
    }
 })
})

//Root-route-end

//Signup-route
app.get("/signup",function(req,res){
    res.render("signup.ejs");
})
app.post("/signup",function(req,res){
    console.log(req);
    User.register({firstname:req.body.fName,lastname:req.body.lName,username:req.body.user,usertype:req.body.usertype},req.body.pass,function(err,User){
        if(err){
            console.log(err);
            res.redirect("/signup");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/main");
            })
    }})
})
//Signup-route-end
app.post("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

app.listen(3000,function(req,res){
    console.log("Server running at port 3000");
})