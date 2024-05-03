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

    // Loop back infinetly
    function makePossibleWeeksIterator() {
        let i = 0;
        return {
            next: () => {
                if (i === possibleWeeks.length) {
                    i = 0;
                }
                return possibleWeeks[i++];
            }
        }
    }

    const possibleWeeksIterator = makePossibleWeeksIterator();
    let loopCount = 0;

    for (let i = 0; i < noWeeks - 1; i++) {
        while (loopCount++ < possibleWeeks.length) {
            const week = possibleWeeksIterator.next();
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
        if (loopCount >= possibleWeeks.length) {
            // We cant generate more weeks
            break;
        }
        loopCount = 0;
    }

    return weeks;
}
