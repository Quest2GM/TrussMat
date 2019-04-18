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
let actualSize = 20;       //The scaled size of the canvas width, indicating the span of the bridge (plus 10 metres)

//Paragraph Changer Variables
let lengthText = document.getElementById("lengthText");     //Text updates to the screen regarding the current length of the member-joint
let angleText = document.getElementById("angleText");       //Text updater to the screen regarding the curring angle of the member-joint
let posXText = document.getElementById("posX");
let posYText = document.getElementById("posY");

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

    context.beginPath();
    context.moveTo(this.startX, this.startY);
    context.lineTo(this.endX, this.endY);
    context.lineWidth = 5;
    context.strokeStyle = "#5477ea";
    context.stroke();
}
function Joint(posX, posY, numMember, visible) {
    this.posX = posX;
    this.posY = posY;
    this.numMember = numMember;
    this.visible = visible;
    this.radius = 10;
    this.colour = "#909696";

    context.beginPath();
    context.moveTo(this.posX, this.posY);
    context.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.colour;
    context.fill();
}
function Pin(posX, posY) {
    this.posX = posX;
    this.posY = posY;

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

    context.beginPath();
    context.moveTo(this.posX, this.posY);
    context.arc(this.posX, this.posY + 18, 17, 0, 7);
    context.fillStyle = "#ff0003";
    context.fill();
}
function Load(posX, posY, mag){
    this.posX = posX;
    this.posY = posY;
    this.mag = mag;

    context.beginPath();
    context.moveTo(this.posX, this.posY);
    context.lineTo(this.posX, this.posY+50);
    context.moveTo(this.posX, this.posY+49);
    context.lineTo(this.posX-10, this.posY+39);
    context.moveTo(this.posX, this.posY+49);
    context.lineTo(this.posX+10, this.posY+39);
    context.fillStyle = "black";
    context.fillRect(this.posX-2, this.posY+47, 4, 4);
    context.strokeStyle = "black";
    context.stroke();
    context.font = "18px Cambria";
    context.fillStyle = "black";
    context.fillText(this.mag + " kN", this.posX-30, this.posY+70);
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
function tempPin(posX, posY, colour) {
    context.beginPath();
    context.moveTo(posX, posY);
    context.lineTo(posX + 20, posY + Math.sqrt(1200));
    context.lineTo(posX - 20, posY + Math.sqrt(1200));
    context.fillStyle = colour;
    context.fill();
}
function tempRoller(posX, posY, colour) {
    context.beginPath();
    context.moveTo(posX, posY);
    context.arc(posX, posY + 18, 17, 0, 7);
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
function copyLast(){
    undoHistory.push(context.getImageData(0, 0, canvas.width, canvas.height));
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

        newMember = new Member(startX, startY, endX, endY, length, angle);
        memberArray.push(newMember);
        newJoint = new Joint(startX, startY, numMember, startJointVisible);
        if (startJointVisible == true){
            jointArray.push(newJoint);
            typeHistory.push("J");
        }
        newJoint = new Joint(endX, endY, numMember, endJointVisible);
        if (endJointVisible == true){
            jointArray.push(newJoint);
            typeHistory.push("J");
        }
        typeHistory.push("M");
        console.log(memberArray);
        console.log(jointArray);
        //Length and Angle Updates to the Screen
        lengthText.textContent = "Length: " + length + " m";
        angleText.textContent = "Angle: " + angle + " deg";

        //Reset necessary variables to default
        reset();
    }
}

//MouseMove Functions
function checkPins(mouseX, mouseY) {
    for (let pins of pinArray) {
        if (distanceBetween(mouseX, mouseY, pins.posX, pins.posY + 20 * Math.tan(Math.PI / 3) - 20 * Math.tan(Math.PI / 6)) < 20 * Math.tan(Math.PI / 6)) {
            tempPin(pins.posX, pins.posY, "#e0233c");
            break;
        } else {
            tempPin(pins.posX, pins.posY, "#ff0003");
            tempJoint(pins.posX, pins.posY, "#909696");
        }
    }
}
function checkRollers(mouseX, mouseY) {
    for (let rollers of rollerArray) {
        if (distanceBetween(mouseX, mouseY, rollers.posX, rollers.posY + 18) < 17) {
            tempRoller(rollers.posX, rollers.posY, "#e0233c");
            break;
        } else {
            tempRoller(rollers.posX, rollers.posY, "#ff0003");
            tempJoint(rollers.posX, rollers.posY, "#909696");
        }
    }
}
function checkJoints(mouseX, mouseY) {
    for (let joints of jointArray) {
        if (distanceBetween(mouseX, mouseY, joints.posX, joints.posY) < joints.radius) {
            tempJoint(joints.posX, joints.posY, "#737a79");
            break;
        } else {
            tempJoint(joints.posX, joints.posY, "#909696");
        }
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
function loadActivate(){
    if (lineBegin){
        console.log("You must first finish creating the current member!");
    } else {
        pinButtonActive = false;
        rollerButtonActive = false;
        memberJointButtonActive = false;
        loadButtonActive = true;
    }
}
function undoLast(){
    if (undoHistory.length > 0){
        context.putImageData(undoHistory[undoHistory.length-1],0,0);
        undoHistory.pop();
        if (typeHistory[typeHistory.length-1] == "P"){
            pinArray.pop();
        } else if (typeHistory[typeHistory.length-1] == "R"){
            rollerArray.pop();
        } else if (typeHistory[typeHistory.length-1] == "L"){
            loadArray.pop();
        } else if (typeHistory[typeHistory.length-1] == "M"){
            memberArray.pop();
            if (typeHistory[typeHistory.length-2] == "J"){
                jointArray.pop();
                typeHistory.pop();
            }
            if (typeHistory[typeHistory.length-2] == "J"){
                jointArray.pop();
                typeHistory.pop();
            }
        }
        typeHistory.pop();
    }
    console.log(typeHistory);
    console.log(memberArray);
    console.log(jointArray);
    console.log(pinArray);
    console.log(rollerArray);
    console.log(loadArray);
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
    console.log(typeHistory);
    console.log(memberArray);
    console.log(jointArray);
    console.log(pinArray);
    console.log(rollerArray);
    console.log(loadArray);
}
function solveTruss(){
    if (memberArray.length + 2*(pinArray.length) + rollerArray.length === 2*(jointArray.length)){
        console.log("Statically Determinate!");
    } else {
        console.log("Statically Indeterminate!");
    }
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
            for (let elem of pinArray){ //Checks if there is already a pin at the current click location
                if (elem.posX == currX && elem.posY == currY){
                    check = 1;
                }
            }
            if (check == 0){
                copyLast();
                typeHistory.push("P");
                newPin = new Pin(currX, currY);
                pinArray.push(newPin);
                console.log(pinArray);
            }
        }
    } else if (rollerButtonActive) {
        if (inJoint()) {
            for (let elem of rollerArray){ //Checks if there is already a roller at the current click location
                if (elem.posX == currX && elem.posY == currY){
                    check = 1;
                }
            }
            if (check == 0){
                copyLast();
                typeHistory.push("R");
                newRoller = new Roller(currX, currY);
                rollerArray.push(newRoller);
                console.log(rollerArray);
            }
        }
    } else if (loadButtonActive) {
        if (inJoint()) {
            for (let elem of loadArray){ //Checks if there is already a load at the current click location
                if (elem.posX == currX && elem.posY == currY){
                    check = 1;
                }
            }
            if (check == 0){
                copyLast();
                typeHistory.push("L");
                newLoad = new Load(currX, currY, 1000);
                loadArray.push(newLoad);
                console.log(loadArray);
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
    //checkPins(mousePos.x, mousePos.y);
    //checkRollers(mousePos.x, mousePos.y);
    //checkJoints(mousePos.x, mousePos.y);
});