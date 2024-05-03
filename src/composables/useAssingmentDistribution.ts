import { Ref, computed } from 'vue'
import {Individual, Task, Week, AssignmentDistributionReport} from './../types'

export function useAssignmentDistribution(individuals: Ref<Individual[]>, tasks: Ref<Task[]>, chronogram: Ref<Week[]>) {
    return computed(() => {
        const report: AssignmentDistributionReport[] = [];

        for (const i of individuals.value) {
            const reportForIndividual: AssignmentDistributionReport = {
                individual: i.name,
                totalNumberOfTimesAssigned: 0,
                totalNumberOfTimesAssignedToEachTask: new Map(),
            }

            for (const t of tasks.value) {
                reportForIndividual.totalNumberOfTimesAssignedToEachTask.set(t, 0);
            }

            for (const week of chronogram.value) {
                for (const assignedTask of week) {
                    if (assignedTask.assignedTo === i.name) {
                        reportForIndividual.totalNumberOfTimesAssigned++;
                        const currentCount = reportForIndividual.totalNumberOfTimesAssignedToEachTask.get(assignedTask.task);
                        if (currentCount !== undefined) {
                            reportForIndividual.totalNumberOfTimesAssignedToEachTask.set(assignedTask.task, currentCount + 1);
                        }
                    }
                }
            }

            report.push(reportForIndividual);
        }

        return report;
    })
}
