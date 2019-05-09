# TrussMat: Statically Determinate Truss Bridge Solver for EngSci Students
This project was started on December 21st, 2018. The goal of this project is to help First Year Engineering Science students at the University of Toronto with the first bridge project they must complete in CIV102, a civil engineering structural design course. This truss solver solves statically determinate truss bridges with the method of joints, solves the virtual truss bridge at a specified joint, gives you the best possible HSS configuration for each member of the truss and solves the virtual work of the truss.

Project Working Status: In Progress (as of 16-Apr-2019).

## Motivation
As an Engineering Science student myself, I found this project to be quite tedious to complete within the two week frame we were given. It resulted in me having to do my very first all nighter. One of the biggest struggles for me during the project was trying to find a way to check my work. The math behind solving a truss is quite simple and intuitive, but any small error that you make early on can easily propogate. Designated by my group to do the calculation part of the project, which was worth 50% of our grade, I spent most of my time checking my work to ensure that I did not make a calculation error early on. Our group's final grade for the calculations portion was 48/50, and the two marks that we lost were because of calculation errors. Another difficulty I had was desigining the bridge itself. Each time I designed a new bridge that I hoped would work, I would solve the entire truss, only to find out that the forces in each of the members are way too large.

While there are several existing online truss solvers, such as [SkyCiv](https://skyciv.com/), [jfMatrix](http://jfmatrix.com/Analysis) or [Fast Truss Solver](https://www.microsoft.com/en-us/p/fast-truss-solver/9pc290v41k2q), they are either expensive, non-intuitive, difficult to design accurate bridges, limited in functionality, or overkill for this project. These are some of the things that I was looking for in a truss solver when I was doing the truss design project in CIV102, and I wasn't able to find one that did everything I wanted it to. A past EngSci student, Steven He, has also created an [truss bridge solver](http://engsci.stevenhe.com/trusssolver2), however, I found it a little difficult to add truss members with a specific length and can only solve the member forces and support reactions. TrussMat looks to resolve all of these issues.

## A Look Into The Program
### How does it work?
Using HTML5, a canvas was created for which the user can draw lines (truss members), circles (joints and rollers) and triangles (pins). Every time the user adds an element to the canvas, the coordinates of the element on the screen are tracked. Based on what the user types in as their span length at the start, the length per pixel is found, which gives each member drawn a real life size and an angle. After constructing a bridge that is statically determinate (when the number of members plus the number of support reactions is equal to two times the number of joints), a matrix is generated using the lengths of the members and the loads applied to the bridge, and computed using Gaussian elimination. All of the joints are labelled, and outputted into a table at the bottom.

### A Better Way to Implement
If you are looking at my code and think "there has to be an easier way to do this", you're probably right. This program was built using HTML, CSS and JavaScript which are common languages to use to build web apps. However, after writing 500 lines of regular JavaScript code, I came to know of p5.js, which is essentially a library that makes using HTML5 canvas and animations a lot easier. At the time, had I switched to p5.js, I could have probably halved my line count and had a program that is more space efficient and runs faster.

Looking back, I am actually quite happy that I saved time by not switching to p5. Although it does come with a lot of advantages, the program that I have currently built with regular JavaScript works quite quickly and without lag. In addition, I also feel that doing it the harder way had led me to make a lot more discoveries HTML5 canvas, which I don't think would have been possible had I done so otherwise.

### Features of the Program
1. A canvas to easily add members, joints, pins, rollers and loads.
2. Solves the forces in each member of statically determinate truss bridges.
3. Outputs the best HSS configuration for each member of the truss based on mass (based on the 2018 CIV102 Handbook), which I don't think anyone has done before as far as my research went.
4. Solves the virtual truss at a specified joint, and the virtual work for each member.
5. The user has the option to type in the length and angle to create a member for more accuracy. The user can also use the mouse to create a member more quickly.
6. User can delete truss objects using the "Delete" key on their keyboard, after clicking the "Select" button on the canvas.
7. Undo and clear canvas options are available.

### Critique (ie. Criticism)
There are a number of things which I know are bad coding practice, but I did them anyway just because.
1. A combination of inline and external CSS (but mostly inline).
2. Using for loops, when the 'forEach' object would simpify everything.
3. Incomplete or fragmented comments.
4. Nested if statements and for loops.
5. Extremely long functions (around 200 lines long), which can be broken down into more functions to reduce code repetition.
6. A weak attempt at object-oriented programming.

## Acknowledgements
Thank you to my TAs Allan Kuan and Brittany Yap for their wonderful CIV102 notes as they were key to developing the program. Thank you to Mosh Hamedani for his wonderful JavaScript tutorials. Another thank you to Marijn Haverbeke for her amazing online textbook, [Eloquent Javascript](https://eloquentjavascript.net/), from which I not only learned the fundamentals of JavaScript and the most useful JavaScript syntax, but also how I can approach building this program from afar.

Thank you to Kajanan Chinniah for the useful suggestions for improvement after the completion of the first and second draft of the project and for helping me try to break my program. A final thank you to my sister, Priyanka, for helping me with the getting ngrok web server running, so that I can distribute my web app.