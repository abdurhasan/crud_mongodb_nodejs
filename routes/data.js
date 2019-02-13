const express = require('express');
const router = express.Router();
const helpers = require('../helpers/util')
/* GET home page. */
var mongoClient = require('mongodb').MongoClient
var mongodb = require('mongodb')
var local = 'mongodb://localhost:27017/duadua'



// =========================== 
//           BROWSE  
// =========================== 
router.get('/', function (req, res, next) {



  mongoClient.connect(local, (error, db) => {
    const url = req.query.page ? req.url : '/?page=1';
    const page = req.query.page || 1;
    const limit = 3;
    let skip = (page - 1) * limit
    let params = {};
    var col = db.collection('data')

    if (req.query.cnama && req.query.nama) {
      params['nama'] = req.query.nama
    }

    if (req.query.cumur && req.query.umur) {
      params['umur'] = parseInt(req.query.umur)

    }

    if (req.query.ctinggi && req.query.tinggi) {
      params['tinggi'] = parseFloat(req.query.tinggi)
    }

    if(req.query.clahir && req.query.startlahir && req.query.endlahir){
      params['lahir']={
        $gt: req.query.startlahir,
        $lt: req.query.endlahir
      }      
    }

    if (req.query.cstatus && req.query.status) {
      params['status'] = JSON.parse(req.query.status)
    }    
    console.log(params)
    col.count(params, (err, pages) => {
      pages = Math.ceil(pages / limit)
      col.find(params).limit(limit).skip(skip).toArray(function (err, data) {

        res.render('home', {
          data: data,
          helpers: helpers,
          pagination: {pages, page, url},
          query: req.query
        })
      })
    })

  })

});


router.get('/api', function (req, res) {
  mongoClient.connect(local, (error, db) => {
    var col = db.collection('data')
    col.find({}).toArray((err, dt) => res.json({ data: dt }))
  })
})


// ===========================   
//              EDIT  
// =========================== 

router.get('/edit/:id', function (req, res) {
  mongoClient.connect(local, (error, db) => {
    var col = db.collection('data')
    col.find({ _id: new mongodb.ObjectID(`${req.params.id}`) })
      .toArray((err, data) => {
        if (err) res.json({ success: 'failed', err: err })

        res.render('edit', { title: 'EDIT DATA', item: data[0], helpers });

      })
  })
})

router.post('/edit/:id', (req, res) => {
  mongoClient.connect(local, (error, db) => {
    var col = db.collection('data')
    col.updateOne(
      {
        _id: new mongodb.ObjectID(
          `${req.params.id}`
        )
      },
      {
        $set: {
          nama: req.body.nama,
          umur: parseInt(req.body.umur),
          tinggi: parseFloat(req.body.tinggi),
          lahir: req.body.lahir,
          status: JSON.parse(req.body.status)
        }
      },
      (err, hasil) => {
        if (err) res.json({ success: 'failed', err: err })
        res.redirect('/')
      })
  })
})


// ===========================   
//              ADD  
// =========================== 
router.post('/add', (req, res) => {
  mongoClient.connect(local, (err, db) => {
    var col = db.collection('data')
    if (err) res.json({ success: 'failed', err: err })
    col.insertOne({
      nama: req.body.nama,
      umur: parseInt(req.body.umur),
      tinggi: parseFloat(req.body.tinggi),
      lahir: req.body.lahir,
      status: JSON.parse(req.body.status)
    }, (err, hasil) => {
      if (err) res.json({ success: 'failed', err: err })
      res.redirect('/')
    })
  })
})


// =========================== 
//          DELETE
// =========================== 
router.get('/delete/:id', (req, res) => {
  mongoClient.connect(local, (error, db) => {
    var col = db.collection('data')
    col.deleteOne(
      {
        _id: new mongodb.ObjectID(
          `${req.params.id}`
        )
      },

      (err, hasil) => {
        if (err) res.json({ success: 'failed', err: err })
        res.redirect('/')
      })
  })
})


router.get('/add', (req, res) => {
  res.render('add', { title: 'Tambah data' })
})


module.exports = router


