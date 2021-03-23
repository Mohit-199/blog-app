require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://mohit_301997:Hello@1997@cluster0.jt01a.mongodb.net/blogDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});




const blogSchema = new mongoose.Schema({
  title: String,
  blog: String
});
const Blog = mongoose.model("Blog", blogSchema);

const homeStartingContent = "Hello This Blog has been created by Mohit Kapoor.Here you can write a blog,update your blog and you can also delete your blog.Here you can share your thoughts and ideas or anything that happened in your life.This blog has been created with a MongoDB database at the Backend and other web technologies that it uses are HTML,CSS,Bootstrap,NodeJs,ExpressJs  and it also uses passport npm package for local authentication."
const aboutContent = "I am a person who loves interacting with people,I am a person who always keep laughing no matter how tough the situation is.I love traveling.And the most important thing about me is that I am an Anime lover.My favorite animes are Naruto,One Piece,Bleach,Fairy Tale.If you don't love animes then sorry we can't talk."
const contactContent = "If you wanna contact me,drop me a mail at my email id which is mohitkapoor3887@gmail.com."


app.get("/", function (req, res) {
  res.render("signUp");
});

app.get("/blog", function (req, res) {
  if (req.isAuthenticated()) {
    Blog.find({}, function (err, foundBlog) {
      res.render("home", {
        addedBlog: foundBlog,
        homeContent: homeStartingContent
      });

    });
  } else {
    res.redirect("/");
  }
});

app.get("/about", function (req, res) {
  res.render("about", { about: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contact: contactContent })
});

app.get("/compose", function (req, res) {

  res.render("compose");
});

app.post("/delete", function (req, res) {
  const deletingContent = req.body.deleteContent;
  console.log(deletingContent);
  Blog.deleteOne({ _id: deletingContent }, function (err, foundObject) {
    res.redirect("/blog");
  })
});


app.post("/register", function (req, res) {

  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/blog");
      });
    }
  });

});


app.post('/login', passport.authenticate('local', { successRedirect:'/blog',
  failureRedirect: '/'}));


app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.post("/compose", function (req, res) {
  const title1 = req.body.title;
  const post1 = req.body.post;
  const Post1 = new Blog({
    title: title1,
    blog: post1
  });
  Post1.save(function (err) {
    if (!err) {
      res.redirect("/blog");
    }
  });
});

app.post("/update", function (req, res) {
  const updateContenting = req.body.updateContent;
  console.log(updateContenting);
  Blog.findOne({ _id: updateContenting }, function (err, foundObject) {
    console.log(foundObject);
    res.render("updateCompose", {
      Titles: foundObject.title,
      Body: foundObject.blog,
      ObjectId: foundObject._id
    });
  });
});

app.post("/updateCompose", function (req, res) {
  const updatedId = req.body.buttonId;
  Blog.findOneAndUpdate({ _id: updatedId }, {
    $set: {
      title: req.body.updatedTitle,
      blog: req.body.updatedPost
    }
  }, { new: true }, function (err, foundObject) {
    if (!err) {
      res.redirect("/blog");
    }
  });

});


app.get("/posts/:read", function (req, res) {
  const requiredId = req.params.read;
  Blog.findOne({ _id: requiredId }, function (err, foundObject) {
    res.render("post", {
      Titles: foundObject.title,
      Body: foundObject.blog
    });
  });
});


app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000.");
});
