const body = {
    "appId": "83fe3dd3-3a91-4243-b3a4-a7ffa8f18c35",
    "audience": { "email": "testnotif@gmail.com" },
    "notification": {
        "titleText": "Hello There",
        "bodyText": "This is just a test..."
    }
}

let response = await fetch('https://api.adalo.com/notifications', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 8wmmvvcf0in5jm2cfmm4izbw4',
    },
});