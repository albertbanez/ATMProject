var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var app = express();
var server = http.createServer(app);
var jsonParser = bodyParser.json()
var limits = {};

//deposit money function
app.post('/atm/deposit/',jsonParser, function (req, res) {
    for (var key in req.body) {
        if (key in limits){
            limits[key] = limits[key] + req.body[key]; 
        }
        else{
            limits[key] = req.body[key];
        }
    }

    res.send("Deposit Done.");
});

//check atm money function
app.get('/atm/checkmoney/',jsonParser, function (req, res) {
    res.send(limits);
});

//withdraw money function
app.post('/atm/withdraw/',jsonParser, function (req, res) {
    var withdrawAmount = req.body.amount;

    let getMoney = (amount, limits) => {
        let recur = (amount, nominals) => {
            if (amount == 0) return {}; // success
            if (!nominals.length) return; // failure
            let nominal = nominals[0];
            let count = Math.min(limits[nominal], Math.floor(amount / nominal));
            for (let i = count; i >= 0; i--) {
                let result = recur(amount - i*nominal, nominals.slice(1));
                if (result) return i ? { [nominal]: i, ...result } : result;
            }
        }
        return recur(amount, Object.keys(limits).map(Number).sort((a,b) => b - a));
    };
    
    var result = getMoney(withdrawAmount, limits);

    if (result === undefined || result == {}){
        result = "ATM cannnot dispense the given amount.";        
    }
    else{
        //deduct money from balance
        for (var key in limits) {
            if (limits.hasOwnProperty(key)) {
                if (key in result){
                    limits[key] = limits[key] - result[key]; 
                }
            }
        }
    }

    res.send(result);
});


server.listen(80,function(){ 
    console.log("Server listening on port: 80");
});