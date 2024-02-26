
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

// You shouldnt be making chronograms with more than 12 weeks, as the people
// that are going to the assigned can change (people learn new tasks, lose
// privileges, etc), and the chronogram will be outdated.
//
// The app will support generating chronograms with more than 12 weeks, but only
// to analyze how the algorithm is distributing the tasks. So anything more than
// 12 weeks will not be rendered in the UI. export const
export const maxNumberOfRenderedWeeks = 12;

export type AssignmentDistributionReport = {
    individual: string;
    totalNumberOfTimesAssigned: number;
    totalNumberOfTimesAssignedToEachTask: Map<Task, number>;
    averageWeeksBetweenAssignments: number;
}

