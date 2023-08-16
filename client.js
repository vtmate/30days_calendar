//mai dátum adatai:
var dt = new Date(); //mai dátum
// var dt = new Date("2023-07-26");
var currentDay = dt.getDate();
var month = dt.getMonth() + 1;
var year = dt.getFullYear();
var daysInCurrMonth = new Date(year, month, 0).getDate();

//CREATING BUTTON WITH EVENTLISTENER
// var button = document.createElement('button');
// button.addEventListener('click', () => {
//     console.log("clicked");
// });
// dayHolder.append(button);

var dayHolder = document.getElementById("dayHolder");
var chosen = [];

//OWN BUTTON CLASS
class DayButton{
    num;
    dayButton;
    isChosen;
    constructor(num){
        //this.num = num;
        this.isChosen = false;
        this.dayButton = document.createElement('button');
        this.dayButton.innerText = num;
        this.dayButton.classList.add("dayButton");
        this.dayButton.addEventListener('click', () => {
            //console.log(num);
            if(this.isChosen){
                this.isChosen = false;
                this.dayButton.classList.remove("chosen")
                chosen.pop(num);
            } else {
                this.isChosen = true;
                this.dayButton.classList.add("chosen")
                chosen.push(num);

                //lista lerendezése(elől a mostani hónap)
                const curDays = []
                const nextDays = [] //days in next month
                chosen.forEach(day => {
                    if(day >= currentDay) curDays.push(day);
                    else nextDays.push(day);
                })
                //sorting the two arrays
                curDays.sort(function(a, b){ return a - b});
                nextDays.sort(function(a, b){ return a - b});
                //concatenating them
                chosen = curDays.concat(nextDays);
                console.log('chosen: ' + chosen)
            }
            console.log(chosen);
            //localStorage.setItem("goodDays", chosen);
        });
    }

    get(){
        return this.dayButton;
    }
}

//hét napjainak hozzáadása
    //(amúgy ezeket lehet nem gombként kellene megcsinálni)

//calling the function where I also listen to window resize in order to make the text dynamic based on the window's width
const days = onResize();
for(var i = 0; i < 7; i++){
    var b = document.createElement('button');
    b.classList.add("dayOfWeek")
    b.classList.add("unclickable")
    b.innerText = days[i];
    dayHolder.append(b);
}

//naptól függően blink gombok beszúrása
const index = dt.getDay();
for(var i = 0; i < index - 1; i++){
    var blink = document.createElement('button');
    dayHolder.append(blink);
}

//aktuális hónap maradék napjainak kiiratása:
let counter = 0;
for(var i = currentDay; i <= daysInCurrMonth; i++){
    counter++;
    var b = new DayButton(i);
    dayHolder.append(b.get());
}
//következő hónap napjainak kiiratása úgy, hogy összesen 30 nap legyen (FEBRUÁR ESETÉN EZEN VÁLTOZTATNI KELL)

//lehet egyszerűbb lenne, és jobban is nézne ki, ha minden esetben kitöltenénk az 5 sort napokkal (nem kellenének blink gombok a végére)

for(var i = 1; i <= 30-counter; i++){
    var b = new DayButton(i);
    dayHolder.append(b.get());
}

//maradék hely kitöltése blink gombokkal (ha minden igaz ezen nem kell változtatni, ha február esetén is 30 napot iratunk ki)

var remain = 7 - index - 2;
// console.log('r: '+ remain);
if(index == 7) remain = 6;
for(var i = 0; i < remain; i++){
    var blink = document.createElement('button');
    dayHolder.append(blink);
}


//creating the custom link
    //should make this more safe...
function createLink(name){
    const num = Math.floor(Math.random() * 10); // 0-9
    //ezt szedtem ki, nem itt lesz generálvaa teljes url:
    // const link = 'http://localhost:5000/' + name + num.toString();
    // console.log(link);
    return name + num.toString();
}


//simplifying the name of the event
    //bc of spaces, accents
function simplifyName(name){
    const forbidden = [' ',]
    for(var i = 0; i < name.length; i++){
        // if(name.charAt(i) = ' ') 
        name = name.toLowerCase();
        switch(name.charAt(i)){
            case ' ':
                name = name.replace(' ','');
                i--;
                break;
                case 'á':
                    name = name.replace('á','a');
                    i--;
                    break;
                case 'é':
                    name = name.replace('é','e');
                    i--;
                    break;
                case 'í':
                    name = name.replace('í','i');
                    i--;
                    break;
                case 'ó':
                    name = name.replace('ó','o');
                    i--;
                    break;
                case 'ö':
                    name = name.replace('ö','o');
                    i--;
                    break;
                case 'ő':
                    name = name.replace('ő','o');
                    i--;
                    break;
                case 'ú':
                    name = name.replace('ú','u');
                    i--;
                    break;
                case 'ű':
                    name = name.replace('ű','u');
                    i--;
                    break;
                case 'ü':
                    name = name.replace('ü','u');
                    i--;
                    break;
        }
    }
    return name;
}

//sending data to the server for POSTING
const form = document.getElementById('form')

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(form)
    var name = formData.get('eventName')
    // console.log('simple->' + simplifyName(name))ű
    name = simplifyName(name)
    const link = createLink(name)
    console.log('name: ' + name)
    const datas = {
        eventName: name,
        hours: chosen,
        link: link
    };


    fetch('http://localhost:5000/getData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify( datas )
    })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.log(err))

    // fetch('response.html')
    // .then(response => response.text())
    // .then(html => {
    //     contentDiv.innerHTML = html;

    //     // Manipulate elements within the fetched HTML
    //     // const pageTitle = document.getElementById('pageTitle');
    //     // pageTitle.style.color = 'blue';
    //     const linkP = document.getElementById('customLink');
    //     linkP.innerText = link;
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    // });


    //setting up url with query parameter, so the page has access to it (it's the link)
    //yes, I could show this link on the same page where it's generated but it's more clean for me
        //full url here:
    var url = `response.html?message=http://localhost:5000/` + `${link}`;

    // Open the HTML file with the query parameter
    window.location.href = url;

})

//changing header's text in mobile view
function onResize() {
    if(window.innerWidth < 698){
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    } else {
        return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    }
}


//listening to window resizing
// onResize();
// window.onresize = onResize;
//ez így nem akar frissülni automatikusan sajna