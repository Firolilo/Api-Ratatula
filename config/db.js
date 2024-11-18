const {ApolloServer} = require('apollo-server');
const mongoose = require('mongoose');

require('dotenv').config({path:'variables.env'});

const conectarDB = async ()=> {
    try{
        await mongoose.connect(process.env.MONGO_DB,{});
         console.log('MongoDB Connected Successfully!');
    } catch (error)
    {
        console.error(error);
        console.log(error.message);
    }
}

module.exports = conectarDB;