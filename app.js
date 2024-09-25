require('dotenv').config()
const express = require('express');
const axios = require('axios');
const cors = require('cors')
const rateLimit = require("express-rate-limit")
const PORT = process.env.PORT || 5000;
const app = express();

const API_URL = 'https://v6.exchangerate-api.com/v6/';
const API_KEY = process.env.EXCHANGE_RATE_API_KEY

const apiLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 100
});

// Cors options
const corsOption = {
    origin: '*',
}
// const corsOption = {
//     origin: 'http://localhost:5173',
// }

// middlewares
app.use(express.json());
app.use(apiLimiter);
app.use(cors(corsOption));

// Conversion
app.get('/', (req,res)=>{
    res.send('Currency Converter API')
});

app.post('/api/convert', async (req,res)=>{
    try {
        const {from, to, amount} = req.body
        console.log({from, to, amount})
        // Construct API
        const url = `${API_URL}/${API_KEY}/pair/${from}/${to}/${amount}`
        const response = await axios.get(url);
        if (response.data && response.data.result === "success") {
            res.json({
                base: from,
                target: to,
                conversionRate: response.data.conversion_rate,
                convertedAmount: response.data.conversion_result,
            })
        } else {
            res.json({message: "Error converting currency", details: response.data})
        }
    } catch (error) {
        res.json({message: "Error converting currency", details: error.message})
    }
})

//production script
app.use(express.static('../frontend/dist'));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
});

//Start server
app.listen(PORT,
    console.log(`server is running on port ${PORT}...`)
)