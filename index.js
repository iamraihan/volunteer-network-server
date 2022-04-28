const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

const jwt = require('jsonwebtoken');

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.d5mhv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

async function run() {
    try {
        await client.connect();
        const volunteerCollection = client.db("volunteerNetwork").collection("volunteer")

        app.post('/login', (req, res) => {
            const email = req.body
            const token = jwt.sign(email, process.env.USER_ACCESS_TOKEN);
            res.send({ token })


        })


        app.post('/volunteer', async (req, res) => {
            const volunteer = req.body
            const tokenInfo = req.headers.authorization
            const [email, accessToken] = tokenInfo.split(" ")
            const decoded = verifyToken(accessToken)
            console.log(decoded)

            if (email === decoded.email) {
                const result = await volunteerCollection.insertOne(volunteer);
                res.send({ Success: 'Product upload successfully' })
            } else {
                res.send({ Success: 'UnAuthorized Access' })
            }

        })
        app.get('/volunteer', async (req, res) => {
            const query = {}
            const cursor = volunteerCollection.find(query)
            const volunteer = await cursor.toArray()
            res.send(volunteer)
        })

    }
    finally { }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Volunteer Network')
})

app.listen(port, () => {
    console.log('This is volunteer network', port)
})

function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.USER_ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            email = 'Invalid Email'
        } if (decoded) {
            console.log(decoded)
            email = decoded
        }
    });
    return email
}