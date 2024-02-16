const express = require('express')
const pool = require('./connection.js')

const app = express()

app.use(express.json())


//função de validação

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
app.get('/phones', async(req,res)=>{
    // const query = 
    const result = await pool.query(`SELECT p.phone_id,p.phone,u.name  from phones as p join usuario as u on id_phone_user = user_id; `)
    res.send(result.rows).status(200)
})

app.get('/phones/:id', async(req,res)=>{
    const query = `SELECT p.phone_id, p.phone,u.name  from phones as p join usuario as u on id_phone_user = user_id where id_phone_user = $1; `
    const param = [req.params.id]
    const result = await pool.query(query,param)
    if(result.rows.length>0){
        res.status(200).send(result.rows)
    }else{
        res.status(404).send("message: Telefone do usuario não encontrado")
    }
})


//ADICIONAR DADOS NO DB
app.post('/usuarios',async(req,res)=>{ 
     const email = req.body.email
     const name = req.body.name
     const phone = req.body.phone

     if(phone && email && name){
            const usuario = email.substring(0, email.indexOf("@"));
            const dominio = email.substring(email.indexOf("@")+ 1, email.length);
            if ((usuario.length >=1) &&
                (dominio.length >=3) &&
                (usuario.search("@")==-1) &&
                (dominio.search("@")==-1) &&
                (usuario.search(" ")==-1) &&
                (dominio.search(" ")==-1) &&
                (dominio.search(".")!=-1) &&
                (dominio.indexOf(".") >=1)&&
                (dominio.lastIndexOf(".") < dominio.length - 1) &&
                phone.length>8){
                    
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
                    res.send("Dados inválidos!").status(400)
                }
            
            }else if(name && email){
                const query = `insert into usuario (name,email) values ($1, $2)`
                const params = [name,email]
                const result= await pool.query(query,params)
                res.status(201).send(result)  
            }
})

app.post('/phones/:id', async(req,res)=>{
    const phone = req.body.phone
    const phone_user_id = req.params.id
    if(phone.length>8){
        const query = `insert into phones (phone , id_phone_user) values ($1,$2); `
        const params = [phone,phone_user_id]
        const result = await pool.query(query,params)
        res.status(201).send(result)
    }else{
        res.send("message: Entrada inválida!").status(400)
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



app.put('/phones/:id',async(req,res)=>{
   const query =` SELECT phone_id FROM phones
    where phone_id =$1;`
    const paramId = [req.params.id]
    const result = await pool.query(query,paramId)
    if(result.rows.length<0){
        res.send("Telefone de usuario não encontrado!")
    }else{
        const phone = req.body.phone
        const queryUpdate = `UPDATE phones set phone = $1 where phone_id = $2`
        const params = [phone,req.params.id]
        const result =await pool.query(queryUpdate,params)
        if(result.rowCount>0){
            res.send("Telefone atualizado com sucesso!").status(200)
    
        }else{
            res.send("Erro na atualização!")
        }     
    }
})


//DELETAR DADO ESPECIFICO DO DB
app.delete('/usuarios/:id',async (req,res)=>{
    const deleteQuery = ` delete from usuario where user_id = $1`
    const result = await pool.query(deleteQuery,[req.params.id])
    if(result.rowCount>0){
        res.send("Usuario deletado com sucesso!").status(200)

    }else{
        res.send("Usuário não encontrado!")
    }
})

app.delete('/phones/:id', async(req,res)=>{
    const deleteQuery = 'delete from phones where phone_id=$1;'
    const result = await pool.query(deleteQuery,[req.params.id])
    if(result.rowCount>0){
        res.send("Telefone deletado com sucesso!").status(200)

    }else{
        res.send("Telefone não encontrado!")
    }
    
})


app.listen(3000,()=>console.log("escutando na porta 3000"))

