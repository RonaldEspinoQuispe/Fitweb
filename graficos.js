document.addEventListener("DOMContentLoaded", function () {
    const barChartCtx = document.getElementById("barChart").getContext("2d");
    const lineChartCtx = document.getElementById("lineChart").getContext("2d");
    const barChartCtxPlus = document.getElementById("barChartReps").getContext("2d");
    const lineChartCtxPlus = document.getElementById("lineChartPeso").getContext("2d");
    const dateInput = document.getElementById("fechaUnica");
    const exerciseInput = document.getElementById("newexercise");
    const muscleGroupInput = document.getElementById("newmuscleGroup");
    const fechaUnicaCheckbox = document.getElementById("fechaUnicaCheckbox");
    const rangoFechaCheckbox = document.getElementById("rangoFechaCheckbox");
    const fechaUnicaContainer = document.getElementById("fechaUnicaContainer");
    const rangoFechaContainer = document.getElementById("rangoFechaContainer");
    const limpiarFormularioBtn = document.getElementById("newlimpiarFormulario");
    const form = document.getElementById("newExerciseForm");
    const containerCharts = document.getElementById("containerGrafico");
    const containerChartsPlus = document.getElementById("containerGraficoPlus");
    const containerTableContent = document.getElementById("containerTable");
    const exportExcel = document.getElementById("exportarExcel");
    const dateInputInicio = document.getElementById("fechaInicio");
    const dateInputFin = document.getElementById("fechaFin");

    let barChart, lineChart;
    let barChartReps, lineChartPeso;

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

    // Función para crear los gráficos
    function createCharts(data) {
        const labels = data.map((serie, index) => `Serie ${index + 1}`);
        const repetitions = data.map((serie) => serie.subseries.repetitions);
        const weight = data.map((serie) => serie.subseries.weight);

        // Gráfico de Barras
        if (barChart) barChart.destroy(); // Destruir el gráfico anterior si existe

        barChart = new Chart(barChartCtx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Repeticiones",
                    data: repetitions,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Peso",
                    data: weight,
                    backgroundColor: "rgba(13, 172, 80, 0.69)",
                    borderColor: "rgb(75, 192, 87)",
                    borderWidth: 1,
                }],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

        // Gráfico de Líneas
        if (lineChart) lineChart.destroy(); // Destruir el gráfico anterior si existe

        lineChart = new Chart(lineChartCtx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Repeticiones",
                    data: repetitions,
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                    fill: false,
                },
                {
                    label: "Peso",
                    data: weight,
                    borderColor: "rgba(13, 172, 80, 0.69)",
                    borderWidth: 2,
                    fill: false,
                }],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    // Función para crear los gráficos
    function createChartsRango(data) {

        // Verificar si hay datos
        if (data.length === 0) {
            console.error("No hay datos para mostrar.");
            return;
        }

        // Gráfico de Barras

        // Preparar las etiquetas y los datos
        const labels = [];
        const repeticiones = [];
        const pesos = [];

        // Recorrer todos los ejercicios y sus series
        data.forEach((ejercicio, ejercicioIndex) => {
            ejercicio.series.forEach((serie, serieIndex) => {
                // Crear una etiqueta única para cada serie
                labels.push(`${ejercicio.date}`);

                // Agregar repeticiones y pesos
                repeticiones.push(serie.subseries.repetitions);
                pesos.push(serie.subseries.weight);
            });
        });

        if (barChart) barChart.destroy(); // Destruir el gráfico anterior si existe

        // Crear el gráfico de barras
        barChart = new Chart(barChartCtx, {
            type: "bar",
            data: {
                labels: labels, // Etiquetas combinadas
                datasets: [
                    {
                        label: "Repeticiones",
                        data: repeticiones, // Datos de repeticiones combinados
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                    {
                        label: "Peso",
                        data: pesos, // Datos de pesos combinados
                        backgroundColor: "rgba(13, 172, 80, 0.69)",
                        borderColor: "rgb(75, 192, 87)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });


        // Preparar las etiquetas y los datos
        const labels2 = [];
        const repeticiones2 = [];
        const pesos2 = [];

        // Recorrer todos los ejercicios y sus series
        data.forEach((ejercicio, ejercicioIndex) => {
            // Verificar si la fecha ya está en labels2
            if (!labels2.includes(ejercicio.date)) {
                // Agregar la fecha a labels2
                labels2.push(ejercicio.date);

                // Variables para almacenar los mayores valores de repeticiones y pesos
                let maxRepeticiones = -Infinity;
                let maxPesos = -Infinity;
                let reps = "";

                // Recorrer las series del ejercicio
                ejercicio.series.forEach((serie) => {
                    // Actualizar los mayores valores
                    if (serie.subseries.repetitions > maxRepeticiones) {
                        maxRepeticiones = serie.subseries.repetitions;
                    }
                    if (serie.subseries.weight > maxPesos) {
                        maxPesos = serie.subseries.weight;
                        reps = serie.subseries.repetitions;
                    }
                });

                // Guardar los mayores valores en repeticiones2 y pesos2
                repeticiones2.push(reps);
                pesos2.push(maxPesos);
            }
        });

        if (barChartReps) barChartReps.destroy(); // Destruir el gráfico anterior si existe

        // Crear el gráfico de barras
        barChartReps = new Chart(barChartCtxPlus, {
            type: "bar",
            data: {
                labels: labels2, // Etiquetas combinadas
                datasets: [
                    {
                        label: "Repeticiones",
                        data: repeticiones2, // Datos de repeticiones combinados
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                    {
                        label: "Peso",
                        data: pesos2, // Datos de pesos combinados
                        backgroundColor: "rgba(13, 172, 80, 0.69)",
                        borderColor: "rgb(75, 192, 87)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });


        /*for(let i = 1; i <= data.length; i++){
            const labels = `Serie ${i}`;
            const repetitions = data[i-1].series[i-1].subseries.repetitions;
            const weight = data[i-1].series[i-1].subseries.weight;
        }

        barChart = new Chart(barChartCtx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Repeticiones",
                    data: repetitions,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Peso",
                    data: weight,
                    backgroundColor: "rgba(13, 172, 80, 0.69)",
                    borderColor: "rgb(75, 192, 87)",
                    borderWidth: 1,
                }],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

        

        // Gráfico de Líneas
        if (lineChart) lineChart.destroy(); // Destruir el gráfico anterior si existe

        lineChart = new Chart(lineChartCtx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Repeticiones",
                    data: repetitions,
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                    fill: false,
                },
                {
                    label: "Peso",
                    data: weight,
                    borderColor: "rgba(13, 172, 80, 0.69)",
                    borderWidth: 2,
                    fill: false,
                }],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

        */
        
        if (lineChart) lineChart.destroy(); // Destruir el gráfico anterior si existe

        // Crear el gráfico de líneas
        lineChart = new Chart(lineChartCtx, {
            type: "line",
            data: {
                labels: labels, // Etiquetas combinadas
                datasets: [
                    {
                        label: "Repeticiones",
                        data: repeticiones, // Datos de repeticiones combinados
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 2,
                        fill: false,
                    },
                    {
                        label: "Peso",
                        data: pesos, // Datos de pesos combinados
                        borderColor: "rgba(13, 172, 80, 0.69)",
                        borderWidth: 2,
                        fill: false,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

        if (lineChartPeso) lineChartPeso.destroy(); // Destruir el gráfico anterior si existe
        
        // Crear el gráfico de líneas
        lineChartPeso = new Chart(lineChartCtxPlus, {
            type: "line",
            data: {
                labels: labels2, // Etiquetas combinadas
                datasets: [
                    {
                        label: "Repeticiones",
                        data: repeticiones2, // Datos de repeticiones combinados
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                    {
                        label: "Peso",
                        data: pesos2, // Datos de pesos combinados
                        borderColor: "rgba(13, 172, 80, 0.69)",
                        borderWidth: 2,
                        fill: false,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    // Función para filtrar los datos por fecha y ejercicio
    async function filterData(date, exercise, dateInicio, dateFin) {
        //const exercises = JSON.parse(localStorage.getItem("exercises")) || [];
        //const filteredExercise = exercises.find((e) => e.date === date && e.exercise === exercise);

        const exercises = await obtenerEjercicios();
        console.log(exercises);

        if (fechaUnicaCheckbox.checked) {
            containerCharts.classList.remove("hidden");
            containerTableContent.classList.remove("hidden"); 
            exportExcel.classList.remove("hidden");
            containerChartsPlus.classList.add("hidden");

            const filteredExercise = exercises.find((e) => e.date === date && e.exercise === exercise);

            if (filteredExercise) {
                createCharts(filteredExercise.series);
                actualizarTabla(exercises, date, exercise);
            } else {
                alert("No se encontraron datos para la fecha y ejercicio seleccionados.");
            }
        } else if (rangoFechaCheckbox.checked) {
            containerCharts.classList.remove("hidden");
            containerTableContent.classList.remove("hidden"); 
            exportExcel.classList.remove("hidden");
            containerChartsPlus.classList.remove("hidden");

            const filteredExercise = exercises.filter((e) => e.date >= dateInicio && e.date <= dateFin);

            if (filteredExercise) {
                createChartsRango(filteredExercise);
                actualizarTablaRango(exercises, dateInicio, dateFin, exercise);
            } else {
                alert("No se encontraron datos para la fecha y ejercicio seleccionados.");
            }
        }  
    }

    // Ejemplo de uso: Filtrar datos y actualizar gráficos
    const filterButton = document.createElement("button");
    filterButton.textContent = "Filtrar Datos";
    filterButton.classList.add("btn", "btn-primary", "mt-3");
    document.querySelector(".containerfiltro").appendChild(filterButton);

    filterButton.addEventListener("click", function () {
        const date = dateInput.value;
        const exercise = exerciseInput.value;
        const dateInicio = dateInputInicio.value;
        const dateFin = dateInputFin.value;

        if (date && exercise || dateInicio && dateFin && exercise) {
            filterData(date, exercise, dateInicio, dateFin);
        } else {
            alert("Por favor, ingresa una fecha y un ejercicio válidos.");
        }
    });

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

        // Hacer una solicitud a la API para obtener los ejercicios
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
    });

     // Función para manejar la selección de los checkbox
     function handleCheckboxChange() {
        // Si Fecha Única está seleccionada
        if (fechaUnicaCheckbox.checked) {
            rangoFechaCheckbox.checked = false; // Desmarcar Rango de Fecha
            fechaUnicaContainer.classList.remove("hidden"); // Mostrar Fecha Única
            rangoFechaContainer.classList.add("hidden"); // Ocultar Rango de Fecha
        }
        // Si Rango de Fecha está seleccionado
        else if (rangoFechaCheckbox.checked) {
            fechaUnicaCheckbox.checked = false; // Desmarcar Fecha Única
            rangoFechaContainer.classList.remove("hidden"); // Mostrar Rango de Fecha
            fechaUnicaContainer.classList.add("hidden"); // Ocultar Fecha Única
        }
        // Si ninguno está seleccionado
        else {
            fechaUnicaContainer.classList.add("hidden"); // Ocultar Fecha Única
            rangoFechaContainer.classList.add("hidden"); // Ocultar Rango de Fecha
            containerCharts.classList.add("hidden");
            containerChartsPlus.classList.add("hidden")
            containerTableContent.classList.add("hidden"); 
            exportExcel.classList.add("hidden");
            form.reset();
        }
    }

    // Escuchar cambios en los checkbox
    fechaUnicaCheckbox.addEventListener("change", handleCheckboxChange);
    rangoFechaCheckbox.addEventListener("change", handleCheckboxChange);

    // Escuchar el clic en el botón "Limpiar Formulario"
    limpiarFormularioBtn.addEventListener("click", function () {
        form.reset(); // Resetear el formulario
        // Deshabilitar el campo de ejercicio
        document.getElementById("newexercise").disabled = true;
        fechaUnicaContainer.classList.add("hidden"); // Ocultar Fecha Única
        rangoFechaContainer.classList.add("hidden"); // Ocultar Rango de Fecha

        if (barChart) barChart.destroy(); // Destruir el gráfico anterior si existe
        if (lineChart) lineChart.destroy(); // Destruir el gráfico anterior si existe

        containerCharts.classList.add("hidden");
        containerChartsPlus.classList.add("hidden");
        containerTableContent.classList.add("hidden"); 
        exportExcel.classList.add("hidden");
    });

    //Funcion para llenar tabla
    function actualizarTabla(datos, fecha, exerc) {
        const tbody = document.querySelector("#resultTable tbody");
        tbody.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

        const filtrados = datos.filter((ejercicio) =>
            ejercicio.date === fecha && ejercicio.exercise === exerc
        );
        
        for(let i = 1; i <= filtrados[0].series.length; i++){
            const row = document.createElement("tr");
            // Series
            //const seriesCell = document.createElement("td");
           //seriesCell.textContent = "Serie " + i;
           // row.appendChild(seriesCell);

            // Si hay más de una serie, agregar una nueva fila
            const newRow = document.createElement("tr");
            //newRow.appendChild(document.createElement("td")); // Series vacía

            // Fecha
            const dateCell = document.createElement("td");
            dateCell.textContent = filtrados[0].date;
            newRow.appendChild(dateCell);

            // Grupo muscular
            const grupoMuscularCell = document.createElement("td");
            grupoMuscularCell.textContent = filtrados[0].muscleGroup;
            newRow.appendChild(grupoMuscularCell);

            // Ejercicio
            const ejercicioCell = document.createElement("td");
            ejercicioCell.textContent = filtrados[0].exercise;
            newRow.appendChild(ejercicioCell);

            // Series
            const serieCell = document.createElement("td");
            serieCell.textContent = "Serie " + i;
            newRow.appendChild(serieCell);

            // Repeticiones
            const repCell = document.createElement("td");
            repCell.textContent = filtrados[0].series[i-1].subseries.repetitions;
            newRow.appendChild(repCell);

            // Peso
            const pesoCell = document.createElement("td");
            pesoCell.textContent = filtrados[0].series[i-1].subseries.weight;
            newRow.appendChild(pesoCell);

            // Notas
            const notaCell = document.createElement("td");
            notaCell.textContent = filtrados[0].series[i-1].subseries.notes;
            newRow.appendChild(notaCell);

            // Dropset
            const dropsetCell = document.createElement("td");
            dropsetCell.textContent = filtrados[0].series[i-1].dropset;
            newRow.appendChild(dropsetCell);
            
            // DropsetAmount
            const dropsetAmountCell = document.createElement("td");
            dropsetAmountCell.textContent = filtrados[0].series[i-1].dropsetAmount;
            newRow.appendChild(dropsetAmountCell);

            
            tbody.appendChild(newRow);
            tbody.appendChild(row);

            if (filtrados[0].series[i-1].dropsets.length > 0){
                for(let j = 1; j <= filtrados[0].series[i-1].dropsets.length; j++){
                    // Si hay más de una serie, agregar una nueva fila
                    const plusnewRow = document.createElement("tr");
                    plusnewRow.appendChild(document.createElement("td"));
                    plusnewRow.appendChild(document.createElement("td"));
                    plusnewRow.appendChild(document.createElement("td"));
                    plusnewRow.appendChild(document.createElement("td"));
                    plusnewRow.appendChild(document.createElement("td"));
                    plusnewRow.appendChild(document.createElement("td"));
                    plusnewRow.appendChild(document.createElement("td"));
                    plusnewRow.appendChild(document.createElement("td"));
                    plusnewRow.appendChild(document.createElement("td"));

                    // DropsetDetalle
                    const dropsetDetailCell = document.createElement("td");
                    dropsetDetailCell.textContent = "Repeticiones: " +  filtrados[0].series[i-1].dropsets[j-1].repetitions + " - " +
                    "Peso: " +  filtrados[0].series[i-1].dropsets[j-1].weight + " - " +
                    "Nota: " +  filtrados[0].series[i-1].dropsets[j-1].notes;
                    plusnewRow.appendChild(dropsetDetailCell);
                    tbody.appendChild(plusnewRow);
                }
            }

        }
    }

     //Funcion para llenar tabla opcion rango fechas
     function actualizarTablaRango(datos, fecha_inicio, fecha_fin, exerc) {
        const tbody = document.querySelector("#resultTable tbody");
        tbody.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

        const filtrados = datos.filter((ejercicio) =>
            ejercicio.date >= fecha_inicio && ejercicio.date <= fecha_fin && ejercicio.exercise === exerc
        );
        
        filtrados.forEach((ejercicio, ejercicioIndex) =>{
            for(let i = 1; i <= filtrados[ejercicioIndex].series.length; i++){
                const row = document.createElement("tr");
                // Series
                //const seriesCell = document.createElement("td");
               //seriesCell.textContent = "Serie " + i;
               // row.appendChild(seriesCell);
    
                // Si hay más de una serie, agregar una nueva fila
                const newRow = document.createElement("tr");
                //newRow.appendChild(document.createElement("td")); // Series vacía
    
                // Fecha
                const dateCell = document.createElement("td");
                dateCell.textContent = filtrados[ejercicioIndex].date;
                newRow.appendChild(dateCell);
    
                // Grupo muscular
                const grupoMuscularCell = document.createElement("td");
                grupoMuscularCell.textContent = filtrados[ejercicioIndex].muscleGroup;
                newRow.appendChild(grupoMuscularCell);
    
                // Ejercicio
                const ejercicioCell = document.createElement("td");
                ejercicioCell.textContent = filtrados[ejercicioIndex].exercise;
                newRow.appendChild(ejercicioCell);
                    
                // Series
                const serieCell = document.createElement("td");
                serieCell.textContent = "Serie " + i;
                newRow.appendChild(serieCell);
    
                // Repeticiones
                const repCell = document.createElement("td");
                repCell.textContent = filtrados[ejercicioIndex].series[i-1].subseries.repetitions;
                newRow.appendChild(repCell);
    
                // Peso
                const pesoCell = document.createElement("td");
                pesoCell.textContent = filtrados[ejercicioIndex].series[i-1].subseries.weight;
                newRow.appendChild(pesoCell);
    
                // Notas
                const notaCell = document.createElement("td");
                notaCell.textContent = filtrados[ejercicioIndex].series[i-1].subseries.notes;
                newRow.appendChild(notaCell);
    
                // Dropset
                const dropsetCell = document.createElement("td");
                dropsetCell.textContent = filtrados[ejercicioIndex].series[i-1].dropset;
                newRow.appendChild(dropsetCell);
                
                // DropsetAmount
                const dropsetAmountCell = document.createElement("td");
                dropsetAmountCell.textContent = filtrados[ejercicioIndex].series[i-1].dropsetAmount;
                newRow.appendChild(dropsetAmountCell);
    
                
                tbody.appendChild(newRow);
                tbody.appendChild(row);
    
                if (filtrados[ejercicioIndex].series[i-1].dropsets.length > 0){
                    for(let j = 1; j <= filtrados[ejercicioIndex].series[i-1].dropsets.length; j++){
                        // Si hay más de una serie, agregar una nueva fila
                        const plusnewRow = document.createElement("tr");
                        plusnewRow.appendChild(document.createElement("td"));
                        plusnewRow.appendChild(document.createElement("td"));
                        plusnewRow.appendChild(document.createElement("td"));
                        plusnewRow.appendChild(document.createElement("td"));
                        plusnewRow.appendChild(document.createElement("td"));
                        plusnewRow.appendChild(document.createElement("td"));
                        plusnewRow.appendChild(document.createElement("td"));
                        plusnewRow.appendChild(document.createElement("td"));
                        plusnewRow.appendChild(document.createElement("td"));

                        // DropsetDetalle
                        const dropsetDetailCell = document.createElement("td");
                        dropsetDetailCell.textContent = "Repeticiones: " +  filtrados[ejercicioIndex].series[i-1].dropsets[j-1].repetitions + " - " +
                        "Peso: " +  filtrados[ejercicioIndex].series[i-1].dropsets[j-1].weight + " - " +
                        "Nota: " +  filtrados[ejercicioIndex].series[i-1].dropsets[j-1].notes;
                        plusnewRow.appendChild(dropsetDetailCell);
                        tbody.appendChild(plusnewRow);
                    }
                }
    
            }
        });        
    }

    // Función para exportar la tabla a Excel
    exportExcel.addEventListener("click", function () {
        // Obtener la tabla
        const table = document.getElementById("resultTable");

        // Crear un libro de Excel
        const workbook = XLSX.utils.book_new();

        // Convertir la tabla en una hoja de Excel
        const worksheet = XLSX.utils.table_to_sheet(table);

        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

        // Exportar el libro como archivo .xlsx
        XLSX.writeFile(workbook, "datos_ejercicios.xlsx");
    });
});