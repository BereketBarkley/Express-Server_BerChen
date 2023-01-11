//..............Include Express..................................//
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');

//..............Create an Express server object..................//
const app = express();

//..............Apply Express middleware to the server object....//
app.use(express.json()); //Used to parse JSON bodies (needed for POST requests)
app.use(express.urlencoded());
app.use(express.static('public')); //specify location of static assests
app.set('views', __dirname + '/views'); //specify location of templates
app.set('view engine', 'ejs'); //specify templating library

//.............Define server routes..............................//
//Express checks routes in the order in which they are defined


app.get('/', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("index");
});


app.get('/studentProfile', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')


    let studentInfo = JSON.parse(fs.readFileSync('data/students.json', 'utf8'));
    let studentName = request.query.studentName;

    if(studentInfo[studentName]){
      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.render("studentProfile",{
        studentStats: studentInfo[studentName],
        studentName: studentName,
      });
    }

    else{
      response.status(404);
      response.setHeader('Content-Type', 'text/html')
      response.render("error", {
        "errorCode":"404"
      });
    }
});

app.get('/classScores', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')

    let studentInfo = JSON.parse(fs.readFileSync('data/students.json', 'utf8'));
    let classInfo = JSON.parse(fs.readFileSync('data/classes.json', 'utf8'));
    response.render("classScores",{ stats: studentInfo, classStats: classInfo});
});

app.get('/results', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("results");
});

// STUDENT SUBMIT GRADE -----------------------------------

app.get('/gradeSubmitStudent', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("gradeSubmitStudent");
});

app.post('/gradeSubmitStudent', function(request,response){

      let name = request.body.name;
      let assessment = request.body.assessment;
      let pointsW = request.body.pointsW;
      let pointsG = request.body.pointsG;

      if(name && assessment && pointsW && pointsG){
        let students = JSON.parse(fs.readFileSync('data/students.json'));

        students[name][assessment] = Number(Math.round(100*pointsG/pointsW)/100);
        students[name]["totalpointsgained"] += Number(pointsG);
        students[name]["totalpointsoffered"] += Number(pointsW);
        students[name]["cumulativeGrade"] = Number(Math.round(100 * students[name]["totalpointsgained"] / students[name]["totalpointsoffered"])/100);
        fs.writeFileSync('data/students.json', JSON.stringify(students));

        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.redirect("/classScores");
      }
      else{
        response.status(400);
        response.setHeader('Content-Type', 'text/html')
        response.render("error", {
          "errorCode":"400"
        });
      }
});

// TEACHER SUBMIT GRADE -----------------------------------

app.get('/gradeSubmitTeacher', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("gradeSubmitTeacher");
});


app.post('/gradeSubmitTeacher', function(request,response){

      let studentName = request.body.studentName;
      let assessment = request.body.assessment;
      let pointsW = request.body.pointsW;
      let pointsG = request.body.pointsG;

      if(studentName && assessment && pointsW && pointsG){
        let students = JSON.parse(fs.readFileSync('data/students.json'));

        students[studentName][assessment] = Number(Math.round(100* pointsG/pointsW)/100);
        students[studentName]["totalpointsgained"] += Number(pointsG);
        students[studentName]["totalpointsoffered"] += Number(pointsW);
        students[studentName]["cumulativeGrade"] = Number(Math.round(100 * students[studentName]["totalpointsgained"] / students[studentName]["totalpointsoffered"])/100);
        fs.writeFileSync('data/students.json', JSON.stringify(students));

        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.redirect("/classScores");
      }
      else{
        response.status(400);
        response.setHeader('Content-Type', 'text/html')
        response.render("error", {
          "errorCode":"400"
        });
      }
});

// STUDENT CREATE --------------------------------------

app.get('/studentCreate', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("studentCreate");
});



app.post('/studentCreate', function(request, response) {

  let studentName = request.body.studentName;
  let studentPhoto = request.body.studentPhoto;

  if(studentName&&studentPhoto){
    let students = JSON.parse(fs.readFileSync('data/students.json'));
    let newStudent={
      "photoLink": studentPhoto,
      "cumulativeGrade": 100,
      "totalpointsgained":0,
      "totalpointsoffered": 0,
    }
    students[studentName] = newStudent;
    fs.writeFileSync('data/students.json', JSON.stringify(students));

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.redirect("/gradeSubmitStudent");
  }else{
    response.status(400);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"400"
    });
  }


});



app.get('/addStudentToClass', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("addStudentToClass");
});



app.post('/addStudentToClass', function(request, response) {

  let studentName = request.body.studentName;
  let className = request.body.className;

  if(studentName&&className){
    let classes = JSON.parse(fs.readFileSync('data/classes.json'));
    console.log(className, classes[className]["roster"]);
    if(classes[className]){
      classes[className]["roster"].push(studentName);
    }
    fs.writeFileSync('data/classes.json', JSON.stringify(classes));

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.redirect("/classScores");
  }else{
    response.status(400);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"400"
    });
  }


});


app.get('/classCreate', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("classCreate");
});



app.post('/classCreate', function(request, response) {

  let className = request.body.className;
  let level = request.body.level;
  let grade = request.body.grade;
  let subject = request.body.subject;
  let student = request.body.student;

  if(className&&level&&grade&&subject&&student){
    let classes = JSON.parse(fs.readFileSync('data/classes.json'));

    let newClass={
      "level": level,
      "grade": grade,
      "subject":subject,
      "roster": [student],
    }

    classes[className] = newClass;
    fs.writeFileSync('data/classes.json', JSON.stringify(classes));

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.redirect("/gradeSubmitStudent");
  }else{
    response.status(400);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"400"
    });
  }


});


// Because routes/middleware are applied in order,
// this will act as a default error route in case of
// a request fot an invalid route
app.use("", function(request, response){
  response.status(404);
  response.setHeader('Content-Type', 'text/html')
  response.render("error", {
    "errorCode":"404"
  });
});

//..............Start the server...............................//
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server started at http://localhost:'+port+'.')
});
