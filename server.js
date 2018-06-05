const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const db = require('./config/keys').mongoURI

mongoose
    .connect(db)
    .then(() => console.log('mongoDB connected'))
    .catch(err => console.log(err))

// Passport middleware
app.use(passport.initialize())

// Passport config
require('./config/passport')(passport)

// routes
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`listening to requests on port: ${port}`))