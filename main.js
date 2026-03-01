// THOMAS PIETROVITO
// V00973900
// FEB 13 2026

var canvas;
var gl;

var program;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; 
var TIME = 0.0;
var dt = 0.0
var prevTime = 0.0;
var resetTimerFlag = true;
var animFlag = false;
var controller;


// Global position, rotation, speed vars
var astroPosition = [0, 0, 0];
var astroRotation = [0, 0, 0];
var astroSpeed = 0.5;

var armSwing = 0;
var legSwing = 0;

var jellyPosition = [3, 2, 0];
var jellyRotation = [0, 1, 0];

var stars = [];
var numStars = 100;
var starPosition = [0, 0, -50];
var starSpeed = 0.5;

// Setting the colour which is needed during illumination of a surface
function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    setColor(materialDiffuse);
    
    // Initialize some shapes, note that the curved ones are procedural which allows you to parameterize how nice they look
    // Those number will correspond to how many sides are used to "estimate" a curved surface. More = smoother
    Cube.init(program);
    Cylinder.init(20,program);
    Cone.init(20,program);
    Sphere.init(36,program);

    // Matrix uniforms
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // Lighting Uniforms
    gl.uniform4fv( gl.getUniformLocation(program, 
					 "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
					 "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
					 "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
					 "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
					"shininess"),materialShininess );


    // auto-run, no button
    window.requestAnimFrame(render);
    render(0);

//     document.getElementById("animToggleButton").onclick = function() {
//         if( animFlag ) {
//             animFlag = false;
//         }
//         else {
//             animFlag = true;
//             resetTimerFlag = true;
//             window.requestAnimFrame(render);
//         }
//         //console.log(animFlag);
//     };

//     render(0);
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV();   
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCube() {
    setMV();
    Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawSphere() {
    setMV();
    Sphere.draw();
}

// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCylinder() {
    setMV();
    Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCone() {
    setMV();
    Cone.draw();
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result, x, y, and z are the translation amounts for each axis
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result, theta is the rotation amount, x, y, z are the components of an axis vector (angle, axis rotations!)
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result, x, y, and z are the scale amounts for each axis
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}

// ----- ASTRO MAN FUNCTIONS -----
function astroMan() {
    gPush();

    drawTorso();

    drawBadge();
    drawButtons(1);
    drawButtons(-1);

    drawLeftArm();
    drawRightArm();

    drawLeftLeg();
    drawRightLeg();

    drawHead();
    gPop();
}

function drawHead() {
    gPush();

    // move to neck joint
    gTranslate(0, 1.40, 0);

    // draw main helmet
    gPush();
    setColor(vec4(0.9, 0.9, 0.9, 1.0));
    gTranslate(0, 0.75, 0);
    gScale(0.75, 0.75, 0.75);
    drawSphere();
    gPop();
    
    // draw visor
    gPush();
    // setColor(vec4(1, 1, 0, 1));
    setColor(vec4(1.0, 0.8, 0.0, 1.0));
    gTranslate(0, 0.75, 0.5);
    gScale(0.75, 0.5, 0.5);
    drawSphere();
    gPop();

    gPop();  
}

function drawTorso(side) {
    gPush();
    
    setColor(vec4(0.9, 0.9, 0.9, 1.0));
    gScale(1, 1.5, 1.0);
    drawCube();
    
    gPop();
}

function drawButtons(side) {
    gPush();
    
    // move to the lower quadrant of torso
    gTranslate(0.5 * side, -0.5, 1);

    // first set of buttons
    gPush();
    setColor(vec4(0.9, 1.9, 1.9, 1.0));
    gTranslate(0, 0.60, 0);
    gScale(0.2, 0.2, 0.2);
    drawSphere();
    gPop();

    // second set of buttons
    gPush();
    setColor(vec4(1.9, 0.0, 1.9, 1.0));
    gTranslate(0, 0, 0);
    gScale(0.2, 0.2, 0.2);
    drawSphere();
    gPop();

    // third set of buttons
    gPush();
    setColor(vec4(1.9, 0.0, 0.0, 1.0));
    gTranslate(0, -.60, 0);
    gScale(0.2, 0.2, 0.2);
    drawSphere();
    gPop();

    gPop();
}

function drawBadge() {
    gPush();
    setColor(vec4(0.0, 0.0, 1.9, 1.0));
    gTranslate(-0.5, 0.75, 1);
    gScale(0.3, 0.3, 0.01);
    drawSphere();
    gPop();
}

function drawLeftArm() {
    gPush();

    //move to shoulder
    gTranslate(1, 1, 0);
    gRotate(armSwing, 0, 0, 1);

    //save shoulder basis
    gPush();

    // move to center of arm
    gTranslate(1, -0.5, 0);

    // draw arm
    gPush();
    setColor(vec4(0.9, 0.9, 0.9, 1.0));
    gRotate(45, 0, 0, 1);
    gScale(0.25, 1, 0.5);
    drawCube();
    gPop();
    
    //return to shoulder basis
    gPop();
    
    //return to astroBasis
    gPop();
}

function drawRightArm() {
    gPush();

    //move to shoulder
    gTranslate(-1, 1, 0);
    gRotate(armSwing, 0, 0, 1);

    //save shoulder basis
    gPush();

    // move to center of arm
    gTranslate(-1, -0.5, 0);

    // draw arm
    gPush();
    setColor(vec4(0.9, 0.9, 0.9, 1.0));
    gRotate(-45, 0, 0, 1);
    gScale(0.25, 1, 0.5);
    drawCube();
    gPop();
    
    //return to shoulder basis
    gPop();
    
    //return to astroBasis
    gPop();
    
}

function drawLeftLeg() {
    // save astroman basis
    gPush();

    // move to hip joint
    gTranslate(0.75, -1.5, 0);
    gRotate(20, 1, 0, 0);
    gRotate(legSwing, 1, 0, 0);

    //save hip basis
    gPush();

    // draw upper leg
    gPush();
    setColor(vec4(0.9, 0.9, 0.9, 1.0));
    gTranslate(0, -1, 0);
    gScale(0.25, 1, 0.5);
    drawCube();
    gPop();

    // move to knee joint
    gTranslate(0, -2, 0);
    gRotate(25, 1, 0, 0);
    gRotate(legSwing, 1, 0, 0);

    // save knee basis
    gPush();
    
    // draw lower leg
    gPush();
    setColor(vec4(0.9, 0.9, 0.9, 1.0));
    gTranslate(0, -1, 0);
    gScale(0.25, 1, 0.5);
    drawCube();
    gPop();

    // move to ankle joint
    gTranslate(0, -2, 0);
    gRotate(armSwing, 1, 0, 0);

    // draw feet
    gPush();
    setColor(vec4(0.9, 0.9, 0.9, 1.0));
    gTranslate(0, -0.10, 0.5);
    gScale(0.25, 0.10, 0.5);
    drawCube();
    gPop();

    // return to knee basis
    gPop();

    // return to hip basis
    gPop();
    
    // return to astroman basis
    gPop();
}

function drawRightLeg() {
    // save astroman basis
    gPush();

    // move to hip joint
    gTranslate(-0.75, -1.5, 0);
    gRotate(20, 1, 0, 0);
    gRotate(-1 * legSwing, 1, 0, 0);

    //save hip basis
    gPush();

    // draw upper leg
    gPush();
    setColor(vec4(0.9, 0.9, 0.9, 1.0));
    gTranslate(0, -1, 0);
    gScale(0.25, 1, 0.5);
    drawCube();
    gPop();

    // move to knee joint
    gTranslate(0, -2, 0);
    gRotate(25, 1, 0, 0);
    gRotate(-1 * legSwing, 1, 0, 0);

    // save knee basis
    gPush();
    
    // draw lower leg
    gPush();
    setColor(vec4(0.9, 0.9, 0.9, 1.0));
    gTranslate(0, -1, 0);
    gScale(0.25, 1, 0.5);
    drawCube();
    gPop();

    // move to ankle joint
    gTranslate(0, -2, 0);
    gRotate(armSwing, 1, 0, 0);

    // draw feet
    gPush();
    setColor(vec4(0.9, 0.9, 0.9, 1.0));
    gTranslate(0, -0.10, 0.5);
    gScale(0.25, 0.10, 0.5);
    drawCube();
    gPop();

    // return to knee basis
    gPop();

    // return to hip basis
    gPop();
    
    // return to astroman basis
    gPop();
}

// ----- JELLY FUNCTIONS-----
function spaceJelly() {
    gPush();
    jellyHead();
    jellyTents(3, 5);
    gPop();
}

function jellyHead() {
    // main section
    gPush();
    // setColor(vec4(1.0, 0.6, 0.8, 1.0));
    setColor(vec4(0.8, 0.0, 0.5, 1.0));
    gScale(0.6, 1.5, 1.5);
    drawSphere();
    gPop();

    // secondary section
    gPush();
    // setColor(vec4(1.0, 0.6, 0.8, 1.0));
    setColor(vec4(0.8, 0.0, 0.5, 1.0));
    gTranslate(-0.7, 0, 0);
    gScale(0.40, 0.8, 0.75);
    drawSphere();
    gPop();
}

function jellyTents(arms, segments) {
    
    let spacing = 0.75;
    let amplitude = 15;
    let freq = 1.5;
    
    for (let i = 0; i < arms; i++){
	//save curent basis
	gPush();

	// space arms
	let y = (i - (arms-1)/2) * spacing;

	// move to attachment point with spacing
	gTranslate(-1.25, y, 0);

	// draw the segments
	for (let j = 0; j < segments; j++){

	    let theta = jellySwing(amplitude, freq, j);
	    
	    gRotate(theta, 0, 0, 1);
	    drawTent();
	    
	    // move to end of tenticle
	    gTranslate(-1, 0, 0);
	}	
	gPop();
    }
}

function drawTent(){
    gPush();
    // setColor(vec4(1.0, 0.92, 0.55, 1.0));
    setColor(vec4(1.0, 0.8, 0.0, 1.0));
    gScale(0.5, 0.2, 0.2);
    drawSphere();
    gPop();
}

function jellySwing(amp, freq, k){
    return amp * Math.sin(TIME * freq - k);
}

// ----- STAR FUNCTIONS -----
function initStars() {

    // generate an array of stars with random x, y size
    for (let i = 0; i < numStars; i++){
	stars.push({
	    x: (Math.random() - 0.5) * 12,
	    y: (Math.random() - 0.5) * 12,
	    size:(Math.random() * 0.05),
	});
    }
}

function drawStars() {
    gPush();

    gTranslate(starPosition[0], starPosition[1], 0);
    
    for (let i = 0; i < stars.length; i++){
	gPush();

	let s = stars[i];
	
	setColor(vec4(1, 1, 1, 1));
	gTranslate(s.x, s.y, starPosition[2]);	    
	gScale(s.size, s.size, s.size);
	drawSphere();
	gPop();
    }

    gPop();
}

// ----- PROGRAM MAIN -----

// initalize stars
initStars();

function render(timestamp) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,10);
    MS = []; // Initialize modeling matrix stack
    
    // initialize the modeling matrix to identity
    modelMatrix = mat4();
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
    
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    
    // set all the matrices
    setAllMatrices();

    // ----- ANIMATION -----
    // if(animFlag){

    dt = (timestamp - prevTime) / 1000.0;
    prevTime = timestamp;
    TIME += dt;

    // ----- ASTROMAN ANIMATION -----

    // position
    astroPosition[0] = 1  + Math.sin(TIME * 0.25);
    astroPosition[1] = -0.5 + Math.sin(TIME * 0.25);

    // arms
    armSwing = 12 * Math.sin(TIME);

    // legs
    legSwing = 20 * Math.sin(TIME);

    // ----- JELLY ANIMATION -----

    // rotation
    jellyRotation[1] = jellyRotation[1] + 10*dt;

    // ----- STAR ANIMATION -----
    const w = right - left; // the full width of the frame!
    const h = ytop - bottom; // the full height of the frame!

    for (let i = 0; i < stars.length; i++) {
	let s = stars[i];

	s.x += starSpeed * dt;
	s.y += starSpeed * dt;

	// if past the right bound, subtract frame width
	if (s.x > right){
	    s.x -= w;
	}

	// if past the top bound, subtract frame height
	if (s.y > ytop){
	    s.y -= h;
	}

	// lower x bound
	if (s.x < left){
	    s.x += w;
	}

	// lower y bound
	if (s.y < bottom){
	    s.y += h;
	}

	
    }
    // }

    // position the astroman in the world basis
    gPush();
    gTranslate(astroPosition[0], astroPosition[1], astroPosition[2]);
    gRotate(-15, 0, 1, 0);
    gScale(0.45, 0.45, 0.45);
    astroMan();
    gPop();

    // postition the jelly in the world basis
    gPush();
    gRotate(jellyRotation[1], 0, 1, 0);
    gTranslate(jellyPosition[0], jellyPosition[1], jellyPosition[2]);
    gRotate(-1*jellyPosition[1] +90, 0, 1, 0);
    gScale(0.5, 0.5, 0.5);
    spaceJelly();
    gPop();

    // stars
    gPush();
    drawStars();
    gPop();
    
    // if(animFlag)
    window.requestAnimFrame(render);
}
