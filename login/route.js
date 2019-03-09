const express = require('express');
var path = require('path');
const controller = require('./login-controller');
const case_controller = require('../cases/case-controller')
const case_model = require('../cases/case-model')
var appDir = path.dirname(require.main.filename);

var router = express.Router();
router.get('/', function(req,res) {
    // if condition
    res.redirect('login')
})

router.get('/login', function(req,res) {
    res.render('login')
})

router.get('/test_case', function(req,res) {
    case_controller.readFir(2);
})

router.post('/login', function(req,res) {
    controller.sign_in(req,res);
})

router.get('/home', function(req,res,next) {
	controller.loginRequired(req,res,next);
	} ,function(req,res) {
    console.log("User's role is : " + req.session.role);
    if(req.session.role == 0)
        res.render('officer',{username: req.session.username })
    else if(req.session.role==1) {
        console.log("ID IS " + req.session.lol);
        case_model.getDetectiveCases(req.session.lol, function(result){
            console.log(result)
            res.render('detective',{username: req.session.username, cases:result })
        })
        
    }
    else if(req.session.role == 2)
    {
        case_model.getNumberOpenCases(function(result){
            open_case_count = result[0].open_case_count;
            console.log(open_case_count);
            res.render('lieutenant',{username: req.session.username, open_case_count:open_case_count })
        })  
    }
})

router.get('/home/create_report/:caseid', function(req,res,next) {
	controller.loginRequired(req,res,next);
	} ,function(req,res)  {
        caseid = req.params['caseid'];
        req.session.caseid = caseid;
        res.render('detective_create_report', {caseid: caseid, currReport : ""})
})

router.post('/home/create_report/:caseid', function(req,res,next) {
	controller.loginRequired(req,res,next);
	} ,function(req,res)  {
        caseid = req.params['caseid'];
        case_controller.createDetectiveReport(req);
        req.session.caseid = null;
        res.redirect('/home')
})

router.get('/home/edit_report/:caseid', function(req,res,next) {
	controller.loginRequired(req,res,next);
	} ,function(req,res)  {
        caseid = req.params['caseid'];
        req.session.caseid = caseid;
        case_controller.getDetectiveReport(req, function(report) {
            res.render('detective_create_report', { currReport: report})
        });
})

router.get('/home/delete_report/:caseid', function(req,res,next) {
	controller.loginRequired(req,res,next);
	} ,function(req,res)  {
        caseid = req.params['caseid'];
        req.session.caseid = caseid;
        case_model.deleteDetectiveCase(req.session.lol, caseid, function() {
            case_controller.deleteDetectiveReport(req)
            req.session.caseid = null;
            res.redirect('/home')
        })
})

router.get("/authorization_error", function(req,res) {
    message = "FORBIDDEN";
    desc = "This page is classified.";
    return res.render((appDir + '/templates/error/admin_error.ejs'), { url: req.url, message: message , desc : desc });
})

router.get("/login_error", function(req,res) {
    message = "Login Error";
    desc = "The username or password you entered did not match with our records.";
    return res.render((appDir + '/templates/error/admin_login_error.ejs'), { url: req.url, message: message , desc : desc });
})

router.get('/logout' ,function(req, res) {
	req.session.destroy();
	res.redirect('/');
})

router.post('/home/create_fir', function(req,res) {
    case_controller.createFir(req);
    console.log(req.session.username)
    res.redirect('/home')
})

module.exports = router