
export type Task = string;

export type Individual = {
    name: string;
    canDo: Task[];
}

export type AssignedTask = {
    task: Task;
    assignedTo: string;
}

export type Week = AssignedTask[];

export type AssignmentDistributionReport = {
    individual: string;
    totalNumberOfTimesAssigned: number;
    totalNumberOfTimesAssignedToEachTask: Map<Task, number>;
    averageWeeksBetweenAssignments: number;
}

