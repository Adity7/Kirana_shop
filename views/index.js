// --- Global Variables / DOM Element References (existing) ---
const REST_API = '/api/product';
const USER_API = '/api/users';

const nameInput = document.getElementById("candyName"); // Corrected ID to match HTML
const descInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const quantityInput = document.getElementById("quantity");
const form = document.getElementById("candyForm");
const ul = document.getElementById("candyList"); // Corrected ID to match HTML
const searchInput = document.getElementById("search");
const submitButton = form.querySelector('button[type="submit"]');
const formTitle = document.getElementById("formTitle");

let candies = [];
let isEditMode = false;
let currentEditCandyId = null;
let loggedInUserId = null;

// --- New DOM Element References for Buttons ---
const loginButton = document.getElementById('loginButton'); // Assuming you add an ID to the login button link/anchor
const signupButton = document.getElementById('signupButton'); // Assuming you add an ID to the signup button link/anchor
const logoutButton = document.querySelector('.logout-btn'); // Already exists

// --- Helper Functions (existing) ---
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.textContent = message;
        alertDiv.className = `alert ${type}`;
        alertDiv.style.display = 'block';
        setTimeout(() => {
            alertDiv.style.display = 'none';
            alertDiv.textContent = '';
        }, 3000);
    } else {
        console.warn('Alert message div not found. Message:', message);
    }
}

function resetForm() {
    form.reset();
    isEditMode = false;
    currentEditCandyId = null;
    submitButton.textContent = "Add Candy"; // Consistent naming
    if (formTitle) {
        formTitle.textContent = "Add New Candy";
    }
}

// --- Function to manage button visibility ---
function updateAuthButtonsVisibility() {
    // Hide login/signup if logged in, show logout
    if (loggedInUserId) {
        if (loginButton) loginButton.style.display = 'none';
        if (signupButton) signupButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'block'; // Or 'inline-block' depending on your CSS
    } else {
        // Show login/signup if not logged in, hide logout
        if (loginButton) loginButton.style.display = 'block'; // Or 'inline-block'
        if (signupButton) signupButton.style.display = 'block'; // Or 'inline-block'
        if (logoutButton) logoutButton.style.display = 'none';
    }
}

// --- Main API Interaction Functions (existing, with minor updates) ---

async function fetchCandies() {
    try {
        const productsResponse = await axios.get(REST_API);
        candies = productsResponse.data;

        // Fetch user info to determine login status
        const userResponse = await axios.get(`${USER_API}/me`);
        if (userResponse.data && userResponse.data.userId) {
            loggedInUserId = userResponse.data.userId;
            console.log("Logged in user ID:", loggedInUserId);
        } else {
            loggedInUserId = null;
            console.log("No user logged in or user ID not found.");
        }

        // --- IMPORTANT: Update button visibility after determining login status ---
        updateAuthButtonsVisibility();

        displayCandies(candies, loggedInUserId);
    } catch (error) {
        console.error("Failed to fetch candies or user info:", error);
        showAlert("Failed to load candies or user info. Please check console and server.", "error");

        // Even if fetching fails, update button visibility based on whether loggedInUserId was set
        updateAuthButtonsVisibility();

        displayCandies(candies, loggedInUserId);
    }
}

async function addCandy(candy) {
    console.log("Sending candy data:", { ...candy, userId: loggedInUserId });
    try {
        const response = await axios.post(REST_API, { ...candy, userId: loggedInUserId });
        console.log("Add candy response:", response.data);
        candies.push(response.data);
        displayCandies(candies, loggedInUserId);
        showAlert("Candy added successfully!", "success");
        resetForm();
    } catch (error) {
        console.error("Failed to add candy:", error);
        if (error.response) {
            if (error.response.status === 401) {
                showAlert("You must be logged in to add a product.", "error");
                window.location.href = '/login'; // Redirect to login on unauthorized
            } else if (error.response.status === 409) {
                showAlert(error.response.data.message, "error");
            } else {
                showAlert(`Failed to add candy: ${error.response.data?.message || error.response.statusText}`, "error");
            }
        } else if (error.request) {
            showAlert("No response from server. Please check your internet connection.", "error");
        } else {
            showAlert(`An unexpected error occurred: ${error.message}`, "error");
        }
    }
}

async function updateCandy(candyId, candyData) {
    try {
        await axios.put(`${REST_API}/${candyId}`, candyData);
        candies = candies.map(c => c.id === candyId ? { ...c, ...candyData } : c);
        displayCandies(candies, loggedInUserId);
        showAlert("Candy updated successfully!", "success");
        resetForm();
    } catch (error) {
        console.error("Failed to update candy:", error);
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) {
                showAlert("You are not authorized to update this product. Please log in as the owner.", "error");
                window.location.href = '/login'; // Redirect if unauthorized/forbidden
            } else {
                showAlert(`Failed to update candy: ${error.response.data?.message || error.response.statusText}`, "error");
            }
        } else {
            showAlert("Failed to update candy. Please check console and server.", "error");
        }
    }
}

async function deleteCandy(candyId) {
    try {
        await axios.delete(`${REST_API}/${candyId}`);
        candies = candies.filter(c => c.id !== candyId);
        displayCandies(candies, loggedInUserId);
        showAlert("Candy deleted successfully!", "success");
    } catch (error) {
        console.error("Failed to delete candy:", error);
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) {
                showAlert("You are not authorized to delete this product. Please log in as the owner.", "error");
                window.location.href = '/login'; // Redirect if unauthorized/forbidden
            } else if (error.response.status === 404) {
                showAlert("Candy not found for deletion.", "error");
            } else {
                showAlert(`Failed to delete candy: ${error.response.data?.message || error.response.statusText}`, "error");
            }
        } else {
            showAlert("Failed to delete candy. Please check console and server.", "error");
        }
    }
}

async function buyCandy(candyId, amount, currentUserId) {
    const candyToBuy = candies.find(c => c.id === candyId);
    if (!candyToBuy) {
        showAlert("Candy not found!", "error");
        return;
    }
    if (candyToBuy.quantity < amount) {
        showAlert(`Not enough stock! Only ${candyToBuy.quantity} available.`, "error");
        return;
    }
    try {
        const updatedQuantity = candyToBuy.quantity - amount;
        await axios.put(`${REST_API}/${candyId}/buy`, { quantity: updatedQuantity });
        showAlert(`Successfully purchased ${amount} ${candyToBuy.name}(s)!`, "success");
        fetchCandies(); // Re-fetch to ensure consistency and handle 0 quantity removal
    } catch (error) {
        console.error("Buy failed:", error);
        if (error.response) {
            if (error.response.status === 401) {
                 showAlert("You must be logged in to buy products.", "error");
                 window.location.href = '/login';
            } else if (error.response.status === 403) {
                 showAlert("You cannot buy your own product.", "error");
            } else {
                showAlert(`Failed to purchase candy: ${error.response.data?.message || error.response.statusText}`, "error");
            }
        } else {
            showAlert("Failed to purchase candy. Please check console and server.", "error");
        }
    }
}

// --- Display / Render Function (existing, with minor updates) ---
function displayCandies(candyList, currentUserId) {
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
        li.setAttribute('data-candy-id', candy.id);

        const isCreator = currentUserId && (candy.userId === currentUserId);

        let candyInfoHtml = `
            <span class="candy-name">${candy.name}</span> -
            <span class="candy-description">${candy.description}</span> -
            ₹<span class="candy-price">${parseFloat(candy.price).toFixed(2)}</span> -
            Qty: <span class="candy-quantity">${candy.quantity}</span>
        `;

        if (candy.creator && candy.creator.username) {
            candyInfoHtml += ` <span class="creator-info">(by ${candy.creator.username})</span>`;
        } else if (isCreator) {
            candyInfoHtml += ` <span class="creator-info">(Your Product)</span>`;
        }

        li.innerHTML = candyInfoHtml;

        if (!isCreator) {
            [1, 2, 3].forEach(amount => {
                const btn = document.createElement("button");
                btn.textContent = `Buy ${amount}`;
                btn.className = "buy-btn";
                btn.disabled = candy.quantity < amount;
                btn.addEventListener("click", () => buyCandy(candy.id, amount, currentUserId));
                li.appendChild(btn);
            });
        }

        if (isCreator) {
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "edit-btn";
            editButton.addEventListener("click", () => handleEditButtonClick(candy.id));
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";
            deleteButton.addEventListener("click", () => {
                if (confirm(`Are you sure you want to delete ${candy.name}?`)) {
                    deleteCandy(candy.id);
                }
            });

            li.appendChild(editButton);
            li.appendChild(deleteButton);
        }

        ul.appendChild(li);
    });
}

// --- Edit Form Handler (existing) ---
function handleEditButtonClick(candyId) {
    const candyToEdit = candies.find(c => c.id === candyId);
    if (candyToEdit) {
        nameInput.value = candyToEdit.name;
        descInput.value = candyToEdit.description;
        priceInput.value = candyToEdit.price;
        quantityInput.value = candyToEdit.quantity;

        isEditMode = true;
        currentEditCandyId = candyToEdit.id;
        submitButton.textContent = "Update Candy"; // Consistent naming
        if (formTitle) {
            formTitle.textContent = "Edit Candy";
        }
    } else {
        showAlert("Candy not found for editing.", "error");
    }
}

// --- Event Listeners (existing, with minor updates) ---
document.addEventListener('DOMContentLoaded', function () {
    // Get references to the login/signup buttons once the DOM is ready
    // You need to add IDs to your HTML anchor tags for these:
    // <a href="/login" id="loginButton">Login</a>
    // <a href="/signup" id="signupButton">Sign Up</a>
    const loginButtonElement = document.getElementById('loginButton');
    const signupButtonElement = document.getElementById('signupButton');

    // Assign global references if they exist
    if (loginButtonElement) window.loginButton = loginButtonElement;
    if (signupButtonElement) window.signupButton = signupButtonElement;

    fetchCandies(); // Fetch candies and check login status on load

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const candyData = {
            name: nameInput.value.trim(),
            description: descInput.value.trim(),
            price: parseFloat(priceInput.value),
            quantity: parseInt(quantityInput.value)
        };

        if (!candyData.name || !candyData.description || isNaN(candyData.price) || isNaN(candyData.quantity)) {
            showAlert("Please fill in all fields correctly.", "error");
            return;
        }
        if (candyData.price < 0 || candyData.quantity < 0) {
            showAlert("Price and quantity cannot be negative.", "error");
            return;
        }

        if (isEditMode) {
            await updateCandy(currentEditCandyId, candyData);
        } else {
            await addCandy(candyData);
        }
    });

    searchInput.addEventListener('input', function () {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredCandies = candies.filter(candy =>
            candy.name.toLowerCase().includes(searchTerm) ||
            candy.description.toLowerCase().includes(searchTerm)
        );
        displayCandies(filteredCandies, loggedInUserId);
    });

    // Logout button handler (already exists)
    // The confirmLogout() function is called via onclick in HTML
});