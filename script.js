
// Aufgaben speichern
let tasks = [];

// Flask Server
const API_URL = "http://127.0.0.1:5000";


// ======================================
// API REQUEST


async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {

        console.error("API Error:", error);

        alert("Server connection failed!");

        throw error;
    }
}


// ======================================
// TASKS LADEN


async function loadTasks() {

    try {

        tasks = await apiRequest("/tasks");

        renderTasks();

    } catch (error) {

        console.error("Error loading tasks:", error);

    }
}


// ======================================
// TASKS ANZEIGEN


function renderTasks() {

    let list = document.querySelector("#taskList");

    list.innerHTML = "";


    tasks.forEach(function(task) {

        let li = document.createElement("li");

        li.textContent = task.text;


        // DONE STATUS

        if (task.done) {

            li.classList.add("done");

        }


        // ======================================
        // DONE BUTTON
        

        let doneBtn = document.createElement("button");

        doneBtn.textContent = "✔";


        doneBtn.onclick = async function() {

            try {

                await apiRequest(`/done/${task.id}`, {

                    method: "POST"

                });

                await loadTasks();

            } catch (error) {

                console.error("Error updating task:", error);

            }

        };


        // ======================================
        // DELETE BUTTON
       

        let deleteBtn = document.createElement("button");

        deleteBtn.textContent = "X";

        deleteBtn.classList.add("delete-btn");


        deleteBtn.onclick = async function() {

            try {

                await apiRequest(`/delete/${task.id}`, {

                    method: "POST"

                });

                await loadTasks();

            } catch (error) {

                console.error("Error deleting task:", error);

            }

        };


        // ======================================
        // EDIT BUTTON
        

        let editBtn = document.createElement("button");

        editBtn.textContent = "Edit";

        editBtn.classList.add("edit-btn");


        editBtn.onclick = function() {

            let input = document.createElement("input");

            input.value = task.text;

            input.classList.add("input-edit");


            li.firstChild.replaceWith(input);

            editBtn.textContent = "Save";


            // SAVE TASK

            async function saveTask() {

                let newText = input.value.trim();

                if (newText === "") return;

                try {

                    await apiRequest(`/edit/${task.id}`, {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            text: newText

                        })

                    });

                    await loadTasks();

                } catch (error) {

                    console.error("Error editing task:", error);

                }

            }


            // SAVE BUTTON

            editBtn.onclick = saveTask;


            // ENTER TO SAVE

            input.addEventListener("keydown", function(event) {

                if (event.key === "Enter") {

                    saveTask();

                }

            });

            input.focus();

        };


        // ======================================
        // BUTTON CONTAINER
        

        let buttonContainer = document.createElement("div");

        buttonContainer.classList.add("task-buttons");


        buttonContainer.appendChild(doneBtn);

        buttonContainer.appendChild(deleteBtn);

        buttonContainer.appendChild(editBtn);


        li.appendChild(buttonContainer);

        list.appendChild(li);

    });


    // ======================================
    // TASK COUNTER
   

    let remaining = tasks.filter(task => task.done === false).length;

    document.querySelector("#counter").textContent =
        remaining + " task left";

}


// ======================================
// CLEAR COMPLETED TASKS


async function clearCompleted() {

    try {

        await apiRequest("/clear-completed", {

            method: "POST"

        });

        await loadTasks();

    } catch (error) {

        console.error("Error clearing tasks:", error);

    }

}


// ======================================
// ADD NEW TASK


async function addTask() {

    let input = document.querySelector("#taskInput");

    let text = input.value.trim();


    if (text === "") return;


    try {

        await apiRequest("/add", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                text: text,

                done: false

            })

        });


        input.value = "";

        input.focus();

        await loadTasks();


    } catch (error) {

        console.error("Error adding task:", error);

    }

}


// ======================================
// ENTER KEY EVENT


let input = document.querySelector("#taskInput");


input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        addTask();

    }

});


// ======================================
// APPLICATION START


loadTasks();