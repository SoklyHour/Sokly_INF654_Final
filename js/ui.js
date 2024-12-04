import { openDB } from "https://unpkg.com/idb?module";
import {
    addTaskToFirebase,
    getTasksFromFirebase,
    deleteTaskFromFirebase,
    updateTaskInFirebase,
  } from "./firebaseDB.js";

  const STORAGE_THRESHOLD = 0.9;  // Set threshold to 90%

  // --- Initialization and Event Listeners ---
document.addEventListener("DOMContentLoaded", function () {


    checkStorageUsage();
    requestPersistentStorage();
  });
  
// Register the service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}
// --- Database Operations ---

// Create or Get IndexedDB database instance
let dbPromise;
async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("MicroTracker", 1, {
      upgrade(db) {
        const store = db.createObjectStore("tasks", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("status", "status");
        store.createIndex("synced", "synced");
      },
    });
  }
  return dbPromise;
}

// Sync unsynced tasks from IndexedDB to Firebase
export async function syncTasks() {
  const db = await getDB();
  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");
  const tasks = await store.getAll();
  await tx.done;

  for (const task of tasks) {
    if (!task.synced && isOnline()) {
      try {
        const taskToSync = {
          meal: task.meal,
          calories: task.calories,
          carbs: task.carbs,
          proteins:task.proteins,
          fats: task.fats,
          status: task.status,
        };
        const savedTask = await addTaskToFirebase(taskToSync);
        const txUpdate = db.transaction("tasks", "readwrite");
        const storeUpdate = txUpdate.objectStore("tasks");
        await storeUpdate.delete(task.id);
        await storeUpdate.put({ ...task, id: savedTask.id, synced: true });
        await txUpdate.done;
      } catch (error) {
        console.error("Error syncing task:", error);
      }
    }
  }
}

// Check if the app is online
function isOnline() {
  return navigator.onLine;
}


// Function to add the meal to the list of meals on the page
function addMealToList(meal) {
  const mealList = document.getElementById("meal-list");

  const mealItem = document.createElement("li");
  mealItem.classList.add("collection-item");

  mealItem.innerHTML = `
    <strong>${meal.meal}</strong><br>
    Calories: ${meal.calories} kcal<br>
    Carbs: ${meal.carbs} g<br>
    Protein: ${meal.protein} g<br>
    Fats: ${meal.fats} g
  `;

  mealList.appendChild(mealItem);
}

// Edit Task with Transaction
async function editTask(id, updatedData) {
  if (!id) {
    console.error("Invalid ID passed to editTask.");
    return;
  }

  const db = await getDB();

  if (isOnline()) {
    try {
      await updateTaskInFirebase(id, updatedData);
      // Update in IndexedDB as well
      const tx = db.transaction("tasks", "readwrite");
      const store = tx.objectStore("tasks");
      await store.put({ ...updatedData, id: id, synced: true });
      await tx.done;

      // Reload the entire task list to reflect the updates
      loadTasks(); // Call loadTasks here to refresh the UI
    } catch (error) {
      console.error("Error updating task in Firebase:", error);
    }
  } else {
    // If offline, make an IndexedDB transaction
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    await store.put({ ...updatedData, id: id, synced: false });
    await tx.done;
    loadTasks(); // Refresh the UI with loadTasks here as well
  }
}

// Delete Task with Transaction
async function deleteTask(id) {
  if (!id) {
    console.error("Invalid ID passed to deleteTask.");
    return;
  }
  const db = await getDB();
  if (isOnline()) {
    try {
      await deleteTaskFromFirebase(id);
    } catch (error) {
      console.error("Error deleting task from Firebase:", error);
    }
  }

  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");
  try {
    await store.delete(id);
  } catch (e) {
    console.error("Error deleting task from IndexedDB:", e);
  }
  await tx.done;

  const taskCard = document.querySelector(`[data-id="${id}"]`);
  if (taskCard) {
    taskCard.remove();
  }
  checkStorageUsage();
}

// --- UI Functions ---
export async function loadTasks() {
    const db = await getDB();
    const taskContainer = document.querySelector(".tasks");
  
    // Ensure taskContainer is found before proceeding
    if (!taskContainer) {
      return; // Exit if container is not found
    }
  
    taskContainer.innerHTML = ""; // Clear the task container before adding new tasks
  
    if (isOnline()) {
      const firebaseTasks = await getTasksFromFirebase();
      const tx = db.transaction("tasks", "readwrite");
      const store = tx.objectStore("tasks");
  
      // Sync tasks with Firebase and update the IndexedDB store
      for (const task of firebaseTasks) {
        await store.put({ ...task, synced: true });
        displayTask(task); // Display the task in the UI
      }
      await tx.done;
    } else {
      const tx = db.transaction("tasks", "readonly");
      const store = tx.objectStore("tasks");
      const tasks = await store.getAll();
  
      // Display all tasks retrieved from IndexedDB
      tasks.forEach((task) => {
        displayTask(task);
      });
      await tx.done;
    }
  }
  
// Initialize global variables
let calorieGoal = 0;
let totalCalories = 0;
let totalCarbs = 0;
let totalProtein = 0;
let totalFats = 0;
let meals = [];

// Initialize IndexedDB
let db;
const request = indexedDB.open("MealTracker", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("meals")) {
        db.createObjectStore("meals", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadMealsFromIndexedDB();  // Load meals from IndexedDB when the page loads
};

request.onerror = function(event) {
    console.log("Error initializing IndexedDB:", event);
};

// Function to save meals to IndexedDB
function saveMealsToIndexedDB() {
    const transaction = db.transaction(["meals"], "readwrite");
    const store = transaction.objectStore("meals");
    meals.forEach(meal => {
        store.put(meal);  // Save each meal to the object store
    });

    transaction.oncomplete = function() {
        console.log("Meals saved to IndexedDB.");
    };

    transaction.onerror = function(event) {
        console.error("Error saving meals to IndexedDB:", event);
    };
}

// Function to load meals from IndexedDB
function loadMealsFromIndexedDB() {
    const transaction = db.transaction(["meals"], "readonly");
    const store = transaction.objectStore("meals");
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = function(event) {
        const storedMeals = event.target.result;
        if (storedMeals.length > 0) {
            meals = storedMeals;
            totalCalories = meals.reduce((total, meal) => total + meal.calories, 0);
            totalCarbs = meals.reduce((total, meal) => total + meal.carbs, 0);
            totalProtein = meals.reduce((total, meal) => total + meal.protein, 0);
            totalFats = meals.reduce((total, meal) => total + meal.fats, 0);
            updateSummaryDisplay();
            updateMealList();
            updateProgressBar();
        }
    };

    getAllRequest.onerror = function(event) {
        console.error("Error loading meals from IndexedDB:", event);
    };
}

// Function to update the displayed calorie goal
function updateCalorieGoalDisplay() {
    document.getElementById('calorie-goal-display').innerText = calorieGoal;
    updateProgressBar();
}

// Function to update the progress bar based on calories consumed
function updateProgressBar() {
    const progress = (totalCalories / calorieGoal) * 100;
    document.getElementById('calorie-progress').style.width = `${progress}%`;
}

// Function to set the calorie goal
document.getElementById('set-goal-btn').addEventListener('click', () => {
    const goalInput = document.getElementById('calorie-goal-input').value;
    calorieGoal = goalInput ? parseInt(goalInput) : calorieGoal;
    updateCalorieGoalDisplay();
});

// Function to add a meal
document.getElementById('add-meal-btn').addEventListener('click', async () => {
  const mealName = document.getElementById('meal-name').value;
  const mealCalories = parseInt(document.getElementById('meal-calories').value);
  const mealCarbs = parseInt(document.getElementById('meal-carbs').value);
  const mealProtein = parseInt(document.getElementById('meal-protein').value);
  const mealFats = parseInt(document.getElementById('meal-fats').value);

  if (mealName && mealCalories) {
      // Prepare the meal object
      const meal = {
          name: mealName,
          calories: mealCalories,
          carbs: mealCarbs,
          protein: mealProtein,
          fats: mealFats,
          status: 'pending' // Optional status field
      };

      try {
          // Add meal to Firebase
          const addedMeal = await addTaskToFirebase(meal); // Ensure addTaskToFirebase handles Firebase logic
          console.log("Meal added successfully to Firebase:", addedMeal);

          // If meal was successfully added to Firebase, add it to the local array and update totals
          meals.push(meal);  // Assuming meals is an array of meals
          totalCalories += mealCalories;
          totalCarbs += mealCarbs;
          totalProtein += mealProtein;
          totalFats += mealFats;

          // Add meal to the UI list
          meal.id = addedMeal.id; // Add Firebase ID to the meal object
          meal.synced = true; // Mark meal as synced after adding to Firebase
          addMealToList(meal);

          // Update the daily summary display
          updateSummaryDisplay();
          updateMealList();
          updateProgressBar();

          // Save updated meals to IndexedDB (you can add additional logic to handle this)
          saveMealsToIndexedDB();

          // Clear input fields after adding the meal
          clearInputFields();

      } catch (error) {
          console.error("Error adding meal to Firebase:", error);
          alert("There was an error adding the meal. Please try again.");
      }
  } else {
      alert("Please enter a meal name and calories.");
  }
});

// Function to update the daily summary display
function updateSummaryDisplay() {
    document.getElementById('total-calories').innerText = totalCalories;
    document.getElementById('total-carbs').innerText = totalCarbs;
    document.getElementById('total-protein').innerText = totalProtein;
    document.getElementById('total-fats').innerText = totalFats;
}

// Function to update the meal list display
function updateMealList() {
    const mealList = document.getElementById('meal-list');
    mealList.innerHTML = ""; // Clear current meal list
    meals.forEach((meal, index) => {
        const li = document.createElement('li');
        li.className = 'collection-item';
        
        // Create meal info container
        const mealInfo = document.createElement('span');
        mealInfo.innerText = `${meal.name}: ${meal.calories} kcal, ${meal.carbs} g carbs, ${meal.protein} g protein, ${meal.fats} g fats`;
        li.appendChild(mealInfo);

        // Create delete button container
        const deleteBtnContainer = document.createElement('div');
        deleteBtnContainer.style.float = 'right'; // Float delete button to the right

        // Create delete button
        const deleteBtn = Object.assign(document.createElement('button'), { onclick: () => deleteTask(task.id) || editTask(task.id) });
        deleteBtn.innerText = 'Delete';
        deleteBtn.className = 'btn red';
        deleteBtn.onclick = () => removeMeal(index); // Pass index to removeMeal

        deleteBtnContainer.appendChild(deleteBtn);
        li.appendChild(deleteBtnContainer);
        
        mealList.appendChild(li);
    });
}

// Function to remove a meal
function removeMeal(index) {
    const mealToRemove = meals[index];
    totalCalories -= mealToRemove.calories;
    totalCarbs -= mealToRemove.carbs;
    totalProtein -= mealToRemove.protein;
    totalFats -= mealToRemove.fats;

    // Remove meal from the array
    meals.splice(index, 1);

    // Update the daily summary display
    updateSummaryDisplay();
    updateMealList();
    updateProgressBar();

    // Save updated meals to IndexedDB
    saveMealsToIndexedDB();
}

// Function to clear input fields after adding a meal
function clearInputFields() {
    document.getElementById('meal-name').value = "";
    document.getElementById('meal-calories').value = "";
    document.getElementById('meal-carbs').value = "";
    document.getElementById('meal-protein').value = "";
    document.getElementById('meal-fats').value = "";
}

// Initialize the calorie goal display on page load
updateCalorieGoalDisplay();

// Check storage usage and display warnings
async function checkStorageUsage() {
    if (navigator.storage && navigator.storage.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      const usageInMB = (usage / (1024 * 1024)).toFixed(2);
      const quotaInMB = (quota / (1024 * 1024)).toFixed(2);
      console.log(`Storage used: ${usageInMB} MB of ${quotaInMB} MB`);
  
      const storageInfo = document.querySelector("#storage-info");
      if (storageInfo) {
        storageInfo.textContent = `Storage used: ${usageInMB} MB of ${quotaInMB} MB`;
      }
  
      const storageWarning = document.querySelector("#storage-warning");
      if (usage / quota > STORAGE_THRESHOLD) {
        if (storageWarning) {
          storageWarning.textContent = "Warning: Running low on storage space.";
          storageWarning.style.display = "block";
        }
      } else if (storageWarning) {
        storageWarning.textContent = "";
        storageWarning.style.display = "none";
      }
    }
  }
  
  // Request persistent storage
  async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
      const isPersistent = await navigator.storage.persist();
      console.log(`Persistent storage granted: ${isPersistent}`);
  
      const storageMessage = document.querySelector("#persistent-storage-info");
      if (storageMessage) {
        storageMessage.textContent = isPersistent
          ? "Persistent storage granted!"
          : "Data might be cleared under storage pressure.";
        storageMessage.classList.toggle("green-text", isPersistent);
        storageMessage.classList.toggle("red-text", !isPersistent);
      }
    }
  }
  
// Event listener to detect online status and sync
window.addEventListener("online", syncTasks);
window.addEventListener("online", loadTasks);