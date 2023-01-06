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

app.get('/play', function(request, response) {
    let opponents = JSON.parse(fs.readFileSync('data/opponents.json'));
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("play", {
      data: opponents
    });
});


app.get('/scores', function(request, response) {
  let opponents = JSON.parse(fs.readFileSync('data/opponents.json'));
  let opponentArray=[];

  //create an array to use sort, and dynamically generate win percent
  for(name in opponents){
    opponents[name].win_percent = (opponents[name].win/parseFloat(opponents[name].win+opponents[name].lose+opponents[name].tie) * 100).toFixed(2);
    if(opponents[name].win_percent=="NaN") opponents[name].win_percent=0;
    opponentArray.push(opponents[name])
  }
  opponentArray.sort(function(a, b){
    return parseFloat(b.win_percent)-parseFloat(a.win_percent);
  })

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("scores",{
    opponents: opponentArray
  });
});


app.get('/opponent/:opponentName', function(request, response) {
  let opponents = JSON.parse(fs.readFileSync('data/opponents.json'));

  // using dynamic routes to specify resource request information
  let opponentName = request.params.opponentName;

  if(opponents[opponentName]){
    opponents[opponentName].win_percent = (opponents[opponentName].win/parseFloat(opponents[opponentName].win+opponents[opponentName].lose+opponents[opponentName].tie) * 100).toFixed(2);
    if(opponents[opponentName].win_percent=="NaN") opponents[opponentName].win_percent=0;

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("opponentDetails",{
      opponent: opponents[opponentName]
    });

  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"404"
    });
  }
});


//------------------------------------------DEMO ABOVE----------------------------

app.get('/', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("index");
});





app.get('/gradeSubmitStudent', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("gradeSubmitStudent");
});



app.get('/student/:studentName', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("studentProfile");
  /*asds
  let opponents = JSON.parse(fs.readFileSync('data/opponents.json'));

  // using dynamic routes to specify resource request information
  let opponentName = request.params.opponentName;

  if(opponents[opponentName]){
    opponents[opponentName].win_percent = (opponents[opponentName].win/parseFloat(opponents[opponentName].win+opponents[opponentName].lose+opponents[opponentName].tie) * 100).toFixed(2);
    if(opponents[opponentName].win_percent=="NaN") opponents[opponentName].win_percent=0;

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("opponentDetails",{
      opponent: opponents[opponentName]
    });

  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"404"
    });
  }
  */
});

app.get('/classScores', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("classScores");
});

app.get('/results', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("results");
});

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
        students[studentName][assessment] = pointsG/pointsW;
        students[studentName][totalpointsgained] += pointsG;
        students[studentName][totalpointsoffered] += pointsW;
        fs.writeFileSync('data/students.json', JSON.stringify(students));

        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.redirect("/studentCreate");
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


//-----------------------------DEMO-----------------------------------------

app.post('/opponentCreate', function(request, response) {
    let opponentName = request.body.opponentName;
    let opponentPhoto = request.body.opponentPhoto;
    if(opponentName&&opponentPhoto){
      let opponents = JSON.parse(fs.readFileSync('data/opponents.json'));
      let newOpponent={
        "name": opponentName,
        "photo": opponentPhoto,
        "win":0,
        "lose": 0,
        "tie": 0,
      }
      opponents[opponentName] = newOpponent;
      fs.writeFileSync('data/opponents.json', JSON.stringify(opponents));

      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.redirect("/opponent/"+opponentName);
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
