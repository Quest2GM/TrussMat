"use strict";
//Type Activation Variables
let memberPinButtonActive = true, pinButtonActive = false, rollerButtonActive = false;

//Canvas Variables
let canvas = document.getElementById("newCanvas"), context = canvas.getContext("2d"), snapShot;

//Line Property Variables
let lineBegin = false, startX, startY, endX, endY, mousePos, rect, length, angle, actualSize = 60;

//Paragraph Changer Variables
let lengthText = document.getElementById("lengthText"), angleText = document.getElementById("angleText");

//Member Property Variables
let newMember, memberArray = [], currStartX, currStartY, currEndX, currEndY;

//Joint Property Variables
let newJoint, jointArray = [], numMember = 0, clickedStartMouseInJoint = false, clickedEndMouseInJoint = false, startJointVisible = true, endJointVisible = true;

//Support Property Variables
let newPin, pinArray = [], newRoller, rollerArray = [];

//Constructor Function to build new member
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
    context.lineTo(this.posX + 20, this.posY + 34.641);
    context.lineTo(this.posX - 20, this.posY + 34.641);
    context.fillStyle = "#ff0003";
    context.fill();
}
function Roller(posX, posY) {
    this.posX = posX;
    this.posY = posY;

    context.beginPath();
    context.moveTo(this.posX, this.posY);
    context.arc(this.posX, this.posY, 17, 0, 7);
    context.fillStyle = "#ff0003";
    context.fill();
}

//Temporarily creates a member when the user move the mouse while creating a member
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

//Temporarily creates a joint when the user first clicks on the canvas
function tempJoint(posX, posY, colour) {
    context.beginPath();
    context.moveTo(posX, posY);
    context.arc(posX, posY, 10, 0, 2 * Math.PI);
    context.fillStyle = colour;
    context.fill();
}

//Returns the coordinates of the mouse
function getMousePos(event) {
    rect = canvas.getBoundingClientRect();
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
            if (lineBegin) {
                currStartX = joints.posX;
                currStartY = joints.posY;
                clickedStartMouseInJoint = true;
            } else {
                currEndX = joints.posX;
                currEndY = joints.posY;
                clickedEndMouseInJoint = true;
            }
            return true;
        }
    }
    return false;
}

//Calculation Functions: Length, Angles, Distance
function calcLength(y2, y1, x2, x1) {
    return Math.floor(Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)) * ((actualSize+10) / canvas.width) * 100) / 100;
}
function calcAngle(y2, y1, x2, x1) {
    return Math.floor((Math.abs((Math.atan((y2 - y1) / (x2 - x1))) / (2 * Math.PI) * 360)) * 10) / 10;
}
function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

//Allows you to drag members
function takeSnapshot() {
    snapShot = context.getImageData(0, 0, canvas.width, canvas.height);
}
function restoreSnapShot() {
    context.putImageData(snapShot, 0, 0);
}

//Function to Reset for Next Iteration
function reset() {
    numMember++;
    clickedStartMouseInJoint = false;
    clickedEndMouseInJoint = false;
    startJointVisible = true;
    endJointVisible = true;
}

//Active Run Code
//---------------------------------------------------------------------------

canvas.addEventListener("mousedown", (event) => {
    mousePos = getMousePos(event);
    if (!lineBegin) {
        lineBegin = true;
        startX = mousePos.x;
        startY = mousePos.y;
        if (inJoint()) {
            tempJoint(currStartX, currStartY, "#909696");
        } else {
            tempJoint(startX, startY, "#909696");
        }
        takeSnapshot();
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
        jointArray.push(newJoint);
        newJoint = new Joint(endX, endY, numMember, endJointVisible);
        jointArray.push(newJoint);

        //Length and Angle Updates to the Screen
        lengthText.textContent = "Length: " + length + " m";
        angleText.textContent = "Angle: " + angle + " deg";

        //Reset for Next Iteration
        reset();
    }
});

canvas.addEventListener("mousemove", (event) => {
    mousePos = getMousePos(event);
    if (lineBegin) {
        restoreSnapShot();
        tempMember(mousePos.x, mousePos.y);
    }
    for (let joints of jointArray) {
        if (distanceBetween(mousePos.x, mousePos.y, joints.posX, joints.posY) < joints.radius) {
            tempJoint(joints.posX, joints.posY, "#737a79");
            break;
        } else {
            tempJoint(joints.posX, joints.posY, "#909696");
        }
    }
});

function pinny() {
    newPin = new Pin(200, 300);
    pinArray.push(newPin);
}
function rolly() {
    newRoller = new Roller(400, 400);
    rollerArray.push(newRoller);
}
function trussy(){

}