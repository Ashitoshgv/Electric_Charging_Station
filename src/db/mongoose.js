// Imports
const mongoose = require('mongoose')

// Variables for different database connections
const atlas = 'mongodb+srv://zapshare:comp2930@zapshare-api-wylcv.mongodb.net/zapshare?retryWrites=true'
const local = 'mongodb://127.0.0.1:27017/evcssp-db'

// Configures mongoose. Connects to the database.
mongoose.connect(local, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})