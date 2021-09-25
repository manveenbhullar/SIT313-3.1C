const express = require("express")
const bodyParser = require("body-parser")
const https = require("https")
const mongoose = require('mongoose')
const validator = require('validator')

mongoose.connect("mongodb://localhost:27017/iServiceDB", { useNewUrlParser: true })

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
    //app.use(express.static("public"))

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.post("/", (req, res) => {
    const fname = req.body.fname
    const lname = req.body.lname
    const email = req.body.email
    const password = req.body.password
    const conpass = req.body.conpass
    const address = req.body.address
    const city = req.body.city
    const state = req.body.state
    const phone = req.body.phone

    if (!validator.equals(password, conpass)) {
        res.status(400).send("Password unmatched")
    } else {
        const newAccount = new Account({
            fname: fname,
            lname: lname,
            email: email,
            password: password,
            conpass: conpass,
            address: address,
            city: city,
            state: state,
            phone: phone,
        })
        newAccount
            .save()
            .catch((err) => console.log(err))

        if (res.statusCode === 200) {
            res.send("Added successfully!")
        } else {
            res.send("Failed!")
        }

        const data = {
            members: [{
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: fname,
                    LNAME: lname
                }
            }]
        }

        jsonData = JSON.stringify(data)

        const url = "https://us5.api.mailchimp.com/3.0/lists/1796f77f52"
        const options = {
            method: "POST",
            auth: "mishi:9b6e6c10e84124021a2fa545d6b86764-us5"
        }

        const request = https.request(url, options, (response) => {

            response.on("data", (data) => {
                console.log(JSON.parse(data))
            })
        })
        request.write(jsonData)
        request.end()
        console.log(fname, lname, email)
    }
})

app.listen(5000, (req, res) => {
    console.log("Server is running on port 5000")
})

const accountSchema = new mongoose.Schema({
    fname: {
        type: String,
        //required: true,
    },
    lname: {
        type: String,
        //required: true,
    },
    email: {
        type: String,
        //required: true,
        index: { unique: true },
        validate: [validator.isEmail, 'Invalid e-mail entered!'],
    },
    password: {
        type: String,
        //required: true,
        minlength: 8
    },
    conpass: {
        type: String,
        //required: true,
        minlength: 8
    },
    address: {
        type: String,
        //required: true
    },
    city: {
        type: String,
        //required: true
    },
    state: {
        type: String,
        //required: true
    },
    zip: Number,
    phone: {
        type: Number,
        maxlength: 12
    }
})

const Account = mongoose.model('Account', accountSchema)