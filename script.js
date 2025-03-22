document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("exerciseForm");
    const tableBody = document.querySelector("#exerciseTableBody");
    const dateInput = document.getElementById("date");
    const dateError = document.getElementById("dateError");
    const exerciseInput = document.getElementById("exercise");
    const exerciseError = document.getElementById("exerciseError");
    const seriesCountInput = document.getElementById("seriesCount");
    const seriesContainer = document.getElementById("seriesContainer");
    const muscleGroupInput = document.getElementById("muscleGroup");
    const limpiarFormularioBtn = document.getElementById("limpiarFormulario");
    
    // Cargar datos guardados al iniciar //loadExercises(); [Deprecado]
    loadEjercicios();

    // Escuchar cambios en el select de grupo muscular
    muscleGroupInput.addEventListener("change", async function () {
        const selectedMuscleGroup = muscleGroupInput.value;

        if (selectedMuscleGroup === "Selecciona una opcion:") {
            //exerciseInput.innerHTML = ""; // Limpiar el campo si no se selecciona nada
            //return;
            exerciseInput.innerHTML = "<option value=''>Selecciona un ejercicio</option>"; // Limpiar el campo si no se selecciona nada
            exerciseInput.disabled = true; // Deshabilitar el campo de ejercicio
            return;
        }

        getOptionsMuscleGroup(selectedMuscleGroup);
    });
    
    // Hacer una solicitud a la API para obtener los ejercicios
    async function getOptionsMuscleGroup(selectedMuscleGroup) {
        try {
            const response = await fetch(`https://fitwebserver.onrender.com/api/exercises?muscleGroup=${selectedMuscleGroup}`);
            const exercises = await response.json();

            // Limpiar el campo de ejercicio
            exerciseInput.innerHTML = "<option value=''>Selecciona un ejercicio</option>";

            exercises.forEach((exercise) => {
                const option = document.createElement("option");
                option.value = exercise.exercise;
                option.textContent = exercise.exercise;
                exerciseInput.appendChild(option);
            });

            // Habilitar el campo de ejercicio
            exerciseInput.disabled = false;
        } catch (error) {
            console.error("Error al cargar los ejercicios:", error);
        }
    }
    
    // Obtener la fecha de hoy en formato YYYY-MM-DD (UTC)
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const todayISO = todayUTC.toISOString().split("T")[0];

    // Establecer la fecha mínima como hoy
    dateInput.setAttribute("min", todayISO);

    //Establecer la fecha actual por defecto
    dateInput.value = todayISO;

    // Validación en tiempo real para la fecha
    dateInput.addEventListener("input", function () {
        const selectedDate = new Date(dateInput.value); // Fecha seleccionada
        const todayDate = new Date(todayISO); // Fecha de hoy

        if (selectedDate.getTime() < todayDate.getTime()) {
            dateError.textContent = "No puedes seleccionar una fecha anterior a hoy.";
            dateError.style.display = "block";
        } else {
            dateError.style.display = "none";
        }
    });

    // Validación en tiempo real para el ejercicio
    exerciseInput.addEventListener("input", function () {
        if (!this.checkValidity()) {
            this.classList.add("is-invalid");
        } else {
            this.classList.remove("is-invalid");
        }
    });

    // Generar campos de series dinámicamente
    seriesCountInput.addEventListener("input", function () {
        generarCamposSeriesDinamicos(seriesCountInput.value);
    });

    // Funcion para generar campos de series dinamicos
    async function generarCamposSeriesDinamicos(value){
        const seriesCount = parseInt(value);

        // Validar que el valor esté entre 1 y 3
        if (seriesCount < 1 || seriesCount > 4) {
            seriesCountInput.classList.add("is-invalid"); // Marcar como inválido
            document.getElementById("seriesCountError").style.display = "block"; // Mostrar mensaje de error
            seriesCountInput.value = ""; // Limpiar el valor
        } else {
            seriesCountInput.classList.remove("is-invalid"); // Marcar como válido
            document.getElementById("seriesCountError").style.display = "none"; // Ocultar mensaje de error

            // Generar campos de series dinámicamente
            seriesContainer.innerHTML = ""; // Limpiar contenedor

            for (let i = 1; i <= seriesCount; i++) {
                const seriesDiv = document.createElement("div");
                seriesDiv.classList.add("series-group", "mb-4", "p-3", "border", "rounded");
                seriesDiv.innerHTML = `
                    <h5>Serie ${i}</h5>
                    <div class="subseries-container" id="subseriesContainer${i}">
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label for="repetitions${i}" class="form-label">Repeticiones:</label>
                                <input type="number" class="form-control" id="repetitions${i}" required>
                            </div>
                            <div class="col-md-4">
                                <label for="weight${i}" class="form-label">Peso (kg):</label>
                                <input type="number" class="form-control" id="weight${i}" min="1" required>
                            </div>
                            <div class="col-md-4">
                                <label for="notes${i}" class="form-label">Notas:</label>
                                <textarea class="form-control" id="notes${i}"></textarea>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="dropset${i}">
                                    <label class="form-check-label" for="dropset${i}">Dropset</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label for="dropsetAmount${i}" class="form-label">Cantidad:</label>
                                <input type="number" class="form-control" id="dropsetAmount${i}" min="1" max="3" disabled>
                            </div>
                        </div>
                    </div>
                `;
                seriesContainer.appendChild(seriesDiv);

                // Habilitar/deshabilitar el campo "Cantidad" según el checkbox "Dropset"
                const dropsetCheckbox = document.getElementById(`dropset${i}`);
                const dropsetAmountInput = document.getElementById(`dropsetAmount${i}`);

                dropsetCheckbox.addEventListener("change", function () {
                    if (dropsetCheckbox.checked) {
                        dropsetAmountInput.disabled = false; // Habilitar el campo
                        dropsetAmountInput.setAttribute("required", true);
                    } else {
                        dropsetAmountInput.disabled = true; // Deshabilitar el campo
                        dropsetAmountInput.value = ""; // Limpiar el campo
                        dropsetAmountInput.removeAttribute("required");
                        // Eliminar campos adicionales de dropset si existen
                        const dropsetFields = document.querySelectorAll(`.dropset-fields-${i}`);
                        dropsetFields.forEach((field) => field.remove());
                    }
                });

                // Agregar campos adicionales cuando se ingresa una cantidad en "Cantidad"
                dropsetAmountInput.addEventListener("input", function () {
                    const seriesdropsetCount = parseInt(dropsetAmountInput.value);
                    if (seriesdropsetCount < 1 || seriesdropsetCount > 3) {
                        dropsetAmountInput.classList.add("is-invalid"); // Marcar como inválido
                        document.getElementById("seriesCountError").style.display = "block"; // Mostrar mensaje de error
                        dropsetAmountInput.value = ""; // Limpiar el valor
                    } else {
                        const dropsetAmount = parseInt(dropsetAmountInput.value);
                        const subseriesContainer = document.getElementById(`subseriesContainer${i}`);
    
                        // Eliminar campos adicionales anteriores si existen
                        const existingDropsetFields = document.querySelectorAll(`.dropset-fields-${i}`);
                        existingDropsetFields.forEach((field) => field.remove());
    
                        // Agregar campos adicionales según la cantidad de dropsets
                        if (dropsetAmount > 0) {
                            for (let j = 1; j <= dropsetAmount; j++) {
                                const dropsetFields = document.createElement("div");
                                dropsetFields.classList.add("dropset-fields", `dropset-fields-${i}`, "mb-3", "p-2", "border", "rounded");
                                dropsetFields.innerHTML = `
                                    <h6>Dropset ${j}</h6>
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <label for="dropsetRepetitions${i}-${j}" class="form-label">Repeticiones:</label>
                                            <input type="number" class="form-control" id="dropsetRepetitions${i}-${j}" required>
                                        </div>
                                        <div class="col-md-4">
                                            <label for="dropsetWeight${i}-${j}" class="form-label">Peso (kg):</label>
                                            <input type="number" class="form-control" id="dropsetWeight${i}-${j}" min="1" required>
                                        </div>
                                        <div class="col-md-4">
                                            <label for="dropsetNotes${i}-${j}" class="form-label">Notas:</label>
                                            <textarea class="form-control" id="dropsetNotes${i}-${j}"></textarea>
                                        </div>
                                    </div>
                                `;
                                subseriesContainer.appendChild(dropsetFields);
                            }
                        }
                    }
                });
            }
        }
    }

    // Agregar ejercicio
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Validar campos obligatorios
        if (dateInput.value.trim() === "" || dateInput.value < todayISO || exerciseInput.value.trim() === "" || seriesCountInput.value.trim() === "" || muscleGroupInput.value === "") {
            alert("Por favor, completa todos los campos obligatorios.");
            return;
        }

        if(muscleGroupInput.value === "Selecciona una opcion:"){
            alert("Por favor, selecciona alguna opción del campo de Grupo muscular.");
            return;
        }

        // Obtener valores del formulario
        const date = dateInput.value;
        const muscleGroup = muscleGroupInput.value;
        const exercise = exerciseInput.value;
        const seriesCount = parseInt(seriesCountInput.value);

        // Validar si ya existe un ejercicio para la fecha actual
        if (await ejercicioExiste(date, exercise)) {
            alert("Ya existe un ejercicio con el mismo nombre para la fecha seleccionada.");
            return; // Detener la ejecución si ya existe
        }

        // Si no existe, continuar con el proceso de guardado
        const series = [];

        // Recopilar datos de subseries
        for (let i = 1; i <= seriesCount; i++) {
            const repetitions = document.getElementById(`repetitions${i}`).value;
            const weight = document.getElementById(`weight${i}`).value;
            const notes = document.getElementById(`notes${i}`).value;
            const dropset = document.getElementById(`dropset${i}`).checked;
            const dropsetAmount = document.getElementById(`dropsetAmount${i}`).value;
            const dropsets = [];

            // Recopilar datos de dropsets si existen
            if (dropset && dropsetAmount > 0) {
                for (let j = 1; j <= dropsetAmount; j++) {
                    const dropsetRepetitions = document.getElementById(`dropsetRepetitions${i}-${j}`).value;
                    const dropsetWeight = document.getElementById(`dropsetWeight${i}-${j}`).value;
                    const dropsetNotes = document.getElementById(`dropsetNotes${i}-${j}`).value;

                    dropsets.push({
                        repetitions: dropsetRepetitions,
                        weight: dropsetWeight,
                        notes: dropsetNotes,
                    });
                }
            }

            series.push({
                subseries: { repetitions, weight, notes }, // Subserie como objeto, no como arreglo
                dropset: dropset, // Nuevo campo: dropset
                dropsetAmount: dropsetAmount, // Nuevo campo: cantidad de dropset
                dropsets: dropsets, // Nuevo campo: arreglo de dropsets
            });
        }

        // Crear objeto de ejercicio
        const exerciseData = {
            date,
            muscleGroup, 
            exercise,
            series,
        };

        // Guardar en localStorage
        //saveExercise(exerciseData);

        //Guardar en la bdmongo
        try {
            const response = await fetch("https://fitwebserver.onrender.com/ejercicios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(exerciseData),
            });

            if (response.ok) {
                alert("Ejercicio guardado correctamente.");
                form.reset();
                await loadEjercicios();
                //location.reload();
            } else {
                alert("Error al guardar el ejercicio.");
            }
        } catch (error) {
            console.error("Error:", error);
        }

        // Agregar a la tabla
        //addExerciseToTable(exerciseData);
        //loadEjercicios();

        // Limpiar formulario
        form.reset();
        dateInput.value = todayISO;
        seriesContainer.innerHTML = "";
    });

    function addExerciseToTable(exercise) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${exercise.date}</td>
            <td>${exercise.muscleGroup}</td> 
            <td>${exercise.exercise}</td>
            <td>${exercise.series.length}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="showDetails('${exercise.date}', '${exercise.exercise}')">Ver Detalles</button>
            </td>
            <td>
                <button class="btn btn-warning btn-sm editar-btn" disabled>Editar</button>
            </td>
            <td>
                <button class="btn btn-danger btn-sm eliminar-btn">Eliminar</button>
            </td>
        `;

        // Asignar el evento de edición al botón
        const editarBtn = row.querySelector(".editar-btn");
        editarBtn.addEventListener("click", () => editarEjercicio(exercise));

        // Asignar el evento de eliminación al botón
        const eliminarBtn = row.querySelector(".eliminar-btn");
        eliminarBtn.addEventListener("click", () => eliminarEjercicio(exercise.date, exercise.exercise));
        
        tableBody.appendChild(row);
    }

    // Función para mostrar detalles de las series y subseries
    window.showDetails = async function (date, exercise) {
        //const exercises = JSON.parse(localStorage.getItem("exercises")) || [];
        //const selectedExercise = exercises.find((e) => e.date === date && e.exercise === exercise);
        const ejercicios = await obtenerEjercicios();

        const selectedExercise = ejercicios.find((e) => e.date === date && e.exercise === exercise);

        if (selectedExercise) {
            let details = "<h5>Detalles de Series y Subseries</h5>";

            // Validar que 'series' sea un arreglo
            if (!Array.isArray(selectedExercise.series)) {
                selectedExercise.series = []; // Inicializar como arreglo vacío si no lo es
            }

            selectedExercise.series.forEach((series, index) => {
                details += `<h6>Serie ${index + 1}</h6>`;

                // Mostrar detalles de la subserie
                if (series.subseries) {
                    details += `
                        <p>
                            Repeticiones: ${series.subseries.repetitions}, 
                            Peso: ${series.subseries.weight} kg, 
                            Notas: ${series.subseries.notes || "Sin notas"}
                        </p>
                    `;
                } else {
                    details += `<p>No hay datos de subserie.</p>`;
                }

                // Mostrar detalles de dropset
                if (series.dropset) {
                    details += `
                        <p>
                            Dropset: Sí, 
                            Cantidad: ${series.dropsetAmount}
                        </p>
                    `;

                    // Mostrar detalles de cada dropset
                    if (Array.isArray(series.dropsets)) {
                        series.dropsets.forEach((dropset, dropsetIndex) => {
                            details += `
                                <p>
                                    Dropset ${dropsetIndex + 1}: 
                                    Repeticiones: ${dropset.repetitions}, 
                                    Peso: ${dropset.weight} kg, 
                                    Notas: ${dropset.notes || "Sin notas"}
                                </p>
                            `;
                        });
                    }

                } else {
                    details += `<p>Dropset: No</p>`;
                }
            });

            // Actualizar el contenido del modal
            const modalBody = document.getElementById("modalBodyContent");
            modalBody.innerHTML = details;

            // Mostrar el modal
            const detailsModal = new bootstrap.Modal(document.getElementById("detailsModal"));
            detailsModal.show();
        } else {
            console.error("Ejercicio no encontrado:", { date, exercise });
        }
    };
    
    // Obtener y mostrar ejercicios
    async function loadEjercicios() {
        try {
            const ejercicios = await obtenerEjercicios();
            console.log(ejercicios); // Aquí puedes mostrar los ejercicios en la tabla
            tableBody.innerHTML = ""; // Limpiar la tabla antes de cargar los datos
            ejercicios.forEach((exercise) => addExerciseToTable(exercise));
        } catch (error) {
            console.error("Error al cargar los ejercicios:", error);
        }
    }

    // Función para obtener los ejercicios desde la API
    async function obtenerEjercicios() {
        try {
            const response = await fetch("https://fitwebserver.onrender.com/ejercicios", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (!response.ok) {
                throw new Error("Error al obtener los ejercicios");
            }
            return await response.json(); // Retorna la lista de ejercicios
        } catch (error) {
            console.error("Error:", error);
            return []; // Retorna un arreglo vacío en caso de error
        }
    }

    // Función para verificar si ya existe un ejercicio para la fecha actual
    async function ejercicioExiste(fecha, ejercicio) {
        const ejercicios = await obtenerEjercicios(); // Obtener ejercicios desde la API
        return ejercicios.some((ej) => ej.date === fecha && ej.exercise === ejercicio);
    }
    
    // Eliminar todos los registros de bd
    async function deleteEjercicios() {
        try {
            const response = await fetch("https://fitwebserver.onrender.com/ejercicios", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                alert("Ejercicios eliminados correctamente.");
                form.reset();
                location.reload();
            } else {
                alert("Error al eliminar ejercicios.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    // Eliminar ejercicio individual de bd
    async function eliminarEjercicio(date, exercise) {
        if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
            try {
                // Eliminar de la base de datos
                const response = await fetch(`https://fitwebserver.onrender.com/ejercicios`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ date, exercise }), // Enviar fecha y ejercicio para identificar el registro
                });
    
                if (response.ok) {
                    // Eliminar de la interfaz
                    const rows = document.querySelectorAll("#exerciseTableBody tr");
                    rows.forEach((row) => {
                        const rowDate = row.cells[0].textContent;
                        const rowExercise = row.cells[2].textContent;
                        if (rowDate === date && rowExercise === exercise) {
                            row.remove(); // Eliminar la fila de la tabla
                        }
                    });
                    alert("Registro eliminado correctamente.");
                    loadEjercicios();
                } else {
                    alert("Error al eliminar el registro.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Error al eliminar el registro.");
            }
        }
    }

    // Editar ejercicio individual de bd
    async function editarEjercicio(exercise) {
        // Llenar el formulario con los datos del ejercicio seleccionado
        dateInput.value = exercise.date;
        dateInput.disabled = true;

        muscleGroupInput.value = exercise.muscleGroup;
        muscleGroupInput.disabled = true;

        await getOptionsMuscleGroup(exercise.muscleGroup);

        // Asignar valor al campo Ejercicio <select>
        for (let i = 0; i < exerciseInput.options.length; i++) {
            if (exerciseInput.options[i].value === exercise.exercise) {
                exerciseInput.options[i].selected = true;
                exerciseInput.disabled = true;
                break;
            }
        }

        seriesCountInput.value = exercise.series.length;

        generarCamposSeriesDinamicos(exercise.series.length);

    
        // Mostrar el formulario de edición (si está oculto)
        form.style.display = "block";
    
        // Cambiar el texto del botón de "Agregar Ejercicio" a "Guardar Cambios"
        const submitBtn = document.querySelector("#exerciseForm button[type='submit']");
        submitBtn.textContent = "Guardar Cambios";
        submitBtn.onclick = async function (e) {
            e.preventDefault(); // Evitar el envío del formulario
    
            // Obtener los valores actualizados del formulario
            const updatedExercise = {
                date: dateInput.value,
                muscleGroup: muscleGroupInput.value,
                exercise: exerciseInput.value,
                //seriesCount: seriesCountInput.value,
                series: exercise.series, // Mantener las series existentes (o actualizarlas si es necesario)
            };
    
            console.log("Datos enviados:", updatedExercise); // Verificar los datos en la consola
            console.log("Criterios de búsqueda:", { date: updatedExercise.date, exercise: updatedExercise.exercise }); // Verificar los criterios de búsqueda

            // Enviar los datos actualizados al servidor
            try {
                const response = await fetch(`https://fitwebserver.onrender.com/ejercicios`, {
                    method: "PUT", // Usar PUT para actualizar
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedExercise),
                });
    
                if (response.ok) {
                    alert("Registro actualizado correctamente.");

                    // Restablecer el formulario
                    form.reset();
                    exerciseInput.disabled = true; // Deshabilitar el campo Ejercicio
                    submitBtn.textContent = "Agregar Ejercicio"; // Restablecer el texto del botón

                    loadEjercicios(); // Recargar la tabla
                } else {
                    alert("Error al actualizar el registro.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Error al actualizar el registro.");
            }
        };
    }

    // Escuchar el clic en el botón "Limpiar Formulario"
    limpiarFormularioBtn.addEventListener("click", function () {
        form.reset(); // Resetear el formulario
        // Limpiar el contenedor de series dinámicas
        seriesContainer.innerHTML = "";
        // Restablecer la fecha actual
        dateInput.value = todayISO;
        // Deshabilitar el campo de ejercicio
        exerciseInput.disabled = true;
        dateInput.disabled = false; // Habilitar fecha
        muscleGroupInput.disabled = false; // Habilitar muscleGroup
    });

    // Escuchar el clic en el botón "Cancelar"
    document.getElementById("cancelarEdicion").addEventListener("click", function () {
        // Restablecer el formulario
        form.reset();
        // Limpiar el contenedor de series dinámicas
        seriesContainer.innerHTML = "";
        // Restablecer la fecha actual
        dateInput.value = todayISO;
        exerciseInput.disabled = true; // Deshabilitar el campo Ejercicio
        dateInput.disabled = false; // Habilitar fecha
        muscleGroupInput.disabled = false; // Habilitar muscleGroup
        document.querySelector("#exerciseForm button[type='submit']").textContent = "Agregar Ejercicio"; // Restablecer el texto del botón
    });
    
    // Eliminar todos los datos
    document.getElementById("clearStorage").addEventListener("click", function () {
        //localStorage.clear(); // Eliminar todos los datos
        deleteEjercicios();
        alert("Todos los datos han sido eliminados. La página se recargará.");
        location.reload(); // Recargar la página
    });

    // Anterior localStorage [Deprecado]

    function saveExercise(exercise) {
        let exercises = JSON.parse(localStorage.getItem("exercises")) || [];
        exercises.push(exercise);
        localStorage.setItem("exercises", JSON.stringify(exercises));
    }

    function loadExercises() {
        let exercises = JSON.parse(localStorage.getItem("exercises")) || [];
        exercises.forEach((exercise) => addExerciseToTable(exercise));
    }
});