const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()








const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kqc2p.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;














const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());





const port = 5000;


app.get('/', (req, res) => {
    res.send("It is working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

    const orderCollection = client.db("CreativeAgency").collection("orders");
    const reviewCollection = client.db("CreativeAgency").collection("reviews");
    const serviceCollection = client.db("CreativeAgency").collection("services");
    const adminCollection = client.db("CreativeAgency").collection("adminEmail");


    

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        console.log(order)
        orderCollection.insertOne(order)

            .then(result => {
                res.send(result.insertedCount > 0)
            })

    })



   




    app.post('/addReview', (req, res) => {
        const review = req.body;
        console.log(review);
        reviewCollection.insertOne(review)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })


    

    app.get('/orders', (req, res) => {

        orderCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


  

    app.get('/allOrders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    

    app.get('/reviews', (req, res) => {

        reviewCollection.find({}).sort({ _id: -1 }).limit(3)
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

   
    app.post('/addAService', (req, res) => {
        const file = req.files.file;
        const serviceTitle = req.body.serviceTitle;
        const description = req.body.description;

        const newImg = file.data
        const encImg = newImg.toString('base64');


        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ serviceTitle, description, image })
            .then(result => {

                res.send(result.insertedCount > 0)

            })



    })

    
    app.get('/getServices', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    
    app.post('/adminEmail', (req, res) => {
        const email = req.body;
        adminCollection.insertOne(email)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/checkAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, adminEmail) => {
                res.send(adminEmail.length > 0)
            })
    })





});

app.listen(process.env.PORT || port)