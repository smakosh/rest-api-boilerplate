if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

module.exports = {
    mongoURI: process.env.MONGO_URI,
    secret_key: process.env.SECRET_KEY
}