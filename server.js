var express = require('express');        
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var mongoose = require('mongoose');

var app = express();              
mongoose.connect('mongodb://sunny:1234@jello.modulusmongo.net:27017/imeW3odo');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public/views')));


var port = process.env.PORT || 8888;        // set our port
var router = express.Router();
var empRouter = express.Router();
var empData = require('./models/empSchema');

app.use('/API', empRouter);
app.use('/IMG', router);

var storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, 'public/images/')
    },
    filename: function(req, res, cb) {
        cb(null, req.params.id)
    }
});

var uploading = multer({
    storage: storage
});


router.route('/upload/:id')
    .post(uploading.single('file'), function(req, res) {
        console.log('image uploaded');
    });

router.route('/download/:id')
    .get(function(req, res) {
        console.log('image downloaded');
        res.sendFile(path.join(__dirname, '/public/images/', req.params.id));
    });
	
	
//-----------------------------------------------------------------------------------//////////	
/* GET employees listing. */	
empRouter.use(function(req, res, next) {
    console.log('Initiating...');
    next(); // make sure we go to the next routes and don't stop here
});

/* GET employees listing. */
empRouter
    .get("/emp/", function(request, response) {
        empData.find(function(err, empData) {
            if (err)
                response.send(err);

            response.json(empData);
        });
    })  
    .get('/emp/:id', function(request, response) {
        empData.findById(request.params.id, function(err, empData) {
            if (err)
                response.send(err);

            response.json(empData);
        });
    })
    .get("/emp/:id/next/", function(request, response) {
        var id = (request.params.id.length != 9) ? { "_id": { "$lt": request.params.id }} : "";
        console.log(id);
        empData.find(id)
            .sort({ "_id": -1 })
            .limit(10)
            .exec(function(err, empData) {
                response.json(empData);
        });
    }) 
    .get("/emp/:id/managers/", function(request, response) {
        empData.find(function(err, empData) {
            if (err)
                response.send(err);
        var getAvailableManager = function (empData, target) {
            var count = 0;
            for(var i = 0; i < empData.length; i++) {
                if(empData[i].manager == target || empData[i]._id == target) empData.splice(i ,1);
                if(!setTimeout(checkAvailablity(empData[i], target), 0)) empData.splice(i,1);
            }
        };

        var checkAvailablity = function(emp, target) {
            if(emp == undefined) return true;
            if(emp.manager == target) return false;
            else checkAvailablity(emp.manager, target);
        };
        getAvailableManager(empData, request.params.id);
        response.json(empData);
        });
    })
    .get("/emp/:id/dirReports/", function(request, response) {
        empData.find({manager : request.params.id}, function(err, empData) {
            if (err)
                response.send(err);
            response.json(empData);
        });
    })
    .put("/emp/:id", function(request, response) {
        if(request.params.id.length == 9) {
            console.log("in creating new employee...");
                empData.create(request.body, function(err, res) {
                    if (err)
                        response.send(err);
                    response.json(res);
                });

        }
        else {
            empData.findByIdAndUpdate(request.params.id, request.body, function(err, res) {
                if (err)
                    response.send(err);
                response.json(res);
            });
        }
    })
    .delete("/emp/:id", function(request, response) {
        empData.findByIdAndRemove(request.params.id, function(err, res) {
            if (err)
                response.send(err);
            response.json(res);
        });
    });
	
app.listen(port);
console.log("Magic happens on port: " + port);
