const mysql = require('mysql2');
const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
app.use(cors());

//serving static files
app.use(express.static('public'));

//middleware that parses req.body into JSON
app.use(express.json());

//load environment variables from .env
require('dotenv').config();

//creating connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: '30days'
})

//connect
db.connect((err) => {
    if(err) console.log(err)
    else console.log('MySQL connected');

    // //getting all the data from DB
    // const query = 'SELECT * FROM events';
    // db.query(query, (err, res) =>{
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
        
    //     res.forEach((row) => {
    //         console.log('Name:', row.eventName);
    //         console.log('Number:', row.hours);
    //         console.log('-------------------');
    //       });
    //     //szóval: ez akkor fut le amikor elindul az egesz cuccos -> ja várjunk, mivel innen küldöm az összes adatot, ezért erre lehet nincs is szükségem ittxd
    //     //db.end()
    // })
})

// const links = []
//ezt fel kellene tölteni az adatbázisból amikor újraindul az
    //(ha folyamatosan megy a szerver akkor lehet, hogy nincsen ilyen probléma)
//ezt itt nem fogom kezelni -> elég akkor hostolni a unique linkkel ellátott oldalt, amikor az létrejön -> igazából lehet, hogy el sem kell a linkeket tárolnom itt egy tömbbe

//!!!!!!!!!!!!!!!!!!!
var goodDays = []

//getting data from index.html and hosting dynamic.html
app.post('/getData', (req, result) => {

    goodDays = []
    const payload = req.body;
    // console.log(payload);

    //saving the datas to database
    const sql = "INSERT INTO events (eventName, hours, link) VALUES ?"
    const len = payload.hours.length
    for(var i = 0; i < len; i++){
        goodDays.push(payload.hours[i])
        var values = [[ payload.eventName, payload.hours[i], payload.link ]]
        console.log(values)
        db.query(sql,[values],function(err,res){
            if(err) console.log(err);
        })
    }

    console.log("linkkkk " + payload.link)
    //setting up hosting
    app.get( '/' + payload.link, (req, res) => {
        //res.send("kiraly vagy: " + payload.link)
        // var a = ''
        // for(var i = 0; i < len; i++){
        //     // a += toString(payload.hours[i])
        //     a += JSON.stringify(payload.hours[i]) + ' '
        // }

        // res.send(`<h1>choose the days good for you from:</h1>
        // <p>na</p>
        // ${a}
        // `)
        fs.readFile('dynamic.html', 'utf-8', (err, html) => {
            if (err) {
                res.status(500).send('Error reading HTML file');
                return;
            }
            // Replace the placeholder with dynamic data
            console.log('hoursrsrrss: ' + payload.hours)
            console.log(typeof(payload.hours))
            const processedHTML = html.replace('{{ dynamicData }}', JSON.stringify(payload.hours));
            console.log('hourjson: ' + JSON.stringify(payload.hours))
            console.log(typeof(JSON.stringify(payload.hours)))

            res.send(processedHTML)
        })

        //itt kell majd kezdenem valamit az adatokkal
        //innen fog felépülni maga a unqiue oldal
    })
})

//getting data from dynamic.html ans hosting result.html
app.post('/getResponse', (req, result) => {
    const payload = req.body;
    // console.log(payload);

    //saving the datas to database
    const sql = "INSERT INTO responses (link, day, name) VALUES ?"
    const len = payload.days.length
    for(var i = 0; i < len; i++){
        var values = [[ payload.link, payload.days[i], payload.name ]]
        console.log(values)
        db.query(sql,[values],function(err,res){
            if(err) console.log(err);
        })
    }

    console.log("linkkkk " + payload.link)
    //setting up hosting
    app.get( '/' + payload.link + '/result', (req, res) => {

        fs.readFile('result.html', 'utf-8', (err, html) => {
            if (err) {
                res.status(500).send('Error reading HTML file');
                return;
            }

            //itt most a dynamic data a mySQL-ből lekért adat lesz
            //lényegében ugyan azok az adatok napok kellenek ide, mint amiket megjelenítettünk a dynamic.html segítségével, mivel ezeket innen hostoljuk ezért ismertek (így igazából továbbra sincs értelme annak, hogy ezt tároljuk, hiszen hostoláskor ismert, és ha az nem szakad meg, akkor az egyszer már hostolt oldalak mindig is elérhetőek lesznek (ugye majd lehet törölni is kellene őket valahogy..., illetve backupnak meg mégiscsak kell, hogy el legyenek tárolva, hiszen leállás esetén csak a tárolt adatokból lehetne újra hostolni az összes élő unique linket))
            
            //saving the datas to database
            const sql = `SELECT day,name FROM responses WHERE link='${payload.link}'`

            db.query(sql, function (error, results, fields) {
                if (error) {
                    console.error('Error executing SQL query:', error);
                    return;
                }
                
                // const names = [];
                // const days = [];
                const responses = [];
                // Iterate through the 'results' array and extract days and names to form pairs
                results.forEach((row) => {
                const { day, name } = row;
                // days.push(day);
                // names.push(name);
                responses.push({ day, name });
            });
            // console.log(days);
            // console.log(names);
            console.log(responses)

            const processedHTML = html.replace('{{ dynamicData }}', JSON.stringify(responses)).replace('{{ dynamicData2 }}', JSON.stringify(goodDays));
            // const processedHTML = html.replace('{{ dynamicData }}', JSON.stringify(responses)).replace('{{ dynamicData2 }}', JSON.stringify(payload.days));
            // const processedHTML = html.replace('{{ dynamicData }}', datas);
            res.send(processedHTML)

            });
            
            // const len = payload.hours.length
            // for(var i = 0; i < len; i++){
            //     var values = [[ payload.eventName, payload.hours[i], payload.link ]]
            //     console.log(values)
            //     db.query(sql,[values],function(err,res){
            //         if(err) console.log(err);
            //     })
            // }
            
            
            // // Replace the placeholder with dynamic data
            // const processedHTML = html.replace('{{ dynamicData }}', JSON.stringify(payload.days));



            // res.send(processedHTML)
        })
    })
})

app.listen('5000',()=>{
    console.log('server started on port 5000');
})