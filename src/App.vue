<script setup lang="ts">

import {ref, toRaw} from 'vue';

import {generateChronogram} from './generate-chronogram';
import {Week, Individual, Task} from './types';

import { useLocalStorage } from './composables/useLocalStorage';

const tasks = useLocalStorage<Task[]>('tasks', []);
const people = useLocalStorage<Individual[]>('people', []);
const weeks = useLocalStorage<number>('weeks', 8);
const startDate = ref(new Date());
const chronogram = useLocalStorage<Week[]>('chronogram', []);
const weeksTilAssigmentRepeat = useLocalStorage<number>('weeksTilAssigmentRepeat', 3);

const inputTask = ref<Task>('');

const addTask = () => {
    if (inputTask.value.trim() === '') {
        return;
    }

    tasks.value.push(inputTask.value);
    inputTask.value = '';
}

const inputIndividualName = ref('');

const addIndividual = () => {
    if (inputIndividualName.value.trim() === '') {
        return;
    }

    people.value.push({
        name: inputIndividualName.value,
        canDo: []
    });
    inputIndividualName.value = '';
}

const toggleIndividualTask = (individual: Individual, task: Task) => {
    if (individual.canDo.includes(task)) {
        individual.canDo = individual.canDo.filter((t) => t !== task);
    } else {
        individual.canDo.push(task);
    }
}

const individualCanDoTask = (individual: Individual, task: Task) => {
    return individual.canDo.includes(task);
}

const dateInput = ref<HTMLInputElement | null>(null);
const setDate = () => {
    if (!dateInput.value) {
        alert('Alguien se encargó de borrar el input de fecha. No debería pasar esto.');
        return;
    }
    // Adjust for locale GMT-0600 (Central Standard Time)}
    startDate.value = new Date(dateInput.value.value + 'T00:00:00-06:00');
}

const getWeekTextDescription = (weeksFromStart: number) => {
    const start = new Date(startDate.value);
    start.setDate(start.getDate() + weeksFromStart * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `Semana del ${start.getDate()}/${start.getMonth() + 1} al ${end.getDate()}/${end.getMonth() + 1}`;
}

const runChronogramGenerator  = () => {
    chronogram.value = generateChronogram(toRaw(people.value),
                                          toRaw(tasks.value),
                                          weeks.value,
                                          weeksTilAssigmentRepeat.value);
}

const printChronogram = () => {
    alert('Recuerde colocar la hoja en orientación horizontal antes de imprimir.');
    window.print();
}

const clearChronogram = () => {
    chronogram.value = [];
}

const weekUp = (index: number) => {
    if (index === 0) {
        return;
    }

    const temp = chronogram.value[index - 1];
    chronogram.value[index - 1] = chronogram.value[index];
    chronogram.value[index] = temp;
}

const weekDown = (index: number) => {
    if (index === chronogram.value.length - 1) {
        return;
    }

    const temp = chronogram.value[index + 1];
    chronogram.value[index + 1] = chronogram.value[index];
    chronogram.value[index] = temp;
}

const exportConfig = () => {
    const config = {
        tasks: tasks.value,
        people: people.value,
        weeks: weeks.value,
        weeksTilAssigmentRepeat: weeksTilAssigmentRepeat.value
    };

    navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
        alert('Configuración copiada al portapapeles');
    }).catch(() => {
        alert('No se pudo copiar la configuración al portapapeles');
    });
}

const importConfig = () => {
    const config = prompt('Pega el JSON aquí');
    if (!config) {
        return;
    }

    try {
        const parsed = JSON.parse(config);
        tasks.value = parsed.tasks;
        people.value = parsed.people;
        weeks.value = parsed.weeks;
        weeksTilAssigmentRepeat.value = parsed.weeksTilAssigmentRepeat;
    } catch (e) {
        alert('No se pudo importar el JSON');
    }
}

</script>

<template>
    <div class="container">
        <div class="dont-print mt-3 mb-3">
            <h2>Generador de cronograma</h2>
            <div class="row mb-3">
                <div class="col">
                    <h4>Asignados</h4>
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" v-model="inputIndividualName" @keyup.enter="addIndividual">
                        <button class="btn btn-dark" @click="addIndividual">
                            Agregar asignado
                        </button>
                    </div>
                    <ul class="list-group">
                        <li class="list-group-item d-flex" v-for="person, index in people" :key="index">
                            <details>
                                <summary>{{ person.name }}</summary>
                                <ul class="list-group list-group-flush w-100">
                                    <li class="list-group-item d-flex gap-3" v-for="task, index in tasks" :key="index">
                                        <input type="checkbox" :checked="individualCanDoTask(person, task)" @change="toggleIndividualTask(person, task)">
                                        <label :for="task" @click="toggleIndividualTask(person, task)">{{ task }}</label>
                                    </li>
                                </ul>
                            </details>
                            <span class="ms-auto badge bg-danger h-100" @click="people.splice(index, 1)">X</span>
                        </li>
                    </ul>
                </div>
                <div class="col">
                    <h4>Tareas</h4>
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" v-model="inputTask" @keyup.enter="addTask">
                        <button class="btn btn-dark" @click="addTask">
                            Agregar tarea
                        </button>
                    </div>
                    <ul class="list-group">
                        <li class="list-group-item d-flex" v-for="task, index in tasks" :key="index">
                            {{ task }} <span class="ms-auto badge bg-danger" @click="tasks.splice(index, 1)">X</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <div class="input-group mb-3">
                        <label for="weeks" class="input-group-text">Cantidad de Semanas</label>
                        <input type="number" class="form-control" id="weeks" v-model="weeks">
                    </div>
                </div>
                <div class="col">
                    <div class="input-group mb-3">
                        <label for="startDate" class="input-group-text">Fecha de inicio</label>
                        <input type="date" class="form-control" id="startDate" ref="dateInput" @change="setDate()">
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div class="input-group mb-3" style="max-width: 400px;" >
                    <label for="weeksTilAssigmentRepeat" class="input-group-text">Semanas hasta repetir asignación</label>
                    <input type="number" class="form-control" id="weeksTilAssigmentRepeat" v-model="weeksTilAssigmentRepeat">
                </div>
            </div>
            <div class="d-flex justify-content-right gap-3" >
                <template v-if="tasks.length != 0 && people.length != 0">
                    <button class="btn btn-dark" @click="runChronogramGenerator">
                        Generar cronograma
                    </button>
                    <button class="btn btn-dark" @click="printChronogram">
                        Imprimir cronograma
                    </button>
                    <button class="btn btn-danger" @click="clearChronogram">
                        Limpiar cronograma
                    </button>
                </template>
                <button class="ms-auto btn btn-dark" @click="exportConfig">
                    Exportar configuración
                </button>
                <button class="btn btn-dark" @click="importConfig">
                    Importar configuración
                </button>
            </div>
            <hr/>
        </div>
        <table class="table table-striped table-sm" v-if="chronogram.length != 0">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th v-for="task, index in tasks" :key="index">
                        {{ task }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="week, index in chronogram" :key="index">
                    <td>{{ getWeekTextDescription(index) }}</td>
                    <td v-for="task, index in week" :key="index">
                        {{ task.assignedTo }}
                    </td>
                    <!-- Make buttons for moving rows up and down -->
                    <td class="dont-print">
                        <button class="btn btn-dark" @click="weekUp(index)">
                            &uarr;
                        </button>
                        &nbsp;
                        <button class="btn btn-dark" @click="weekDown(index)">
                            &darr;
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p class="just-print">
            <b>Nota:</b> Los hermanos asignados en seccion de Zoom seran los
            encargados de abrir las sesiones de predicacion entre semana y las
            fechas indicadas. Acomodador zoom sera el encargado de enviar la
            asistencia a JOSUE ORELLANA
        </p>
    </div>
    <div class="dont-print">
            <footer class="text-center mx-auto" style="max-width: 40rem;">
                <details>
                    <summary>
                       Copyright (C) 2023 Pablo Sanchez
                    </summary>
                    <p>
                        Este programa es software libre: puede redistribuirlo y/o modificarlo
                        bajo los términos de la Licencia Pública General de GNU publicada por
                        la Free Software Foundation, ya sea la versión 3 de la Licencia o
                        (a su elección) cualquier versión posterior.
                    </p>
                    <p>
                        Este programa se distribuye con la esperanza de que sea útil,
                        pero SIN NINGUNA GARANTÍA; ni siquiera la garantía implícita de
                        COMERCIALIZACIÓN o IDONEIDAD PARA UN FIN PARTICULAR. Consulte la
                        Licencia Pública General de GNU para más detalles.
                    </p>
                </details>
            </footer>
        </div>
    
</template>

<style scoped>

.just-print {
    display: none;
}

@media print {
    * {
        font-size: 12px;
    }

    .container {
        width: 100%;
        margin: 0;
        padding: 0;
        max-width: 100%;
    }

    .dont-print {
        display: none;
    }

    .just-print {
        display: block;
    }
}
</style>
