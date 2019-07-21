// element: a jQuery object containing the DOM element to use
// dimensions: the number of cubes per row/column (default 3)
// background: the scene background color
function Rubik(element, dimensions, background) {

    dimensions = dimensions || 3;
    background = background || "0x303030";

    const width = element.innerWidth();
    const height = element.innerHeight();

    // const debug = true;
    const debug = false;

    /*** three.js boilerplate ***/
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({antialias: true});

    renderer.setClearColor(background, 1.0);
    renderer.setSize(width, height);
    renderer.shadowMapEnabled = true;
    element.append(renderer.domElement);

    camera.position = new THREE.Vector3(-20, 20, 30);
    camera.lookAt(scene.position);
    THREE.Object3D._threexDomEvent.camera(camera);

    /*** Lights ***/
    scene.add(new THREE.AmbientLight(0xffffff));
    //TODO: add a spotlight that takes the orbitcontrols into account to stay "static"

    /*** Camera controls ***/
    var orbitControl = new THREE.OrbitControls(camera, renderer.domElement);

    function enableCameraControl() {
        orbitControl.noRotate = false;
    }

    function disableCameraControl() {
        orbitControl.noRotate = true;
    }

    /*** Debug aids ***/
    if (debug) {
        scene.add(new THREE.AxisHelper(20));
    }

    /*** Click handling ***/

        //Do the given coordinates intersect with any cubes?
    const SCREEN_HEIGHT = window.innerHeight;
    const SCREEN_WIDTH = window.innerWidth;

    const rayCaster = new THREE.Raycaster(),
        projector = new THREE.Projector();

    function isMouseOverCube(mouseX, mouseY) {
        var directionVector = new THREE.Vector3();

        //Normalise mouse x and y
        var x = ( mouseX / SCREEN_WIDTH ) * 2 - 1;
        var y = -( mouseY / SCREEN_HEIGHT ) * 2 + 1;

        directionVector.set(x, y, 1);

        projector.unprojectVector(directionVector, camera);
        directionVector.sub(camera.position);
        directionVector.normalize();
        rayCaster.set(camera.position, directionVector);

        return rayCaster.intersectObjects(allCubes, true).length > 0;
    }

    //Return the axis which has the greatest magnitude for the vector v
    function principalComponent(v) {
        var maxAxis = 'x',
            max = Math.abs(v.x);
        if (Math.abs(v.y) > max) {
            maxAxis = 'y';
            max = Math.abs(v.y);
        }
        if (Math.abs(v.z) > max) {
            maxAxis = 'z';
            max = Math.abs(v.z);
        }
        return maxAxis;
    }

    //For each mouse down, track the position of the cube that
    // we clicked (clickVector) and the face object that we clicked on
    // (clickFace)
    var clickVector, clickFace;

    //Keep track of the last cube that the user's drag exited, so we can make
    // valid movements that end outside of the Rubik's cube
    var lastCube;

    var onCubeMouseDown = function (e, cube) {
        disableCameraControl();

        //Maybe add move check in here
        if (true || !isMoving) {
            clickVector = cube.rubikPosition.clone();

            var centroid = e.targetFace.centroid.clone();
            centroid.applyMatrix4(cube.matrixWorld);

            //Which face (of the overall cube) did we click on?
            if (nearlyEqual(Math.abs(centroid.x), maxExtent))
                clickFace = 'x';
            else if (nearlyEqual(Math.abs(centroid.y), maxExtent))
                clickFace = 'y';
            else if (nearlyEqual(Math.abs(centroid.z), maxExtent))
                clickFace = 'z';
        }
    };

    //Matrix of the axis that we should rotate for
    // each face-drag action
    //    F a c e
    // D    X Y Z
    // r  X - Z Y
    // a  Y Z - X
    // g  Z Y X -
    var transitions = {
        'x': {'y': 'z', 'z': 'y'},
        'y': {'x': 'z', 'z': 'x'},
        'z': {'x': 'y', 'y': 'x'}
    }

    var onCubeMouseUp = function (e, cube) {

        if (clickVector) {
            //TODO: use the actual mouse end coordinates for finer drag control
            var dragVector = cube.rubikPosition.clone();
            dragVector.sub(clickVector);

            //Don't move if the "drag" was too small, to allow for
            // click-and-change-mind.
            if (dragVector.length() > cubeSize) {

                //Rotate with the most significant component of the drag vector
                // (excluding the current axis, because we can't rotate that way)
                var dragVectorOtherAxes = dragVector.clone();
                dragVectorOtherAxes[clickFace] = 0;

                var maxAxis = principalComponent(dragVectorOtherAxes);

                var rotateAxis = transitions[clickFace][maxAxis],
                    direction = dragVector[maxAxis] >= 0 ? 1 : -1;

                //Reverse direction of some rotations for intuitive control
                //TODO: find a general solution!
                if (clickFace == 'z' && rotateAxis == 'x' ||
                    clickFace == 'x' && rotateAxis == 'z' ||
                    clickFace == 'y' && rotateAxis == 'z')
                    direction *= -1;

                if (clickFace == 'x' && clickVector.x > 0 ||
                    clickFace == 'y' && clickVector.y < 0 ||
                    clickFace == 'z' && clickVector.z < 0)
                    direction *= -1;

                pushMove(cube, clickVector.clone(), rotateAxis, direction);
                startNextMove();
                enableCameraControl();
            } else {
                console.log("Drag me some more please!");
            }
        }
    };

    //If the mouse was released outside of the Rubik's cube, use the cube that the mouse
    // was last over to determine which move to make
    var onCubeMouseOut = function (e, cube) {
        //TODO: there is a possibility that, at some rotations, we may catch unintentional
        // cubes on the way out. We should check that the selected cube is on the current
        // drag vector.
        lastCube = cube;
    }
<<<<<<< Updated upstream
  });

  /*** Build 27 cubes ***/
  // Order: right, left, top, bottom, front, back
  var colours = [0xC41E3A, 0x009E60, 0x0051BA, 0xFF5800, 0xFFD500, 0xFFFFFF];
      
  var cubeMaterials = [];
  for(let i = 0; i < 27; i++){
    let faceMaterialC = [0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
    if(i % 3 == 0) faceMaterialC[5] = colours[5];
    if(i % 3 == 2) faceMaterialC[4] = colours[4];
    if((i - (i % 3)) / 3 % 3 == 0) faceMaterialC[3] = colours[3];
    if((i - (i % 3)) / 3 % 3 == 2) faceMaterialC[2] = colours[2];
    if((((i - (i % 3)) / 3) - (((i - (i % 3)) / 3) % 3)) / 3 == 0) faceMaterialC[1] = colours[1];
    if((((i - (i % 3)) / 3) - (((i - (i % 3)) / 3) % 3)) / 3 == 2) faceMaterialC[0] = colours[0];

    faceMaterials = faceMaterialC.map(function(c) {
      return new THREE.MeshLambertMaterial({ color: c , ambient: c });
    });
    cubeMaterials.push(new THREE.MeshFaceMaterial(faceMaterials))
  }


  var cubeSize = 3,
      spacing = 0.5;

  var increment = cubeSize + spacing,
      maxExtent = (cubeSize * dimensions + spacing * (dimensions - 1)) / 2, 
      allCubes = [];

  function newCube(x, y, z) {
    var cubeGeometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterials[allCubes.length]);
    cube.castShadow = true;

    cube.position = new THREE.Vector3(x, y, z);
    cube.rubikPosition = cube.position.clone();

    cube.on('mousedown', function(e) {
      onCubeMouseDown(e, cube);
    });
=======
>>>>>>> Stashed changes

    element.on('mouseup', function (e) {
        if (!isMouseOverCube(e.clientX, e.clientY)) {
            if (lastCube)
                onCubeMouseUp(e, lastCube);
        }
    });

    /*** Build X cubes ***/
    var initialColor = '#000000';
    var initialFaceMaterials = [];
    for (var i = 0; i < 6; i++) {
        var initBlack = new THREE.MeshLambertMaterial({color: initialColor, ambient: initialColor});
        initialFaceMaterials.push(initBlack);
    }


    var cubeSize = 3,
        spacing = 0.25;

    var increment = cubeSize + spacing,
        maxExtent = (cubeSize * dimensions + spacing * (dimensions - 1)) / 2,
        allCubes = [];

    function newCube(x, y, z) {
        var faceMaterials = initialFaceMaterials.slice();
        var cubeNo = allCubes.length;
        for (var i = 0; i < 6; i++) {
            var material = createMaterial(cubeNo);
            faceMaterials[i] = material;
        }
        let cubeMaterials = new THREE.MeshFaceMaterial(faceMaterials);
        let cubeGeometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
        cube.castShadow = true;

        cube.position = new THREE.Vector3(x, y, z);
        cube.rubikPosition = cube.position.clone();

        cube.on('mousedown', function (e) {
            onCubeMouseDown(e, cube);
        });

        cube.on('mouseup', function (e) {
            onCubeMouseUp(e, cube);
        });

        cube.on('mouseout', function (e) {
            onCubeMouseOut(e, cube);
        });

        scene.add(cube);
        allCubes.push(cube);
    }

    var positionOffset = (dimensions - 1) / 2;
    for (var i = 0; i < dimensions; i++) {
        for (var j = 0; j < dimensions; j++) {
            for (var k = 0; k < dimensions; k++) {

<<<<<<< Updated upstream
  var startNextMove = function() {
    var nextMove = moveQueue.unshift();
=======
                var x = (i - positionOffset) * increment,
                    y = (j - positionOffset) * increment,
                    z = (k - positionOffset) * increment;
>>>>>>> Stashed changes

                newCube(x, y, z);
            }
        }
    }
    colorCubes();

    /*** Manage transition states ***/

        //TODO: encapsulate each transition into a "Move" object, and keep a stack of moves
        // - that will allow us to easily generalise to other states like a "hello" state which
        // could animate the cube, or a "complete" state which could do an animation to celebrate
        // solving.
    var moveEvents = $({});

//Maintain a queue of moves so we can perform compound actions like shuffle and solve
    var moveQueue = [],
        completedMoveStack = [],
        currentMove;

//Are we in the middle of a transition?
    var isMoving = false,
        moveAxis, moveN, moveDirection,
        rotationSpeed = 0.2;

//http://stackoverflow.com/questions/20089098/three-js-adding-and-removing-children-of-rotated-objects
    var pivot = new THREE.Object3D(),
        activeGroup = [];

    function nearlyEqual(a, b, d) {
        d = d || 0.001;
        return Math.abs(a - b) <= d;
    }

//Select the plane of cubes that aligns with clickVector
// on the given axis
    function setActiveGroup(axis) {
        if (clickVector) {
            activeGroup = [];

            allCubes.forEach(function (cube) {
                if (nearlyEqual(cube.rubikPosition[axis], clickVector[axis])) {
                    activeGroup.push(cube);
                }
            });
        } else {
            console.log("Nothing to move!");
        }
    }

    var pushMove = function (cube, clickVector, axis, direction) {
        moveQueue.push({cube: cube, vector: clickVector, axis: axis, direction: direction});
    };

    var startNextMove = function () {
        var nextMove = moveQueue.pop();

        if (nextMove) {
            clickVector = nextMove.vector;

            var direction = nextMove.direction || 1,
                axis = nextMove.axis;

            if (clickVector) {

                if (!isMoving) {
                    isMoving = true;
                    moveAxis = axis;
                    moveDirection = direction;

                    setActiveGroup(axis);

                    pivot.rotation.set(0, 0, 0);
                    pivot.updateMatrixWorld();
                    scene.add(pivot);

                    activeGroup.forEach(function (e) {
                        THREE.SceneUtils.attach(e, scene, pivot);
                    });

                    currentMove = nextMove;
                } else {
                    console.log("Already moving!");
                }
            } else {
                console.log("Nothing to move!");
            }
        } else {
            moveEvents.trigger('deplete');
        }
    };

    function doMove() {
        //Move a quarter turn then stop
        if (pivot.rotation[moveAxis] >= Math.PI / 2) {
            //Compensate for overshoot. TODO: use a tweening library
            pivot.rotation[moveAxis] = Math.PI / 2;
            moveComplete();
        } else if (pivot.rotation[moveAxis] <= Math.PI / -2) {
            pivot.rotation[moveAxis] = Math.PI / -2;
            moveComplete()
        } else {
            pivot.rotation[moveAxis] += (moveDirection * rotationSpeed);
        }
    }

    var moveComplete = function () {
        isMoving = false;
        moveAxis, moveN, moveDirection = undefined;
        clickVector = undefined;

        pivot.updateMatrixWorld();
        scene.remove(pivot);
        activeGroup.forEach(function (cube) {
            cube.updateMatrixWorld();

            cube.rubikPosition = cube.position.clone();
            cube.rubikPosition.applyMatrix4(pivot.matrixWorld);

            THREE.SceneUtils.detach(cube, pivot, scene);
        });

        completedMoveStack.push(currentMove);

        moveEvents.trigger('complete');

        //Are there any more queued moves?
        startNextMove();
    };

    function render() {

        //States
        //TODO: generalise to something like "activeState.tick()" - see comments
        // on encapsulation above
        if (isMoving) {
            doMove();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    /*** Util ***/
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    //Go!
    render();

    function createMaterial(number, color = '#000000') {
        var canvas = document.createElement("canvas");
        ctx = canvas.getContext('2d');
        ctx.font = '40pt Calibri';
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
        ctx.fillStyle = invertColor(color, true);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (debug) {
            ctx.fillText("" + number, canvas.width / 2, canvas.height / 2);
        }
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return new THREE.MeshBasicMaterial({map: texture});
    }

    function invertColor(hex, bw) {
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        var r = parseInt(hex.slice(0, 2), 16),
            g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            // http://stackoverflow.com/a/3943023/112731
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                ? '#000000'
                : '#FFFFFF';
        }
        // invert color components
        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        // pad each with zeros and return
        return "#" + padZero(r) + padZero(g) + padZero(b);
    }

    //TODO Implement
    function colorCubes() {
        var fieldsPerSide = dimensions * dimensions;
        var stickersOnCube = 6 * fieldsPerSide;
        //w,r,g,o,b,y
        var custom4by4Cube = [
            'w', 'w', 'w', 'w',
            'w', 'w', 'w', 'w',
            'w', 'w', 'w', 'w',
            'w', 'w', 'w', 'g',

            'r', 'r', 'r', 'r',
            'r', 'r', 'r', 'g',
            'r', 'r', 'r', 'r',
            'r', 'r', 'r', 'r',

            'g', 'g', 'g', 'g',
            'g', 'g', 'g', 'w',
            'g', 'g', 'g', 'g',
            'g', 'g', 'g', 'g',

            'o', 'o', 'o', 'o',
            'o', 'o', 'o', 'g',
            'o', 'o', 'o', 'o',
            'o', 'o', 'o', 'o',

            'b', 'b', 'b', 'b',
            'b', 'b', 'b', 'g',
            'b', 'b', 'b', 'b',
            'b', 'b', 'b', 'b',

            'y', 'y', 'y', 'y',
            'y', 'y', 'y', 'y',
            'y', 'y', 'y', 'g',
            'y', 'y', 'y', 'y'
        ];

        var testCube = custom4by4Cube;
        //Validate test cube - if not fit to current dimension, replace with solved standard
        testCube = (testCube.length / stickersOnCube === 1) ? testCube : null;

        var colors = {
            'r': '#ba1a2e',
            'g': '#078d0e',
            'b': '#2b85e5',
            'o': '#e57f2b',
            'y': '#efe446',
            'w': '#FFFFFF'
        };

        var greenSideIds = generateGreenSide();
        var blueSideIds = generateBlueSide();

        var whiteSide = function (cubeId) {
            cubeId = cubeId;
            let faceId = (cubeId % fieldsPerSide >= (dimensions * (dimensions - 1))) ? 2 : false;
            return [cubeId, faceId];
        };
        var redSide = function (cubeId) {
            cubeId = cubeId;
            //1st side of the first x * x cubes
            let faceId = (cubeId < fieldsPerSide) ? 1 : false;
            return [cubeId, faceId];
        };
        var greenSide = function (cubeId) {
            let isThisColor = (cubeId % dimensions === 0)
            cubeId = isThisColor ? greenSideIds.shift() : cubeId;
            let faceId = isThisColor ? 5 : false;
            return [cubeId, faceId];
        };
        var orangeSide = function (cubeId) {
            cubeId = cubeId;
            let faceId = (cubeId >= (fieldsPerSide * (dimensions - 1))) ? 0 : false;
            return [cubeId, faceId];
        };
        var blueSide = function (cubeId) {
            let isThisColor = (cubeId % dimensions === (dimensions - 1));
            cubeId = isThisColor ? blueSideIds.shift() : cubeId;
            let faceId = isThisColor ? 4 : false;
            return [cubeId, faceId];
        };
        var yellowSide = function (cubeId) {
            cubeId = cubeId;
            let faceId = (cubeId % fieldsPerSide < dimensions) ? 3 : false;
            return [cubeId, faceId];
        };
        loopThroughCube(whiteSide, 'w', 'w');
        loopThroughCube(redSide, 'r', 'r');
        loopThroughCube(greenSide, 'g');
        loopThroughCube(orangeSide, 'o');
        loopThroughCube(blueSide, 'b');
        loopThroughCube(yellowSide, 'y', false, false);

        var faceId;
        var colorId;
        var color;

        function generateGreenSide() {
            var iterators = [];
            for (var row = 1; row <= dimensions; row++) {
                for (var column = dimensions; column > 0; column--) {
                    var iterator = (dimensions * dimensions * column) - (dimensions * row);
                    if (iterator < 0 || iterator > stickersOnCube) {
                        console.log(iterator, "not valid cube");
                    }
                    iterators.push(iterator);
                }
            }
            return iterators;
        }

        function generateBlueSide() {
            var iterators = [];
            for (var row = 0; row < dimensions; row++) {
                for (var column = 1; column <= dimensions; column++) {
                    var iterator = (dimensions * dimensions * column) - (dimensions * row) - 1;
                    if (iterator < 0 || iterator > stickersOnCube) {
                        console.log(iterator, "not valid cube");
                    }
                    iterators.push(iterator);
                }
            }
            return iterators;
        }

        function mirror(x, c) {
            var moduloX = x % dimensions;
            let maxIndex = dimensions - 1;
            let middleMirror = (dimensions % 2 !== 0) ? 0 : 1;
            // var divisions = Math.floor(x / dimensions) % dimensions;
            var sides = {
                'r': [-maxIndex, -middleMirror, middleMirror, maxIndex, moduloX],
                'o': [-maxIndex, -middleMirror, middleMirror, maxIndex, moduloX],
                'w': [-maxIndex, -middleMirror, middleMirror, maxIndex, moduloX]
            };
            switch (moduloX) {
                case dimensions - 1:
                    x += sides[c][0];
                    break;
                case 2:
                    x += sides[c][1];
                    break;
                case 1:
                    x += sides[c][2];
                    break;
                case 0:
                    x += sides[c][3];
                    break;
            }
            return x;
        }

        /**
         *
         * @param callback
         * @param mirrorColor 'r','g',...
         * @param backwards bool
         */
        function loopThroughCube(callback, defaultColor, mirrorColor, backwards = true) {
            var iterator;
            for (let i = 0, l = allCubes.length; i < l; i++) {
                iterator = backwards ? l - 1 - i : i;
                if (mirrorColor) {
                    iterator = mirror(iterator, mirrorColor);
                }
                var sideSpecificCalculations = callback(iterator);
                iterator = sideSpecificCalculations[0];
                if (iterator < 0 || iterator > stickersOnCube) {
                    console.log(iterator, "not valid cube");
                    continue;
                }
                faceId = sideSpecificCalculations[1];
                var cube = allCubes[iterator];
                if (faceId !== false) {
                    if (testCube) {
                        colorId = testCube.shift();
                    } else {
                        colorId = defaultColor;
                    }
                    color = colors[colorId];
                    console.log(colorId, faceId, iterator);
                    cube.material.materials[faceId] = createMaterial(iterator, color);
                    /*                    new THREE.MeshLambertMaterial({
                                            color: color,
                                            ambient: color
                                        });*/
                }
            }
        }
    }

//Public API
    return {
        shuffle: function () {
            function randomAxis() {
                return ['x', 'y', 'z'][randomInt(0, 2)];
            }

            function randomDirection() {
                var x = randomInt(0, 1);
                if (x == 0) x = -1;
                return x;
            }

            function randomCube() {
                var i = randomInt(0, allCubes.length - 1);
                //TODO: don't return a centre cube
                return allCubes[i];
            }

            var nMoves = randomInt(10, 40);
            for (var i = 0; i < nMoves; i++) {
                //TODO: don't reselect the same axis?
                var cube = randomCube();
                pushMove(cube, cube.position.clone(), randomAxis(), randomDirection());
            }

            startNextMove();
        },

        //A naive solver - step backwards through all completed steps
        solve: function () {
            if (!isMoving) {
                completedMoveStack.forEach(function (move) {
                    pushMove(move.cube, move.vector, move.axis, move.direction * -1);
                });

                //Don't remember the moves we're making whilst solving
                completedMoveStack = [];

                moveEvents.one('deplete', function () {
                    completedMoveStack = [];
                });

                startNextMove();
            }
        },

        //Rewind the last move
        undo: function () {
            if (!isMoving) {
                var lastMove = completedMoveStack.pop();
                if (lastMove) {
                    //clone
                    var stackToRestore = completedMoveStack.slice(0);
                    pushMove(lastMove.cube, lastMove.vector, lastMove.axis, lastMove.direction * -1);

                    moveEvents.one('complete', function () {
                        completedMoveStack = stackToRestore;
                    });

                    startNextMove();
                }
            }
        },

        remove: () => {
            for (let i = 0; i < allCubes.length; i++) {
                let cube = allCubes[i];
                scene.remove(cube);
                cube.geometry.dispose();
                // cube.material.dispose();
                // cube.texture.dispose();
            }
        }
    }
}

