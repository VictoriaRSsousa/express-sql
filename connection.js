
const {Pool} = require('pg')
const dotenv = require('dotenv').config()


const pool = new Pool({
    host:process.env.HOST_DB,
    user:process.env.USER_DB,
    port:process.env.PORT_DB,
    password:process.env.PASSWORD_DB,
    database:process.env.DATABASE_DB
    
})

module.exports = pool