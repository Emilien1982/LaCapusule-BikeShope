const stripe = require('stripe')('sk_test_51J164oAfrlmqxkAXQuOmCXameFfJEz6PfoaybAJwY2E0KI0HDM0INST1RgPAo7qFHtDSIcR7jV2g3XcnAlZjsGc500XiMbMhQs');

var express = require('express');
var router = express.Router();

let DOMAIN_NAME = '';



var dataBike = [
  {name:"BIK045", url:"/images/bike-1.jpg", price:679},
  {name:"ZOOK07", url:"/images/bike-2.jpg", price:999},
  {name:"TITANS", url:"/images/bike-3.jpg", price:799},
  {name:"CEWO", url:"/images/bike-4.jpg", price:1300},
  {name:"AMIG039", url:"/images/bike-5.jpg", price:479},
  {name:"LIK099", url:"/images/bike-6.jpg", price:869},
]


/* GET home page. */
router.get('/', function(req, res, next) {
  DOMAIN_NAME = req.protocol + '://' + req.get('host');
  //console.log(DOMAIN_NAME);
  if(req.session.dataCardBike == undefined){
    req.session.dataCardBike = []
  }
  
  res.render('index', {dataBike:dataBike});
});

router.get('/shop', function(req, res, next) {

  var alreadyExist = false;

  for(var i = 0; i< req.session.dataCardBike.length; i++){
    if(req.session.dataCardBike[i].name == req.query.bikeNameFromFront){
      req.session.dataCardBike[i].quantity = Number(req.session.dataCardBike[i].quantity) + 1;
      alreadyExist = true;
    }
  }

  if(alreadyExist == false){
    req.session.dataCardBike.push({
      name: req.query.bikeNameFromFront,
      url: req.query.bikeImageFromFront,
      price: req.query.bikePriceFromFront,
      quantity: 1
    })
  }


  res.render('shop', {dataCardBike:req.session.dataCardBike});
});

router.get('/delete-shop', function(req, res, next){
  
  req.session.dataCardBike.splice(req.query.position,1)

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})

router.post('/update-shop', function(req, res, next){
  
  var position = req.body.position;
  var newQuantity = req.body.quantity;

  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})

/* CHECKOUT route */
router.post('/create-checkout-session', async(req, res) => {
  const items = [];
  const card = req.session.dataCardBike;
  for (let i = 0; i < card.length; i++) {
    items.push(
      {
        'price_data': {
          'currency': 'eur',
          'product_data': {
            'name': card[i].name,
            'images': `${DOMAIN_NAME}${[card[i].url]}`,
          },
          'unit_amount': card[i].price * 100,
        },
        'quantity': card[i].quantity
      }
    )
  };
  console.log('TTTEEESSSTTT : ', items[0].price_data.product_data.images);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items,
    mode: 'payment',
    success_url: `${DOMAIN_NAME}/success`,
    cancel_url: `${DOMAIN_NAME}/cancel`,
  });
  //console.log(session.id);
  res.json({ id: session.id });
});

router.get('/success', (req, res) => {
  res.render('success');
});

router.get('/cancel', (req, res) => {
  res.render('cancel');
});


module.exports = router;
