import { Task, Individual, Week } from './types'
import { shuffleArray } from './utils'


const generateAllPossibleWeeks = (people: Individual[], tasks: Task[]) => {
    const weeks: Week[] = [];
    const peopleCanDo: { [name: string]: Task[] } = {};

    for (const individual of people) {
        peopleCanDo[individual.name] = individual.canDo;
    }

    const generateWeek = (week: Week, peopleCanDo: { [name: string]: Task[] }) => {
        if (week.length === tasks.length) {
            weeks.push(week);
            return;
        }

        const task = tasks[week.length];
        for (const name in peopleCanDo) {
            if (peopleCanDo[name].includes(task)) {
                const newWeek = [...week, { task, assignedTo: name }];
                const newPeopleCanDo = { ...peopleCanDo };
                delete newPeopleCanDo[name];
                generateWeek(newWeek, newPeopleCanDo);
            }
        }
    }

    generateWeek([], peopleCanDo);
    return weeks;
}

export function generateChronogram(originalPeople: Individual[],
                                   tasks: Task[],
                                   noWeeks: number,
                                   weeksTilAssigmentRepeat: number) {

    const people = structuredClone(originalPeople);
    const possibleWeeks: Week[] = generateAllPossibleWeeks(people, tasks);
    shuffleArray(possibleWeeks);
    const weeks: Week[] = [];

    weeks.push(possibleWeeks[Math.floor(Math.random() * possibleWeeks.length)]);

    for (let i = 0; i < noWeeks - 1; i++) {
        for (let j = 0; j < possibleWeeks.length; j++) {
            const week = possibleWeeks[j];
            const lastWeeks = weeks.slice(-weeksTilAssigmentRepeat);
    
            const isGoodWeek = lastWeeks.every(lastWeek => {
                return !lastWeek.some((task, index) => {
                    return task.assignedTo === week[index].assignedTo;
                });
            });

            if (isGoodWeek) {
                weeks.push(week);
                break;
            }
        }
    }

    return weeks;
}                             
