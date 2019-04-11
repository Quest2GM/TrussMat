//TrussMat Solver

"use strict";
const truss = {
    pinReac: null,
    rollReac: null,
    angle: null,
    symmetric: true
};

do{
    truss.pinReac = prompt("Type in the magnitude of the pin reaction:");
} while (isNaN(truss.pinReac));
do{
    truss.rollReac = prompt("Type in the magnitude of the roller reaction force:");
} while (isNaN(truss.rollReac));
do{
    truss.angle = prompt("Type in the angle in degrees:");
} while (isNaN(truss.angle) || (truss.angle > 90 || truss.angle < 0));
truss.angle = (truss.angle/360)*2*Math.PI;

let botMem = {
    AC: {
        mag: 0,
        stress: null
    },
    CE: {
        mag: 0,
        stress: null
    },
    EG: {
        mag: 0,
        stress: null
    },
    load: 'T'
};

let topMem = {
    BD: {
        mag: 0,
        stress: null
    },
    DF: {
        mag: 0,
        stress: null
    },
    load: 'C'
};

let diagUp = {
    AB: {
        mag: 0,
        stress: null
    },
    CD: {
        mag: 0,
        stress: null
    },
    EF: {
        mag: 0,
        stress: null
    },
    load: 'C'
};

let diagDown = {
    BC: {
        mag: 0,
        stress: null
    },
    DE: {
        mag: 0,
        stress: null
    },
    FG: {
        mag: 0,
        stress: null
    },
    load: 'T'
};

diagUp.AB.mag = truss.pinReac/Math.sin(truss.angle);
console.log("AB = " + diagUp.AB.mag);

botMem.AC.mag = diagUp.AB.mag*Math.cos(truss.angle);
console.log("AC = " + botMem.AC.mag);

diagDown.BC.mag = diagUp.AB.mag
console.log("BC = " + diagDown.BC.mag);

topMem.BD.mag = diagUp.AB.mag*Math.cos(truss.angle) + diagDown.BC.mag*Math.cos(truss.angle);
console.log("BD = " + topMem.BD.mag);

diagUp.CD.mag = diagDown.BC.mag*Math.sin(truss.angle) - truss.pinReac;
console.log("CD = " + diagUp.CD.mag);

botMem.CE.mag = diagDown.BC.mag*Math.cos(truss.angle) + botMem.AC.mag + diagUp.CD.mag*Math.sin(truss.angle);
console.log("CE = " + botMem.CE.mag);

diagDown.DE.mag = diagUp.CD.mag;
console.log("DE = " + diagDown.DE.mag);

topMem.DF.mag = topMem.BD.mag;
console.log("DF = " + topMem.DF.mag);

diagUp.EF.mag = diagDown.BC.mag;
console.log("EF = " + diagUp.EF.mag);

botMem.EG.mag = botMem.AC.mag;
console.log("EG = " + botMem.EG.mag);

diagDown.FG.mag = diagUp.AB.mag;
console.log("FG = " + diagDown.FG.mag);