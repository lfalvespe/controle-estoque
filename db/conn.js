const mongoose = require('mongoose')

mongoose.set('returnDocument', 'after')

let cachedConnection = null
let cachedPromise = null

async function connectDB() {
    if (cachedConnection) {
        return cachedConnection
    }

    const uri = process.env.MONGODB_URI

    if (!uri) {
        throw new Error('MONGODB_URI nao configurada no ambiente')
    }

    if (!cachedPromise) {
        cachedPromise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000
        })
    }

    cachedConnection = await cachedPromise
    console.log('Conectado ao MongoDB com Mongoose')
    return cachedConnection
}

module.exports = connectDB

