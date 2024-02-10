const express = require('express')
const fs = require('fs')
const fakedb = require('./fakedb.json')

const pool = require('./connection.js')


const app = express()

app.use(express.json())

const leitura = fs.readFileSync('fakedb.json','utf-8') 

const users =JSON.parse(leitura)
const usersjson = JSON.stringify(users);




//LER DADOS DO DB
app.get('/usuarios',async (req,res)=>{
    const result = await pool.query(`
    SELECT u.user_id, u.name, u.email, 
    COUNT(p.phone) AS phones
    FROM usuario AS u
    LEFT JOIN phones AS p ON u.user_id = p.id_phone_user 
    GROUP BY u.user_id, u.name, u.email;`)
    console.log(result.rows)
    res.status(200).send(result.rows)
  
})


//LER UM DADO ESPECIFICO DO DB
app.get('/usuarios/:id',async(req,res)=>{
    const finBysId=users.filter((user)=>user.id===req.params.id)
    // console.log(finBysId)
    if(finBysId.length>0){
        const query = `
        SELECT u.user_id, u.name, u.email, 
        COUNT(p.phone) AS phones
        FROM usuario AS u
        LEFT JOIN phones AS p ON u.user_id = p.id_phone_user 
        where u.user_id =$1
        GROUP BY u.user_id, u.name, u.email;`
        const param = [req.params.id]
        const result = await pool.query(query,param)
    
        res.status(200).send(result.rows)
    }else{
        res.status(404).send("message: Usuario não encontrado")
    }

})


//ADICIONAR DADOS NO DB
app.post('/usuarios',async(req,res)=>{ 
     const email = req.body.email
     const name = req.body.name
     const phone = req.body.phone

     if(phone){
        const client = await pool.connect()
        const idPerson = await client.query(
            'insert into usuario (name,email) values ($1, $2) returning user_id;',
            [name, email]
            )
            console.log(idPerson.rows[0].user_id)
            const result = await client.query(
            'insert into phones (phone, id_phone_user) values ($1, $2);',
            [phone, idPerson.rows[0].user_id]
            )
            client.release() 
        res.send("criado").status(201)
     }else{
        const query = `insert into usuario (name,email) values ($1, $2)`
        const params = [name,email]
        const result= await pool.query(query,params)
        res.status(201).send(result)  
        console.log(result) 
     }

})

//ATUALIZAR DADO ESPECIFICO DO DB

app.put('/usuarios/:id',(req,res)=>{
    const finBysId=users.filter((user)=>user.id===req.params.id)

    if(finBysId.length){
        const newUser = req.body
        users[req.params.id-1] = newUser
        res.status(200).send(newUser)
        fs.writeFileSync("fakedb.json",usersjson,"utf-8");
    }else{
        res.status(404).send("message:ID requerido não encontrado")
    }
})


//DELETAR DADO ESPECIFICO DO DB
app.delete('/usuarios/:id',(req,res)=>{
    const finBysId=users.filter((user)=>user.id===req.params.id)
    console.log(finBysId)
     if(finBysId.length){
        const removed = users.splice(req.params.id-1,1)
        res.status(200).send(removed)
        fs.writeFileSync("fakedb.json",usersjson,"utf-8");
     }else{
        res.status(404).send("message:ID requerido não encontrado")
     }

})


app.listen(3000,()=>console.log("escutando na porta 3000"))

