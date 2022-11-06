const { render } = require('ejs');
const express = require('express');
const router = express.Router();
const userModel = require('../model/user');
const projectModel = require('../model/project');
const passport = require('passport');
const axios = require('axios');
const boardModel = require('../model/board');
const multer = require('multer');
const path = require('path');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    let fileName = Date.now() + Math.floor(Math.random() * 10000) + file.originalname
    cb(null, fileName)
  }
})

const upload = multer({ storage: storage })

const localStrategy = require('passport-local');
const { populate, db, findOne } = require('../model/user');
const { response } = require('express');

passport.use(new localStrategy(userModel.authenticate()));


router.post('/avatar', isLoggedIn, upload.single('avatar'), async (req, res) => {
  let loggedInUser = await userModel.findOne({ username: req.session.passport.user });
  loggedInUser.profilePic = req.file.filename;
  loggedInUser.save();
  res.redirect('back');
});

router.get('/', isAlreadyLoggedIn, async (req, res) => {
  let obj = {
    user: 0,
    project: 0,
  };
  await userModel.countDocuments().then((result) => {
    obj.user = result;
  });
  await projectModel.countDocuments().then((result) => {
    obj.project = result;
  });
  res.render('home', { obj });
});

router.get('/signup', isAlreadyLoggedIn, (req, res) => {
  res.render('signup', { link: "/registration" });

})

router.get('/signup-member', isAlreadyLoggedIn, (req, res) => {
  res.render('signup', { link: "/registration-member" });
})

router.get('/login', isAlreadyLoggedIn, (req, res) => {
  res.render('login');
});

router.get('/dashboard', isLoggedIn, async (req, res) => {
  let leftDays = 0;
  let loggedInUser = await userModel.findOne({ username: req.session.passport.user })
    .populate({
      path: 'projectDetails',
      populate: {
        path: "teamMember"
      }
    });

  if (loggedInUser.projectDetails.length > 0) {
    let currentDate = new Date();
    let duration = 0;
    let date1 = new Date(loggedInUser.projectDetails[0].startDate);
    let date2 = new Date(loggedInUser.projectDetails[0].endDate);
    let diff = date2.getTime() - date1.getTime();
    duration = diff / (1000 * 3600 * 24);
    leftDays = (date2.getTime() - currentDate.getTime()) / (1000 * 3600 * 24);
    leftDays = Math.round(leftDays);
    res.render('dash', { user: loggedInUser, leftDays });
  } else {
    res.render('dash', { user: loggedInUser, leftDays });
  }
});

router.get('/board', isLoggedIn, async (req, res) => {
  let loggedInUser = await userModel.findOne({ username: req.session.passport.user })
    .populate({
      path: 'projectDetails',
      populate: {
        path: "teamMember"
      }
    });
  let project = await projectModel.findOne({ _id: loggedInUser.projectDetails[0] })
    .populate('teamMember')
    .populate({
      path: 'toDoTask',
      populate: {
        path: "assignTo"
      }
    })
    .populate({
      path: 'inProgress',
      populate: {
        path: "assignTo"
      }
    })
    .populate({
      path: 'inReview',
      populate: {
        path: "assignTo"
      }
    })
    .populate({
      path: 'done',
      populate: {
        path: "assignTo"
      }
    });
  res.render('boards', { user: loggedInUser, project });
});

router.post('/add-task', isLoggedIn, async (req, res) => {
  let createBoard = await boardModel.create({
    subject: req.body.subject,
    description: req.body.description,
    attachment: [],
    assignTo: req.body.assign,
  });
  let loggedInUser = await userModel.findOne({ username: req.session.passport.user });
  let project = await projectModel.findOne({ _id: loggedInUser.projectDetails[0] });
  let assignUser = await userModel.findOne({ _id: req.body.assign });

  let field = req.body.taskField;
  switch (field) {
    case 'to-do-task':
      assignUser.updates.toDoTask += 1;
      project.toDoTask.push(createBoard._id);
      break;
    case 'in-progress':
      assignUser.updates.inProgress += 1;
      project.inProgress.push(createBoard._id);
      break;
    case 'in-review':
      assignUser.updates.inReview += 1;
      project.inReview.push(createBoard._id);
      break;
    case 'done':
      assignUser.updates.done += 1;
      project.done.push(createBoard._id);
      break;
  }
  createBoard = await createBoard.populate('assignTo');
  assignUser.save();
  project.save();
  res.json(createBoard);
});

router.post('/registration', isAlreadyLoggedIn, (req, res) => {

  let newUser = new userModel({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    username: req.body.username,
    designation: req.body.designation,
  });
  userModel.register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/steps');
      })
    })
    .catch(function (e) {
      res.send(e);
    })
});

router.post('/registration-member', isAlreadyLoggedIn, (req, res) => {

  let newUser = new userModel({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    username: req.body.username,
    designation: req.body.designation
  });
  userModel.register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/dashboard');
      })
    })
    .catch(function (e) {
      res.send(e);
    })
})

router.post('/login', isAlreadyLoggedIn, passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login'
}), (req, res, next) => { });

router.get('/logout', isLoggedIn, (req, res) => {
  req.logOut(function (err) {
    if (err) throw err;
    res.redirect('/login');
  })
});

router.get('/steps', isLoggedIn, (req, res) => {
  res.render('steps')
})

router.post('/project-details', isLoggedIn, async (req, res) => {
  let loggedInUser = await userModel.findOne({ username: req.session.passport.user });
  let project = await projectModel.create({
    projectName: req.body.projectName,
    description: req.body.description,
    technology: req.body.techStack,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    projectManager: loggedInUser._id,
    teamMember: loggedInUser._id
  });
  loggedInUser.projectDetails.push(project._id);
  loggedInUser.save();
  res.redirect('/team');
});

router.get('/add-member/:email', isLoggedIn, async (req, res) => {
  let loggedInUser = await userModel.findOne({ username: req.session.passport.user });
  let addUser = await userModel.findOne({ email: req.params.email });
  let project = await projectModel.findOne({ projectManager: loggedInUser._id });

  if (req.params.email === loggedInUser.email) {
    res.json("Warning: It's your email id please type another member email id.");
  } else {
    if (addUser) {
      if ((project.teamMember.includes(addUser._id) === false)) {
        addUser.projectDetails.push(project._id);
        addUser.save();
        project.teamMember.push(addUser._id);
        project.save();
        res.json("User added Successfully In Your Team.");
      } else {
        res.json("User already in your team.")
      }
    } else {
      res.json("User does't have any account with this email.");
    }
  }
});

router.get('/team', isLoggedIn, (req, res) => {
  res.render('team');
});

router.get('/discussion', isLoggedIn, async (req, res) => {
  let loggedInUser = await userModel.findOne({ username: req.session.passport.user });
  let project = await projectModel.findOne({ _id: loggedInUser.projectDetails[0] }).populate('teamMember')
  res.render('chat', { loggedInUser, project });
});

router.post('/set-meeting', isLoggedIn, async (req, res) => {
  let loggedInUser = await userModel.findOne({ username: req.session.passport.user });
  if (loggedInUser.projectDetails.length > 0) {
    let project = await projectModel.findOne({ _id: loggedInUser.projectDetails[0] }).sort({ "meeting.date": -1 });
    let mName = nameMonth(req.body.meetSetTime);
    let fullDate = new Date((req.body.meetSetTime));
    let timeOfMeet = await convertTime(fullDate.getHours(), fullDate.getMinutes());
    await project.meeting.push({ date: fullDate.getDate(), month: mName, time: timeOfMeet });
    await project.save();
  }
  res.redirect('back');
});

function convertTime(hours, minutes) {
  let amOrPm = hours >= 12 ? 'PM' : 'AM';
  hours = (hours % 12) || 12;
  let finalTime = `${hours}:${minutes} ${amOrPm}`;
  return finalTime;
}

function nameMonth(fulldate) {
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let d = new Date(fulldate);
  return months[d.getMonth()];
}

router.get('/delete/:id', isLoggedIn, async (req, res) => {
  let loggedInUser = await userModel.findOne({ username: req.session.passport.user }).populate('projectDetails');
  let project = await projectModel.findOneAndUpdate({ _id: loggedInUser.projectDetails[0] },
    {
      $pull: {
        meeting: {
          _id: req.params.id,
        }
      }
    });
  res.redirect('back');

});

router.get('/text-to-speech', isLoggedIn, (req, res) => {
  res.render('tts');
});

router.get('/delete-task/:id', isLoggedIn, async (req, res) => {
  let loggedInUser = await userModel.findOne({ username: req.session.passport.user });
  let board = await boardModel.findOneAndDelete({ _id: req.params.id });
  res.redirect('back');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

function isAlreadyLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/profile")
  } else {
    return next()
  }
}
module.exports = router;
