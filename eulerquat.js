var camera, scene, renderer;
var geometry, material, mesh;
var rendererHeight,
  	rendererWidth;

const WIDTH_FACTOR = 0.49, HEIGHT_FACTOR = 0.8;

const AXIS_LENGTH = 430,
    TRACE_SEGMENTS = 25;

var objectDragged = "none";
var mousePos = {x:0, y:0},
    cameraPos = {x:0.425, y:0.595};

var vectorObject = new THREE.Line();
var vectorQuaternion = new THREE.Quaternion();
var rotationAxis = new THREE.Vector3(0,1,0);
var axisXName, axisYName, axisZName;
var eulerOrder = "XYZ";
var eulerAngleFormat = "degrees";

var meshTraceObject = new THREE.Mesh();
var lineTraceObject = new THREE.Line();

var animation = false, showAxis = false;
var rotationAxisObject = new THREE.Line();


init();
animate();

function init() {
    setAnimation(true);

    rendererWidth = document.getElementById("renderDiv").clientWidth;
    rendererHeight = Math.min(document.getElementById("renderDiv").clientHeight, window.innerHeight * HEIGHT_FACTOR);
    aspectRatio = rendererWidth / rendererHeight;

    camera = new THREE.PerspectiveCamera(75, aspectRatio, 1, 10000);
    turnCamera();

    scene = new THREE.Scene();

    initGrid();
    initAxes();
    initAxesNames();
    initVector();
    initLineTrace();
    initRotationAxis();

    renderer = new THREE.WebGLRenderer({ alpha: true , antialias: true});
    renderer.setSize(rendererWidth, rendererHeight);
    renderer.setClearColor( 0xffffff, 1 );

    document.getElementById("renderDiv").appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mousedown', handleMouseDown, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);
}

function initGrid() {
    var GRID_SEGMENT_COUNT = 5;
    var gridLineMat      = new THREE.LineBasicMaterial({color: 0xDDDDDD});
    var gridLineMatThick = new THREE.LineBasicMaterial({color: 0xAAAAAA, linewidth: 2});

    for (var i=-GRID_SEGMENT_COUNT; i<=GRID_SEGMENT_COUNT; i++) {
        var dist = AXIS_LENGTH * i / GRID_SEGMENT_COUNT;
        var gridLineGeomX = new THREE.Geometry();
        var gridLineGeomY = new THREE.Geometry();

        if (i == 0) {
            gridLineGeomX.vertices.push(new THREE.Vector3(dist, 0, -AXIS_LENGTH));
            gridLineGeomX.vertices.push(new THREE.Vector3(dist, 0,  0));

            gridLineGeomY.vertices.push(new THREE.Vector3(-AXIS_LENGTH, 0, dist));
            gridLineGeomY.vertices.push(new THREE.Vector3(           0, 0, dist));

            scene.add(new THREE.Line(gridLineGeomX, gridLineMatThick));
            scene.add(new THREE.Line(gridLineGeomY, gridLineMatThick));
        } else {
            gridLineGeomX.vertices.push(new THREE.Vector3(dist, 0, -AXIS_LENGTH));
            gridLineGeomX.vertices.push(new THREE.Vector3(dist, 0,  AXIS_LENGTH));

            gridLineGeomY.vertices.push(new THREE.Vector3(-AXIS_LENGTH, 0, dist));
            gridLineGeomY.vertices.push(new THREE.Vector3( AXIS_LENGTH, 0, dist));

            scene.add(new THREE.Line(gridLineGeomX, gridLineMat));
            scene.add(new THREE.Line(gridLineGeomY, gridLineMat));
        }
    }
}

function initAxes() {
    var xAxisMat = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 2});
    var xAxisGeom = new THREE.Geometry();
    xAxisGeom.vertices.push(new THREE.Vector3(0, 0, 0));
    xAxisGeom.vertices.push(new THREE.Vector3(AXIS_LENGTH, 0, 0));
    var xAxis = new THREE.Line(xAxisGeom, xAxisMat);
    scene.add(xAxis);

    var yAxisMat = new THREE.LineBasicMaterial({color: 0x00cc00, linewidth: 2});
    var yAxisGeom = new THREE.Geometry();
    yAxisGeom.vertices.push(new THREE.Vector3(0, 0, 0));
    yAxisGeom.vertices.push(new THREE.Vector3(0, AXIS_LENGTH, 0));
    var yAxis = new THREE.Line(yAxisGeom, yAxisMat);
    scene.add(yAxis);

    var zAxisMat = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 2});
    var zAxisGeom = new THREE.Geometry();
    zAxisGeom.vertices.push(new THREE.Vector3(0, 0, 0));
    zAxisGeom.vertices.push(new THREE.Vector3(0, 0, AXIS_LENGTH));
    var zAxis = new THREE.Line(zAxisGeom, zAxisMat);
    scene.add(zAxis);
}

function initAxesNames() {
    var objects = new Array(3);
    var names = ["x", "y", "z"];
    var colors = ["#ff0000", "#00cc00", "#0000ff"]
    for (var i = 0, len = objects.length; i < len; i++) {
        objects[i] = document.createElement("div");
        objects[i].innerHTML = names[i];
        objects[i].style.position = "absolute";
        objects[i].style.transform = "translateX(-50%) translateY(-50%)";
        objects[i].style.color = colors[i];
        document.body.appendChild(objects[i]);
    }
    axisXName = objects[0];
    axisYName = objects[1];
    axisZName = objects[2];
}

function initVector() {
    var vectorMat = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 3});
    var vectorGeom = new THREE.Geometry();
    vectorGeom.vertices.push(new THREE.Vector3(0,0,0));
    var vectorStandard = new THREE.Vector3(AXIS_LENGTH, 0, 0);
    var vectorStandardBack = new THREE.Vector3(-AXIS_LENGTH / 5, AXIS_LENGTH / 5, 0);
    vectorStandardBack.add(vectorStandard);
    vectorStandard.applyQuaternion(vectorQuaternion);
    vectorStandardBack.applyQuaternion(vectorQuaternion);
    vectorGeom.vertices.push(vectorStandard);
    vectorGeom.vertices.push(vectorStandardBack);
    vectorObject = new THREE.Line(vectorGeom, vectorMat);
    scene.add(vectorObject);
}

function initLineTrace() {
    var meshTraceMat = new THREE.MeshBasicMaterial({color: 0x0066cc, side:THREE.DoubleSide, transparent: true, opacity: 0.05,});
    var lineTraceMat = new THREE.LineBasicMaterial({color: 0x0066cc});
    var meshTraceGeom = new THREE.Geometry();
    var lineTraceGeom = new THREE.Geometry();
    meshTraceGeom.vertices.push(new THREE.Vector3(0,0,0));
    for (var i=0; i<= TRACE_SEGMENTS; i++) {
        var currentQuat = new THREE.Quaternion().slerp(vectorQuaternion, i / TRACE_SEGMENTS);
        var currentVector = new THREE.Vector3(AXIS_LENGTH, 0, 0);
        currentVector.applyQuaternion(currentQuat);
        meshTraceGeom.vertices.push(currentVector);
        lineTraceGeom.vertices.push(currentVector);
    }
    for (var i=0; i <= TRACE_SEGMENTS; i++) {
        meshTraceGeom.faces.push(new THREE.Face3(0, i, i+1));
    }

    meshTraceObject = new THREE.Mesh(meshTraceGeom, meshTraceMat);
    lineTraceObject = new THREE.Line(lineTraceGeom, lineTraceMat);
    scene.add(meshTraceObject);
    scene.add(lineTraceObject);
}

function initRotationAxis() {
    var axisMat = new THREE.LineBasicMaterial({color: 0x005500, linewidth: 2});
    var axisGeom = new THREE.Geometry();
    axisGeom.vertices.push(new THREE.Vector3().copy(rotationAxis).multiplyScalar(-AXIS_LENGTH));
    axisGeom.vertices.push(new THREE.Vector3().copy(rotationAxis).multiplyScalar(AXIS_LENGTH));
    rotationAxisObject = new THREE.Line(axisGeom, axisMat);
}

function onWindowResize() {
    rendererWidth = document.getElementById("renderDiv").clientWidth;
    rendererHeight = Math.min(document.getElementById("renderDiv").clientHeight, window.innerHeight * HEIGHT_FACTOR);
    renderer.setSize(rendererWidth, rendererHeight);
    camera.aspect = rendererWidth / rendererHeight;
    camera.updateProjectionMatrix();
}

function handleTouchMove(event) {
    if (objectDragged != "none") {event.preventDefault();}
    handlePointerMove(event.touches[0].clientX, event.touches[0].clientY);
}
function handleMouseMove(event) {handlePointerMove(event.clientX, event.clientY);}

function handlePointerMove(x, y) {
    mouseDiffX = x - mousePos.x;
    mouseDiffY = y - mousePos.y;
    mousePos = {x:x, y:y};
    if (objectDragged == "scene") {
        cameraPos.x -= mouseDiffX / 200;
        cameraPos.y += mouseDiffY / 200;
        cameraPos.y = Math.min(cameraPos.y, 3.1415/2);
        cameraPos.y = Math.max(cameraPos.y, -3.1415/2);
        turnCamera();
    } else if (objectDragged.startsWith("slider")) {
        applyManualSliderChange();
    }

}

function turnCamera() {
    camera.position.x = Math.sin(cameraPos.x) * 1000 * Math.cos(cameraPos.y);
    camera.position.z = Math.cos(cameraPos.x) * 1000 * Math.cos(cameraPos.y);
    camera.position.y = Math.sin(cameraPos.y) * 1000;
    camera.lookAt(new THREE.Vector3(0,0,0));
    //console.log(cameraPos.x + "  " + cameraPos.y);
}

function handleTouchStart(event) {handlePointerStart(event.touches[0].clientX, event.touches[0].clientY);}
function handleMouseDown(event) {handlePointerStart(event.clientX, event.clientY);}

function handlePointerStart(x, y) {
    mousePos = {x:x, y:y};
    var rect = renderer.domElement.getBoundingClientRect();
    if (mousePos.x >= rect.left
            && mousePos.x <= rect.left + rendererWidth
            && mousePos.y >= rect.top
            && mousePos.y <= rect.top + rendererHeight && objectDragged == "none") {
        objectDragged = "scene";
    }
}

function handleTouchEnd(event) {objectDragged = "none";}
function handleMouseUp(event) {objectDragged = "none";}

function animate() {

    //requestAnimationFrame(animate);

    if (animation) {
        var a = new THREE.Euler( 0, -0.018, 0.006, 'XYZ' );
        var additionalQuat = new THREE.Quaternion();
        additionalQuat.setFromEuler(a);
        vectorQuaternion.multiply(additionalQuat);
        updateRotationAxis();
        updateVectorVisuals();
        updateRotationInfo();
    }

    renderer.render(scene, camera);
    updateAxesNames();
    setTimeout(animate, 16)
}

function updateAxesNames() {
    distance = AXIS_LENGTH * 1.1;
    vectors = [new THREE.Vector3(distance,0,0), new THREE.Vector3(0,distance,0), new THREE.Vector3(0,0,distance)]
    objects = [axisXName, axisYName, axisZName];
    for (var i=0; i<objects.length; i++) {
        position = toXYCoords(vectors[i], camera);
        objects[i].style.top = position.y + "px";
        objects[i].style.left = position.x + "px";
    }
}

function toXYCoords(pos) {
    var sitetop  = window.pageYOffset || document.documentElement.scrollTop,
        siteleft = window.pageXOffset || document.documentElement.scrollLeft;
    var vector = pos.clone().project(camera);
    var rect = renderer.domElement.getBoundingClientRect();
    var vector2 = new THREE.Vector3(0,0,0);
    vector2.x = siteleft + rect.left + ( vector.x+1)/2 * (rect.right - rect.left);
    vector2.y = sitetop  + rect.top  + (-vector.y+1)/2 * (rect.bottom - rect.top);
    //console.log(rect.top + "     -    " + (rect.bottom - rect.top))
    return vector2;
}

function updateRotationAxis() {
    var theta = Math.acos(vectorQuaternion.w) * 2;
    var sin = Math.sin(theta/2);
    if (sin >= 0.01 || sin <= -0.01) {
        //console.log(quatY + "  "+ quatZ + "  "+ sin)
        rotationAxis.x = vectorQuaternion.x / sin;
        rotationAxis.y = vectorQuaternion.y / sin;
        rotationAxis.z = vectorQuaternion.z / sin;
        rotationAxis.normalize();
    }
}

function updateVectorVisuals() {
    vectorObject.quaternion.w = vectorQuaternion.w;
    vectorObject.quaternion.x = vectorQuaternion.x;
    vectorObject.quaternion.y = vectorQuaternion.y;
    vectorObject.quaternion.z = vectorQuaternion.z;

    for (var i=1; i<= TRACE_SEGMENTS + 1; i++) {
        var currentQuat = new THREE.Quaternion().slerp(vectorQuaternion, (i-1) / TRACE_SEGMENTS);
        var currentVector = new THREE.Vector3(AXIS_LENGTH, 0, 0);
        currentVector.applyQuaternion(currentQuat);
        meshTraceObject.geometry.vertices[i].x = currentVector.x;
        meshTraceObject.geometry.vertices[i].y = currentVector.y;
        meshTraceObject.geometry.vertices[i].z = currentVector.z;
        lineTraceObject.geometry.vertices[i-1].x = currentVector.x;
        lineTraceObject.geometry.vertices[i-1].y = currentVector.y;
        lineTraceObject.geometry.vertices[i-1].z = currentVector.z;
    }
    meshTraceObject.geometry.verticesNeedUpdate = true;
    lineTraceObject.geometry.verticesNeedUpdate = true;

    var rotAxisVec = new THREE.Vector3().copy(rotationAxis).multiplyScalar(AXIS_LENGTH);
    rotationAxisObject.geometry.vertices[0].x = -rotAxisVec.x;
    rotationAxisObject.geometry.vertices[0].y = -rotAxisVec.y;
    rotationAxisObject.geometry.vertices[0].z = -rotAxisVec.z;
    rotationAxisObject.geometry.vertices[1].x = rotAxisVec.x;
    rotationAxisObject.geometry.vertices[1].y = rotAxisVec.y;
    rotationAxisObject.geometry.vertices[1].z = rotAxisVec.z;
    rotationAxisObject.geometry.verticesNeedUpdate = true;
}

function updateRotationInfo() {
    updateRotationInfoQuaternion();

    var vectorEuler = new THREE.Euler(0, 0, 0, eulerOrder);
    vectorEuler.setFromQuaternion(vectorQuaternion, eulerOrder);
    updateRotationInfoEuler(vectorEuler);
}

function updateRotationInfoQuaternion() {
    document.getElementById("inputQW").value = formatNumberValue(vectorQuaternion.w);
    document.getElementById("inputQX").value = formatNumberValue(vectorQuaternion.x);
    document.getElementById("inputQY").value = formatNumberValue(vectorQuaternion.y);
    document.getElementById("inputQZ").value = formatNumberValue(vectorQuaternion.z);
}

function updateRotationInfoEuler(vectorEuler) {
    document.getElementById("inputEX").value = formatNumberValue(radToSpecific(vectorEuler.x));
    document.getElementById("inputEY").value = formatNumberValue(radToSpecific(vectorEuler.y));
    document.getElementById("inputEZ").value = formatNumberValue(radToSpecific(vectorEuler.z));


    document.getElementById("sliderQW").setAttribute("style", quatSliderStyle(vectorQuaternion.w));
    document.getElementById("sliderQX").setAttribute("style", quatSliderStyle(vectorQuaternion.x));
    document.getElementById("sliderQY").setAttribute("style", quatSliderStyle(vectorQuaternion.y));
    document.getElementById("sliderQZ").setAttribute("style", quatSliderStyle(vectorQuaternion.z));

    document.getElementById("sliderEX").setAttribute("style", eulerSliderStyle(vectorEuler.x));
    document.getElementById("sliderEY").setAttribute("style", eulerSliderStyle(vectorEuler.y));
    document.getElementById("sliderEZ").setAttribute("style", eulerSliderStyle(vectorEuler.z));

}

function quatSliderStyle(quatValue) {
    return "width:" + Math.abs(quatValue)*50 + "%;margin-left:" + (1.0 + Math.min(0,quatValue)) * 50 + "%";
}

function eulerSliderStyle(eulerValue) {
    return "width:" + Math.abs(eulerValue/3.1415)*50 + "%;margin-left:" + (1.0 + Math.min(0,eulerValue/3.1415)) * 50 + "%";
}

function radToSpecific(radiansIn) {
    if (eulerAngleFormat == "Radians") {return radiansIn;}
    return THREE.Math.radToDeg(radiansIn);
}

function specificToRad(specificIn) {
    if (eulerAngleFormat == "Radians") {return specificIn;}
    return THREE.Math.degToRad(specificIn);
}

function formatNumberValue(x) {
    string = x.toFixed(3);
    if (string.charAt(0) != '-') {string = " " + string;}
    return string;
}

function inputSelected() {
    setAnimation(false);
}

function checkEnter(event, category) {
    if (event.keyCode == 13) {
        if (category == "quaternion") {applyQuaternionRotation();
        } else if (category == "euler") {applyEulerRotation();}
        return false;
    }
}

function applyQuaternionRotation() {
    setAnimation(false);

    vectorQuaternion.w = formatStringValue(document.getElementById("inputQW").value);
    vectorQuaternion.x = formatStringValue(document.getElementById("inputQX").value);
    vectorQuaternion.y = formatStringValue(document.getElementById("inputQY").value);
    vectorQuaternion.z = formatStringValue(document.getElementById("inputQZ").value);
    vectorQuaternion.normalize();
    updateRotationAxis();
    updateVectorVisuals();
    updateRotationInfo();
    renderer.render(scene, camera);
}

function applyEulerRotation() {
    setAnimation(false);

    var eulerX = specificToRad(formatStringValue(document.getElementById("inputEX").value));
    var eulerY = specificToRad(formatStringValue(document.getElementById("inputEY").value));
    var eulerZ = specificToRad(formatStringValue(document.getElementById("inputEZ").value));
    var vectorEuler = new THREE.Euler(eulerX, eulerY, eulerZ, eulerOrder);
    vectorQuaternion.setFromEuler(vectorEuler);
    updateRotationAxis();
    updateVectorVisuals();
    updateRotationInfo();
    renderer.render(scene, camera);
}

function formatStringValue(stringValue) {
    var value = parseFloat(stringValue.trim());
    if (isNaN(value)) {return 0;} else {return value;}
}



function orderDropdownClicked() {
    closeDropdowns();
    document.getElementById("orderDropdownMenu").classList.toggle("show");
}

function angleDropdownClicked() {
    closeDropdowns();
    document.getElementById("angleDropdownMenu").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        closeDropdowns();
    }
}

function closeDropdowns() {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
    }
}

function eulerOrderChanged(newOrder) {
    eulerOrder = newOrder;
    document.getElementById("eulerOrderButton").innerHTML = eulerOrder + " - Order &#x25BE";
    updateRotationInfo();
}

function eulerAngleFormatChanged(newAngleFormat) {
    eulerAngleFormat = newAngleFormat;
    document.getElementById("eulerAngleFormatButton").innerHTML = eulerAngleFormat + " &#x25BE";
    updateRotationInfo();
}

function applyManualSliderChange() {
    var slider = document.getElementById("whole" + objectDragged);
    var rect = slider.getBoundingClientRect();
    var percentage = Math.min(1,Math.max(0,(mousePos.x - rect.left) / (rect.right -rect.left))) * 2 - 1;
    if (objectDragged.startsWith("sliderE")) {
        var eulerX = specificToRad(formatStringValue(document.getElementById("inputEX").value));
        var eulerY = specificToRad(formatStringValue(document.getElementById("inputEY").value));
        var eulerZ = specificToRad(formatStringValue(document.getElementById("inputEZ").value));
        if (objectDragged == "sliderEX") {eulerX = percentage*3.1415;
        } else if (objectDragged == "sliderEY") {eulerY = percentage*3.1415;
        } else if (objectDragged == "sliderEZ") {eulerZ = percentage*3.1415;}
        var vectorEuler = new THREE.Euler(eulerX, eulerY, eulerZ, eulerOrder);
        vectorQuaternion.setFromEuler(vectorEuler);

        updateRotationAxis();
        updateVectorVisuals();
        updateRotationInfoQuaternion();
        updateRotationInfoEuler(vectorEuler)
        renderer.render(scene, camera);
    } else if (objectDragged.startsWith("sliderQ")) {
        var quatW = formatStringValue(document.getElementById("inputQW").value);
        var quatX = formatStringValue(document.getElementById("inputQX").value);
        var quatY = formatStringValue(document.getElementById("inputQY").value);
        var quatZ = formatStringValue(document.getElementById("inputQZ").value);
        var theta = Math.acos(quatW) * 2;
        var sin = Math.sin(theta/2);
        if (objectDragged == "sliderQW") {
            theta = Math.acos(percentage) * 2;
            vectorQuaternion.w = percentage;
            sin = Math.sin(theta/2);
        } else if (sin >= 0.01 || sin <= -0.01) {
            var axisX = rotationAxis.x;
            var axisY = rotationAxis.y;
            var axisZ = rotationAxis.z;
            if (objectDragged == "sliderQX") {
                var axisX = Math.max(-1,Math.min(1,percentage / sin));
                var rest = 1 - axisX*axisX;
                if (axisZ+axisY == 0) {
                    axisY = Math.sqrt(rest / 2);
                    axisZ = axisY;
                } else {
                    var ratio = (axisY*axisY) / (axisZ*axisZ + axisY*axisY);
                    axisY = Math.sign(axisY) * Math.sqrt(rest * ratio);
                    axisZ = Math.sign(axisZ) * Math.sqrt((1 - ratio) * rest);
                }
            } else if (objectDragged == "sliderQY") {
                var axisY = Math.max(-1,Math.min(1,percentage / sin));
                var rest = 1 - axisY*axisY;
                if (axisX+axisZ == 0) {
                    axisX = Math.sqrt(rest / 2);
                    axisZ = axisX;
                } else {
                    var ratio = (axisX*axisX) / (axisZ*axisZ + axisX*axisX);
                    axisX = Math.sign(axisX) * Math.sqrt(rest * ratio);
                    axisZ = Math.sign(axisZ) * Math.sqrt((1 - ratio) * rest);
                }
            } else if (objectDragged == "sliderQZ") {
                var axisZ = Math.max(-1,Math.min(1,percentage / sin));
                var rest = 1 - axisZ*axisZ;
                if (axisX+axisY == 0) {
                    axisX = Math.sqrt(rest / 2);
                    axisY = axisX;
                } else {
                    var ratio = (axisX*axisX) / (axisY*axisY + axisX*axisX);
                    axisX = Math.sign(axisX) * Math.sqrt(rest * ratio);
                    axisY = Math.sign(axisY) * Math.sqrt((1 - ratio) * rest);
                }
            }
            rotationAxis.x = axisX;
            rotationAxis.y = axisY;
            rotationAxis.z = axisZ;
        }
        vectorQuaternion.x = rotationAxis.x * sin;
        vectorQuaternion.y = rotationAxis.y * sin;
        vectorQuaternion.z = rotationAxis.z * sin;
        updateRotationAxis();
        updateVectorVisuals();
        updateRotationInfo();
        renderer.render(scene, camera);
    }
}

function sliderClick(id) {
    inputSelected();
    if (objectDragged == "none") {objectDragged = id;}
    applyManualSliderChange();
}

function setAnimation(on) {
    animation = on;
    document.getElementById("animationCheckbox").checked = animation;
}

function animationCheckboxChanged() {
    animation = document.getElementById("animationCheckbox").checked;
}

function switchAnimation() {
    setAnimation(!animation);
}

function showAxisCheckboxChanged() {
    setShowAxis(document.getElementById("showAxisCheckbox").checked);
}

function switchShowAxis() {
    setShowAxis(!showAxis);
    document.getElementById("showAxisCheckbox").checked = showAxis;
}

function setShowAxis(on) {
    showAxis = on;
    if (showAxis) {
        scene.add(rotationAxisObject);
    } else {
        scene.remove(rotationAxisObject);
    }
}
