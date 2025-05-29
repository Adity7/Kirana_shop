const nameInput = document.getElementById("candyName");
const descInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const quantityInput = document.getElementById("quantity");
const form = document.getElementById("candyForm");
const ul = document.querySelector("ul");
const searchInput = document.getElementById("search");
const submitButton = form.querySelector('button[type="submit"]');
let candies = [];
const REST_API = "https://crudcrud.com/api/6c728c0fc24543608a1ab2057d6dccc9/candies ";
let isEditMode = false;

/**
 * Add a new candy to the server
 * @param {Object} candy - The candy object to add
 */
async function addCandy(candy) {
    try {
        const response = await axios.post(REST_API, candy);
        candies.push(response.data);
        displayCandies(candies);
        showAlert("Candy added successfully!", "success");
        form.reset();
    } catch (error) {
        console.error("Failed to add candy:", error);
        showAlert("Failed to add candy. Please check console and server.", "error");
    }
}

/**
 * Update a candy on the server
 * @param {string} candyId - The ID of the candy to update
 * @param {Object} candyData - The updated candy data
 */
async function updateCandy(candyId, candyData) {
    try {
        await axios.put(`${REST_API}/${candyId}`, candyData);
        candies = candies.map(c => c._id === candyId ? { ...c, ...candyData } : c);
        displayCandies(candies);
        showAlert("Candy updated successfully!", "success");
        resetForm();
    } catch (error) {
        console.error("Failed to update candy:", error);
        showAlert("Failed to update candy. Please check console and server.", "error");
    }
}

/**
 * Delete a candy from the server
 * @param {string} candyId - The ID of the candy to delete
 */
async function deleteCandy(candyId) {
    try {
        await axios.delete(`${REST_API}/${candyId}`);
        candies = candies.filter(c => c._id !== candyId);
        displayCandies(candies);
        showAlert("Candy deleted successfully!", "success");
    } catch (error) {
        console.error("Failed to delete candy:", error);
        showAlert("Failed to delete candy. Please check console and server.", "error");
    }
}

/**
 * Buy a candy (reduce its quantity)
 * @param {string} candyId - The ID of the candy to buy
 * @param {number} amount - The amount to buy
 */
async function buyCandy(candyId, amount) {
    const candyToBuy = candies.find(c => c._id === candyId);
    if (!candyToBuy) {
        showAlert("Candy not found!", "error");
        return;
    }
    if (candyToBuy.quantity < amount) {
        showAlert(`Not enough stock! Only ${candyToBuy.quantity} available.`, "error");
        return;
    }
    try {
        // Create a copy of the candy object without the _id field
        const { _id, ...candyData } = candyToBuy;
        // Update only the quantity
        const updatedCandy = {
            ...candyData,
            quantity: candyToBuy.quantity - amount
        };
        // Send the updated candy without the _id field
        await axios.put(`${REST_API}/${candyId}`, updatedCandy);
        // Update local state
        candies = candies.map(c => c._id === candyId ? {...c, quantity: c.quantity - amount} : c);
        displayCandies(candies);
        showAlert(`Successfully purchased ${amount} ${candyToBuy.name}(s)!`, "success");
    } catch (error) {
        console.error("Buy failed:", error);
        showAlert("Failed to purchase candy. Please check console and server.");
    }
}

// ===== UI Functions =====

/**
 * Display the list of candies in the UI
 * @param {Array} candyList - The list of candies to display
 */
function displayCandies(candyList) {
    ul.innerHTML = '';
    if (candyList.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = searchInput.value ? 
            "No candies match your search." : 
            "No candies available. Add some!";
        emptyMessage.className = "empty-message";
        ul.appendChild(emptyMessage);
        return;
    }
    candyList.forEach(candy => {
        const li = document.createElement("li");
        li.setAttribute('data-candy-id', candy._id);
        li.innerHTML = `
            <span class="candy-name">${candy.name}</span> -
            <span class="candy-description">${candy.description}</span> -
            ₹<span class="candy-price">${candy.price.toFixed(2)}</span> -
            Qty: <span class="candy-quantity">${candy.quantity}</span>
        `;
        // Buy buttons - using regular buttons instead of a container to match original code
        [1, 2, 3].forEach(amount => {
            const btn = document.createElement("button");
            btn.textContent = `Buy ${amount}`;
            btn.disabled = candy.quantity < amount;
            btn.addEventListener("click", () => buyCandy(candy._id, amount));
            li.appendChild(btn);
        });
        // Action buttons
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => handleEditButtonClick(candy._id));
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            if (confirm(`Are you sure you want to delete ${candy.name}?`)) {
                 deleteCandy(candy._id);
             }
         });

         li.appendChild(editButton);
         li.appendChild(deleteButton);
        
         ul.appendChild(li);
     });
 }