

//var socket = io('ws://10.89.64.14:8888', {transports: ['websocket']},);
var socket = io('ws://localhost:8888', {transports: ['websocket']});
console.log('check 1', socket.connected);
socket.on('connect', function() {
  console.log('check 2', socket.connected);
});

socket.on('error', function (err) {
    console.log(err);
});
var dataArray;
var dataRollx = 0;
var dataRolly = 0;
var dataRollz = 0;
var quat;
var dataRollxArray = [];
var dataRollyArray = [];
var dataRollzArray = [];
var accuracy = 2;
var orderOfMag = (Math.PI/180);
socket.on('data', function(data) {
    
    var dataArray =data.dataArray;
    //console.log(dataArray);
    
   
    // set x
    dataRollx = (dataArray[0] *= orderOfMag).toFixed(accuracy);
    
    // set y
    dataRolly = (dataArray[1] *= orderOfMag).toFixed(accuracy);

    // set z
    dataRollz = (dataArray[2] *= orderOfMag).toFixed(accuracy);
    quat = new THREE.Quaternion(dataArray[3],dataArray[4],dataArray[5],dataArray[6]);
    //console.log(quat);

    //console.log(dataRollx + "," + dataRolly + "," + dataRollz);
//}
});

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );



var geometry = new THREE.BoxGeometry( 20,20,20 );
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

//camera.position.y = 150;
camera.position.z = 60;

var loader = new THREE.FontLoader();
				loader.load( 'src/helvetiker.json', function ( font ) {
					var xMid, text;
					var textShape = new THREE.BufferGeometry();
					var color = 0x006699;
					var matDark = new THREE.LineBasicMaterial( {
						color: color,
						side: THREE.DoubleSide
					} );
					var matLite = new THREE.MeshBasicMaterial( {
						color: color,
						transparent: true,
						opacity: 0.4,
						side: THREE.DoubleSide
					} );
					var message = "ELEC 4010m";
					var shapes = font.generateShapes( message, 10, 2 );
					var geometry = new THREE.ShapeGeometry( shapes );
					geometry.computeBoundingBox();
					xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
					geometry.translate( xMid, 0, 0 );
					// make shape ( N.B. edge view not visible )
					textShape.fromGeometry( geometry );
					text = new THREE.Mesh( textShape, matLite );
					text.position.z = - 150;
                    scene.add( text );
                    text.position.y = 100;

                    var matList = new THREE.LineBasicMaterial( {
						color: 0xd80a0e,
						side: THREE.DoubleSide
					} );
                    var textShape1 = new THREE.BufferGeometry();
                    var message1 = " Attitude Indicator                         3d model                         Heading Indicator";
					var shapes1 = font.generateShapes( message1, 10, 2 );
					var geometry1 = new THREE.ShapeGeometry( shapes1 );
					geometry1.computeBoundingBox();
					var xMid1 = - 0.5 * ( geometry1.boundingBox.max.x - geometry1.boundingBox.min.x );
					geometry1.translate( xMid1, 0, 0 );
					// make shape ( N.B. edge view not visible )
					textShape1.fromGeometry( geometry1 );
					var text1 = new THREE.Mesh( textShape1, matList );
					text1.position.z = - 150;
                    scene.add( text1 );
                    text1.position.y = -100;

					// make line shape ( N.B. edge view remains visible )
					var holeShapes = [];
					for ( var i = 0; i < shapes.length; i ++ ) {
						var shape = shapes[ i ];
						if ( shape.holes && shape.holes.length > 0 ) {
							for ( var j = 0; j < shape.holes.length; j ++ ) {
								var hole = shape.holes[ j ];
								holeShapes.push( hole );
							}
						}
					}
					shapes.push.apply( shapes, holeShapes );
					var lineText = new THREE.Object3D();
					for ( var i = 0; i < shapes.length; i ++ ) {
						var shape = shapes[ i ];
						var points = shape.getPoints();
						var geometry = new THREE.BufferGeometry().setFromPoints( points );
						
						geometry.translate( xMid, 0, 0 );
						var lineMesh = new THREE.Line( geometry, matDark );
						lineText.add( lineMesh );
					}
                    scene.add( lineText );
                    lineText.position.y = 25;
				} ); //end load function

var cb;

var textureloader = new THREE.TextureLoader();

// load a resource
textureloader.load(
	// resource URL
	'getto.jpg',

	// onLoad callback
	function ( texture ) {
		// in this example we create the material when the texture is loaded
		var cbmaterial = new THREE.MeshBasicMaterial( {
			map: texture
         } );
         var cbgeometry = new THREE.PlaneGeometry(20, 20);

        cb = new THREE.Mesh(cbgeometry, cbmaterial);
        scene.add(cb);
        cb.position.x = -40.5;
        cb.position.z = 13;
        
         
	},
);


//var texture = THREE.ImageUtils.loadTexture('attitude_indicator.png');
//var cbmaterial = new THREE.MeshPhongMaterial({map: texture});

//cb.position.y = 15;
//cb.rotation.y = 15;

//frontplane

    var geometry = new THREE.TorusGeometry( 10, 0.5, 16, 100 );
    var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    var torus = new THREE.Mesh( geometry, material );
    scene.add( torus );
    torus.position.x = -39;
    torus.position.z = 15;
//torus.position.y = 10;
var geometry = new THREE.TorusGeometry( 15, 4, 16, 100 );
    var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    var torus = new THREE.Mesh( geometry, material );
    scene.add( torus );
    torus.position.x = -39;
    torus.position.z = 15;

var geometry = new THREE.BoxGeometry( 10, 1, 1 );
var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
var dash = new THREE.Mesh( geometry, material );
scene.add( dash );
dash.position.x = -39;
dash.position.z = 15;

//heading indicator
    var arrow;
    textureloader.load(
        'arrow.jpg',
        function ( texture ) {
            var arrowmaterial = new THREE.MeshBasicMaterial( {map: texture});
            var arrowgeometry = new THREE.CircleGeometry(8, 100);
            arrow = new THREE.Mesh(arrowgeometry, arrowmaterial);
            scene.add(arrow);
            arrow.position.x = 40.5;
            arrow.position.z = 13;
        },
    );

    var geometry = new THREE.TorusGeometry( 9, 0.5, 16, 100 );
    var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    var torus2 = new THREE.Mesh( geometry, material );
    scene.add( torus2 );
    torus2.position.x = 39;
    torus2.position.z = 15;

    var light = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(light);
    light.position.z = 300;
    var light2 = new THREE.PointLight(0xffffff, 0.5);
    scene.add(light2);
    light2.position.z = 100; 

    var light3 = new THREE.PointLight( 0x123456, 1, 100 );
    light3.position.set( 50, 50, 50 );
    scene.add( light3 );

    var light4 = new THREE.PointLight( 0xf1aa96, 1, 100 );
    light4.position.set( -50, 50, -50 );
    scene.add( light4 );

   
    var loader2 = new THREE.JSONLoader();
    loader2.load('obj/meow.json', handle_load1);
    var mesh;
    var mixer;
    function handle_load1(geometry, materials) {
        //BASIC MESH
        var material = new THREE.MeshNormalMaterial();
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        mesh.position.z = 50;
        mesh.position.x = 0;
        
        

    }

    
   

function animate() {
    requestAnimationFrame( animate );
    if(mesh){ 
        mesh.rotation.y = dataRollx;
        mesh.rotation.z = dataRollz;
        mesh.rotation.x = dataRolly;
        //mesh.quaternion.slerp(quat.normalize,1);
        //console.log(quat._x);
        // var euler = new THREE.Vector3(Quat2Angle(quat._x,quat._y,quat._z,quat._z));
        //  console.log(euler.x);
        // var rotation = new THREE.Euler().setFromQuaternion( quat );
        // mesh.rotation.x = euler.x;
        //mesh.quaternion.x = quat._x;
        //mesh.matrix.compose()
    }
    //heading indicator
    if(arrow){ 
        arrow.rotation.z = dataRollx;
        
    }
    //altitude indicator
    if(cb){
        cb.position.y = -dataRolly*2;
        cb.rotation.z = dataRollz;
    }
    else{
        console.log("cb not found");
    }
    
    
     
	renderer.render( scene, camera );
}
animate();

