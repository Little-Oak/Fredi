import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL:"https://rtd-ict-1-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(appSettings);
const database = getDatabase(app);
const inventory = ref(database, "Inventory_Items")

const labelFieldEl = document.getElementById("Label-field");
const dateFieldEl = document.getElementById("Date-field");
const addButtonEl = document.getElementById("add-button");
const searchButtonEl = document.getElementById("search-button");
const quantFieldEl = document.getElementById("Quant-field");
const categoryFieldEl = document.getElementById("Category-field");
const invListEl = document.getElementById("inv_list");
const searchFieldEl = document.getElementById("Search-field");
const humFieldEl = document.getElementById("Humcrit-field");
const tempFieldEl = document.getElementById("Tempcrit-field");
const dueFieldEl = document.getElementById("Due-field");
const settingsButtonEl = document.getElementById("set-button");
var dueDateLimit = 0;
const clicky = new Audio('./RTD_auds/zapsplat_multimedia_button_click_004_68776.mp3');
// document.querySelector("add-button").addEventListener("click",handleClick);

addButtonEl.addEventListener("click",function(){
    //alert('it work');
    playSound();
    let inlabel = labelFieldEl.value;
    let datelabel = dateFieldEl.value;
    let quantlabel = quantFieldEl.value;
    let catlabel = categoryFieldEl.value;

    if (!inlabel || !datelabel || !quantlabel || !catlabel) {
        // Show an alert or handle the case where input values are empty
        alert('Please fill in all the fields');
        return;
    }

    let item = {
        label: inlabel,
        quantity: quantlabel,
        expirydate: datelabel,
        category: catlabel,
    }

    push(inventory, item);
    
    clearField();
});

searchButtonEl.addEventListener("click",function(snapshot){
    playSound();
    let searchval = searchFieldEl.value;

    onValue(inventory, function (snapshot) {
        let inv_array = Object.values(snapshot.val());

        ClearinvListEL();

        if (searchval !== "") {
            // Filter and sort the inventory items by expiration date in descending order
            inv_array = inv_array
                .filter(item => item.category === searchval)
                .sort((a, b) => new Date(a.expirydate) - new Date(b.expirydate));

            for (let i = 0; i < inv_array.length; i++) {
                appendlis(inv_array[i].label, inv_array[i].quantity, inv_array[i].expirydate, inv_array[i].category);
            }
        }
        else{
            onValue(inventory, function(snapshot) {
                let inv_array = Object.values(snapshot.val());
            
                // Sort the inventory items by expiration date in ascending order
                inv_array.sort((a, b) => new Date(a.expirydate) - new Date(b.expirydate));
            
                for (let i = 0; i < inv_array.length; i++){
                    appendlis(inv_array[i].label, inv_array[i].quantity, inv_array[i].expirydate, inv_array[i].category);
                }
            
                // Highlight items with expiration date within 7 days
                //console.log(Object.values(snapshot.val()));
                //const today = new Date();
                //console.log(today);
            });
        }
    });
    
});

settingsButtonEl.addEventListener("click", function(){
    playSound();
    let humlim = humFieldEl.value;
    let templim = tempFieldEl.value;
    let duelim = dueFieldEl.value;
    if (!humlim || !templim || !duelim) {
        // Show an alert or handle the case where input values are empty
        alert('Please fill in all the fields');
        return;
    }
    set(ref(database,"Sensdat/humlim"),humlim);
    set(ref(database,"Sensdat/temlim"),templim);
    set(ref(database,"Sensdat/duelim"),duelim);
    clearFField();
    onValue(inventory, function(snapshot) {
        let inv_array = Object.values(snapshot.val());
        if(inv_array.length === 0){
            console.log("");
        }
        else{
            inv_array.sort((a, b) => new Date(a.expirydate) - new Date(b.expirydate));
    
            ClearinvListEL();
    
            for (let i = 0; i < inv_array.length; i++){
                appendlis(inv_array[i].label, inv_array[i].quantity, inv_array[i].expirydate, inv_array[i].category);
            }
    
        // Highlight items with expiration date within 7 days
        //console.log(Object.values(snapshot.val()));
        //const today = new Date();
        //console.log(today);
        }
    });
});

onValue(ref(database, "Sensdat"), function(snapshot) {
    let humlim = snapshot.child("humlim").val();
    let templim = snapshot.child("temlim").val();
    let duelim = snapshot.child("duelim").val();
    dueDateLimit = duelim;
    if(parseInt(humlim) <= snapshot.child("humidity").val()){
        set(ref(database,"Sensdat/humcrit"),true);
    }else{
        set(ref(database,"Sensdat/humcrit"),false);
    }
    if(parseInt(templim) <= snapshot.child("temperature").val()){
        set(ref(database,"Sensdat/tempcrit"),true);
    }else{
        set(ref(database,"Sensdat/tempcrit"),false);
    }
    humFieldEl.placeholder = `Humidity Limit: ${humlim || 'Not set'}`;
    tempFieldEl.placeholder = `Temperature Limit: ${templim || 'Not set'}`;
    dueFieldEl.placeholder = `Due Limit: ${duelim || 'Not set'}`;
});

onValue(inventory, function(snapshot) {
    let inv_array = Object.values(snapshot.val());
    if(inv_array.length === 0){
        console.log("");
    }
    else{
        inv_array.sort((a, b) => new Date(a.expirydate) - new Date(b.expirydate));

        ClearinvListEL();

        for (let i = 0; i < inv_array.length; i++){
            appendlis(inv_array[i].label, inv_array[i].quantity, inv_array[i].expirydate, inv_array[i].category);
        }

    // Highlight items with expiration date within 7 days
    //console.log(Object.values(snapshot.val()));
    //const today = new Date();
    //console.log(today);
    }
});

// function isExpired(expirationDate) {
//     const today = new Date();
//     const parsedExpirationDate = new Date(expirationDate);

//     // Compare the expiration date with today's date
//     return today > parsedExpirationDate;
// }

function isExpired(expirationDate) {
    const today = new Date();
    const parsedExpirationDate = new Date(expirationDate);
    const dueDate = new Date(parsedExpirationDate);
    dueDate.setDate(parsedExpirationDate.getDate() - dueDateLimit);

    // Compare the due date with today's date
    return today > dueDate;
}

function appendlis(inlab, quantlab, datelab, catlab) {
    let item = {
        label: inlab,
        quantity: quantlab,
        expirydate: datelab,
        category: catlab,
    };

    // Create a new table row (tr) element
    let newTr = document.createElement("tr");

    // Create new table data (td) elements for each value
    let labelTd = document.createElement("td");
    labelTd.textContent = item.label;

    let quantTd = document.createElement("td");
    quantTd.textContent = item.quantity;

    let dateTd = document.createElement("td");
    dateTd.textContent = item.expirydate;

    let catTd = document.createElement("td");
    catTd.textContent = item.category;

    if (isExpired(item.expirydate)) {
        newTr.classList.add("expired");
    }

    newTr.appendChild(labelTd);
    newTr.appendChild(quantTd);
    newTr.appendChild(dateTd);
    newTr.appendChild(catTd);

    newTr.addEventListener("dblclick", function () {
        playSound();
        // Assuming you have the key of the item
        // If not, you need to find a way to identify the item uniquely
        let itemKey = findItemKey(item);

        if (itemKey) {
            let itemRef = ref(database, `Inventory_Items/${itemKey}`);
            remove(itemRef)
                .then(() => {
                    // Define expiredItems before using it
                    const expiredItems = findExpiredItems();
                    // After removal, push the new items
                    if (expiredItems.length === 0){
                        console.log("empty");
                    }
                    else{
                        for (let i = 0; i < expiredItems.length; i++) {
                        let input = expiredItems[i];
                        let expiredItemRef = ref(database, `ExpiredItems/${i}`);
                        set(expiredItemRef, input.label);
                        }
                    }
                    
                })
                
                .catch(error => {
                    console.error("Error removing item from Inventory_Items:", error);
                });
        } else {
            console.error("Item key not found or invalid.");
        }
    });

    invListEl.appendChild(newTr);
}



function findExpiredItems() {
    const expiredItems = [];

    onValue(inventory, function (snapshot) {
        let inv_array = Object.values(snapshot.val());

        if(inv_array.length === 0){
            console.log("Empty");
        }
        else{
            for (let i = 0; i < inv_array.length; i++) {
                const item = inv_array[i];
                const expirationStatus = isExpired(item.expirydate);
    
                if (expirationStatus) {
                    // Collect details of expired item
                    const expiredItemDetails = {
                        label: item.label,
                        expirydate: item.expirydate,
                    };
    
                    // Add expired item details to the array
                    expiredItems.push(expiredItemDetails);
                }
            }
        }
    });

    // Return the array of expired items
    return expiredItems;
}

function pushExpI(expiredItems) {
    // Get a reference to the "ExpiredItems" node
    const expiredItemsRef = ref(database, "ExpiredItems");
    if (expiredItems.length === 0){
        console.log("empty");
    }
    // Remove all existing items in "ExpiredItems"
    else{
        remove(expiredItemsRef)
        .then(() => {
            // After removal, push the new items
            for (let i = 0; i < expiredItems.length; i++) {
                let input = expiredItems[i];
                let itemRef = ref(database, `ExpiredItems/${i}`);
                set(itemRef, input.label);
            }
            set(ref(database, `ExpiredItemslen`), expiredItems.length);
        })
        .catch(error => {
            console.error("Error removing items from ExpiredItems:", error);
        });
    }
}

// DEBUGGER
//Function to handle the array of expired items
// function handleExpiredItems(expiredItems) {
//     // Process the array of expired items as needed
//     console.log("Expired Items:", expiredItems);
//     console.log(expiredItems.length);
//     // You can perform additional actions, such as displaying a message, sending notifications, etc.
// }

// Example usage: Call findExpiredItems at regular intervals
setInterval(function () {
    const expiredItemsArray = findExpiredItems();
    pushExpI(expiredItemsArray);
    //handleExpiredItems(expiredItemsArray);
}, 5000);
// Helper function to find the key of the item in the database
function findItemKey(item) {
    // Assuming the keys are unique identifiers
    // Adjust this function based on your database structure and how you identify items
    // This is just a simple example, you may need to enhance it depending on your data model
    let newvar = "empty"
    onValue(inventory, function(snapshot) {
        let inv_array = Object.values(snapshot.val());
    for (let i = 0; i < inv_array.length; i++) {
        if (
            item.label === inv_array[i].label &&
            item.quantity === inv_array[i].quantity &&
            item.expirydate === inv_array[i].expirydate &&
            item.category === inv_array[i].category
        ) {
            // CHECKER
            //console.log(Object.keys(snapshot.val())[i]);
            newvar = String(Object.keys(snapshot.val())[i]);
        }
    }
    });
    
    return newvar; // Return null if the item key is not found
}

function ClearinvListEL(){
    invListEl.innerHTML = '<tr>\
    <th>Item Name</th>\
    <th>Quantity</th>\
    <th>Expiration Date</th>\
    <th>Categroy</th>\
  </tr>'
}

function clearField(){
    //clears the input boxes for next input

    labelFieldEl.value = "";
    dateFieldEl.value = "";
    quantFieldEl.value = "";
    categoryFieldEl.value = "";
}

function clearFField(){
    //clears the input boxes for next input

    humFieldEl.value = "";
    dueFieldEl.value = "";
    tempFieldEl.value = "";
}

function playSound() {
    // Check if the audio element is supported by the browser
    if (clicky && typeof clicky.play === 'function') {
        // Play the sound
        clicky.play();
    }
}



// LEGACY CODE

// function appendls(inlab, quantlab, datelab, catlab){
//     ClearinvListEL();

//     invListEl.innerHTML +=
//     `<tr>\
//     <td>${inlab}</td>\
//     <td>${quantlab}</td>\
//     <td>${datelab}</td>\
//     <td>${catlab}</td>\
//     </tr>`;
// }
  
// function compareDates(today, expirydate2) {
//     const parsedDate1 = new Date(today);
//     const parsedDate2 = new Date(expirydate2);
  
//     // Compare the dates
//     if (parsedDate1 < parsedDate2) {
//       return true; // date1 is earlier than date2
//     } else{
//       return false; // date1 is later than date2
//     }
//   }
