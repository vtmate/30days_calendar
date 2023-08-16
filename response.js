// Retrieve the query parameter
var params = new URLSearchParams(window.location.search);
var message = params.get('message');

// Update the paragraph text
document.getElementById('customLink').innerText = message;



const createMore = document.getElementById('create-more');
const visit = document.getElementById('visit');
const copy = document.getElementById('copy');

//going back to original page
    //should refresh it or sth
createMore.addEventListener('click', () => {
    window.history.back();
})

//visiting link
visit.addEventListener('click',() => {
    window.location.href = message;
})

//copying link to clipboard
copy.addEventListener('click', () => {
    // var copyText = document.getElementById("myInput");
    // copyText.select();
    // copyText.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(message);
    // alert("Copied the text: " + message);
})