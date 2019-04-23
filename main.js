/* Project One: TrussMat
    This project was started an initated by Siddarth Narasimhan, begun on December 21st, 2018. The goal of this project is to help First Year Engineering Science students with the first bridge project they must complete in CIV102, a civil engineering stuctures course. This truss solver solves statically determinate truss bridges with the method of joints, solves the virtual truss, gives you the best possible HSS configuration and outputs all data in a table.
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

//Line Property Variables
let lineBegin = false;     //This indicates whether the user has begun creating the member-joint line or not
let startX;                //Stores the start x-coordinate of the joint
let startY;                //Stores the start y-coordinate of the joint
let endX;                  //Stores the end x-coordinate of the joint
let endY;                  //Stores the end y-coordinate of the joint
let mousePos;              //Gets the x and y coordinate of the user's cursor at a specific instance
let length;                //The length of the joint that is created in metres
let angle;                 //The acute angle to the horizontal of the joint-member in degrees
let actualSize = 12;       //The scaled size of the canvas width, indicating the span of the bridge (plus 10 metres)

//Paragraph Changer Variables
let lengthText = document.getElementById("lengthText");     //Text updates to the screen regarding the current length of the member-joint
let angleText = document.getElementById("angleText");       //Text updater to the screen regarding the curring angle of the member-joint
let posXText = document.getElementById("posX");
let posYText = document.getElementById("posY");
let loadText = document.getElementById("loadText");
let loadTable = document.getElementById("loadTable");

//Member Property Variables
let newMember;           //When a new member is created with its respective constructor, it is stored in this variable
let memberArray = [];    //The newMember variable is immediately stored in this array
let currStartX;          //When the user clicks in the joint to begin a new member, stores the x-coordinate
let currStartY;          //When the user clicks in the joint to begin a new member, stores the y-coordinate
let currEndX;            //When the user clicks in the joint to end a new member, stores the x-coordinate
let currEndY;            //When the user clicks in the joint to end a new member, stores the y-coordinate

//Joint Property Variables
let newJoint;                           //When a new joint is created with its repective constructor, it is stored in this variable
let jointArray = [];                    //The newJoint variable is immediately stored in this array
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

//Constructor Function to build new members, joints, pins loads and rollers
function Member(startX, startY, endX, endY, length, angle) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.length = length;
    this.angle = angle;
    this.memberLabel = "";
    this.jointA = "";
    this.jointB = "";
    this.direcNumEW;
    this.direcNumNS;

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
        length = calcLength(posY, currStartY, posX, currStartX);
        angle = calcAngle(posY, currStartY, posX, currStartX);
    } else {
        context.moveTo(startX, startY);
        length = calcLength(posY, startY, posX, startX);
        angle = calcAngle(posY, startY, posX, startX);
    }
    lengthText.textContent = "Length: " + length + " m";
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
}

//MouseDown Functions
function createMember() {
    if (!lineBegin) {
        lineBegin = true;
        startX = mousePos.x;
        startY = mousePos.y;
        copyLast();
        if (inJoint()) {
            tempJoint(currStartX, currStartY, "#909696");
        } else {
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
        length = calcLength(endY, startY, endX, startX);
        angle = calcAngle(endY, startY, endX, startX);

        //Create and Store New Members and Joints
        if (checkCreate(startX, endX, startY, endY) === true) {
            newMember = new Member(startX, startY, endX, endY, length, angle);
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
        }
        //Length and Angle Updates to the Screen
        lengthText.textContent = "Length: " + length + " m";
        angleText.textContent = "Angle: " + angle + " deg";

        //Reset necessary variables to default
        reset();
    }
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
        console.log("You must first finish creating the current member!");
    } else {
        pinButtonActive = true;
        rollerButtonActive = false;
        memberJointButtonActive = false;
        loadButtonActive = false;
    }
}
function rollerActivate() {
    if (lineBegin) {
        console.log("You must first finish creating the current member!");
    } else {
        pinButtonActive = false;
        rollerButtonActive = true;
        memberJointButtonActive = false;
        loadButtonActive = false;
    }
}
function loadActivate() {
    if (lineBegin) {
        console.log("You must first finish creating the current member!");
    } else {
        pinButtonActive = false;
        rollerButtonActive = false;
        memberJointButtonActive = false;
        loadButtonActive = true;
    }
}
function undoLast() {
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
        }
        typeHistory.pop();
    }
}
function removeActivate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    lengthText.textContent = "Length:";
    angleText.textContent = "Angle:";
    memberArray = [];
    jointArray = [];
    pinArray = [];
    rollerArray = [];
    loadArray = [];
}
function solveTruss() {
    if (memberArray.length + 2 * (pinArray.length) + rollerArray.length === 2 * (jointArray.length)) {
        console.log("Statically Determinate!");
    } else {
        console.log("Statically Indeterminate!");
        return;
    }

    let count = 0;
    if (loadArray.length == 0)
        console.log("Add a load!");
    else {
        let A = [], b = [];
        let sJoint = "";
        let eJoint = "";
        let earlyS, earlyE, earlySY, earlyEY;
        let allForceLabels = [];
        let rL, pL;
        let fJX, fJY, sJX, sJY;

        copyLast();
        typeHistory.push("S");

        for (let i of jointArray.sort(function (a, b) {
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
            count++;
        }
        for (let i of jointArray) {
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

        for (let i of memberArray.sort(function (a, b) {
            if ((a.startX + a.endX) / 2 === (b.startX + b.endX) / 2)
                return (a.startY + a.endY) / 2 - (b.startY + b.endY) / 2;
            return (a.startX + a.endX) / 2 - (b.startX + b.endX) / 2;
        })) {
            for (let j of jointArray) {
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
        for (let i = 0; i < 2 * jointArray.length; i++) {
            for (let j = 0; j < 2 * jointArray.length; j++)
                A[i].push(0);
            b.push(0);
        }
        for (let i of pinArray) {
            for (let j of jointArray) {
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
            for (let j of jointArray) {
                if (i.posX === j.posX && i.posY === j.posY) {
                    i.rollerLabel = "R" + j.jointLabel + "y";
                    allForceLabels.push(i.rollerLabel);
                    rL = j.jointLabel;
                    break;
                }
            }
        }
        for (let i of loadArray) {
            for (let j of jointArray) {
                if (i.posX === j.posX && i.posY === j.posY) {
                    i.loadLabel = j.jointLabel;
                    break;
                }
            }
        }

        for (let i of memberArray) {
            for (let j of jointArray) {
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
        for (let i of jointArray) {
            if (i.hasPin === true) {
                A[cnt][allForceLabels.indexOf("P" + pL + "x")] = 1;
                A[cnt + 1][allForceLabels.indexOf("P" + pL + "y")] = 1;
            }
            if (i.hasRoller === true) {
                A[cnt + 1][allForceLabels.indexOf("R" + rL + "y")] = 1;
            }
            if (i.hasLoad === true) {
                let nameLoad = "", loadCount = 0;
                for (let j of loadArray) {
                    if (j.posX === i.posX && j.posY === i.posY) {
                        loadMag = j.mag;
                        nameLoad = j.loadLabel;
                    }
                }
                for (let j of jointArray) {
                    if (j.jointLabel === nameLoad) {
                        b[loadCount + 1] = loadMag;
                        break;
                    }
                    loadCount += 2;
                }
            }
            for (let j of memberArray) {
                if (j.jointA === i.jointLabel) {
                    A[cnt][allForceLabels.indexOf(j.memberLabel)] = j.direcNumEW * Math.cos(j.angle / 360 * 2 * Math.PI);
                    A[cnt + 1][allForceLabels.indexOf(j.memberLabel)] = j.direcNumNS * Math.sin(j.angle / 360 * 2 * Math.PI);
                } else if (j.jointB === i.jointLabel) {
                    A[cnt][allForceLabels.indexOf(j.memberLabel)] = -1 * j.direcNumEW * Math.cos(j.angle / 360 * 2 * Math.PI);
                    A[cnt + 1][allForceLabels.indexOf(j.memberLabel)] = -1 * j.direcNumNS * Math.sin(j.angle / 360 * 2 * Math.PI);
                }
            }
            cnt += 2;
        }

        let x = solve(A, b);

        console.log(x);
        console.log(allForceLabels);

        let table = document.createElement("table");
        let fields = ["Member", "Load (kN)"];
        let headRow = document.createElement("tr");
        fields.forEach(function (field) {
            let headCell = document.createElement("th");
            headCell.textContent = field;
            headRow.appendChild(headCell);
        });
        table.appendChild(headRow);

        let c = 0;
        for (let i of allForceLabels) {
            let row = document.createElement("tr");
            let cell1 = document.createElement("td");
            let cell2 = document.createElement("td");
            cell1.textContent = i;
            cell1.style.textAlign = "center";
            cell2.textContent = Math.round(x[c]*1000)/1000;
            cell2.style.textAlign = "center";
            row.appendChild(cell1);
            row.appendChild(cell2);
            table.appendChild(row);
            c++;
        }
        loadTable.appendChild(table);
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
    let x = extractX(A);
    return x;
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

    if (memberJointButtonActive) {
        if (lineBegin) {
            restoreSnapShot();
            tempMember(mousePos.x, mousePos.y);
        }
    }
    posXText.textContent = "X: " + mousePos.x;
    posYText.textContent = "Y: " + mousePos.y;
});