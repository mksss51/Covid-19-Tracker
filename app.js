require('dotenv').config();
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require('axios');
const { inflateRawSync } = require('zlib');
const _ = require("lodash");
const { response } = require('express');
const { error } = require('console');
const selectdata = require('./data.js');

const port = process.env.PORT || 3000;


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


app.use(express.static("public"));

const dbUrl = process.env.MONGOLINK;
mongoose.connect(dbUrl,  { useNewUrlParser: true, useUnifiedTopology: true, 'useFindAndModify': false});

const storeSchema = mongoose.Schema({
  name : String,
  address : String,
  contact : Number,
  medicine : String,
  district : String
});


const Store = mongoose.model("Store",storeSchema);
  var datas;
  var statewiseDatas;
  var cases;
  var testedDatas;

  
  axios.get('https://api.covid19india.org/data.json')
  .then(response => {
    datas = response.data;
    statewiseDatas = datas.statewise;
    cases = datas.cases_time_series;
    testedDatas = datas.tested;
    // console.log(statewiseDatas);
    // console.log(cases[cases.length - 1]);
    // console.log(testedDatas[testedDatas.length - 1]);
    console.log("api called");
    
  })
  .catch(error => {
    console.log(error);
  });
app.get("/", function(req,res){

  

    res.render("home", {
      currentCase : cases[cases.length - 1],
      statewiseData : statewiseDatas,
      testData : testedDatas[testedDatas.length - 1]
    });
    
    
});


app.get("/about", function(req,res){
  res.render("about");
  
});

app.get("/medicines",function(req,res){

  Store.find({},function(err,foundItems){
      res.render("medicines",{newListItems: foundItems});
  })

  
});

app.post("/addlead",function(req,res){
  const storeName = _.capitalize(req.body.storeName);
  const storeDistrict = _.capitalize(req.body.district);
  const storeContact = _.capitalize(req.body.contact);
  const storeAddress = _.capitalize(req.body.address);
  const storeMedicine = _.capitalize(req.body.medicine);

  // console.log(storeName);
  // console.log(storeDistrict);
  // console.log(storeContact);
  // console.log(storeAddress);
  // console.log(storeMedicine);

  const store = new Store({
    name : storeName,
    address : storeDistrict,
    contact : storeContact,
    medicine : storeMedicine,
    district : storeAddress
  })
  store.save();
  res.redirect("/medicines");

})




app.listen(port, function() {
    console.log("Server is running on port "+port);
})