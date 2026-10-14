import express from 'express'
import mysql from 'mysql2/promise'
import { loginConfig, myConfig } from './configDatabase.js'
import cors from 'cors'


const app = express()
app.use(express.json())
app.use(cors())

let connection


try {
    connection = mysql.createPool(myConfig)
    await connection.execute('select 1')
    console.log("Sikeres adatbázis kapcsolódás");
    
} catch (error) {
    console.log('HIBAAAAAAAAAAAA',error)
    process.exit(1)
    
}

app.get('/todos',async (request,response)=>{
    try {
        const sql='select * from todolist order by timestamp'
        const [rows,fields]=await connection.execute(sql)
        //console.log(rows,fields);
        response.status(200).send(rows)
    } catch (error) {
        console.log(error);
        
    }
})
app.post('/todos',async (request,response)=>{
    const {task}=request.body
    try {
        const sql='insert into todolist (task) values(?)'
        await connection.execute(sql,[task])
        response.status(200).json({msg:'Sikeres hozzáadás!'})
    } catch (error) {
        console.log(error);
        
    }
})

app.patch('/todos/:id',async (request,response)=>{
    const {id}=request.params
    try {
        const sql='update todolist set complete=NOT complete WHERE id=?'
        const [rows]=await connection.execute(sql,[+id])
        console.log(rows, rows.affectedRows);
        response.status(200).json({msg:'Sikeres módosítás!'})
        
        
    } catch (error) {
        console.log(error);
        
    }
})

app.delete('/todos/:id',async (request,response)=>{
    const {id}=request.params
    try {
        const sql='delete from todolist where id=?'
        const [rows]=await connection.execute(sql,[+id])
        console.log(rows, rows.affectedRows);
        response.status(200).json({msg:'Sikeres törlés!'})
        
        
    } catch (error) {
        console.log(error);
        
    }

})

app.post('/todos/login', (req, res) => {
    const {username, password} = req.body
    if(username === loginConfig.username && password === loginConfig.password)
        res.json({success:true, msg: 'Sikeres volt a bejelentkezés'})
    else
        res.json({success:false, msg: 'Sikertelen volt a bejelentkezés.'})
})

const port = process.env.PORT || 8000
app.listen(port, () => console.log(`The server is avaible:  ${port}`))
