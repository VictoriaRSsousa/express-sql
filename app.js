const express = require('express')

const pool = require('./connection.js')

const app = express()

app.use(express.json())




//LER DADOS DO DB
app.get('/usuarios',async (req,res)=>{
    const result = await pool.query(`
    SELECT u.user_id, u.name, u.email, 
    COUNT(p.phone) AS phones
    FROM usuario AS u
    LEFT JOIN phones AS p ON u.user_id = p.id_phone_user 
    GROUP BY u.user_id, u.name, u.email;`)
    res.status(200).send(result.rows)
  
})


//LER UM DADO ESPECIFICO DO DB
app.get('/usuarios/:id',async(req,res)=>{
        const query = `
        SELECT u.user_id, u.name, u.email, 
        COUNT(p.phone) AS phones
        FROM usuario AS u
        LEFT JOIN phones AS p ON u.user_id = p.id_phone_user 
        where u.user_id =$1
        GROUP BY u.user_id, u.name, u.email;`
        const param = [req.params.id]
        const result = await pool.query(query,param)
        if(result.rows.length>0){
            res.status(200).send(result.rows)
        }else{
            res.status(404).send("message: Usuario não encontrado")
        }
})

// app.get('/usuarios', async(req,res)=>{
//     const {pa1,pa2} =  req.query
//     console.log(pa1)
//     console.log(pa2)
//     res.send(pa1,pa2).status(500)
// })


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
            await client.query(
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
     }

})


//atualizar telefones!!!!!!!!
//ATUALIZAR DADO ESPECIFICO DO DB

app.put('/usuarios/:id',async(req,res)=>{
    const query = `
    SELECT user_id FROM usuario
    where user_id =$1;`
    const paramId = [req.params.id]
    const result = await pool.query(query,paramId)
    if(result.rows.length>0){
        const email = req.body.email
        const name = req.body.name
        if(name){
            const query = `UPDATE usuario SET name = $1 where user_id = $2;`
            const param = [name,req.params.id]
            await pool.query(query,param)
            
        }
        if(email) {
            const query = `UPDATE usuario SET email = $1 where user_id = $2;`
            const param = [email,req.params.id]
            await pool.query(query,param)
        }
        res.status(200).send(`Usuario atualizado com sucesso!! `)
    }else{
        res.status(404).send("message: Usuario não encontrado")
    }
})


//DELETAR DADO ESPECIFICO DO DB
app.delete('/usuarios/:id',async (req,res)=>{
    const deleteQuery = ` delete from usuario where user_id = $1`
    await pool.query(deleteQuery,[req.params.id])
    res.send(`Usuario deletado com sucesso!`).status(200)
})


app.listen(3000,()=>console.log("escutando na porta 3000"))

