document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000/api/items";
  const itemForm = document.getElementById("itemForm");
  const itemsList = document.getElementById("itemsList");
  const messageDiv = document.getElementById("message");
  const formTitle = document.getElementById("form-title");
  const submitBtn = document.getElementById("submit-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const itemIdInput = document.getElementById("itemId");
  let isEditing = false;

  // Display message
  function showMessage(type, text) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 3000);
  }

  // Fetch all items
  async function fetchItems() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch items");
      const items = await response.json();
      renderItems(items);
    } catch (error) {
      showMessage("error", error.message);
    }
  }

  // Render items to DOM
  function renderItems(items) {
    itemsList.innerHTML = items
      .map(
        (item) => `
            <li data-id="${item._id}">
                <div class="item-info">
                    <strong>${item.name}</strong>
                    ${item.description ? `<p>${item.description}</p>` : ""}
                </div>
                <div class="item-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </li>
        `
      )
      .join("");

    // Add event listeners
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", deleteItem);
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", editItem);
    });
  }

  // Add or Update item
  async function handleSubmit(e) {
    e.preventDefault();

    const itemData = {
      name: document.getElementById("name").value.trim(),
      description: document.getElementById("description").value.trim(),
    };

    if (!itemData.name) {
      showMessage("error", "Item name is required");
      return;
    }

    try {
      let response;
      if (isEditing) {
        response = await fetch(`${API_URL}/${itemIdInput.value}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        });
      }

      if (!response.ok)
        throw new Error(
          isEditing ? "Failed to update item" : "Failed to add item"
        );

      resetForm();
      await fetchItems();
      showMessage(
        "success",
        isEditing ? "Item updated successfully" : "Item added successfully"
      );
    } catch (error) {
      showMessage("error", error.message);
    }
  }

  // Delete item
  async function deleteItem(e) {
    const itemId = e.target.closest("li").dataset.id;
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`${API_URL}/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item");
      await fetchItems();
      showMessage("success", "Item deleted successfully");
    } catch (error) {
      showMessage("error", error.message);
    }
  }

  // Edit item
  async function editItem(e) {
    const itemId = e.target.closest("li").dataset.id;
    try {
      const response = await fetch(`${API_URL}/${itemId}`);
      if (!response.ok) throw new Error("Failed to fetch item");
      const item = await response.json();

      document.getElementById("name").value = item.name;
      document.getElementById("description").value = item.description || "";
      itemIdInput.value = item._id;

      formTitle.textContent = "Edit Item";
      submitBtn.textContent = "Update";
      cancelBtn.style.display = "inline-block";
      isEditing = true;

      document.getElementById("name").focus();
    } catch (error) {
      showMessage("error", error.message);
    }
  }

  // Reset form
  function resetForm() {
    itemForm.reset();
    itemIdInput.value = "";
    formTitle.textContent = "Add New Item";
    submitBtn.textContent = "Add Item";
    cancelBtn.style.display = "none";
    isEditing = false;
  }

  // Event listeners
  itemForm.addEventListener("submit", handleSubmit);
  cancelBtn.addEventListener("click", resetForm);

  // Initialize
  fetchItems();
});
