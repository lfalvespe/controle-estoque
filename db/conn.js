const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/testemongoose'

mongoose.set('returnDocument', 'after')

async function main() {
    
    try {
       await mongoose.connect(uri)
       console.log('Conectado ao MongoDB com Mongoose')
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error)
    }
}

main()

module.exports = mongoose;  

