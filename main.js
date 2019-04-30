/* Project One: TrussMat
    This project was started on December 21st, 2018. The goal of this project is to help First Year Engineering Science students with the first bridge project they must complete in CIV102, a civil engineering stuctures course. This truss solver solves statically determinate truss bridges with the method of joints, solves the virtual truss, gives you the best possible HSS configuration, finds the virtual work and outputs all data in a table.
*/
"use strict";   //Helpful for debugging

//Canvas Variables
let canvas = document.getElementById("newCanvas")   //The canvas which is being displayed on scree
let context = canvas.getContext("2d");              //The type of context being used; 2D in this case
let rect = canvas.getBoundingClientRect();          //Refers to the rectangle with the 1 px black border (ie. what creates the canvas)
let snapShot;                                       //Used to prevent multiple lines begin created during member-joint created

//Type Activation Variables
let memberJointButtonActive = false;  //True if the user has clicked the member pin button
let pinButtonActive = false;          //True if the user has clicked the pin button
let rollerButtonActive = false;       //True if the user has clicked the roller button
let loadButtonActive = false;       //True if the user has clicked the remove button
let solveTrussActive = false;

//Line Property Variables
let lineBegin = false;     //This indicates whether the user has begun creating the member-joint line or not
let startX;                //Stores the start x-coordinate of the joint
let startY;                //Stores the start y-coordinate of the joint
let endX;                  //Stores the end x-coordinate of the joint
let endY;                  //Stores the end y-coordinate of the joint
let mousePos;              //Gets the x and y coordinate of the user's cursor at a specific instance
let len;                    //The length of the joint that is created in metres
let angle;                 //The acute angle to the horizontal of the joint-member in degrees
let angleDisplayed;
let actualSize = 52;       //The scaled size of the canvas width, indicating the span of the bridge (plus 10 metres)

//Paragraph Changer Variables
let lengthText = document.getElementById("lengthText");     //Text updates to the screen regarding the current length of the member-joint
let angleText = document.getElementById("angleText");       //Text updater to the screen regarding the curring angle of the member-joint
let posXText = document.getElementById("posX");
let posYText = document.getElementById("posY");
let loadText = document.getElementById("loadText");
let loadDiv = document.getElementById("loadDiv");
let loadTable = document.getElementById("loadTable");
let virtualText = document.getElementById("virtualText");
let yieldText = document.getElementById("yieldText");
let modOfEText = document.getElementById("modOfEText");
let canvLText = document.getElementById("canvLText");
let canvAText = document.getElementById("canvAText");
let canvLLabel = document.getElementById("canvLLabel");
let canvALabel = document.getElementById("canvALabel");
let errorModal = document.getElementById("errorModal");
let errorModalBody = document.getElementById("modalBodyText");
let closeModalBtn = document.getElementsByClassName("closeModalBtn")[0];

//Member Property Variables
let newMember;           //When a new member is created with its respective constructor, it is stored in this variable
let memberArray = [];    //The newMember variable is immediately stored in this array
let memberArraySort = [];
let currStartX;          //When the user clicks in the joint to begin a new member, stores the x-coordinate
let currStartY;          //When the user clicks in the joint to begin a new member, stores the y-coordinate
let currEndX;            //When the user clicks in the joint to end a new member, stores the x-coordinate
let currEndY;            //When the user clicks in the joint to end a new member, stores the y-coordinate
let useCurr = false;

//Joint Property Variables
let newJoint;                           //When a new joint is created with its repective constructor, it is stored in this variable
let jointArray = [];                    //The newJoint variable is immediately stored in this array
let jointArraySort = [];
let numMember = 0;                      //Indicates which member it is attached to
let clickedStartMouseInJoint = false;   //When beginning the member, indicates whether the start position is already within a joint
let clickedEndMouseInJoint = false;     //When beginning the member, indicates whether the end position is already within a joint
let startJointVisible = true;           //If the start joint is overwritten, this is false
let endJointVisible = true;             //If the star joint is overwritten, this is false

//Support Property Variables
let newPin;             //When a new pin is created, it is stored here
let pinArray = [];      //newPin is immediately stored in this array
let newRoller;          //When a new roller is created, it is stored here
let rollerArray = [];   //newRoller is immediately stored in this array
let newLoad;            //When a new load is created, it is stored here
let loadArray = [];     //newLoad is immediately stored in this array
let currX;              //Stores the x-coordinate if the user clicks in a joint to add a support
let currY;              //Stores the y-coordinate if the user clicks in a joint to add a support

//Undo History
let undoHistory = [];   //For the undo button functionality.
let typeHistory = [];   //To track what was added to the canvas

//Other
let switAngText = false;
let enterFunc = false;

//Constructor Function to build new members, joints, pins loads and rollers
function Member(startX, startY, endX, endY, len, angle) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.len = len;
    this.angle = angle;
    this.memberLabel = "";
    this.jointA = "";
    this.jointB = "";
    this.direcNumEW;
    this.direcNumNS;
    this.stressForce;
    this.virtualForce;
    this.areaHSS;
    this.moiHSS;
    this.rGyrHSS;
    this.nAreaHSS;
    this.nMoiHSS;
    this.nRGyrHSS;
    this.HSS;
    this.vWork;

    context.beginPath();
    context.moveTo(this.startX, this.startY);
    context.lineTo(this.endX, this.endY);
    context.lineWidth = 5;
    context.strokeStyle = "#5477ea";
    context.stroke();
}
function Joint(posX, posY, numMember) {
    this.posX = posX;
    this.posY = posY;
    this.numMember = numMember;
    this.radius = 10;
    this.colour = "#909696";
    this.jointLabel = "";
    this.hasPin = false;
    this.hasRoller = false;
    this.hasLoad = false;

    context.beginPath();
    context.moveTo(this.posX, this.posY);
    context.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.colour;
    context.fill();
}
function Pin(posX, posY) {
    this.posX = posX;
    this.posY = posY;
    this.pinLabelX = "";
    this.pinLabelY = "";

    context.beginPath();
    context.moveTo(this.posX, this.posY);
    context.lineTo(this.posX + 20, this.posY + Math.sqrt(1200));
    context.lineTo(this.posX - 20, this.posY + Math.sqrt(1200));
    context.fillStyle = "#ff0003";
    context.fill();
}
function Roller(posX, posY) {
    this.posX = posX;
    this.posY = posY;
    this.rollerLabel = "";

    context.beginPath();
    context.moveTo(this.posX, this.posY);
    context.arc(this.posX, this.posY + 18, 17, 0, 7);
    context.fillStyle = "#ff0003";
    context.fill();
}
function Load(posX, posY, mag) {
    this.posX = posX;
    this.posY = posY;
    this.mag = mag;
    this.loadLabel = "";

    context.beginPath();
    context.moveTo(this.posX, this.posY);
    context.lineTo(this.posX, this.posY + 50);
    context.moveTo(this.posX, this.posY + 49);
    context.lineTo(this.posX - 10, this.posY + 39);
    context.moveTo(this.posX, this.posY + 49);
    context.lineTo(this.posX + 10, this.posY + 39);
    context.fillStyle = "black";
    context.fillRect(this.posX - 2, this.posY + 47, 4, 4);
    context.strokeStyle = "black";
    context.stroke();
    context.font = "18px Cambria";
    context.fillStyle = "black";
    context.fillText(this.mag + " kN", this.posX - 30, this.posY + 70);
}

//Temporary Creations for a Member and Joints
function tempMember(posX, posY) {
    context.beginPath();
    if (clickedStartMouseInJoint) {
        context.moveTo(currStartX, currStartY);
        len = calcLength(posY, currStartY, posX, currStartX);
        angle = calcRealAngle(posY, currStartY, posX, currStartX);
    } else {
        context.moveTo(startX, startY);
        len = calcLength(posY, startY, posX, startX);
        angle = calcRealAngle(posY, startY, posX, startX);
    }
    lengthText.textContent = "Length: " + len + " m";
    angleText.textContent = "Angle: " + angle + " deg";
    context.lineTo(posX, posY);
    context.lineWidth = 5;
    context.strokeStyle = "#5477ea";
    context.stroke();
}
function tempJoint(posX, posY, colour) {
    context.beginPath();
    context.moveTo(posX, posY);
    context.arc(posX, posY, 10, 0, 2 * Math.PI);
    context.fillStyle = colour;
    context.fill();
}

//Returns the coordinates of the mouse
function getMousePos(event) {
    return {
        x: event.pageX - rect.left,
        y: event.pageY - rect.top
    };
}

//Checks if the cursor is within a joint
function inJoint() {
    mousePos = getMousePos(event);
    for (let joints of jointArray) {
        if (distanceBetween(mousePos.x, mousePos.y, joints.posX, joints.posY) < joints.radius) {
            if (lineBegin && memberJointButtonActive) {
                currStartX = joints.posX;
                currStartY = joints.posY;
                clickedStartMouseInJoint = true;
            } else if (!lineBegin && memberJointButtonActive) {
                currEndX = joints.posX;
                currEndY = joints.posY;
                clickedEndMouseInJoint = true;
            } else {
                currX = joints.posX;
                currY = joints.posY;
            }
            return true;
        }
    }
    return false;
}

//Calculation Functions: Length, Angles, Distance
function calcLength(y2, y1, x2, x1) {
    return Math.floor(Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)) * ((actualSize + 10) / canvas.width) * 100) / 100;
}
function calcAngle(y2, y1, x2, x1) {
    return Math.floor((Math.abs((Math.atan((y2 - y1) / (x2 - x1))) / (2 * Math.PI) * 360)) * 10) / 10;
}
function calcRealAngle(y2, y1, x2, x1) {
    if (y2 < y1 && x2 < x1) // Quadrant 2
        return 180 - Math.floor((Math.abs((Math.atan((y1 - y2) / (x2 - x1))) / (2 * Math.PI) * 360)) * 10) / 10;
    else if (y2 > y1 && x2 < x1) // Quadrant 3
        return 180 + Math.floor((Math.abs((Math.atan((y1 - y2) / (x2 - x1))) / (2 * Math.PI) * 360)) * 10) / 10;
    else if (y2 > y1 && x2 > x1) // Quadrant 4
        return 360 - Math.floor((Math.abs((Math.atan((y1 - y2) / (x2 - x1))) / (2 * Math.PI) * 360)) * 10) / 10;
    else // Quadrant 1
        return Math.floor((Math.abs((Math.atan((y1 - y2) / (x2 - x1))) / (2 * Math.PI) * 360)) * 10) / 10;
}
function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

//Allows you to drag members
function takeSnapShot() {
    snapShot = context.getImageData(0, 0, canvas.width, canvas.height);
}
function restoreSnapShot() {
    context.putImageData(snapShot, 0, 0);
}

//Undo Function
function copyLast() {
    undoHistory.push(context.getImageData(0, 0, canvas.width, canvas.height));
}

//Checks if member has already been created at a location
function checkCreate(X1, X2, Y1, Y2) {
    if (X1 === X2 && Y1 === Y2) {
        return false;
    }
    for (let i of memberArray) {
        if (i.startX === X1 && i.endX == X2 && i.startY === Y1 && i.endY === Y2) {
            return false;
        }
    }
    return true;
}

//Function to Reset for Next Iteration
function reset() {
    numMember++;
    clickedStartMouseInJoint = false;
    clickedEndMouseInJoint = false;
    startJointVisible = true;
    endJointVisible = true;
    canvLText.value = "";
    canvAText.value = "";
    useCurr = false;
    switAngText = false;
    enterFunc = false;
}

//MouseDown Functions
function createMember() {
    if (!lineBegin) {
        lineBegin = true;
        startX = mousePos.x;
        startY = mousePos.y;
        copyLast();
        if (inJoint()) {
            useCurr = true;
            tempJoint(currStartX, currStartY, "#909696");
        } else {
            useCurr = false;
            tempJoint(startX, startY, "#909696");
        }
        takeSnapShot();
    } else if (lineBegin) {
        restoreSnapShot();
        lineBegin = false;
        endX = mousePos.x;
        endY = mousePos.y;
        inJoint();

        if (clickedStartMouseInJoint) {
            startX = currStartX;
            startY = currStartY;
            startJointVisible = false;
        }
        if (clickedEndMouseInJoint) {
            endX = currEndX;
            endY = currEndY;
            endJointVisible = false;
        }

        //Calculate Lengths and Angles
        len = calcLength(endY, startY, endX, startX);
        angle = calcAngle(endY, startY, endX, startX);
        angleDisplayed = calcRealAngle(endY, startY, endX, startX);

        //Create and Store New Members and Joints
        if (checkCreate(startX, endX, startY, endY) === true) {
            newMember = new Member(startX, startY, endX, endY, len, angle);
            memberArray.push(newMember);
            newJoint = new Joint(startX, startY, numMember);
            if (startJointVisible == true) {
                jointArray.push(newJoint);
                typeHistory.push("J");
            }
            newJoint = new Joint(endX, endY, numMember);
            if (endJointVisible == true) {
                jointArray.push(newJoint);
                typeHistory.push("J");
            }
            typeHistory.push("M");
        } else {
            context.putImageData(undoHistory[undoHistory.length - 1], 0, 0);
            undoHistory.pop();
            angleDisplayed = 0;
        }
        //Length and Angle Updates to the Screen
        lengthText.textContent = "Length: " + len + " m";
        angleText.textContent = "Angle: " + angleDisplayed + " deg";

        //Reset necessary variables to default
        reset();
    }
}

function createMemberWithKey() {
    restoreSnapShot();
    lineBegin = false;
    if (useCurr) {
        endX = (canvas.width * parseFloat(canvLText.value) * Math.cos(Math.PI * parseFloat(canvAText.value) / 180)) / (actualSize + 10) + currStartX;
        endY = (canvas.width * parseFloat(canvLText.value) * Math.sin(Math.PI * (parseFloat(canvAText.value) - 180) / 180)) / (actualSize + 10) + currStartY;
    } else {
        endX = (canvas.width * parseFloat(canvLText.value) * Math.cos(Math.PI * parseFloat(canvAText.value) / 180)) / (actualSize + 10) + startX;
        endY = (canvas.width * parseFloat(canvLText.value) * Math.sin(Math.PI * (parseFloat(canvAText.value) - 180) / 180)) / (actualSize + 10) + startY;
    }

    inJoint();

    if (clickedStartMouseInJoint) {
        startX = currStartX;
        startY = currStartY;
        startJointVisible = false;
    }
    if (clickedEndMouseInJoint) {
        endX = currEndX;
        endY = currEndY;
        endJointVisible = false;
    }

    //Calculate Lengths and Angles
    len = Math.round(parseFloat(canvLText.value) * 100) / 100;
    angle = calcAngle(endY, startY, endX, startX);
    angleDisplayed = calcRealAngle(endY, startY, endX, startX);

    //Create and Store New Members and Joints
    if (checkCreate(startX, endX, startY, endY) === true) {
        newMember = new Member(startX, startY, endX, endY, len, angle);
        memberArray.push(newMember);
        newJoint = new Joint(startX, startY, numMember);
        if (startJointVisible == true) {
            jointArray.push(newJoint);
            typeHistory.push("J");
        }
        newJoint = new Joint(endX, endY, numMember);
        if (endJointVisible == true) {
            jointArray.push(newJoint);
            typeHistory.push("J");
        }
        typeHistory.push("M");
    } else {
        context.putImageData(undoHistory[undoHistory.length - 1], 0, 0);
        undoHistory.pop();
        angleDisplayed = 0;
    }
    //Length and Angle Updates to the Screen
    lengthText.textContent = "Length: " + len + " m";
    angleText.textContent = "Angle: " + angleDisplayed + " deg";

    //Reset necessary variables to default
    reset();
}

//Activation and Button Functions
function memberPinActivate() {
    pinButtonActive = false;
    rollerButtonActive = false;
    memberJointButtonActive = true;
    loadButtonActive = false;
}
function pinActivate() {
    if (lineBegin) {
        errorModal.style.display = "block";
        errorModalBody.textContent = "You must first finish creating the current member!";
    } else {
        pinButtonActive = true;
        rollerButtonActive = false;
        memberJointButtonActive = false;
        loadButtonActive = false;
    }
}
function rollerActivate() {
    if (lineBegin) {
        errorModal.style.display = "block";
        errorModalBody.textContent = "You must first finish creating the current member!";
    } else {
        pinButtonActive = false;
        rollerButtonActive = true;
        memberJointButtonActive = false;
        loadButtonActive = false;
    }
}
function loadActivate() {
    if (lineBegin) {
        errorModal.style.display = "block";
        errorModalBody.textContent = "You must first finish creating the current member!";
    } else {
        pinButtonActive = false;
        rollerButtonActive = false;
        memberJointButtonActive = false;
        loadButtonActive = true;
    }
}
function undoLast() {
    if (lineBegin) {
        errorModal.style.display = "block";
        errorModalBody.textContent = "You must first finish creating the current member!";
        return;
    }
    if (undoHistory.length > 0) {
        context.putImageData(undoHistory[undoHistory.length - 1], 0, 0);
        undoHistory.pop();
        if (typeHistory[typeHistory.length - 1] == "P") {
            pinArray.pop();
        } else if (typeHistory[typeHistory.length - 1] == "R") {
            rollerArray.pop();
        } else if (typeHistory[typeHistory.length - 1] == "L") {
            loadArray.pop();
        } else if (typeHistory[typeHistory.length - 1] == "M") {
            memberArray.pop();
            if (typeHistory[typeHistory.length - 2] == "J") {
                jointArray.pop();
                typeHistory.pop();
            }
            if (typeHistory[typeHistory.length - 2] == "J") {
                jointArray.pop();
                typeHistory.pop();
            }
        } else if (typeHistory[typeHistory.length - 1] == "S") {
            solveTrussActive = false;
            deleteTable();
        }
        typeHistory.pop();
    }
}
function clearAll() {
    if (lineBegin) {
        errorModal.style.display = "block";
        errorModalBody.textContent = "You must first finish creating the current member!";
        return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    lengthText.textContent = "Length:";
    angleText.textContent = "Angle:";
    memberArray = [];
    jointArray = [];
    pinArray = [];
    rollerArray = [];
    loadArray = [];
    deleteTable();
    solveTrussActive = false;
    loadText.value = "";
    virtualText.value = "";
    yieldText.value = "";
    modOfEText.value = "";
}
function solveTruss() {
    if (memberArray.length + 2 * (pinArray.length) + rollerArray.length !== 2 * (jointArray.length)) {
        errorModal.style.display = "block";
        errorModalBody.textContent = "Cannot be solved! This bridge is statically indeterminate!";
        return;
    }

    if (loadArray.length == 0) {
        errorModal.style.display = "block";
        errorModalBody.textContent = "Please add a load to the bridge!";
        return;
    }

    let count = 0;
    let A = [], b = [], AV = [], bV = [];
    let sJoint = "";
    let eJoint = "";
    let earlyS, earlyE, earlySY, earlyEY;
    let allForceLabels = [];
    let rL, pL;
    let fJX, fJY, sJX, sJY;

    if (solveTrussActive === false) {
        copyLast();
        typeHistory.push("S");
    } else if (solveTrussActive === true) {
        context.putImageData(undoHistory[undoHistory.length - 1], 0, 0);
    }
    solveTrussActive = true;

    jointArraySort = [...jointArray];
    for (let i of jointArraySort.sort(function (a, b) {
        if (a.posX === b.posX)
            return a.posY - b.posY;
        return a.posX - b.posX;
    })) {
        i.jointLabel = getAlphabet(count);
        context.font = "bold 14px Cambria";
        context.fillStyle = "white";
        context.fillText(i.jointLabel, i.posX - 5, i.posY + 5);
        A.push([]);
        A.push([]);
        AV.push([]);
        AV.push([]);
        count++;
    }
    for (let i of jointArraySort) {
        for (let j of pinArray) {
            if (i.posX == j.posX && i.posY == j.posY) {
                i.hasPin = true;
            }
        }
        for (let j of rollerArray) {
            if (i.posX == j.posX && i.posY == j.posY) {
                i.hasRoller = true;
            }
        }
        for (let j of loadArray) {
            if (i.posX == j.posX && i.posY == j.posY) {
                i.hasLoad = true;
            }
        }
    }

    memberArraySort = [...memberArray];
    for (let i of memberArraySort.sort(function (a, b) {
        if ((a.startX + a.endX) / 2 === (b.startX + b.endX) / 2)
            return (a.startY + a.endY) / 2 - (b.startY + b.endY) / 2;
        return (a.startX + a.endX) / 2 - (b.startX + b.endX) / 2;
    })) {
        for (let j of jointArraySort) {
            if (i.startX === j.posX && i.startY === j.posY) {
                sJoint = j.jointLabel;
                earlyS = i.startX;
                earlySY = i.startY;
            } else if (i.endX === j.posX && i.endY === j.posY) {
                eJoint = j.jointLabel;
                earlyE = i.endX;
                earlyEY = i.endY;
            }
        }
        if (earlyS < earlyE)
            i.memberLabel = sJoint + eJoint;
        else if (earlyS === earlyE) {
            if (earlySY < earlyEY)
                i.memberLabel = sJoint + eJoint;
            else
                i.memberLabel = eJoint + sJoint;
        }
        else
            i.memberLabel = eJoint + sJoint;
        i.jointA = i.memberLabel.charAt(0);
        i.jointB = i.memberLabel.charAt(1);
        allForceLabels.push(i.memberLabel);
    }
    for (let i = 0; i < 2 * jointArraySort.length; i++) {
        for (let j = 0; j < 2 * jointArraySort.length; j++) {
            A[i].push(0);
            AV[i].push(0);
        }
        b.push(0);
        bV.push(0);
    }
    for (let i of pinArray) {
        for (let j of jointArraySort) {
            if (i.posX === j.posX && i.posY === j.posY) {
                i.pinLabelX = "P" + j.jointLabel + "x";
                i.pinLabelY = "P" + j.jointLabel + "y";
                allForceLabels.push(i.pinLabelX);
                allForceLabels.push(i.pinLabelY);
                pL = j.jointLabel;
                break;
            }
        }
    }
    for (let i of rollerArray) {
        for (let j of jointArraySort) {
            if (i.posX === j.posX && i.posY === j.posY) {
                i.rollerLabel = "R" + j.jointLabel + "y";
                allForceLabels.push(i.rollerLabel);
                rL = j.jointLabel;
                break;
            }
        }
    }
    for (let i of loadArray) {
        for (let j of jointArraySort) {
            if (i.posX === j.posX && i.posY === j.posY) {
                i.loadLabel = j.jointLabel;
                break;
            }
        }
    }

    for (let i of memberArraySort) {
        for (let j of jointArraySort) {
            if (i.jointA === j.jointLabel) {
                fJX = j.posX;
                fJY = j.posY;
            } else if (i.jointB === j.jointLabel) {
                sJX = j.posX;
                sJY = j.posY;
            }
        }
        if (fJX <= sJX) {
            i.direcNumEW = 1;
        } else {
            i.direcNumEW = -1;
        }
        if (fJY >= sJY) {
            i.direcNumNS = 1;
        } else {
            i.direcNumNS = -1;
        }
    }

    //Main Calculation Loop
    let cnt = 0, loadMag = 0;
    for (let i of jointArraySort) {
        if (i.hasPin === true) {
            A[cnt][allForceLabels.indexOf("P" + pL + "x")] = 1;
            A[cnt + 1][allForceLabels.indexOf("P" + pL + "y")] = 1;
            AV[cnt][allForceLabels.indexOf("P" + pL + "x")] = 1;
            AV[cnt + 1][allForceLabels.indexOf("P" + pL + "y")] = 1;
        }
        if (i.hasRoller === true) {
            A[cnt + 1][allForceLabels.indexOf("R" + rL + "y")] = 1;
            AV[cnt + 1][allForceLabels.indexOf("R" + rL + "y")] = 1;
        }
        if (i.hasLoad === true) {
            let nameLoad = "", loadCount = 0;
            for (let j of loadArray) {
                if (j.posX === i.posX && j.posY === i.posY) {
                    loadMag = j.mag;
                    nameLoad = j.loadLabel;
                }
            }
            for (let j of jointArraySort) {
                if (j.jointLabel === nameLoad) {
                    b[loadCount + 1] = loadMag;
                    break;
                }
                loadCount += 2;
            }
        }
        if (i.jointLabel === virtualText.value) {
            bV[cnt + 1] = 1;
        }
        for (let j of memberArraySort) {
            if (j.jointA === i.jointLabel) {
                A[cnt][allForceLabels.indexOf(j.memberLabel)] = j.direcNumEW * Math.cos(j.angle / 360 * 2 * Math.PI);
                A[cnt + 1][allForceLabels.indexOf(j.memberLabel)] = j.direcNumNS * Math.sin(j.angle / 360 * 2 * Math.PI);
                AV[cnt][allForceLabels.indexOf(j.memberLabel)] = j.direcNumEW * Math.cos(j.angle / 360 * 2 * Math.PI);
                AV[cnt + 1][allForceLabels.indexOf(j.memberLabel)] = j.direcNumNS * Math.sin(j.angle / 360 * 2 * Math.PI);
            } else if (j.jointB === i.jointLabel) {
                A[cnt][allForceLabels.indexOf(j.memberLabel)] = -1 * j.direcNumEW * Math.cos(j.angle / 360 * 2 * Math.PI);
                A[cnt + 1][allForceLabels.indexOf(j.memberLabel)] = -1 * j.direcNumNS * Math.sin(j.angle / 360 * 2 * Math.PI);
                AV[cnt][allForceLabels.indexOf(j.memberLabel)] = -1 * j.direcNumEW * Math.cos(j.angle / 360 * 2 * Math.PI);
                AV[cnt + 1][allForceLabels.indexOf(j.memberLabel)] = -1 * j.direcNumNS * Math.sin(j.angle / 360 * 2 * Math.PI);
            }
        }
        cnt += 2;
    }

    // Solve Regular and Virtual Truss through Gaussian Elimination

    let x = solve(A, b);
    let xV = solve(AV, bV);

    for (let i = 0; i < memberArraySort.length; i++) {
        memberArraySort[i].stressForce = x[i];
        memberArraySort[i].virtualForce = xV[i];
    }

    let virtual = false;
    for (let i of xV) {
        if (i !== 0) {
            virtual = true;
        }
    }
    if (virtual == false) {
        for (let i = 0; i < xV.length; i++) {
            xV[i] = "-";
        }
    }

    setHSS();

    //Outputs results in a table to the user

    deleteTable();
    let fields = ["Member", "Length (m)", "Angle (deg)", "Load (kN)", "Virtual (kN)", "Area (mm^2)", "Moment of Inertia (10^6 mm^4)", "Radius of Gyration (mm)", "HSS Area (mm^2)", "HSS Moment of Inertia (10^6 mm^4)", "HSS Radius of Gyration (mm)", "Best HSS Configuration (mm x mm x mm)", "Virtual Work (J)"];
    let headRow = document.createElement("tr");
    fields.forEach(function (field) {
        let headCell = document.createElement("th");
        headCell.textContent = field;
        headRow.appendChild(headCell);
    });
    loadTable.appendChild(headRow);

    let c = 0;
    for (let i of allForceLabels) {
        let row = document.createElement("tr");
        let cell1 = document.createElement("td");
        let cell2 = document.createElement("td");
        let cell3 = document.createElement("td");
        let cell4 = document.createElement("td");
        let cell5 = document.createElement("td");
        let cell6 = document.createElement("td");
        let cell7 = document.createElement("td");
        let cell8 = document.createElement("td");
        let cell9 = document.createElement("td");
        let cella = document.createElement("td");
        let cellb = document.createElement("td");
        let cellc = document.createElement("td");
        let celld = document.createElement("td");
        cell1.textContent = i;
        if (c < memberArraySort.length) {
            cell2.textContent = memberArraySort[c].len;
            cell3.textContent = memberArraySort[c].angle;
            cell4.textContent = Math.round(x[c] * 1000) / 1000;
            if (virtual == true)
                cell5.textContent = Math.round(xV[c] * 10000) / 10000;
            else
                cell5.textContent = xV[c];
            if (memberArraySort[c].areaHSS != "-")
                cell6.textContent = Math.round(memberArraySort[c].areaHSS * 1000) / 1000;
            else
                cell6.textContent = memberArraySort[c].areaHSS;
            if (memberArraySort[c].moiHSS != "-")
                cell7.textContent = Math.round(memberArraySort[c].moiHSS * 1000) / 1000;
            else
                cell7.textContent = memberArraySort[c].moiHSS;
            if (memberArraySort[c].rGyrHSS != "-")
                cell8.textContent = Math.round(memberArraySort[c].rGyrHSS * 1000) / 1000;
            else
                cell8.textContent = memberArraySort[c].rGyrHSS;
            cell9.textContent = memberArraySort[c].nAreaHSS;
            cella.textContent = memberArraySort[c].nMoiHSS;
            cellb.textContent = memberArraySort[c].nRGyrHSS;
            cellc.textContent = memberArraySort[c].HSS;
            if (memberArraySort[c].vWork != "-")
                celld.textContent = Math.round(memberArraySort[c].vWork * 1000) / 1000;
            else
                celld.textContent = memberArraySort[c].vWork;
        } else {
            cell2.textContent = "-";
            cell3.textContent = "-";
            cell4.textContent = Math.round(x[c] * 1000) / 1000;
            if (virtual == true)
                cell5.textContent = Math.round(xV[c] * 10000) / 10000;
            else
                cell5.textContent = xV[c];
            cell6.textContent = "-";
            cell7.textContent = "-";
            cell8.textContent = "-";
            cell9.textContent = "-";
            cella.textContent = "-";
            cellb.textContent = "-";
            cellc.textContent = "-";
            celld.textContent = "-";
        }
        cell1.style.textAlign = "center";
        cell2.style.textAlign = "center";
        cell3.style.textAlign = "center";
        cell4.style.textAlign = "center";
        cell5.style.textAlign = "center";
        cell6.style.textAlign = "center";
        cell7.style.textAlign = "center";
        cell8.style.textAlign = "center";
        cell9.style.textAlign = "center";
        cella.style.textAlign = "center";
        cellb.style.textAlign = "center";
        cellc.style.textAlign = "center";
        celld.style.textAlign = "center";
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        row.appendChild(cell4);
        row.appendChild(cell5);
        row.appendChild(cell6);
        row.appendChild(cell7);
        row.appendChild(cell8);
        row.appendChild(cell9);
        row.appendChild(cella);
        row.appendChild(cellb);
        row.appendChild(cellc);
        row.appendChild(celld);
        loadTable.appendChild(row);
        c++;
    }
    loadDiv.appendChild(loadTable);
}

function deleteTable() { // Deletes the rows of the existing table
    while (loadTable.hasChildNodes()) {
        loadTable.removeChild(loadTable.firstChild);
    }
}

function findBestHSS(a, m, r) {
    if (a <= 216 && m <= 0.018 && r <= 9.12) // Mass: 1.69 kg/m
        return [216, 0.018, 9.12, "25 x 25 x 2.5"];
    if (a <= 257 && m <= 0.02 && r <= 8.79) // Mass: 2.01 kg/m
        return [257, 0.02, 879, "25 x 25 x 3.2"];
    if (a <= 281 && m <= 0.039 && r <= 11.7) // Mass: 2.20 kg/m
        return [281, 0.039, 11.7, "32 x 32 x 2.5"];
    if (a <= 338 && m <= 0.044 && r <= 11.4) // Mass: 2.65 kg/m
        return [338, 0.044, 11.4, "32 x 32 x 3.2"];
    if (a <= 345 && m <= 0.071 && r <= 14.3) // Mass: 2.71 kg/m
        return [345, 0.071, 14.3, "38 x 38 x 2.5"];
    if (a <= 389 && m <= 0.048 && r <= 11.1) // Mass: 3.06 kg/m
        return [389, 0.048, 11.1, "32 x 32 x 3.8"];
    if (a <= 418 && m <= 0.082 && r <= 14) // Mass: 3.28 kg/m
        return [418, 0.082, 14, "38 x 38 x 3.2"];
    if (a <= 485 && m <= 0.091 && r <= 13.7) // Mass: 3.81 kg/m
        return [485, 0.091, 13.7, "38 x 38 x 3.8"];
    if (a <= 516 && m <= 0.194 && r <= 19.4) // Mass: 4.05 kg/m
        return [516, 0.194, 19.4, "51 x 51 x 2.8"];
    if (a <= 578 && m <= 0.1 && r <= 13.2) // Mass: 4.54 kg/m
        return [578, 0.1, 13.2, "38 x 38 x 4.8"];
    if (a <= 580 && m <= 0.214 && r <= 19.2) // Mass: 4.55 kg/m
        return [580, 0.214, 19.2, "51 x 51 x 3.2"];
    if (a <= 679 && m <= 0.242 && r <= 18.9) // Mass: 5.33 kg/m
        return [679, 0.242, 18.9, "51 x 51 x 3.8"];
    if (a <= 741 && m <= 0.441 && r <= 24.4) // Mass: 5.82 kg/m
        return [741, 0.441, 24.4, "64 x 64 x 3.2"];
    if (a <= 821 && m <= 0.278 && r <= 18.4) // Mass: 6.45 kg/m
        return [821, 0.278, 18.4, "51 x 51 x 4.8"];
    if (a <= 872 && m <= 0.506 && r <= 24.1) // Mass: 6.85 kg/m
        return [872, 0.506, 24.1, "64 x 64 x 3.8"];
    if (a <= 1030 && m <= 0.317 && r <= 17.6) // Mass: 8.05 kg/m
        return [1030, 0.317, 17.6, "51 x 51 x 6.4"];
    if (a <= 1060 && m <= 0.593 && r <= 23.6) // Mass: 8.35 kg/m
        return [1060, 0.593, 23.6, "64 x 64 x 4.8"];
    if (a <= 1310 && m <= 1.08 && r <= 28.8) // Mass: 10.3 kg/m
        return [1310, 1.08, 28.8, "76 x 76 x 4.8"];
    if (a <= 1350 && m <= 0.701 && r <= 22.8) // Mass: 10.6 kg/m
        return [1350, 0.701, 22.8, "64 x 64 x 6.4"];
    if (a <= 1550 && m <= 1.79 && r <= 34) // Mass: 12.2 kg/m
        return [1550, 1.79, 34, "89 x 89 x 4.8"];
    if (a <= 1670 && m <= 1.31 && r <= 28) // Mass: 13.1 kg/m
        return [1670, 1.31, 28, "76 x 76 x 6.4"];
    if (a <= 1790 && m <= 2.75 && r <= 39.2) // Mass: 14.1 kg/m
        return [1790, 2.75, 39.2, "102 x 102 x 4.8"];
    if (a <= 1990 && m <= 2.20 && r <= 33.2) // Mass: 15.6 kg/m
        return [1990, 2.20, 33.2, "89 x 89 x 6.4"];
    if (a <= 2010 && m <= 1.49 && r <= 27.2) // Mass: 15.8 kg/m
        return [2010, 1.49, 27.2, "76 x 76 x 8.0"];
    if (a <= 2280 && m <= 5.6 && r <= 49.6) // Mass: 17.9 kg/m
        return [2280, 5.6, 49.6, "127 x 127 x 4.8"];
    if (a <= 2320 && m <= 3.42 && r <= 38.4) // Mass: 18.2 kg/m
        return [2320, 3.42, 38.4, "102 x 102 x 6.4"];
    if (a <= 2410 && m <= 2.53 && r <= 32.4) // Mass: 18.9 kg/m
        return [2410, 2.53, 32.4, "89 x 89 x 8.0"];
    if (a <= 2760 && m <= 9.93 && r <= 59.9) // Mass: 21.7 kg/m
        return [2760, 9.93, 59.9, "152 x 152 x 4.8"];
    if (a <= 2790 && m <= 2.79 && r <= 31.6) // Mass: 21.9 kg/m
        return [2790, 2.79, 31.6, "89 x 89 x 9.5"];
    if (a <= 2820 && m <= 3.98 && r <= 37.6) // Mass: 22.1 kg/m
        return [2820, 3.98, 37.6, "102 x 102 x 8.0"];
    if (a <= 2960 && m <= 7.05 && r <= 48.8) // Mass: 23.2 kg/m
        return [2960, 7.05, 48.8, "127 x 127 x 6.4"];
    if (a <= 3250 && m <= 16.1 && r <= 70.3) // Mass: 25.5 kg/m
        return [3250, 16.1, 70.3, "178 x 178 x 4.8"];
    if (a <= 3280 && m <= 4.44 && r <= 36.8) // Mass: 25.7 kg/m
        return [3280, 4.44, 36.8, "102 x 102 x 9.5"];
    if (a <= 3610 && m <= 12.6 && r <= 59.2) // Mass: 28.3 kg/m
        return [3610, 12.6, 59.2, "152 x 152 x 6.4"];
    if (a <= 3620 && m <= 8.35 && r <= 48) // Mass: 28.4 kg/m
        return [3620, 8.35, 48, "127 x 127 x 8.0"];
    if (a <= 4240 && m <= 9.47 && r <= 47.2) // Mass: 33.3 kg/m
        return [4240, 9.47, 47.2, "127 x 127 x 9.5"];
    if (a <= 4250 && m <= 20.6 && r <= 69.6) // Mass: 33.4 kg/m
        return [4250, 20.6, 69.6, "178 x 178 x 6.4"];
    if (a <= 4430 && m <= 15.1 && r <= 58.4) // Mass: 34.8 kg/m
        return [4430, 15.1, 58.4, "152 x 152 x 8.0"];
    if (a <= 4840 && m <= 10.4 && r <= 46.4) // Mass: 38.0 kg/m
        return [4840, 10.4, 46.4, "127 x 127 x 11"];
    if (a <= 4900 && m <= 31.3 && r <= 79.9) // Mass: 38.4 kg/m
        return [4900, 31.3, 79.9, "203 x 203 x 6.4"];
    if (a <= 5210 && m <= 17.3 && r <= 57.6) // Mass: 40.9 kg/m
        return [5210, 17.3, 57.6, "152 x 152 x 9.5"];
    if (a <= 5240 && m <= 24.8 && r <= 68.8) // Mass: 41.1 kg/m
        return [5240, 24.8, 68.8, "178 x 178 x 8.0"];
    if (a <= 5970 && m <= 19.3 && r <= 56.8) // Mass: 46.9 kg/m
        return [5970, 19.3, 56.8, "152 x 152 x 11"];
    if (a <= 6050 && m <= 37.9 && r <= 79.2) // Mass: 47.5 kg/m
        return [6050, 37.9, 79.2, "203 x 203 x 8.0"];
    if (a <= 6180 && m <= 28.6 && r <= 68) // Mass: 48.5 kg/m
        return [6180, 28.6, 68, "178 x 178 x 9.5"];
    if (a <= 6190 && m <= 62.7 && r <= 101) // Mass: 48.6 kg/m
        return [6190, 62.7, 101, "254 x 254 x 6.4"];
    if (a <= 6680 && m <= 21 && r <= 56) // Mass: 52.4 kg/m
        return [6680, 21, 56, "152 x 152 x 13"];
    if (a <= 7100 && m <= 32.1 && r <= 67.2) // Mass: 55.7 kg/m
        return [7100, 32.1, 67.2, "178 x 178 x 11"];
    if (a <= 7150 && m <= 43.9 && r <= 78.4) // Mass: 56.1 kg/m
        return [7150, 43.9, 78.4, "203 x 203 x 9.5"];
    if (a <= 7480 && m <= 110 && r <= 121) // Mass: 58.7 kg/m
        return [7480, 110, 121, "305 x 305 x 6.4"];
    if (a <= 7660 && m <= 76.5 && r <= 99.9) // Mass: 60.1 kg/m
        return [7660, 76.5, 99.9, "254 x 254 x 8.0"];
    if (a <= 7970 && m <= 35.2 && r <= 66.4) // Mass: 62.6 kg/m
        return [7970, 35.2, 66.4, "178 x 178 x 13"];
    if (a <= 8230 && m <= 49.6 && r <= 77.6) // Mass: 64.6 kg/m
        return [8230, 49.6, 77.6, "203 x 203 x 11"];
    if (a <= 9090 && m <= 89.3 && r <= 99.1) // Mass: 71.3 kg/m
        return [9090, 89.3, 99.1, "254 x 254 x 9.5"];
    if (a <= 9260 && m <= 54.7 && r <= 76.8) // Mass: 72.7 kg/m
        return [9260, 54.7, 76.8, "203 x 203 x 13"];
    if (a <= 9280 && m <= 135 && r <= 121) // Mass: 72.8 kg/m
        return [9280, 135, 121, "305 x 305 x 8.0"];
    if (a <= 10500 && m <= 102 && r <= 98.4) // Mass: 82.4 kg/m
        return [10500, 102, 98.4, "254 x 254 x 11"];
    if (a <= 11000 && m <= 158 && r <= 120) // Mass: 86.5 kg/m
        return [11000, 158, 120, "305 x 305 x 9.5"];
    if (a <= 11800 && m <= 113 && r <= 97.6) // Mass: 93.0 kg/m
        return [11800, 113, 97.6, "254 x 254 x 13"];
    if (a <= 12800 && m <= 181 && r <= 119) // Mass: 100 kg/m
        return [12800, 181, 119, "305 x 305 x 11"];
    if (a <= 14400 && m <= 202 && r <= 118) // Mass: 113 kg/m
        return [14400, 202, 118, "305 x 305 x 13"];
    else
        return ["N/A", "N/A", "N/A", "N/A"];
}

function setHSS() {
    let areaFOS = 2;
    let moiFOS = 3;
    let yieldF = yieldText.value;
    let rGyrCheck = 200;
    let E = modOfEText.value;
    let moi = 0;
    if (yieldText.value != "" && !isNaN(parseInt(yieldText.value)) && modOfEText.value != "" && !isNaN(parseInt(modOfEText.value))) {
        for (let i of memberArraySort) {
            i.areaHSS = (Math.abs(i.stressForce) * 1000) * areaFOS / yieldF;
            if (i.stressForce < 0) {
                i.moiHSS = (Math.abs(i.stressForce) * 1000 * i.len * i.len * 1000 * 1000 * moiFOS) / (Math.pow(Math.PI, 2) * E * Math.pow(10, 6));
                moi = i.moiHSS;
            } else {
                i.moiHSS = "-";
            }
            i.rGyrHSS = (i.len * 1000) / rGyrCheck;
            let config = findBestHSS(i.areaHSS, moi, i.rGyrHSS);
            i.nAreaHSS = config[0];
            i.nMoiHSS = config[1];
            i.nRGyrHSS = config[2];
            i.HSS = config[3];
            i.vWork = (i.stressForce * 1000 * i.len * 1000 * i.virtualForce) / (E * i.nAreaHSS);
        }
    } else {
        for (let i of memberArraySort) {
            i.areaHSS = "-";
            i.moiHSS = "-";
            i.rGyrHSS = "-";
            i.nAreaHSS = "-";
            i.nMoiHSS = "-";
            i.nRGyrHSS = "-";
            i.HSS = "-";
            i.vWork = "-";
        }
    }

}

function getAlphabet(count) {
    if (count === 0)
        return "A";
    else if (count === 1)
        return "B";
    else if (count === 2)
        return "C";
    else if (count === 3)
        return "D";
    else if (count === 4)
        return "E";
    else if (count === 5)
        return "F";
    else if (count === 6)
        return "G";
    else if (count === 7)
        return "H";
    else if (count === 8)
        return "I";
    else if (count === 9)
        return "J";
    else if (count === 10)
        return "K";
    else if (count === 11)
        return "L";
    else if (count === 12)
        return "M";
    else if (count === 13)
        return "N";
    else if (count === 14)
        return "O";
    else if (count === 15)
        return "P";
    else if (count === 16)
        return "Q";
    else if (count === 17)
        return "R";
    else if (count === 18)
        return "S";
    else if (count === 19)
        return "T";
    else if (count === 20)
        return "U";
    else if (count === 21)
        return "V";
    else if (count === 22)
        return "W";
    else if (count === 23)
        return "X";
    else if (count === 24)
        return "Y";
    else if (count === 25)
        return "Z";
    else
        return "*";
}

//Gaussian Elimination Code
//---------------------------------------------------------------------------

function diagonalize(M) {
    let m = M.length;
    let n = M[0].length;
    let i_max;
    for (let k = 0; k < Math.min(m, n); ++k) {
        i_max = findPivot(M, k);
        if (M[i_max, k] == 0)
            throw "matrix is singular";
        swap_rows(M, k, i_max);
        for (let i = k + 1; i < m; ++i) {
            let c = M[i][k] / M[k][k];
            for (let j = k + 1; j < n; ++j) {
                M[i][j] = M[i][j] - M[k][j] * c;
            }
            M[i][k] = 0;
        }
    }
}
function findPivot(M, k) {
    let i_max = k;
    for (let i = k + 1; i < M.length; ++i) {
        if (Math.abs(M[i][k]) > Math.abs(M[i_max][k])) {
            i_max = i;
        }
    }
    return i_max;
}

function swap_rows(M, i_max, k) {
    if (i_max != k) {
        let temp = M[i_max];
        M[i_max] = M[k];
        M[k] = temp;
    }
}
function makeM(A, b) {
    for (let i = 0; i < A.length; ++i) {
        A[i].push(b[i]);
    }
}
function substitute(M) {
    let m = M.length;
    for (let i = m - 1; i >= 0; --i) {
        let x = M[i][m] / M[i][i];
        for (let j = i - 1; j >= 0; --j) {
            M[j][m] -= x * M[j][i];
            M[j][i] = 0;
        }
        M[i][m] = x;
        M[i][i] = 1;
    }
}
function extractX(M) {
    let x = [];
    let m = M.length;
    let n = M[0].length;
    for (let i = 0; i < m; ++i) {
        x.push(M[i][n - 1]);
    }
    return x;
}
function solve(A, b) {
    makeM(A, b);
    diagonalize(A);
    substitute(A);
    return extractX(A);
}

//Active Run Code
//---------------------------------------------------------------------------

canvas.addEventListener("mousedown", (event) => {
    mousePos = getMousePos(event);
    let check = 0;
    if (memberJointButtonActive) {
        createMember();
    } else if (pinButtonActive) {
        if (inJoint()) {
            for (let elem of rollerArray) { //Checks if there is already a roller at the current click location
                if (elem.posX == currX && elem.posY == currY) {
                    check = 1;
                }
            }
            for (let elem of pinArray) { //Checks if there is already a pin at the current click location
                if (elem.posX == currX && elem.posY == currY) {
                    check = 1;
                }
            }
            if (check == 0) {
                copyLast();
                typeHistory.push("P");
                newPin = new Pin(currX, currY);
                pinArray.push(newPin);
            }
        }
    } else if (rollerButtonActive) {
        if (inJoint()) {
            for (let elem of rollerArray) { //Checks if there is already a roller at the current click location
                if (elem.posX == currX && elem.posY == currY) {
                    check = 1;
                }
            }
            for (let elem of pinArray) { //Checks if there is already a pin at the current click location
                if (elem.posX == currX && elem.posY == currY) {
                    check = 1;
                }
            }
            if (check == 0) {
                copyLast();
                typeHistory.push("R");
                newRoller = new Roller(currX, currY);
                rollerArray.push(newRoller);
            }
        }
    } else if (loadButtonActive) {
        if (inJoint()) {
            for (let elem of loadArray) { //Checks if there is already a load at the current click location
                if (elem.posX == currX && elem.posY == currY) {
                    check = 1;
                }
            }
            if (check == 0) {
                if (loadText.value != "" && !isNaN(parseInt(loadText.value))) {
                    copyLast();
                    typeHistory.push("L");
                    newLoad = new Load(currX, currY, parseInt(loadText.value));
                    loadArray.push(newLoad);
                }
            }
        }
    }
});

canvas.addEventListener("mousemove", (event) => {
    mousePos = getMousePos(event);
    if (memberJointButtonActive && lineBegin) {
        restoreSnapShot();
        tempMember(mousePos.x, mousePos.y);
    }
    posXText.textContent = "X: " + mousePos.x;
    posYText.textContent = "Y: " + mousePos.y;
});

document.addEventListener("keydown", (e) => {
    if (memberJointButtonActive && lineBegin) {
        if (((e.which > 47 && e.which <= 57) || e.which == 190) && !switAngText) {
            canvLText.value += e.key;
        } else if ((e.which == 9 || e.which == 13) && !enterFunc) {
            e.preventDefault();
            if (canvLText.value == "") {
                errorModal.style.display = "block";
                errorModalBody.textContent = "Please enter a valid length!";
            } else {
                switAngText = true;
                enterFunc = true;
            }
        } else if (((e.which > 47 && e.which <= 57) || e.which == 190) && switAngText) {
            canvAText.value += e.key;
        } else if ((e.which == 9 || e.which == 13) && enterFunc) {
            e.preventDefault();
            if (canvAText.value == "") {
                errorModal.style.display = "block";
                errorModalBody.textContent = "Please enter a valid angle between 0 and 360 degrees!";
            } else {
                createMemberWithKey();
                switAngText = false;
                enterFunc = false;
            }
        } else if (e.which == 8) {
            if (!switAngText) {
                canvLText.value = canvLText.value.substring(0, canvLText.value.length - 1);
            } else {
                canvAText.value = canvAText.value.substring(0, canvAText.value.length - 1);
            }
        }
    }
});

closeModalBtn.addEventListener("click", (e) => {
    errorModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target == errorModal)
        errorModal.style.display = "none";
});