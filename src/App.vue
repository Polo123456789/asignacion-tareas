<script setup lang="ts">

import {ref, toRaw, computed} from 'vue';

import {generateChronogram} from './generate-chronogram';
import {Week, Individual, Task} from './types';

import { useLocalStorage } from './composables/useLocalStorage';
import { useAssignmentDistribution } from './composables/useAssingmentDistribution';

const tasks = useLocalStorage<Task[]>('tasks', []);
const people = useLocalStorage<Individual[]>('people', []);
const weeks = useLocalStorage<number>('weeks', 8);
const startDate = ref(new Date());
const chronogram = useLocalStorage<Week[]>('chronogram', []);
const weeksTilAssigmentRepeat = useLocalStorage<number>('weeksTilAssigmentRepeat', 3);
const notesOnPrint = useLocalStorage<string>('notesOnPrint', 'En caso de no poder cumplir con su asignacion porfavor notificar al encargado para que se pueda reasignar');
const title = useLocalStorage<string>('title', '');
const assignmentDistribution = useAssignmentDistribution(people, tasks, chronogram);

// {{{ Config UI

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

// }}}

// {{{ Chronogram UI

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

const noOfPeopleThatCanDo = computed(() => {
    const noOfPeopleThatCanDo = new Map<Task, number>();
    for (const task of tasks.value) {
        noOfPeopleThatCanDo.set(task, people.value.filter((person) => person.canDo.includes(task)).length);
    }

    return noOfPeopleThatCanDo;
});

// }}}

// {{{ Config Import/Export

const exportConfig = () => {
    const data = {
        tasks: tasks.value,
        people: people.value,
        weeksTilAssigmentRepeat: weeksTilAssigmentRepeat.value,
        notesOnPrint: notesOnPrint.value
    };

    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(url);
}

const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target?.result as string);
            tasks.value = data.tasks;
            people.value = data.people;
            weeksTilAssigmentRepeat.value = data.weeksTilAssigmentRepeat;
            notesOnPrint.value = data.notesOnPrint;
        }
        reader.readAsText(file);
    }
    input.click();
}

// }}}

</script>

<template>
    <!-- {{{ Configuracion -->
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
                        <li class="list-group-item d-flex align-items-center gap-3" v-for="task, index in tasks" :key="index">
                            <span>{{ task }}</span>
                            <span class="ms-auto">({{noOfPeopleThatCanDo.get(task)}})</span>
                            <span class="badge bg-danger" @click="tasks.splice(index, 1)">X</span>
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
            <div class="input-group mb-3">
                    <label class="input-group-text">Titulo</label>
                    <input type="text" class="form-control" v-model="title">
            </div>
            <div class="mb-3">
                <h4>Notas &nbsp;<span class="badge bg-secondary fs-5">Opcional</span></h4>
                <textarea class="form-control" v-model="notesOnPrint" rows="3"></textarea>
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
        <!-- }}} -->
        <!-- {{{ Chronogram --->
        <h2 v-if="title" class="mb-3 text-center">{{ title }}</h2>
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
        <p class="just-print" v-if="notesOnPrint">
            <b>Nota:</b>&nbsp;
            <pre>{{ notesOnPrint }}</pre>
        </p>
    </div>
    <!-- }}} -->
    <!-- {{{ Distribuition Analisis -->
    <hr class="mt-3 dont-print"/>
    <details class="dont-print container">
        <summary>
            Análisis de distribución
        </summary>
        <ul class="list-group">
            <li class="list-group-item" v-for="distribution, index in assignmentDistribution" :key="index">
                <span>
                    {{distribution.individual}} fue asignado {{distribution.totalNumberOfTimesAssigned}} veces
                </span>
                <ul>
                    <li v-for="[task, times], index in distribution.totalNumberOfTimesAssignedToEachTask" :key="index">
                        <b>{{task}}:</b> {{times}}
                    </li>
                </ul>
            </li>
        </ul>
    </details>
	<hr class="mt-3 dont-print"/>
    <!-- }}} -->
    <!-- {{{ Footer -->
    <div class="dont-print">
        <footer class="text-center mx-auto mb-3" style="max-width: 40rem;">
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
                <a href="/generador-programas-av/LICENCE.txt">Ver Licencia</a>
                <br/>
                <a href="https://github.com/Polo123456789/generador-programas-av">Github</a>
            </details>
        </footer>
    </div>
    <!-- }}} -->
</template>

<style scoped>

.just-print {
    display: none;
}

@media print {
    table, p {
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
