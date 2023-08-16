// Retrieve the query parameter
var params = new URLSearchParams(window.location.search);
var message = params.get('message');

// Update the paragraph text
// document.getElementById('customLink').innerText = message;

//ezek a nevek így nem igazak, csak a sima response oldallal való hasónlóság miatt hagyom így
const backButton = document.getElementById('create-more');
const forwardButton = document.getElementById('visit');

//going back to change the chosen dates
backButton.addEventListener('click', () => {
    window.history.back();
})

//visit results
forwardButton.addEventListener('click',() => {
    window.location.href = message;
})