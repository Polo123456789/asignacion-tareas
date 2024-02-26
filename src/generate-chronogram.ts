import { Task, Individual, Week } from './types'
import { shuffleArray } from './utils'

function generateCanDoRandomized(individual: Individual, originalPeople: Individual[]) {
    const originalIndividual = originalPeople.find(p => p.name === individual.name);
    if (!originalIndividual) {
        throw new Error('Individual not found');
    }
    const canDo = structuredClone(originalIndividual.canDo);
    shuffleArray(canDo);
    return canDo;
}

function generatePeopleListRandomized(originalPeople: Individual[]) {
    const people = structuredClone(originalPeople);

    for (const individual of people) {
        individual.canDo = generateCanDoRandomized(individual, originalPeople);
    }

    shuffleArray(people);
    return people;
}

function allTasksAssigned(week: Week) {
    return week.every(assignedTask => assignedTask.assignedTo !== "");
}

function isIndividualAssigned(week: Week, name: string) {
    return week.some(assignedTask => assignedTask.assignedTo === name);
}

function taskIsAlreadyAssigned(week: Week, task: Task) {
    return week.some(t => {
        return t.task === task
               && t.assignedTo !== "";
    });
}

function individualCanDoAFreeTask(week: Week, individual: Individual) {
    return individual.canDo.some(task => {
        return !taskIsAlreadyAssigned(week, task);
    });
}

export function generateChronogram(originalPeople: Individual[],
                                   tasks: Task[],
                                   noWeeks: number) {
    const weeks: Week[] = [];
    const people = generatePeopleListRandomized(originalPeople);
    function regenerateCanDoList() {
        for (const individual of people) {
            individual.canDo = generateCanDoRandomized(individual, originalPeople);
        }
    }

    // It loops back infinitely so we can keep assigning tasks
    function makePeopleIterator() {
        let i = 0;
        return {
            next: () => {
                if (i === people.length) {
                    i = 0;
                }
                return people[i++];
            }
        }
    }
    const peopleIterator = makePeopleIterator();

    for (let i = 0; i < noWeeks; i++) {
        // Empty name means the task is not assigned
        const week: Week = tasks.map(task => ({ task, assignedTo: "" }));

        let noLoops = 0;
        while (!allTasksAssigned(week)) {
            ++noLoops;
            // We looped through all the people and no one can do a task
            if (noLoops > people.length) {
                regenerateCanDoList();
                noLoops = 0;
            }

            const individual = peopleIterator.next();

            if (isIndividualAssigned(week, individual.name)
                || individual.canDo.length === 0
                || !individualCanDoAFreeTask(week, individual)) {

                continue;
            }

            for (const task of individual.canDo) {
                if (!taskIsAlreadyAssigned(week, task)) {
                    const t = week.find(t => t.task === task)
                    t.assignedTo = individual.name;
                    // He has fullfiled the task, remove it from his can do list
                    // so he gets an equal chance of doing all the tasks
                    individual.canDo = individual.canDo.filter(t => t !== task);
                    break;
                }
            }
        }

        weeks.push(week);
    }

    return weeks;
}
