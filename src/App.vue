<script setup lang="ts">

import {ref} from 'vue';

import {generateChronogram} from './generate-chronogram';
import {Week, Individual, Task} from './types';
import {mockTasks, mockPeople} from './chronogram-mock-data'

// TODO:
// * Agregar la nota que se encuentra en el cronograma normal
// * Add the UI to manage tasks and people
// * Add the autoincrementing weeks based on user input
// * Add a button to print the chronogram
// * Add the ability to export the chronogram to a CSV file
// * Add the ability to move weeks up and down

const tasks = ref<Task[]>(mockTasks);
const people = ref<Individual[]>(mockPeople);
const chronogram = ref<Week[]>(generateChronogram(mockPeople, mockTasks, 8));

console.log(chronogram.value)

</script>

<template>
    <div class="container">
        <div class="dont-print">
            <h1>Cronograma de Prueba</h1>
        </div>

        <table class="table table-striped table-sm">
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
                    <td>Semana N</td>
                    <td v-for="task, index in week" :key="index">
                        {{ task.assignedTo }}
                    </td>
                </tr>
            </tbody>
        </table>
        <p class="just-print">
            <b>Nota:</b> Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odio officiis est neque culpa eos temporibus dolore beatae? Aperiam itaque eaque cum, repellat maxime quod, architecto ipsam necessitatibus doloribus hic adipisci!
        </p>
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
