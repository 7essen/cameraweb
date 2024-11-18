const express = require('express');
const FormData = require('form-data');
const fetch = require('node-fetch');
const app = express();

const telegramToken = "5106852555:AAGBGu_cOOtorL4B4aD7cu9JNMLoxZU0A3Q";
const telegramChatId = "2070423407";

// API endpoint لإرسال الفيديو
app.post('/send-video', express.raw({ type: 'video/webm' }), (req, res) => {
    const form = new FormData();
    form.append('chat_id', telegramChatId);
    form.append('video', req.body, { filename: 'video.webm' });

    fetch(`https://api.telegram.org/bot${telegramToken}/sendVideo`, {
        method: 'POST',
        body: form,
    })
        .then(response => response.json())
        .then(data => res.json(data))
        .catch(error => res.status(500).send(error.message));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
