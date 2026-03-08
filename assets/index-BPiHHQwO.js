import{r as _,j as o,R as B,b as et,c as _o}from"./react-vendor-9pToOiTF.js";import{u as ve,a as U,S as ut,L as tt,H as Mo,b as jo,E as ko,c as Po,C as zo,O as Ro,G as Do,d as Io,e as To,f as Bo,g as Eo}from"./three-ecosystem-wxYBx5kz.js";import{h as z,J as Ie,K as O,k as we,ag as G,D as Q,e as A,ah as Ao,ai as ot,a0 as Lt,t as Ot,aj as No,ak as Uo,al as $e,x as rt,Q as Gt,l as te,g as Wt}from"./three-core-DuabGn4o.js";import{v as L,a as Ht}from"./state-vendor-CYX7bTfW.js";import{g as Fo}from"./animation-vendor-DDlvirwQ.js";import{S as st,G as Te,E as Vt,a as it,D as Lo,Z as Ce,C as nt,X as Be,T as Ze,b as Oo,c as Go,d as Wo,e as qt,f as $t,O as Zt,g as Yt,A as Ye,h as pt,I as Ho,i as Xt,R as Vo,j as qo,P as Kt,k as Jt,l as Qt,U as $o,m as Zo,L as Yo,M as mt,H as Xo,n as eo,o as Ko,p as Jo,q as Qo,r as er,s as tr,t as or,u as rr,v as sr,w as ir,x as nr,y as ar}from"./ui-vendor-CwC566jq.js";import"./vendor-DfKj1gQP.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const lr=32;class cr{pool=[];index=0;constructor(r=1e4){for(let t=0;t<r;t++)this.pool.push(this.createEmptyNode())}createEmptyNode(){return{min:new z,max:new z,center:new z,size:0,totalMass:0,centerOfMass:new z,children:[null,null,null,null,null,null,null,null],bodyIndex:null,hasChildren:!1}}get(){if(this.index>=this.pool.length){const t=Math.floor(this.pool.length*.5)||100;for(let n=0;n<t;n++)this.pool.push(this.createEmptyNode())}const r=this.pool[this.index++];return this.resetNode(r),r}reset(){this.index=0}resetNode(r){r.totalMass=0,r.bodyIndex=null,r.hasChildren=!1,r.children.fill(null)}}const Xe=new cr,dr=e=>{if(e.count===0)return null;Xe.reset();const r=new z(1/0,1/0,1/0),t=new z(-1/0,-1/0,-1/0);for(let d=0;d<e.count;d++){const c=d*3,h=e.positions[c],u=e.positions[c+1],f=e.positions[c+2];h<r.x&&(r.x=h),u<r.y&&(r.y=u),f<r.z&&(r.z=f),h>t.x&&(t.x=h),u>t.y&&(t.y=u),f>t.z&&(t.z=f)}const s=Math.max(t.x-r.x,t.y-r.y,t.z-r.z)*.001||1;t.x+=s,t.y+=s,t.z+=s,r.x-=s,r.y-=s,r.z-=s;const i=Math.max(t.x-r.x,t.y-r.y,t.z-r.z),a=r.clone().addScalar(i*.5),l=Xe.get();l.min.copy(r),l.max.copy(r).addScalar(i),l.center.copy(a),l.size=i;for(let d=0;d<e.count;d++)e.masses[d]<=0||Ke(l,d,e,0);return to(l,e),l},Ke=(e,r,t,n)=>{if(n>lr)return;const s=t.positions[r*3],i=t.positions[r*3+1],a=t.positions[r*3+2];if(!e.hasChildren&&e.bodyIndex===null){e.bodyIndex=r;return}if(!e.hasChildren&&e.bodyIndex!==null){const d=e.bodyIndex;e.bodyIndex=null,e.hasChildren=!0;const c=ft(e.center,t.positions[d*3],t.positions[d*3+1],t.positions[d*3+2]);e.children[c]||(e.children[c]=ht(e,c)),Ke(e.children[c],d,t,n+1)}e.hasChildren=!0;const l=ft(e.center,s,i,a);e.children[l]||(e.children[l]=ht(e,l)),Ke(e.children[l],r,t,n+1)},ft=(e,r,t,n)=>{let s=0;return r>=e.x&&(s|=4),t>=e.y&&(s|=2),n>=e.z&&(s|=1),s},ht=(e,r)=>{const t=Xe.get(),n=e.size*.5;return t.size=n,t.min.copy(e.min),r&4&&(t.min.x+=n),r&2&&(t.min.y+=n),r&1&&(t.min.z+=n),t.max.copy(t.min).addScalar(n),t.center.copy(t.min).addScalar(n*.5),t},to=(e,r)=>{if(!e.hasChildren){if(e.bodyIndex!==null){const a=e.bodyIndex,l=r.masses[a];e.totalMass=l,e.centerOfMass.set(r.positions[a*3],r.positions[a*3+1],r.positions[a*3+2])}else e.totalMass=0,e.centerOfMass.set(0,0,0);return}let t=0,n=0,s=0,i=0;for(let a=0;a<8;a++){const l=e.children[a];if(l){to(l,r);const d=l.totalMass;d>0&&(t+=d,n+=l.centerOfMass.x*d,s+=l.centerOfMass.y*d,i+=l.centerOfMass.z*d)}}e.totalMass=t,t>0?e.centerOfMass.set(n/t,s/t,i/t):e.centerOfMass.set(0,0,0)},oo=1,gt=.5,ro=gt*gt,ur=.5,so=e=>{const{count:r,positions:t,accelerations:n}=e,s=dr(e);if(s){n.fill(0,0,r*3);for(let i=0;i<r;i++){const a=i*3,l=t[a],d=t[a+1],c=t[a+2];io(i,l,d,c,s,e)}}},io=(e,r,t,n,s,i)=>{if(!s.hasChildren){s.bodyIndex!==null&&s.bodyIndex!==e&&pr(e,r,t,n,s.bodyIndex,i);return}const a=s.centerOfMass.x-r,l=s.centerOfMass.y-t,d=s.centerOfMass.z-n,c=a*a+l*l+d*d,h=Math.sqrt(c);if(s.size/h<ur)mr(e,r,t,n,s.totalMass,s.centerOfMass.x,s.centerOfMass.y,s.centerOfMass.z,i.accelerations);else for(let u=0;u<8;u++){const f=s.children[u];f&&f.totalMass>0&&io(e,r,t,n,f,i)}},pr=(e,r,t,n,s,i)=>{const a=s*3,l=i.positions[a]-r,d=i.positions[a+1]-t,c=i.positions[a+2]-n,u=l*l+d*d+c*c+ro,f=Math.sqrt(u),m=oo*i.masses[s]/(u*f),g=e*3;i.accelerations[g]+=l*m,i.accelerations[g+1]+=d*m,i.accelerations[g+2]+=c*m},mr=(e,r,t,n,s,i,a,l,d)=>{const c=i-r,h=a-t,u=l-n,m=c*c+h*h+u*u+ro,g=Math.sqrt(m),p=oo*s/(m*g),v=e*3;d[v]+=c*p,d[v+1]+=h*p,d[v+2]+=u*p},re={G:1,SOFTENING_SQ:.25,BASE_DT:.001,COLLISION_THRESHOLD:.8},no={MAX_BODIES:2e4,TRAIL_LENGTH:500,PREDICTION_STEPS:1200},he={SOLAR_MASS:333e3,HZ_INNER_AU:.95,HZ_OUTER_AU:1.4,MASS_LUMINOSITY_EXPONENT:3.5},oe={MAX_TIDAL_PARTICLES:2e3,MAX_DEBRIS_PARTICLES:2e3,PARTICLE_DRAG:.995,FRAME_TIME:.016};class fr{cellSize;grid;constructor(r){this.cellSize=r,this.grid=new Map}clear(){this.grid.clear()}build(r){this.clear();const{count:t,positions:n,radii:s}=r;for(let i=0;i<t;i++){const a=n[i*3],l=n[i*3+1],d=n[i*3+2],c=s[i],h=a-c,u=a+c,f=l-c,m=l+c,g=d-c,p=d+c,v=Math.floor(h/this.cellSize),S=Math.floor(u/this.cellSize),x=Math.floor(f/this.cellSize),j=Math.floor(m/this.cellSize),M=Math.floor(g/this.cellSize),P=Math.floor(p/this.cellSize);for(let w=v;w<=S;w++)for(let R=x;R<=j;R++)for(let k=M;k<=P;k++){const y=`${w},${R},${k}`;let b=this.grid.get(y);b||(b={bodies:[]},this.grid.set(y,b)),b.bodies.push(i)}}}getPotentialCollisionPairs(){const r=[],t=new Set;for(const n of this.grid.values()){const s=n.bodies;for(let i=0;i<s.length;i++)for(let a=i+1;a<s.length;a++){const l=s[i],d=s[a],c=l<d?`${l},${d}`:`${d},${l}`;t.has(c)||(t.add(c),r.push([l,d]))}}return r}findCollisions(r,t=.8){const n=this.getPotentialCollisionPairs(),s=[],{positions:i,radii:a,masses:l}=r;for(const[d,c]of n){if(l[d]<=0||l[c]<=0)continue;const h=d*3,u=c*3,f=i[h]-i[u],m=i[h+1]-i[u+1],g=i[h+2]-i[u+2],p=f*f+m*m+g*g,v=a[d]+a[c];p<(v*t)**2&&s.push([d,c])}return s}getStats(){const r=this.grid.size;let t=0,n=0;for(const s of this.grid.values())t+=s.bodies.length,n=Math.max(n,s.bodies.length);return{cellCount:r,avgBodiesPerCell:r>0?t/r:0,maxBodiesPerCell:n}}}function hr(e){const{count:r,radii:t}=e;if(r===0)return 10;let n=0;for(let i=0;i<r;i++)n+=t[i];return n/r*3}const{G:ao,SOFTENING_SQ:gr}=re,vr=re.BASE_DT,xr=8,lo=(e,r)=>vr*e*(r?xr:1);new z,new z,new z;const yr=e=>{const r=Math.max(e.length*2,1e3),n={count:e.length,maxCount:r,positions:new Float64Array(r*3),velocities:new Float64Array(r*3),accelerations:new Float64Array(r*3),masses:new Float64Array(r),radii:new Float64Array(r),ids:new Array(r),idToIndex:new Map};return e.forEach((s,i)=>{n.positions[i*3]=s.position.x,n.positions[i*3+1]=s.position.y,n.positions[i*3+2]=s.position.z,n.velocities[i*3]=s.velocity.x,n.velocities[i*3+1]=s.velocity.y,n.velocities[i*3+2]=s.velocity.z,n.masses[i]=s.mass,n.radii[i]=s.radius,n.ids[i]=s.id,n.idToIndex.set(s.id,i)}),uo(n),n},vt=(e,r)=>{const t=new Array(e.count),n=new Map(r.map(s=>[s.id,s]));for(let s=0;s<e.count;s++){const i=e.ids[s],a=n.get(i);a?t[s]={...a,position:new z(e.positions[s*3],e.positions[s*3+1],e.positions[s*3+2]),velocity:new z(e.velocities[s*3],e.velocities[s*3+1],e.velocities[s*3+2]),mass:e.masses[s],radius:e.radii[s]}:t[s]={id:i,name:"Unknown",mass:e.masses[s],radius:e.radii[s],position:new z(e.positions[s*3],e.positions[s*3+1],e.positions[s*3+2]),velocity:new z(e.velocities[s*3],e.velocities[s*3+1],e.velocities[s*3+2]),color:"#fff"}}return t},co=e=>{const{count:r,positions:t,accelerations:n,masses:s}=e;n.fill(0,0,r*3);for(let i=0;i<r;i++){const a=i*3,l=t[a],d=t[a+1],c=t[a+2];for(let h=i+1;h<r;h++){const u=h*3,f=t[u]-l,m=t[u+1]-d,g=t[u+2]-c,v=f*f+m*m+g*g+gr,S=Math.sqrt(v),x=ao/(v*S),j=f*x,M=m*x,P=g*x,w=s[i],R=s[h];n[a]+=j*R,n[a+1]+=M*R,n[a+2]+=P*R,n[u]-=j*w,n[u+1]-=M*w,n[u+2]-=P*w}}},uo=(e,r=!1)=>{if(r){so(e);return}co(e)},br=(e,r)=>{const t=e.count-1;if(r!==t){const n=r*3,s=t*3;e.positions[n]=e.positions[s],e.positions[n+1]=e.positions[s+1],e.positions[n+2]=e.positions[s+2],e.velocities[n]=e.velocities[s],e.velocities[n+1]=e.velocities[s+1],e.velocities[n+2]=e.velocities[s+2],e.accelerations[n]=e.accelerations[s],e.accelerations[n+1]=e.accelerations[s+1],e.accelerations[n+2]=e.accelerations[s+2],e.masses[r]=e.masses[t],e.radii[r]=e.radii[t],e.ids[r]=e.ids[t],e.idToIndex.set(e.ids[r],r)}e.idToIndex.delete(e.ids[t]),e.count--},Sr=(e,r=!1)=>{const{positions:t,velocities:n,masses:s,radii:i}=e;let a;if(r&&e.count>100){const c=hr(e),h=new fr(c);h.build(e),a=h.findCollisions(e,re.COLLISION_THRESHOLD)}else{a=[];for(let c=0;c<e.count;c++)if(!(s[c]<=0))for(let h=c+1;h<e.count;h++){if(s[h]<=0)continue;const u=c*3,f=h*3,m=t[u]-t[f],g=t[u+1]-t[f+1],p=t[u+2]-t[f+2],v=m*m+g*g+p*p,S=i[c]+i[h];v<(S*re.COLLISION_THRESHOLD)**2&&a.push([c,h])}}const l=new Set;for(const[c,h]of a){if(l.has(c)||l.has(h)||s[c]<=0||s[h]<=0)continue;const u=c*3,f=h*3,m=s[c],g=s[h],p=m+g,v=(n[u]*m+n[f]*g)/p,S=(n[u+1]*m+n[f+1]*g)/p,x=(n[u+2]*m+n[f+2]*g)/p,j=(t[u]*m+t[f]*g)/p,M=(t[u+1]*m+t[f+1]*g)/p,P=(t[u+2]*m+t[f+2]*g)/p,w=Math.cbrt(i[c]**3+i[h]**3);s[c]=p,i[c]=w,t[u]=j,t[u+1]=M,t[u+2]=P,n[u]=v,n[u+1]=S,n[u+2]=x,l.add(h)}const d=Array.from(l).sort((c,h)=>h-c);for(const c of d)br(e,c)},wr=(e,r,t=!1,n=!0,s=!0)=>{const{count:i,positions:a,velocities:l,accelerations:d}=e,c=.5*r;for(let h=0;h<i;h++){const u=h*3;l[u]+=d[u]*c,l[u+1]+=d[u+1]*c,l[u+2]+=d[u+2]*c,a[u]+=l[u]*r,a[u+1]+=l[u+1]*r,a[u+2]+=l[u+2]*r}t?so(e):co(e);for(let h=0;h<i;h++){const u=h*3;l[u]+=d[u]*c,l[u+1]+=d[u+1]*c,l[u+2]+=d[u+2]*c}n&&Sr(e,s)},Cr=e=>{let r=0,t=0;const n=e.length;for(let s=0;s<n;s++){const i=e[s],a=i.velocity.lengthSq();r+=.5*i.mass*a;for(let l=s+1;l<n;l++){const d=e[l],c=i.position.x-d.position.x,h=i.position.y-d.position.y,u=i.position.z-d.position.z,f=Math.sqrt(c*c+h*h+u*u)+1e-6;t-=ao*i.mass*d.mass/f}}return{kinetic:r,potential:t,total:r+t}},Le=(e,r)=>{let t=[...e];const n=new Set,s=[],i=[];return r.forEach(([a,l])=>{if(n.has(a)||n.has(l)||!t[a]||!t[l])return;const d=t[a],c=t[l],h=d.mass+c.mass,u=d.velocity.clone().multiplyScalar(d.mass),f=c.velocity.clone().multiplyScalar(c.mass),m=u.add(f).divideScalar(h),g=d.position.clone().multiplyScalar(d.mass),p=c.position.clone().multiplyScalar(c.mass),v=g.add(p).divideScalar(h),S=Math.cbrt(Math.pow(d.radius,3)+Math.pow(c.radius,3)),x={x:(d.position.x*c.radius+c.position.x*d.radius)/(d.radius+c.radius),y:(d.position.y*c.radius+c.position.y*d.radius)/(d.radius+c.radius),z:(d.position.z*c.radius+c.position.z*d.radius)/(d.radius+c.radius)},M=d.velocity.clone().sub(c.velocity).length(),[P,w]=d.mass>c.mass?[d,c]:[c,d];s.push({collisionPoint:x,relativeVelocity:M,combinedMass:h,largerBodyId:P.id,smallerBodyId:w.id,smallerBodyColor:w.color,smallerBodyRadius:w.radius}),i.push({position:v.clone(),color:d.mass>c.mass?d.color:c.color}),t[a]={...d,mass:h,position:v,velocity:m,radius:S,name:`${d.name} + ${c.name}`.substring(0,20)},n.add(l)}),n.size>0?(t=t.filter((a,l)=>!n.has(l)),{bodies:t,hasRemovals:!0,collisionEvents:s,events:i}):{bodies:t,hasRemovals:!1,collisionEvents:[],events:[]}},po=333e3,se={COMPRESSED:{AU_UNIT:50},REALISTIC:{AU_UNIT:200}},Oe=se.REALISTIC.AU_UNIT/se.COMPRESSED.AU_UNIT,J=(e,r)=>{const t=e*se.COMPRESSED.AU_UNIT,n=Math.sqrt(po/t),s=r*Math.PI/180,i=new z(0,0,-t),a=new z(-n*Math.cos(s),-n*Math.sin(s),0);return{position:i,velocity:a}},mo=[{name:"Sun",mass:po,radius:3,position:new z(0,0,0),velocity:new z(0,0,0),color:"#ffdd00",texturePath:"textures/sun_texture.png",isFixed:!0,isStar:!0,axialTilt:7.25,rotationSpeed:.04},{name:"Mercury",mass:.055,radius:.08,...J(.39,7),color:"#a1a1a1",texturePath:"textures/mercury_texture.png",axialTilt:.03,rotationSpeed:.017},{name:"Venus",mass:.815,radius:.12,...J(.72,3.4),color:"#e3bb76",texturePath:"textures/venus_texture.png",axialTilt:177.3,rotationSpeed:-.004},{name:"Earth",mass:1,radius:.13,...J(1,0),color:"#22aaff",texturePath:"textures/earth_texture.png",axialTilt:23.4,rotationSpeed:1},{name:"Mars",mass:.107,radius:.09,...J(1.52,1.85),color:"#ff4400",texturePath:"textures/mars_texture.png",axialTilt:25.2,rotationSpeed:.97},{name:"Jupiter",mass:317.8,radius:.8,...J(5.2,1.3),color:"#d9a066",texturePath:"textures/jupiter_texture.png",axialTilt:3.1,rotationSpeed:2.4},{name:"Saturn",mass:95.2,radius:.7,...J(9.5,2.49),color:"#eaddb1",texturePath:"textures/saturn_texture.png",axialTilt:26.7,rotationSpeed:2.2},{name:"Uranus",mass:14.5,radius:.4,...J(19.2,.77),color:"#b2f0ff",texturePath:"textures/uranus_texture.png",axialTilt:97.8,rotationSpeed:-1.4},{name:"Neptune",mass:17.1,radius:.4,...J(30.1,1.77),color:"#3366ff",texturePath:"textures/neptune_texture.png",axialTilt:28.3,rotationSpeed:1.5}],Je=()=>mo.map(e=>({...e,id:L()})),_r={id:"solar-system",name:"Solar System",nameJa:"太陽系",description:"Our home solar system with 8 planets orbiting the Sun.",descriptionJa:"太陽を中心に8つの惑星が周回する私たちの太陽系。",category:"classic",initialCamera:{position:[0,25,50],target:[0,0,0]},createBodies:()=>mo},fe=333e3,Mr={id:"three-body",name:"Three-Body System",nameJa:"三体星系",description:'Three stars orbiting each other in chaotic gravitational dance. Inspired by the novel "The Three-Body Problem".',descriptionJa:"ケンタウルス座アルファ星系の3つの恒星がカオスな重力相互作用を行う。小説「三体」にインスパイア。",category:"multi-star",initialCamera:{position:[-100,60,0],target:[0,0,0]},getCameraForMode:e=>e==="chaotic"?{position:[0,350,400],target:[0,0,0]}:{position:[-100,60,0],target:[0,0,0]},modes:[{id:"stable",name:"Era of Stability",nameJa:"恒紀",description:"A scientifically stable hierarchical triple system. Trisolaris orbits Star A safely.",descriptionJa:"科学的に安定した階層的三連星。Trisolarisはアルファ・ケンタウリAの周りを安全に周回する。"},{id:"chaotic",name:"Chaotic Era",nameJa:"乱紀",description:"Unpredictable stellar movements with extreme gravitational chaos.",descriptionJa:"予測不能な恒星の動きと極端な重力カオス。"}],createBodies:(e="stable")=>{const r=fe*1.1,t=fe*.9,n=fe*.12,s=r+t,i=s+n,a=2,l=d=>`/orbit_simulator/textures/${d}`;if(e==="stable"){const d=25*a,c=120*a,h=d*(r/s),u=Math.sqrt(s/d),f=u*(t/s),m=u*(r/s),g=c*(s/i),p=c*(n/i),v=Math.sqrt(i/c),S=v*(s/i),x=v*(n/i),j=7*a,M=Math.sqrt(r/j)*.9;return[{name:"α Centauri A",mass:r,radius:3.3,position:new z(-22.5-p,0,0),velocity:new z(0,0,f-x),color:"#ffffaa",texturePath:l("alpha_centauri_a.png"),isStar:!0,isFixed:!1},{name:"α Centauri B",mass:t,radius:2.7,position:new z(h-p,0,0),velocity:new z(0,0,-m-x),color:"#ffcc66",texturePath:l("alpha_centauri_b.png"),isStar:!0,isFixed:!1},{name:"Proxima Centauri",mass:n,radius:1.2,position:new z(g,20*a,0),velocity:new z(0,0,S),color:"#ff6644",texturePath:l("proxima_centauri.png"),isStar:!0,isFixed:!1},{name:"Trisolaris",mass:.001,radius:.3,position:new z(-22.5-p+j,0,0),velocity:new z(0,0,f-x+M),color:"#4488ff",texturePath:l("trisolaris.png"),isStar:!1}]}else{const c=Math.sqrt(i/80)*.5,h=(F,q)=>F+Math.random()*(q-F),u=()=>Math.random()*Math.PI*2,f=u(),m=u(),g=u(),p=h(40,100),v=h(40,100),S=h(30,80),x=new z(Math.cos(f)*p,h(-20,20),Math.sin(f)*p),j=new z(Math.cos(m)*v,h(-20,20),Math.sin(m)*v),M=new z(Math.cos(g)*S,h(-20,20),Math.sin(g)*S),P=u(),w=u(),R=h(c*.3,c*.8),k=h(c*.3,c*.8),y=new z(Math.cos(P)*R,h(-c*.2,c*.2),Math.sin(P)*R),b=new z(Math.cos(w)*k,h(-c*.2,c*.2),Math.sin(w)*k),D=new z(-(y.x*r+b.x*t)/n*.1,h(-c*.3,c*.3),-(y.z*r+b.z*t)/n*.1),I=u(),T=h(180,250),W=Math.sqrt(i/T)*h(.7,.85),E=h(-30,30);return[{name:"α Centauri A",mass:r,radius:3.3,position:x,velocity:y,color:"#ffffaa",texturePath:l("alpha_centauri_a.png"),isStar:!0,isFixed:!1},{name:"α Centauri B",mass:t,radius:2.7,position:j,velocity:b,color:"#ffcc66",texturePath:l("alpha_centauri_b.png"),isStar:!0,isFixed:!1},{name:"Proxima Centauri",mass:n,radius:1.2,position:M,velocity:D,color:"#ff6644",texturePath:l("proxima_centauri.png"),isStar:!0,isFixed:!1},{name:"Trisolaris",mass:1,radius:.3,position:new z(Math.cos(I)*T,E,Math.sin(I)*T),velocity:new z(-Math.sin(I)*W,0,Math.cos(I)*W),color:"#4488ff",texturePath:l("trisolaris.png"),isStar:!1}]}}},jr={id:"figure-eight",name:"Figure-8 Orbit",nameJa:"8の字軌道",description:"Three equal-mass bodies following a stable figure-8 choreography. A mathematically proven periodic solution.",descriptionJa:"3つの等質量天体が8の字パターンで安定周回する、数学的に証明された周期解。",category:"choreography",initialCamera:{position:[0,80,100],target:[0,0,0]},createBodies:()=>{const t=Math.sqrt(400),n=.9700043566973456,s=-.2430875323849975,i=.4662036850311905,a=.4323657300236305;return[{name:"Body α",mass:1e4,radius:.5,position:new z(n*25,s*25,0),velocity:new z(i*t,a*t,0),color:"#ff6b6b",isStar:!0,isFixed:!1},{name:"Body β",mass:1e4,radius:.5,position:new z(-n*25,-s*25,0),velocity:new z(i*t,a*t,0),color:"#4ecdc4",isStar:!0,isFixed:!1},{name:"Body γ",mass:1e4,radius:.5,position:new z(0,0,0),velocity:new z(-2*i*t,-2*a*t,0),color:"#ffe66d",isStar:!0,isFixed:!1}]}},kr={id:"black-hole",name:"Black Hole Binary",nameJa:"ブラックホール連星",description:"A stellar-mass black hole with accretion disk, orbited by a companion star. Matter flows from star to black hole.",descriptionJa:"恒星質量ブラックホールと伴星の連星系。降着円盤と相対論的ジェットを可視化。",category:"multi-star",initialCamera:{position:[0,100,150],target:[0,0,0]},createBodies:()=>{const e=u=>`/orbit_simulator/textures/${u}`,r=fe*10,t=fe*.8,n=r+t,s=60,i=s*(r/n),a=Math.sqrt(n/s),l=a*(t/n),d=a*(r/n),c=120,h=Math.sqrt(n/c)*.95;return[{name:"Cygnus X-1",mass:r,radius:2,position:new z(-4.444444444444445,0,0),velocity:new z(0,0,l),color:"#000000",isStar:!1,isFixed:!1,isCompactObject:!0,hasAccretionDisk:!0,accretionDiskConfig:{innerRadius:1.5,outerRadius:8,rotationSpeed:2,particleCount:25e3,tilt:.15},hasJets:!0},{name:"HDE 226868",mass:t,radius:4,position:new z(i,0,0),velocity:new z(0,0,-d),color:"#8899ff",texturePath:e("hde_226868_texture.png"),isStar:!0,isFixed:!1},{name:"Outer World",mass:100,radius:.5,position:new z(c,10,0),velocity:new z(0,0,h),color:"#88aa55",texturePath:e("outer_world_texture.png"),isStar:!1,isFixed:!1}]}},Pr={id:"supernova",name:"Supernova Explosion",nameJa:"超新星爆発",description:"A massive blue supergiant star ready to go supernova. Watch the spectacular stellar death and transformation.",descriptionJa:"超新星爆発を起こす大質量の青色超巨星。壮大な恒星の死と変化を観察する。",category:"catastrophic",initialCamera:{position:[0,50,120],target:[0,0,0]},scenario:{kind:"supernova",autoStartDelayMs:800,countdownMs:3e3,target:"primary-star",cinematic:"full",vfxProfileId:"cinematic"},createBodies:()=>{const e=fe*20;return[{name:"Betelgeuse",mass:e,radius:15,position:new z(0,0,0),velocity:new z(0,0,0),color:"#aaccff",isStar:!0,isFixed:!0,type:"star"},{name:"Prometheus",mass:300,radius:8,position:new z(80,0,0),velocity:new z(0,0,Math.sqrt(e/80)*.95),color:"#cc8844",type:"planet"},{name:"Erebus",mass:1,radius:3,position:new z(0,0,150),velocity:new z(Math.sqrt(e/150)*.98,0,0),color:"#6688aa",type:"planet"},{name:"Icarus",mass:1,radius:2,position:new z(-45,0,0),velocity:new z(0,0,-Math.sqrt(e/45)),color:"#dd6633",type:"planet"}]}},fo=[_r,Mr,jr,kr,Pr],Ge=e=>fo.find(r=>r.id===e);class zr{workers=[];sharedBuffer;positions;velocities;accelerations;masses;radii;syncCounter;workerCount;maxBodies;isSupported;constructor(r,t=navigator.hardwareConcurrency||4){if(this.maxBodies=r,this.workerCount=t,this.isSupported=typeof SharedArrayBuffer<"u",!this.isSupported){console.warn("SharedArrayBuffer is not supported. Falling back to main thread."),this.sharedBuffer=new ArrayBuffer(0),this.positions=new Float64Array(0),this.velocities=new Float64Array(0),this.accelerations=new Float64Array(0),this.masses=new Float64Array(0),this.radii=new Float64Array(0),this.syncCounter=new Int32Array(0);return}const s=r*11*8+8;this.sharedBuffer=new SharedArrayBuffer(s);let i=0;this.positions=new Float64Array(this.sharedBuffer,i,r*3),i+=r*3*8,this.velocities=new Float64Array(this.sharedBuffer,i,r*3),i+=r*3*8,this.accelerations=new Float64Array(this.sharedBuffer,i,r*3),i+=r*3*8,this.masses=new Float64Array(this.sharedBuffer,i,r),i+=r*8,this.radii=new Float64Array(this.sharedBuffer,i,r),i+=r*8,this.syncCounter=new Int32Array(this.sharedBuffer,i,2)}onCollision=null;initialized=!1;initPromise=null;pendingReject=null;initWorkers(){if(!this.isSupported||this.initialized||this.initPromise)return;const r=[];for(let t=0;t<this.workerCount;t++){const n=new Worker(new URL("/orbit_simulator/assets/physics.worker-pFkwC4IC.js",import.meta.url),{type:"module"}),s=new Promise(i=>{const a=l=>{l.data.type==="initDone"&&(n.removeEventListener("message",a),i())};n.addEventListener("message",a)});n.postMessage({type:"init",sharedBuffer:this.sharedBuffer,workerId:t,workerCount:this.workerCount,maxBodies:this.maxBodies}),this.workers.push(n),r.push(s)}this.initPromise=Promise.all(r).then(()=>{this.initialized=!0})}async waitForInit(){this.initPromise&&await this.initPromise}async executeStep(r,t){if(!this.isSupported)return;await this.waitForInit(),Atomics.store(this.syncCounter,0,0);const n=Promise.all(this.workers.map(s=>new Promise(i=>{const a=l=>{l.data.type==="done"?(s.removeEventListener("message",a),i()):l.data.type==="collisions"&&this.onCollision&&this.onCollision(l.data.collisions)};s.addEventListener("message",a),s.postMessage({type:"step",count:r,dt:t})}))).then(()=>{this.pendingReject=null});return new Promise((s,i)=>{this.pendingReject=i,n.then(s).catch(i)})}calculateEnergy(r){return!this.isSupported||this.workers.length===0?Promise.resolve(0):new Promise(t=>{const n=this.workers[0],s=i=>{i.data.type==="energyResult"&&(n.removeEventListener("message",s),t(i.data.totalEnergy))};n.addEventListener("message",s),n.postMessage({type:"energy",count:r})})}terminate(){this.pendingReject&&(this.pendingReject(new Error("WorkerManager terminated")),this.pendingReject=null),this.workers.forEach(r=>r.terminate()),this.workers=[],this.initialized=!1,this.initPromise=null}setBodies(r){if(!this.isSupported)return;const t=r.length;if(t>this.maxBodies){console.error("Too many bodies for worker manager");return}for(let s=0;s<t;s++){const i=r[s],a=s*3;this.positions[a]=i.position.x,this.positions[a+1]=i.position.y,this.positions[a+2]=i.position.z,this.velocities[a]=i.velocity.x,this.velocities[a+1]=i.velocity.y,this.velocities[a+2]=i.velocity.z,this.accelerations[a]=0,this.accelerations[a+1]=0,this.accelerations[a+2]=0,this.masses[s]=i.mass,this.radii[s]=i.radius}const n={count:t,maxCount:this.maxBodies,positions:this.positions,velocities:this.velocities,accelerations:this.accelerations,masses:this.masses,radii:this.radii,ids:new Array(t)};uo(n)}getPhysicsState(r){return{count:r,maxCount:this.maxBodies,positions:this.positions,velocities:this.velocities,accelerations:this.accelerations,masses:this.masses,radii:this.radii,ids:[],idToIndex:new Map}}}const Rr=`
struct Body {
    data0 : vec4<f32>, // pos(xyz), mass(w)
    data1 : vec4<f32>, // vel(xyz), radius(w)
    data2 : vec4<f32>, // acc(xyz), padding(w)
}

struct Params {
    dt : f32,
    bodyCount : u32,
    G : f32,
    softening : f32,
}

struct CollisionPair {
    indexA : u32,
    indexB : u32,
}

struct AtomicCounter {
    count : atomic<u32>,
}

@group(0) @binding(0) var<storage, read> bodiesIn : array<Body>;
@group(0) @binding(1) var<storage, read_write> bodiesOut : array<Body>;
@group(0) @binding(2) var<uniform> params : Params;
@group(0) @binding(3) var<storage, read_write> collisions : array<CollisionPair>;
@group(0) @binding(4) var<storage, read_write> counter : AtomicCounter;

// PASS 1: Integration (Kick1 + Drift)
@compute @workgroup_size(64)
fn integrate(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let index = GlobalInvocationID.x;
    if (index >= params.bodyCount) { return; }

    let myPos = bodiesIn[index].data0.xyz;
    let myMass = bodiesIn[index].data0.w;
    let oldVel = bodiesIn[index].data1.xyz;
    let oldAcc = bodiesIn[index].data2.xyz;

    let halfDt = params.dt * 0.5;

    // Kick 1
    let midVel = oldVel + oldAcc * halfDt;

    // Drift
    let newPos = myPos + midVel * params.dt;

    bodiesOut[index].data0 = vec4<f32>(newPos, myMass);
    bodiesOut[index].data1 = vec4<f32>(midVel, bodiesIn[index].data1.w);
    bodiesOut[index].data2 = vec4<f32>(0.0, 0.0, 0.0, 0.0); 
}

// PASS 2: Force Calculation + Kick2 + Collision
@compute @workgroup_size(64)
fn calcForces(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let index = GlobalInvocationID.x;
    if (index >= params.bodyCount) { return; }

    let myPos = bodiesIn[index].data0.xyz;
    let myRadius = bodiesIn[index].data1.w;
    var acc = vec3<f32>(0.0, 0.0, 0.0);

    // O(N^2) Force Calculation
    for (var i : u32 = 0u; i < params.bodyCount; i = i + 1u) {
        if (i == index) { continue; }

        let otherPos = bodiesIn[i].data0.xyz;
        let otherMass = bodiesIn[i].data0.w;

        let diff = otherPos - myPos;
        let distSq = dot(diff, diff) + params.softening;
        let invDist = inverseSqrt(distSq);
        let invDist3 = invDist * invDist * invDist;
        
        acc = acc + diff * (params.G * otherMass * invDist3);
        
        // COLLISION CHECK
        if (i > index) {
            let realDistSq = dot(diff, diff);
            let otherRadius = bodiesIn[i].data1.w;
            let radSum = myRadius + otherRadius;
            
            if (realDistSq < (radSum * 0.8) * (radSum * 0.8)) {
                let oldVal = atomicAdd(&counter.count, 1u);
                if (oldVal < 1000u) {
                    collisions[oldVal].indexA = index;
                    collisions[oldVal].indexB = i;
                }
            }
        }
    }

    // Kick 2
    let midVel = bodiesIn[index].data1.xyz;
    let halfDt = params.dt * 0.5;
    let newVel = midVel + acc * halfDt;

    bodiesOut[index].data1 = vec4<f32>(newVel, bodiesIn[index].data1.w);
    bodiesOut[index].data2 = vec4<f32>(acc, 0.0);
}
`;class ho{device=null;pipelineIntegrate=null;pipelineForce=null;bufferA=null;bufferB=null;uniformBuffer=null;stagingBuffer=null;collisionBuffer=null;counterBuffer=null;stagingCollisionBuffer=null;stagingCounterBuffer=null;bindGroupA_Integrate=null;bindGroupB_Integrate=null;bindGroup_Force_ReadA_WriteB=null;bindGroup_Force_ReadB_WriteA=null;currentBufferIndex=0;maxBodies=0;_isReady=!1;get isReady(){return this._isReady}G=re.G;softening=re.SOFTENING_SQ;static async isSupported(){if(!navigator.gpu)return!1;try{return!!await navigator.gpu.requestAdapter()}catch(r){return console.error("WebGPU check failed:",r),!1}}constructor(){}async init(r){if(!navigator.gpu)throw new Error("WebGPU not supported");const t=await navigator.gpu.requestAdapter();if(!t)throw new Error("No GPUAdapter found");this.device=await t.requestDevice(),this.maxBodies=r,await this.createPipelines(),this.createBuffers(r),this._isReady=!0,console.log("GPUPhysicsEngine initialized (Velocity Verlet).")}async createPipelines(){if(!this.device)return;const r=this.device.createShaderModule({code:Rr});this.pipelineIntegrate=this.device.createComputePipeline({layout:"auto",compute:{module:r,entryPoint:"integrate"}}),this.pipelineForce=this.device.createComputePipeline({layout:"auto",compute:{module:r,entryPoint:"calcForces"}})}createBuffers(r){if(!this.device||!this.pipelineIntegrate||!this.pipelineForce)return;r>this.maxBodies&&console.warn("Body count exceeds GPU buffer capacity.");const n=Math.max(r*48,128),s=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC;this.bufferA=this.device.createBuffer({size:n,usage:s,label:"Buffer A"}),this.bufferB=this.device.createBuffer({size:n,usage:s,label:"Buffer B"}),this.uniformBuffer=this.device.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.stagingBuffer=this.device.createBuffer({size:n,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.collisionBuffer=this.device.createBuffer({size:8e3,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),this.counterBuffer=this.device.createBuffer({size:4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this.stagingCollisionBuffer=this.device.createBuffer({size:8e3,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.stagingCounterBuffer=this.device.createBuffer({size:4,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST});const i=this.pipelineIntegrate.getBindGroupLayout(0),a=[{binding:2,resource:{buffer:this.uniformBuffer}}],l=[{binding:2,resource:{buffer:this.uniformBuffer}},{binding:3,resource:{buffer:this.collisionBuffer}},{binding:4,resource:{buffer:this.counterBuffer}}];this.bindGroupA_Integrate=this.device.createBindGroup({layout:i,entries:[{binding:0,resource:{buffer:this.bufferA}},{binding:1,resource:{buffer:this.bufferB}},...a]}),this.bindGroupB_Integrate=this.device.createBindGroup({layout:i,entries:[{binding:0,resource:{buffer:this.bufferB}},{binding:1,resource:{buffer:this.bufferA}},...a]});const d=this.pipelineForce.getBindGroupLayout(0);this.bindGroup_Force_ReadA_WriteB=this.device.createBindGroup({layout:d,entries:[{binding:0,resource:{buffer:this.bufferA}},{binding:1,resource:{buffer:this.bufferB}},...l]}),this.bindGroup_Force_ReadB_WriteA=this.device.createBindGroup({layout:d,entries:[{binding:0,resource:{buffer:this.bufferB}},{binding:1,resource:{buffer:this.bufferA}},...l]})}async setBodies(r){if(!this.device||!this.bufferA)return;const t=new Float32Array(r.length*12);for(let a=0;a<r.length;a++){const l=r[a],d=a*12;t[d+0]=l.position.x,t[d+1]=l.position.y,t[d+2]=l.position.z,t[d+3]=l.mass,t[d+4]=l.velocity.x,t[d+5]=l.velocity.y,t[d+6]=l.velocity.z,t[d+7]=l.radius,t[d+8]=0,t[d+9]=0,t[d+10]=0,t[d+11]=0}this.device.queue.writeBuffer(this.bufferA,0,t),this.counterBuffer&&this.device.queue.writeBuffer(this.counterBuffer,0,new Uint32Array([0]));const n=new ArrayBuffer(16);new Float32Array(n)[0]=0,new Uint32Array(n)[1]=r.length,new Float32Array(n)[2]=this.G,new Float32Array(n)[3]=this.softening,this.device.queue.writeBuffer(this.uniformBuffer,0,n);const s=this.device.createCommandEncoder();s.copyBufferToBuffer(this.bufferA,0,this.bufferB,0,this.bufferA.size);const i=s.beginComputePass({label:"Init Acc Pass"});i.setPipeline(this.pipelineForce),i.setBindGroup(0,this.bindGroup_Force_ReadB_WriteA),i.dispatchWorkgroups(Math.ceil(r.length/64)),i.end(),this.device.queue.submit([s.finish()]),this.currentBufferIndex=0}async step(r,t){if(!this.device||!this.pipelineIntegrate||!this.pipelineForce||!this.uniformBuffer)return;this.counterBuffer&&this.device.queue.writeBuffer(this.counterBuffer,0,new Uint32Array([0]));const n=new ArrayBuffer(16),s=new Float32Array(n),i=new Uint32Array(n);s[0]=r,i[1]=t,s[2]=this.G,s[3]=this.softening,this.device.queue.writeBuffer(this.uniformBuffer,0,n);const a=this.device.createCommandEncoder(),l=this.bufferA.size,d=Math.ceil(t/64);if(this.currentBufferIndex===0){const c=a.beginComputePass({label:"Integration Pass"});c.setPipeline(this.pipelineIntegrate),c.setBindGroup(0,this.bindGroupA_Integrate),c.dispatchWorkgroups(d),c.end(),a.copyBufferToBuffer(this.bufferB,0,this.bufferA,0,l);const h=a.beginComputePass({label:"Force Pass"});h.setPipeline(this.pipelineForce),h.setBindGroup(0,this.bindGroup_Force_ReadA_WriteB),h.dispatchWorkgroups(d),h.end()}else{const c=a.beginComputePass({label:"Integration Pass"});c.setPipeline(this.pipelineIntegrate),c.setBindGroup(0,this.bindGroupB_Integrate),c.dispatchWorkgroups(d),c.end(),a.copyBufferToBuffer(this.bufferA,0,this.bufferB,0,l);const h=a.beginComputePass({label:"Force Pass"});h.setPipeline(this.pipelineForce),h.setBindGroup(0,this.bindGroup_Force_ReadB_WriteA),h.dispatchWorkgroups(d),h.end()}this.device.queue.submit([a.finish()]),this.currentBufferIndex=this.currentBufferIndex===0?1:0}async getBodies(r){if(!this.device||!this.stagingBuffer||!this.bufferA||!this.bufferB)return null;const t=this.currentBufferIndex===1?this.bufferB:this.bufferA,n=r*48,s=this.device.createCommandEncoder();s.copyBufferToBuffer(t,0,this.stagingBuffer,0,n),this.device.queue.submit([s.finish()]),await this.stagingBuffer.mapAsync(GPUMapMode.READ,0,n);const i=this.stagingBuffer.getMappedRange(0,n),a=new Float32Array(i.slice(0));return this.stagingBuffer.unmap(),a}async getCollisions(){if(!this.device||!this.collisionBuffer||!this.counterBuffer||!this.stagingCounterBuffer||!this.stagingCollisionBuffer)return null;const r=this.device.createCommandEncoder();r.copyBufferToBuffer(this.counterBuffer,0,this.stagingCounterBuffer,0,4),this.device.queue.submit([r.finish()]),await this.stagingCounterBuffer.mapAsync(GPUMapMode.READ);const n=new Uint32Array(this.stagingCounterBuffer.getMappedRange())[0];if(this.stagingCounterBuffer.unmap(),n===0)return[];const s=Math.min(n,1e3),i=s*8,a=this.device.createCommandEncoder();a.copyBufferToBuffer(this.collisionBuffer,0,this.stagingCollisionBuffer,0,i),this.device.queue.submit([a.finish()]),await this.stagingCollisionBuffer.mapAsync(GPUMapMode.READ,0,i);const l=new Uint32Array(this.stagingCollisionBuffer.getMappedRange(0,i)),d=[];for(let c=0;c<s;c++)d.push([l[c*2],l[c*2+1]]);return this.stagingCollisionBuffer.unmap(),d}dispose(){this.bufferA?.destroy(),this.bufferB?.destroy(),this.uniformBuffer?.destroy(),this.stagingBuffer?.destroy(),this.collisionBuffer?.destroy(),this.counterBuffer?.destroy(),this.stagingCollisionBuffer?.destroy(),this.stagingCounterBuffer?.destroy(),this.device?.destroy()}}const go=()=>{const e=new Set;return{schedule:(r,t)=>{const n=setTimeout(()=>{e.delete(n),r()},t);return e.add(n),n},clear:r=>{clearTimeout(r),e.delete(r)},clearAll:()=>{for(const r of e)clearTimeout(r);e.clear()},size:()=>e.size}},xt={low:{accretionDiskParticles:5e3,maxDebrisParticles:500,maxExplosionParticles:50,maxTidalParticles:500,trailRecentPoints:30,trailCompressedPoints:60,trailCompressionRatio:6,maxVisibleLabels:8,maxTrailedBodies:4,maxVisibleStarLabels:12,starfieldSegments:[24,24],starfieldFBMOctaves:2,starfieldRadius:3e4,pixelRatioMultiplier:.75,shadowsEnabled:!1,postProcessingEnabled:!1,maxPredictionSteps:600,enableAccretionDisk:!0,enableStarfield:!0,enableGlow:!1,enablePostProcessing:!1,supernovaShellLayers:2,supernovaRayCount:8,supernovaDebrisBudget:450,supernovaUseSecondaryGlow:!1,supernovaUseJets:!1},medium:{accretionDiskParticles:15e3,maxDebrisParticles:1e3,maxExplosionParticles:100,maxTidalParticles:1e3,trailRecentPoints:45,trailCompressedPoints:90,trailCompressionRatio:5,maxVisibleLabels:12,maxTrailedBodies:8,maxVisibleStarLabels:20,starfieldSegments:[32,32],starfieldFBMOctaves:3,starfieldRadius:35e3,pixelRatioMultiplier:1,shadowsEnabled:!1,postProcessingEnabled:!1,maxPredictionSteps:900,enableAccretionDisk:!0,enableStarfield:!0,enableGlow:!0,enablePostProcessing:!1,supernovaShellLayers:3,supernovaRayCount:12,supernovaDebrisBudget:900,supernovaUseSecondaryGlow:!0,supernovaUseJets:!0},high:{accretionDiskParticles:3e4,maxDebrisParticles:2e3,maxExplosionParticles:200,maxTidalParticles:2e3,trailRecentPoints:60,trailCompressedPoints:120,trailCompressionRatio:4,maxVisibleLabels:20,maxTrailedBodies:12,maxVisibleStarLabels:32,starfieldSegments:[64,64],starfieldFBMOctaves:4,starfieldRadius:4e4,pixelRatioMultiplier:1,shadowsEnabled:!0,postProcessingEnabled:!0,maxPredictionSteps:1200,enableAccretionDisk:!0,enableStarfield:!0,enableGlow:!0,enablePostProcessing:!0,supernovaShellLayers:4,supernovaRayCount:16,supernovaDebrisBudget:1500,supernovaUseSecondaryGlow:!0,supernovaUseJets:!0},auto:{accretionDiskParticles:15e3,maxDebrisParticles:1e3,maxExplosionParticles:100,maxTidalParticles:1e3,trailRecentPoints:45,trailCompressedPoints:90,trailCompressionRatio:5,maxVisibleLabels:12,maxTrailedBodies:8,maxVisibleStarLabels:20,starfieldSegments:[32,32],starfieldFBMOctaves:3,starfieldRadius:35e3,pixelRatioMultiplier:1,shadowsEnabled:!1,postProcessingEnabled:!1,maxPredictionSteps:900,enableAccretionDisk:!0,enableStarfield:!0,enableGlow:!0,enablePostProcessing:!1,supernovaShellLayers:3,supernovaRayCount:12,supernovaDebrisBudget:900,supernovaUseSecondaryGlow:!0,supernovaUseJets:!0}},xe=e=>e==="auto"?xt.medium:xt[e],me={introMs:800,countdownMs:3e3,shockBreakoutMs:1200,ejectaMs:15e3,remnantHoldMs:2500},vo=e=>e>2e5?"black-hole":e>1e5?"neutron-star":"none",yt=e=>{let r=null;for(const t of e)t.isStar&&(!r||t.mass>r.mass)&&(r=t);return r?.id??null},Dr=(e,r)=>{const t=xe(r),n=Math.max(.85,Math.min(1.45,Math.pow(e/1e5,.12))),s=vo(e);return{coreRadiusScale:1.2*n,haloRadiusScale:2.6*n,shellCount:t.supernovaShellLayers,rayCount:t.supernovaRayCount,raySpread:t.supernovaUseSecondaryGlow?.65:.45,rayPulseSpeed:t.supernovaUseSecondaryGlow?6.5:4.5,debrisBudget:t.supernovaDebrisBudget,useSecondaryGlow:t.supernovaUseSecondaryGlow,useJets:t.supernovaUseJets&&s==="black-hole",gammaRayWidthScale:s==="black-hole"?.18:.1,gammaRayCoreIntensity:s==="black-hole"?1.4:.9}},X=go(),Ir=()=>{const e=Math.random()*2-1,r=Math.random()*2-1,t=Math.random()*2-1,n=Math.hypot(e,r,t)||1;return{x:e/n,y:r/n,z:t/n}},N=Ht((e,r)=>({shockwaves:[],heatGlows:[],debrisClouds:[],tidalDisruptions:[],explosions:[],supernovas:[],radialRays:[],cameraShakes:[],gammaRayBursts:[],addShockwave:(t,n,s="#ffaa00",i=2e3,a=0,l)=>{const d=L();return e(c=>({shockwaves:[...c.shockwaves,{id:d,position:t,startTime:performance.now(),maxRadius:n,color:s,duration:i,asymmetry:a,directionBias:l}]})),d},removeShockwave:t=>{e(n=>({shockwaves:n.shockwaves.filter(s=>s.id!==t)}))},addHeatGlow:(t,n,s,i=1,a=4e3)=>{const l=L();return e(d=>({heatGlows:[...d.heatGlows,{id:l,bodyId:t,position:n,radius:s,startTime:performance.now(),duration:a,intensity:i}]})),l},removeHeatGlow:t=>{e(n=>({heatGlows:n.heatGlows.filter(s=>s.id!==t)}))},addDebrisCloud:(t,n,s,i,a,l,d)=>{const c=L(),h=performance.now(),u=[],f=()=>{let m=0,g=0;for(;m===0;)m=Math.random();for(;g===0;)g=Math.random();return Math.sqrt(-2*Math.log(m))*Math.cos(2*Math.PI*g)};for(let m=0;m<a;m++){const g=Math.random()*Math.PI*2,p=Math.acos(2*Math.random()-1),v=Math.abs(f()),S=d*(.5+v*.3),x=Math.sin(p)*Math.cos(g),j=Math.sin(p)*Math.sin(g),M=Math.cos(p);u.push({id:L(),position:{...n},velocity:{x:s.x*.5+x*S,y:s.y*.5+j*S,z:s.z*.5+M*S},size:l*(.2+Math.random()*.8),color:i,createdAt:h,lifetime:8e3+Math.random()*12e3,rotationSpeed:{x:(Math.random()-.5)*5,y:(Math.random()-.5)*5,z:(Math.random()-.5)*5},rotation:{x:Math.random()*Math.PI*2,y:Math.random()*Math.PI*2,z:Math.random()*Math.PI*2}})}return e(m=>({debrisClouds:[...m.debrisClouds,{id:c,sourceBodyId:t,particles:u,createdAt:h}]})),c},removeExpiredDebris:()=>{const t=performance.now();e(n=>({debrisClouds:n.debrisClouds.map(s=>({...s,particles:s.particles.filter(i=>t-i.createdAt<i.lifetime)})).filter(s=>s.particles.length>0)}))},removeDebrisCloud:t=>{e(n=>({debrisClouds:n.debrisClouds.filter(s=>s.id!==t)}))},addTidalDisruption:(t,n,s,i,a,l,d,c=6e3)=>{const h=L();return e(u=>({tidalDisruptions:[...u.tidalDisruptions,{id:h,bodyId:t,primaryId:n,position:s,primaryPosition:i,bodyRadius:a,bodyColor:l,primaryMass:d,startTime:performance.now(),duration:c}]})),h},removeTidalDisruption:t=>{e(n=>({tidalDisruptions:n.tidalDisruptions.filter(s=>s.id!==t)}))},addExplosion:(t,n,s="#ff6600",i=500,a=2e3)=>{const l=L();return e(d=>({explosions:[...d.explosions,{id:l,position:t,startTime:performance.now(),duration:a,size:n,color:s,particleCount:i}]})),l},removeExplosion:t=>{e(n=>({explosions:n.explosions.filter(s=>s.id!==t)}))},addSupernova:(t,n,s,i="#aaccff",a=3,l=15e3,d=s*.12,c=s*.2,h=3,u={x:0,y:1,z:0})=>{const f=L();return e(m=>({supernovas:[...m.supernovas,{id:f,starId:t,position:n,startTime:performance.now(),duration:l,maxRadius:s,color:i,intensity:a,phase:"brightening",coreRadius:d,haloRadius:c,shellCount:h,biasDirection:u}]})),f},removeSupernova:t=>{e(n=>({supernovas:n.supernovas.filter(s=>s.id!==t)}))},addRadialRays:(t,n,s="#ffffff",i=8e3,a=12,l=.6,d=6)=>{const c=L();return e(h=>({radialRays:[...h.radialRays,{id:c,position:t,startTime:performance.now(),duration:i,rayCount:a,maxLength:n,color:s,spread:l,pulseSpeed:d}]})),c},removeRadialRays:t=>{e(n=>({radialRays:n.radialRays.filter(s=>s.id!==t)}))},addCameraShake:(t,n=3e3,s="exponential")=>{const i=L();return e(a=>({cameraShakes:[...a.cameraShakes,{id:i,startTime:performance.now(),duration:n,intensity:t,falloff:s}]})),i},removeCameraShake:t=>{e(n=>({cameraShakes:n.cameraShakes.filter(s=>s.id!==t)}))},addGammaRayBurst:(t,n,s=8e3,i={x:0,y:1,z:0},a=n*.08,l=1)=>{const d=L();return e(c=>({gammaRayBursts:[...c.gammaRayBursts,{id:d,position:t,startTime:performance.now(),duration:s,length:n,axis:i,width:a,coreIntensity:l}]})),d},removeGammaRayBurst:t=>{e(n=>({gammaRayBursts:n.gammaRayBursts.filter(s=>s.id!==t)}))},triggerSupernova:(t,n,s,i,a)=>{const{addSupernova:l,addDebrisCloud:d,addExplosion:c,addRadialRays:h,addCameraShake:u,addGammaRayBurst:f}=r(),m=typeof window<"u"&&window.__physicsStore?.getState?.(),g=m?.qualityLevel||"medium",p=m?.cameraShakeIntensity??1,v=Dr(s,g),S=Math.pow(s/1e5,.4),x=i*100*S,j=Ir(),M=Math.max(80,Math.floor(v.debrisBudget*.22)),P=Math.max(40,Math.floor(v.debrisBudget*.12)),w=v.useJets;l(t,n,x,"#d9e6ff",3.4,15e3,i*v.coreRadiusScale,i*v.haloRadiusScale,v.shellCount,j),u(3*p,2600,"exponential"),X.schedule(()=>{c(n,i*3,"#ffffff",M,1100)},1800),X.schedule(()=>{h(n,x*1.2,"#ccddff",1e4,v.rayCount,v.raySpread,v.rayPulseSpeed)},2100),v.useSecondaryGlow&&X.schedule(()=>{c(n,i*2.4,"#9dc8ff",P,2200)},2800),X.schedule(()=>{const R=Math.min(Math.floor(s/110)+360,v.debrisBudget);d(t,n,{x:0,y:0,z:0},a,R,i*.2,i*2.4)},3200),X.schedule(()=>{u(1.4*p,2e3,"linear")},4200),X.schedule(()=>{c(n,i*4.2,"#ff8d5d",P,3200)},5400),X.schedule(()=>{const R=Math.min(Math.floor(s/150)+150,Math.floor(v.debrisBudget*.55));d(t,n,{x:0,y:0,z:0},"#ffaa66",R,i*.15,i*1.6)},6800),w&&X.schedule(()=>{const R=x*3;f(n,R,1e4,j,i*v.gammaRayWidthScale,v.gammaRayCoreIntensity)},10800)},triggerCollisionEffects:t=>{const{addShockwave:n,addHeatGlow:s,addDebrisCloud:i,addExplosion:a}=r();n(t.collisionPoint,t.smallerBodyRadius*8,"#ffaa00",2e3),X.schedule(()=>{n(t.collisionPoint,t.smallerBodyRadius*5,"#ffffff",1e3)},100),s(t.largerBodyId,t.collisionPoint,t.smallerBodyRadius*1.5,1.2,5e3);const l=Math.min(Math.floor(t.combinedMass/50)+50,800);i(t.smallerBodyId,t.collisionPoint,{x:0,y:0,z:0},t.smallerBodyColor,l,t.smallerBodyRadius*.03,t.relativeVelocity*.3+t.smallerBodyRadius*.2),a(t.collisionPoint,t.smallerBodyRadius*2,"#ffff88",300,800)},removeExpiredEffects:()=>{const t=performance.now(),{removeExpiredDebris:n}=r();e(s=>({shockwaves:s.shockwaves.filter(i=>t-i.startTime<i.duration),heatGlows:s.heatGlows.filter(i=>t-i.startTime<i.duration),tidalDisruptions:s.tidalDisruptions.filter(i=>t-i.startTime<i.duration),explosions:s.explosions.filter(i=>t-i.startTime<i.duration),supernovas:s.supernovas.filter(i=>t-i.startTime<i.duration),radialRays:s.radialRays.filter(i=>t-i.startTime<i.duration),cameraShakes:s.cameraShakes.filter(i=>t-i.startTime<i.duration),gammaRayBursts:s.gammaRayBursts.filter(i=>t-i.startTime<i.duration)})),n()},cleanup:()=>{X.clearAll(),e({shockwaves:[],heatGlows:[],debrisClouds:[],tidalDisruptions:[],explosions:[],supernovas:[],radialRays:[],cameraShakes:[],gammaRayBursts:[]})}})),Tr=()=>{if(typeof window>"u")return"desktop";const e=navigator.userAgent.toLowerCase(),r=window.innerWidth;return/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(e)?"mobile":/tablet|ipad|playbook|silk/i.test(e)||r>=768&&r<1024?"tablet":r<768?"mobile":"desktop"},Br=()=>{if(typeof window>"u")return{type:"desktop",isMobile:!1,isTablet:!1,isDesktop:!0,pixelRatio:1,maxTextureSize:4096,hardwareConcurrency:4,supportsWebGPU:!1,screenWidth:1920,screenHeight:1080};const e=Tr();return{type:e,isMobile:e==="mobile",isTablet:e==="tablet",isDesktop:e==="desktop",pixelRatio:window.devicePixelRatio||1,maxTextureSize:Er(),hardwareConcurrency:navigator.hardwareConcurrency||4,supportsWebGPU:"gpu"in navigator,screenWidth:window.innerWidth,screenHeight:window.innerHeight}},Er=()=>{if(typeof window>"u")return 4096;try{const e=document.createElement("canvas"),r=e.getContext("webgl")||e.getContext("experimental-webgl");return r?r.getParameter(r.MAX_TEXTURE_SIZE):4096}catch{return 4096}},Ar=()=>{const e=Br();let r=0;switch(e.type){case"mobile":r+=.25;break;case"tablet":r+=.45;break;case"desktop":r+=.7;break}return e.hardwareConcurrency>=8?r+=.15:e.hardwareConcurrency>=4?r+=.1:r+=.05,e.maxTextureSize>=8192?r+=.1:e.maxTextureSize>=4096&&(r+=.05),e.supportsWebGPU&&(r+=.05),Math.min(1,r)},bt=()=>{const e=Ar();return e>=.7?"high":e>=.45?"medium":"low"},We=e=>{const r=N.getState();e.forEach(t=>{r.triggerCollisionEffects({body1Id:t.largerBodyId,body2Id:t.smallerBodyId,collisionPoint:t.collisionPoint,relativeVelocity:t.relativeVelocity,combinedMass:t.combinedMass,largerBodyId:t.largerBodyId,smallerBodyId:t.smallerBodyId,smallerBodyColor:t.smallerBodyColor,smallerBodyRadius:t.smallerBodyRadius})})};let V=null;const St=()=>(V||(V=new zr(no.MAX_BODIES),V.initWorkers()),V);let Z=null;const Nr=()=>(Z||(Z=new ho),Z),H={physicsDuration:0,bodyCount:0,mode:"CPU",energy:{kinetic:0,potential:0,total:0,initial:0,drift:0},lastEnergyCheck:0,cameraPosition:[0,0,0]},wt=.02,$=go(),ne=()=>({active:!1,phase:"idle",targetStarId:null,startedAt:null,triggerAt:null,remnantBodyId:null,remnantType:null,autoStarted:!1,countdownRemainingMs:0}),Ur=e=>({autoStartDelayMs:e?.scenario?.autoStartDelayMs??me.introMs,countdownMs:e?.scenario?.countdownMs??me.countdownMs}),Ct=Je(),C=Ht((e,r)=>({bodies:Ct,physicsState:null,simulationState:"running",timeScale:1,simulationTime:0,showPrediction:!1,showGrid:!0,showRealisticVisuals:!0,showHabitableZone:!1,showPerformance:!1,followingBodyId:null,selectedBodyId:null,cameraMode:"free",gpuDataInvalidated:!0,showGravityField:!1,tidallyDisruptedEvents:[],collisionEvents:[],supernovaEvents:[],supernovaScenario:ne(),currentSystemId:"solar-system",currentSystemMode:null,useRealisticDistances:!1,zenMode:!1,labMode:!1,resetToken:0,qualityLevel:typeof window<"u"&&localStorage.getItem("orbit-simulator-quality")?localStorage.getItem("orbit-simulator-quality"):bt(),cameraShakeIntensity:typeof window<"u"&&localStorage.getItem("orbit-simulator-camera-shake")?parseFloat(localStorage.getItem("orbit-simulator-camera-shake")||"1.0"):1,userMode:typeof window<"u"&&localStorage.getItem("orbit-simulator-user-mode")==="advanced"?"advanced":"beginner",hasSeenOnboarding:typeof window<"u"&&localStorage.getItem("orbit-simulator-onboarding-seen")==="true",useMultithreading:!1,useGPU:!1,isCalculating:!1,isWorkerSupported:typeof window<"u"&&!!window.Worker&&!!window.SharedArrayBuffer,isGPUSupported:null,checkGPUSupport:async()=>{const t=await ho.isSupported();e({isGPUSupported:t})},startSupernovaScenario:(t,n=!0)=>{const s=Ge(r().currentSystemId??""),{autoStartDelayMs:i,countdownMs:a}=Ur(s),l=performance.now();$.clearAll(),e({supernovaScenario:{active:!0,phase:"intro",targetStarId:t,startedAt:l,triggerAt:l+i+a,remnantBodyId:null,remnantType:null,autoStarted:n,countdownRemainingMs:a}}),$.schedule(()=>{r().advanceSupernovaScenario("countdown",{triggerAt:performance.now()+a,countdownRemainingMs:a})},i),$.schedule(()=>{r().advanceSupernovaScenario("shock-breakout",{countdownRemainingMs:0}),r().triggerSupernova(t)},i+a),$.schedule(()=>{r().advanceSupernovaScenario("ejecta")},i+a+me.shockBreakoutMs),$.schedule(()=>{r().advanceSupernovaScenario("remnant")},i+a+me.ejectaMs),$.schedule(()=>{r().advanceSupernovaScenario("complete")},i+a+me.ejectaMs+me.remnantHoldMs)},advanceSupernovaScenario:(t,n={})=>e(s=>({supernovaScenario:{...s.supernovaScenario,...n,active:t!=="idle",phase:t}})),completeSupernovaScenario:(t=null,n=null)=>e(s=>({supernovaScenario:{...s.supernovaScenario,active:!0,phase:"complete",remnantBodyId:t,remnantType:n,countdownRemainingMs:0}})),clearSupernovaScenario:()=>{$.clearAll(),e({supernovaScenario:ne()})},cleanup:()=>{$.clearAll(),N.getState().cleanup(),V&&(V.terminate(),V=null),Z&&(Z.dispose(),Z=null),e({supernovaEvents:[],supernovaScenario:ne(),collisionEvents:[],tidallyDisruptedEvents:[]})},toggleMultithreading:()=>{const{useMultithreading:t}=r();t&&V&&(V.terminate(),V=null),t||Z&&(Z.dispose(),Z=null),e(n=>({useMultithreading:!n.useMultithreading,useGPU:!1,physicsState:null,gpuDataInvalidated:!0,isCalculating:!1}))},toggleGPU:()=>{const{useGPU:t}=r();t&&Z&&(Z.dispose(),Z=null),t||V&&(V.terminate(),V=null),e(n=>({useGPU:!n.useGPU,useMultithreading:!1,physicsState:null,gpuDataInvalidated:!0,isCalculating:!1}))},toggleRealisticDistances:()=>{const{useRealisticDistances:t,bodies:n}=r(),s=!t,i=s?Oe:1/Oe,a=1/Math.sqrt(i),l=n.map(d=>d.isFixed?d:{...d,position:new z(d.position.x*i,d.position.y*i,d.position.z*i),velocity:new z(d.velocity.x*a,d.velocity.y*a,d.velocity.z*a)});typeof window<"u"&&window.dispatchEvent(new CustomEvent("distanceScaleChanged",{detail:{realistic:s,factor:i}})),e({useRealisticDistances:s,bodies:l,physicsState:null,gpuDataInvalidated:!0})},addTidalDisruptionEvent:t=>e(n=>({tidallyDisruptedEvents:[...n.tidallyDisruptedEvents,t]})),removeTidalDisruptionEvent:t=>e(n=>({tidallyDisruptedEvents:n.tidallyDisruptedEvents.filter(s=>s.bodyId!==t)})),addCollisionEvent:t=>e(n=>({collisionEvents:[...n.collisionEvents,t]})),removeCollisionEvent:t=>e(n=>({collisionEvents:n.collisionEvents.filter(s=>s.id!==t)})),triggerSupernova:t=>{const{bodies:n,supernovaEvents:s}=r(),i=n.find(f=>f.id===t),a=s.find(f=>f.starId===t);if(!i||!i.isStar||a){console.warn("Cannot trigger supernova: invalid target or event already active");return}N.getState().triggerSupernova(t,{x:i.position.x,y:i.position.y,z:i.position.z},i.mass,i.radius,i.color);const d=i.radius*100*Math.pow(i.mass/1e5,.4),c=i.mass*.5,h=n.map(f=>{if(f.id===t)return{...f,isBeingDestroyed:!0,destructionProgress:0,destructionStartTime:performance.now()};const m=f.position.x-i.position.x,g=f.position.y-i.position.y,p=f.position.z-i.position.z,v=Math.sqrt(m*m+g*g+p*p);if(v>d||v<.001)return f;const S=c/(v*v),x=m/v,j=g/v,M=p/v,P=S/Math.max(f.mass,1);return{...f,velocity:new z(f.velocity.x+x*P,f.velocity.y+j*P,f.velocity.z+M*P)}});e({bodies:h,physicsState:null,gpuDataInvalidated:!0});const u={id:L(),starId:t,position:{x:i.position.x,y:i.position.y,z:i.position.z},mass:i.mass,radius:i.radius,color:i.color,startTime:performance.now(),duration:15e3,explosionEnergy:i.mass*1e3,remnantType:vo(i.mass),shockwaveRadius:i.radius*100};e(f=>({supernovaEvents:[...f.supernovaEvents,u],supernovaScenario:f.supernovaScenario.targetStarId===t?{...f.supernovaScenario,remnantType:u.remnantType}:f.supernovaScenario})),$.schedule(()=>{const f=r(),m=f.bodies.find(p=>p.id===t);if(!m){e(p=>({supernovaEvents:p.supernovaEvents.filter(v=>v.id!==u.id)}));return}let g={};if(u.remnantType==="black-hole"){g={name:`${m.name} (Black Hole)`,radius:m.radius*.1,color:"#000000",isCompactObject:!0,type:"black_hole",hasAccretionDisk:!0,hasJets:!0,accretionDiskConfig:{innerRadius:3,outerRadius:15,rotationSpeed:2,particleCount:3e3,tilt:.3}};const p=u.shockwaveRadius*.8,S=m.mass*.3,x=f.bodies.map(j=>{if(j.id===t)return j;const M=m.position.x-j.position.x,P=m.position.y-j.position.y,w=m.position.z-j.position.z,R=Math.sqrt(M*M+P*P+w*w);if(R>p||R<m.radius*5)return j;const k=S/(R*R),y=M/R,b=P/R,D=w/R,I=k/Math.max(j.mass,1);return{...j,velocity:new z(j.velocity.x+y*I,j.velocity.y+b*I,j.velocity.z+D*I)}});e(j=>({bodies:x.map(M=>M.id===t?{...M,...g,isBeingDestroyed:!1,destructionProgress:1}:M),physicsState:null,gpuDataInvalidated:!0,supernovaEvents:j.supernovaEvents.filter(M=>M.id!==u.id),supernovaScenario:j.supernovaScenario.targetStarId===t?{...j.supernovaScenario,remnantBodyId:t,remnantType:u.remnantType}:j.supernovaScenario}));return}else if(u.remnantType==="neutron-star")g={name:`${m.name} (Neutron Star)`,mass:m.mass*.15,radius:m.radius*.05,color:"#88ccff",isCompactObject:!0,type:"star"};else{e(p=>({bodies:p.bodies.filter(v=>v.id!==t),physicsState:null,gpuDataInvalidated:!0,selectedBodyId:p.selectedBodyId===t?null:p.selectedBodyId,followingBodyId:p.followingBodyId===t?null:p.followingBodyId,supernovaEvents:p.supernovaEvents.filter(v=>v.id!==u.id),supernovaScenario:p.supernovaScenario.targetStarId===t?{...p.supernovaScenario,remnantBodyId:null,remnantType:u.remnantType}:p.supernovaScenario}));return}e(p=>({bodies:p.bodies.map(v=>v.id===t?{...v,...g,isBeingDestroyed:!1,destructionProgress:1}:v),physicsState:null,gpuDataInvalidated:!0,supernovaEvents:p.supernovaEvents.filter(v=>v.id!==u.id),supernovaScenario:p.supernovaScenario.targetStarId===t?{...p.supernovaScenario,remnantBodyId:t,remnantType:u.remnantType}:p.supernovaScenario}))},15e3)},toggleGravityField:()=>e(t=>({showGravityField:!t.showGravityField})),history:[],historyIndex:-1,pushHistoryAction:t=>e(n=>{const s=n.history.slice(0,n.historyIndex+1);return{history:[...s,t],historyIndex:s.length}}),undo:()=>{const{history:t,historyIndex:n}=r();if(n<0)return;const s=t[n];switch(s.type){case"ADD":e(i=>({bodies:i.bodies.filter(a=>a.id!==s.body.id),physicsState:null,gpuDataInvalidated:!0,selectedBodyId:i.selectedBodyId===s.body.id?null:i.selectedBodyId}));break;case"REMOVE":e(i=>({bodies:[...i.bodies,s.body],physicsState:null,gpuDataInvalidated:!0}));break;case"UPDATE":e(i=>({bodies:i.bodies.map(a=>a.id===s.id?{...a,...s.previous}:a),physicsState:null,gpuDataInvalidated:!0}));break}e({historyIndex:n-1})},redo:()=>{const{history:t,historyIndex:n}=r();if(n>=t.length-1)return;const s=t[n+1];switch(s.type){case"ADD":e(i=>({bodies:[...i.bodies,s.body],physicsState:null,gpuDataInvalidated:!0}));break;case"REMOVE":e(i=>({bodies:i.bodies.filter(a=>a.id!==s.body.id),physicsState:null,gpuDataInvalidated:!0,selectedBodyId:i.selectedBodyId===s.body.id?null:i.selectedBodyId}));break;case"UPDATE":e(i=>({bodies:i.bodies.map(a=>a.id===s.id?{...a,...s.current}:a),physicsState:null,gpuDataInvalidated:!0}));break}e({historyIndex:n+1})},addBody:t=>{const{bodies:n,pushHistoryAction:s}=r(),i={...t,id:L()};s({type:"ADD",body:i});const a=[...n,i];e({bodies:a,physicsState:null,gpuDataInvalidated:!0})},duplicateBody:t=>{const{bodies:n,pushHistoryAction:s}=r(),i=n.find(l=>l.id===t);if(!i)return;const a={...i,id:L(),name:`${i.name} (Copy)`,position:i.position.clone().add(new z(2,0,2)),velocity:i.velocity.clone()};s({type:"ADD",body:a}),e(l=>({bodies:[...l.bodies,a],selectedBodyId:a.id,physicsState:null,gpuDataInvalidated:!0}))},removeBody:t=>{const{bodies:n,followingBodyId:s,selectedBodyId:i,pushHistoryAction:a}=r(),l=n.find(c=>c.id===t);l&&a({type:"REMOVE",body:l});const d=n.filter(c=>c.id!==t);e({bodies:d,physicsState:null,followingBodyId:s===t?null:s,selectedBodyId:i===t?null:i,gpuDataInvalidated:!0})},updateBodies:async()=>{const{bodies:t,simulationState:n,timeScale:s,simulationTime:i,physicsState:a,useMultithreading:l,useGPU:d,isCalculating:c,gpuDataInvalidated:h}=r();if(H.bodyCount=t.length,H.mode=d?"GPU":l?"Worker":"CPU",n==="paused"||(l||d)&&c)return;const u=performance.now(),f=lo(s,r().useRealisticDistances),m=performance.now();if(!H.lastEnergyCheck||m-H.lastEnergyCheck>1e3){H.lastEnergyCheck=m;const g=p=>{const v=typeof p=="number"?{kinetic:0,potential:0,total:p}:p;(i<.1||H.energy.initial===0)&&(H.energy.initial=v.total);const S=H.energy.initial!==0?(v.total-H.energy.initial)/Math.abs(H.energy.initial):0;H.energy={...v,initial:H.energy.initial,drift:S}};if(l)St().calculateEnergy(t.length).then(p=>{g(p)});else{const p=Cr(t);g(p)}}if(d){e({isCalculating:!0});try{const g=Nr();g.isReady||await g.init(no.MAX_BODIES);const p=Math.ceil(f/wt),v=f/p;(h||!g.isReady)&&(await g.setBodies(t),e({gpuDataInvalidated:!1}));for(let x=0;x<p;x++)await g.step(v,t.length);const S=await g.getBodies(t.length);if(S){let x=t.map((M,P)=>{const w=P*12;return{...M,position:new z(S[w],S[w+1],S[w+2]),velocity:new z(S[w+4],S[w+5],S[w+6])}});const j=await g.getCollisions();if(j&&j.length>0){const{bodies:M,hasRemovals:P,collisionEvents:w}=Le(x,j);x=M,w&&w.length>0&&(w.forEach(R=>{r().addCollisionEvent({id:L(),position:R.collisionPoint,color:R.smallerBodyColor,startTime:performance.now()})}),We(w)),P&&e({physicsState:null,gpuDataInvalidated:!0})}e({bodies:x,physicsState:null,simulationTime:i+f,isCalculating:!1})}}catch(g){if(g instanceof Error&&(g.name==="AbortError"||g.message.includes("destroyed")))return;console.error("GPU Step Failed",g),e({isCalculating:!1,useGPU:!1})}}else if(l){e({isCalculating:!0});const g=St();(!a||a.count!==t.length)&&g.setBodies(t);const p=[];g.onCollision=v=>{p.push(...v)};try{await g.executeStep(t.length,f);const v=g.getPhysicsState(t.length);v.ids=t.map(x=>x.id);let S=vt(v,t);if(p.length>0){const{bodies:x,hasRemovals:j,collisionEvents:M}=Le(S,p);S=x,M&&M.length>0&&(M.forEach(P=>{r().addCollisionEvent({id:L(),position:P.collisionPoint,color:P.smallerBodyColor,startTime:performance.now()})}),We(M)),j&&e({physicsState:null})}e({bodies:S,physicsState:v,simulationTime:i+f,isCalculating:!1})}catch(v){console.warn("Worker Step Failed / Terminated",v),e({isCalculating:!1,useMultithreading:!1})}}else{let g=a;(!g||g.count!==t.length)&&(g=yr(t));const p=Math.ceil(f/wt),v=f/p;for(let w=0;w<p;w++)wr(g,v,!1,!1);let S=vt(g,t);const{positions:x,radii:j,masses:M}=g,P=[];for(let w=0;w<g.count;w++)if(!(M[w]<=0))for(let R=w+1;R<g.count;R++){if(M[R]<=0)continue;const k=w*3,y=R*3,b=x[k]-x[y],D=x[k+1]-x[y+1],I=x[k+2]-x[y+2],T=b*b+D*D+I*I,W=j[w]+j[R];T<(W*.8)**2&&P.push([w,R])}if(P.length>0){const{bodies:w,collisionEvents:R}=Le(S,P);S=w,R&&R.length>0&&(R.forEach(k=>{r().addCollisionEvent({id:L(),position:k.collisionPoint,color:k.smallerBodyColor,startTime:performance.now()})}),We(R)),e({physicsState:null})}e({bodies:S,physicsState:g,simulationTime:i+f})}H.physicsDuration=performance.now()-u},setSimulationState:t=>e({simulationState:t}),loadSolarSystem:()=>{$.clearAll(),N.getState().cleanup(),e({bodies:Je(),physicsState:null,timeScale:1,simulationState:"running",simulationTime:0,followingBodyId:null,selectedBodyId:null,cameraMode:"free",gpuDataInvalidated:!0,useRealisticDistances:!1,currentSystemId:"solar-system",currentSystemMode:null,tidallyDisruptedEvents:[],collisionEvents:[],supernovaEvents:[],supernovaScenario:ne(),resetToken:0,history:[],historyIndex:-1})},loadStarSystem:(t,n)=>{const s=Ge(t);if(!s)return;$.clearAll(),N.getState().cleanup();const i=s.createBodies(n).map(l=>({...l,id:L()})),a=n&&s.getCameraForMode?s.getCameraForMode(n):s.initialCamera;if(typeof window<"u"&&window.dispatchEvent(new CustomEvent("starSystemChanged",{detail:{systemId:t,mode:n,camera:a}})),e({bodies:i,currentSystemId:t,currentSystemMode:n||null,physicsState:null,timeScale:1,simulationState:"running",simulationTime:0,followingBodyId:null,selectedBodyId:null,cameraMode:"free",gpuDataInvalidated:!0,useRealisticDistances:!1,tidallyDisruptedEvents:[],collisionEvents:[],supernovaEvents:[],supernovaScenario:ne(),zenMode:!1,resetToken:0,history:[],historyIndex:-1}),s.scenario?.kind==="supernova"){const l=yt(i);l&&r().startSupernovaScenario(l,!0)}},toggleZenMode:()=>e(t=>({zenMode:!t.zenMode})),toggleLabMode:()=>e(t=>({labMode:!t.labMode})),setQualityLevel:t=>{typeof window<"u"&&localStorage.setItem("orbit-simulator-quality",t);let n=t;t==="auto"&&(n=bt()),e({qualityLevel:n})},setCameraShakeIntensity:t=>{const n=Math.max(0,Math.min(2,t));typeof window<"u"&&localStorage.setItem("orbit-simulator-camera-shake",String(n)),e({cameraShakeIntensity:n})},setUserMode:t=>{typeof window<"u"&&localStorage.setItem("orbit-simulator-user-mode",t),e({userMode:t})},setHasSeenOnboarding:t=>{typeof window<"u"&&localStorage.setItem("orbit-simulator-onboarding-seen",String(t)),e({hasSeenOnboarding:t})},setTimeScale:t=>e({timeScale:t}),togglePrediction:()=>e(t=>({showPrediction:!t.showPrediction})),toggleGrid:()=>e(t=>({showGrid:!t.showGrid})),toggleRealisticVisuals:()=>e(t=>({showRealisticVisuals:!t.showRealisticVisuals})),toggleHabitableZone:()=>e(t=>({showHabitableZone:!t.showHabitableZone})),togglePerformance:()=>e(t=>({showPerformance:!t.showPerformance})),setFollowingBody:t=>e({followingBodyId:t}),selectBody:t=>e({selectedBodyId:t}),setCameraMode:t=>e({cameraMode:t}),updateBody:(t,n)=>{const{bodies:s}=r(),i=s.map(a=>a.id===t?{...a,...n}:a);e({bodies:i,physicsState:null,gpuDataInvalidated:!0})},reset:()=>{const{currentSystemId:t,currentSystemMode:n,bodies:s,resetToken:i}=r(),a=t&&t!=="solar-system"?Ge(t):null;$.clearAll(),N.getState().cleanup();let l=Ct;t&&t!=="solar-system"?a&&(l=a.createBodies(n||void 0).map(f=>({...f,id:L()}))):l=Je();const d=new Map(s.map(f=>[f.name,f.id])),c=l.map(f=>d.has(f.name)?{...f,id:d.get(f.name)}:f),h=r().useRealisticDistances;let u=c;if(h){const f=Oe,m=1/Math.sqrt(f);u=u.map(g=>g.isFixed?g:{...g,position:new z(g.position.x*f,g.position.y*f,g.position.z*f),velocity:new z(g.velocity.x*m,g.velocity.y*m,g.velocity.z*m)})}if(e({bodies:u,physicsState:null,simulationTime:0,gpuDataInvalidated:!0,tidallyDisruptedEvents:[],collisionEvents:[],supernovaEvents:[],supernovaScenario:ne(),resetToken:i+1,showGravityField:!1,history:[],historyIndex:-1}),a?.scenario?.kind==="supernova"){const f=yt(u);f&&r().startSupernovaScenario(f,!0)}}}));typeof window<"u"&&(window.__physicsStore=C);const Fr=`
    attribute float size;
    attribute float temperature;
    attribute float velocity;
    attribute vec2 velocityDir;

    uniform float time;
    uniform float innerRadius;
    uniform float rotationSpeed;

    varying float vTemperature;
    varying float vDistance;
    varying float vVelocity;
    varying vec2 vVelocityDir;

    void main() {
        vTemperature = temperature;
        vVelocity = velocity;
        vVelocityDir = velocityDir;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vDistance = length(mvPosition.xyz);

        // Larger particles for stretched effect
        float stretchFactor = 1.0 + velocity * 0.5;
        gl_PointSize = size * stretchFactor * (300.0 / vDistance);
        gl_Position = projectionMatrix * mvPosition;
    }
`,Lr=`
    varying float vTemperature;
    varying float vDistance;
    varying float vVelocity;
    varying vec2 vVelocityDir;

    vec3 temperatureToColor(float t) {
        // Black body radiation approximation
        if (t > 0.85) {
            // Innermost: Blue-white (very hot)
            return vec3(0.6, 0.8, 1.0) * (1.0 + t * 0.5);
        } else if (t > 0.6) {
            // Hot: White-blue
            return vec3(0.9, 0.95, 1.0) * (0.8 + t * 0.4);
        } else if (t > 0.35) {
            // Medium: Yellow-white
            return vec3(1.0, 0.9, 0.7) * (0.7 + t * 0.3);
        } else if (t > 0.15) {
            // Cool: Orange
            return vec3(1.0, 0.6, 0.3) * (0.6 + t * 0.2);
        } else {
            // Outer: Red-orange (dim)
            return vec3(0.8, 0.3, 0.1) * (0.4 + t * 0.2);
        }
    }

    void main() {
        vec2 center = gl_PointCoord - vec2(0.5);

        // Stretch particle in velocity direction (gravitational dragging effect)
        float stretchAmount = 1.0 + vVelocity * 1.5;
        vec2 stretchDir = normalize(vVelocityDir + vec2(0.001));

        // Rotate and scale the coordinate to create elongated shape
        float cosA = stretchDir.x;
        float sinA = stretchDir.y;
        vec2 rotated = vec2(
            center.x * cosA + center.y * sinA,
            -center.x * sinA + center.y * cosA
        );

        // Compress along velocity direction, expand perpendicular
        rotated.x *= stretchAmount;
        rotated.y *= 1.0 / sqrt(stretchAmount);

        float dist = length(rotated);
        if (dist > 0.5) discard;

        // Tail effect - fade toward the back (opposite velocity direction)
        float tailFade = 1.0 - smoothstep(0.0, 0.4, rotated.x) * vVelocity * 0.5;

        // Soft edge
        float alpha = smoothstep(0.5, 0.15, dist) * tailFade;

        // Distance fade
        alpha *= clamp(1.0 - vDistance / 600.0, 0.2, 1.0);

        vec3 color = temperatureToColor(vTemperature);

        // Brighter core, dimmer tail
        float coreBrightness = smoothstep(0.3, 0.0, dist);
        float glow = 1.0 + coreBrightness * 0.4;

        gl_FragColor = vec4(color * glow, alpha * 0.85);
    }
`,Or=`
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);

        gl_Position = projectionMatrix * mvPosition;
    }
`,Gr=`
    uniform float time;

    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;

    void main() {
        // Fresnel effect for edge glow
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.0);

        // Static brightness
        float pulse = 1.0;
        float hotspot = 1.0;

        // Core brightness
        float core = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

        float intensity = (fresnel * 0.5 + core * 0.8) * pulse * hotspot;

        // Color: bright yellow-white core with orange-red edges
        vec3 coreColor = vec3(1.0, 0.95, 0.8);
        vec3 edgeColor = vec3(1.0, 0.6, 0.3);
        vec3 color = mix(edgeColor, coreColor, core);

        gl_FragColor = vec4(color * intensity * 1.5, intensity * 0.9);
    }
`,Wr=`
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
    }
`,Hr=`
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
        // Pure black center with very subtle edge highlight
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 4.0);

        // Extremely subtle purple-ish edge (frame dragging hint)
        vec3 edgeColor = vec3(0.1, 0.05, 0.15) * fresnel;

        // Mostly black
        gl_FragColor = vec4(edgeColor, 1.0);
    }
`,Vr=({position:e,innerRadius:r,outerRadius:t,rotationSpeed:n=1,particleCount:s,tilt:i=.1})=>{const a=_.useRef(null),l=_.useRef(null),d=_.useRef(null),c=_.useRef(null),h=_.useRef(null),u=C(j=>j.simulationState),f=C(j=>j.qualityLevel);ve();const m=s??xe(f).accretionDiskParticles,{geometry:g,material:p}=_.useMemo(()=>{const j=new Ie,M=new Float32Array(m*3),P=new Float32Array(m),w=new Float32Array(m),R=new Float32Array(m),k=new Float32Array(m*2),y=new Float32Array(m),b=new Float32Array(m),D=new Float32Array(m);for(let T=0;T<m;T++){const W=Math.random(),E=r+(t-r)*Math.pow(W,.35),F=Math.random()*Math.PI*2,q=(E-r)/(t-r),ye=q*t*.06,be=(Math.random()-.5)*ye,ee=Math.cos(F)*E,Ee=Math.sin(F)*E;M[T*3]=ee,M[T*3+1]=be,M[T*3+2]=Ee,y[T]=F,b[T]=E,D[T]=E;const Ae=(1-q)*.8;R[T]=Ae;const ie=F+Math.PI/2;k[T*2]=Math.cos(ie),k[T*2+1]=Math.sin(ie);const Ne=1-q;w[T]=Ne,P[T]=.8+q*1.8}j.setAttribute("position",new O(M,3)),j.setAttribute("size",new O(P,1)),j.setAttribute("temperature",new O(w,1)),j.setAttribute("velocity",new O(R,1)),j.setAttribute("velocityDir",new O(k,2)),l.current=y,d.current=b,c.current=D;const I=new we({vertexShader:Fr,fragmentShader:Lr,uniforms:{time:{value:0},innerRadius:{value:r},rotationSpeed:{value:n}},transparent:!0,blending:G,depthWrite:!1});return{geometry:j,material:I}},[r,t,m,n]),v=_.useMemo(()=>new we({vertexShader:Or,fragmentShader:Gr,uniforms:{time:{value:0}},transparent:!0,blending:G,depthWrite:!1,side:Q}),[]),S=_.useMemo(()=>new we({vertexShader:Wr,fragmentShader:Hr,uniforms:{}}),[]);U((j,M)=>{if(!a.current||!l.current||!d.current||!c.current||u!=="running")return;const P=g.attributes.position.array,w=g.attributes.velocity.array,R=g.attributes.velocityDir.array,k=g.attributes.temperature.array,y=g.attributes.size.array,b=l.current,D=d.current,I=c.current;p.uniforms.time.value=j.clock.elapsedTime,v.uniforms.time.value=j.clock.elapsedTime;const T=.15,W=.02;for(let E=0;E<m;E++){let F=D[E];const q=Math.max(0,(F-r)/(t-r)),ye=1+(1-q)*2,be=n*T*ye*(r/F);b[E]+=be*M;const ee=W*(1+(1-q)*2);F-=ee*M,D[E]=F,F<=r*.9&&(D[E]=I[E],F=I[E],b[E]=Math.random()*Math.PI*2);const Ee=Math.cos(b[E])*F,Ae=Math.sin(b[E])*F;P[E*3]=Ee,P[E*3+2]=Ae;const ie=(F-r)/(t-r),Ne=Math.min(1,(1-ie)*1.2);w[E]=Ne;const lt=b[E]+Math.PI/2,ct=b[E]+Math.PI,Me=.15,Ue=Math.cos(lt)*(1-Me)+Math.cos(ct)*Me,Fe=Math.sin(lt)*(1-Me)+Math.sin(ct)*Me,dt=Math.sqrt(Ue*Ue+Fe*Fe);R[E*2]=Ue/dt,R[E*2+1]=Fe/dt,k[E]=1-ie,y[E]=.8+ie*1.8}g.attributes.position.needsUpdate=!0,g.attributes.velocity.needsUpdate=!0,g.attributes.velocityDir.needsUpdate=!0,g.attributes.temperature.needsUpdate=!0,g.attributes.size.needsUpdate=!0});const x=r*.5;return o.jsxs("group",{ref:h,position:[e.x,e.y,e.z],rotation:[i,0,0],children:[o.jsx("points",{ref:a,geometry:g,material:p}),o.jsxs("mesh",{rotation:[Math.PI/2,0,0],children:[o.jsx("torusGeometry",{args:[x,x*.15,16,64]}),o.jsx("primitive",{object:v,attach:"material"})]}),o.jsxs("mesh",{rotation:[Math.PI/2,0,0],children:[o.jsx("torusGeometry",{args:[x*.7,x*.08,12,48]}),o.jsx("meshBasicMaterial",{color:"#ffffff",transparent:!0,opacity:.4,blending:G})]}),o.jsxs("mesh",{children:[o.jsx("sphereGeometry",{args:[r*.6,32,16]}),o.jsx("meshBasicMaterial",{color:"#ffddaa",transparent:!0,opacity:.25,blending:G})]}),o.jsxs("mesh",{children:[o.jsx("sphereGeometry",{args:[r*.25,32,32]}),o.jsx("primitive",{object:S,attach:"material"})]}),o.jsxs("mesh",{children:[o.jsx("sphereGeometry",{args:[r*.35,32,32]}),o.jsx("meshBasicMaterial",{color:"#000000",transparent:!0,opacity:.95})]})]})},qr=`
    attribute float size;
    attribute float alpha;

    varying float vAlpha;

    void main() {
        vAlpha = alpha;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float distance = length(mvPosition.xyz);

        gl_PointSize = size * (200.0 / distance);
        gl_Position = projectionMatrix * mvPosition;
    }
`,$r=`
    uniform vec3 jetColor;
    varying float vAlpha;

    void main() {
        // Circular particle
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        if (dist > 0.5) discard;

        // Soft glow
        float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;

        // Core is brighter
        float core = smoothstep(0.3, 0.0, dist);
        vec3 color = jetColor + vec3(core * 0.5);

        gl_FragColor = vec4(color, alpha);
    }
`,Zr=({position:e,length:r,baseWidth:t,particleCount:n=8e3,speed:s=1,color:i="#4488ff"})=>{const a=_.useRef(null),l=_.useRef(null),d=_.useRef(null),c=_.useRef(null),h=_.useRef(null),u=C(g=>g.simulationState),{geometry:f,material:m}=_.useMemo(()=>{const g=new Ie,p=new Float32Array(n*3),v=new Float32Array(n),S=new Float32Array(n),x=new Float32Array(n),j=new Float32Array(n),M=new Float32Array(n),P=new Float32Array(n),w=n/2;for(let k=0;k<n;k++){const y=k<w?1:-1,b=Math.random();x[k]=b,P[k]=.5+Math.random();const D=t*(.1+b*.5),I=Math.random()*Math.PI*2,T=Math.random()*D;j[k]=T,M[k]=I;const W=Math.cos(I)*T,E=b*r*y,F=Math.sin(I)*T;p[k*3]=W,p[k*3+1]=E,p[k*3+2]=F,v[k]=2*(1-b*.7),S[k]=.8*(1-b*.6)}g.setAttribute("position",new O(p,3)),g.setAttribute("size",new O(v,1)),g.setAttribute("alpha",new O(S,1)),l.current=x,d.current=j,c.current=M,h.current=P;const R=new we({vertexShader:qr,fragmentShader:$r,uniforms:{jetColor:{value:new A(i)}},transparent:!0,blending:G,depthWrite:!1});return{geometry:g,material:R}},[r,t,n,i]);return U((g,p)=>{if(!a.current||!l.current||!d.current||!c.current||!h.current||u!=="running")return;const v=f.attributes.position.array,S=f.attributes.alpha.array,x=f.attributes.size.array,j=l.current,M=d.current,P=c.current,w=h.current,R=n/2;for(let k=0;k<n;k++){const y=k<R?1:-1;j[k]+=p*s*.3*w[k],j[k]>1&&(j[k]=0,M[k]=Math.random()*t*.1,P[k]=Math.random()*Math.PI*2,w[k]=.5+Math.random());const b=j[k],D=M[k]*(.5+b*1.5),I=Math.cos(P[k])*D,T=b*r*y,W=Math.sin(P[k])*D;v[k*3]=I,v[k*3+1]=T,v[k*3+2]=W,S[k]=.8*(1-b*.7),x[k]=2*(1-b*.5)}f.attributes.position.needsUpdate=!0,f.attributes.alpha.needsUpdate=!0,f.attributes.size.needsUpdate=!0}),o.jsxs("group",{position:[e.x,e.y,e.z],children:[o.jsx("points",{ref:a,geometry:f,material:m}),o.jsxs("mesh",{children:[o.jsx("sphereGeometry",{args:[t*.3,16,8]}),o.jsx("meshBasicMaterial",{color:i,transparent:!0,opacity:.5,blending:G})]})]})},_e=`
    // High-quality 3D noise functions
    vec3 hash3(vec3 p) {
        p = fract(p * vec3(443.897, 441.423, 437.195));
        p += dot(p, p.yzx + 19.19);
        return fract((p.xxy + p.yxx) * p.zyx);
    }

    float hash(vec2 p) {
        return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
    }

    // 3D Perlin-like noise
    float noise3D(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        return mix(
            mix(mix(hash(i.xy + i.z * 1.0), hash(i.xy + vec2(1.0, 0.0) + i.z * 1.0), f.x),
                mix(hash(i.xy + vec2(0.0, 1.0) + i.z * 1.0), hash(i.xy + 1.0 + i.z * 1.0), f.x), f.y),
            mix(mix(hash(i.xy + (i.z + 1.0) * 1.0), hash(i.xy + vec2(1.0, 0.0) + (i.z + 1.0) * 1.0), f.x),
                mix(hash(i.xy + vec2(0.0, 1.0) + (i.z + 1.0) * 1.0), hash(i.xy + 1.0 + (i.z + 1.0) * 1.0), f.x), f.y),
            f.z
        );
    }

    float noise(vec2 x) {
        vec2 i = floor(x);
        vec2 f = fract(x);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    // Optimized FBM (reduced octaves for performance)
    float fbm(vec2 x) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 5; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    // 3D FBM for spherical surfaces (reduced octaves)
    float fbm3D(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; ++i) {
            v += a * noise3D(p);
            p = p * 2.0 + vec3(100.0);
            a *= 0.5;
        }
        return v;
    }

    // Ridged multifractal noise (output: 0.0 - 1.0)
    float ridgedNoise(vec2 p) {
        float n = fbm(p);
        n = abs(n * 2.0 - 1.0);  // Ensure 0-1 range
        return clamp(1.0 - n, 0.0, 1.0);
    }
`,Yr={vertexShader:`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,fragmentShader:`
        uniform vec3 baseColor;
        uniform vec3 secondaryColor;  // Ocean color
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        ${_e}

        void main() {
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            vec3 lightDir = normalize(-vWorldPosition); // Sun is at 0,0,0
            float NdotL = max(dot(vNormal, lightDir), 0.0);

            // Use 3D noise on sphere surface for better pattern
            vec3 spherePos = normalize(vWorldPosition) * 5.0;

            // Multi-layered continent formation
            float continentBase = fbm3D(spherePos * 0.8);
            float continentDetail = fbm3D(spherePos * 2.5);
            float mountains = ridgedNoise(vUv * 15.0) * 0.3;

            // Combine for realistic landmass
            float landHeight = continentBase * 0.7 + continentDetail * 0.3 + mountains * continentBase;

            // Sharp but natural coastline
            float coastline = smoothstep(0.46, 0.54, landHeight);

            // Terrain color variation
            vec3 landColor = mix(
                baseColor * 0.5,  // Lowlands (dark green/brown)
                baseColor * 1.2,  // Highlands (bright)
                smoothstep(0.5, 0.7, landHeight)
            );

            // Desert regions (low latitude, low moisture)
            float desertNoise = fbm3D(spherePos * 1.5);
            float latitude = abs(vUv.y - 0.5) * 2.0;
            float desert = smoothstep(0.3, 0.5, desertNoise) * smoothstep(0.6, 0.3, latitude);
            landColor = mix(landColor, vec3(0.8, 0.7, 0.5), desert * coastline);

            // Ocean depth variation
            vec3 deepOcean = secondaryColor * 0.6;
            vec3 shallowOcean = secondaryColor * 1.3;
            float oceanDepth = smoothstep(0.3, 0.5, landHeight);
            vec3 oceanVariation = mix(deepOcean, shallowOcean, oceanDepth);

            vec3 surfaceColor = mix(oceanVariation, landColor, coastline);

            // Enhanced ocean specular
            vec3 reflectDir = reflect(-lightDir, vNormal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);
            float roughWater = noise(vUv * 100.0 + time * 0.1) * 0.5 + 0.5;
            surfaceColor += vec3(0.9, 1.0, 1.0) * spec * (1.0 - coastline) * NdotL * roughWater;

            // Multi-layer cloud system
            float cloudTime = time * 0.015;

            // Large cloud masses
            float cloudLayer1 = fbm(vUv * 8.0 + vec2(cloudTime, 0.0));
            // Small cumulus
            float cloudLayer2 = fbm(vUv * 25.0 + vec2(cloudTime * 1.5, cloudTime * 0.3));
            // Cirrus (high altitude)
            float cloudLayer3 = fbm(vUv * 18.0 - vec2(cloudTime * 0.8, 0.0));

            // Combine cloud layers
            float clouds = cloudLayer1 * 0.5 + cloudLayer2 * 0.3 + cloudLayer3 * 0.2;

            // Cloud formation follows temperature/moisture patterns (static distribution)
            float cloudProbability = smoothstep(0.3, 0.7, fbm3D(spherePos * 1.2));
            clouds *= cloudProbability;

            float cloudAlpha = smoothstep(0.35, 0.7, clouds);

            // Soft cloud shadows with distance falloff
            float shadowTimeOffset = 0.008;
            float cloudShadowRaw = fbm(vUv * 8.0 + vec2(cloudTime - shadowTimeOffset, 0.0));
            float cloudShadow = smoothstep(0.35, 0.7, cloudShadowRaw) * 0.5;

            // Apply shadow to surface
            surfaceColor = mix(surfaceColor, surfaceColor * 0.55, cloudShadow * (1.0 - cloudAlpha) * NdotL);

            // Cloud color varies with lighting
            vec3 cloudColor = mix(vec3(0.85, 0.9, 0.95), vec3(1.0, 1.0, 1.0), NdotL);
            surfaceColor = mix(surfaceColor, cloudColor, cloudAlpha * 0.95);

            // Day/Night terminator
            float night = 1.0 - smoothstep(-0.15, 0.15, dot(vNormal, lightDir));

            // Realistic city lights (clustered, grid-like in some areas)
            float cityGrid = noise(vUv * 80.0) * noise(vUv * 40.0);
            float population = fbm(vUv * 25.0);
            float cities = smoothstep(0.65, 0.85, population) * smoothstep(0.5, 0.7, cityGrid);
            vec3 cityLights = vec3(1.0, 0.85, 0.6) * cities * coastline * 3.0;

            vec3 ambient = vec3(0.015, 0.02, 0.025); // Slight blue ambient
            vec3 finalColor = surfaceColor * (NdotL + ambient) + cityLights * night * (1.0 - cloudAlpha * 0.8);

            // Enhanced atmospheric scattering
            float viewIncidence = max(dot(viewDir, vNormal), 0.0);
            float fresnel = pow(1.0 - viewIncidence, 3.5);

            // Rayleigh scattering (blue sky)
            vec3 atmosDay = vec3(0.3, 0.5, 0.9);
            // Sunset/sunrise (Mie scattering)
            vec3 atmosSunset = vec3(1.0, 0.6, 0.3);

            // Terminator zone detection
            float terminatorZone = 1.0 - abs(dot(vNormal, lightDir));
            terminatorZone = pow(terminatorZone, 3.0);

            vec3 atmosColor = mix(atmosDay, atmosSunset, terminatorZone * 0.8);

            // Atmosphere visibility: brighter on day side, thinner on night
            float atmosIntensity = fresnel * (0.5 + 0.5 * smoothstep(-0.2, 0.5, NdotL));

            finalColor += atmosColor * atmosIntensity * 0.6;

            // Subtle atmospheric glow at limb
            float limbGlow = pow(1.0 - viewIncidence, 8.0) * (NdotL + 0.3);
            finalColor += atmosDay * limbGlow * 0.3;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `},Xr={vertexShader:`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,fragmentShader:`
        uniform vec3 baseColor;
        uniform vec3 secondaryColor;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        ${_e}

        void main() {
            vec3 lightDir = normalize(-vWorldPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float NdotL = max(dot(vNormal, lightDir), 0.0);

            // Latitude-based band structure
            float latitude = (vUv.y - 0.5) * 2.0; // -1 to 1
            float latitudeBands = sin(latitude * 12.0) * 0.5 + 0.5;

            // Multi-scale turbulence with different velocities per latitude
            // Fast equatorial jets, slower mid-latitudes
            float jetSpeed = (1.0 - abs(latitude)) * 2.0 + 0.5;
            vec2 windOffset = vec2(time * 0.03 * jetSpeed, 0.0);

            // Domain warping for realistic fluid dynamics
            vec2 warp1 = vec2(
                fbm(vUv * 2.5 + windOffset * 0.8),
                fbm(vUv * 2.5 + windOffset * 0.8 + 100.0)
            ) * 2.0;

            vec2 warp2 = vec2(
                fbm(vUv * 4.0 + warp1 + windOffset),
                fbm(vUv * 4.0 + warp1 + windOffset + 200.0)
            ) * 1.5;

            // Final turbulent flow pattern
            float turbulence = fbm(vUv * vec2(12.0, 35.0) + warp2 + windOffset * 1.5);

            // Combine latitude bands with turbulence
            float bandPattern = sin(latitude * 15.0 + turbulence * 3.0 + warp1.x * 2.0);
            float bandFactor = smoothstep(-0.6, 0.6, bandPattern);

            // Three-color gradient for richer appearance
            vec3 darkBand = baseColor * 0.6;
            vec3 midBand = mix(baseColor, secondaryColor, 0.5);
            vec3 lightBand = secondaryColor * 1.2;

            vec3 color = mix(darkBand, midBand, bandFactor);
            color = mix(color, lightBand, smoothstep(0.6, 0.8, bandFactor));

            // Great Red Spot / Storm features
            // Vortex shape using distance from center
            vec2 stormCenter = vec2(0.3, 0.4); // Position on texture
            vec2 stormUV = vUv - stormCenter;

            // Rotating vortex pattern
            float stormAngle = atan(stormUV.y, stormUV.x) + time * 0.1;
            float stormDist = length(stormUV * vec2(2.5, 1.0)); // Oval shape

            float vortexPattern = sin(stormAngle * 3.0 - stormDist * 15.0) * 0.5 + 0.5;
            float stormMask = smoothstep(0.15, 0.08, stormDist) * smoothstep(0.02, 0.08, stormDist);

            // Storm color (reddish for Jupiter-like)
            vec3 stormColor = vec3(0.9, 0.5, 0.4) * (0.8 + vortexPattern * 0.4);
            color = mix(color, stormColor, stormMask * 0.85);

            // Smaller storm cells scattered across bands
            float smallStorms = fbm(vUv * 15.0 + windOffset * 2.0);
            float stormCells = smoothstep(0.7, 0.85, smallStorms);
            color = mix(color, secondaryColor * 0.7, stormCells * 0.3);

            // Polar darkening and color shift
            float polarDarkening = smoothstep(0.5, 0.95, abs(latitude));
            color *= (1.0 - polarDarkening * 0.4);
            color = mix(color, color * vec3(0.8, 0.85, 0.9), polarDarkening * 0.3); // Bluish poles

            // Atmospheric depth - thicker atmosphere scatters more light
            float atmosphereDepth = smoothstep(-0.4, 0.8, NdotL);
            color *= atmosphereDepth * 0.85 + 0.15;

            // Limb darkening (gas giants have thick atmospheres)
            float viewIncidence = max(dot(viewDir, vNormal), 0.0);
            float limbDarkening = pow(viewIncidence, 0.6);
            color *= mix(0.4, 1.0, limbDarkening);

            // Fresnel atmospheric glow
            float fresnel = pow(1.0 - viewIncidence, 2.5);
            vec3 atmosGlow = mix(baseColor, secondaryColor, 0.7) * 0.8;
            color += atmosGlow * fresnel * (NdotL * 0.5 + 0.3);

            // Slight color variation for visual interest
            float colorNoise = fbm3D(normalize(vWorldPosition) * 8.0) * 0.1;
            color *= 1.0 + colorNoise;

            gl_FragColor = vec4(color, 1.0);
        }
    `},Kr={vertexShader:`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,fragmentShader:`
        uniform vec3 baseColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        ${_e}

        // Enhanced Voronoi noise for realistic craters
        vec2 voronoiPoint(vec2 cell) {
            vec2 p = fract(sin(vec2(dot(cell, vec2(127.1, 311.7)), dot(cell, vec2(269.5, 183.3)))) * 43758.5453);
            return p;
        }

        float voronoiDistance(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);

            float minDist = 1.0;

            for(int y = -1; y <= 1; y++) {
                for(int x = -1; x <= 1; x++) {
                    vec2 neighbor = vec2(float(x), float(y));
                    vec2 point = voronoiPoint(i + neighbor);
                    vec2 diff = neighbor + point - f;
                    float dist = length(diff);

                    minDist = min(minDist, dist);
                }
            }

            return minDist;
        }

        void main() {
            vec3 lightDir = normalize(-vWorldPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);

            // Use 3D position for seamless textures
            vec3 spherePos = normalize(vWorldPosition) * 8.0;

            // Multi-scale terrain features
            float largeTerrain = fbm3D(spherePos * 0.5); // Large-scale elevation
            float mediumTerrain = fbm3D(spherePos * 1.5); // Medium hills
            float fineTerrain = fbm3D(spherePos * 4.0); // Fine detail

            float terrain = largeTerrain * 0.5 + mediumTerrain * 0.3 + fineTerrain * 0.2;

            // Multi-scale crater system
            float largeCraters = voronoiDistance(vUv * 8.0);
            float mediumCraters = voronoiDistance(vUv * 20.0);
            float smallCraters = voronoiDistance(vUv * 45.0);

            // Combine craters with different probabilities
            float craterProb1 = smoothstep(0.15, 0.25, largeCraters);
            float craterProb2 = smoothstep(0.12, 0.18, mediumCraters);
            float craterProb3 = smoothstep(0.08, 0.12, smallCraters);

            // Deep crater bowl
            float craterDepth1 = 1.0 - smoothstep(0.0, 0.15, largeCraters);
            float craterDepth2 = 1.0 - smoothstep(0.0, 0.12, mediumCraters) * 0.7;
            float craterDepth3 = 1.0 - smoothstep(0.0, 0.08, smallCraters) * 0.4;

            float totalCraterDepth = max(craterDepth1, max(craterDepth2, craterDepth3));

            // Sharp crater rims
            float rim1 = smoothstep(0.13, 0.15, largeCraters) - smoothstep(0.15, 0.18, largeCraters);
            float rim2 = smoothstep(0.10, 0.12, mediumCraters) - smoothstep(0.12, 0.14, mediumCraters);
            float rim3 = smoothstep(0.06, 0.08, smallCraters) - smoothstep(0.08, 0.10, smallCraters);

            float craterRims = rim1 + rim2 * 0.7 + rim3 * 0.4;

            // Height map combining all features
            float height = terrain * 0.4 - totalCraterDepth * 0.8;

            // Normal map calculation using height
            float d = 0.002;
            float hx = terrain * 0.4 - max(
                1.0 - smoothstep(0.0, 0.15, voronoiDistance((vUv + vec2(d, 0.0)) * 8.0)),
                max(
                    (1.0 - smoothstep(0.0, 0.12, voronoiDistance((vUv + vec2(d, 0.0)) * 20.0))) * 0.7,
                    (1.0 - smoothstep(0.0, 0.08, voronoiDistance((vUv + vec2(d, 0.0)) * 45.0))) * 0.4
                )
            ) * 0.8;

            float hy = terrain * 0.4 - max(
                1.0 - smoothstep(0.0, 0.15, voronoiDistance((vUv + vec2(0.0, d)) * 8.0)),
                max(
                    (1.0 - smoothstep(0.0, 0.12, voronoiDistance((vUv + vec2(0.0, d)) * 20.0))) * 0.7,
                    (1.0 - smoothstep(0.0, 0.08, voronoiDistance((vUv + vec2(0.0, d)) * 45.0))) * 0.4
                )
            ) * 0.8;

            vec3 normalOffset = vec3((height - hx) / d, (height - hy) / d, 1.0);
            vec3 perturbedNormal = normalize(vNormal + normalOffset * 0.3);

            float NdotL = max(dot(perturbedNormal, lightDir), 0.0);

            // Color variations
            vec3 highlandsColor = baseColor * (0.9 + terrain * 0.3);
            vec3 lowlandsColor = baseColor * 0.5;
            vec3 dustColor = baseColor * vec3(0.8, 0.7, 0.6);

            // Terrain-based color
            vec3 surfaceColor = mix(lowlandsColor, highlandsColor, smoothstep(0.3, 0.7, terrain));

            // Crater floors are darker and different material (reduced effect)
            vec3 craterFloorColor = baseColor * 0.6;
            surfaceColor = mix(surfaceColor, craterFloorColor, totalCraterDepth * 0.5);

            // Add dust accumulation in low areas (reduced)
            float dustAccumulation = fbm3D(spherePos * 3.0) * (1.0 - terrain);
            surfaceColor = mix(surfaceColor, dustColor, dustAccumulation * 0.2);

            // Bright rim highlights (reduced)
            surfaceColor += vec3(0.4, 0.35, 0.3) * craterRims * NdotL;

            // Rocky texture detail (reduced)
            float rockDetail = noise(vUv * 150.0) * 0.08;
            surfaceColor *= 1.0 + rockDetail;

            // Enhanced lighting with subsurface scattering approximation
            float subsurface = pow(max(0.0, dot(perturbedNormal, lightDir) + 0.4) / 1.4, 2.0) * 0.3;
            vec3 ambient = vec3(0.08, 0.08, 0.09);  // Increased ambient for visibility

            vec3 color = surfaceColor * (NdotL * 0.9 + subsurface + ambient);

            // Atmospheric haze (thin atmosphere like Mars)
            float viewIncidence = max(dot(viewDir, vNormal), 0.0);
            float fresnel = pow(1.0 - viewIncidence, 5.0);

            vec3 dustAtmosphere = vec3(0.9, 0.6, 0.4); // Reddish/orange dust
            float atmosVisibility = fresnel * (NdotL * 0.7 + 0.2);

            color += dustAtmosphere * atmosVisibility * 0.15;

            gl_FragColor = vec4(color, 1.0);
        }
    `},Jr={vertexShader:`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,fragmentShader:`
        uniform vec3 baseColor; // Usually white
        uniform vec3 secondaryColor; // Blue/Teal
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        ${_e}

        void main() {
            vec3 lightDir = normalize(-vWorldPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);

            // 3D ice surface features
            vec3 spherePos = normalize(vWorldPosition) * 6.0;

            // Multi-layered ice texture
            float iceBase = fbm3D(spherePos * 0.8);
            float iceDetail = fbm3D(spherePos * 3.0);
            float iceFine = noise3D(spherePos * 8.0);

            float icePattern = iceBase * 0.5 + iceDetail * 0.3 + iceFine * 0.2;

            // Complex crack network (Ridged multifractal)
            float crack1 = ridgedNoise(vUv * 15.0);
            float crack2 = ridgedNoise(vUv * 30.0);
            float crack3 = ridgedNoise(vUv * 60.0);

            // Combine cracks at different scales
            float crackPattern = crack1 * 0.5 + crack2 * 0.3 + crack3 * 0.2;
            crackPattern = pow(crackPattern, 6.0); // Sharpen cracks

            // Deep crevasses
            float deepCracks = pow(crack1, 12.0);

            // Calculate perturbed normal from cracks
            float d = 0.003;
            float hx = ridgedNoise((vUv + vec2(d, 0.0)) * 15.0);
            float hy = ridgedNoise((vUv + vec2(0.0, d)) * 15.0);

            vec3 crackNormal = normalize(vec3(
                (crack1 - hx) / d * 2.0,
                (crack1 - hy) / d * 2.0,
                1.0
            ));

            vec3 normal = normalize(mix(vNormal, crackNormal, crackPattern * 0.6));

            float NdotL = max(dot(normal, lightDir), 0.0);

            // Advanced subsurface scattering
            // Ice transmits blue light
            float wrap = 0.6;
            float scatter = max(0.0, (dot(normal, lightDir) + wrap) / (1.0 + wrap));
            float backscatter = pow(max(0.0, dot(-lightDir, viewDir)), 4.0);

            // Ice color variations
            vec3 pureIce = vec3(0.95, 0.98, 1.0);
            vec3 deepIce = vec3(0.7, 0.85, 0.95);
            vec3 ancientIce = baseColor * vec3(0.9, 0.95, 1.0);

            // Mix ice types based on pattern
            vec3 iceColor = mix(pureIce, deepIce, icePattern);
            iceColor = mix(iceColor, ancientIce, smoothstep(0.3, 0.7, iceBase));

            // Cracks expose deeper, bluer ice
            vec3 crackColor = secondaryColor * 0.8;
            vec3 deepCrackColor = secondaryColor * 0.5;

            vec3 color = mix(iceColor, crackColor, crackPattern * 0.7);
            color = mix(color, deepCrackColor, deepCracks);

            // Direct lighting
            vec3 directLight = vec3(1.0) * NdotL;

            // Subsurface scattering (blue tint)
            vec3 scatterColor = vec3(0.6, 0.8, 1.0);
            vec3 scatterLight = scatterColor * pow(scatter, 1.5) * 0.6;

            // Backscattering glow
            vec3 backscatterLight = scatterColor * backscatter * 0.4 * (1.0 - NdotL);

            vec3 ambient = vec3(0.08, 0.1, 0.12); // Slight blue ambient
            color *= (directLight * 0.9 + ambient);
            color += scatterLight + backscatterLight;

            // Enhanced specular highlights (ice is very reflective)
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);

            // Rough ice vs smooth ice
            float roughness = icePattern * 0.5 + 0.5;
            float smoothSpec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);

            color += vec3(0.9, 0.95, 1.0) * (spec * roughness + smoothSpec * (1.0 - roughness)) * NdotL;

            // Fresnel reflection
            float viewIncidence = max(dot(viewDir, normal), 0.0);
            float fresnel = pow(1.0 - viewIncidence, 4.0);

            // Ice rim glow
            vec3 fresnelColor = vec3(0.7, 0.9, 1.0);
            color += fresnelColor * fresnel * 0.3;

            // Atmospheric ice crystals halo
            float atmosphereGlow = pow(1.0 - viewIncidence, 6.0) * (NdotL + 0.2);
            color += fresnelColor * atmosphereGlow * 0.2;

            gl_FragColor = vec4(color, 1.0);
        }
    `},Qr={vertexShader:`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,fragmentShader:`
        uniform vec3 baseColor; // Dark crust
        uniform vec3 secondaryColor; // Orange/Red Lava
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        ${_e}

        void main() {
            vec3 lightDir = normalize(-vWorldPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float NdotL = max(dot(vNormal, lightDir), 0.0);

            // Multi-stage domain warping for realistic lava flow
            vec2 flowDir = vec2(1.0, 0.3); // Main flow direction

            // First warp layer
            vec2 q = vec2(
                fbm(vUv * 1.5 + vec2(time * 0.015, time * 0.008)),
                fbm(vUv * 1.5 + vec2(-time * 0.012, time * 0.01))
            );

            // Second warp layer
            vec2 r = vec2(
                fbm(vUv * 2.5 + 3.0 * q + flowDir * time * 0.025),
                fbm(vUv * 2.5 + 3.0 * q - flowDir * time * 0.02)
            );

            // Third warp for fine detail
            vec2 s = vec2(
                fbm(vUv * 4.0 + 2.0 * r + flowDir * time * 0.04),
                fbm(vUv * 4.0 + 2.0 * r)
            );

            // Final flow pattern
            float flowPattern = fbm(vUv * 5.0 + 3.0 * s + flowDir * time * 0.03);

            // Crust formation (cooled lava)
            float crustBase = fbm(vUv * 8.0 + q * 0.5);
            float crustDetail = noise(vUv * 40.0);

            // Dynamic crust (changes slowly over time)
            float crustMask = smoothstep(0.3, 0.7, flowPattern + crustBase * 0.3);

            // Lava river network
            float rivers = ridgedNoise(vUv * 12.0 + r * 2.0);
            rivers = pow(rivers, 4.0);

            // Active lava veins
            float veins = smoothstep(0.6, 0.9, flowPattern) * (1.0 - crustMask);

            // Heat intensity with pulsing (use stable temperature base)
            float tempBase = flowPattern * 0.5 + rivers * 0.3 + veins * 0.2;
            float heatPulse1 = sin(time * 2.0 + tempBase * 10.0) * 0.5 + 0.5;
            float heatPulse2 = sin(time * 3.5 + vUv.x * 15.0) * 0.5 + 0.5;
            float combinedPulse = mix(heatPulse1, heatPulse2, 0.5);

            // Lava color gradient (hot to cool)
            vec3 whitehot = vec3(1.5, 1.4, 1.2);  // Extreme heat
            vec3 yellowhot = vec3(1.3, 1.0, 0.4); // Very hot
            vec3 orangehot = secondaryColor * 1.5; // Hot
            vec3 redhot = secondaryColor * 0.8;    // Cooling

            // Temperature variation with pulse
            float temperature = tempBase * 0.7 + combinedPulse * 0.3;

            // Mix lava colors based on temperature
            vec3 lavaColor = mix(redhot, orangehot, smoothstep(0.3, 0.5, temperature));
            lavaColor = mix(lavaColor, yellowhot, smoothstep(0.5, 0.7, temperature));
            lavaColor = mix(lavaColor, whitehot, smoothstep(0.7, 0.9, temperature));

            // Extra bright hotspots
            float hotspots = pow(rivers, 8.0) * (1.0 - crustMask);
            lavaColor += whitehot * hotspots * 3.0 * combinedPulse;

            // Crust color and texture
            vec3 freshCrust = baseColor * 0.7; // Dark, recently cooled
            vec3 oldCrust = baseColor * 0.3;   // Very dark, old crust
            vec3 crackGlow = orangehot * 0.5;  // Glow from cracks

            float crustAge = fbm(vUv * 6.0);
            vec3 crustColor = mix(freshCrust, oldCrust, crustAge);

            // Add texture detail to crust
            crustColor *= 0.8 + crustDetail * 0.4;

            // Cracks in crust showing underlying lava
            float cracks = pow(ridgedNoise(vUv * 25.0 + q), 10.0);
            crustColor = mix(crustColor, crackGlow, cracks * 0.6);

            // Mix lava and crust
            vec3 color = mix(lavaColor, crustColor, crustMask);

            // Crust respects lighting, lava emits light
            float crustLighting = NdotL * 0.8 + 0.2;
            color = mix(color, color * crustLighting, crustMask);

            // Heat haze effect at edges
            float viewIncidence = max(dot(viewDir, vNormal), 0.0);
            float heatGlow = pow(1.0 - viewIncidence, 3.0) * (1.0 - crustMask);
            color += orangehot * heatGlow * 0.5;

            // Add emissive boost for bloom
            color *= (1.0 - crustMask) * 0.5 + 1.0;

            gl_FragColor = vec4(color, 1.0);
        }
    `},es=({radius:e,color:r,type:t="terrestrial"})=>{const n=_.useRef(null),s=_.useRef(null),i=_.useMemo(()=>new A(r),[r]),a=_.useMemo(()=>t==="gas_giant"?i.clone().multiplyScalar(.7).offsetHSL(.1,0,0):t==="terrestrial"?new A("#003366"):t==="rocky"?i.clone().multiplyScalar(.5):t==="ice"?new A("#0077be"):t==="molten"?new A("#ff4500"):new A("white"),[t,i]),l=_.useMemo(()=>{switch(t){case"gas_giant":return Xr;case"rocky":return Kr;case"ice":return Jr;case"molten":return Qr;default:return Yr}},[t]),d=_.useMemo(()=>({time:{value:0},baseColor:{value:i},secondaryColor:{value:a}}),[i,a]);return U(({clock:c})=>{s.current&&(s.current.uniforms.time.value=c.getElapsedTime(),s.current.uniforms.baseColor.value=i,s.current.uniforms.secondaryColor.value=a)}),o.jsxs("mesh",{ref:n,children:[o.jsx("sphereGeometry",{args:[e,64,64]}),o.jsx("shaderMaterial",{ref:s,uniforms:d,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader})]})},ts=[0,0,0,0,0,0],os=({body:e})=>{const r=jo(e.texturePath);return o.jsx("meshStandardMaterial",{map:r,emissiveMap:e.isStar?r:void 0,emissive:e.isStar?"white":"black",emissiveIntensity:e.isStar?2:0,roughness:1,metalness:0})},rs=({position:e,color:r})=>{const t=B.useRef([]),n=B.useRef([]),s=B.useRef(0),i=B.useRef(null),a=B.useRef([]),l=C(p=>p.useRealisticDistances),d=C(p=>p.resetToken),c=C(p=>p.simulationState),h=C(p=>p.qualityLevel),u=xe(h),f={RECENT_MAX:u.trailRecentPoints,RECENT_INTERVAL:2,COMPRESSED_MAX:u.trailCompressedPoints,COMPRESS_RATIO:u.trailCompressionRatio,COMPRESS_TRIGGER:Math.floor(u.trailRecentPoints*1.33)},m=f.RECENT_MAX+f.COMPRESSED_MAX,g=B.useCallback(p=>{if(!i.current)return;const v=p.length>=6?p:ts;i.current.geometry.setPositions(v),i.current.computeLineDistances()},[]);return B.useEffect(()=>{t.current=[],n.current=[],s.current=0,a.current.length=0,g(a.current)},[d,g,l]),U(()=>{if(c!=="running"||!i.current)return;if(s.current++,s.current%f.RECENT_INTERVAL===0&&(t.current.push(e.clone()),t.current.length>f.COMPRESS_TRIGGER)){const x=t.current.splice(0,f.COMPRESS_TRIGGER-f.RECENT_MAX);for(let j=0;j<x.length;j+=f.COMPRESS_RATIO)n.current.push(x[j]);for(;n.current.length>f.COMPRESSED_MAX;)n.current.shift()}const p=[...n.current,...t.current],v=Math.min(p.length,m),S=a.current;if(v<2){S.length=0,g(S);return}S.length=v*3;for(let x=0;x<v;x++){const j=p[x],M=x*3;S[M]=j.x,S[M+1]=j.y,S[M+2]=j.z}g(S)}),o.jsx(tt,{ref:i,points:[[0,0,0],[0,0,0]],color:r,lineWidth:2.5,opacity:.6,transparent:!0})},ss=({body:e})=>{const r=C(y=>y.showRealisticVisuals),t=C(y=>y.showGrid),n=C(y=>y.simulationTime),s=C(y=>y.qualityLevel),i=C(y=>y.bodies.length),a=C(y=>y.selectedBodyId),l=C(y=>y.followingBodyId),d=C(y=>y.selectBody),c=C(y=>y.cameraMode),h=B.useRef(null),u=B.useRef(null),f=xe(s),m=_.useMemo(()=>new z(e.position.x,e.position.y,e.position.z),[e.position]),g=_.useMemo(()=>(e.axialTilt||0)*(Math.PI/180),[e.axialTilt]),p=_.useMemo(()=>{if(e.mass>200)return"gas_giant";const y=e.name.toLowerCase();if(y.includes("sun"))return"star";if(y.includes("mercury"))return"rocky";if(y.includes("venus")||y.includes("earth"))return"terrestrial";if(y.includes("mars"))return"rocky";if(y.includes("jupiter")||y.includes("saturn")||y.includes("uranus")||y.includes("neptune"))return"gas_giant";if(y.includes("moon")||y.includes("luna"))return"rocky";if(y.includes("europa")||y.includes("enceladus")||y.includes("pluto"))return"ice";if(y.includes("io")||y.includes("volcano"))return"molten";const b=Math.sqrt(e.position.x**2+e.position.z**2);return b<15?"molten":b>800&&e.mass<100?"ice":e.mass<.2?"rocky":"terrestrial"},[e.mass,e.position.x,e.position.z,e.name]);U(()=>{u.current&&e.rotationSpeed&&(u.current.rotation.y=e.rotationSpeed*n*2300)});const v=c==="surface_lock",S=v&&l===e.id,x=e.id===a||e.id===l,j=!S&&(x||i<=f.maxVisibleLabels||e.isStar&&i<=f.maxVisibleStarLabels),M=!S&&(x||i<=f.maxTrailedBodies),[P,w]=B.useState(!1);B.useEffect(()=>{if(!M){w(!1);return}const y=setTimeout(()=>{w(!0)},600);return()=>clearTimeout(y)},[M]);const R=y=>{v||(y.stopPropagation(),d(e.id))},k=r&&!!e.texturePath;return o.jsxs(o.Fragment,{children:[o.jsxs("group",{ref:h,position:m,onClick:R,children:[o.jsxs("group",{rotation:[0,0,g],children:[k?o.jsx(ut,{ref:u,args:[e.radius,32,32],children:o.jsx(B.Suspense,{fallback:o.jsx("meshStandardMaterial",{color:e.color}),children:o.jsx(os,{body:e})})}):e.isStar||e.isCompactObject?o.jsx(ut,{ref:u,args:[e.radius,32,32],children:o.jsx("meshStandardMaterial",{color:e.color,emissive:e.color,emissiveIntensity:2})}):o.jsx(es,{radius:e.radius,color:e.color,type:p,rotationSpeed:e.rotationSpeed}),t&&!S&&o.jsx(tt,{points:[[0,-e.radius*1.5,0],[0,e.radius*1.5,0]],color:"white",lineWidth:1,opacity:.5,transparent:!0,dashed:!0,dashScale:2,gapSize:1})]}),j&&o.jsx(Mo,{position:[0,e.radius+1.5,0],center:!0,zIndexRange:[1e3,0],style:{color:"white",fontSize:"14px",fontFamily:"system-ui, sans-serif",textShadow:"0 0 4px black, 0 0 2px black",whiteSpace:"nowrap",pointerEvents:"none",userSelect:"none"},children:e.name})]}),M&&P&&o.jsx(rs,{position:m,color:e.color}),e.hasAccretionDisk&&e.accretionDiskConfig&&o.jsx(Vr,{position:e.position,innerRadius:e.radius*e.accretionDiskConfig.innerRadius,outerRadius:e.radius*e.accretionDiskConfig.outerRadius,rotationSpeed:e.accretionDiskConfig.rotationSpeed,particleCount:e.accretionDiskConfig.particleCount,tilt:e.accretionDiskConfig.tilt}),e.hasJets&&o.jsx(Zr,{position:e.position,length:e.radius*15,baseWidth:e.radius*2,speed:1.5})]})},is=()=>{const e=C(t=>t.updateBodies),r=C(t=>t.simulationState);U(()=>{r==="running"&&e()})},ns=1200,as=1,ls=10,cs=e=>e>=10?50:e>=5?80:e>=2?100:e>=1?150:200,ds=({points:e,color:r})=>{const t=_.useMemo(()=>{if(e.length<4)return e;try{return new Ao(e,!1,"catmullrom",.5).getPoints(Math.min(e.length*3,360))}catch{return e}},[e]);return t.length<2?null:o.jsx(tt,{points:t,color:r,lineWidth:1.5,opacity:.4,transparent:!0})},us=()=>{const e=C(d=>d.bodies.length),r=C(d=>d.simulationState),t=C(d=>d.timeScale),n=C(d=>d.useRealisticDistances),[s,i]=B.useState([]),a=B.useRef(null),l=B.useRef(!1);return B.useEffect(()=>{i([])},[n]),B.useEffect(()=>{if(typeof window>"u")return;try{a.current=new Worker(new URL("/orbit_simulator/assets/predictionWorker--Ei3DlKx.js",import.meta.url),{type:"module"})}catch{console.warn("Prediction worker not available, using main thread fallback"),a.current=null;return}const d=h=>{if(h.data.type==="result"){l.current=!1;const u=h.data.paths.map(f=>({id:f.id,points:f.points.map(m=>new z(m[0],m[1],m[2])),color:f.color}));i(u)}},c=a.current;if(c)return c.addEventListener("message",d),()=>{l.current=!1,c.removeEventListener("message",d),c.terminate(),a.current===c&&(a.current=null)}},[]),B.useEffect(()=>{if(r==="paused")return;const d=cs(t),c=setInterval(()=>{const h=C.getState(),u=h.bodies;if(u.length===0)return;const f=a.current,m=lo(h.timeScale,h.useRealisticDistances)*as;if(f&&!l.current){l.current=!0;const g=u.map(p=>({id:p.id,position:{x:p.position.x,y:p.position.y,z:p.position.z},velocity:{x:p.velocity.x,y:p.velocity.y,z:p.velocity.z},mass:p.mass,radius:p.radius,color:p.color}));f.postMessage({type:"predict",bodies:g,steps:ns,dt:m,saveFrequency:ls})}},d);return()=>{clearInterval(c),l.current=!1}},[r,t,e]),o.jsx("group",{children:s.map(d=>o.jsx(ds,{points:d.points,color:d.color},d.id))})},ps=()=>{const e=C(l=>l.simulationTime),r=C(l=>l.zenMode),t=C(l=>l.useRealisticDistances);let s=e*94.88;t&&(s/=8);const i=Math.floor(s/365.25),a=Math.floor(s%365.25);return r?null:o.jsxs("div",{className:"date-display",style:{position:"absolute",bottom:"160px",left:"20px",width:"200px",pointerEvents:"none",zIndex:900,display:"flex",flexDirection:"column",gap:"2px"},children:[o.jsx("div",{className:"mission-time-label",style:{color:"rgba(255, 255, 255, 0.6)",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"4px",fontFamily:"Inter, sans-serif"},children:"MISSION TIME"}),o.jsxs("div",{className:"mission-time-value",style:{color:"#fff",fontSize:"1.5rem",fontFamily:"Inter, sans-serif",fontWeight:300,fontVariantNumeric:"tabular-nums"},children:[a," ",o.jsx("span",{style:{fontSize:"0.9rem",color:"rgba(255,255,255,0.5)"},children:"DAYS"})]}),o.jsxs("div",{className:"mission-time-years",style:{color:"rgba(255, 255, 255, 0.5)",fontSize:"0.9rem",fontFamily:"Inter, sans-serif"},children:["(",i," YEARS)"]})]})},ae=100,_t=300,Mt=5,ms=[[51,26367],[26367,65382],[65382,16776960],[16776960,16724736]],fs=()=>{const e=C(f=>f.bodies),r=C(f=>f.showGravityField),t=C(f=>f.useRealisticDistances),n=_.useRef(null),s=_.useRef(0),i=(ae+1)*(ae+1),a=_.useRef(new Float32Array(i)),l=_.useMemo(()=>ms.map(([f,m])=>[new A(f),new A(m)]),[]),d=_.useMemo(()=>new A,[]),c=t?_t*4:_t,h=e.length>24?Mt*2:Mt,u=_.useMemo(()=>{const f=new ot(c*2,c*2,ae,ae);f.rotateX(-Math.PI/2);const m=new Float32Array((ae+1)*(ae+1)*3);return f.setAttribute("color",new O(m,3)),f},[c]);return U(()=>{if(!r||!n.current||(s.current++,s.current%h!==0))return;const f=n.current.geometry,m=f.attributes.position.array,g=f.attributes.color.array,p=a.current;let v=1/0,S=-1/0;for(let P=0;P<i;P++){const w=P*3,R=m[w],k=m[w+2];let y=0;for(const b of e){const D=R-b.position.x,I=k-b.position.z,T=Math.sqrt(D*D+I*I)+.5;y+=b.mass/T}p[P]=y,y<v&&(v=y),y>S&&(S=y)}const x=Math.log(v+1),M=Math.log(S+1)-x||1;for(let P=0;P<i;P++){const R=(Math.log(p[P]+1)-x)/M,k=Math.min(Math.max(R,0),1),y=Math.min(Math.floor(k*l.length),l.length-1),b=y/l.length,D=(k-b)*l.length;d.lerpColors(l[y][0],l[y][1],D),g[P*3]=d.r,g[P*3+1]=d.g,g[P*3+2]=d.b}f.attributes.color.needsUpdate=!0},-1),r?o.jsx("mesh",{ref:n,geometry:u,position:[0,-2,0],children:o.jsx("meshBasicMaterial",{vertexColors:!0,transparent:!0,opacity:.3,side:Q,depthWrite:!1})}):null},xo=e=>{const r=e/he.SOLAR_MASS;return Math.pow(Math.max(r,.001),he.MASS_LUMINOSITY_EXPONENT)},hs=(e,r)=>{const t=xo(e.mass),n=Math.sqrt(t);return{inner:n*he.HZ_INNER_AU*r,outer:n*he.HZ_OUTER_AU*r}},gs=(e,r,t)=>{let n=0;for(const s of t){const i=e-s.position.x,a=r-s.position.z,l=i*i+a*a+.01,d=xo(s.mass);n+=d/l}return n},vs=(e,r=1)=>{const t=e/r,n=1/he.HZ_INNER_AU**2,s=1/he.HZ_OUTER_AU**2;return t>n?2:t<s?0:1},le=100,xs=5,je={COLD:new A(17578),HABITABLE:new A(2271812),HOT:new A(11149858),TRANSPARENT:new A(0)},ys=()=>{const e=C(c=>c.bodies),r=C(c=>c.showHabitableZone),t=C(c=>c.useRealisticDistances),n=_.useRef(null),s=_.useRef(0),i=_.useMemo(()=>e.filter(c=>c.isStar),[e]),a=i.length>1,l=_.useMemo(()=>{if(i.length===0)return 1e3;const c=Math.max(...i.map(u=>Math.sqrt(u.position.x**2+u.position.z**2))),h=Math.max(c*3,100);return t?h*4:h},[i,t]),d=_.useMemo(()=>{const c=new ot(l*2,l*2,le,le);c.rotateX(-Math.PI/2);const h=new Float32Array((le+1)*(le+1)*3),u=new Float32Array((le+1)*(le+1));return c.setAttribute("color",new O(h,3)),c.setAttribute("alpha",new O(u,1)),c},[l]);return U(()=>{if(!r||!n.current||i.length<2||(s.current++,s.current%xs!==0))return;const c=n.current.geometry,h=c.attributes.position.array,u=c.attributes.color.array,f=t?se.REALISTIC.AU_UNIT:se.COMPRESSED.AU_UNIT,m=1/(f*f);for(let g=0;g<h.length;g+=3){const p=h[g],v=h[g+2],S=g/3,x=gs(p,v,i),j=vs(x,m);let M;switch(j){case 0:M=je.COLD;break;case 1:M=je.HABITABLE;break;case 2:M=je.HOT;break;default:M=je.COLD}u[S*3]=M.r,u[S*3+1]=M.g,u[S*3+2]=M.b}c.attributes.color.needsUpdate=!0}),!r||!a?null:o.jsx("mesh",{ref:n,geometry:d,position:[0,-1.5,0],children:o.jsx("meshBasicMaterial",{vertexColors:!0,transparent:!0,opacity:.3,side:Q,depthWrite:!1})})},jt={vertexShader:`
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,fragmentShader:`
        uniform float progress;
        uniform float opacity;
        uniform vec3 color;
        uniform float ringWidth;
        uniform float asymmetry;
        uniform vec3 directionBias;
        uniform vec3 centerPosition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
            // Direction from center to current fragment
            vec3 dirFromCenter = normalize(vWorldPosition - centerPosition);

            // Calculate asymmetric bias
            // Dot product: -1 (opposite direction) to 1 (same direction)
            float directionDot = dot(dirFromCenter, directionBias);

            // Asymmetric radius modifier
            // In biased direction: expand more (1.0 + asymmetry)
            // Opposite direction: expand less (1.0 - asymmetry)
            float radiusMod = 1.0 + directionDot * asymmetry;

            // Distance from center in UV space
            vec2 centered = vUv - 0.5;
            float dist = length(centered) * 2.0;

            // Adjusted ring position based on asymmetry
            float ringPos = progress * radiusMod;
            float ringDist = abs(dist - ringPos);

            // Ring intensity with soft falloff
            float ring = smoothstep(ringWidth * radiusMod, 0.0, ringDist);

            // Inner glow
            float innerGlow = smoothstep(ringPos, 0.0, dist) * 0.3;

            // Combine
            float alpha = (ring + innerGlow) * opacity;

            // Edge brightness boost
            float edgeBrightness = 1.0 + ring * 0.5;

            gl_FragColor = vec4(color * edgeBrightness, alpha);
        }
    `},yo=({position:e,startTime:r,duration:t,maxRadius:n,color:s,asymmetry:i=0,directionBias:a={x:0,y:1,z:0},onComplete:l})=>{const d=_.useRef(null),c=_.useRef(null),h=_.useRef(!1),u=_.useMemo(()=>({progress:{value:0},opacity:{value:1},color:{value:new A(s)},ringWidth:{value:.15},asymmetry:{value:i},directionBias:{value:new z(a.x,a.y,a.z)},centerPosition:{value:new z(e.x,e.y,e.z)}}),[s,i,a,e]);return U(()=>{if(!c.current||h.current)return;const f=performance.now()-r,m=Math.min(f/t,1);if(m>=1&&!h.current){h.current=!0,l?.();return}const g=1-Math.pow(1-m,2);c.current.uniforms.progress.value=g;const p=.6;if(m>p){const v=(m-p)/(1-p);c.current.uniforms.opacity.value=1-v}if(c.current.uniforms.ringWidth.value=.2*(1-m*.5),d.current){const v=n*g*2;d.current.scale.set(v,v,1)}}),o.jsxs("mesh",{ref:d,position:[e.x,e.y+.1,e.z],rotation:[-Math.PI/2,0,0],children:[o.jsx("planeGeometry",{args:[1,1,1,1]}),o.jsx("shaderMaterial",{ref:c,uniforms:u,vertexShader:jt.vertexShader,fragmentShader:jt.fragmentShader,transparent:!0,depthWrite:!1,blending:G,side:Q})]})},kt={vertexShader:`
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,fragmentShader:`
        uniform float time;
        uniform float progress;
        uniform float intensity;
        uniform vec3 hotColor;
        uniform vec3 coolColor;

        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            // View direction
            vec3 viewDir = normalize(vViewPosition);

            // Fresnel effect (rim lighting)
            float fresnel = 1.0 - abs(dot(vNormal, viewDir));
            fresnel = pow(fresnel, 2.0);

            // Pulsing effect
            float pulse = 0.85 + 0.15 * sin(time * 8.0);
            float pulse2 = 0.9 + 0.1 * sin(time * 12.0 + 1.5);

            // Color transition based on progress (hot -> cool)
            vec3 color = mix(hotColor, coolColor, progress * 0.8);

            // Add some noise-like variation
            float noiseish = sin(vNormal.x * 10.0 + time * 3.0) *
                            sin(vNormal.y * 10.0 + time * 2.0) *
                            sin(vNormal.z * 10.0 + time * 4.0);
            noiseish = noiseish * 0.1 + 0.9;

            // Combine effects
            float alpha = fresnel * pulse * pulse2 * intensity * (1.0 - progress * 0.7) * noiseish;

            // Brightness variation
            float brightness = 1.0 + fresnel * 0.5;

            gl_FragColor = vec4(color * brightness, alpha);
        }
    `},bs=({position:e,radius:r,startTime:t,duration:n,intensity:s=1,onComplete:i})=>{const a=_.useRef(null),l=_.useRef(null),d=_.useRef(!1),c=_.useMemo(()=>({time:{value:0},progress:{value:0},intensity:{value:s},hotColor:{value:new A("#ff4400")},coolColor:{value:new A("#440000")}}),[s]);return U(({clock:h})=>{if(!l.current||d.current)return;const u=performance.now()-t,f=u>0?u:0,m=Math.min(f/n,1);if(m>=1&&!d.current){d.current=!0,i?.();return}if(l.current.uniforms.time.value=h.elapsedTime,l.current.uniforms.progress.value=m,a.current){const g=1+.1*Math.sin(h.elapsedTime*3)*(1-m),p=r*1.15*(1+(1-m)*.1);a.current.scale.setScalar(p*g),a.current.position.set(e.x,e.y,e.z)}}),o.jsxs("mesh",{ref:a,position:[e.x,e.y,e.z],children:[o.jsx("sphereGeometry",{args:[1,32,32]}),o.jsx("shaderMaterial",{ref:l,uniforms:c,vertexShader:kt.vertexShader,fragmentShader:kt.fragmentShader,transparent:!0,depthWrite:!1,blending:G,side:Lt})]})},ce=e=>{const r=Math.sin(e*12.9898)*43758.5453;return r-Math.floor(r)},Pt={vertexShader:`
        attribute float size;
        attribute float alphaSeed;
        varying vec3 vColor;
        varying float vAlphaSeed;

        void main() {
            vColor = color;
            vAlphaSeed = alphaSeed;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = max(1.0, size * (280.0 / max(1.0, -mvPosition.z)));
            gl_Position = projectionMatrix * mvPosition;
        }
    `,fragmentShader:`
        precision mediump float;
        uniform float opacity;
        varying vec3 vColor;
        varying float vAlphaSeed;

        void main() {
            vec2 centered = gl_PointCoord - 0.5;
            float dist = length(centered);
            float mask = smoothstep(0.5, 0.08, dist);
            float core = smoothstep(0.18, 0.0, dist);
            float alpha = mask * opacity * (0.72 + vAlphaSeed * 0.28);
            vec3 finalColor = mix(vColor, vec3(1.0), core * 0.55);
            gl_FragColor = vec4(finalColor, alpha);
        }
    `},Ss=({position:e,startTime:r,duration:t,size:n,color:s,particleCount:i,onComplete:a})=>{const l=_.useRef(null),d=_.useRef(null),c=_.useRef(null),h=_.useRef(!1),u=_.useMemo(()=>{const m=new Ie,g=new Float32Array(i*3),p=new Float32Array(i*3),v=new Float32Array(i),S=new Float32Array(i),x=[],j=[],M=[],P=new A(s),w=new A("#fff3d6"),R=n*.17+i*.013+e.x*.11+e.y*.07+e.z*.05;for(let k=0;k<i;k++){g[k*3]=e.x,g[k*3+1]=e.y,g[k*3+2]=e.z;const y=ce(R+k*1.17)*Math.PI*2,b=Math.acos(2*ce(R+k*2.31)-1),D=n*(.5+ce(R+k*3.07)*1.9);x.push(new z(Math.sin(b)*Math.cos(y)*D,Math.sin(b)*Math.sin(y)*D,Math.cos(b)*D));const I=P.clone().lerp(w,ce(R+k*4.41)*.55);j.push(I),p[k*3]=I.r,p[k*3+1]=I.g,p[k*3+2]=I.b;const T=n*(.18+ce(R+k*5.63)*.3);v[k]=T,M.push(T),S[k]=.4+ce(R+k*6.91)*.6}return m.setAttribute("position",new O(g,3)),m.setAttribute("color",new O(p,3)),m.setAttribute("size",new O(v,1)),m.setAttribute("alphaSeed",new O(S,1)),m.userData.velocities=x,m.userData.baseColors=j,m.userData.initialSizes=M,m},[s,i,e.x,e.y,e.z,n]),f=_.useMemo(()=>({opacity:{value:1}}),[]);return U(()=>{if(h.current)return;const m=performance.now()-r,g=Math.min(m/t,1);if(g>=1){h.current=!0,a?.();return}if(d.current){const p=Math.min(g/.32,1),v=n*(1.6+p*2.2);d.current.scale.setScalar(v);const S=d.current.material;S.opacity=(1-p)*.95}if(l.current&&c.current){const p=l.current.geometry,v=p.attributes.position.array,S=p.attributes.size.array,x=p.attributes.color.array,j=p.userData.velocities,M=p.userData.baseColors,P=p.userData.initialSizes;if(!v||!S||!x||!j||!M||!P)return;const w=oe.FRAME_TIME,R=.985,k=-.02*n,y=Math.pow(1-g,1.15);for(let b=0;b<i;b++){v[b*3]+=j[b].x*w,v[b*3+1]+=j[b].y*w+k*w,v[b*3+2]+=j[b].z*w,j[b].multiplyScalar(R),S[b]=Math.max(P[b]*(1-g*.7),n*.03);const D=M[b];x[b*3]=D.r*(.7+y*.5),x[b*3+1]=D.g*(.6+y*.55),x[b*3+2]=D.b*(.55+y*.45)}c.current.uniforms.opacity.value=y,p.attributes.position.needsUpdate=!0,p.attributes.size.needsUpdate=!0,p.attributes.color.needsUpdate=!0}}),o.jsxs("group",{children:[o.jsxs("mesh",{ref:d,position:[e.x,e.y,e.z],children:[o.jsx("sphereGeometry",{args:[1,16,16]}),o.jsx("meshBasicMaterial",{color:"#ffffff",transparent:!0,opacity:1,depthWrite:!1,blending:G})]}),o.jsx("points",{ref:l,geometry:u,children:o.jsx("shaderMaterial",{ref:c,uniforms:f,vertexShader:Pt.vertexShader,fragmentShader:Pt.fragmentShader,transparent:!0,vertexColors:!0,depthWrite:!1,blending:G})})]})},de=oe.MAX_DEBRIS_PARTICLES,ws=()=>{const e=N(u=>u.debrisClouds),r=N(u=>u.removeExpiredDebris),t=_.useRef(null),n=_.useRef(0),s=_.useMemo(()=>new Ot,[]),i=_.useMemo(()=>new A,[]),a=_.useMemo(()=>new A,[]),l=_.useMemo(()=>new A,[]),d=_.useMemo(()=>{const u=new No(1,0),f=u.attributes.position;for(let m=0;m<f.count;m++){const g=f.getX(m),p=f.getY(m),v=f.getZ(m),S=.7+Math.random()*.6;f.setXYZ(m,g*S,p*S,v*S)}return u.computeVertexNormals(),u},[]),c=_.useMemo(()=>new Uo({roughness:.6,metalness:.3,flatShading:!0,emissive:new A("#ff6600"),emissiveIntensity:0,transparent:!0,opacity:1}),[]),h=_.useMemo(()=>e.flatMap(u=>u.particles).slice(0,de),[e]);return U((u,f)=>{if(!t.current)return;const m=performance.now();m-n.current>2e3&&(r(),n.current=m);const g=N.getState().debrisClouds;let p=0;for(const v of g){for(const S of v.particles){if(p>=de)break;const x=(m-S.createdAt)/S.lifetime;if(x>=1)continue;S.position.x+=S.velocity.x*f,S.position.y+=S.velocity.y*f,S.position.z+=S.velocity.z*f,S.velocity.x*=.998,S.velocity.y*=.998,S.velocity.z*=.998,S.rotation.x+=S.rotationSpeed.x*f,S.rotation.y+=S.rotationSpeed.y*f,S.rotation.z+=S.rotationSpeed.z*f,s.position.set(S.position.x,S.position.y,S.position.z),s.rotation.set(S.rotation.x,S.rotation.y,S.rotation.z);const j=x<.3?1+Math.sin(x*30)*.1:1,M=S.size*(1-x*.3)*j;s.scale.setScalar(Math.max(M,.01)),s.updateMatrix(),t.current.setMatrixAt(p,s.matrix),i.set(S.color);const P=Math.pow(1-x,2)*3;a.setHSL(.05+x*.15,1-x*.3,.5+P*.2),l.copy(i).lerp(a,Math.min(P*.3,1));const w=x<.8?1:Math.pow((1-x)/.2,2);l.multiplyScalar(w),t.current.setColorAt(p,l),p++}if(p>=de)break}for(let v=p;v<de;v++)s.scale.setScalar(0),s.updateMatrix(),t.current.setMatrixAt(v,s.matrix);t.current.instanceMatrix.needsUpdate=!0,t.current.instanceColor&&(t.current.instanceColor.needsUpdate=!0),t.current.count=p}),_.useEffect(()=>{if(t.current&&!t.current.instanceColor){const u=new Float32Array(de*3);t.current.instanceColor=new $e(u,3)}},[]),h.length===0?null:o.jsx("instancedMesh",{ref:t,args:[d,c,de],frustumCulled:!1})},zt={vertexShader:`
        precision mediump float;
        uniform float progress;
        uniform float asymmetry;
        uniform vec3 biasDirection;
        varying vec3 vNormal;
        varying vec3 vWorldDirection;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            float bias = dot(normalize(normal), normalize(biasDirection));
            float stretch = 1.0 + bias * asymmetry * progress;
            vec3 displaced = position * stretch;
            vec4 world = modelMatrix * vec4(displaced, 1.0);
            vWorldDirection = normalize(world.xyz - cameraPosition);
            gl_Position = projectionMatrix * viewMatrix * world;
        }
    `,fragmentShader:`
        precision mediump float;
        uniform vec3 color;
        uniform float opacity;
        uniform float thickness;
        varying vec3 vNormal;
        varying vec3 vWorldDirection;

        void main() {
            float fresnel = 1.0 - max(dot(normalize(vNormal), -normalize(vWorldDirection)), 0.0);
            fresnel = pow(fresnel, 2.6);
            float shell = smoothstep(thickness, 1.0, fresnel);
            gl_FragColor = vec4(color * (1.0 + fresnel * 1.1), shell * opacity);
        }
    `},Cs=({position:e,startTime:r,duration:t,delayMs:n,maxRadius:s,color:i,biasDirection:a,thickness:l,opacity:d})=>{const c=_.useRef(null),h=_.useRef(null),u=_.useMemo(()=>({progress:{value:0},color:{value:new A(i)},opacity:{value:0},thickness:{value:l},asymmetry:{value:.18},biasDirection:{value:new z(a.x,a.y,a.z)}}),[a.x,a.y,a.z,i,l]);return U(()=>{if(!c.current||!h.current)return;const f=performance.now()-r-n;if(f<=0){c.current.visible=!1;return}const m=Math.max(1200,t-n),g=Math.min(f/m,1),p=1-Math.pow(1-g,2.2),v=d*Math.pow(1-g,1.2);c.current.visible=v>.01,c.current.scale.setScalar(Math.max(1,s*p)),h.current.uniforms.progress.value=p,h.current.uniforms.opacity.value=v}),o.jsxs("mesh",{ref:c,position:[e.x,e.y,e.z],visible:!1,children:[o.jsx("sphereGeometry",{args:[1,32,32]}),o.jsx("shaderMaterial",{ref:h,uniforms:u,vertexShader:zt.vertexShader,fragmentShader:zt.fragmentShader,transparent:!0,depthWrite:!1,blending:G,side:rt})]})},Rt={vertexShader:`
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,fragmentShader:`
        precision mediump float;
        uniform float progress;
        uniform float intensity;
        uniform vec3 baseColor;
        uniform float opacity;
        varying vec3 vNormal;
        varying vec2 vUv;

        vec3 temperatureColor(float t) {
            if (t < 0.35) {
                return mix(vec3(0.55, 0.72, 1.0), vec3(0.9, 0.96, 1.0), t / 0.35);
            }

            if (t < 0.58) {
                return mix(vec3(0.9, 0.96, 1.0), vec3(1.0, 1.0, 1.0), (t - 0.35) / 0.23);
            }

            return mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.48, 0.24), (t - 0.58) / 0.42);
        }

        void main() {
            vec2 centered = vUv - 0.5;
            float dist = length(centered) * 2.0;
            float radial = smoothstep(1.08, 0.05, dist);
            float pulse = 0.9 + 0.1 * sin(progress * 45.0);
            float rim = pow(1.0 - abs(vNormal.z), 2.2);
            vec3 temp = temperatureColor(progress);
            vec3 finalColor = mix(baseColor, temp, 0.78) * (1.0 + rim * 0.55) * intensity * pulse;

            gl_FragColor = vec4(finalColor, radial * opacity);
        }
    `},Dt={vertexShader:`
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorldPosition = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
        }
    `,fragmentShader:`
        precision mediump float;
        uniform float progress;
        uniform float opacity;
        uniform vec3 color;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        float hash(vec3 p) {
            return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }

        void main() {
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 1.9);
            float coronaNoise = hash(vWorldPosition * 0.03 + progress * 4.0);
            float corona = fresnel * (0.75 + coronaNoise * 0.55);
            vec3 coronaColor = mix(color, vec3(1.0, 0.68, 0.32), progress * 0.55);
            gl_FragColor = vec4(coronaColor * (1.2 + fresnel), corona * opacity);
        }
    `},It=["#dbe8ff","#ffffff","#ffbe8b","#ff874f"],_s=({position:e,startTime:r,duration:t,maxRadius:n,color:s,intensity:i,coreRadius:a,haloRadius:l,shellCount:d,biasDirection:c,onComplete:h})=>{const u=_.useRef(null),f=_.useRef(null),m=_.useRef(null),g=_.useRef(null),p=_.useRef(null),v=_.useRef(!1),S=_.useMemo(()=>({progress:{value:0},intensity:{value:i},baseColor:{value:new A(s)},opacity:{value:1}}),[s,i]),x=_.useMemo(()=>({progress:{value:0},opacity:{value:.7},color:{value:new A(s)}}),[s]);return U(()=>{if(v.current)return;const j=performance.now()-r,M=Math.min(j/t,1);if(M>=1){v.current=!0,h?.();return}const P=M<.16?1-M*.7:.88,w=M<.35?1:1+(M-.35)*1.9,R=M>.72?1-(M-.72)/.28:1;if(u.current&&m.current){const k=a*P*w;u.current.scale.setScalar(Math.max(.001,k)),m.current.uniforms.progress.value=M,m.current.uniforms.opacity.value=R}if(f.current&&g.current){const k=1.15+Math.pow(M,.7)*4.2;f.current.scale.setScalar(l*k),g.current.uniforms.progress.value=M,g.current.uniforms.opacity.value=(.72+Math.sin(M*18)*.08)*R}if(p.current){const k=M<.35?i*(80+M*280):i*200*Math.pow(1-Math.max(0,M-.35)/.65,1.4);p.current.intensity=k}}),o.jsxs("group",{position:[e.x,e.y,e.z],children:[o.jsx("pointLight",{ref:p,color:s,intensity:0,distance:n*2.4,decay:1.8}),o.jsxs("mesh",{ref:f,children:[o.jsx("sphereGeometry",{args:[1,32,32]}),o.jsx("shaderMaterial",{ref:g,uniforms:x,vertexShader:Dt.vertexShader,fragmentShader:Dt.fragmentShader,transparent:!0,depthWrite:!1,blending:G,side:rt})]}),o.jsxs("mesh",{ref:u,children:[o.jsx("sphereGeometry",{args:[1,24,24]}),o.jsx("shaderMaterial",{ref:m,uniforms:S,vertexShader:Rt.vertexShader,fragmentShader:Rt.fragmentShader,transparent:!0,depthWrite:!1,blending:G,side:Lt})]}),Array.from({length:d}).map((j,M)=>o.jsx(Cs,{position:e,startTime:r,duration:t,delayMs:2400+M*950,maxRadius:n*(.45+M*.28),color:It[M%It.length],biasDirection:c,thickness:.28-M*.04,opacity:.45-M*.07},M))]})},Tt={vertexShader:`
        precision mediump float;
        varying vec2 vUv;
        varying float vSeed;
        attribute float instanceSeed;
        attribute float instanceProgress;

        void main() {
            vUv = uv;
            vSeed = instanceSeed + instanceProgress;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,fragmentShader:`
        precision mediump float;
        uniform float opacity;
        uniform float pulseTime;
        uniform vec3 color;
        varying vec2 vUv;
        varying float vSeed;

        void main() {
            vec2 centered = vUv - vec2(0.5, 0.0);
            float axis = abs(centered.x);
            float along = clamp(vUv.y, 0.0, 1.0);
            float pulse = 0.85 + 0.15 * sin(pulseTime + vSeed * 6.2831);
            float core = 1.0 - smoothstep(0.0, 0.16, axis);
            float glow = 1.0 - smoothstep(0.0, 0.46, axis);
            float taper = smoothstep(0.0, 0.12, along) * (1.0 - smoothstep(0.55, 1.0, along));
            float alpha = (core * 0.85 + glow * 0.35) * taper * pulse * opacity;
            vec3 finalColor = mix(color, vec3(1.0), core * 0.6);
            gl_FragColor = vec4(finalColor, alpha);
        }
    `},Ms=({position:e,startTime:r,duration:t,rayCount:n,maxLength:s,color:i,spread:a,pulseSpeed:l,onComplete:d})=>{const c=_.useRef(null),h=_.useRef(null),u=_.useRef(!1),f=_.useRef(new Ot),m=_.useRef(new z),g=_.useMemo(()=>new ot(1,1),[]),p=_.useMemo(()=>new we({uniforms:{opacity:{value:1},pulseTime:{value:0},color:{value:new A(i)}},vertexShader:Tt.vertexShader,fragmentShader:Tt.fragmentShader,transparent:!0,depthWrite:!1,blending:G,side:Q}),[i]);return B.useEffect(()=>{if(!h.current)return;const v=new Float32Array(n),S=new Float32Array(n);for(let x=0;x<n;x++)v[x]=Math.random(),S[x]=0;h.current.geometry.setAttribute("instanceSeed",new $e(v,1)),h.current.geometry.setAttribute("instanceProgress",new $e(S,1))},[n]),U(()=>{if(!h.current||u.current)return;const v=performance.now()-r,S=Math.min(v/t,1);if(S>=1){u.current=!0,d?.();return}const x=h.current,j=x.geometry.getAttribute("instanceProgress"),M=x.geometry.getAttribute("instanceSeed"),P=f.current,w=x.material;for(let R=0;R<n;R++){const k=M.getX(R),y=k*.18,b=Math.max(0,Math.min(1,(S-y)/(1-y))),D=1-Math.pow(1-b,2.5),I=R/n*Math.PI*2+k*a,T=s*(.5+k*.75)*D,W=s*(.025+k*.04*a),E=(S*.35+k)*.18;P.position.set(0,0,0),P.rotation.set(0,0,I+E),m.current.set(W,T,1),P.scale.copy(m.current),P.position.x=Math.cos(I)*T*.1,P.position.y=Math.sin(I)*T*.1,P.updateMatrix(),x.setMatrixAt(R,P.matrix),j.setX(R,D)}j.needsUpdate=!0,x.instanceMatrix.needsUpdate=!0,w.uniforms.opacity.value=S>.72?1-(S-.72)/.28:1,w.uniforms.pulseTime.value=S*l*Math.PI*2,c.current&&(c.current.rotation.z+=.0018)}),o.jsx("group",{ref:c,position:[e.x,e.y,e.z],children:o.jsx("instancedMesh",{ref:h,args:[g,p,n],frustumCulled:!1})})},js=({startTime:e,duration:r,intensity:t,falloff:n="exponential",onComplete:s})=>{const{camera:i}=ve(),a=_.useRef(!1),l=_.useRef(new z),d=_.useRef(e*.013);return _.useEffect(()=>{const c=l;return()=>{i.position.sub(c.current),c.current.set(0,0,0)}},[i]),U((c,h)=>{if(a.current)return;const u=performance.now()-e,f=Math.min(u/r,1);if(i.position.sub(l.current),f>=1){a.current=!0,l.current.set(0,0,0),s?.();return}d.current+=h*8;const m=n==="exponential"?t*Math.pow(1-f,2.8):t*(1-f),g=l.current;g.set(Math.sin(d.current*1.7)*m*.5+Math.cos(d.current*3.1)*m*.2,Math.cos(d.current*2.3)*m*.45+Math.sin(d.current*4.7)*m*.15,Math.sin(d.current*2.9)*m*.35),i.position.add(g)}),null},ke={vertexShader:`
        precision mediump float;
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,fragmentShader:`
        precision mediump float;
        uniform float progress;
        uniform float opacity;
        uniform float coreIntensity;
        varying vec2 vUv;

        void main() {
            vec2 centered = vUv - 0.5;
            float distFromAxis = abs(centered.x) * 2.0;
            float along = clamp(vUv.y, 0.0, 1.0);
            float core = 1.0 - smoothstep(0.0, 0.14, distFromAxis);
            float glow = 1.0 - smoothstep(0.0, 0.48, distFromAxis);
            float lengthMask = smoothstep(0.0, 0.08, along) * step(along, progress);
            float tail = 1.0 - smoothstep(0.6, 1.0, along);
            float alpha = (core * coreIntensity + glow * 0.38) * tail * lengthMask * opacity;
            vec3 color = mix(vec3(0.45, 0.72, 1.0), vec3(1.0), core);
            gl_FragColor = vec4(color, alpha);
        }
    `},ks=({position:e,startTime:r,duration:t,length:n,axis:s,width:i,coreIntensity:a,onComplete:l})=>{const d=_.useRef(null),c=_.useRef(null),h=_.useRef(!1),u=_.useMemo(()=>({progress:{value:0},opacity:{value:1},coreIntensity:{value:a}}),[a]),f=_.useMemo(()=>{const m=new z(s.x,s.y,s.z).normalize();return new Gt().setFromUnitVectors(new z(0,1,0),m)},[s.x,s.y,s.z]);return U(()=>{if(h.current)return;const m=performance.now()-r,g=Math.min(m/t,1);if(g>=1){h.current=!0,l?.();return}const p=g<.45?g/.45:1,v=g>.72?1-(g-.72)/.28:1;[d.current,c.current].forEach(S=>{if(!S)return;const x=S.material;x.uniforms.progress.value=p,x.uniforms.opacity.value=v})}),o.jsxs("group",{position:[e.x,e.y,e.z],quaternion:f,children:[o.jsxs("mesh",{ref:d,position:[0,n/2,0],children:[o.jsx("planeGeometry",{args:[i,n]}),o.jsx("shaderMaterial",{uniforms:u,vertexShader:ke.vertexShader,fragmentShader:ke.fragmentShader,transparent:!0,depthWrite:!1,blending:G,side:Q})]}),o.jsxs("mesh",{ref:c,position:[0,-n/2,0],rotation:[0,0,Math.PI],children:[o.jsx("planeGeometry",{args:[i,n]}),o.jsx("shaderMaterial",{uniforms:u,vertexShader:ke.vertexShader,fragmentShader:ke.fragmentShader,transparent:!0,depthWrite:!1,blending:G,side:Q})]})]})},Ps=()=>{const e=N(p=>p.shockwaves),r=N(p=>p.heatGlows),t=N(p=>p.explosions),n=N(p=>p.supernovas),s=N(p=>p.radialRays),i=N(p=>p.cameraShakes),a=N(p=>p.gammaRayBursts),l=N(p=>p.removeShockwave),d=N(p=>p.removeHeatGlow),c=N(p=>p.removeExplosion),h=N(p=>p.removeSupernova),u=N(p=>p.removeRadialRays),f=N(p=>p.removeCameraShake),m=N(p=>p.removeGammaRayBurst),g=N(p=>p.removeExpiredEffects);return U(()=>{}),_.useEffect(()=>{const p=setInterval(()=>{g()},2e3);return()=>clearInterval(p)},[g]),o.jsxs("group",{name:"effects-layer",children:[e.map(p=>o.jsx(yo,{position:p.position,startTime:p.startTime,duration:p.duration,maxRadius:p.maxRadius,color:p.color,asymmetry:p.asymmetry,directionBias:p.directionBias,onComplete:()=>l(p.id)},p.id)),r.map(p=>o.jsx(bs,{position:p.position,radius:p.radius,startTime:p.startTime,duration:p.duration,intensity:p.intensity,onComplete:()=>d(p.id)},p.id)),t.map(p=>o.jsx(Ss,{position:p.position,startTime:p.startTime,duration:p.duration,size:p.size,color:p.color,particleCount:p.particleCount,onComplete:()=>c(p.id)},p.id)),n.map(p=>o.jsx(_s,{position:p.position,startTime:p.startTime,duration:p.duration,maxRadius:p.maxRadius,color:p.color,intensity:p.intensity,coreRadius:p.coreRadius,haloRadius:p.haloRadius,shellCount:p.shellCount,biasDirection:p.biasDirection,onComplete:()=>h(p.id)},p.id)),s.map(p=>o.jsx(Ms,{position:p.position,startTime:p.startTime,duration:p.duration,rayCount:p.rayCount,maxLength:p.maxLength,color:p.color,spread:p.spread,pulseSpeed:p.pulseSpeed,onComplete:()=>u(p.id)},p.id)),i.map(p=>o.jsx(js,{startTime:p.startTime,duration:p.duration,intensity:p.intensity,falloff:p.falloff,onComplete:()=>f(p.id)},p.id)),a.map(p=>o.jsx(ks,{position:p.position,startTime:p.startTime,duration:p.duration,length:p.length,axis:p.axis,width:p.width,coreIntensity:p.coreIntensity,onComplete:()=>m(p.id)},p.id)),o.jsx(ws,{})]})},zs=`
uniform vec2 blackHoleScreen;
uniform float lensStrength;
uniform float schwarzschildRadius;
uniform float aspectRatio;

uniform float cameraNear;
uniform float cameraFar;
uniform float blackHoleDistance;

// Helper to linearize depth
float readDepthLinear(vec2 coord) {
    float depth = texture2D(depthBuffer, coord).x;
    float viewZ = perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
    return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

// Manual linearization if needed (standard perspective)
float getLinearDepth(vec2 coord) {
    float depth = texture2D(depthBuffer, coord).x;
    float z_n = 2.0 * depth - 1.0;
    float z_e = 2.0 * cameraNear * cameraFar / (cameraFar + cameraNear - z_n * (cameraFar - cameraNear));
    return z_e;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // 1. Depth Test: Check if existing geometry is closer than the black hole
    // We use a small bias to prevent self-shadowing or precision artifacts
    float sceneDepth = getLinearDepth(uv);
    float bias = schwarzschildRadius * 2.0;

    // blackHoleDistance is linear distance from camera
    // If scene pixel is significantly closer than black hole, skip distortion
    if (sceneDepth < (blackHoleDistance - bias)) {
        outputColor = inputColor;
        return;
    }

    // Adjust UV for aspect ratio
    vec2 adjustedUV = uv;
    adjustedUV.x *= aspectRatio;

    vec2 adjustedBH = blackHoleScreen;
    adjustedBH.x *= aspectRatio;

    // Vector from pixel to black hole center
    vec2 toBH = adjustedBH - adjustedUV;
    float dist = length(toBH);

    // Gravitational lensing formula (simplified)
    // Light bends toward the black hole, stronger near the event horizon
    float eventHorizon = schwarzschildRadius * 0.5;
    float photonSphere = schwarzschildRadius * 1.5;

    // Skip if too far (optimization)
    if (dist > schwarzschildRadius * 8.0) {
        outputColor = inputColor;
        return;
    }

    // Einstein ring effect - light wraps around
    float bendStrength = 0.0;

    if (dist > eventHorizon) {
        // Outside event horizon: bend light toward black hole
        // Strength falls off with distance squared (inverse square law)
        float normalizedDist = dist / schwarzschildRadius;
        bendStrength = lensStrength / (normalizedDist * normalizedDist);

        // Extra bending near photon sphere
        if (dist < photonSphere * 2.0) {
            float photonFactor = 1.0 - smoothstep(photonSphere, photonSphere * 2.0, dist);
            bendStrength *= (1.0 + photonFactor * 2.0);
        }
    }

    // Apply distortion - pull UV toward black hole center
    vec2 bendDir = normalize(toBH);
    vec2 distortedUV = uv + bendDir * bendStrength * 0.1;

    // Undo aspect ratio adjustment for sampling
    distortedUV.x = clamp(distortedUV.x, 0.0, 1.0);
    distortedUV.y = clamp(distortedUV.y, 0.0, 1.0);

    // Sample the distorted position
    vec4 distortedColor = texture2D(inputBuffer, distortedUV);

    // Darken near event horizon (light cannot escape)
    float darkenFactor = 1.0;
    if (dist < eventHorizon * 1.2) {
        darkenFactor = smoothstep(eventHorizon * 0.8, eventHorizon * 1.2, dist);
    }

    // Add subtle blue-shift effect near the black hole (gravitational blueshift)
    vec3 finalColor = distortedColor.rgb * darkenFactor;
    if (dist < photonSphere * 3.0) {
        float blueShift = (1.0 - dist / (photonSphere * 3.0)) * 0.15;
        finalColor.b += blueShift;
        finalColor.r -= blueShift * 0.5;
    }

    outputColor = vec4(finalColor, distortedColor.a);
}
`;class Rs extends ko{constructor({blackHoleScreen:r=new Wt(.5,.5),lensStrength:t=1,schwarzschildRadius:n=.05,aspectRatio:s=1,cameraNear:i=.1,cameraFar:a=1e3,blackHoleDistance:l=1e3}={}){super("GravitationalLensEffect",zs,{attributes:Po.DEPTH,uniforms:new Map([["blackHoleScreen",new te(r)],["lensStrength",new te(t)],["schwarzschildRadius",new te(n)],["aspectRatio",new te(s)],["cameraNear",new te(i)],["cameraFar",new te(a)],["blackHoleDistance",new te(l)]])})}update(r,t,n){}}const bo=_.forwardRef(({blackHolePosition:e,schwarzschildRadius:r,strength:t=1,camera:n,enabled:s=!0},i)=>{const a=n,l=a.near??.1,d=a.far??1e3,c=_.useMemo(()=>new Rs({lensStrength:t,cameraNear:l,cameraFar:d}),[t,l,d]);return U(()=>{if(!n)return;c.uniforms.get("lensStrength").value=s?t:0;const h=n;if(h.near!==void 0&&(c.uniforms.get("cameraNear").value=h.near),h.far!==void 0&&(c.uniforms.get("cameraFar").value=h.far),!s)return;const u=e.clone().project(n),f=new Wt((u.x+1)/2,(u.y+1)/2),m=n.position.distanceTo(e),g=Math.min(.3,r/m*2),p=window.innerWidth/window.innerHeight;c.uniforms.get("blackHoleScreen").value=f,c.uniforms.get("schwarzschildRadius").value=g,c.uniforms.get("aspectRatio").value=p,c.uniforms.get("blackHoleDistance").value=m}),_.useImperativeHandle(i,()=>c,[c]),o.jsx("primitive",{object:c})});bo.displayName="GravitationalLensEffect";const Se=oe.MAX_TIDAL_PARTICLES,Ds=({position:e,primaryPosition:r,bodyRadius:t,bodyColor:n,primaryMass:s,startTime:i,duration:a=5e3,onComplete:l})=>{const d=_.useRef(null),c=_.useRef(i),{geometry:h,velocities:u}=_.useMemo(()=>{const f=new Ie,m=new Float32Array(Se*3),g=new Float32Array(Se*3),p=new Float32Array(Se),v=[],S=new A(n),x=new z().subVectors(r,e),j=x.length();x.normalize();const M=re.G,P=Math.sqrt(2*M*s/j);for(let w=0;w<Se;w++){const R=Math.random()*Math.PI*2,k=Math.acos(2*Math.random()-1),y=t*(.8+Math.random()*.4),b=y*Math.sin(k)*Math.cos(R),D=y*Math.sin(k)*Math.sin(R),I=y*Math.cos(k);m[w*3]=e.x+b,m[w*3+1]=e.y+D,m[w*3+2]=e.z+I;const T=new z(b,D,I).normalize(),W=T.dot(x),E=2*M*s*t/Math.pow(j,3),F=P*E*(.3+Math.random()*.7),q=T.clone().multiplyScalar(W*F),ye=Math.sqrt(M*s/j),be=new z().crossVectors(x,T).normalize().multiplyScalar(ye*.3*(.5+Math.random()*.5));q.add(be),v.push(q);const ee=.7+Math.random()*.3;g[w*3]=S.r*ee,g[w*3+1]=S.g*ee,g[w*3+2]=S.b*ee,p[w]=t*.02*(.5+Math.random())}return f.setAttribute("position",new O(m,3)),f.setAttribute("color",new O(g,3)),f.setAttribute("size",new O(p,1)),{geometry:f,velocities:v}},[e,r,t,n,s]);return U(()=>{if(!d.current)return;const f=performance.now()-c.current,m=Math.min(f/a,1);if(m>=1){l?.();return}const g=h.attributes.position.array,p=h.attributes.size.array;for(let S=0;S<Se;S++)g[S*3]+=u[S].x*oe.FRAME_TIME,g[S*3+1]+=u[S].y*oe.FRAME_TIME,g[S*3+2]+=u[S].z*oe.FRAME_TIME,u[S].multiplyScalar(oe.PARTICLE_DRAG),p[S]*=1-m*.01;h.attributes.position.needsUpdate=!0,h.attributes.size.needsUpdate=!0;const v=d.current.material;v.opacity=1-m*.8}),o.jsx("points",{ref:d,geometry:h,children:o.jsx("pointsMaterial",{vertexColors:!0,transparent:!0,opacity:1,sizeAttenuation:!0,depthWrite:!1,blending:G})})},Bt={vertexShader:`
        varying vec3 vWorldPosition;
        void main() {
            vWorldPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,fragmentShader:`
        uniform float time;
        uniform float seed;
        uniform int fbmOctaves;
        uniform vec3 uColorDeep;
        uniform vec3 uColorMist;
        uniform vec3 uColorGlow;
        uniform vec3 uColorCore;
        varying vec3 vWorldPosition;

        // Simplex 3D Noise (Ian McEwan, Ashima Arts)
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
            vec3 x1 = x0 - i1 + 1.0 * C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
            i = mod(i, 289.0 ); 
            vec4 p = permute( permute( permute( 
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            float n_ = 1.0/7.0; 
            vec3  ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );  
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        // Fractal Brownian Motion (Layered Noise) with dynamic octaves
        float fbm(vec3 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for (int i = 0; i < 4; i++) {
                if (i >= fbmOctaves) break;
                value += amplitude * snoise(p * frequency);
                p += vec3(10.0); // Shift next layer to avoid alignment artifacts
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }

        // Determine star color based on position (Pseudo-random)
        vec3 getStarColor(vec3 position) {
            float starType = snoise(position * 1234.5) * 0.5 + 0.5; // 0.0 - 1.0

            vec3 color;
            if (starType < 0.76) {
                // M-type: Red-Orange (76%)
                color = mix(vec3(1.0, 0.4, 0.2), vec3(1.0, 0.6, 0.3), (starType / 0.76));
            } else if (starType < 0.88) {
                // K-type: Orange (12%)
                color = vec3(1.0, 0.8, 0.5);
            } else if (starType < 0.96) {
                // G-type: Yellow (8%)
                color = vec3(1.0, 0.95, 0.7);
            } else if (starType < 0.99) {
                // F/A-type: White (3%)
                color = vec3(1.0, 1.0, 0.95);
            } else {
                // O/B-type: Blue-White (1%)
                color = vec3(0.7, 0.8, 1.0);
            }
            return color;
        }

        void main() {
            vec3 pos = normalize(vWorldPosition); 
            // Apply Random Seed Offset to position pattern
            vec3 seedOffset = vec3(seed * 100.0);

            // --- 1. Stars (Twinkle & Multi-colored) ---
            float nStars = snoise(pos * 600.0 + seedOffset); 
            float twinkle = sin(time * 0.2 + pos.x * 100.0 + pos.y * 50.0) * 0.5 + 0.5;
            float starsRaw = smoothstep(0.97, 1.0, nStars);
            float stars = starsRaw * (0.8 + 0.2 * twinkle); 
            float brightStars = smoothstep(0.995, 1.0, snoise(pos * 300.0 + 100.0 + seedOffset));

            vec3 starColor = getStarColor(pos * 600.0 + seedOffset);
            vec3 brightStarColor = getStarColor(pos * 300.0 + 100.0 + seedOffset);

            vec3 starContribution = starColor * stars * 0.8 + brightStarColor * brightStars * 1.0;

            // --- 1.5 Milky Way (Dense Band) ---
            // Galactic plane at Y=0 (Equator)
            float galacticLatitude = abs(pos.y); 
            float densityBand = smoothstep(0.5, 0.0, galacticLatitude);
            
            // Vary density with noise
            float densityVariation = fbm(pos * 8.0 + seedOffset) * 0.5 + 0.5;
            float galaxyDensity = densityBand * densityVariation;

            // Dense stars for Milky Way
            // Lower threshold to show more stars in the band
            float milkyWayStars = snoise(pos * 1200.0 + seedOffset); 
            float milkyWayMask = smoothstep(0.90, 1.0, milkyWayStars);

            // Milky Way Color (slightly bluish/white)
            vec3 milkyWayColor = mix(
                vec3(0.9, 0.95, 1.0),
                vec3(1.0, 0.98, 0.9),
                snoise(pos * 1200.0 + 500.0 + seedOffset) * 0.5 + 0.5
            );

            // Boost intensity significantly to make it visible
            vec3 milkyWayContribution = milkyWayColor * milkyWayMask * galaxyDensity * 2.5;

            // --- 2. Rich Nebula (Multi-layered FBM) ---
            float flowTime = time * 0.005;
            vec3 flowOffset = vec3(flowTime, -flowTime * 0.5, flowTime * 0.2);
            
            float nebulaNoise = fbm(pos * 1.5 + flowOffset + seedOffset * 0.1);
            nebulaNoise = nebulaNoise * 0.5 + 0.5; 
            
            float clouds = smoothstep(0.3, 0.8, nebulaNoise);

            // Use uniform colors for randomness
            vec3 nebulaColor = mix(uColorDeep, uColorMist, clouds);
            nebulaColor = mix(nebulaColor, uColorGlow, smoothstep(0.6, 0.9, nebulaNoise) * 0.6);
            
            float coreNoise = snoise(pos * 3.0 + vec3(10.0) + seedOffset);
            nebulaColor += uColorCore * smoothstep(0.7, 1.0, coreNoise * clouds) * 0.3;

            // Darken the nebula significantly as requested
            nebulaColor *= 0.4;

            // --- Final Combine ---
            vec3 finalColor = nebulaColor + starContribution + milkyWayContribution;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `},Is=()=>{const e=_.useRef(null),r=_.useRef(null),t=C(i=>i.qualityLevel);U(({clock:i,camera:a})=>{e.current&&(e.current.uniforms.time.value=i.getElapsedTime()*.5),r.current&&r.current.position.copy(a.position)});const n=xe(t),s=_.useMemo(()=>{const i=Math.random()*100,a=Math.random(),l=new A().setHSL(a,.6,.02),d=new A().setHSL((a+.1)%1,.5,.15),c=new A().setHSL((a+.5)%1,.8,.2),h=new A().setHSL((a+.05)%1,1,.3);return{time:{value:0},seed:{value:i},fbmOctaves:{value:n.starfieldFBMOctaves},uColorDeep:{value:l},uColorMist:{value:d},uColorGlow:{value:c},uColorCore:{value:h}}},[n.starfieldFBMOctaves]);return o.jsxs("mesh",{ref:r,frustumCulled:!1,children:[o.jsx("sphereGeometry",{args:[n.starfieldRadius,n.starfieldSegments[0],n.starfieldSegments[1]]}),o.jsx("shaderMaterial",{ref:e,uniforms:s,vertexShader:Bt.vertexShader,fragmentShader:Bt.fragmentShader,side:rt,depthWrite:!1})]})};function ge(e,r,t,n,s={}){const{duration:i=.8,ease:a="power2.inOut",onComplete:l,delay:d=0,dynamicTarget:c}=s,h={x:e.position.x,y:e.position.y,z:e.position.z},u={x:r.target.x,y:r.target.y,z:r.target.z},f=Fo.timeline({delay:d,onComplete:l});return f.to(h,{x:t.x,y:t.y,z:t.z,duration:i,ease:a,onUpdate:()=>{e.position.set(h.x,h.y,h.z)}},0),f.to(u,{x:n.x,y:n.y,z:n.z,duration:i,ease:a,onUpdate:()=>{if(c){const m=c();r.target.copy(m)}else r.target.set(u.x,u.y,u.z);r.update()}},0),f}function Ts(e,r,t=5){const n=new z(1,.8,1).normalize(),s=Math.max(r*t,10);return{position:e.clone().add(n.multiplyScalar(s)),lookAt:e.clone()}}function He(e,r,t,n,s={}){const{position:i,lookAt:a}=Ts(t,n);return ge(e,r,i,a,s)}function Et(e,r,t=new z(100,80,100),n=new z(0,0,0),s={}){return ge(e,r,t,n,{duration:1,ease:"power3.out",...s})}function Bs(e,r,t,n={}){const s=e.position.clone(),i=r.target.clone(),a=s.clone().sub(i),l=a.length()*t,d=i.clone().add(a.normalize().multiplyScalar(l));return ge(e,r,d,i,{duration:.6,ease:"power2.out",...n})}const Es={en:{app_title:"ORBIT SIMULATOR",app_subtitle:"Interactive N-Body Gravity System",controls_title:"CONTROLS",simulation_title:"SIMULATION",open_controls:"Open Controls",zen_mode:"Zen Mode",camera_mode:"Camera Mode",pause:"PAUSE",resume:"RESUME",reset:"Reset Simulation",load_solar:"Load Solar System",tab_controls:"Controls",tab_bodies:"Bodies",tab_inspector:"Inspector",preset_mode:"Preset",custom_mode:"Custom",create_body:"Create Body",search_placeholder:"Search bodies...",filter_all:"All",filter_star:"Star",filter_planet:"Planet",filter_black_hole:"Black Hole",duplicate:"Duplicate",no_bodies_found:"No bodies found",select_body_msg:"Select a body from the Bodies tab or click on an object in the view to inspect its properties.",show_prediction:"Show Orbit Prediction",show_grid:"Show Grid & Axes",show_realistic:"Show Realistic Textures",show_habitable:"Show Habitable Zone",show_gravitational_lens:"Show Gravitational Lens",show_hill_sphere:"Show Hill Sphere",show_gravity_field:"Show Gravity Field",show_lagrange_points:"Show Lagrange Points",show_realistic_distances:"Realistic Orbit Distances",camera_follow:"Camera Follow",free_camera:"Free Camera (None)",stop_following:"Stop Following",camera_mode_free:"Free Look",camera_mode_sun:"Fixed View (Orbit)",camera_mode_surface:"Fixed View (Surface)",new_body_title:"NEW CELESTIAL BODY",mass:"Mass",radius:"Radius",velocity:"Velocity",position:"Position",color:"Color",add_body:"Add Body",add_random:"Add Random Body",distance_sun:"Distance to Sun",orbital_speed:"Orbital Speed",rotation_speed:"Rotation Speed",tour_welcome:"Welcome to Orbit Simulator!",tour_intro:"Experience the beauty of N-Body physics and celestial mechanics. Let's take a quick tour!",tour_panel_title:"Control Panel",tour_panel_content:"Here you can control the simulation speed, toggle visual aids, and manage celestial bodies.",tour_sim_title:"Simulation Controls",tour_sim_content:"Pause, Resume, or Reset the entire simulation from here.",tour_cam_title:"Camera Focus",tour_cam_content:"Select a planet to follow it automatically.",tour_scene_title:"Interactive Scene",tour_scene_content:"Right-click to Pan. Left-click to Rotate. Scroll to Zoom. Click a planet to inspect.",bodies_list:"BODIES",remove:"Remove",name:"Name",cancel:"Cancel",create:"Create",help_title:"Help & Information",version:"Version",controls_header:"Controls",changelog_header:"Changelog",ctrl_pan:"Pan",ctrl_pan_desc:"Right Click + Drag",ctrl_rotate:"Rotate",ctrl_rotate_desc:"Left Click + Drag",ctrl_zoom:"Zoom",ctrl_zoom_desc:"Mouse Wheel",ctrl_select:"Select Body",ctrl_select_desc:"Click on planet",cl_surface_view:"Surface View Overhaul (FPS Style)",cl_orbit_view:"Renamed to Orbit Fixed View",cl_perf:"Performance Improvements",cl_v0_2_1_title:"v0.2.1 - Physics & View Update",cl_item_surface:"Surface View Refinement (Orbit Locked, Tangent View)",cl_item_perf:"Performance View (FPS, Physics Time, Energy)",cl_item_physics:"Physics Engine (Collision in GPU/Worker)",show_multithreading:"Multithreading (Experimental)",show_gpu:"GPU Acceleration (Beta)",show_performance:"Show Performance View",perf_stats:"Simulation Stats",perf_fps:"FPS",perf_mode:"Mode",perf_bodies:"Bodies",perf_physics:"Physics Time",perf_energy:"Total Energy",perf_error:"Error (Drift)",perf_kinetic:"Kinetic",perf_potential:"Potential",calculating:"Calculating...",cl_v0_3_0_title:"v0.3.0 - Energy & Hybrid Engine",cl_item_energy:"Energy Monitoring (Kinetic, Potential, Drift)",cl_item_hybrid:"Hybrid Engine (Optimized CPU/Worker/GPU switching)",cl_item_cleanup:"Resource Management (Reduced Memory Leaks)",cl_v0_4_0_title:"v0.4.0 - UI Polish & Zen Mode",cl_item_compact:"Compact Controls (Unified width, collapsed view)",cl_item_zen:"Zen Mode (Hide UI, Logo, Grid for immersion)",cl_item_ui:"UI Refinement (Cleaner layout, Consistent visual style)",cl_item_gallery:"Star System Gallery (Visual selector for presets)",star_system_gallery:"Star System Gallery",gallery_title:"Star System Gallery",gallery_select_mode:"Select Mode",gallery_close:"Close",stable_era:"Stable Era",chaotic_era:"Chaotic Era",time_scale:"Time Scale",habitable_zone_multi_star:"Multi-Star Habitable Zone",hz_cold:"Too Cold",hz_habitable:"Habitable",hz_hot:"Too Hot",delete_title:"Delete Body",delete_message:'Are you sure you want to delete "{name}"? This action cannot be undone.',delete_confirm:"Delete",delete_cancel:"Cancel",supernova_button:"Trigger Supernova",supernova_modal_title:"Trigger Supernova",supernova_modal_message:'Trigger a supernova explosion for "{name}"? The star will collapse into a {remnant}.',supernova_modal_confirm:"Trigger Supernova",supernova_modal_cancel:"Cancel",supernova_toast_triggered:"Supernova initiated for {name}.",supernova_overlay_kicker:"破局イベント",supernova_phase_intro:"Locking on to the supergiant",supernova_phase_countdown:"Core collapse imminent",supernova_phase_breakout:"Shock breakout",supernova_phase_ejecta:"Ejecta shell expansion",supernova_phase_remnant:"Remnant formation",supernova_phase_complete:"Sequence complete",supernova_remnant_black_hole:"A black hole remnant has formed.",supernova_remnant_neutron_star:"A neutron star remnant has formed.",supernova_remnant_none:"The progenitor star was completely disrupted.",supernova_action_replay:"Replay",supernova_action_inspect:"Inspect Remnant",supernova_action_free_camera:"Free Camera",supernova_remnant_label_black_hole:"black hole",supernova_remnant_label_neutron_star:"neutron star"},ja:{app_title:"ORBIT SIMULATOR",app_subtitle:"天体軌道シミュレーター",controls_title:"コントロールパネル",simulation_title:"シミュレーション",open_controls:"コントロールパネルを開く",zen_mode:"Zenモード",camera_mode:"カメラモード切替",pause:"一時停止",resume:"再開",reset:"リセット",load_solar:"太陽系に移動",tab_controls:"コントロール",tab_bodies:"天体一覧",tab_inspector:"詳細",preset_mode:"プリセット",custom_mode:"カスタム",create_body:"天体を作成",search_placeholder:"名前で検索...",filter_all:"全て",filter_star:"恒星",filter_planet:"惑星",filter_black_hole:"ブラックホール",duplicate:"複製",no_bodies_found:"天体が見つかりません",select_body_msg:"「天体一覧」タブから選択するか、画面上の天体をクリックして詳細を表示してください。",show_prediction:"軌道予測線を表示",show_grid:"グリッドを表示",show_realistic:"リアルなテクスチャを表示",show_habitable:"ハビタブルゾーンを表示",show_gravitational_lens:"重力レンズを表示",show_hill_sphere:"ヒル球を表示",show_gravity_field:"重力場を表示",show_lagrange_points:"ラグランジュ点を表示",show_realistic_distances:"軌道距離をリアル寄りにする",camera_follow:"カメラ追従",free_camera:"追従なし",stop_following:"追従を解除",camera_mode_free:"フリー視点",camera_mode_sun:"公転固定視点",camera_mode_surface:"地表視点",new_body_title:"新規天体作成",mass:"質量",radius:"半径",velocity:"速度",position:"位置",color:"色",add_body:"天体を追加",add_random:"ランダムな天体を追加",distance_sun:"太陽からの距離",orbital_speed:"公転速度",rotation_speed:"自転速度",tour_welcome:"Orbit Simulatorへようこそ！",tour_intro:"軌道シミュレーションと天体力学の美しさを体験してください。簡単なツアーにご案内します！",tour_panel_title:"コントロールパネル",tour_panel_content:"ここではシミュレーション速度の調整、グリッド表示の切り替え、天体の管理ができます。",tour_sim_title:"シミュレーション操作",tour_sim_content:"シミュレーションの一時停止、再開、リセットがここから行えます。",tour_cam_title:"カメラフォーカス",tour_cam_content:"惑星を選択すると、自動的にカメラが追従します。",tour_scene_title:"インタラクティブな操作",tour_scene_content:"右ドラッグで移動、左ドラッグで回転、ホイールでズーム。惑星をクリックで詳細表示。",bodies_list:"天体リスト",remove:"削除",name:"名前",cancel:"キャンセル",create:"作成",help_title:"ヘルプと情報",version:"バージョン",controls_header:"操作方法",changelog_header:"更新履歴",ctrl_pan:"視点移動 (Pan)",ctrl_pan_desc:"右クリック + ドラッグ",ctrl_rotate:"回転 (Rotate)",ctrl_rotate_desc:"左クリック + ドラッグ",ctrl_zoom:"ズーム (Zoom)",ctrl_zoom_desc:"マウスホイール",ctrl_select:"天体選択",ctrl_select_desc:"惑星をクリック",cl_surface_view:"地表視点の刷新 (FPSスタイル)",cl_orbit_view:"公転固定視点への名称変更",cl_perf:"パフォーマンス改善",cl_v0_2_1_title:"v0.2.1 - 物理演算と視点の強化",cl_item_surface:"地表視点の改善 (公転固定、進行方向への整列、UX向上)",cl_item_perf:"パフォーマンスビュー (FPS, 計算時間, 総エネルギー)",cl_item_physics:"物理エンジンの強化 (GPU/Workerでの衝突判定)",show_multithreading:"マルチスレッド計算 (実験的)",show_gpu:"GPUアクセラレーション (ベータ)",show_performance:"パフォーマンス情報を表示",perf_stats:"シミュレーション統計",perf_fps:"FPS",perf_mode:"計算モード",perf_bodies:"天体数",perf_physics:"計算時間",perf_energy:"総エネルギー",perf_error:"保存誤差",perf_kinetic:"運動エネルギー",perf_potential:"位置エネルギー",calculating:"計算中...",cl_v0_3_0_title:"v0.3.0 - エネルギー監視とハイブリッドエンジン",cl_item_energy:"エネルギー監視 (運動・位置エネルギー、誤差率)",cl_item_hybrid:"ハイブリッドエンジン (CPU/Worker/GPU の最適化と切替)",cl_item_cleanup:"リソース管理の改善 (メモリリーク低減)",cl_v0_4_0_title:"v0.4.0 - UI改善とZenモード",cl_item_compact:"コンパクトコントロール (幅統一・折りたたみ表示)",cl_item_zen:"Zenモード (UI・ロゴ・グリッド非表示による没入感)",cl_item_ui:"UI調整 (レイアウトの整理・視覚スタイルの統一)",cl_item_gallery:"恒星系ギャラリー (プリセットの視覚的選択機能)",star_system_gallery:"恒星系ギャラリー",gallery_title:"恒星系ギャラリー",gallery_select_mode:"モード選択",gallery_load:"読み込み",gallery_close:"閉じる",stable_era:"安定期",chaotic_era:"乱紀",time_scale:"時間スケール",habitable_zone_multi_star:"連星系ハビタブルゾーン",hz_cold:"寒冷域",hz_habitable:"ハビタブル",hz_hot:"高温域",delete_title:"天体の削除",delete_message:'"{name}" を削除してもよろしいですか？この操作は取り消せません。',delete_confirm:"削除",delete_cancel:"キャンセル",supernova_button:"超新星を起こす",supernova_modal_title:"超新星爆発を起こす",supernova_modal_message:'"{name}" を超新星爆発させますか？恒星は {remnant} へ変化します。',supernova_modal_confirm:"超新星を起こす",supernova_modal_cancel:"キャンセル",supernova_toast_triggered:"{name} で超新星爆発が始まりました。",supernova_overlay_kicker:"Catastrophic Event",supernova_phase_intro:"超巨星へフォーカス中",supernova_phase_countdown:"核崩壊まであとわずか",supernova_phase_breakout:"ショックブレイクアウト",supernova_phase_ejecta:"放出殻が膨張中",supernova_phase_remnant:"残骸を形成中",supernova_phase_complete:"シーケンス完了",supernova_remnant_black_hole:"ブラックホール残骸が形成されました。",supernova_remnant_neutron_star:"中性子星残骸が形成されました。",supernova_remnant_none:"前駆星は完全に消失しました。",supernova_action_replay:"リプレイ",supernova_action_inspect:"残骸を見る",supernova_action_free_camera:"フリーカメラ",supernova_remnant_label_black_hole:"ブラックホール",supernova_remnant_label_neutron_star:"中性子星"}};let Re=navigator.language.startsWith("ja")?"ja":"en";const Qe=new Set,As=e=>Es[Re][e]||e,Ns=e=>{Re=e,Qe.forEach(r=>r())},Us=e=>(Qe.add(e),()=>Qe.delete(e)),Y=()=>(_.useSyncExternalStore(Us,()=>Re),{t:As,lang:Re,setLanguage:Ns}),Fs=()=>{const e=C(l=>l.zenMode),r=_.useRef(null),t=_.useRef(0),n=_.useRef(performance.now()),s=_.useRef(0),{t:i,lang:a}=Y();return _.useEffect(()=>{if(e)return;let l;const d=()=>{const c=performance.now();s.current++;const h=c-n.current;if(h>=500&&(t.current=Math.round(s.current*1e3/h),s.current=0,n.current=c),r.current&&!e){const{physicsDuration:u,bodyCount:f,mode:m,energy:g}=H,p=t.current,v=Math.abs(g.drift),S=v<1e-4?"#44ff44":v<.01?"#ffff44":"#ff4444",x=(g.drift*100).toFixed(4)+"%",j=g.total.toExponential(4),M=H.cameraPosition||[0,0,0],P=`[${Math.round(M[0])}, ${Math.round(M[1])}, ${Math.round(M[2])}]`;r.current.innerHTML=`
                    <div style="font-weight: bold; margin-bottom: 4px;">${i("perf_stats")}</div>
                    <div style="display: flex; justify-content: space-between; gap: 12px;">
                        <span>${i("perf_fps")}:</span> <span style="color: ${p<30?"#ff4444":"#44ff44"}">${p}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Cam:</span> <span style="font-family: monospace; color: #aaaaff;">${P}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${i("perf_mode")}:</span> <span style="color: #44aaff">${m}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${i("perf_bodies")}:</span> <span>${f}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${i("perf_physics")}:</span> <span>${u.toFixed(1)}ms</span>
                    </div>
                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 4px 0;" />
                    <div style="display: flex; justify-content: space-between;">
                        <span>${i("perf_energy")}:</span> <span style="font-family: monospace; font-size: 0.9em;">${j}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${i("perf_error")}:</span> <span style="font-family: monospace; font-size: 0.9em; color: ${S}">${x}</span>
                    </div>
                    <div style="font-size: 0.85em; opacity: 0.7; margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
                       <div style="display: flex; justify-content: space-between;"><span>${i("perf_kinetic")}:</span> <span>${g.kinetic.toExponential(2)}</span></div>
                       <div style="display: flex; justify-content: space-between;"><span>${i("perf_potential")}:</span> <span>${g.potential.toExponential(2)}</span></div>
                    </div>
                `}l=requestAnimationFrame(d)};return d(),()=>{cancelAnimationFrame(l)}},[i,a,e]),e?null:o.jsx("div",{ref:r,style:{position:"absolute",bottom:"250px",left:"10px",background:"rgba(20, 30, 40, 0.1)",backdropFilter:"blur(4px)",padding:"12px",borderRadius:"8px",color:"#e0e0e0",fontFamily:"Inter, system-ui, sans-serif",fontSize:"12px",border:"1px solid rgba(255, 255, 255, 0.1)",width:"220px",boxShadow:"0 4px 12px rgba(0, 0, 0, 0.3)",pointerEvents:"none",zIndex:1e3,userSelect:"none"}})},Ls=(e,r)=>{const t=e.find(l=>l.id===r);if(!t)return null;const n=new z(t.position.x,t.position.y,t.position.z),s=e.reduce((l,d)=>d.id===r?l:Math.max(l,d.position.distanceTo(t.position)),t.radius*12),i=Math.max(s*1.8,t.radius*18),a=n.clone().add(new z(i*.85,i*.55,i));return{target:t,cameraPosition:a,lookAt:n}},Os=()=>{const e=C(c=>c.bodies),r=C(c=>c.supernovaScenario),t=C(c=>c.setFollowingBody),n=C(c=>c.setCameraMode),s=C(c=>c.advanceSupernovaScenario),{camera:i,controls:a}=ve(),l=B.useRef("idle"),d=B.useRef(-1);return U(()=>{if(r.phase!=="countdown"||!r.triggerAt){d.current=-1;return}const c=Math.max(0,r.triggerAt-performance.now()),h=Math.ceil(c/100);h!==d.current&&(d.current=h,s("countdown",{countdownRemainingMs:c}))}),B.useEffect(()=>{if(!a||!r.active){l.current="idle";return}if(l.current===r.phase)return;const c=a,h=r.remnantBodyId??r.targetStarId,u=h?Ls(e,h):null,f=h?e.find(m=>m.id===h):null;if(!(!f&&r.phase!=="complete"))switch(l.current=r.phase,r.phase){case"intro":f&&(t(f.id),n("sun_lock"),He(i,c,f.position,f.radius,{duration:1,ease:"power3.out"}));break;case"countdown":f&&(t(f.id),n("sun_lock"),He(i,c,f.position,f.radius,{duration:1,ease:"power2.inOut"}),Bs(i,c,.8,{duration:1.2,ease:"power2.out"}));break;case"shock-breakout":case"ejecta":u&&(t(u.target.id),n("sun_lock"),ge(i,c,u.cameraPosition,u.lookAt,{duration:1.3,ease:"power3.out"}));break;case"remnant":if(r.remnantBodyId){const m=e.find(g=>g.id===r.remnantBodyId);if(m){t(m.id),n("sun_lock"),He(i,c,m.position,m.radius,{duration:1.25,ease:"power3.out"});break}}u&&(t(null),n("free"),Et(i,c,u.cameraPosition,u.lookAt,{duration:1.4,ease:"power3.out"}));break;case"complete":!r.remnantBodyId&&u&&(t(null),n("free"),Et(i,c,u.cameraPosition,u.lookAt,{duration:1.2,ease:"power2.out"}));break}},[s,e,i,a,r.active,r.phase,r.remnantBodyId,r.targetStarId,n,t]),null},At=e=>{const r=e.filter(t=>t.isStar);if(r.length!==0)return r.reduce((t,n)=>n.mass>t.mass?n:t,r[0])},Gs=()=>C(r=>r.showPrediction)?o.jsx(us,{}):null,Ws=()=>{const e=C(f=>f.bodies),r=C(f=>f.followingBodyId),t=C(f=>f.cameraMode),n=C(f=>f.simulationTime),s=C(f=>f.useRealisticDistances),i=C(f=>f.supernovaScenario.active),{camera:a,controls:l}=ve(),d=B.useRef(null),c=B.useRef(0),h=B.useRef(!0),u=B.useRef("free");return B.useEffect(()=>{if(h.current=!0,i){u.current=t;return}if(r&&l){const f=C.getState().bodies.find(m=>m.id===r);if(f){const m=new z(f.position.x,f.position.y,f.position.z),g=l;if(t!==u.current||h.current)if(t==="surface_lock"){const p=At(C.getState().bodies);let v=new z(0,0,-1),S=new z(1,0,0);if(p){const w=new z(p.position.x,p.position.y,p.position.z).clone().sub(m).normalize();S=w.clone().negate(),v=w.clone().cross(new z(0,1,0)).normalize()}else{const P=new z(f.velocity.x,f.velocity.y,f.velocity.z);P.lengthSq()>1e-4&&(v=P.normalize())}const x=S.multiplyScalar(f.radius*1.05),j=m.clone().add(x),M=j.clone().add(v.multiplyScalar(100));ge(a,g,j,M,{duration:1,ease:"power2.inOut"})}else{const v=a.position.clone().sub(m).normalize();v.lengthSq()<.001&&v.set(1,.8,1).normalize();const S=Math.max(f.radius*5,10),x=m.clone().add(v.multiplyScalar(S));ge(a,g,x,m,{duration:.8,ease:"power2.inOut",dynamicTarget:()=>{const j=C.getState().bodies.find(M=>M.id===r);return j?new z(j.position.x,j.position.y,j.position.z):m}})}}}u.current=t},[r,t,l,a,i]),B.useEffect(()=>{d.current=null},[s]),U(f=>{if(H.cameraPosition=[f.camera.position.x,f.camera.position.y,f.camera.position.z],!r)return;const m=e.find(p=>p.id===r),g=At(e);if(m&&f.controls){const p=f.controls,v=new z(m.position.x,m.position.y,m.position.z);if(h.current||!d.current){d.current=v.clone(),c.current=n,h.current=!1,p.target.copy(v),p.update();return}if(t==="free"){const S=v.clone().sub(d.current);f.camera.position.add(S),p.target.add(S)}else if(t==="sun_lock"||t==="surface_lock")if(g){const S=new z(g.position.x,g.position.y,g.position.z),x=d.current.clone().sub(S),j=v.clone().sub(S);if(x.lengthSq()>1e-4&&j.lengthSq()>1e-4){x.normalize(),j.normalize();const M=new Gt().setFromUnitVectors(x,j),P=f.camera.position.clone().sub(d.current);P.applyQuaternion(M),f.camera.position.copy(v.clone().add(P));const w=p.target.clone().sub(d.current);w.applyQuaternion(M),p.target.copy(v.clone().add(w))}else{const M=v.clone().sub(d.current);f.camera.position.add(M),p.target.add(M)}}else{const S=v.clone().sub(d.current);f.camera.position.add(S),p.target.add(S)}p.update(),d.current.copy(v),c.current=n}}),null},Hs=()=>{const{camera:e,controls:r}=ve();return B.useEffect(()=>{const t=s=>{const i=s,{factor:a}=i.detail;if(e.position.multiplyScalar(a),r){const l=r;l.target.multiplyScalar(a),l.update()}e.far=i.detail.realistic?1e5:5e4,e.updateProjectionMatrix()},n=s=>{const i=s,{camera:a}=i.detail;if(e.position.set(a.position[0],a.position[1],a.position[2]),r){const l=r;l.target.set(a.target[0],a.target[1],a.target[2]),l.update()}};return window.addEventListener("distanceScaleChanged",t),window.addEventListener("starSystemChanged",n),()=>{window.removeEventListener("distanceScaleChanged",t),window.removeEventListener("starSystemChanged",n)}},[e,r]),null},Vs=()=>{const e=C(a=>a.bodies),{camera:r}=ve(),t=_.useMemo(()=>e.filter(a=>a.isCompactObject),[e]);if(!(t.length>0))return null;const s=t[0],i=new z(s.position.x,s.position.y,s.position.z);return o.jsxs(Bo,{enableNormalPass:!1,multisampling:0,children:[o.jsx(bo,{blackHolePosition:i,schwarzschildRadius:s.radius,strength:1.5,camera:r,enabled:!0}),o.jsx(Eo,{brightness:-.2,contrast:.1})]},"gravitational-lens-composer")},qs=()=>{is();const e=C(m=>m.bodies),r=C(m=>m.showHabitableZone),t=C(m=>m.useRealisticDistances),n=C(m=>m.tidallyDisruptedEvents),s=C(m=>m.removeTidalDisruptionEvent),i=C(m=>m.collisionEvents),a=C(m=>m.removeCollisionEvent),l=_.useMemo(()=>e.filter(m=>m.isStar),[e]),d=l.length===1,c=l.length>1,h=d?l[0]:void 0,u=t?se.REALISTIC.AU_UNIT:se.COMPRESSED.AU_UNIT,f=_.useMemo(()=>h?hs(h,u):null,[h,u]);return o.jsxs(o.Fragment,{children:[o.jsx(Ws,{}),o.jsx(Os,{}),o.jsx("ambientLight",{intensity:.2}),o.jsx("pointLight",{position:[0,0,0],intensity:2,decay:0,distance:1e3}),r&&f&&h&&d&&o.jsxs("mesh",{position:[h.position.x,h.position.y,h.position.z],rotation:[-Math.PI/2,0,0],children:[o.jsx("ringGeometry",{args:[f.inner,f.outer,64]}),o.jsx("meshBasicMaterial",{color:"#22aa44",opacity:.15,transparent:!0,side:Q,depthWrite:!1})]}),r&&c&&o.jsx(ys,{}),n.map(m=>{const g=e.find(M=>M.id===m.primaryId),p=e.find(M=>M.id===m.bodyId),v=g?g.position:new z(0,0,0),S=g?g.mass:1e3,x=p?p.radius:10,j=p?p.color:"#aaaaaa";return o.jsx(Ds,{position:new z(m.position.x,m.position.y,m.position.z),primaryPosition:new z(v.x,v.y,v.z),bodyRadius:x,bodyColor:j,primaryMass:S,startTime:m.startTime,duration:m.duration,onComplete:()=>s(m.bodyId)},m.bodyId+"_"+m.startTime)}),i.map(m=>o.jsx(yo,{position:new z(m.position.x,m.position.y,m.position.z),startTime:m.startTime,duration:2e3,maxRadius:50,color:m.color,onComplete:()=>a(m.id)},m.id)),e.map(m=>o.jsx(ss,{body:m},m.id)),o.jsx(Gs,{}),o.jsx(fs,{}),o.jsx(Ps,{})]})},$s=()=>{const e=C(c=>c.showGrid),r=C(c=>c.zenMode),t=C(c=>c.useRealisticDistances),n=C(c=>c.bodies),s=_.useMemo(()=>n.some(c=>c.isCompactObject),[n]),i=t?{fadeDistance:5e3,sectionSize:200,cellSize:50}:{fadeDistance:2e3,sectionSize:50,cellSize:10},a=s?"#aaaaaa":"#555555",l=s?"#888888":"#333333",d=e&&!r;return o.jsx("group",{visible:d,children:o.jsx(To,{infiniteGrid:!0,fadeDistance:i.fadeDistance,sectionColor:a,cellColor:l,sectionSize:i.sectionSize,cellSize:i.cellSize,side:2})})},Zs=()=>{const e=C(u=>u.zenMode),r=C(u=>u.cameraMode),t=C(u=>u.useRealisticDistances),n=C(u=>u.qualityLevel),[s,i]=B.useState(null),a=r==="surface_lock",l=t?2e5:5e4,d=xe(n),c=typeof window<"u"?Math.min(window.devicePixelRatio*d.pixelRatioMultiplier,2):1,h=B.useCallback(u=>{console.error("WebGL initialization error:",u);const f=u instanceof Error?u.message:"WebGL failed to initialize";i(f)},[]);return s?o.jsxs("div",{style:{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0a0a0a",color:"white",padding:"20px",boxSizing:"border-box"},children:[o.jsx("h2",{style:{fontSize:"1.5rem",marginBottom:"1rem"},children:"⚠️ WebGL Error"}),o.jsx("p",{style:{opacity:.7,textAlign:"center",maxWidth:"500px"},children:"Your device or browser doesn't support WebGL, which is required for 3D rendering."}),o.jsxs("p",{style:{opacity:.5,fontSize:"0.9rem",marginTop:"1rem"},children:["Error: ",s]}),o.jsx("button",{onClick:()=>window.location.reload(),style:{marginTop:"2rem",padding:"12px 24px",background:"#3b82f6",color:"white",border:"none",borderRadius:"8px",cursor:"pointer"},children:"Retry"})]}):o.jsxs(zo,{camera:{position:[0,25,50],fov:45,near:.1,far:l},dpr:c,onCreated:({gl:u})=>{try{if(!u||!u.getContext)throw new Error("WebGL context not available");console.log("WebGL context created successfully")}catch(f){h(f)}},children:[o.jsx("color",{attach:"background",args:["#000000"]}),o.jsx(Is,{}),o.jsx(qs,{}),o.jsx(Hs,{}),o.jsx(Ro,{makeDefault:!0,enablePan:!0,minDistance:.001,maxDistance:1e5,enableZoom:!a,enableDamping:!0,dampingFactor:.1,zoomSpeed:1.5,panSpeed:1.2,rotateSpeed:.8}),o.jsx($s,{}),!e&&o.jsx(Do,{alignment:"bottom-left",margin:[100,100],children:o.jsx(Io,{axisColors:["#ff3653","#0adb50","#2c8fdf"],labelColor:"black"})}),o.jsx(Vs,{})]})},Ys=()=>o.jsxs("div",{style:{position:"relative",width:"100%",height:"100%"},children:[o.jsx(B.Suspense,{fallback:o.jsx("div",{style:{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0a0a0a",color:"white"},children:"Loading..."}),children:o.jsx(Zs,{})}),o.jsx(ps,{}),C(e=>e.showPerformance)&&o.jsx(Fs,{})]}),Xs=({activeTab:e,onChange:r})=>{const t=C(l=>l.bodies),n=C(l=>l.selectedBodyId),s=C(l=>l.userMode),{t:i}=Y(),a=s==="beginner";return o.jsxs("div",{className:"tab-navigation",role:"tablist","aria-label":"Simulation control tabs",children:[o.jsxs("button",{role:"tab","aria-selected":e==="controls","aria-controls":"controls-panel",id:"controls-tab",onClick:()=>r("controls"),className:`tab-btn ${e==="controls"?"active":""}`,tabIndex:e==="controls"?0:-1,children:[o.jsx(st,{size:18,"aria-hidden":"true"}),o.jsx("span",{children:i("tab_controls")})]}),o.jsxs("button",{role:"tab","aria-selected":e==="bodies","aria-controls":"bodies-panel",id:"bodies-tab",onClick:()=>r("bodies"),className:`tab-btn ${e==="bodies"?"active":""}`,tabIndex:e==="bodies"?0:-1,children:[o.jsx(Te,{size:18,"aria-hidden":"true"}),o.jsx("span",{children:i("tab_bodies")}),o.jsx("span",{className:"badge","aria-label":`${t.length} bodies`,children:t.length})]}),!a&&o.jsxs("button",{role:"tab","aria-selected":e==="inspector","aria-controls":"inspector-panel",id:"inspector-tab",onClick:()=>r("inspector"),className:`tab-btn ${e==="inspector"?"active":""}`,disabled:!n,title:i(n?"tab_inspector":"select_body_msg"),tabIndex:e==="inspector"?0:-1,"aria-disabled":!n,children:[o.jsx(Vt,{size:18,"aria-hidden":"true"}),o.jsx("span",{children:i("tab_inspector")})]})]})},Ks=()=>{const{t:e}=Y(),r=C(d=>d.addBody),[t,n]=_.useState("preset"),[s,i]=_.useState({name:"New Planet",mass:1,radius:.5,color:"#ffffff",position:{x:10,y:0,z:0},velocity:{x:0,y:0,z:2}}),a=d=>{const c=(Math.random()-.5)*50;let u={position:new z(c,0,(Math.random()-.5)*50),velocity:new z(0,0,0),name:`New ${d}`};switch(d){case"Star":u={...u,type:"star",mass:1e4,radius:20,color:"#ffaa00",name:"New Star"};break;case"Planet":u={...u,type:"planet",mass:1,radius:1,color:"#3388ff",name:"New Planet"};break;case"Gas Giant":u={...u,type:"planet",mass:300,radius:10,color:"#dcb159",name:"Gas Giant"};break;case"Black Hole":u={...u,type:"black_hole",mass:5e4,radius:2,color:"#000000",name:"Black Hole",isCompactObject:!0};break}r(u)},l=()=>{r({name:s.name,mass:s.mass,radius:s.radius,color:s.color,position:new z(s.position.x,s.position.y,s.position.z),velocity:new z(s.velocity.x,s.velocity.y,s.velocity.z)})};return o.jsxs("div",{style:{marginTop:"20px",borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:"15px"},children:[o.jsx("h3",{style:{fontSize:"14px",marginBottom:"10px",color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.05em"},children:e("add_body")}),o.jsxs("div",{style:{display:"flex",marginBottom:"15px",background:"rgba(0,0,0,0.3)",borderRadius:"6px",padding:"2px"},children:[o.jsx("button",{onClick:()=>n("preset"),style:{flex:1,padding:"6px",borderRadius:"4px",background:t==="preset"?"rgba(255,255,255,0.1)":"transparent",color:t==="preset"?"white":"rgba(255,255,255,0.4)",border:"none",cursor:"pointer",transition:"all 0.2s"},children:e("preset_mode")}),o.jsx("button",{onClick:()=>n("custom"),style:{flex:1,padding:"6px",borderRadius:"4px",background:t==="custom"?"rgba(255,255,255,0.1)":"transparent",color:t==="custom"?"white":"rgba(255,255,255,0.4)",border:"none",cursor:"pointer",transition:"all 0.2s"},children:e("custom_mode")})]}),t==="preset"?o.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"},children:[{type:"Star",icon:it,color:"#facc15"},{type:"Planet",icon:Te,color:"#60a5fa"},{type:"Gas Giant",icon:Lo,color:"#fdba74"},{type:"Black Hole",icon:Ce,color:"#c084fc"}].map(d=>o.jsxs("button",{onClick:()=>a(d.type),style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",padding:"12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"white",cursor:"pointer",transition:"all 0.2s"},onMouseOver:c=>c.currentTarget.style.background="rgba(255,255,255,0.1)",onMouseOut:c=>c.currentTarget.style.background="rgba(255,255,255,0.05)",children:[o.jsx(d.icon,{size:24,color:d.color}),o.jsx("span",{style:{fontSize:"12px"},children:d.type})]},d.type))}):o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[o.jsx("input",{type:"text",value:s.name,onChange:d=>i({...s,name:d.target.value}),placeholder:e("name"),className:"lab-input",style:{width:"100%",padding:"8px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"4px",color:"white"}}),o.jsxs("div",{style:{display:"flex",gap:"8px"},children:[o.jsxs("div",{style:{flex:1},children:[o.jsx("label",{style:{fontSize:"10px",color:"#888",display:"block",marginBottom:"2px"},children:e("mass")}),o.jsx("input",{type:"number",value:s.mass,onChange:d=>i({...s,mass:parseFloat(d.target.value)}),style:{width:"100%",padding:"6px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"4px",color:"white"}})]}),o.jsxs("div",{style:{flex:1},children:[o.jsx("label",{style:{fontSize:"10px",color:"#888",display:"block",marginBottom:"2px"},children:e("radius")}),o.jsx("input",{type:"number",value:s.radius,onChange:d=>i({...s,radius:parseFloat(d.target.value)}),style:{width:"100%",padding:"6px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"4px",color:"white"}})]})]}),o.jsx("button",{onClick:l,style:{width:"100%",padding:"10px",marginTop:"5px",background:"#3b82f6",border:"none",borderRadius:"6px",color:"white",fontWeight:600,cursor:"pointer"},children:e("create_body")})]})]})},De=({isOpen:e,title:r,message:t,onConfirm:n,onCancel:s,danger:i=!1,confirmText:a="Confirm",cancelText:l="Cancel"})=>e?o.jsx("div",{className:"confirm-modal-overlay",children:o.jsxs("div",{className:"confirm-modal-content",children:[o.jsx("h3",{className:"confirm-modal-title",children:r}),o.jsx("p",{className:"confirm-modal-message",children:t}),o.jsxs("div",{className:"confirm-modal-actions",children:[o.jsx("button",{onClick:s,className:"confirm-btn-secondary",children:l}),o.jsx("button",{onClick:n,className:i?"confirm-btn-danger":"confirm-btn-primary",children:a})]})]})}):null,So=_.createContext(void 0),wo=()=>{const e=_.useContext(So);if(!e)throw new Error("useToast must be used within a ToastProvider");return e},Js={en:{controls:{title:"Controls",description:"Control simulation speed, camera mode, and visualization options.",tips:["Use the time scale slider to speed up or slow down the simulation","Switch between different camera modes for various viewing perspectives","Toggle prediction lines to see future orbital paths","Enable habitable zone visualization for star systems","Adjust gravity heatmap to visualize gravitational field strength"]},bodies:{title:"Bodies",description:"View all celestial bodies, search, filter, and manage them.",tips:["Use the search bar to quickly find specific bodies by name","Filter by type: All, Star, Planet, or Black Hole","Click a body to select it and view details in the Inspector","Hold Ctrl/Cmd or Shift while clicking to select multiple bodies","Use the duplicate button to create a copy of a body","Delete individual bodies or use bulk delete for multiple selections"]},inspector:{title:"Inspector",description:"Edit properties of the selected body including mass, radius, and vectors.",tips:["Modify physical properties like mass, radius, and color","Adjust position and velocity vectors in 3D space","Use sliders for quick adjustments or input exact values","Mass is displayed in solar masses (M☉)","Position and velocity are in simulation units","Changes take effect immediately in the simulation"]}},ja:{controls:{title:"コントロール",description:"シミュレーション速度、カメラモード、可視化オプションを制御します。",tips:["タイムスケールスライダーでシミュレーションの速度を調整できます","様々な視点で観察するために異なるカメラモードを切り替えられます","予測ラインを切り替えて未来の軌道経路を表示できます","恒星系のハビタブルゾーン可視化を有効にできます","重力ヒートマップで重力場の強度を視覚化できます"]},bodies:{title:"天体",description:"すべての天体を表示、検索、フィルタリング、管理します。",tips:["検索バーで名前から特定の天体を素早く見つけられます","タイプでフィルタリング: すべて、恒星、惑星、ブラックホール","天体をクリックして選択し、インスペクターで詳細を表示できます","Ctrl/CmdまたはShiftを押しながらクリックすると複数の天体を選択できます","複製ボタンで天体のコピーを作成できます","個別に削除するか、複数選択して一括削除できます"]},inspector:{title:"インスペクター",description:"選択した天体の質量、半径、ベクトルなどのプロパティを編集します。",tips:["質量、半径、色などの物理プロパティを変更できます","3D空間での位置と速度ベクトルを調整できます","スライダーで素早く調整するか、正確な値を入力できます","質量は太陽質量（M☉）で表示されます","位置と速度はシミュレーション単位で表示されます","変更はシミュレーションに即座に反映されます"]}}},at=({topic:e})=>{const[r,t]=_.useState(!1),{lang:n}=Y(),s=n||"en",i=Js[s][e];return r?o.jsx("div",{className:"context-help-modal-overlay",onClick:()=>t(!1),children:o.jsxs("div",{className:"context-help-modal",onClick:a=>a.stopPropagation(),children:[o.jsxs("div",{className:"context-help-header",children:[o.jsx("h3",{children:i.title}),o.jsx("button",{onClick:()=>t(!1),className:"context-help-close","aria-label":s==="ja"?"ヘルプを閉じる":"Close help",children:o.jsx(Be,{size:18})})]}),o.jsxs("div",{className:"context-help-body",children:[o.jsx("p",{className:"context-help-description",children:i.description}),o.jsxs("div",{className:"context-help-tips",children:[o.jsx("h4",{children:s==="ja"?"ヒント:":"Tips:"}),o.jsx("ul",{children:i.tips.map((a,l)=>o.jsx("li",{children:a},l))})]})]})]})}):o.jsx("button",{onClick:()=>t(!0),className:"context-help-button",title:s==="ja"?"ヘルプを表示":"Show help","aria-label":`${s==="ja"?"ヘルプ":"Help"}: ${i.title}`,children:o.jsx(nt,{size:16})})},ue=e=>e.type?e.type:e.isStar?"star":e.isCompactObject?"black_hole":"planet",Qs=()=>{const{t:e}=Y(),{showToast:r}=wo(),t=C(y=>y.bodies),n=C(y=>y.selectedBodyId),s=C(y=>y.selectBody),i=C(y=>y.removeBody),a=C(y=>y.duplicateBody),[l,d]=_.useState(""),[c,h]=_.useState("all"),[u,f]=_.useState(new Set),[m,g]=_.useState(!1),[p,v]=_.useState(null),[S,x]=_.useState(!1),j=t.find(y=>y.id===p),M=_.useMemo(()=>t.filter(y=>{const b=y.name.toLowerCase().includes(l.toLowerCase()),D=ue(y);return b&&(c==="all"||(c==="black_hole"?D==="black_hole":D===c)||c==="planet"&&D==="asteroid")}),[t,l,c]),P=_.useMemo(()=>({all:t.length,star:t.filter(y=>ue(y)==="star").length,planet:t.filter(y=>{const b=ue(y);return b==="planet"||b==="asteroid"}).length,black_hole:t.filter(y=>ue(y)==="black_hole").length}),[t]),w=y=>{const b=ue(y);return b==="star"?o.jsx(it,{size:16,color:"#fbbf24"}):b==="black_hole"?o.jsx(Ce,{size:16,color:"#c084fc"}):b==="planet"?o.jsx(Te,{size:16,color:"#60a5fa"}):o.jsx(Wo,{size:16,color:"#9ca3af"})},R=(y,b)=>{b.shiftKey||b.ctrlKey||b.metaKey?(g(!0),f(D=>{const I=new Set(D);return I.has(y)?I.delete(y):I.add(y),I})):(m&&u.size>0&&(f(new Set),g(!1)),s(y))},k=()=>{u.forEach(y=>i(y)),r(`${u.size} bodies deleted`,"success"),f(new Set),g(!1),x(!1)};return o.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:[m&&u.size>0&&o.jsxs("div",{style:{padding:"12px 20px",background:"rgba(96, 165, 250, 0.15)",borderBottom:"1px solid rgba(96, 165, 250, 0.3)",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[o.jsxs("div",{style:{fontSize:"0.9rem",color:"#60a5fa"},children:[u.size," ",u.size===1?"body":"bodies"," selected"]}),o.jsxs("div",{style:{display:"flex",gap:"8px"},children:[o.jsx("button",{onClick:()=>{f(new Set),g(!1)},style:{background:"rgba(255, 255, 255, 0.1)",border:"1px solid rgba(255, 255, 255, 0.2)",color:"white",padding:"6px 12px",borderRadius:"4px",cursor:"pointer",fontSize:"0.85rem"},children:"Cancel"}),o.jsxs("button",{onClick:()=>x(!0),style:{background:"rgba(239, 68, 68, 0.2)",border:"1px solid rgba(239, 68, 68, 0.4)",color:"#ef4444",padding:"6px 12px",borderRadius:"4px",cursor:"pointer",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"4px"},children:[o.jsx(Ze,{size:14}),"Delete ",u.size]})]})]}),o.jsxs("div",{style:{padding:"0 20px 10px",background:"rgba(0,0,0,0.2)",borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[o.jsx("div",{style:{display:"flex",justifyContent:"flex-end",paddingTop:"8px",paddingBottom:"4px"},children:o.jsx(at,{topic:"bodies"})}),o.jsxs("div",{className:"lab-search",style:{marginTop:"6px",display:"flex",alignItems:"center",background:"rgba(255,255,255,0.05)",borderRadius:"6px",padding:"4px 8px"},children:[o.jsx(Oo,{size:14,color:"#aaa"}),o.jsx("input",{type:"text",placeholder:e("search_placeholder"),value:l,onChange:y=>d(y.target.value),style:{border:"none",background:"transparent",color:"white",marginLeft:"8px",flex:1,outline:"none",fontSize:"13px"}})]}),o.jsx("div",{style:{display:"flex",gap:"4px",marginTop:"8px",overflowX:"auto",paddingBottom:"4px"},className:"custom-scrollbar",children:["all","star","planet","black_hole"].map(y=>{const b=P[y];return o.jsxs("button",{onClick:()=>h(y),style:{border:"none",background:c===y?"rgba(96, 165, 250, 0.2)":"transparent",color:c===y?"#60a5fa":"#888",fontSize:"11px",padding:"8px 12px",borderRadius:"12px",cursor:"pointer",whiteSpace:"nowrap",textTransform:"capitalize",transition:"all 0.2s",display:"flex",alignItems:"center",gap:"4px",minHeight:"36px"},children:[o.jsx("span",{children:e(`filter_${y}`)}),o.jsx("span",{style:{fontSize:"10px",opacity:.7,fontWeight:600,background:c===y?"rgba(96, 165, 250, 0.2)":"rgba(255, 255, 255, 0.1)",padding:"1px 5px",borderRadius:"8px",minWidth:"18px",textAlign:"center"},children:b})]},y)})})]}),o.jsxs("div",{className:"custom-scrollbar",style:{flex:1,overflowY:"auto",padding:"10px 20px"},children:[M.map(y=>{const b=n===y.id,D=u.has(y.id),I=b||D;return o.jsxs("div",{onClick:T=>R(y.id,T),className:`lab-list-item ${I?"selected":""}`,style:{display:"flex",alignItems:"center",gap:"10px",padding:"8px",marginBottom:"4px",borderRadius:"6px",cursor:"pointer",background:I?"rgba(96, 165, 250, 0.1)":"transparent",border:`1px solid ${I?"rgba(96, 165, 250, 0.3)":"transparent"}`,transition:"all 0.2s",position:"relative"},children:[o.jsx("div",{style:{flexShrink:0},children:w(y)}),o.jsxs("div",{style:{flex:1,minWidth:0},children:[o.jsx("div",{style:{fontSize:"0.9rem",fontWeight:n===y.id?600:400,color:n===y.id?"white":"#ddd"},className:"truncate",children:y.name}),o.jsx("div",{style:{fontSize:"0.75rem",color:"#666",textTransform:"capitalize"},children:e(`filter_${ue(y)}`)})]}),o.jsxs("div",{style:{display:"flex",gap:"4px",opacity:I?1:.5},children:[D&&o.jsx("div",{style:{position:"absolute",top:"8px",left:"8px",width:"6px",height:"6px",borderRadius:"50%",background:"#60a5fa"}}),o.jsx("button",{onClick:T=>{T.stopPropagation(),a(y.id),r(`${y.name} duplicated`,"success")},style:{background:"transparent",border:"none",color:"#aaa",cursor:"pointer",padding:"4px"},title:e("duplicate"),children:o.jsx(Go,{size:14})}),o.jsx("button",{onClick:T=>{T.stopPropagation(),v(y.id)},style:{background:"transparent",border:"none",color:"#aaa",cursor:"pointer",padding:"4px"},title:e("remove"),children:o.jsx(Ze,{size:14})})]})]},y.id)}),M.length===0&&o.jsx("div",{style:{textAlign:"center",color:"#6b7280",padding:"2rem 0",fontSize:"0.875rem"},children:e("no_bodies_found")})]}),o.jsx(De,{isOpen:!!p,title:e("delete_title"),message:e("delete_message").replace("{name}",j?.name||""),onConfirm:()=>{p&&(i(p),r(`${j?.name} deleted`,"success")),v(null)},onCancel:()=>v(null),danger:!0,confirmText:e("delete_confirm"),cancelText:e("delete_cancel")}),o.jsx(De,{isOpen:S,title:"Delete Multiple Bodies",message:`Are you sure you want to delete ${u.size} ${u.size===1?"body":"bodies"}? This action cannot be undone.`,onConfirm:k,onCancel:()=>x(!1),danger:!0,confirmText:"Delete All",cancelText:"Cancel"})]})},Nt=({label:e,value:r,onChange:t,onCommit:n})=>{const[s,i]=_.useState({x:r.x,y:r.y,z:r.z}),[a,l]=_.useState({x:r.x,y:r.y,z:r.z});if(r.x!==a.x||r.y!==a.y||r.z!==a.z){const h={x:r.x,y:r.y,z:r.z};l(h),i(h)}const d=(h,u)=>{const f=parseFloat(u),m={...s,[h]:isNaN(f)?s[h]:f};i(m)},c=()=>{const h=new z(s.x,s.y,s.z);h.equals(r)||(n&&n(r.clone(),h),t(h))};return o.jsxs("div",{className:"lab-field",children:[o.jsx("label",{className:"lab-label",style:{textTransform:"uppercase",letterSpacing:"0.05em"},children:e}),o.jsx("div",{className:"lab-vector-grid",children:["x","y","z"].map(h=>o.jsxs("div",{className:"lab-vector-field",children:[o.jsx("span",{className:"lab-vector-label",children:h}),o.jsx("input",{type:"number",value:s[h],onChange:u=>d(h,u.target.value),onBlur:c,onKeyDown:u=>u.key==="Enter"&&c(),className:"lab-vector-input"})]},h))})]})},Ut=({value:e,onChange:r,onCommit:t,min:n,max:s,className:i,style:a,placeholder:l})=>{const[d,c]=_.useState(e.toString()),[h,u]=_.useState(null),[f,m]=_.useState(null),[g,p]=_.useState(e);e!==g&&(p(e),c(e.toString()),u(null));const v=j=>{const M=j.target.value;c(M);const P=parseFloat(M);if(!(M===""||M==="-")){if(isNaN(P)){u("Invalid number");return}if(n!==void 0&&P<n){u(`Min: ${n}`);return}if(s!==void 0&&P>s){u(`Max: ${s}`);return}u(null),r(P)}},S=()=>{m(e)},x=()=>{h||d===""||d==="-"?(c(e.toString()),u(null)):t&&f!==null&&t(f,parseFloat(d)),m(null)};return o.jsxs("div",{style:{position:"relative",width:"100%"},children:[o.jsx("input",{type:"text",value:d,onChange:v,onFocus:S,onBlur:x,className:i,style:{...a,borderColor:h?"#ef4444":a?.borderColor},placeholder:l}),h&&o.jsx("div",{style:{position:"absolute",right:0,top:"-18px",fontSize:"0.7rem",color:"#ef4444",background:"rgba(0,0,0,0.8)",padding:"1px 4px",borderRadius:"2px",zIndex:10},children:h})]})},ei=({body:e})=>{const r=C(b=>b.updateBody),t=C(b=>b.selectBody),n=C(b=>b.removeBody),s=C(b=>b.setFollowingBody),i=C(b=>b.followingBodyId),a=C(b=>b.pushHistoryAction),l=C(b=>b.triggerSupernova),d=C(b=>b.supernovaEvents),c=C(b=>b.supernovaScenario),h=C(b=>b.bodies),{t:u}=Y(),{showToast:f}=wo(),[m,g]=_.useState(!0),[p,v]=_.useState(!1),[S,x]=_.useState(!1),j=h.find(b=>b.name==="Sun"),M=d.some(b=>b.starId===e.id),P=c.active&&c.targetStarId===e.id,w=M||P,R=e.mass>2e5?u("supernova_remnant_label_black_hole"):u("supernova_remnant_label_neutron_star"),k=j&&e.id!==j.id?e.position.distanceTo(j.position).toFixed(1):"0.0",y=e.velocity.length().toFixed(3);return o.jsxs("div",{className:"inspector-content",style:{padding:"0 20px 20px"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"},children:[o.jsxs("h3",{style:{margin:0,fontSize:"18px",fontWeight:600,display:"flex",alignItems:"center",gap:"8px",color:"white"},children:[o.jsx(st,{size:16,color:"#60a5fa"}),e.name]}),o.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[o.jsx(at,{topic:"inspector"}),o.jsx("button",{onClick:()=>t(null),style:{background:"transparent",border:"none",color:"rgba(255, 255, 255, 0.5)",cursor:"pointer",padding:"4px"},title:"Close inspector",children:o.jsx(Be,{size:20})})]})]}),o.jsxs("div",{style:{display:"grid",gap:"10px",fontSize:"14px"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[o.jsxs("span",{style:{color:"#888"},children:[u("distance_sun"),":"]}),o.jsxs("span",{children:[k," AU"]})]}),o.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[o.jsxs("span",{style:{color:"#888"},children:[u("orbital_speed"),":"]}),o.jsxs("span",{children:[y," km/s"]})]}),o.jsx("hr",{style:{borderColor:"rgba(255,255,255,0.1)",width:"100%",margin:"10px 0"}}),o.jsxs("div",{style:{marginBottom:"5px"},children:[o.jsx("label",{style:{display:"block",color:"#888",marginBottom:"5px"},children:"Name"}),o.jsx("input",{type:"text",value:e.name,onChange:b=>r(e.id,{name:b.target.value}),onFocus:b=>{b.target.dataset.startValue=b.target.value},onBlur:b=>{const D=b.target.dataset.startValue;D!==void 0&&D!==b.target.value&&a({type:"UPDATE",id:e.id,previous:{name:D},current:{name:b.target.value}})},className:"lab-input",style:{width:"100%",boxSizing:"border-box",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",padding:"6px",borderRadius:"4px",color:"white"}})]}),o.jsxs("div",{style:{marginBottom:"5px"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[o.jsxs("label",{style:{display:"block",color:"#888",marginBottom:"5px"},children:[u("mass")," ",o.jsx("span",{style:{fontSize:"0.8em",color:"#666"},children:"(M☉)"})]}),o.jsxs("span",{style:{fontSize:"10px",color:"#666"},children:["10^",Math.log10(e.mass).toFixed(1)]})]}),o.jsx("input",{type:"range",min:"-2",max:"6",step:"0.1",value:Math.log10(e.mass>0?e.mass:1),onChange:b=>r(e.id,{mass:Math.pow(10,parseFloat(b.target.value))}),onPointerDown:b=>{b.target.dataset.startMass=e.mass.toString()},onPointerUp:b=>{const D=parseFloat(b.target.dataset.startMass||"0");!isNaN(D)&&D!==e.mass&&a({type:"UPDATE",id:e.id,previous:{mass:D},current:{mass:e.mass}})},className:"lab-range",style:{marginBottom:"5px",width:"100%"}}),o.jsx(Ut,{value:e.mass,onChange:b=>r(e.id,{mass:b}),onCommit:(b,D)=>{b!==D&&a({type:"UPDATE",id:e.id,previous:{mass:b},current:{mass:D}})},min:1e-4,step:.1,style:{width:"100%",boxSizing:"border-box",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",padding:"6px",borderRadius:"4px",color:"white"}})]}),o.jsxs("div",{style:{marginBottom:"5px"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[o.jsxs("label",{style:{display:"block",color:"#888",marginBottom:"5px"},children:["Radius ",o.jsx("span",{style:{fontSize:"0.8em",color:"#666"},children:"(R⊕)"})]}),o.jsx("span",{style:{fontSize:"10px",color:"#666"},children:e.radius.toFixed(1)})]}),o.jsx("input",{type:"range",min:"0.1",max:"100",step:"0.1",value:e.radius,onChange:b=>r(e.id,{radius:parseFloat(b.target.value)}),onPointerDown:b=>{b.target.dataset.startRadius=e.radius.toString()},onPointerUp:b=>{const D=parseFloat(b.target.dataset.startRadius||"0");!isNaN(D)&&D!==e.radius&&a({type:"UPDATE",id:e.id,previous:{radius:D},current:{radius:e.radius}})},className:"lab-range",style:{width:"100%"}})]}),o.jsxs("div",{style:{marginBottom:"5px"},children:[o.jsx("div",{style:{display:"flex",justifyContent:"space-between"},children:o.jsx("label",{style:{display:"block",color:"#888",marginBottom:"5px"},children:u("rotation_speed")})}),o.jsx("input",{type:"range",min:"0",max:"10",step:"0.1",value:e.rotationSpeed||1,onChange:b=>r(e.id,{rotationSpeed:parseFloat(b.target.value)}),onPointerDown:b=>{b.target.dataset.startSpeed=(e.rotationSpeed||1).toString()},onPointerUp:b=>{const D=parseFloat(b.target.dataset.startSpeed||"0"),I=e.rotationSpeed||1;!isNaN(D)&&D!==I&&a({type:"UPDATE",id:e.id,previous:{rotationSpeed:D},current:{rotationSpeed:I}})},className:"lab-range",style:{marginBottom:"5px",width:"100%"}}),o.jsx(Ut,{value:e.rotationSpeed||1,onChange:b=>r(e.id,{rotationSpeed:b}),onCommit:(b,D)=>{b!==D&&a({type:"UPDATE",id:e.id,previous:{rotationSpeed:b},current:{rotationSpeed:D}})},min:0,step:.1,style:{width:"100%",boxSizing:"border-box",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",padding:"6px",borderRadius:"4px",color:"white"}})]}),o.jsxs("div",{style:{marginBottom:"5px"},children:[o.jsx("label",{style:{display:"block",color:"#888",marginBottom:"5px"},children:u("color")}),o.jsxs("div",{style:{display:"flex",gap:"8px"},children:[o.jsx("input",{type:"color",value:e.color,onChange:b=>r(e.id,{color:b.target.value}),onFocus:b=>{b.target.dataset.startColor=e.color},onBlur:b=>{const D=b.target.dataset.startColor;D&&D!==e.color&&a({type:"UPDATE",id:e.id,previous:{color:D},current:{color:e.color}})},style:{width:"40px",height:"36px",border:"none",borderRadius:"4px",padding:0,cursor:"pointer",background:"transparent"}}),o.jsx("input",{type:"text",value:e.color,onChange:b=>r(e.id,{color:b.target.value}),onFocus:b=>{b.target.dataset.startColor=e.color},onBlur:b=>{const D=b.target.dataset.startColor;D&&D!==e.color&&a({type:"UPDATE",id:e.id,previous:{color:D},current:{color:e.color}})},style:{flex:1,background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",padding:"6px",borderRadius:"4px",color:"white"}})]})]}),o.jsx("hr",{style:{borderColor:"rgba(255,255,255,0.1)",width:"100%",margin:"10px 0"}}),o.jsxs("button",{onClick:()=>g(!m),style:{background:"transparent",border:"none",color:"#60a5fa",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"5px 0",cursor:"pointer",fontSize:"12px",fontWeight:600,letterSpacing:"1px"},children:["VECTORS & PHYSICS",m?o.jsx(qt,{size:14}):o.jsx($t,{size:14})]}),e.isStar&&o.jsxs("div",{style:{marginTop:"10px"},children:[o.jsx(Nt,{label:"Position",value:e.position,onChange:b=>r(e.id,{position:b}),onCommit:(b,D)=>{b.equals(D)||a({type:"UPDATE",id:e.id,previous:{position:b},current:{position:D}})}}),o.jsx("div",{style:{height:"10px"}}),o.jsx(Nt,{label:"Velocity",value:e.velocity,onChange:b=>r(e.id,{velocity:b}),onCommit:(b,D)=>{b.equals(D)||a({type:"UPDATE",id:e.id,previous:{velocity:b},current:{velocity:D}})}})]}),o.jsxs("div",{style:{marginTop:"10px",display:"flex",gap:"8px"},children:[o.jsx("button",{onClick:()=>s(i===e.id?null:e.id),style:{flex:1,padding:"8px",background:i===e.id?"rgba(34, 170, 255, 0.3)":"rgba(255, 255, 255, 0.1)",border:`1px solid ${i===e.id?"#22aaff":"rgba(255, 255, 255, 0.2)"} `,borderRadius:"6px",color:"white",cursor:"pointer",transition:"all 0.2s",fontWeight:500,fontSize:"0.9rem"},children:i===e.id?u("stop_following"):u("camera_follow")}),!e.isFixed&&o.jsx("button",{onClick:()=>v(!0),style:{padding:"8px",background:"rgba(255, 64, 80, 0.2)",border:"1px solid rgba(255, 64, 80, 0.4)",borderRadius:"6px",color:"#ff4050",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},title:u("remove"),children:o.jsx(Ze,{size:16})})]}),e.isStar&&e.mass>1e5&&o.jsx("div",{style:{marginTop:"8px"},children:o.jsxs("button",{onClick:()=>x(!0),disabled:w,style:{width:"100%",padding:"10px",background:w?"linear-gradient(135deg, rgba(120, 120, 120, 0.15), rgba(80, 80, 80, 0.12))":"linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(147, 51, 234, 0.2))",border:w?"1px solid rgba(255, 255, 255, 0.14)":"1px solid rgba(239, 68, 68, 0.4)",borderRadius:"6px",color:w?"rgba(255,255,255,0.5)":"#ef4444",cursor:w?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",fontWeight:600,fontSize:"0.95rem",transition:"all 0.2s"},onMouseEnter:b=>{w||(b.currentTarget.style.background="linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(147, 51, 234, 0.3))",b.currentTarget.style.borderColor="rgba(239, 68, 68, 0.6)")},onMouseLeave:b=>{w||(b.currentTarget.style.background="linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(147, 51, 234, 0.2))",b.currentTarget.style.borderColor="rgba(239, 68, 68, 0.4)")},children:[o.jsx(Ce,{size:18}),u("supernova_button")]})})]}),o.jsx(De,{isOpen:p,title:u("delete_title"),message:u("delete_message").replace("{name}",e.name),onConfirm:()=>{n(e.id),f(`${e.name} deleted`,"success"),t(null),v(!1)},onCancel:()=>v(!1),danger:!0,confirmText:u("delete_confirm"),cancelText:u("delete_cancel")}),o.jsx(De,{isOpen:S,title:`⭐ ${u("supernova_modal_title")}`,message:u("supernova_modal_message").replace("{name}",e.name).replace("{remnant}",R),onConfirm:()=>{l(e.id),f(u("supernova_toast_triggered").replace("{name}",e.name),"success"),x(!1)},onCancel:()=>x(!1),danger:!0,confirmText:u("supernova_modal_confirm"),cancelText:u("supernova_modal_cancel")})]})},ti=()=>{const{t:e}=Y(),r=C(s=>s.selectedBodyId),n=C(s=>s.bodies).find(s=>s.id===r);return n?o.jsx(ei,{body:n}):o.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:"#6b7280",textAlign:"center",padding:"20px"},children:[o.jsx(Te,{size:48,style:{marginBottom:"15px",opacity:.5}}),o.jsx("p",{style:{fontSize:"0.9rem"},children:e("select_body_msg")})]})},oi=e=>{switch(e){case"classic":return o.jsx(it,{color:"#fcd34d"});case"multi-star":return o.jsx(pt,{color:"#60a5fa",fill:"#60a5fa",fillOpacity:.2});case"choreography":return o.jsx(Ho,{color:"#a78bfa"});case"catastrophic":return o.jsx(Ye,{color:"#ef4444"});default:return o.jsx(pt,{color:"#94a3b8"})}},Co=({isOpen:e,onClose:r})=>{const t=C(x=>x.loadStarSystem),n=C(x=>x.currentSystemId),s=C(x=>x.currentSystemMode),[i,a]=_.useState({}),[l,d]=_.useState(null),[c,h]=_.useState(!1),[u,f]=_.useState(typeof window<"u"&&window.innerWidth<768),m=typeof navigator<"u"&&navigator.language.startsWith("ja");B.useEffect(()=>{const x=()=>f(window.innerWidth<768);return window.addEventListener("resize",x),()=>window.removeEventListener("resize",x)},[]),B.useEffect(()=>{e&&n&&s&&a(x=>({...x,[n]:s}))},[e,n,s]);const g=()=>{h(!0),setTimeout(()=>{h(!1),r()},300)};if(!e)return null;const p=x=>{const j=i[x];t(x,j),r()},v=(x,j)=>{a(M=>({...M,[x]:j}))},S=o.jsxs("div",{style:{position:"fixed",top:u?"auto":"10px",left:u?"8px":"auto",bottom:u?"8px":"auto",right:u?"8px":"10px",width:u?"calc(100% - 16px)":"900px",height:u?"auto":"calc(100vh - 20px)",maxHeight:u?"50vh":"800px",minHeight:u?"240px":"auto",background:"rgba(20, 20, 30, 0.92)",backdropFilter:"blur(16px)",border:"1px solid rgba(255, 255, 255, 0.15)",borderRadius:u?"12px":"8px",display:"flex",flexDirection:"column",boxShadow:u?"0 -4px 20px rgba(0, 0, 0, 0.5)":"0 8px 32px rgba(0, 0, 0, 0.4)",overflow:"hidden",zIndex:2e3,transition:"all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",transform:c?u?"translateY(calc(100% + 16px))":"translateX(calc(100% + 20px))":u?"translateY(0)":"translateX(0)",opacity:c?0:1,animation:c?"none":u?"slideUpIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)":"slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"},children:[o.jsxs("div",{style:{padding:u?"12px 16px":"16px 24px",borderBottom:"1px solid rgba(255, 255, 255, 0.08)",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(0,0,0,0.1)",flexShrink:0,minHeight:u?"56px":"64px"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[o.jsx(Zt,{size:u?18:20,color:"#3b82f6"}),o.jsx("h2",{style:{margin:0,color:"white",fontSize:u?"1rem":"1.1rem",fontWeight:600,letterSpacing:"0.02em"},children:m?"恒星系ギャラリー":"Star System Gallery"})]}),o.jsx("button",{onClick:g,style:{background:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.12)",borderRadius:"8px",color:"rgba(255, 255, 255, 0.6)",cursor:"pointer",fontSize:u?"20px":"24px",lineHeight:1,width:u?"32px":"36px",height:u?"32px":"36px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",fontWeight:300},onMouseEnter:x=>{x.currentTarget.style.background="rgba(255, 255, 255, 0.15)",x.currentTarget.style.color="rgba(255, 255, 255, 0.9)",x.currentTarget.style.borderColor="rgba(255, 255, 255, 0.2)"},onMouseLeave:x=>{x.currentTarget.style.background="rgba(255, 255, 255, 0.08)",x.currentTarget.style.color="rgba(255, 255, 255, 0.6)",x.currentTarget.style.borderColor="rgba(255, 255, 255, 0.12)"},children:"×"})]}),o.jsx("div",{style:{padding:u?"12px":"14px",overflowY:"auto",display:"grid",gridTemplateColumns:u?"1fr":"repeat(auto-fill, minmax(220px, 1fr))",gridAutoRows:"1fr",gap:"10px",flex:1},children:fo.map(x=>{const j=n===x.id,M=l===x.id,P=i[x.id]||(x.modes?.[0]?.id??void 0),w=j&&x.modes&&P!==s,R=j&&(!x.modes||P===s);return o.jsxs("div",{onMouseEnter:()=>d(x.id),onMouseLeave:()=>d(null),style:{background:j?"linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 58, 138, 0.2) 100%)":"rgba(255, 255, 255, 0.03)",border:j?"1px solid rgba(59, 130, 246, 0.5)":M?"1px solid rgba(255, 255, 255, 0.2)":"1px solid rgba(255, 255, 255, 0.08)",borderRadius:"8px",padding:"12px",cursor:"default",transition:"all 0.2s ease",transform:M?"translateY(-2px)":"none",boxShadow:M?"0 10px 25px -5px rgba(0, 0, 0, 0.3)":"none",display:"flex",flexDirection:"column",height:"100%"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:u?"8px":"10px"},children:[o.jsx("div",{style:{width:u?"32px":"36px",height:u?"32px":"36px",borderRadius:"7px",background:j?"rgba(59, 130, 246, 0.2)":"rgba(255, 255, 255, 0.05)",display:"flex",justifyContent:"center",alignItems:"center",border:"1px solid rgba(255, 255, 255, 0.05)",flexShrink:0},children:B.cloneElement(oi(x.category),{size:u?18:20})}),o.jsxs("div",{style:{flex:1,minWidth:0},children:[o.jsx("h3",{style:{margin:"0 0 2px 0",color:"white",fontSize:u?"0.85rem":"0.9rem",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:m?x.nameJa:x.name}),o.jsx("span",{style:{fontSize:u?"0.6rem":"0.65rem",color:j?"#60a5fa":"#64748b",fontWeight:500},children:x.category.toUpperCase()})]})]}),o.jsx("p",{style:{margin:u?"0 0 8px 0":"0 0 10px 0",color:"#94a3b8",fontSize:u?"0.7rem":"0.75rem",lineHeight:1.4,flex:1,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",textOverflow:"ellipsis"},children:m?x.descriptionJa:x.description}),x.modes&&o.jsxs("div",{style:{marginBottom:u?"8px":"10px"},children:[o.jsx("label",{style:{display:"block",fontSize:u?"0.6rem":"0.65rem",color:"#64748b",marginBottom:u?"5px":"6px",fontWeight:600},children:m?"モード選択":"SELECT MODE"}),o.jsx("div",{style:{display:"flex",background:"rgba(0, 0, 0, 0.3)",borderRadius:"5px",padding:"2px",gap:"2px"},children:x.modes.map(k=>{const y=P===k.id;return o.jsx("button",{onClick:b=>{b.stopPropagation(),v(x.id,k.id)},style:{flex:1,padding:u?"4px 3px":"5px 4px",fontSize:u?"0.6rem":"0.65rem",fontWeight:500,background:y?"rgba(55, 65, 81, 0.8)":"transparent",color:y?"white":"#94a3b8",border:"none",borderRadius:"4px",cursor:"pointer",transition:"all 0.2s",borderBottom:y?"2px solid #3b82f6":"2px solid transparent"},children:m?k.nameJa:k.name},k.id)})})]}),o.jsx("button",{onClick:k=>{k.stopPropagation(),p(x.id)},disabled:R,style:{width:"100%",padding:u?"7px":"8px",background:R?"rgba(16, 185, 129, 0.1)":w?"#3b82f6":"white",color:R?"#10b981":w?"white":"black",border:R?"1px solid rgba(16, 185, 129, 0.3)":"none",borderRadius:"6px",cursor:R?"default":"pointer",fontWeight:600,fontSize:u?"0.75rem":"0.8rem",transition:"all 0.2s",display:"flex",justifyContent:"center",alignItems:"center",gap:u?"5px":"6px"},onMouseEnter:k=>{R||(k.currentTarget.style.background=w?"#2563eb":"#e2e8f0")},onMouseLeave:k=>{R||(k.currentTarget.style.background=w?"#3b82f6":"white")},children:R?o.jsxs(o.Fragment,{children:[o.jsx(Yt,{size:u?13:14}),m?"読み込み済み":"Active"]}):w?o.jsxs(o.Fragment,{children:[o.jsx(Ye,{size:u?13:14}),m?"モード切替":"Switch Mode"]}):o.jsxs(o.Fragment,{children:[o.jsx(Ye,{size:u?13:14}),m?"シミュレーション開始":"Launch Simulation"]})})]},x.id)})})]});return et.createPortal(S,document.body)};if(typeof document<"u"){const e="gallery-modal-animations";if(!document.getElementById(e)&&!document.getElementById("help-modal-animations")){const r=document.createElement("style");r.id=e,r.textContent=`
            @keyframes slideInRight {
                from {
                    transform: translateX(calc(100% + 20px));
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideUpIn {
                from {
                    transform: translateY(calc(100% + 16px));
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `,document.head.appendChild(r)}}const K=B.forwardRef(({variant:e="secondary",size:r="md",leftIcon:t,rightIcon:n,iconOnly:s=!1,fullWidth:i=!1,loading:a=!1,disabled:l,className:d="",children:c,style:h,...u},f)=>{const m=["btn",`btn-${e}`,r!=="md"&&`btn-${r}`,s&&"btn-icon",i&&"btn-full",d].filter(Boolean).join(" "),g=r==="sm"?14:r==="lg"?20:16;return o.jsxs("button",{ref:f,className:m,disabled:l||a,style:h,...u,children:[a&&o.jsx("span",{className:"btn-spinner","aria-hidden":"true",style:{display:"inline-block",animation:"spin 1s linear infinite"},children:"⟳"}),!a&&t&&o.jsx(t,{size:g,"aria-hidden":"true"}),!s&&c,!a&&n&&o.jsx(n,{size:g,"aria-hidden":"true"})]})});K.displayName="Button";if(typeof document<"u"){const e=document.createElement("style");e.textContent=`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,document.head.appendChild(e)}const Ve=({title:e,defaultOpen:r=!0,icon:t,children:n,className:s="",onToggle:i})=>{const[a,l]=_.useState(r),d=()=>{const c=!a;l(c),i?.(c)};return o.jsxs("div",{className:`accordion ${s}`,children:[o.jsxs("button",{className:"accordion-header",onClick:d,"aria-expanded":a,type:"button",children:[o.jsxs("span",{className:"accordion-title",children:[t&&o.jsx(t,{size:16,className:"accordion-icon","aria-hidden":"true"}),e]}),o.jsx("span",{className:"accordion-toggle","aria-hidden":"true",children:a?o.jsx(qt,{size:16}):o.jsx($t,{size:16})})]}),a&&o.jsx("div",{className:"accordion-content",children:n})]})},qe=({items:e,label:r})=>o.jsxs("div",{className:"checkbox-group",children:[r&&o.jsx("div",{className:"checkbox-group-label",children:r}),o.jsx("div",{className:"checkbox-group-items",children:e.map(t=>o.jsxs("label",{className:`checkbox-wrapper ${t.disabled?"disabled":""}`,children:[o.jsx("input",{type:"checkbox",checked:t.checked,onChange:n=>t.onChange(n.target.checked),disabled:t.disabled}),o.jsx("span",{className:"checkbox-label",children:t.label}),t.warning&&o.jsx("span",{title:"High performance cost",style:{marginLeft:"auto",display:"flex",alignItems:"center"},children:o.jsx(Xt,{size:14,className:"checkbox-icon-warning",style:{color:"var(--color-warning)"}})}),t.badge&&o.jsxs("span",{className:`badge badge-${t.badgeType||"primary"} badge-sm`,style:{marginLeft:"auto"},children:[t.badgeType==="success"&&o.jsx(Ce,{size:10,fill:"currentColor"}),t.badge]})]},t.id))})]}),ri=({content:e,children:r,position:t="top",delay:n=300,disabled:s=!1})=>{const[i,a]=_.useState(!1),[l,d]=_.useState({x:0,y:0}),c=_.useRef(null),h=_.useRef(null),u=()=>{s||(c.current=window.setTimeout(()=>{if(h.current){const m=h.current.getBoundingClientRect();d({x:m.left+m.width/2,y:m.top+m.height/2}),a(!0)}},n))},f=()=>{c.current&&(clearTimeout(c.current),c.current=null),a(!1)};return _.useEffect(()=>()=>{c.current&&clearTimeout(c.current)},[]),o.jsxs(o.Fragment,{children:[o.jsx("div",{ref:h,onMouseEnter:u,onMouseLeave:f,style:{display:"inline-block"},children:r}),i&&!s&&o.jsxs("div",{className:`tooltip tooltip-${t}`,style:{left:`${l.x}px`,top:`${l.y}px`},children:[o.jsx("div",{className:"tooltip-content",children:e}),o.jsx("div",{className:"tooltip-arrow"})]})]})},si=()=>{const e=C(w=>w.simulationState),r=C(w=>w.timeScale),t=C(w=>w.setSimulationState),n=C(w=>w.setTimeScale),s=C(w=>w.reset),i=C(w=>w.followingBodyId),a=C(w=>w.cameraMode),l=C(w=>w.setCameraMode),d=C(w=>w.undo),c=C(w=>w.redo),h=C(w=>w.historyIndex),u=C(w=>w.history),f=C(w=>w.userMode),m=C(w=>w.setUserMode),{t:g}=Y(),[p,v]=_.useState(!1),S=f==="beginner",x=()=>{t(e==="running"?"paused":"running")},j=[{id:"grid",label:g("show_grid"),checked:C(w=>w.showGrid),onChange:()=>C.getState().toggleGrid()},{id:"prediction",label:g("show_prediction"),checked:C(w=>w.showPrediction),onChange:()=>C.getState().togglePrediction(),warning:!0},{id:"realistic",label:g("show_realistic"),checked:C(w=>w.showRealisticVisuals),onChange:()=>C.getState().toggleRealisticVisuals()}],M=[{id:"gravity",label:g("show_gravity_field"),checked:C(w=>w.showGravityField),onChange:()=>C.getState().toggleGravityField()},{id:"habitable",label:g("show_habitable"),checked:C(w=>w.showHabitableZone),onChange:()=>C.getState().toggleHabitableZone()},{id:"realistic_distances",label:g("show_realistic_distances"),checked:C(w=>w.useRealisticDistances),onChange:()=>C.getState().toggleRealisticDistances()}],P=[{id:"multithreading",label:g("show_multithreading"),checked:C(w=>w.useMultithreading),onChange:()=>C.getState().toggleMultithreading(),disabled:!C.getState().isWorkerSupported,badge:C.getState().isWorkerSupported?"Available":"N/A",badgeType:C.getState().isWorkerSupported?"success":void 0},{id:"gpu",label:g("show_gpu"),checked:C(w=>w.useGPU),onChange:()=>C.getState().toggleGPU(),disabled:!C(w=>w.isGPUSupported),badge:C(w=>w.isGPUSupported)?"Available":"N/A",badgeType:C(w=>w.isGPUSupported)?"success":void 0},{id:"performance",label:g("show_performance"),checked:C(w=>w.showPerformance),onChange:()=>C.getState().togglePerformance()}];return o.jsxs("div",{className:"simulation-controls",children:[o.jsx("div",{className:"section-header",children:o.jsx(at,{topic:"controls"})}),o.jsx("div",{className:"section",style:{marginBottom:"12px"},children:o.jsx(ri,{content:S?"上級者モードに切り替え（全機能表示）":"初心者モードに切り替え（基本機能のみ）",children:o.jsx(K,{variant:"ghost",leftIcon:S?Vo:qo,onClick:()=>m(S?"advanced":"beginner"),fullWidth:!0,size:"sm",children:S?"上級者モード":"初心者モード"})})}),o.jsxs("div",{className:"section",children:[o.jsxs("div",{className:"flex gap-sm",children:[o.jsx(K,{variant:e==="running"?"danger":"success",leftIcon:e==="running"?Kt:Jt,onClick:x,fullWidth:!0,children:g(e==="running"?"pause":"resume")}),o.jsx(K,{variant:"secondary",leftIcon:Qt,onClick:s,iconOnly:!0,title:g("reset")})]}),o.jsxs("div",{className:"flex gap-sm",style:{marginTop:"8px"},children:[o.jsx(K,{variant:"ghost",leftIcon:$o,onClick:d,disabled:h<=0,fullWidth:!0,size:"sm",title:"Undo (Ctrl+Z)",children:"Undo"}),o.jsx(K,{variant:"ghost",leftIcon:Zo,onClick:c,disabled:h>=u.length,fullWidth:!0,size:"sm",title:"Redo (Ctrl+Shift+Z)",children:"Redo"})]}),o.jsx(K,{variant:"secondary",leftIcon:Yo,onClick:()=>v(!0),fullWidth:!0,style:{marginTop:"8px"},children:g("star_system_gallery")}),o.jsxs("div",{style:{marginTop:"12px"},children:[o.jsxs("label",{className:"text-sm text-secondary",children:[g("time_scale"),": ",r.toFixed(1),"x"]}),o.jsx("input",{type:"range",min:"0.1",max:"5.0",step:"0.1",value:r,onChange:w=>n(parseFloat(w.target.value)),style:{width:"100%",cursor:"pointer",accentColor:"var(--color-primary-500)",marginTop:"4px"}})]})]}),o.jsx(Ve,{title:"表示設定",icon:Vt,defaultOpen:!0,children:o.jsx(qe,{items:j})}),!S&&o.jsx(Ve,{title:"詳細設定",icon:st,defaultOpen:!1,children:o.jsx(qe,{items:M})}),!S&&o.jsx(Ve,{title:"パフォーマンス",icon:Ce,defaultOpen:!1,children:o.jsx(qe,{items:P})}),o.jsxs("div",{className:"section",style:{marginTop:"12px"},children:[o.jsx("div",{className:"section-title",style:{marginBottom:"8px"},children:"カメラモード"}),o.jsx("div",{className:"flex gap-xs",style:{flexWrap:"wrap"},children:[{id:"free",label:g("camera_mode_free")},{id:"sun_lock",label:g("camera_mode_sun")},{id:"surface_lock",label:g("camera_mode_surface")}].map(w=>o.jsx("button",{onClick:()=>i&&l(w.id),disabled:!i&&w.id!=="free",style:{flex:"1 0 80px",padding:"6px 8px",fontSize:"0.75rem",background:a===w.id?"var(--color-primary-500)":"rgba(255,255,255,0.1)",color:"white",border:a===w.id?"1px solid var(--color-primary-400)":"1px solid var(--color-border)",borderRadius:"var(--radius-sm)",cursor:i?"pointer":"not-allowed",opacity:!i&&w.id!=="free"?.5:1,transition:"all 0.2s",textAlign:"center",fontWeight:a===w.id?600:400},title:w.label,children:w.label},w.id))})]}),o.jsx(Co,{isOpen:p,onClose:()=>v(!1)})]})},ii=()=>o.jsxs("div",{role:"tabpanel",id:"controls-panel","aria-labelledby":"controls-tab",style:{padding:"20px"},children:[o.jsx(si,{}),o.jsx(Ks,{})]}),ni=({activeTab:e})=>o.jsxs("div",{className:"tab-content custom-scrollbar",children:[e==="controls"&&o.jsx(ii,{}),e==="bodies"&&o.jsx("div",{role:"tabpanel",id:"bodies-panel","aria-labelledby":"bodies-tab",children:o.jsx(Qs,{})}),e==="inspector"&&o.jsx("div",{role:"tabpanel",id:"inspector-panel","aria-labelledby":"inspector-tab",children:o.jsx(ti,{})})]}),ai="0.6.0",li={version:ai},ci=({isOpen:e,onClose:r})=>{const{t}=Y(),[n,s]=B.useState("controls"),[i,a]=B.useState(!1),[l,d]=B.useState(window.innerWidth<768);B.useEffect(()=>{const h=()=>d(window.innerWidth<768);return window.addEventListener("resize",h),()=>window.removeEventListener("resize",h)},[]);const c=()=>{a(!0),setTimeout(()=>{a(!1),r()},300)};return e?et.createPortal(o.jsxs("div",{style:{position:"fixed",top:l?"auto":"10px",left:l?"8px":"auto",bottom:l?"8px":"auto",right:l?"8px":"10px",width:l?"calc(100% - 16px)":"700px",height:l?"auto":"calc(100vh - 20px)",maxHeight:l?"50vh":"800px",minHeight:l?"240px":"auto",background:"rgba(20, 20, 30, 0.92)",backdropFilter:"blur(16px)",border:"1px solid rgba(255, 255, 255, 0.15)",borderRadius:l?"12px":"8px",display:"flex",flexDirection:"column",boxShadow:l?"0 -4px 20px rgba(0, 0, 0, 0.5)":"0 8px 32px rgba(0, 0, 0, 0.4)",color:"white",overflow:"hidden",zIndex:2e3,transition:"all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",transform:i?l?"translateY(calc(100% + 16px))":"translateX(calc(100% + 20px))":l?"translateY(0)":"translateX(0)",opacity:i?0:1,animation:i?"none":l?"slideUpIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)":"slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"},children:[o.jsxs("div",{style:{padding:l?"12px 16px":"16px 24px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,0.1)",flexShrink:0,minHeight:l?"56px":"64px"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[o.jsx(nt,{size:l?18:20,color:"#3b82f6"}),o.jsx("h2",{style:{margin:0,fontSize:l?"1rem":"1.1rem",fontWeight:600,letterSpacing:"0.02em"},children:t("help_title")})]}),o.jsx("button",{onClick:c,style:{background:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.12)",borderRadius:"8px",color:"rgba(255, 255, 255, 0.6)",cursor:"pointer",fontSize:l?"20px":"24px",lineHeight:1,width:l?"32px":"36px",height:l?"32px":"36px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",fontWeight:300},onMouseEnter:h=>{h.currentTarget.style.background="rgba(255, 255, 255, 0.15)",h.currentTarget.style.color="rgba(255, 255, 255, 0.9)",h.currentTarget.style.borderColor="rgba(255, 255, 255, 0.2)"},onMouseLeave:h=>{h.currentTarget.style.background="rgba(255, 255, 255, 0.08)",h.currentTarget.style.color="rgba(255, 255, 255, 0.6)",h.currentTarget.style.borderColor="rgba(255, 255, 255, 0.12)"},children:"×"})]}),o.jsxs("div",{style:{display:"flex",flex:1,minHeight:0,flexDirection:l?"column":"row"},children:[o.jsxs("div",{style:{width:l?"100%":"200px",minWidth:l?"100%":"200px",borderRight:l?"none":"1px solid rgba(255,255,255,0.1)",borderBottom:l?"1px solid rgba(255,255,255,0.1)":"none",background:"rgba(0,0,0,0.15)",padding:l?"0":"12px 0",display:"flex",flexDirection:l?"row":"column",flexShrink:0,overflowX:l?"auto":"hidden"},children:[o.jsx(Ft,{active:n==="controls",onClick:()=>s("controls"),icon:o.jsx(mt,{size:16}),label:t("controls_header"),isMobile:l}),o.jsx(Ft,{active:n==="changelog",onClick:()=>s("changelog"),icon:o.jsx(Xo,{size:16}),label:t("changelog_header"),isMobile:l}),!l&&o.jsx("div",{style:{flex:1}})," ",o.jsx("div",{style:{padding:l?"0 12px 12px":"12px",borderTop:l?"none":"1px solid rgba(255,255,255,0.05)",display:l?"flex":"block",alignItems:"center",marginLeft:l?"auto":0},children:o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",fontSize:l?"0.7rem":"0.75rem",color:"#64748b",background:"rgba(255,255,255,0.04)",padding:l?"6px 10px":"8px 12px",borderRadius:"6px",justifyContent:"center"},children:[o.jsx(eo,{size:l?12:14}),o.jsxs("span",{style:{fontFamily:"var(--font-mono)"},children:["v",li.version]})]})})]}),o.jsxs("div",{style:{flex:1,padding:l?"16px":"24px",overflowY:"auto"},children:[n==="controls"&&o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"20px"},children:[o.jsxs("div",{children:[o.jsx("h3",{style:{margin:"0 0 12px 0",fontSize:"0.85rem",color:"#64748b",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase"},children:"カメラ操作"}),o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[o.jsx(Pe,{icon:o.jsx(Ko,{size:18}),label:t("ctrl_rotate"),desc:t("ctrl_rotate_desc")}),o.jsx(Pe,{icon:o.jsx(Jo,{size:18}),label:t("ctrl_pan"),desc:t("ctrl_pan_desc")}),o.jsx(Pe,{icon:o.jsx(Qo,{size:18}),label:t("ctrl_zoom"),desc:t("ctrl_zoom_desc")}),o.jsx(Pe,{icon:o.jsx(mt,{size:18}),label:t("ctrl_select"),desc:t("ctrl_select_desc")})]})]}),o.jsxs("div",{children:[o.jsx("h3",{style:{margin:"0 0 12px 0",fontSize:"0.85rem",color:"#64748b",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase"},children:"キーボードショートカット"}),o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[o.jsx(pe,{shortcut:"Alt + 1",desc:"コントロールタブに切り替え"}),o.jsx(pe,{shortcut:"Alt + 2",desc:"天体リストタブに切り替え"}),o.jsx(pe,{shortcut:"Alt + 3",desc:"インスペクタータブに切り替え"}),o.jsx(pe,{shortcut:"Alt + F",desc:"天体検索にフォーカス"}),o.jsx(pe,{shortcut:"Ctrl + Z",desc:"元に戻す (Undo)"}),o.jsx(pe,{shortcut:"Ctrl + Shift + Z",desc:"やり直す (Redo)"})]})]})]}),n==="changelog"&&o.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"20px"},children:ui(t).map((h,u)=>o.jsxs("div",{children:[o.jsxs("h4",{style:{margin:"0 0 8px 0",fontSize:"0.9rem",color:h.isCurrent?"#10b981":"#64748b",display:"flex",alignItems:"center",gap:"8px"},children:[h.title||`v${h.version}`,h.isCurrent&&o.jsx("span",{style:{fontSize:"0.7rem",color:"#94a3b8",fontWeight:"normal"},children:"Current"})]}),o.jsx("div",{style:{background:"rgba(255,255,255,0.02)",borderRadius:"8px",padding:"16px",border:"1px solid rgba(255,255,255,0.05)",opacity:u>2?.7:1},children:o.jsx("ul",{style:{paddingLeft:"20px",margin:0,color:"#e2e8f0",lineHeight:1.8,fontSize:"0.9rem"},children:h.changes.map((f,m)=>o.jsxs("li",{style:{marginBottom:m===h.changes.length-1?0:"8px"},children:[o.jsx(di,{type:f.type}),f.content]},m))})})]},h.version))})]})]})]}),document.body):null},Ft=({active:e,onClick:r,icon:t,label:n,isMobile:s})=>o.jsxs("button",{onClick:r,style:{display:"flex",alignItems:"center",gap:s?"6px":"10px",padding:s?"10px 12px":"10px 20px",width:s?"auto":"100%",flex:s?1:"none",justifyContent:s?"center":"flex-start",background:e?"rgba(59, 130, 246, 0.12)":"transparent",border:"none",borderLeft:!s&&e?"3px solid #3b82f6":"3px solid transparent",borderBottom:s&&e?"2px solid #3b82f6":"2px solid transparent",color:e?"#3b82f6":"#94a3b8",cursor:"pointer",fontSize:s?"0.8rem":"0.9rem",transition:"all 0.2s",whiteSpace:"nowrap",fontWeight:e?600:400},onMouseEnter:i=>{e||(i.currentTarget.style.background="rgba(255, 255, 255, 0.05)")},onMouseLeave:i=>{e||(i.currentTarget.style.background="transparent")},children:[t,n]}),Pe=({icon:e,label:r,desc:t})=>o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"16px",padding:"12px 16px",background:"rgba(255,255,255,0.02)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.03)",transition:"background 0.2s"},onMouseEnter:n=>n.currentTarget.style.background="rgba(255,255,255,0.05)",onMouseLeave:n=>n.currentTarget.style.background="rgba(255,255,255,0.02)",children:[o.jsx("div",{style:{color:"#3b82f6",opacity:.9},children:e}),o.jsxs("div",{style:{flex:1},children:[o.jsx("div",{style:{fontWeight:500,fontSize:"0.9rem",color:"#f1f5f9"},children:r}),o.jsx("div",{style:{fontSize:"0.8rem",color:"#94a3b8"},children:t})]})]}),pe=({shortcut:e,desc:r})=>o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",background:"rgba(255,255,255,0.02)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.03)",transition:"background 0.2s"},onMouseEnter:t=>t.currentTarget.style.background="rgba(255,255,255,0.05)",onMouseLeave:t=>t.currentTarget.style.background="rgba(255,255,255,0.02)",children:[o.jsx("div",{style:{fontSize:"0.85rem",color:"#94a3b8"},children:r}),o.jsx("div",{style:{fontFamily:"var(--font-mono)",fontSize:"0.8rem",color:"#3b82f6",background:"rgba(59, 130, 246, 0.1)",padding:"4px 10px",borderRadius:"4px",border:"1px solid rgba(59, 130, 246, 0.2)",whiteSpace:"nowrap"},children:e})]}),di=({type:e})=>{if(e==="none")return null;let r="#94a3b8",t="Other";switch(e){case"new":r="#10b981",t="新機能";break;case"improve":r="#3b82f6",t="改善";break;case"fix":r="#a855f7",t="修正";break;case"remove":r="#ef4444",t="削除";break;case"tech":r="#f59e0b",t="技術";break}return o.jsx("span",{style:{color:r,fontWeight:"bold",fontSize:"0.75rem",border:`1px solid ${r}4d`,padding:"1px 4px",borderRadius:"4px",marginRight:"8px"},children:t})};if(typeof document<"u"){const e="help-modal-animations";if(!document.getElementById(e)){const r=document.createElement("style");r.id=e,r.textContent=`
            @keyframes slideInRight {
                from {
                    transform: translateX(calc(100% + 20px));
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideUpIn {
                from {
                    transform: translateY(calc(100% + 16px));
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `,document.head.appendChild(r)}}const ui=e=>[{version:"0.6.0",isCurrent:!0,changes:[{type:"improve",content:"統合サイドパネルによるUI刷新（タブ切替式・ラボモード統合）"},{type:"new",content:"惑星テクスチャのプロシージャル生成と星空のまたたき表現"},{type:"improve",content:"スムーズなカメラ切り替えアニメーションの追加"},{type:"fix",content:"リアル距離モード切替時のカメラドリフト修正"},{type:"improve",content:"重力レンズ効果の品質向上（深度対応）"}]},{version:"0.5.0",changes:[{type:"new",content:"天体衝突エフェクト（爆発・衝撃波・破片・熱輝）"},{type:"new",content:"ブラックホール連星プリセットの追加"},{type:"new",content:"ハビタブルゾーンの動的計算と表示"}]},{version:"0.4.1",changes:[{type:"improve",content:"リアル距離モードの時間進行速度調整 (8倍速)"},{type:"new",content:"重力場を表示する機能"},{type:"fix",content:"グリッド表示切り替え時のエラー修正"}]},{version:"0.4.0",title:e("cl_v0_4_0_title"),changes:[{type:"improve",content:e("cl_item_compact")},{type:"new",content:e("cl_item_zen")},{type:"tech",content:e("cl_item_ui")},{type:"new",content:e("cl_item_gallery")}]},{version:"0.3.0",title:e("cl_v0_3_0_title"),changes:[{type:"improve",content:e("cl_item_energy")},{type:"new",content:e("cl_item_hybrid")},{type:"tech",content:e("cl_item_cleanup")}]},{version:"0.2.1",title:e("cl_v0_2_1_title"),changes:[{type:"improve",content:e("cl_item_surface")},{type:"new",content:e("cl_item_perf")},{type:"tech",content:e("cl_item_physics")}]},{version:"0.2.0",changes:[{type:"improve",content:"惑星自転の精密化 (地球を基準とした1日1回転の正確な同期)"},{type:"new",content:"シミュレーション日付の表示 (経過日数・年数)"},{type:"fix",content:"カメラ初期位置と距離感の再調整・初期状態の同期修正"},{type:"tech",content:"WebGPU安定性の向上 (バッファ競合回避による安全性確保)"}]},{version:"0.1.0",changes:[{type:"new",content:"地表視点モード・軌道固定視点モード"},{type:"none",content:"パフォーマンス最適化 (Barnes-Hut, WebWorker, WebGPU準備)"},{type:"none",content:"UI改善 (ヘルプモーダル・操作ガイド)"}]}],pi=({onOpenPanel:e,onSwitchToBodiesTab:r})=>{const t=C(y=>y.simulationState),n=C(y=>y.setSimulationState),s=C(y=>y.reset),i=C(y=>y.cameraMode),a=C(y=>y.setCameraMode),l=C(y=>y.toggleZenMode),d=C(y=>y.followingBodyId),c=C(y=>y.setFollowingBody),h=C(y=>y.bodies),u=C(y=>y.zenMode),[f,m]=B.useState(!1),[g,p]=B.useState(!1),[v,S]=B.useState(!1),{t:x}=Y();B.useEffect(()=>{const y=()=>S(window.innerWidth<=768);return y(),window.addEventListener("resize",y),()=>window.removeEventListener("resize",y)},[]);const M=v?h:h.slice(0,10),P=!v&&h.length>10,w=()=>{n(t==="running"?"paused":"running")},R=()=>{d&&a(i==="free"?"sun_lock":i==="sun_lock"?"surface_lock":"free")},k=()=>{r(),e()};return u?o.jsx("div",{className:"compact-controls-container zen-mode-container",style:{pointerEvents:"auto"},children:o.jsx("div",{className:"compact-toolbar",children:o.jsxs("button",{onClick:l,className:"compact-button",style:{color:"#aaddff"},title:"Exit Zen Mode",children:[o.jsx(er,{size:18}),o.jsx("span",{className:"button-label",children:"Exit"})]})})}):o.jsxs("div",{className:"compact-controls-container",children:[o.jsxs("div",{className:"compact-toolbar",children:[o.jsxs("button",{onClick:e,className:"compact-button",title:x("open_controls"),children:[o.jsx(tr,{size:20}),o.jsx("span",{className:"button-label",children:"Menu"})]}),o.jsxs("button",{onClick:()=>p(!0),className:"compact-button",title:x("help_title"),children:[o.jsx(nt,{size:20}),o.jsx("span",{className:"button-label",children:"Help"})]}),o.jsx("div",{className:"compact-divider"}),o.jsxs("button",{onClick:w,className:"compact-button",style:{color:t==="running"?"#ff4050":"#00ce7c"},title:x(t==="running"?"pause":"resume"),children:[t==="running"?o.jsx(Kt,{size:20}):o.jsx(Jt,{size:20}),o.jsx("span",{className:"button-label",children:t==="running"?"Pause":"Play"})]}),o.jsxs("button",{onClick:s,className:"compact-button",title:x("reset"),children:[o.jsx(Qt,{size:18}),o.jsx("span",{className:"button-label",children:"Reset"})]}),o.jsxs("button",{onClick:()=>m(!0),className:"compact-button",style:{color:"#44aaff"},title:x("star_system_gallery"),children:[o.jsx(Zt,{size:20}),o.jsx("span",{className:"button-label",children:"Gallery"})]}),o.jsxs("button",{onClick:R,disabled:!d,className:"compact-button",style:{color:i==="free"?"white":"#3b82f6",cursor:d?"pointer":"not-allowed",opacity:d?1:.3},title:x("camera_mode"),children:[o.jsx(or,{size:20}),o.jsx("span",{className:"button-label",children:"Camera"})]}),o.jsx("div",{className:"compact-divider"}),o.jsxs("button",{onClick:l,className:"compact-button",style:{color:"#aaddff"},title:"Zen Mode",children:[o.jsx(rr,{size:18}),o.jsx("span",{className:"button-label",children:"Zen"})]}),o.jsx("div",{className:"compact-divider"}),o.jsxs("div",{className:v?"body-switcher-scrollable":"",children:[o.jsxs("button",{className:`compact-button body-button ${d?"":"active"}`,onClick:()=>c(null),title:"フリーカメラ",children:[o.jsx("span",{className:"body-indicator",style:{background:"#666"},children:o.jsx("span",{className:"body-name-short",children:"Fr"})}),o.jsx("span",{className:"button-label",children:"Free"})]}),M.map(y=>{const b=y.name.length>=2?y.name.charAt(0).toUpperCase()+y.name.charAt(1).toLowerCase():y.name.toUpperCase();return o.jsxs("button",{className:`compact-button body-button ${d===y.id?"active":""}`,onClick:()=>c(y.id),title:y.name,children:[o.jsx("span",{className:"body-indicator",style:{background:y.color,boxShadow:`0 0 8px ${y.color}`},children:o.jsx("span",{className:"body-name-short",children:b})}),o.jsx("span",{className:"button-label",children:y.name})]},y.id)})]}),P&&o.jsxs("button",{className:"compact-button more-button",onClick:k,title:`${h.length-10}個の天体を表示`,children:[o.jsx(sr,{size:16}),o.jsx("span",{className:"button-label",children:"More"})]})]}),o.jsx(Co,{isOpen:f,onClose:()=>m(!1)}),o.jsx(ci,{isOpen:g,onClose:()=>p(!1)})]})},mi=({defaultTab:e="controls"})=>{const[r,t]=_.useState(e),[n,s]=_.useState(!0),i=C(l=>l.zenMode),a=C(l=>l.selectedBodyId);return _.useEffect(()=>{a&&(t("inspector"),n||s(!0))},[a]),_.useEffect(()=>{const l=d=>{const c=document.activeElement,h=c?.tagName==="INPUT"||c?.tagName==="TEXTAREA";if(d.altKey&&(d.key==="1"&&(t("controls"),d.preventDefault()),d.key==="2"&&(t("bodies"),d.preventDefault()),d.key==="3"&&(t("inspector"),d.preventDefault()),d.key==="f"&&(t("bodies"),d.preventDefault(),setTimeout(()=>{const u=document.querySelector(".lab-search input");u&&u.focus()},50))),!h&&(d.ctrlKey||d.metaKey)){const u=C.getState();d.key==="z"&&!d.shiftKey&&(u.undo(),d.preventDefault()),d.key==="z"&&d.shiftKey&&(u.redo(),d.preventDefault())}};return window.addEventListener("keydown",l),()=>window.removeEventListener("keydown",l)},[]),o.jsxs(o.Fragment,{children:[(!n||i)&&o.jsx(pi,{onOpenPanel:()=>s(!0),onSwitchToBodiesTab:()=>t("bodies")}),o.jsxs("div",{className:`unified-side-panel ${!n||i?"collapsed":""}`,children:[o.jsx("div",{className:"panel-header",children:o.jsx("button",{className:"close-button",onClick:()=>s(!1),title:"パネルを閉じる",children:"×"})}),o.jsx(Xs,{activeTab:r,onChange:t}),o.jsx(ni,{activeTab:r})]})]})},ze=[{title:"Orbit Simulatorへようこそ",description:"惑星軌道シミュレーターで、重力と天体の動きを体験しましょう。基本的な使い方をご紹介します。"},{title:"カメラ操作",description:"マウスドラッグで視点を回転、ホイールでズーム。天体をクリックして追跡モードに切り替えられます。"},{title:"シミュレーション制御",description:"コントロールパネルで再生/一時停止、時間スケール調整、表示設定の変更ができます。"},{title:"天体の追加と恒星系ギャラリー切り替え",description:"コントロールパネルの天体追加ボタンをクリックして新しい天体を追加できます。また、恒星系ギャラリーボタンを押して好きな世界を表示できます。"},{title:"モード選択",description:"初心者モードでは基本機能のみ表示、上級者モードでは全機能にアクセスできます。いつでも切り替え可能です。"}],fi=()=>{const e=C(g=>g.hasSeenOnboarding),r=C(g=>g.setHasSeenOnboarding),t=C(g=>g.setUserMode),n=C(g=>g.setSimulationState),[s,i]=_.useState(0),[a,l]=_.useState("beginner");if(B.useEffect(()=>{e||n("paused")},[e,n]),e)return null;const d=s===0,c=s===ze.length-1,h=()=>{c?(t(a),r(!0),n("running")):i(g=>g+1)},u=()=>{d||i(g=>g-1)},f=()=>{t("beginner"),r(!0),n("running")},m=ze[s];return o.jsx("div",{className:"onboarding-backdrop",children:o.jsxs("div",{className:"onboarding-modal",children:[o.jsxs("div",{className:"onboarding-header",children:[o.jsxs("div",{className:"onboarding-logo",children:[o.jsx(ir,{size:24}),o.jsx("span",{children:"Orbit Simulator"})]}),o.jsx("button",{className:"onboarding-close",onClick:f,title:"スキップ",children:o.jsx(Be,{size:20})})]}),o.jsxs("div",{className:"onboarding-content",children:[o.jsx("div",{className:"onboarding-step-indicator",children:ze.map((g,p)=>o.jsx("div",{className:`onboarding-dot ${p===s?"active":""} ${p<s?"completed":""}`},p))}),o.jsx("h2",{className:"onboarding-title",children:m.title}),o.jsx("p",{className:"onboarding-description",children:m.description}),c&&o.jsxs("div",{className:"onboarding-mode-selection",children:[o.jsxs("button",{className:`mode-card ${a==="beginner"?"selected":""}`,onClick:()=>l("beginner"),children:[o.jsxs("div",{className:"mode-card-header",children:[o.jsx("div",{className:"mode-card-icon",children:"🌱"}),o.jsx("h3",{children:"初心者モード"})]}),o.jsx("p",{children:"基本的な機能のみ表示し、シンプルな操作で始められます"}),o.jsx("div",{className:"mode-card-badge",children:"おすすめ"})]}),o.jsxs("button",{className:`mode-card ${a==="advanced"?"selected":""}`,onClick:()=>l("advanced"),children:[o.jsxs("div",{className:"mode-card-header",children:[o.jsx("div",{className:"mode-card-icon",children:"🚀"}),o.jsx("h3",{children:"上級者モード"})]}),o.jsx("p",{children:"全ての機能と詳細設定にアクセスできます"})]})]})]}),o.jsxs("div",{className:"onboarding-footer",children:[o.jsx(K,{variant:"ghost",onClick:u,leftIcon:nr,disabled:d,children:"戻る"}),o.jsxs("div",{className:"onboarding-progress",children:[s+1," / ",ze.length]}),o.jsx(K,{variant:"primary",onClick:h,rightIcon:c?void 0:ar,children:c?"始める":"次へ"})]})]})})},hi=({children:e})=>{const[r,t]=_.useState([]),n=_.useCallback((i,a="info")=>{const l=Math.random().toString(36).substring(2,9);t(d=>[...d,{id:l,message:i,type:a}]),setTimeout(()=>{t(d=>d.filter(c=>c.id!==l))},3e3)},[]),s=_.useCallback(i=>{t(a=>a.filter(l=>l.id!==i))},[]);return o.jsxs(So.Provider,{value:{showToast:n},children:[e,et.createPortal(o.jsx("div",{style:{position:"fixed",bottom:"24px",right:"24px",display:"flex",flexDirection:"column",gap:"8px",zIndex:9999,pointerEvents:"none"},children:r.map(i=>o.jsxs("div",{style:{pointerEvents:"auto",background:"rgba(20, 20, 30, 0.9)",backdropFilter:"blur(12px)",border:`1px solid ${i.type==="success"?"rgba(16, 185, 129, 0.3)":i.type==="error"?"rgba(239, 68, 68, 0.3)":"rgba(59, 130, 246, 0.3)"}`,borderRadius:"8px",padding:"12px 16px",minWidth:"300px",boxShadow:"0 4px 12px rgba(0, 0, 0, 0.3)",display:"flex",alignItems:"center",gap:"12px",color:"white",fontSize:"0.9rem",animation:"slideIn 0.3s ease-out forwards",transform:"translateX(0)",opacity:1},children:[o.jsxs("div",{style:{color:i.type==="success"?"#10b981":i.type==="error"?"#ef4444":"#3b82f6",display:"flex",alignItems:"center"},children:[i.type==="success"&&o.jsx(Yt,{size:18}),i.type==="error"&&o.jsx(Xt,{size:18}),i.type==="info"&&o.jsx(eo,{size:18})]}),o.jsx("span",{style:{flex:1},children:i.message}),o.jsx("button",{onClick:()=>s(i.id),style:{background:"transparent",border:"none",color:"rgba(255, 255, 255, 0.4)",cursor:"pointer",padding:"4px",display:"flex",alignItems:"center"},children:o.jsx(Be,{size:14})})]},i.id))}),document.body),o.jsx("style",{children:`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `})]})};class gi extends _.Component{constructor(r){super(r),this.state={hasError:!1,error:null}}static getDerivedStateFromError(r){return{hasError:!0,error:r}}componentDidCatch(r,t){console.error("ErrorBoundary caught an error:",r,t)}render(){return this.state.hasError?this.props.fallback?this.props.fallback:o.jsxs("div",{style:{width:"100vw",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0a0a0a",color:"white",fontFamily:"Inter, sans-serif",padding:"20px",boxSizing:"border-box"},children:[o.jsx("h1",{style:{fontSize:"2rem",marginBottom:"1rem"},children:"⚠️ Something went wrong"}),o.jsx("p",{style:{fontSize:"1rem",opacity:.7,textAlign:"center",maxWidth:"600px"},children:"The orbit simulator encountered an error. This might be due to:"}),o.jsxs("ul",{style:{textAlign:"left",opacity:.7,marginTop:"1rem"},children:[o.jsx("li",{children:"WebGL not being supported on your device"}),o.jsx("li",{children:"Insufficient memory or GPU resources"}),o.jsx("li",{children:"A rendering error with visual effects"})]}),o.jsxs("div",{style:{marginTop:"2rem",padding:"1rem",background:"rgba(255,255,255,0.1)",borderRadius:"8px",maxWidth:"800px",overflow:"auto",fontSize:"0.9rem",fontFamily:"monospace"},children:[o.jsx("strong",{children:"Error details:"}),o.jsx("pre",{style:{margin:"0.5rem 0",whiteSpace:"pre-wrap"},children:this.state.error?.message||"Unknown error"})]}),o.jsx("button",{onClick:()=>window.location.reload(),style:{marginTop:"2rem",padding:"12px 24px",background:"#3b82f6",color:"white",border:"none",borderRadius:"8px",fontSize:"1rem",cursor:"pointer",fontWeight:600},children:"Reload Page"})]}):this.props.children}}const vi=e=>{switch(e){case"intro":return"supernova_phase_intro";case"countdown":return"supernova_phase_countdown";case"shock-breakout":return"supernova_phase_breakout";case"ejecta":return"supernova_phase_ejecta";case"remnant":return"supernova_phase_remnant";case"complete":return"supernova_phase_complete";default:return"supernova_phase_intro"}},xi=()=>{const e=C(c=>c.supernovaScenario),r=C(c=>c.loadStarSystem),t=C(c=>c.selectBody),n=C(c=>c.setFollowingBody),s=C(c=>c.setCameraMode),i=C(c=>c.clearSupernovaScenario),{t:a}=Y(),l=_.useMemo(()=>e.phase!=="countdown"?null:Math.max(1,Math.ceil(e.countdownRemainingMs/1e3)),[e.countdownRemainingMs,e.phase]);if(!e.active)return null;const d=e.phase==="complete"&&!!e.remnantBodyId;return o.jsx("div",{style:{position:"absolute",inset:0,pointerEvents:"none",display:"flex",justifyContent:"center",alignItems:"flex-start",paddingTop:"32px"},children:o.jsxs("div",{style:{minWidth:"280px",maxWidth:"min(520px, calc(100vw - 48px))",padding:"18px 22px",borderRadius:"18px",background:"linear-gradient(180deg, rgba(5, 10, 20, 0.82), rgba(10, 18, 34, 0.68))",border:"1px solid rgba(186, 211, 255, 0.22)",boxShadow:"0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(122, 165, 255, 0.08)",backdropFilter:"blur(14px)",color:"white",textAlign:"center",pointerEvents:"auto"},children:[o.jsx("div",{style:{fontSize:"0.72rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#9fb9ff",marginBottom:"8px"},children:a("supernova_overlay_kicker")}),o.jsx("div",{style:{fontSize:"1.35rem",fontWeight:600,letterSpacing:"-0.02em"},children:a(vi(e.phase))}),l!==null&&o.jsxs("div",{style:{marginTop:"12px",fontSize:"3rem",fontWeight:700,lineHeight:1,color:"#f8fbff",textShadow:"0 0 18px rgba(186, 221, 255, 0.45)"},children:["T-",l]}),e.phase==="complete"&&o.jsxs("div",{style:{marginTop:"12px",fontSize:"0.95rem",color:"#d7e0f7"},children:[e.remnantType==="black-hole"&&a("supernova_remnant_black_hole"),e.remnantType==="neutron-star"&&a("supernova_remnant_neutron_star"),e.remnantType==="none"&&a("supernova_remnant_none")]}),e.phase==="complete"&&o.jsxs("div",{style:{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginTop:"18px"},children:[o.jsx("button",{onClick:()=>r("supernova"),style:{padding:"10px 16px",borderRadius:"999px",border:"1px solid rgba(173, 196, 255, 0.35)",background:"rgba(104, 138, 255, 0.18)",color:"white",cursor:"pointer"},children:a("supernova_action_replay")}),d&&o.jsx("button",{onClick:()=>{e.remnantBodyId&&(t(e.remnantBodyId),n(e.remnantBodyId),s("sun_lock"),i())},style:{padding:"10px 16px",borderRadius:"999px",border:"1px solid rgba(255, 255, 255, 0.18)",background:"rgba(255, 255, 255, 0.08)",color:"white",cursor:"pointer"},children:a("supernova_action_inspect")}),o.jsx("button",{onClick:()=>{n(null),s("free"),i()},style:{padding:"10px 16px",borderRadius:"999px",border:"1px solid rgba(255, 255, 255, 0.14)",background:"transparent",color:"#dce7ff",cursor:"pointer"},children:a("supernova_action_free_camera")})]})]})})};function yi(){const{t:e}=Y(),r=C(m=>m.simulationState),t=C(m=>m.setSimulationState),n=C(m=>m.bodies),s=C(m=>m.followingBodyId),i=C(m=>m.setFollowingBody),a=C(m=>m.setCameraMode),l=C(m=>m.followingBodyId?m.bodies.find(g=>g.id===m.followingBodyId)?.name:null),[d,c]=_.useState(null),[h,u]=_.useState(0),f=C(m=>m.checkGPUSupport);return _.useEffect(()=>(f(),()=>{C.getState().cleanup()}),[f]),_.useEffect(()=>{},[]),_.useEffect(()=>{if(l){c(l),u(1);const m=setTimeout(()=>{u(0)},2e3);return()=>clearTimeout(m)}else u(0)},[l]),_.useEffect(()=>{const m=g=>{const p=document.activeElement?.tagName.toLowerCase();if(!(p==="input"||p==="textarea")){if(g.code==="Space"&&(g.preventDefault(),t(r==="running"?"paused":"running")),g.ctrlKey&&!g.shiftKey&&g.code==="KeyZ"&&(g.preventDefault(),C.getState().undo()),(g.ctrlKey&&g.code==="KeyY"||g.ctrlKey&&g.shiftKey&&g.code==="KeyZ")&&(g.preventDefault(),C.getState().redo()),g.shiftKey)g.code==="Digit1"&&a("free"),g.code==="Digit2"&&s&&a("sun_lock"),g.code==="Digit3"&&s&&a("surface_lock");else if(g.code.startsWith("Digit")&&!g.ctrlKey&&!g.altKey&&!g.metaKey){const v=Number(g.code.replace("Digit",""));if(!isNaN(v)&&v>=1&&v<=9){const S=v-1;if(S>=0&&S<n.length){const x=n[S];s===x.id?i(null):(i(x.id),C.getState().selectedBodyId&&C.getState().selectBody(x.id))}}}}};return window.addEventListener("keydown",m),()=>window.removeEventListener("keydown",m)},[r,t,n,s,i,a]),o.jsx(gi,{children:o.jsx(hi,{children:o.jsxs("div",{style:{width:"100vw",height:"100vh",overflow:"hidden",position:"relative"},children:[o.jsx(Ys,{}),o.jsx(xi,{}),o.jsxs("div",{className:"app-header",style:{position:"absolute",top:20,left:20,color:"white",fontFamily:"'Inter', sans-serif",pointerEvents:"none",textShadow:"0 2px 4px rgba(0,0,0,0.5)",opacity:C(m=>m.zenMode)?0:1,transition:"opacity 0.5s ease-in-out"},children:[o.jsx("h1",{style:{margin:0,fontWeight:300,fontSize:"2rem",letterSpacing:"-0.02em"},children:e("app_title")}),o.jsx("p",{style:{margin:0,opacity:.7,fontSize:"0.9rem"},children:e("app_subtitle")}),o.jsx("div",{style:{marginTop:"10px",fontSize:"2.5rem",fontWeight:300,opacity:h,transition:"opacity 0.5s ease-in-out",color:"#3b82f6",textShadow:"0 0 10px rgba(59, 130, 246, 0.5)",letterSpacing:"-0.02em"},children:d})]}),o.jsx(mi,{}),o.jsx(fi,{})]})})})}_o.createRoot(document.getElementById("root")).render(o.jsx(_.StrictMode,{children:o.jsx(yi,{})}));
