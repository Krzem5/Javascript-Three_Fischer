var scene,cam,renderer,controls,light,models={}
function init(){
	scene=new THREE.Scene()
	cam=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1000)
	cam.position.set(0,30,50)
	cam.lookAt(new THREE.Vector3(0,0,0))
	renderer=new THREE.WebGLRenderer({antialias:true})
	renderer.setSize(window.innerWidth,window.innerHeight)
	renderer.setClearColor(0xfff6e6)
	document.body.appendChild(renderer.domElement)
	scene.add(new THREE.AmbientLight(0xffffff,0.2))
	light=new THREE.PointLight(0xffffff,2)
	light.position.set(25,50,25)
	scene.add(light)
	renderer.render(scene,cam)
	controls=new THREE.OrbitControls(cam,renderer.domElement)
	controls.target=new THREE.Vector3(0,15,0)
	window.addEventListener("resize",resize,false)
	requestAnimationFrame(render)
	load()
	create_model("board")
}
function render(){
	light.position.set(...cam.position.toArray())
	renderer.render(scene,cam)
	requestAnimationFrame(render)
}
function resize(){
	cam.aspect=window.innerWidth/window.innerHeight
	cam.updateProjectionMatrix()
	renderer.setSize(window.innerWidth,window.innerHeight)
}
function get_color(c){
	if (c=="free"){return 0x1fea10}
	return [0x121212][c]
}
function create_model(m){
	var json=models[m]
	if (json.loaded==false){
		json.create=true
		return
	}
	json=json.json
	var group=new THREE.Group()
	group.name=json.name
	for (var m of json.model){
		if (m.type=="box"){
			var g,t,ms
			g=new THREE.BoxGeometry(m.size.x,m.size.y,m.size.z)
			t=[]
			for (var k of m.visible){
				t[k]=new THREE.MeshStandardMaterial({color:get_color(m.color),flatShading:true,metalness:0,roughness:1,refractionRatio:0,side:THREE.DoubleSide})
			}
			ms=new THREE.Mesh(g,t)
			ms.position.set(m.size.x/2,m.size.y/2,m.size.z/2)
			ms.name=m.name
			group.add(ms)
		}
		else if (m.type=="dots"){
			var p=m.from,step={x:(m.to.x-m.from.x)/Math.max(m.amount.x-1,1),y:(m.to.y-m.from.y)/Math.max(m.amount.y-1,1),z:(m.to.z-m.from.z)/Math.max(m.amount.z-1,1)}
			for (var x=0;p.x-step.x!=m.to.x;x++){
				var ms=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,7,64,false),[
					new THREE.MeshStandardMaterial({color:get_color(m.color),flatShading:true,metalness:0,roughness:1,refractionRatio:0,side:THREE.DoubleSide}),
					new THREE.MeshStandardMaterial({color:get_color("free"),flatShading:true,metalness:0,roughness:1,refractionRatio:0,side:THREE.DoubleSide}),
					new THREE.MeshStandardMaterial({color:get_color("free"),flatShading:true,metalness:0,roughness:1,refractionRatio:0,side:THREE.DoubleSide})
				])
				ms.position.set(p.x+2.5,p.y+3.6,p.z+2.5)
				group.add(ms)
				p.x+=step.x
				p.y+=step.y
				p.z+=step.z
			}
		}
		else if (m.type=="squares"){
			var p=Object.assign({},m.from),step={x:(m.to.x-m.from.x)/Math.max(m.amount.x-1,1),y:(m.to.y-m.from.y)/Math.max(m.amount.y-1,1),z:(m.to.z-m.from.z)/Math.max(m.amount.z-1,1)}
			for (var x=0;x<Math.max(m.amount.x,1);x++){
				for (var y=0;y<Math.max(m.amount.y,1);y++){
					for (var z=0;z<Math.max(m.amount.z,1);z++){
						var ms=new THREE.Mesh(new THREE.PlaneGeometry(4,4),[new THREE.MeshStandardMaterial({color:get_color("free"),flatShading:true,metalness:0,roughness:1,refractionRatio:0,side:THREE.DoubleSide})])
						ms.position.set(p.x+2,p.y+0.1,p.z+2)
						ms.rotation.x=-Math.PI/2
						group.add(ms)
						p.z+=step.z
					}
					p.z=m.from.z
					p.y+=step.y
				}
				p.y=m.from.y
				p.x+=step.x
			}
		}
	}
	scene.add(group)
}
function load(){
	for (var k of ["board"]){
		load_model(k)
	}
}
function load_model(m){
	function l(json,m){
		// front, back, top, bottom, left, right 
		models[m].json=json
		models[m].loaded=true
		if (models[m].create==true){
			create_model(m)
		}
	}
	models[m]={
		loaded: false,
		create: false,
	}
	fetch(`./data/${m}.json`).then(dt=>dt.json()).then(json=>l(json,m))
}
window.addEventListener("DOMContentLoaded",init,false)