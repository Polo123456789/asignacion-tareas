import { Individual, Task } from './types'


export const mockTasks: Task[] = [
    "Computadora",
    "Sonido",
    "Plataforma",
    "Micronofono 1",
    "Micronofono 2",
    "Acomodador",
]

export const mockPeople: Individual[] = [
    {
        name: "Juan",
        canDo: [...mockTasks]
    },
    {
        name: "Pedro",
        canDo: [...mockTasks]
    },
    {
        name: "Maria",
        canDo: [...mockTasks]
    },
    {
        name: "Ana",
        canDo: [...mockTasks]
    },
    {
        name: "Luis",
        canDo: [...mockTasks]
    },
    {
        name: "Carlos",
        canDo: [...mockTasks]
    },
    {
        name: "Jose",
        canDo: [...mockTasks]
    },
    {
        name: "Rosa",
        canDo: [...mockTasks]
    },
    {
        name: "Sofia",
        canDo: [
            "Micronofono 1",
            "Micronofono 2",
            "Plataforma",
        ]
    },
    {
        name: "Luisa",
        canDo: [
            "Micronofono 1",
            "Micronofono 2",
            "Plataforma",
            "Acomodador",
        ]
    },
    {
        name: "Lorena",
        canDo: [
            "Plataforma",
            "Acomodador",
        ]
    },
    {
        name: "Fernando",
        canDo: [
            "Micronofono 1",
            "Micronofono 2",
        ]
    },
]
