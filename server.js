const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// const cors = require('cors');
const port = 3000;

//app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const MongoClient = require('mongodb').MongoClient;  
const ObjectId = require('mongodb').ObjectId;  

let db;
const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true }); 
client.connect((err) => {      
	if(err) {
		console.error('Problem with DB');
		return;
    }
    db = client.db('app')  
	console.log('Successful connection to DB');
});

const date = new Date();

app.put('/coupon', (req, res) => {
    db.collection('coupons').find({}).toArray((err,coupons) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      let coupon={
        code: "cc-"+coupons.length,
        date : date,
        isRedeem : false
      }

      db.collection('coupons').insertOne(coupon, (err,coupon)=>{
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }

        res.status(201).json(coupon.ops[0]);
      });

    })
});

app.get('/coupon', (req, res) => {
  db.collection('coupons').find({}).toArray((err,coupons) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.json(coupons);
  });
});

app.get('/coupon/:id', (req, res) => {
  db.collection('coupons').findOne({
    _id: ObjectId(req.params.id)
  }, (err,user)=>{
    if (err){
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.json(user);
  })
   
});

app.post('/coupon/:id', (req, res) => {
  const couponId = ObjectId(req.params.id);
	db.collection('coupons').findOne({
		_id: couponId
	}, (err, coupon) => {
		if(err) {
			console.log(err);
			res.sendStatus(500);
			return;
    }    
		if(!coupon) {
			res.sendStatus(404);
			return;
    }    
		db.collection('coupons').updateOne(
			{_id: couponId},
			{$set: req.body},
			(err) => {
				if(err) {
					console.log(err);
					res.sendStatus(500);
					return;
				}
				res.sendStatus(200);
      });      
  });  
});

app.delete('/coupon/:id', (req, res) => {
  db.collection('coupons').findOneAndDelete(
		{
			_id: ObjectId(req.params.id)
		}, (err, report) => {
			if(report.value === null) {
				res.sendStatus(404);
				return;
			}
			res.sendStatus(204);
		}
	);
});

app.post('/coupon/:id/redeem', (req, res) => {
  const couponId = ObjectId(req.params.id);
	db.collection('coupons').findOne({
		_id: couponId
	}, (err, coupon) => {
		if(err) {
			console.log(err);
			res.sendStatus(500);
			return;
    }
 
		if(!coupon) {
      res.status(404).json({"error":"coupone not exist"});
			return;
    }

		if(coupon.isRedeem) {
      res.status(400).json({"error":"coupone redeem already"});
			return;
    }    

		db.collection('coupons').updateOne(
			{_id: couponId},
			{$set: {"isRedeem": true}},
			(err) => {
				if(err) {
					console.log(err);
					res.sendStatus(500);
					return;
				}
				res.sendStatus(200);
      });      
  });  

});

app.get('/coupon/search/:code', (req, res) => {
	db.collection('coupons').findOne({
    code: req.params.code
  }, (err,coupon)=>{
    if (err){
      console.log(err);
      res.sendStatus(500);
      return;
    }

    if(!coupon) {
      res.status(404).json({"error":"coupone not exist"});
			return;
    }

    res.status(200).json(coupon);
  })
   
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));

