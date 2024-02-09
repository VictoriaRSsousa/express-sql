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
    const result = await pool.query('SELECT * FROM usuario;')
    console.log(result.rows)
    res.status(200).send(result.rows)
  
})


//LER UM DADO ESPECIFICO DO DB
app.get('/usuarios/:id',async(req,res)=>{
    // const finBysId=users.filter((user)=>user.id===req.params.id)
    // console.log(finBysId)
    const query = 'SELECT * FROM usuario where user_id = $1;'
    const param = [req.params.id]
    const result = await pool.query(query,param)

    res.status(200).send(result.rows)
})


//ADICIONAR DADOS NO DB
app.post('/usuarios',(req,res)=>{ 
     const user = req.body
     const email = req.body.email
     const name = req.body.name

     
    // const findEmail = users.filter((i)=>i.email===user.email)
    // if(findEmail.length>0){
    //     res.status(208).send("Email já cadastrado")
    // }else{
    //     res.status(201).send(user)
    //     users.push(user)

    //     fs.writeFileSync("fakedb.json",usersjson,"utf-8");
    // }
    console.log(user.email)
    res.send(email)

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

