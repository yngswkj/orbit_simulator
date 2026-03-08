import{r as _,j as o,R as T,b as mt,c as qo}from"./react-vendor-9pToOiTF.js";import{u as Se,a as G,S as wt,L as ft,H as $o,b as Zo,E as Yo,c as Ko,C as Xo,O as Jo,G as Qo,d as er,e as tr,f as or,g as rr}from"./three-ecosystem-wxYBx5kz.js";import{h as P,J as qe,K as $,k as De,ag as Z,D as me,e as U,ah as sr,ai as ht,a0 as ro,t as so,aj as ir,ak as nr,al as nt,x as gt,Q as io,g as Ge,l as xe,P as ar}from"./three-core-DuabGn4o.js";import{v as q,a as no}from"./state-vendor-CYX7bTfW.js";import{g as lr}from"./animation-vendor-DDlvirwQ.js";import{S as vt,G as $e,E as ao,a as xt,D as cr,Z as Ie,C as yt,X as Ze,T as at,b as dr,c as ur,d as pr,e as lo,f as co,O as uo,g as po,A as lt,h as _t,I as mr,i as mo,R as fr,j as hr,P as fo,k as ho,l as go,U as gr,m as vr,L as xr,M as Ct,H as yr,n as vo,o as br,p as Sr,q as wr,r as _r,s as Cr,t as Mr,u as kr,v as jr,w as Pr,x as zr,y as Rr}from"./ui-vendor-CwC566jq.js";import"./vendor-DfKj1gQP.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();const Dr=32;class Ir{pool=[];index=0;constructor(s=1e4){for(let t=0;t<s;t++)this.pool.push(this.createEmptyNode())}createEmptyNode(){return{min:new P,max:new P,center:new P,size:0,totalMass:0,centerOfMass:new P,children:[null,null,null,null,null,null,null,null],bodyIndex:null,hasChildren:!1}}get(){if(this.index>=this.pool.length){const t=Math.floor(this.pool.length*.5)||100;for(let n=0;n<t;n++)this.pool.push(this.createEmptyNode())}const s=this.pool[this.index++];return this.resetNode(s),s}reset(){this.index=0}resetNode(s){s.totalMass=0,s.bodyIndex=null,s.hasChildren=!1,s.children.fill(null)}}const ct=new Ir,Br=e=>{if(e.count===0)return null;ct.reset();const s=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0);for(let c=0;c<e.count;c++){const d=c*3,f=e.positions[d],p=e.positions[d+1],g=e.positions[d+2];f<s.x&&(s.x=f),p<s.y&&(s.y=p),g<s.z&&(s.z=g),f>t.x&&(t.x=f),p>t.y&&(t.y=p),g>t.z&&(t.z=g)}const r=Math.max(t.x-s.x,t.y-s.y,t.z-s.z)*.001||1;t.x+=r,t.y+=r,t.z+=r,s.x-=r,s.y-=r,s.z-=r;const i=Math.max(t.x-s.x,t.y-s.y,t.z-s.z),l=s.clone().addScalar(i*.5),a=ct.get();a.min.copy(s),a.max.copy(s).addScalar(i),a.center.copy(l),a.size=i;for(let c=0;c<e.count;c++)e.masses[c]<=0||dt(a,c,e,0);return xo(a,e),a},dt=(e,s,t,n)=>{if(n>Dr)return;const r=t.positions[s*3],i=t.positions[s*3+1],l=t.positions[s*3+2];if(!e.hasChildren&&e.bodyIndex===null){e.bodyIndex=s;return}if(!e.hasChildren&&e.bodyIndex!==null){const c=e.bodyIndex;e.bodyIndex=null,e.hasChildren=!0;const d=Mt(e.center,t.positions[c*3],t.positions[c*3+1],t.positions[c*3+2]);e.children[d]||(e.children[d]=kt(e,d)),dt(e.children[d],c,t,n+1)}e.hasChildren=!0;const a=Mt(e.center,r,i,l);e.children[a]||(e.children[a]=kt(e,a)),dt(e.children[a],s,t,n+1)},Mt=(e,s,t,n)=>{let r=0;return s>=e.x&&(r|=4),t>=e.y&&(r|=2),n>=e.z&&(r|=1),r},kt=(e,s)=>{const t=ct.get(),n=e.size*.5;return t.size=n,t.min.copy(e.min),s&4&&(t.min.x+=n),s&2&&(t.min.y+=n),s&1&&(t.min.z+=n),t.max.copy(t.min).addScalar(n),t.center.copy(t.min).addScalar(n*.5),t},xo=(e,s)=>{if(!e.hasChildren){if(e.bodyIndex!==null){const l=e.bodyIndex,a=s.masses[l];e.totalMass=a,e.centerOfMass.set(s.positions[l*3],s.positions[l*3+1],s.positions[l*3+2])}else e.totalMass=0,e.centerOfMass.set(0,0,0);return}let t=0,n=0,r=0,i=0;for(let l=0;l<8;l++){const a=e.children[l];if(a){xo(a,s);const c=a.totalMass;c>0&&(t+=c,n+=a.centerOfMass.x*c,r+=a.centerOfMass.y*c,i+=a.centerOfMass.z*c)}}e.totalMass=t,t>0?e.centerOfMass.set(n/t,r/t,i/t):e.centerOfMass.set(0,0,0)},yo=1,jt=.5,bo=jt*jt,Ar=.5,So=e=>{const{count:s,positions:t,accelerations:n}=e,r=Br(e);if(r){n.fill(0,0,s*3);for(let i=0;i<s;i++){const l=i*3,a=t[l],c=t[l+1],d=t[l+2];wo(i,a,c,d,r,e)}}},wo=(e,s,t,n,r,i)=>{if(!r.hasChildren){r.bodyIndex!==null&&r.bodyIndex!==e&&Tr(e,s,t,n,r.bodyIndex,i);return}const l=r.centerOfMass.x-s,a=r.centerOfMass.y-t,c=r.centerOfMass.z-n,d=l*l+a*a+c*c,f=Math.sqrt(d);if(r.size/f<Ar)Er(e,s,t,n,r.totalMass,r.centerOfMass.x,r.centerOfMass.y,r.centerOfMass.z,i.accelerations);else for(let p=0;p<8;p++){const g=r.children[p];g&&g.totalMass>0&&wo(e,s,t,n,g,i)}},Tr=(e,s,t,n,r,i)=>{const l=r*3,a=i.positions[l]-s,c=i.positions[l+1]-t,d=i.positions[l+2]-n,p=a*a+c*c+d*d+bo,g=Math.sqrt(p),h=yo*i.masses[r]/(p*g),u=e*3;i.accelerations[u]+=a*h,i.accelerations[u+1]+=c*h,i.accelerations[u+2]+=d*h},Er=(e,s,t,n,r,i,l,a,c)=>{const d=i-s,f=l-t,p=a-n,h=d*d+f*f+p*p+bo,u=Math.sqrt(h),m=yo*r/(h*u),v=e*3;c[v]+=d*m,c[v+1]+=f*m,c[v+2]+=p*m},ye={G:1,SOFTENING_SQ:.25,BASE_DT:.001,COLLISION_THRESHOLD:.8},_o={MAX_BODIES:2e4,TRAIL_LENGTH:500,PREDICTION_STEPS:1200},ze={SOLAR_MASS:333e3,HZ_INNER_AU:.95,HZ_OUTER_AU:1.4,MASS_LUMINOSITY_EXPONENT:3.5},bt={MAX_TIDAL_PARTICLES:2e3,MAX_DEBRIS_PARTICLES:2e3,FRAME_TIME:.016};class Nr{cellSize;grid;constructor(s){this.cellSize=s,this.grid=new Map}clear(){this.grid.clear()}build(s){this.clear();const{count:t,positions:n,radii:r}=s;for(let i=0;i<t;i++){const l=n[i*3],a=n[i*3+1],c=n[i*3+2],d=r[i],f=l-d,p=l+d,g=a-d,h=a+d,u=c-d,m=c+d,v=Math.floor(f/this.cellSize),w=Math.floor(p/this.cellSize),y=Math.floor(g/this.cellSize),M=Math.floor(h/this.cellSize),k=Math.floor(u/this.cellSize),z=Math.floor(m/this.cellSize);for(let b=v;b<=w;b++)for(let R=y;R<=M;R++)for(let j=k;j<=z;j++){const C=`${b},${R},${j}`;let x=this.grid.get(C);x||(x={bodies:[]},this.grid.set(C,x)),x.bodies.push(i)}}}getPotentialCollisionPairs(){const s=[],t=new Set;for(const n of this.grid.values()){const r=n.bodies;for(let i=0;i<r.length;i++)for(let l=i+1;l<r.length;l++){const a=r[i],c=r[l],d=a<c?`${a},${c}`:`${c},${a}`;t.has(d)||(t.add(d),s.push([a,c]))}}return s}findCollisions(s,t=.8){const n=this.getPotentialCollisionPairs(),r=[],{positions:i,radii:l,masses:a}=s;for(const[c,d]of n){if(a[c]<=0||a[d]<=0)continue;const f=c*3,p=d*3,g=i[f]-i[p],h=i[f+1]-i[p+1],u=i[f+2]-i[p+2],m=g*g+h*h+u*u,v=l[c]+l[d];m<(v*t)**2&&r.push([c,d])}return r}getStats(){const s=this.grid.size;let t=0,n=0;for(const r of this.grid.values())t+=r.bodies.length,n=Math.max(n,r.bodies.length);return{cellCount:s,avgBodiesPerCell:s>0?t/s:0,maxBodiesPerCell:n}}}function Ur(e){const{count:s,radii:t}=e;if(s===0)return 10;let n=0;for(let i=0;i<s;i++)n+=t[i];return n/s*3}const{G:Co,SOFTENING_SQ:Fr}=ye,Lr=ye.BASE_DT,Or=8,Mo=(e,s)=>Lr*e*(s?Or:1);new P,new P,new P;const Gr=e=>{const s=Math.max(e.length*2,1e3),n={count:e.length,maxCount:s,positions:new Float64Array(s*3),velocities:new Float64Array(s*3),accelerations:new Float64Array(s*3),masses:new Float64Array(s),radii:new Float64Array(s),ids:new Array(s),idToIndex:new Map};return e.forEach((r,i)=>{n.positions[i*3]=r.position.x,n.positions[i*3+1]=r.position.y,n.positions[i*3+2]=r.position.z,n.velocities[i*3]=r.velocity.x,n.velocities[i*3+1]=r.velocity.y,n.velocities[i*3+2]=r.velocity.z,n.masses[i]=r.mass,n.radii[i]=r.radius,n.ids[i]=r.id,n.idToIndex.set(r.id,i)}),jo(n),n},Pt=(e,s)=>{const t=new Array(e.count),n=new Map(s.map(r=>[r.id,r]));for(let r=0;r<e.count;r++){const i=e.ids[r],l=n.get(i);l?t[r]={...l,position:new P(e.positions[r*3],e.positions[r*3+1],e.positions[r*3+2]),velocity:new P(e.velocities[r*3],e.velocities[r*3+1],e.velocities[r*3+2]),mass:e.masses[r],radius:e.radii[r]}:t[r]={id:i,name:"Unknown",mass:e.masses[r],radius:e.radii[r],position:new P(e.positions[r*3],e.positions[r*3+1],e.positions[r*3+2]),velocity:new P(e.velocities[r*3],e.velocities[r*3+1],e.velocities[r*3+2]),color:"#fff"}}return t},ko=e=>{const{count:s,positions:t,accelerations:n,masses:r}=e;n.fill(0,0,s*3);for(let i=0;i<s;i++){const l=i*3,a=t[l],c=t[l+1],d=t[l+2];for(let f=i+1;f<s;f++){const p=f*3,g=t[p]-a,h=t[p+1]-c,u=t[p+2]-d,v=g*g+h*h+u*u+Fr,w=Math.sqrt(v),y=Co/(v*w),M=g*y,k=h*y,z=u*y,b=r[i],R=r[f];n[l]+=M*R,n[l+1]+=k*R,n[l+2]+=z*R,n[p]-=M*b,n[p+1]-=k*b,n[p+2]-=z*b}}},jo=(e,s=!1)=>{if(s){So(e);return}ko(e)},Wr=(e,s)=>{const t=e.count-1;if(s!==t){const n=s*3,r=t*3;e.positions[n]=e.positions[r],e.positions[n+1]=e.positions[r+1],e.positions[n+2]=e.positions[r+2],e.velocities[n]=e.velocities[r],e.velocities[n+1]=e.velocities[r+1],e.velocities[n+2]=e.velocities[r+2],e.accelerations[n]=e.accelerations[r],e.accelerations[n+1]=e.accelerations[r+1],e.accelerations[n+2]=e.accelerations[r+2],e.masses[s]=e.masses[t],e.radii[s]=e.radii[t],e.ids[s]=e.ids[t],e.idToIndex.set(e.ids[s],s)}e.idToIndex.delete(e.ids[t]),e.count--},Vr=(e,s=!1)=>{const{positions:t,velocities:n,masses:r,radii:i}=e;let l;if(s&&e.count>100){const d=Ur(e),f=new Nr(d);f.build(e),l=f.findCollisions(e,ye.COLLISION_THRESHOLD)}else{l=[];for(let d=0;d<e.count;d++)if(!(r[d]<=0))for(let f=d+1;f<e.count;f++){if(r[f]<=0)continue;const p=d*3,g=f*3,h=t[p]-t[g],u=t[p+1]-t[g+1],m=t[p+2]-t[g+2],v=h*h+u*u+m*m,w=i[d]+i[f];v<(w*ye.COLLISION_THRESHOLD)**2&&l.push([d,f])}}const a=new Set;for(const[d,f]of l){if(a.has(d)||a.has(f)||r[d]<=0||r[f]<=0)continue;const p=d*3,g=f*3,h=r[d],u=r[f],m=h+u,v=(n[p]*h+n[g]*u)/m,w=(n[p+1]*h+n[g+1]*u)/m,y=(n[p+2]*h+n[g+2]*u)/m,M=(t[p]*h+t[g]*u)/m,k=(t[p+1]*h+t[g+1]*u)/m,z=(t[p+2]*h+t[g+2]*u)/m,b=Math.cbrt(i[d]**3+i[f]**3);r[d]=m,i[d]=b,t[p]=M,t[p+1]=k,t[p+2]=z,n[p]=v,n[p+1]=w,n[p+2]=y,a.add(f)}const c=Array.from(a).sort((d,f)=>f-d);for(const d of c)Wr(e,d)},Hr=(e,s,t=!1,n=!0,r=!0)=>{const{count:i,positions:l,velocities:a,accelerations:c}=e,d=.5*s;for(let f=0;f<i;f++){const p=f*3;a[p]+=c[p]*d,a[p+1]+=c[p+1]*d,a[p+2]+=c[p+2]*d,l[p]+=a[p]*s,l[p+1]+=a[p+1]*s,l[p+2]+=a[p+2]*s}t?So(e):ko(e);for(let f=0;f<i;f++){const p=f*3;a[p]+=c[p]*d,a[p+1]+=c[p+1]*d,a[p+2]+=c[p+2]*d}n&&Vr(e,r)},qr=e=>{let s=0,t=0;const n=e.length;for(let r=0;r<n;r++){const i=e[r],l=i.velocity.lengthSq();s+=.5*i.mass*l;for(let a=r+1;a<n;a++){const c=e[a],d=i.position.x-c.position.x,f=i.position.y-c.position.y,p=i.position.z-c.position.z,g=Math.sqrt(d*d+f*f+p*p)+1e-6;t-=Co*i.mass*c.mass/g}}return{kinetic:s,potential:t,total:s+t}},Xe=(e,s)=>{let t=[...e];const n=new Set,r=[],i=[];return s.forEach(([l,a])=>{if(n.has(l)||n.has(a)||!t[l]||!t[a])return;const c=t[l],d=t[a],f=c.mass+d.mass,p=c.velocity.clone().multiplyScalar(c.mass),g=d.velocity.clone().multiplyScalar(d.mass),h=p.add(g).divideScalar(f),u=c.position.clone().multiplyScalar(c.mass),m=d.position.clone().multiplyScalar(d.mass),v=u.add(m).divideScalar(f),w=Math.cbrt(Math.pow(c.radius,3)+Math.pow(d.radius,3)),y={x:(c.position.x*d.radius+d.position.x*c.radius)/(c.radius+d.radius),y:(c.position.y*d.radius+d.position.y*c.radius)/(c.radius+d.radius),z:(c.position.z*d.radius+d.position.z*c.radius)/(c.radius+d.radius)},k=c.velocity.clone().sub(d.velocity).length(),[z,b]=c.mass>d.mass?[c,d]:[d,c];r.push({collisionPoint:y,relativeVelocity:k,combinedMass:f,largerBodyId:z.id,smallerBodyId:b.id,smallerBodyColor:b.color,smallerBodyRadius:b.radius}),i.push({position:v.clone(),color:c.mass>d.mass?c.color:d.color}),t[l]={...c,mass:f,position:v,velocity:h,radius:w,name:`${c.name} + ${d.name}`.substring(0,20)},n.add(a)}),n.size>0?(t=t.filter((l,a)=>!n.has(a)),{bodies:t,hasRemovals:!0,collisionEvents:r,events:i}):{bodies:t,hasRemovals:!1,collisionEvents:[],events:[]}},Po=333e3,be={COMPRESSED:{AU_UNIT:50},REALISTIC:{AU_UNIT:200}},Je=be.REALISTIC.AU_UNIT/be.COMPRESSED.AU_UNIT,ue=(e,s)=>{const t=e*be.COMPRESSED.AU_UNIT,n=Math.sqrt(Po/t),r=s*Math.PI/180,i=new P(0,0,-t),l=new P(-n*Math.cos(r),-n*Math.sin(r),0);return{position:i,velocity:l}},zo=[{name:"Sun",mass:Po,radius:3,position:new P(0,0,0),velocity:new P(0,0,0),color:"#ffdd00",texturePath:"textures/sun_texture.png",isFixed:!0,isStar:!0,axialTilt:7.25,rotationSpeed:.04},{name:"Mercury",mass:.055,radius:.08,...ue(.39,7),color:"#a1a1a1",texturePath:"textures/mercury_texture.png",axialTilt:.03,rotationSpeed:.017},{name:"Venus",mass:.815,radius:.12,...ue(.72,3.4),color:"#e3bb76",texturePath:"textures/venus_texture.png",axialTilt:177.3,rotationSpeed:-.004},{name:"Earth",mass:1,radius:.13,...ue(1,0),color:"#22aaff",texturePath:"textures/earth_texture.png",axialTilt:23.4,rotationSpeed:1},{name:"Mars",mass:.107,radius:.09,...ue(1.52,1.85),color:"#ff4400",texturePath:"textures/mars_texture.png",axialTilt:25.2,rotationSpeed:.97},{name:"Jupiter",mass:317.8,radius:.8,...ue(5.2,1.3),color:"#d9a066",texturePath:"textures/jupiter_texture.png",axialTilt:3.1,rotationSpeed:2.4},{name:"Saturn",mass:95.2,radius:.7,...ue(9.5,2.49),color:"#eaddb1",texturePath:"textures/saturn_texture.png",axialTilt:26.7,rotationSpeed:2.2},{name:"Uranus",mass:14.5,radius:.4,...ue(19.2,.77),color:"#b2f0ff",texturePath:"textures/uranus_texture.png",axialTilt:97.8,rotationSpeed:-1.4},{name:"Neptune",mass:17.1,radius:.4,...ue(30.1,1.77),color:"#3366ff",texturePath:"textures/neptune_texture.png",axialTilt:28.3,rotationSpeed:1.5}],ut=()=>zo.map(e=>({...e,id:q()})),$r={id:"solar-system",name:"Solar System",nameJa:"太陽系",description:"Our home solar system with 8 planets orbiting the Sun.",descriptionJa:"太陽を中心に8つの惑星が周回する私たちの太陽系。",category:"classic",initialCamera:{position:[0,25,50],target:[0,0,0]},createBodies:()=>zo},pe=333e3,Zr={id:"three-body",name:"Three-Body System",nameJa:"三体星系",description:'Three stars orbiting each other in chaotic gravitational dance. Inspired by the novel "The Three-Body Problem".',descriptionJa:"ケンタウルス座アルファ星系の3つの恒星がカオスな重力相互作用を行う。小説「三体」にインスパイア。",category:"multi-star",initialCamera:{position:[-100,60,0],target:[0,0,0]},getCameraForMode:e=>e==="chaotic"?{position:[0,350,400],target:[0,0,0]}:{position:[-100,60,0],target:[0,0,0]},modes:[{id:"stable",name:"Era of Stability",nameJa:"恒紀",description:"A scientifically stable hierarchical triple system. Trisolaris orbits Star A safely.",descriptionJa:"科学的に安定した階層的三連星。Trisolarisはアルファ・ケンタウリAの周りを安全に周回する。"},{id:"chaotic",name:"Chaotic Era",nameJa:"乱紀",description:"Unpredictable stellar movements with extreme gravitational chaos.",descriptionJa:"予測不能な恒星の動きと極端な重力カオス。"}],createBodies:(e="stable")=>{const s=pe*1.1,t=pe*.9,n=pe*.12,r=s+t,i=r+n,l=2,a=c=>`/orbit_simulator/textures/${c}`;if(e==="stable"){const c=25*l,d=120*l,f=c*(s/r),p=Math.sqrt(r/c),g=p*(t/r),h=p*(s/r),u=d*(r/i),m=d*(n/i),v=Math.sqrt(i/d),w=v*(r/i),y=v*(n/i),M=7*l,k=Math.sqrt(s/M)*.9;return[{name:"α Centauri A",mass:s,radius:3.3,position:new P(-22.5-m,0,0),velocity:new P(0,0,g-y),color:"#ffffaa",texturePath:a("alpha_centauri_a.png"),isStar:!0,isFixed:!1},{name:"α Centauri B",mass:t,radius:2.7,position:new P(f-m,0,0),velocity:new P(0,0,-h-y),color:"#ffcc66",texturePath:a("alpha_centauri_b.png"),isStar:!0,isFixed:!1},{name:"Proxima Centauri",mass:n,radius:1.2,position:new P(u,20*l,0),velocity:new P(0,0,w),color:"#ff6644",texturePath:a("proxima_centauri.png"),isStar:!0,isFixed:!1},{name:"Trisolaris",mass:.001,radius:.3,position:new P(-22.5-m+M,0,0),velocity:new P(0,0,g-y+k),color:"#4488ff",texturePath:a("trisolaris.png"),isStar:!1}]}else{const d=Math.sqrt(i/80)*.5,f=(L,Y)=>L+Math.random()*(Y-L),p=()=>Math.random()*Math.PI*2,g=p(),h=p(),u=p(),m=f(40,100),v=f(40,100),w=f(30,80),y=new P(Math.cos(g)*m,f(-20,20),Math.sin(g)*m),M=new P(Math.cos(h)*v,f(-20,20),Math.sin(h)*v),k=new P(Math.cos(u)*w,f(-20,20),Math.sin(u)*w),z=p(),b=p(),R=f(d*.3,d*.8),j=f(d*.3,d*.8),C=new P(Math.cos(z)*R,f(-d*.2,d*.2),Math.sin(z)*R),x=new P(Math.cos(b)*j,f(-d*.2,d*.2),Math.sin(b)*j),D=new P(-(C.x*s+x.x*t)/n*.1,f(-d*.3,d*.3),-(C.z*s+x.z*t)/n*.1),I=p(),A=f(180,250),W=Math.sqrt(i/A)*f(.7,.85),N=f(-30,30);return[{name:"α Centauri A",mass:s,radius:3.3,position:y,velocity:C,color:"#ffffaa",texturePath:a("alpha_centauri_a.png"),isStar:!0,isFixed:!1},{name:"α Centauri B",mass:t,radius:2.7,position:M,velocity:x,color:"#ffcc66",texturePath:a("alpha_centauri_b.png"),isStar:!0,isFixed:!1},{name:"Proxima Centauri",mass:n,radius:1.2,position:k,velocity:D,color:"#ff6644",texturePath:a("proxima_centauri.png"),isStar:!0,isFixed:!1},{name:"Trisolaris",mass:1,radius:.3,position:new P(Math.cos(I)*A,N,Math.sin(I)*A),velocity:new P(-Math.sin(I)*W,0,Math.cos(I)*W),color:"#4488ff",texturePath:a("trisolaris.png"),isStar:!1}]}}},Yr={id:"figure-eight",name:"Figure-8 Orbit",nameJa:"8の字軌道",description:"Three equal-mass bodies following a stable figure-8 choreography. A mathematically proven periodic solution.",descriptionJa:"3つの等質量天体が8の字パターンで安定周回する、数学的に証明された周期解。",category:"choreography",initialCamera:{position:[0,80,100],target:[0,0,0]},createBodies:()=>{const t=Math.sqrt(400),n=.9700043566973456,r=-.2430875323849975,i=.4662036850311905,l=.4323657300236305;return[{name:"Body α",mass:1e4,radius:.5,position:new P(n*25,r*25,0),velocity:new P(i*t,l*t,0),color:"#ff6b6b",isStar:!0,isFixed:!1},{name:"Body β",mass:1e4,radius:.5,position:new P(-n*25,-r*25,0),velocity:new P(i*t,l*t,0),color:"#4ecdc4",isStar:!0,isFixed:!1},{name:"Body γ",mass:1e4,radius:.5,position:new P(0,0,0),velocity:new P(-2*i*t,-2*l*t,0),color:"#ffe66d",isStar:!0,isFixed:!1}]}},Kr={id:"black-hole",name:"Black Hole Binary",nameJa:"ブラックホール連星",description:"A stellar-mass black hole with accretion disk, orbited by a companion star. Matter flows from star to black hole.",descriptionJa:"恒星質量ブラックホールと伴星の連星系。降着円盤と相対論的ジェットを可視化。",category:"multi-star",initialCamera:{position:[0,100,150],target:[0,0,0]},createBodies:()=>{const e=p=>`/orbit_simulator/textures/${p}`,s=pe*10,t=pe*.8,n=s+t,r=60,i=r*(s/n),l=Math.sqrt(n/r),a=l*(t/n),c=l*(s/n),d=120,f=Math.sqrt(n/d)*.95;return[{name:"Cygnus X-1",mass:s,radius:2,position:new P(-4.444444444444445,0,0),velocity:new P(0,0,a),color:"#000000",isStar:!1,isFixed:!1,isCompactObject:!0,hasAccretionDisk:!0,accretionDiskConfig:{innerRadius:1.5,outerRadius:8,rotationSpeed:2,particleCount:25e3,tilt:.15},hasJets:!0},{name:"HDE 226868",mass:t,radius:4,position:new P(i,0,0),velocity:new P(0,0,-c),color:"#8899ff",texturePath:e("hde_226868_texture.png"),isStar:!0,isFixed:!1},{name:"Outer World",mass:100,radius:.5,position:new P(d,10,0),velocity:new P(0,0,f),color:"#88aa55",texturePath:e("outer_world_texture.png"),isStar:!1,isFixed:!1}]}},Xr={id:"tidal-disruption",name:"Tidal Disruption Event",nameJa:"潮汐破壊イベント",description:"A black hole tears apart an approaching star while an outer world watches from a safer orbit.",descriptionJa:"接近する恒星がブラックホールに引き裂かれる破局イベント。外縁惑星からその光景を観測する。",category:"catastrophic",initialCamera:{position:[0,70,130],target:[0,0,0]},scenario:{kind:"tidal-disruption",autoStartDelayMs:1600,primaryBodyName:"Acheron",targetBodyName:"Selene",breachDistance:24,breachFallbackMs:12e3,disruptionDurationMs:7800,cinematic:"full",vfxProfileId:"cinematic"},createBodies:()=>{const e=pe*14,s=pe*1.2,t=40,n=180,r=Math.sqrt(e/n)*.94;return[{name:"Acheron",mass:e,radius:2.4,position:new P(0,0,0),velocity:new P(0,0,0),color:"#000000",isStar:!1,isFixed:!0,isCompactObject:!0,type:"black_hole",hasAccretionDisk:!0,accretionDiskConfig:{innerRadius:1.6,outerRadius:10,rotationSpeed:2.1,particleCount:2800,tilt:.18},hasJets:!0},{name:"Selene",mass:s,radius:4.8,position:new P(72,6,0),velocity:new P(-1.1,0,-8.5),color:"#d7e8ff",isStar:!0,isFixed:!1,type:"star"},{name:"Witness",mass:t,radius:1.4,position:new P(0,0,n),velocity:new P(r,0,0),color:"#7cb0ff",isStar:!1,isFixed:!1,type:"planet"}]}},Jr={id:"supernova",name:"Supernova Explosion",nameJa:"超新星爆発",description:"A massive blue supergiant star ready to go supernova. Watch the spectacular stellar death and transformation.",descriptionJa:"超新星爆発を起こす大質量の青色超巨星。壮大な恒星の死と変化を観察する。",category:"catastrophic",initialCamera:{position:[0,50,120],target:[0,0,0]},scenario:{kind:"supernova",autoStartDelayMs:800,countdownMs:3e3,target:"primary-star",cinematic:"full",vfxProfileId:"cinematic"},createBodies:()=>{const e=pe*20;return[{name:"Betelgeuse",mass:e,radius:15,position:new P(0,0,0),velocity:new P(0,0,0),color:"#aaccff",isStar:!0,isFixed:!0,type:"star"},{name:"Prometheus",mass:300,radius:8,position:new P(80,0,0),velocity:new P(0,0,Math.sqrt(e/80)*.95),color:"#cc8844",type:"planet"},{name:"Erebus",mass:1,radius:3,position:new P(0,0,150),velocity:new P(Math.sqrt(e/150)*.98,0,0),color:"#6688aa",type:"planet"},{name:"Icarus",mass:1,radius:2,position:new P(-45,0,0),velocity:new P(0,0,-Math.sqrt(e/45)),color:"#dd6633",type:"planet"}]}},Ro=[$r,Zr,Yr,Kr,Xr,Jr],We=e=>Ro.find(s=>s.id===e);class Qr{workers=[];sharedBuffer;positions;velocities;accelerations;masses;radii;syncCounter;workerCount;maxBodies;isSupported;constructor(s,t=navigator.hardwareConcurrency||4){if(this.maxBodies=s,this.workerCount=t,this.isSupported=typeof SharedArrayBuffer<"u",!this.isSupported){console.warn("SharedArrayBuffer is not supported. Falling back to main thread."),this.sharedBuffer=new ArrayBuffer(0),this.positions=new Float64Array(0),this.velocities=new Float64Array(0),this.accelerations=new Float64Array(0),this.masses=new Float64Array(0),this.radii=new Float64Array(0),this.syncCounter=new Int32Array(0);return}const r=s*11*8+8;this.sharedBuffer=new SharedArrayBuffer(r);let i=0;this.positions=new Float64Array(this.sharedBuffer,i,s*3),i+=s*3*8,this.velocities=new Float64Array(this.sharedBuffer,i,s*3),i+=s*3*8,this.accelerations=new Float64Array(this.sharedBuffer,i,s*3),i+=s*3*8,this.masses=new Float64Array(this.sharedBuffer,i,s),i+=s*8,this.radii=new Float64Array(this.sharedBuffer,i,s),i+=s*8,this.syncCounter=new Int32Array(this.sharedBuffer,i,2)}onCollision=null;initialized=!1;initPromise=null;pendingReject=null;initWorkers(){if(!this.isSupported||this.initialized||this.initPromise)return;const s=[];for(let t=0;t<this.workerCount;t++){const n=new Worker(new URL("/orbit_simulator/assets/physics.worker-pFkwC4IC.js",import.meta.url),{type:"module"}),r=new Promise(i=>{const l=a=>{a.data.type==="initDone"&&(n.removeEventListener("message",l),i())};n.addEventListener("message",l)});n.postMessage({type:"init",sharedBuffer:this.sharedBuffer,workerId:t,workerCount:this.workerCount,maxBodies:this.maxBodies}),this.workers.push(n),s.push(r)}this.initPromise=Promise.all(s).then(()=>{this.initialized=!0})}async waitForInit(){this.initPromise&&await this.initPromise}async executeStep(s,t){if(!this.isSupported)return;await this.waitForInit(),Atomics.store(this.syncCounter,0,0);const n=Promise.all(this.workers.map(r=>new Promise(i=>{const l=a=>{a.data.type==="done"?(r.removeEventListener("message",l),i()):a.data.type==="collisions"&&this.onCollision&&this.onCollision(a.data.collisions)};r.addEventListener("message",l),r.postMessage({type:"step",count:s,dt:t})}))).then(()=>{this.pendingReject=null});return new Promise((r,i)=>{this.pendingReject=i,n.then(r).catch(i)})}calculateEnergy(s){return!this.isSupported||this.workers.length===0?Promise.resolve(0):new Promise(t=>{const n=this.workers[0],r=i=>{i.data.type==="energyResult"&&(n.removeEventListener("message",r),t(i.data.totalEnergy))};n.addEventListener("message",r),n.postMessage({type:"energy",count:s})})}terminate(){this.pendingReject&&(this.pendingReject(new Error("WorkerManager terminated")),this.pendingReject=null),this.workers.forEach(s=>s.terminate()),this.workers=[],this.initialized=!1,this.initPromise=null}setBodies(s){if(!this.isSupported)return;const t=s.length;if(t>this.maxBodies){console.error("Too many bodies for worker manager");return}for(let r=0;r<t;r++){const i=s[r],l=r*3;this.positions[l]=i.position.x,this.positions[l+1]=i.position.y,this.positions[l+2]=i.position.z,this.velocities[l]=i.velocity.x,this.velocities[l+1]=i.velocity.y,this.velocities[l+2]=i.velocity.z,this.accelerations[l]=0,this.accelerations[l+1]=0,this.accelerations[l+2]=0,this.masses[r]=i.mass,this.radii[r]=i.radius}const n={count:t,maxCount:this.maxBodies,positions:this.positions,velocities:this.velocities,accelerations:this.accelerations,masses:this.masses,radii:this.radii,ids:new Array(t)};jo(n)}getPhysicsState(s){return{count:s,maxCount:this.maxBodies,positions:this.positions,velocities:this.velocities,accelerations:this.accelerations,masses:this.masses,radii:this.radii,ids:[],idToIndex:new Map}}}const es=`
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
`;class Do{device=null;pipelineIntegrate=null;pipelineForce=null;bufferA=null;bufferB=null;uniformBuffer=null;stagingBuffer=null;collisionBuffer=null;counterBuffer=null;stagingCollisionBuffer=null;stagingCounterBuffer=null;bindGroupA_Integrate=null;bindGroupB_Integrate=null;bindGroup_Force_ReadA_WriteB=null;bindGroup_Force_ReadB_WriteA=null;currentBufferIndex=0;maxBodies=0;_isReady=!1;get isReady(){return this._isReady}G=ye.G;softening=ye.SOFTENING_SQ;static async isSupported(){if(!navigator.gpu)return!1;try{return!!await navigator.gpu.requestAdapter()}catch(s){return console.error("WebGPU check failed:",s),!1}}constructor(){}async init(s){if(!navigator.gpu)throw new Error("WebGPU not supported");const t=await navigator.gpu.requestAdapter();if(!t)throw new Error("No GPUAdapter found");this.device=await t.requestDevice(),this.maxBodies=s,await this.createPipelines(),this.createBuffers(s),this._isReady=!0,console.log("GPUPhysicsEngine initialized (Velocity Verlet).")}async createPipelines(){if(!this.device)return;const s=this.device.createShaderModule({code:es});this.pipelineIntegrate=this.device.createComputePipeline({layout:"auto",compute:{module:s,entryPoint:"integrate"}}),this.pipelineForce=this.device.createComputePipeline({layout:"auto",compute:{module:s,entryPoint:"calcForces"}})}createBuffers(s){if(!this.device||!this.pipelineIntegrate||!this.pipelineForce)return;s>this.maxBodies&&console.warn("Body count exceeds GPU buffer capacity.");const n=Math.max(s*48,128),r=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC;this.bufferA=this.device.createBuffer({size:n,usage:r,label:"Buffer A"}),this.bufferB=this.device.createBuffer({size:n,usage:r,label:"Buffer B"}),this.uniformBuffer=this.device.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.stagingBuffer=this.device.createBuffer({size:n,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.collisionBuffer=this.device.createBuffer({size:8e3,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),this.counterBuffer=this.device.createBuffer({size:4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this.stagingCollisionBuffer=this.device.createBuffer({size:8e3,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.stagingCounterBuffer=this.device.createBuffer({size:4,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST});const i=this.pipelineIntegrate.getBindGroupLayout(0),l=[{binding:2,resource:{buffer:this.uniformBuffer}}],a=[{binding:2,resource:{buffer:this.uniformBuffer}},{binding:3,resource:{buffer:this.collisionBuffer}},{binding:4,resource:{buffer:this.counterBuffer}}];this.bindGroupA_Integrate=this.device.createBindGroup({layout:i,entries:[{binding:0,resource:{buffer:this.bufferA}},{binding:1,resource:{buffer:this.bufferB}},...l]}),this.bindGroupB_Integrate=this.device.createBindGroup({layout:i,entries:[{binding:0,resource:{buffer:this.bufferB}},{binding:1,resource:{buffer:this.bufferA}},...l]});const c=this.pipelineForce.getBindGroupLayout(0);this.bindGroup_Force_ReadA_WriteB=this.device.createBindGroup({layout:c,entries:[{binding:0,resource:{buffer:this.bufferA}},{binding:1,resource:{buffer:this.bufferB}},...a]}),this.bindGroup_Force_ReadB_WriteA=this.device.createBindGroup({layout:c,entries:[{binding:0,resource:{buffer:this.bufferB}},{binding:1,resource:{buffer:this.bufferA}},...a]})}async setBodies(s){if(!this.device||!this.bufferA)return;const t=new Float32Array(s.length*12);for(let l=0;l<s.length;l++){const a=s[l],c=l*12;t[c+0]=a.position.x,t[c+1]=a.position.y,t[c+2]=a.position.z,t[c+3]=a.mass,t[c+4]=a.velocity.x,t[c+5]=a.velocity.y,t[c+6]=a.velocity.z,t[c+7]=a.radius,t[c+8]=0,t[c+9]=0,t[c+10]=0,t[c+11]=0}this.device.queue.writeBuffer(this.bufferA,0,t),this.counterBuffer&&this.device.queue.writeBuffer(this.counterBuffer,0,new Uint32Array([0]));const n=new ArrayBuffer(16);new Float32Array(n)[0]=0,new Uint32Array(n)[1]=s.length,new Float32Array(n)[2]=this.G,new Float32Array(n)[3]=this.softening,this.device.queue.writeBuffer(this.uniformBuffer,0,n);const r=this.device.createCommandEncoder();r.copyBufferToBuffer(this.bufferA,0,this.bufferB,0,this.bufferA.size);const i=r.beginComputePass({label:"Init Acc Pass"});i.setPipeline(this.pipelineForce),i.setBindGroup(0,this.bindGroup_Force_ReadB_WriteA),i.dispatchWorkgroups(Math.ceil(s.length/64)),i.end(),this.device.queue.submit([r.finish()]),this.currentBufferIndex=0}async step(s,t){if(!this.device||!this.pipelineIntegrate||!this.pipelineForce||!this.uniformBuffer)return;this.counterBuffer&&this.device.queue.writeBuffer(this.counterBuffer,0,new Uint32Array([0]));const n=new ArrayBuffer(16),r=new Float32Array(n),i=new Uint32Array(n);r[0]=s,i[1]=t,r[2]=this.G,r[3]=this.softening,this.device.queue.writeBuffer(this.uniformBuffer,0,n);const l=this.device.createCommandEncoder(),a=this.bufferA.size,c=Math.ceil(t/64);if(this.currentBufferIndex===0){const d=l.beginComputePass({label:"Integration Pass"});d.setPipeline(this.pipelineIntegrate),d.setBindGroup(0,this.bindGroupA_Integrate),d.dispatchWorkgroups(c),d.end(),l.copyBufferToBuffer(this.bufferB,0,this.bufferA,0,a);const f=l.beginComputePass({label:"Force Pass"});f.setPipeline(this.pipelineForce),f.setBindGroup(0,this.bindGroup_Force_ReadA_WriteB),f.dispatchWorkgroups(c),f.end()}else{const d=l.beginComputePass({label:"Integration Pass"});d.setPipeline(this.pipelineIntegrate),d.setBindGroup(0,this.bindGroupB_Integrate),d.dispatchWorkgroups(c),d.end(),l.copyBufferToBuffer(this.bufferA,0,this.bufferB,0,a);const f=l.beginComputePass({label:"Force Pass"});f.setPipeline(this.pipelineForce),f.setBindGroup(0,this.bindGroup_Force_ReadB_WriteA),f.dispatchWorkgroups(c),f.end()}this.device.queue.submit([l.finish()]),this.currentBufferIndex=this.currentBufferIndex===0?1:0}async getBodies(s){if(!this.device||!this.stagingBuffer||!this.bufferA||!this.bufferB)return null;const t=this.currentBufferIndex===1?this.bufferB:this.bufferA,n=s*48,r=this.device.createCommandEncoder();r.copyBufferToBuffer(t,0,this.stagingBuffer,0,n),this.device.queue.submit([r.finish()]),await this.stagingBuffer.mapAsync(GPUMapMode.READ,0,n);const i=this.stagingBuffer.getMappedRange(0,n),l=new Float32Array(i.slice(0));return this.stagingBuffer.unmap(),l}async getCollisions(){if(!this.device||!this.collisionBuffer||!this.counterBuffer||!this.stagingCounterBuffer||!this.stagingCollisionBuffer)return null;const s=this.device.createCommandEncoder();s.copyBufferToBuffer(this.counterBuffer,0,this.stagingCounterBuffer,0,4),this.device.queue.submit([s.finish()]),await this.stagingCounterBuffer.mapAsync(GPUMapMode.READ);const n=new Uint32Array(this.stagingCounterBuffer.getMappedRange())[0];if(this.stagingCounterBuffer.unmap(),n===0)return[];const r=Math.min(n,1e3),i=r*8,l=this.device.createCommandEncoder();l.copyBufferToBuffer(this.collisionBuffer,0,this.stagingCollisionBuffer,0,i),this.device.queue.submit([l.finish()]),await this.stagingCollisionBuffer.mapAsync(GPUMapMode.READ,0,i);const a=new Uint32Array(this.stagingCollisionBuffer.getMappedRange(0,i)),c=[];for(let d=0;d<r;d++)c.push([a[d*2],a[d*2+1]]);return this.stagingCollisionBuffer.unmap(),c}dispose(){this.bufferA?.destroy(),this.bufferB?.destroy(),this.uniformBuffer?.destroy(),this.stagingBuffer?.destroy(),this.collisionBuffer?.destroy(),this.counterBuffer?.destroy(),this.stagingCollisionBuffer?.destroy(),this.stagingCounterBuffer?.destroy(),this.device?.destroy()}}const Io=()=>{const e=new Set;return{schedule:(s,t)=>{const n=setTimeout(()=>{e.delete(n),s()},t);return e.add(n),n},clear:s=>{clearTimeout(s),e.delete(s)},clearAll:()=>{for(const s of e)clearTimeout(s);e.clear()},size:()=>e.size}},zt={low:{accretionDiskParticles:5e3,maxDebrisParticles:500,maxExplosionParticles:50,maxTidalParticles:500,trailRecentPoints:30,trailCompressedPoints:60,trailCompressionRatio:6,maxVisibleLabels:8,maxTrailedBodies:4,maxVisibleStarLabels:12,starfieldSegments:[24,24],starfieldFBMOctaves:2,starfieldRadius:3e4,pixelRatioMultiplier:.75,shadowsEnabled:!1,postProcessingEnabled:!1,maxPredictionSteps:600,enableAccretionDisk:!0,enableStarfield:!0,enableGlow:!1,enablePostProcessing:!1,supernovaShellLayers:2,supernovaRayCount:8,supernovaDebrisBudget:450,supernovaUseSecondaryGlow:!1,supernovaUseJets:!1},medium:{accretionDiskParticles:15e3,maxDebrisParticles:1e3,maxExplosionParticles:100,maxTidalParticles:1e3,trailRecentPoints:45,trailCompressedPoints:90,trailCompressionRatio:5,maxVisibleLabels:12,maxTrailedBodies:8,maxVisibleStarLabels:20,starfieldSegments:[32,32],starfieldFBMOctaves:3,starfieldRadius:35e3,pixelRatioMultiplier:1,shadowsEnabled:!1,postProcessingEnabled:!1,maxPredictionSteps:900,enableAccretionDisk:!0,enableStarfield:!0,enableGlow:!0,enablePostProcessing:!1,supernovaShellLayers:3,supernovaRayCount:12,supernovaDebrisBudget:900,supernovaUseSecondaryGlow:!0,supernovaUseJets:!0},high:{accretionDiskParticles:3e4,maxDebrisParticles:2e3,maxExplosionParticles:200,maxTidalParticles:2e3,trailRecentPoints:60,trailCompressedPoints:120,trailCompressionRatio:4,maxVisibleLabels:20,maxTrailedBodies:12,maxVisibleStarLabels:32,starfieldSegments:[64,64],starfieldFBMOctaves:4,starfieldRadius:4e4,pixelRatioMultiplier:1,shadowsEnabled:!0,postProcessingEnabled:!0,maxPredictionSteps:1200,enableAccretionDisk:!0,enableStarfield:!0,enableGlow:!0,enablePostProcessing:!0,supernovaShellLayers:4,supernovaRayCount:16,supernovaDebrisBudget:1500,supernovaUseSecondaryGlow:!0,supernovaUseJets:!0},auto:{accretionDiskParticles:15e3,maxDebrisParticles:1e3,maxExplosionParticles:100,maxTidalParticles:1e3,trailRecentPoints:45,trailCompressedPoints:90,trailCompressionRatio:5,maxVisibleLabels:12,maxTrailedBodies:8,maxVisibleStarLabels:20,starfieldSegments:[32,32],starfieldFBMOctaves:3,starfieldRadius:35e3,pixelRatioMultiplier:1,shadowsEnabled:!1,postProcessingEnabled:!1,maxPredictionSteps:900,enableAccretionDisk:!0,enableStarfield:!0,enableGlow:!0,enablePostProcessing:!1,supernovaShellLayers:3,supernovaRayCount:12,supernovaDebrisBudget:900,supernovaUseSecondaryGlow:!0,supernovaUseJets:!0}},fe=e=>e==="auto"?zt.medium:zt[e],Bo=e=>e>2e5?"black-hole":e>1e5?"neutron-star":"none",ts=(e,s)=>{const t=fe(s),n=Math.max(.85,Math.min(1.45,Math.pow(e/1e5,.12))),r=Bo(e);return{coreRadiusScale:1.2*n,haloRadiusScale:2.6*n,shellCount:t.supernovaShellLayers,rayCount:t.supernovaRayCount,raySpread:t.supernovaUseSecondaryGlow?.65:.45,rayPulseSpeed:t.supernovaUseSecondaryGlow?6.5:4.5,debrisBudget:t.supernovaDebrisBudget,useSecondaryGlow:t.supernovaUseSecondaryGlow,useJets:t.supernovaUseJets&&r==="black-hole",gammaRayWidthScale:r==="black-hole"?.18:.1,gammaRayCoreIntensity:r==="black-hole"?1.4:.9}},ae=Io(),os=()=>{const e=Math.random()*2-1,s=Math.random()*2-1,t=Math.random()*2-1,n=Math.hypot(e,s,t)||1;return{x:e/n,y:s/n,z:t/n}},O=no((e,s)=>({shockwaves:[],heatGlows:[],debrisClouds:[],tidalDisruptions:[],explosions:[],supernovas:[],radialRays:[],cameraShakes:[],gammaRayBursts:[],addShockwave:(t,n,r="#ffaa00",i=2e3,l=0,a)=>{const c=q();return e(d=>({shockwaves:[...d.shockwaves,{id:c,position:t,startTime:performance.now(),maxRadius:n,color:r,duration:i,asymmetry:l,directionBias:a}]})),c},removeShockwave:t=>{e(n=>({shockwaves:n.shockwaves.filter(r=>r.id!==t)}))},addHeatGlow:(t,n,r,i=1,l=4e3)=>{const a=q();return e(c=>({heatGlows:[...c.heatGlows,{id:a,bodyId:t,position:n,radius:r,startTime:performance.now(),duration:l,intensity:i}]})),a},removeHeatGlow:t=>{e(n=>({heatGlows:n.heatGlows.filter(r=>r.id!==t)}))},addDebrisCloud:(t,n,r,i,l,a,c)=>{const d=q(),f=performance.now(),p=[],g=()=>{let h=0,u=0;for(;h===0;)h=Math.random();for(;u===0;)u=Math.random();return Math.sqrt(-2*Math.log(h))*Math.cos(2*Math.PI*u)};for(let h=0;h<l;h++){const u=Math.random()*Math.PI*2,m=Math.acos(2*Math.random()-1),v=Math.abs(g()),w=c*(.5+v*.3),y=Math.sin(m)*Math.cos(u),M=Math.sin(m)*Math.sin(u),k=Math.cos(m);p.push({id:q(),position:{...n},velocity:{x:r.x*.5+y*w,y:r.y*.5+M*w,z:r.z*.5+k*w},size:a*(.2+Math.random()*.8),color:i,createdAt:f,lifetime:8e3+Math.random()*12e3,rotationSpeed:{x:(Math.random()-.5)*5,y:(Math.random()-.5)*5,z:(Math.random()-.5)*5},rotation:{x:Math.random()*Math.PI*2,y:Math.random()*Math.PI*2,z:Math.random()*Math.PI*2}})}return e(h=>({debrisClouds:[...h.debrisClouds,{id:d,sourceBodyId:t,particles:p,createdAt:f}]})),d},removeExpiredDebris:()=>{const t=performance.now();e(n=>({debrisClouds:n.debrisClouds.map(r=>({...r,particles:r.particles.filter(i=>t-i.createdAt<i.lifetime)})).filter(r=>r.particles.length>0)}))},removeDebrisCloud:t=>{e(n=>({debrisClouds:n.debrisClouds.filter(r=>r.id!==t)}))},addTidalDisruption:(t,n,r,i,l,a,c,d=6e3)=>{const f=q();return e(p=>({tidalDisruptions:[...p.tidalDisruptions,{id:f,bodyId:t,primaryId:n,position:r,primaryPosition:i,bodyRadius:l,bodyColor:a,primaryMass:c,startTime:performance.now(),duration:d}]})),f},removeTidalDisruption:t=>{e(n=>({tidalDisruptions:n.tidalDisruptions.filter(r=>r.id!==t)}))},addExplosion:(t,n,r="#ff6600",i=500,l=2e3)=>{const a=q();return e(c=>({explosions:[...c.explosions,{id:a,position:t,startTime:performance.now(),duration:l,size:n,color:r,particleCount:i}]})),a},removeExplosion:t=>{e(n=>({explosions:n.explosions.filter(r=>r.id!==t)}))},addSupernova:(t,n,r,i="#aaccff",l=3,a=15e3,c=r*.12,d=r*.2,f=3,p={x:0,y:1,z:0})=>{const g=q();return e(h=>({supernovas:[...h.supernovas,{id:g,starId:t,position:n,startTime:performance.now(),duration:a,maxRadius:r,color:i,intensity:l,phase:"brightening",coreRadius:c,haloRadius:d,shellCount:f,biasDirection:p}]})),g},removeSupernova:t=>{e(n=>({supernovas:n.supernovas.filter(r=>r.id!==t)}))},addRadialRays:(t,n,r="#ffffff",i=8e3,l=12,a=.6,c=6)=>{const d=q();return e(f=>({radialRays:[...f.radialRays,{id:d,position:t,startTime:performance.now(),duration:i,rayCount:l,maxLength:n,color:r,spread:a,pulseSpeed:c}]})),d},removeRadialRays:t=>{e(n=>({radialRays:n.radialRays.filter(r=>r.id!==t)}))},addCameraShake:(t,n=3e3,r="exponential")=>{const i=q();return e(l=>({cameraShakes:[...l.cameraShakes,{id:i,startTime:performance.now(),duration:n,intensity:t,falloff:r}]})),i},removeCameraShake:t=>{e(n=>({cameraShakes:n.cameraShakes.filter(r=>r.id!==t)}))},addGammaRayBurst:(t,n,r=8e3,i={x:0,y:1,z:0},l=n*.08,a=1)=>{const c=q();return e(d=>({gammaRayBursts:[...d.gammaRayBursts,{id:c,position:t,startTime:performance.now(),duration:r,length:n,axis:i,width:l,coreIntensity:a}]})),c},removeGammaRayBurst:t=>{e(n=>({gammaRayBursts:n.gammaRayBursts.filter(r=>r.id!==t)}))},triggerSupernova:(t,n,r,i,l)=>{const{addSupernova:a,addDebrisCloud:c,addExplosion:d,addRadialRays:f,addCameraShake:p,addGammaRayBurst:g}=s(),h=typeof window<"u"&&window.__physicsStore?.getState?.(),u=h?.qualityLevel||"medium",m=h?.cameraShakeIntensity??1,v=ts(r,u),w=Math.pow(r/1e5,.4),y=i*100*w,M=os(),k=Math.max(80,Math.floor(v.debrisBudget*.22)),z=Math.max(40,Math.floor(v.debrisBudget*.12)),b=v.useJets;a(t,n,y,"#d9e6ff",3.4,15e3,i*v.coreRadiusScale,i*v.haloRadiusScale,v.shellCount,M),p(3*m,2600,"exponential"),ae.schedule(()=>{d(n,i*3,"#ffffff",k,1100)},1800),ae.schedule(()=>{f(n,y*1.2,"#ccddff",1e4,v.rayCount,v.raySpread,v.rayPulseSpeed)},2100),v.useSecondaryGlow&&ae.schedule(()=>{d(n,i*2.4,"#9dc8ff",z,2200)},2800),ae.schedule(()=>{const R=Math.min(Math.floor(r/110)+360,v.debrisBudget);c(t,n,{x:0,y:0,z:0},l,R,i*.2,i*2.4)},3200),ae.schedule(()=>{p(1.4*m,2e3,"linear")},4200),ae.schedule(()=>{d(n,i*4.2,"#ff8d5d",z,3200)},5400),ae.schedule(()=>{const R=Math.min(Math.floor(r/150)+150,Math.floor(v.debrisBudget*.55));c(t,n,{x:0,y:0,z:0},"#ffaa66",R,i*.15,i*1.6)},6800),b&&ae.schedule(()=>{const R=y*3;g(n,R,1e4,M,i*v.gammaRayWidthScale,v.gammaRayCoreIntensity)},10800)},triggerCollisionEffects:t=>{const{addShockwave:n,addHeatGlow:r,addDebrisCloud:i,addExplosion:l}=s();n(t.collisionPoint,t.smallerBodyRadius*8,"#ffaa00",2e3),ae.schedule(()=>{n(t.collisionPoint,t.smallerBodyRadius*5,"#ffffff",1e3)},100),r(t.largerBodyId,t.collisionPoint,t.smallerBodyRadius*1.5,1.2,5e3);const a=Math.min(Math.floor(t.combinedMass/50)+50,800);i(t.smallerBodyId,t.collisionPoint,{x:0,y:0,z:0},t.smallerBodyColor,a,t.smallerBodyRadius*.03,t.relativeVelocity*.3+t.smallerBodyRadius*.2),l(t.collisionPoint,t.smallerBodyRadius*2,"#ffff88",300,800)},removeExpiredEffects:()=>{const t=performance.now(),{removeExpiredDebris:n}=s();e(r=>({shockwaves:r.shockwaves.filter(i=>t-i.startTime<i.duration),heatGlows:r.heatGlows.filter(i=>t-i.startTime<i.duration),tidalDisruptions:r.tidalDisruptions.filter(i=>t-i.startTime<i.duration),explosions:r.explosions.filter(i=>t-i.startTime<i.duration),supernovas:r.supernovas.filter(i=>t-i.startTime<i.duration),radialRays:r.radialRays.filter(i=>t-i.startTime<i.duration),cameraShakes:r.cameraShakes.filter(i=>t-i.startTime<i.duration),gammaRayBursts:r.gammaRayBursts.filter(i=>t-i.startTime<i.duration)})),n()},cleanup:()=>{ae.clearAll(),e({shockwaves:[],heatGlows:[],debrisClouds:[],tidalDisruptions:[],explosions:[],supernovas:[],radialRays:[],cameraShakes:[],gammaRayBursts:[]})}})),rs=()=>{if(typeof window>"u")return"desktop";const e=navigator.userAgent.toLowerCase(),s=window.innerWidth;return/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(e)?"mobile":/tablet|ipad|playbook|silk/i.test(e)||s>=768&&s<1024?"tablet":s<768?"mobile":"desktop"},ss=()=>{if(typeof window>"u")return{type:"desktop",isMobile:!1,isTablet:!1,isDesktop:!0,pixelRatio:1,maxTextureSize:4096,hardwareConcurrency:4,supportsWebGPU:!1,screenWidth:1920,screenHeight:1080};const e=rs();return{type:e,isMobile:e==="mobile",isTablet:e==="tablet",isDesktop:e==="desktop",pixelRatio:window.devicePixelRatio||1,maxTextureSize:is(),hardwareConcurrency:navigator.hardwareConcurrency||4,supportsWebGPU:"gpu"in navigator,screenWidth:window.innerWidth,screenHeight:window.innerHeight}},is=()=>{if(typeof window>"u")return 4096;try{const e=document.createElement("canvas"),s=e.getContext("webgl")||e.getContext("experimental-webgl");return s?s.getParameter(s.MAX_TEXTURE_SIZE):4096}catch{return 4096}},ns=()=>{const e=ss();let s=0;switch(e.type){case"mobile":s+=.25;break;case"tablet":s+=.45;break;case"desktop":s+=.7;break}return e.hardwareConcurrency>=8?s+=.15:e.hardwareConcurrency>=4?s+=.1:s+=.05,e.maxTextureSize>=8192?s+=.1:e.maxTextureSize>=4096&&(s+=.05),e.supportsWebGPU&&(s+=.05),Math.min(1,s)},Rt=()=>{const e=ns();return e>=.7?"high":e>=.45?"medium":"low"},Qe={shockBreakoutMs:1200,ejectaMs:15e3,remnantHoldMs:2500},Dt={breachHoldMs:1800,aftermathHoldMs:3800},It=1.65,as=1,ls=1.4,et=.5,cs=1.45,tt=e=>Math.max(0,Math.min(1,e)),ds=e=>e!==null&&e<=ls,Bt=(e,s,t,n)=>{if(e==="approach")return s===null?0:tt((It-s)/(It-as));if(e==="breach")return 1;if(e==="debris-capture"){if(n<=0)return 0;const r=tt(t/n);if(r<=et)return 1;const i=(r-et)/(1-et);return tt(1-Math.pow(i,1.15))}return 0},we=()=>({active:!1,kind:null,phase:"idle",startedAt:null,phaseStartedAt:null,autoStarted:!1,primaryBodyId:null,targetBodyId:null,focusBodyId:null,outcomeBodyId:null,countdownRemainingMs:0,metricValue:null,metricKind:null}),At=(e,s)=>s?e.find(t=>t.id===s)??null:null,us=e=>{let s=null;for(const t of e)t.isStar&&(!s||t.mass>s.mass)&&(s=t);return s?.id??null},Tt=(e,s)=>{if(e.kind==="supernova"){const r=us(s);return{primaryBodyId:r,targetBodyId:r,focusBodyId:r}}const t=s.find(r=>r.name===e.primaryBodyName)??null,n=s.find(r=>r.name===e.targetBodyName)??null;return{primaryBodyId:t?.id??null,targetBodyId:n?.id??null,focusBodyId:n?.id??t?.id??null}},ps=(e,s,t)=>{const n=At(e,s),r=At(e,t);if(!n||!r)return null;const i=n.position.x-r.position.x,l=n.position.y-r.position.y,a=n.position.z-r.position.z;return Math.sqrt(i*i+l*l+a*a)},Et=(e,s,t,n)=>{const r=ps(e,s,t);return r===null||n<=0?null:r/n},Ao=(e,s)=>{const t=e.phaseStartedAt??e.startedAt;return t===null?0:Math.max(0,s-t)},Nt=e=>e===null?null:Number(e.toFixed(2)),ms=(e,s,t)=>{const n=Ao(e,t);switch(e.phase){case"intro":return n>=s.autoStartDelayMs?{nextPhase:"countdown",updates:{countdownRemainingMs:s.countdownMs,metricKind:"countdown",metricValue:s.countdownMs},effects:[]}:{effects:[]};case"countdown":{const r=Math.max(0,s.countdownMs-n),i=Math.ceil(r/100)*100,l=i!==e.countdownRemainingMs?{countdownRemainingMs:i,metricKind:"countdown",metricValue:i}:void 0;return r<=0?{nextPhase:"shock-breakout",updates:{countdownRemainingMs:0,metricKind:null,metricValue:null},effects:["trigger-supernova"]}:{updates:l,effects:[]}}case"shock-breakout":return n>=Qe.shockBreakoutMs?{nextPhase:"ejecta",effects:[]}:{effects:[]};case"ejecta":return n>=Qe.ejectaMs?{nextPhase:"remnant",effects:[]}:{effects:[]};case"remnant":return n>=Qe.remnantHoldMs?{nextPhase:"complete",effects:[]}:{effects:[]};default:return{effects:[]}}},fs=(e,s,t,n)=>{const r=Ao(e,n);switch(e.phase){case"intro":return r>=s.autoStartDelayMs?{nextPhase:"approach",updates:{metricKind:"distance-ratio",metricValue:Nt(Et(t,e.primaryBodyId,e.targetBodyId,s.breachDistance))},effects:[]}:{effects:[]};case"approach":{const i=Nt(Et(t,e.primaryBodyId,e.targetBodyId,s.breachDistance)),l=i!==e.metricValue||e.metricKind!=="distance-ratio"?{metricKind:"distance-ratio",metricValue:i}:void 0;return i!==null&&i<=1||r>=s.breachFallbackMs?{nextPhase:"breach",updates:l,effects:["trigger-tidal-disruption"]}:{updates:l,effects:[]}}case"breach":return r>=Dt.breachHoldMs?{nextPhase:"debris-capture",updates:{metricKind:null,metricValue:null},effects:[]}:{effects:[]};case"debris-capture":return r>=s.disruptionDurationMs?{nextPhase:"aftermath",effects:["finalize-tidal-disruption"]}:{effects:[]};case"aftermath":return r>=Dt.aftermathHoldMs?{nextPhase:"complete",effects:[]}:{effects:[]};default:return{effects:[]}}},hs=(e,s,t,n)=>!e.active||!e.kind||!s?{effects:[]}:e.kind==="supernova"&&s.kind==="supernova"?ms(e,s,n):e.kind==="tidal-disruption"&&s.kind==="tidal-disruption"?fs(e,s,t,n):{effects:[]},ot=e=>{const s=O.getState();e.forEach(t=>{s.triggerCollisionEffects({body1Id:t.largerBodyId,body2Id:t.smallerBodyId,collisionPoint:t.collisionPoint,relativeVelocity:t.relativeVelocity,combinedMass:t.combinedMass,largerBodyId:t.largerBodyId,smallerBodyId:t.smallerBodyId,smallerBodyColor:t.smallerBodyColor,smallerBodyRadius:t.smallerBodyRadius})})};let ee=null;const Ut=()=>(ee||(ee=new Qr(_o.MAX_BODIES),ee.initWorkers()),ee);let se=null;const gs=()=>(se||(se=new Do),se),X={physicsDuration:0,bodyCount:0,mode:"CPU",energy:{kinetic:0,potential:0,total:0,initial:0,drift:0},lastEnergyCheck:0,cameraPosition:[0,0,0]},Ft=.02,le=Io(),Lt=ut(),S=no((e,s)=>({bodies:Lt,physicsState:null,simulationState:"running",timeScale:1,simulationTime:0,showPrediction:!1,showGrid:!0,showRealisticVisuals:!0,showHabitableZone:!1,showPerformance:!1,followingBodyId:null,selectedBodyId:null,cameraMode:"free",gpuDataInvalidated:!0,showGravityField:!1,tidallyDisruptedEvents:[],collisionEvents:[],supernovaEvents:[],scriptedScenario:we(),currentSystemId:"solar-system",currentSystemMode:null,useRealisticDistances:!1,zenMode:!1,labMode:!1,resetToken:0,qualityLevel:typeof window<"u"&&localStorage.getItem("orbit-simulator-quality")?localStorage.getItem("orbit-simulator-quality"):Rt(),cameraShakeIntensity:typeof window<"u"&&localStorage.getItem("orbit-simulator-camera-shake")?parseFloat(localStorage.getItem("orbit-simulator-camera-shake")||"1.0"):1,userMode:typeof window<"u"&&localStorage.getItem("orbit-simulator-user-mode")==="advanced"?"advanced":"beginner",hasSeenOnboarding:typeof window<"u"&&localStorage.getItem("orbit-simulator-onboarding-seen")==="true",useMultithreading:!1,useGPU:!1,isCalculating:!1,isWorkerSupported:typeof window<"u"&&!!window.Worker&&!!window.SharedArrayBuffer,isGPUSupported:null,checkGPUSupport:async()=>{const t=await Do.isSupported();e({isGPUSupported:t})},startScriptedScenario:({kind:t,primaryBodyId:n=null,targetBodyId:r=null,focusBodyId:i=null,autoStarted:l=!0})=>{le.clearAll();const a=performance.now();e({scriptedScenario:{active:!0,kind:t,phase:"intro",startedAt:a,phaseStartedAt:a,autoStarted:l,primaryBodyId:n,targetBodyId:r,focusBodyId:i??r??n,outcomeBodyId:null,countdownRemainingMs:0,metricValue:null,metricKind:null}})},advanceScriptedScenario:(t,n={})=>e(r=>{const i=r.scriptedScenario.phase!==t;return{scriptedScenario:{...r.scriptedScenario,...n,active:t!=="idle",phase:t,phaseStartedAt:i?performance.now():n.phaseStartedAt??r.scriptedScenario.phaseStartedAt}}}),completeScriptedScenario:(t=null,n={})=>e(r=>({scriptedScenario:{...r.scriptedScenario,...n,active:!0,phase:"complete",phaseStartedAt:performance.now(),focusBodyId:t??r.scriptedScenario.focusBodyId,outcomeBodyId:t,countdownRemainingMs:0,metricValue:null,metricKind:null}})),clearScriptedScenario:()=>{le.clearAll(),e({scriptedScenario:we()})},triggerScriptedTidalDisruption:(t,n,r)=>{const{bodies:i,tidallyDisruptedEvents:l,qualityLevel:a}=s(),c=i.find(u=>u.id===t),d=i.find(u=>u.id===n);if(!c||!d||l.some(u=>u.bodyId===n))return;const f=O.getState(),p=performance.now(),g=fe(a),h=c.position.clone().sub(d.position);h.lengthSq()>1e-4?h.normalize():h.set(1,0,0),e(u=>({bodies:u.bodies.map(m=>m.id===n?{...m,radius:Math.max(m.radius*.28,1.1),velocity:new P(0,0,0),isBeingDestroyed:!0,destructionProgress:0,destructionStartTime:p}:m),tidallyDisruptedEvents:[...u.tidallyDisruptedEvents,{bodyId:d.id,primaryId:c.id,position:{x:d.position.x,y:d.position.y,z:d.position.z},primaryPosition:{x:c.position.x,y:c.position.y,z:c.position.z},bodyRadius:d.radius,bodyColor:d.color,primaryMass:c.mass,startTime:p,duration:r}],scriptedScenario:{...u.scriptedScenario,focusBodyId:d.id}})),f.addCameraShake(1.45,2800,"exponential"),f.addExplosion({x:d.position.x,y:d.position.y,z:d.position.z},d.radius*5.8,"#ffffff",Math.min(480,Math.max(220,g.maxExplosionParticles*2)),950),f.addShockwave({x:d.position.x,y:d.position.y,z:d.position.z},d.radius*10.5,"#dcecff",2400,.55,{x:h.x,y:h.y,z:h.z}),f.addHeatGlow(c.id,{x:c.position.x,y:c.position.y,z:c.position.z},c.radius*6.5,1.25,r+1800),le.schedule(()=>{f.addExplosion({x:d.position.x,y:d.position.y,z:d.position.z},d.radius*4.5,"#dbe8ff",Math.min(260,Math.max(120,g.maxExplosionParticles+80)),1800)},180),le.schedule(()=>{const u=h.clone().multiplyScalar(d.radius*1.4);f.addDebrisCloud(d.id,{x:d.position.x,y:d.position.y,z:d.position.z},{x:u.x,y:u.y,z:u.z},"#f4dcc7",Math.min(g.maxDebrisParticles,Math.max(180,Math.floor(g.maxDebrisParticles*.34))),d.radius*.08,d.radius*2.4)},420)},finalizeScriptedTidalDisruption:(t,n)=>{const r=s().bodies.find(l=>l.id===t),i=O.getState();r&&i.addHeatGlow(r.id,{x:r.position.x,y:r.position.y,z:r.position.z},r.radius*7,1.3,3800),e(l=>({bodies:l.bodies.filter(a=>a.id!==n).map(a=>a.id!==t?a:{...a,hasAccretionDisk:!0,accretionDiskConfig:a.accretionDiskConfig?{...a.accretionDiskConfig,outerRadius:Math.max(a.accretionDiskConfig.outerRadius,20),particleCount:Math.max(a.accretionDiskConfig.particleCount??0,4200),rotationSpeed:Math.max(a.accretionDiskConfig.rotationSpeed,2.75)}:{innerRadius:3,outerRadius:20,rotationSpeed:2.75,particleCount:4200,tilt:.2}}),physicsState:null,gpuDataInvalidated:!0,selectedBodyId:l.selectedBodyId===n?null:l.selectedBodyId,followingBodyId:l.followingBodyId===n?null:l.followingBodyId,scriptedScenario:{...l.scriptedScenario,focusBodyId:t,outcomeBodyId:t,metricKind:null,metricValue:null}}))},cleanup:()=>{le.clearAll(),O.getState().cleanup(),ee&&(ee.terminate(),ee=null),se&&(se.dispose(),se=null),e({supernovaEvents:[],scriptedScenario:we(),collisionEvents:[],tidallyDisruptedEvents:[]})},toggleMultithreading:()=>{const{useMultithreading:t}=s();t&&ee&&(ee.terminate(),ee=null),t||se&&(se.dispose(),se=null),e(n=>({useMultithreading:!n.useMultithreading,useGPU:!1,physicsState:null,gpuDataInvalidated:!0,isCalculating:!1}))},toggleGPU:()=>{const{useGPU:t}=s();t&&se&&(se.dispose(),se=null),t||ee&&(ee.terminate(),ee=null),e(n=>({useGPU:!n.useGPU,useMultithreading:!1,physicsState:null,gpuDataInvalidated:!0,isCalculating:!1}))},toggleRealisticDistances:()=>{const{useRealisticDistances:t,bodies:n}=s(),r=!t,i=r?Je:1/Je,l=1/Math.sqrt(i),a=n.map(c=>c.isFixed?c:{...c,position:new P(c.position.x*i,c.position.y*i,c.position.z*i),velocity:new P(c.velocity.x*l,c.velocity.y*l,c.velocity.z*l)});typeof window<"u"&&window.dispatchEvent(new CustomEvent("distanceScaleChanged",{detail:{realistic:r,factor:i}})),e({useRealisticDistances:r,bodies:a,physicsState:null,gpuDataInvalidated:!0})},addTidalDisruptionEvent:t=>e(n=>({tidallyDisruptedEvents:[...n.tidallyDisruptedEvents,t]})),removeTidalDisruptionEvent:t=>e(n=>({tidallyDisruptedEvents:n.tidallyDisruptedEvents.filter(r=>r.bodyId!==t)})),addCollisionEvent:t=>e(n=>({collisionEvents:[...n.collisionEvents,t]})),removeCollisionEvent:t=>e(n=>({collisionEvents:n.collisionEvents.filter(r=>r.id!==t)})),triggerSupernova:t=>{const{bodies:n,supernovaEvents:r}=s(),i=n.find(g=>g.id===t),l=r.find(g=>g.starId===t);if(!i||!i.isStar||l){console.warn("Cannot trigger supernova: invalid target or event already active");return}O.getState().triggerSupernova(t,{x:i.position.x,y:i.position.y,z:i.position.z},i.mass,i.radius,i.color);const c=i.radius*100*Math.pow(i.mass/1e5,.4),d=i.mass*.5,f=n.map(g=>{if(g.id===t)return{...g,isBeingDestroyed:!0,destructionProgress:0,destructionStartTime:performance.now()};const h=g.position.x-i.position.x,u=g.position.y-i.position.y,m=g.position.z-i.position.z,v=Math.sqrt(h*h+u*u+m*m);if(v>c||v<.001)return g;const w=d/(v*v),y=h/v,M=u/v,k=m/v,z=w/Math.max(g.mass,1);return{...g,velocity:new P(g.velocity.x+y*z,g.velocity.y+M*z,g.velocity.z+k*z)}});e({bodies:f,physicsState:null,gpuDataInvalidated:!0});const p={id:q(),starId:t,position:{x:i.position.x,y:i.position.y,z:i.position.z},mass:i.mass,radius:i.radius,color:i.color,startTime:performance.now(),duration:15e3,explosionEnergy:i.mass*1e3,remnantType:Bo(i.mass),shockwaveRadius:i.radius*100};e(g=>({supernovaEvents:[...g.supernovaEvents,p]})),le.schedule(()=>{const g=s(),h=g.bodies.find(m=>m.id===t);if(!h){e(m=>({supernovaEvents:m.supernovaEvents.filter(v=>v.id!==p.id)}));return}let u={};if(p.remnantType==="black-hole"){u={name:`${h.name} (Black Hole)`,radius:h.radius*.1,color:"#000000",isCompactObject:!0,type:"black_hole",hasAccretionDisk:!0,hasJets:!0,accretionDiskConfig:{innerRadius:3,outerRadius:15,rotationSpeed:2,particleCount:3e3,tilt:.3}};const m=p.shockwaveRadius*.8,w=h.mass*.3,y=g.bodies.map(M=>{if(M.id===t)return M;const k=h.position.x-M.position.x,z=h.position.y-M.position.y,b=h.position.z-M.position.z,R=Math.sqrt(k*k+z*z+b*b);if(R>m||R<h.radius*5)return M;const j=w/(R*R),C=k/R,x=z/R,D=b/R,I=j/Math.max(M.mass,1);return{...M,velocity:new P(M.velocity.x+C*I,M.velocity.y+x*I,M.velocity.z+D*I)}});e(M=>({bodies:y.map(k=>k.id===t?{...k,...u,isBeingDestroyed:!1,destructionProgress:1}:k),physicsState:null,gpuDataInvalidated:!0,supernovaEvents:M.supernovaEvents.filter(k=>k.id!==p.id),scriptedScenario:M.scriptedScenario.kind==="supernova"&&M.scriptedScenario.targetBodyId===t?{...M.scriptedScenario,focusBodyId:t,outcomeBodyId:t}:M.scriptedScenario}));return}else if(p.remnantType==="neutron-star")u={name:`${h.name} (Neutron Star)`,mass:h.mass*.15,radius:h.radius*.05,color:"#88ccff",isCompactObject:!0,type:"star"};else{e(m=>({bodies:m.bodies.filter(v=>v.id!==t),physicsState:null,gpuDataInvalidated:!0,selectedBodyId:m.selectedBodyId===t?null:m.selectedBodyId,followingBodyId:m.followingBodyId===t?null:m.followingBodyId,supernovaEvents:m.supernovaEvents.filter(v=>v.id!==p.id),scriptedScenario:m.scriptedScenario.kind==="supernova"&&m.scriptedScenario.targetBodyId===t?{...m.scriptedScenario,focusBodyId:null,outcomeBodyId:null}:m.scriptedScenario}));return}e(m=>({bodies:m.bodies.map(v=>v.id===t?{...v,...u,isBeingDestroyed:!1,destructionProgress:1}:v),physicsState:null,gpuDataInvalidated:!0,supernovaEvents:m.supernovaEvents.filter(v=>v.id!==p.id),scriptedScenario:m.scriptedScenario.kind==="supernova"&&m.scriptedScenario.targetBodyId===t?{...m.scriptedScenario,focusBodyId:t,outcomeBodyId:t}:m.scriptedScenario}))},15e3)},toggleGravityField:()=>e(t=>({showGravityField:!t.showGravityField})),history:[],historyIndex:-1,pushHistoryAction:t=>e(n=>{const r=n.history.slice(0,n.historyIndex+1);return{history:[...r,t],historyIndex:r.length}}),undo:()=>{const{history:t,historyIndex:n}=s();if(n<0)return;const r=t[n];switch(r.type){case"ADD":e(i=>({bodies:i.bodies.filter(l=>l.id!==r.body.id),physicsState:null,gpuDataInvalidated:!0,selectedBodyId:i.selectedBodyId===r.body.id?null:i.selectedBodyId}));break;case"REMOVE":e(i=>({bodies:[...i.bodies,r.body],physicsState:null,gpuDataInvalidated:!0}));break;case"UPDATE":e(i=>({bodies:i.bodies.map(l=>l.id===r.id?{...l,...r.previous}:l),physicsState:null,gpuDataInvalidated:!0}));break}e({historyIndex:n-1})},redo:()=>{const{history:t,historyIndex:n}=s();if(n>=t.length-1)return;const r=t[n+1];switch(r.type){case"ADD":e(i=>({bodies:[...i.bodies,r.body],physicsState:null,gpuDataInvalidated:!0}));break;case"REMOVE":e(i=>({bodies:i.bodies.filter(l=>l.id!==r.body.id),physicsState:null,gpuDataInvalidated:!0,selectedBodyId:i.selectedBodyId===r.body.id?null:i.selectedBodyId}));break;case"UPDATE":e(i=>({bodies:i.bodies.map(l=>l.id===r.id?{...l,...r.current}:l),physicsState:null,gpuDataInvalidated:!0}));break}e({historyIndex:n+1})},addBody:t=>{const{bodies:n,pushHistoryAction:r}=s(),i={...t,id:q()};r({type:"ADD",body:i});const l=[...n,i];e({bodies:l,physicsState:null,gpuDataInvalidated:!0})},duplicateBody:t=>{const{bodies:n,pushHistoryAction:r}=s(),i=n.find(a=>a.id===t);if(!i)return;const l={...i,id:q(),name:`${i.name} (Copy)`,position:i.position.clone().add(new P(2,0,2)),velocity:i.velocity.clone()};r({type:"ADD",body:l}),e(a=>({bodies:[...a.bodies,l],selectedBodyId:l.id,physicsState:null,gpuDataInvalidated:!0}))},removeBody:t=>{const{bodies:n,followingBodyId:r,selectedBodyId:i,pushHistoryAction:l}=s(),a=n.find(d=>d.id===t);a&&l({type:"REMOVE",body:a});const c=n.filter(d=>d.id!==t);e({bodies:c,physicsState:null,followingBodyId:r===t?null:r,selectedBodyId:i===t?null:i,gpuDataInvalidated:!0})},updateBodies:async()=>{const{bodies:t,simulationState:n,timeScale:r,simulationTime:i,physicsState:l,useMultithreading:a,useGPU:c,isCalculating:d,gpuDataInvalidated:f}=s();if(X.bodyCount=t.length,X.mode=c?"GPU":a?"Worker":"CPU",n==="paused"||(a||c)&&d)return;const p=performance.now(),g=Mo(r,s().useRealisticDistances),h=performance.now();if(!X.lastEnergyCheck||h-X.lastEnergyCheck>1e3){X.lastEnergyCheck=h;const u=m=>{const v=typeof m=="number"?{kinetic:0,potential:0,total:m}:m;(i<.1||X.energy.initial===0)&&(X.energy.initial=v.total);const w=X.energy.initial!==0?(v.total-X.energy.initial)/Math.abs(X.energy.initial):0;X.energy={...v,initial:X.energy.initial,drift:w}};if(a)Ut().calculateEnergy(t.length).then(m=>{u(m)});else{const m=qr(t);u(m)}}if(c){e({isCalculating:!0});try{const u=gs();u.isReady||await u.init(_o.MAX_BODIES);const m=Math.ceil(g/Ft),v=g/m;(f||!u.isReady)&&(await u.setBodies(t),e({gpuDataInvalidated:!1}));for(let y=0;y<m;y++)await u.step(v,t.length);const w=await u.getBodies(t.length);if(w){let y=t.map((k,z)=>{const b=z*12;return{...k,position:new P(w[b],w[b+1],w[b+2]),velocity:new P(w[b+4],w[b+5],w[b+6])}});const M=await u.getCollisions();if(M&&M.length>0){const{bodies:k,hasRemovals:z,collisionEvents:b}=Xe(y,M);y=k,b&&b.length>0&&(b.forEach(R=>{s().addCollisionEvent({id:q(),position:R.collisionPoint,color:R.smallerBodyColor,startTime:performance.now(),impactRadius:R.smallerBodyRadius,focusBodyId:R.largerBodyId})}),ot(b)),z&&e({physicsState:null,gpuDataInvalidated:!0})}e({bodies:y,physicsState:null,simulationTime:i+g,isCalculating:!1})}}catch(u){if(u instanceof Error&&(u.name==="AbortError"||u.message.includes("destroyed")))return;console.error("GPU Step Failed",u),e({isCalculating:!1,useGPU:!1})}}else if(a){e({isCalculating:!0});const u=Ut();(!l||l.count!==t.length)&&u.setBodies(t);const m=[];u.onCollision=v=>{m.push(...v)};try{await u.executeStep(t.length,g);const v=u.getPhysicsState(t.length);v.ids=t.map(y=>y.id);let w=Pt(v,t);if(m.length>0){const{bodies:y,hasRemovals:M,collisionEvents:k}=Xe(w,m);w=y,k&&k.length>0&&(k.forEach(z=>{s().addCollisionEvent({id:q(),position:z.collisionPoint,color:z.smallerBodyColor,startTime:performance.now(),impactRadius:z.smallerBodyRadius,focusBodyId:z.largerBodyId})}),ot(k)),M&&e({physicsState:null})}e({bodies:w,physicsState:v,simulationTime:i+g,isCalculating:!1})}catch(v){console.warn("Worker Step Failed / Terminated",v),e({isCalculating:!1,useMultithreading:!1})}}else{let u=l;(!u||u.count!==t.length)&&(u=Gr(t));const m=Math.ceil(g/Ft),v=g/m;for(let b=0;b<m;b++)Hr(u,v,!1,!1);let w=Pt(u,t);const{positions:y,radii:M,masses:k}=u,z=[];for(let b=0;b<u.count;b++)if(!(k[b]<=0))for(let R=b+1;R<u.count;R++){if(k[R]<=0)continue;const j=b*3,C=R*3,x=y[j]-y[C],D=y[j+1]-y[C+1],I=y[j+2]-y[C+2],A=x*x+D*D+I*I,W=M[b]+M[R];A<(W*.8)**2&&z.push([b,R])}if(z.length>0){const{bodies:b,collisionEvents:R}=Xe(w,z);w=b,R&&R.length>0&&(R.forEach(j=>{s().addCollisionEvent({id:q(),position:j.collisionPoint,color:j.smallerBodyColor,startTime:performance.now(),impactRadius:j.smallerBodyRadius,focusBodyId:j.largerBodyId})}),ot(R)),e({physicsState:null})}e({bodies:w,physicsState:u,simulationTime:i+g})}X.physicsDuration=performance.now()-p},setSimulationState:t=>e({simulationState:t}),loadSolarSystem:()=>{le.clearAll(),O.getState().cleanup(),e({bodies:ut(),physicsState:null,timeScale:1,simulationState:"running",simulationTime:0,followingBodyId:null,selectedBodyId:null,cameraMode:"free",gpuDataInvalidated:!0,useRealisticDistances:!1,currentSystemId:"solar-system",currentSystemMode:null,tidallyDisruptedEvents:[],collisionEvents:[],supernovaEvents:[],scriptedScenario:we(),resetToken:0,history:[],historyIndex:-1})},loadStarSystem:(t,n)=>{const r=We(t);if(!r)return;le.clearAll(),O.getState().cleanup();const i=r.createBodies(n).map(a=>({...a,id:q()})),l=n&&r.getCameraForMode?r.getCameraForMode(n):r.initialCamera;if(typeof window<"u"&&window.dispatchEvent(new CustomEvent("starSystemChanged",{detail:{systemId:t,mode:n,camera:l}})),e({bodies:i,currentSystemId:t,currentSystemMode:n||null,physicsState:null,timeScale:1,simulationState:"running",simulationTime:0,followingBodyId:null,selectedBodyId:null,cameraMode:"free",gpuDataInvalidated:!0,useRealisticDistances:!1,tidallyDisruptedEvents:[],collisionEvents:[],supernovaEvents:[],scriptedScenario:we(),zenMode:!1,resetToken:0,history:[],historyIndex:-1}),r.scenario){const a=Tt(r.scenario,i);(a.primaryBodyId||a.targetBodyId)&&s().startScriptedScenario({kind:r.scenario.kind,...a,autoStarted:!0})}},toggleZenMode:()=>e(t=>({zenMode:!t.zenMode})),toggleLabMode:()=>e(t=>({labMode:!t.labMode})),setQualityLevel:t=>{typeof window<"u"&&localStorage.setItem("orbit-simulator-quality",t);let n=t;t==="auto"&&(n=Rt()),e({qualityLevel:n})},setCameraShakeIntensity:t=>{const n=Math.max(0,Math.min(2,t));typeof window<"u"&&localStorage.setItem("orbit-simulator-camera-shake",String(n)),e({cameraShakeIntensity:n})},setUserMode:t=>{typeof window<"u"&&localStorage.setItem("orbit-simulator-user-mode",t),e({userMode:t})},setHasSeenOnboarding:t=>{typeof window<"u"&&localStorage.setItem("orbit-simulator-onboarding-seen",String(t)),e({hasSeenOnboarding:t})},setTimeScale:t=>e({timeScale:t}),togglePrediction:()=>e(t=>({showPrediction:!t.showPrediction})),toggleGrid:()=>e(t=>({showGrid:!t.showGrid})),toggleRealisticVisuals:()=>e(t=>({showRealisticVisuals:!t.showRealisticVisuals})),toggleHabitableZone:()=>e(t=>({showHabitableZone:!t.showHabitableZone})),togglePerformance:()=>e(t=>({showPerformance:!t.showPerformance})),setFollowingBody:t=>e({followingBodyId:t}),selectBody:t=>e({selectedBodyId:t}),setCameraMode:t=>e({cameraMode:t}),updateBody:(t,n)=>{const{bodies:r}=s(),i=r.map(l=>l.id===t?{...l,...n}:l);e({bodies:i,physicsState:null,gpuDataInvalidated:!0})},reset:()=>{const{currentSystemId:t,currentSystemMode:n,bodies:r,resetToken:i}=s(),l=t&&t!=="solar-system"?We(t):null;le.clearAll(),O.getState().cleanup();let a=Lt;t&&t!=="solar-system"?l&&(a=l.createBodies(n||void 0).map(g=>({...g,id:q()}))):a=ut();const c=new Map(r.map(g=>[g.name,g.id])),d=a.map(g=>c.has(g.name)?{...g,id:c.get(g.name)}:g),f=s().useRealisticDistances;let p=d;if(f){const g=Je,h=1/Math.sqrt(g);p=p.map(u=>u.isFixed?u:{...u,position:new P(u.position.x*g,u.position.y*g,u.position.z*g),velocity:new P(u.velocity.x*h,u.velocity.y*h,u.velocity.z*h)})}if(e({bodies:p,physicsState:null,simulationTime:0,gpuDataInvalidated:!0,tidallyDisruptedEvents:[],collisionEvents:[],supernovaEvents:[],scriptedScenario:we(),resetToken:i+1,showGravityField:!1,history:[],historyIndex:-1}),l?.scenario){const g=Tt(l.scenario,p);(g.primaryBodyId||g.targetBodyId)&&s().startScriptedScenario({kind:l.scenario.kind,...g,autoStarted:!0})}}}));typeof window<"u"&&(window.__physicsStore=S);const vs=`
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
`,xs=`
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
`,ys=`
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
`,bs=`
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
`,Ss=`
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
    }
`,ws=`
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
`,_s=({position:e,innerRadius:s,outerRadius:t,rotationSpeed:n=1,particleCount:r,tilt:i=.1})=>{const l=_.useRef(null),a=_.useRef(null),c=_.useRef(null),d=_.useRef(null),f=_.useRef(null),p=S(M=>M.simulationState),g=S(M=>M.qualityLevel);Se();const h=r??fe(g).accretionDiskParticles,{geometry:u,material:m}=_.useMemo(()=>{const M=new qe,k=new Float32Array(h*3),z=new Float32Array(h),b=new Float32Array(h),R=new Float32Array(h),j=new Float32Array(h*2),C=new Float32Array(h),x=new Float32Array(h),D=new Float32Array(h);for(let A=0;A<h;A++){const W=Math.random(),N=s+(t-s)*Math.pow(W,.35),L=Math.random()*Math.PI*2,Y=(N-s)/(t-s),E=Y*t*.06,H=(Math.random()-.5)*E,oe=Math.cos(L)*N,K=Math.sin(L)*N;k[A*3]=oe,k[A*3+1]=H,k[A*3+2]=K,C[A]=L,x[A]=N,D[A]=N;const J=(1-Y)*.8;R[A]=J;const re=L+Math.PI/2;j[A*2]=Math.cos(re),j[A*2+1]=Math.sin(re);const B=1-Y;b[A]=B,z[A]=.8+Y*1.8}M.setAttribute("position",new $(k,3)),M.setAttribute("size",new $(z,1)),M.setAttribute("temperature",new $(b,1)),M.setAttribute("velocity",new $(R,1)),M.setAttribute("velocityDir",new $(j,2)),a.current=C,c.current=x,d.current=D;const I=new De({vertexShader:vs,fragmentShader:xs,uniforms:{time:{value:0},innerRadius:{value:s},rotationSpeed:{value:n}},transparent:!0,blending:Z,depthWrite:!1});return{geometry:M,material:I}},[s,t,h,n]),v=_.useMemo(()=>new De({vertexShader:ys,fragmentShader:bs,uniforms:{time:{value:0}},transparent:!0,blending:Z,depthWrite:!1,side:me}),[]),w=_.useMemo(()=>new De({vertexShader:Ss,fragmentShader:ws,uniforms:{}}),[]);G((M,k)=>{if(!l.current||!a.current||!c.current||!d.current||p!=="running")return;const z=u.attributes.position.array,b=u.attributes.velocity.array,R=u.attributes.velocityDir.array,j=u.attributes.temperature.array,C=u.attributes.size.array,x=a.current,D=c.current,I=d.current;m.uniforms.time.value=M.clock.elapsedTime,v.uniforms.time.value=M.clock.elapsedTime;const A=.15,W=.02;for(let N=0;N<h;N++){let L=D[N];const Y=Math.max(0,(L-s)/(t-s)),E=1+(1-Y)*2,H=n*A*E*(s/L);x[N]+=H*k;const oe=W*(1+(1-Y)*2);L-=oe*k,D[N]=L,L<=s*.9&&(D[N]=I[N],L=I[N],x[N]=Math.random()*Math.PI*2);const K=Math.cos(x[N])*L,J=Math.sin(x[N])*L;z[N*3]=K,z[N*3+2]=J;const re=(L-s)/(t-s),B=Math.min(1,(1-re)*1.2);b[N]=B;const Q=x[N]+Math.PI/2,he=x[N]+Math.PI,de=.15,V=Math.cos(Q)*(1-de)+Math.cos(he)*de,F=Math.sin(Q)*(1-de)+Math.sin(he)*de,ne=Math.sqrt(V*V+F*F);R[N*2]=V/ne,R[N*2+1]=F/ne,j[N]=1-re,C[N]=.8+re*1.8}u.attributes.position.needsUpdate=!0,u.attributes.velocity.needsUpdate=!0,u.attributes.velocityDir.needsUpdate=!0,u.attributes.temperature.needsUpdate=!0,u.attributes.size.needsUpdate=!0});const y=s*.5;return o.jsxs("group",{ref:f,position:[e.x,e.y,e.z],rotation:[i,0,0],children:[o.jsx("points",{ref:l,geometry:u,material:m}),o.jsxs("mesh",{rotation:[Math.PI/2,0,0],children:[o.jsx("torusGeometry",{args:[y,y*.15,16,64]}),o.jsx("primitive",{object:v,attach:"material"})]}),o.jsxs("mesh",{rotation:[Math.PI/2,0,0],children:[o.jsx("torusGeometry",{args:[y*.7,y*.08,12,48]}),o.jsx("meshBasicMaterial",{color:"#ffffff",transparent:!0,opacity:.4,blending:Z})]}),o.jsxs("mesh",{children:[o.jsx("sphereGeometry",{args:[s*.6,32,16]}),o.jsx("meshBasicMaterial",{color:"#ffddaa",transparent:!0,opacity:.25,blending:Z})]}),o.jsxs("mesh",{children:[o.jsx("sphereGeometry",{args:[s*.25,32,32]}),o.jsx("primitive",{object:w,attach:"material"})]}),o.jsxs("mesh",{children:[o.jsx("sphereGeometry",{args:[s*.35,32,32]}),o.jsx("meshBasicMaterial",{color:"#000000",transparent:!0,opacity:.95})]})]})},Cs=`
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
`,Ms=`
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
`,ks=({position:e,length:s,baseWidth:t,particleCount:n=8e3,speed:r=1,color:i="#4488ff"})=>{const l=_.useRef(null),a=_.useRef(null),c=_.useRef(null),d=_.useRef(null),f=_.useRef(null),p=S(u=>u.simulationState),{geometry:g,material:h}=_.useMemo(()=>{const u=new qe,m=new Float32Array(n*3),v=new Float32Array(n),w=new Float32Array(n),y=new Float32Array(n),M=new Float32Array(n),k=new Float32Array(n),z=new Float32Array(n),b=n/2;for(let j=0;j<n;j++){const C=j<b?1:-1,x=Math.random();y[j]=x,z[j]=.5+Math.random();const D=t*(.1+x*.5),I=Math.random()*Math.PI*2,A=Math.random()*D;M[j]=A,k[j]=I;const W=Math.cos(I)*A,N=x*s*C,L=Math.sin(I)*A;m[j*3]=W,m[j*3+1]=N,m[j*3+2]=L,v[j]=2*(1-x*.7),w[j]=.8*(1-x*.6)}u.setAttribute("position",new $(m,3)),u.setAttribute("size",new $(v,1)),u.setAttribute("alpha",new $(w,1)),a.current=y,c.current=M,d.current=k,f.current=z;const R=new De({vertexShader:Cs,fragmentShader:Ms,uniforms:{jetColor:{value:new U(i)}},transparent:!0,blending:Z,depthWrite:!1});return{geometry:u,material:R}},[s,t,n,i]);return G((u,m)=>{if(!l.current||!a.current||!c.current||!d.current||!f.current||p!=="running")return;const v=g.attributes.position.array,w=g.attributes.alpha.array,y=g.attributes.size.array,M=a.current,k=c.current,z=d.current,b=f.current,R=n/2;for(let j=0;j<n;j++){const C=j<R?1:-1;M[j]+=m*r*.3*b[j],M[j]>1&&(M[j]=0,k[j]=Math.random()*t*.1,z[j]=Math.random()*Math.PI*2,b[j]=.5+Math.random());const x=M[j],D=k[j]*(.5+x*1.5),I=Math.cos(z[j])*D,A=x*s*C,W=Math.sin(z[j])*D;v[j*3]=I,v[j*3+1]=A,v[j*3+2]=W,w[j]=.8*(1-x*.7),y[j]=2*(1-x*.5)}g.attributes.position.needsUpdate=!0,g.attributes.alpha.needsUpdate=!0,g.attributes.size.needsUpdate=!0}),o.jsxs("group",{position:[e.x,e.y,e.z],children:[o.jsx("points",{ref:l,geometry:g,material:h}),o.jsxs("mesh",{children:[o.jsx("sphereGeometry",{args:[t*.3,16,8]}),o.jsx("meshBasicMaterial",{color:i,transparent:!0,opacity:.5,blending:Z})]})]})},Be=`
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
`,js={vertexShader:`
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

        ${Be}

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
    `},Ps={vertexShader:`
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

        ${Be}

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
    `},zs={vertexShader:`
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

        ${Be}

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
    `},Rs={vertexShader:`
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

        ${Be}

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
    `},Ds={vertexShader:`
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

        ${Be}

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
    `},Is=({radius:e,color:s,type:t="terrestrial"})=>{const n=_.useRef(null),r=_.useRef(null),i=_.useMemo(()=>new U(s),[s]),l=_.useMemo(()=>t==="gas_giant"?i.clone().multiplyScalar(.7).offsetHSL(.1,0,0):t==="terrestrial"?new U("#003366"):t==="rocky"?i.clone().multiplyScalar(.5):t==="ice"?new U("#0077be"):t==="molten"?new U("#ff4500"):new U("white"),[t,i]),a=_.useMemo(()=>{switch(t){case"gas_giant":return Ps;case"rocky":return zs;case"ice":return Rs;case"molten":return Ds;default:return js}},[t]),c=_.useMemo(()=>({time:{value:0},baseColor:{value:i},secondaryColor:{value:l}}),[i,l]);return G(({clock:d})=>{r.current&&(r.current.uniforms.time.value=d.getElapsedTime(),r.current.uniforms.baseColor.value=i,r.current.uniforms.secondaryColor.value=l)}),o.jsxs("mesh",{ref:n,children:[o.jsx("sphereGeometry",{args:[e,64,64]}),o.jsx("shaderMaterial",{ref:r,uniforms:c,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader})]})},Bs=[0,0,0,0,0,0],As=({body:e})=>{const s=Zo(e.texturePath);return o.jsx("meshStandardMaterial",{map:s,emissiveMap:e.isStar?s:void 0,emissive:e.isStar?"white":"black",emissiveIntensity:e.isStar?2:0,roughness:1,metalness:0})},Ts=({position:e,color:s})=>{const t=T.useRef([]),n=T.useRef([]),r=T.useRef(0),i=T.useRef(null),l=T.useRef([]),a=S(m=>m.useRealisticDistances),c=S(m=>m.resetToken),d=S(m=>m.simulationState),f=S(m=>m.qualityLevel),p=fe(f),g={RECENT_MAX:p.trailRecentPoints,RECENT_INTERVAL:2,COMPRESSED_MAX:p.trailCompressedPoints,COMPRESS_RATIO:p.trailCompressionRatio,COMPRESS_TRIGGER:Math.floor(p.trailRecentPoints*1.33)},h=g.RECENT_MAX+g.COMPRESSED_MAX,u=T.useCallback(m=>{if(!i.current)return;const v=m.length>=6?m:Bs;i.current.geometry.setPositions(v),i.current.computeLineDistances()},[]);return T.useEffect(()=>{t.current=[],n.current=[],r.current=0,l.current.length=0,u(l.current)},[c,u,a]),G(()=>{if(d!=="running"||!i.current)return;if(r.current++,r.current%g.RECENT_INTERVAL===0&&(t.current.push(e.clone()),t.current.length>g.COMPRESS_TRIGGER)){const y=t.current.splice(0,g.COMPRESS_TRIGGER-g.RECENT_MAX);for(let M=0;M<y.length;M+=g.COMPRESS_RATIO)n.current.push(y[M]);for(;n.current.length>g.COMPRESSED_MAX;)n.current.shift()}const m=[...n.current,...t.current],v=Math.min(m.length,h),w=l.current;if(v<2){w.length=0,u(w);return}w.length=v*3;for(let y=0;y<v;y++){const M=m[y],k=y*3;w[k]=M.x,w[k+1]=M.y,w[k+2]=M.z}u(w)}),o.jsx(ft,{ref:i,points:[[0,0,0],[0,0,0]],color:s,lineWidth:2.5,opacity:.6,transparent:!0})},Es=({body:e})=>{const s=S(B=>B.showRealisticVisuals),t=S(B=>B.showGrid),n=S(B=>B.simulationTime),r=S(B=>B.qualityLevel),i=S(B=>B.bodies.length),l=S(B=>B.selectedBodyId),a=S(B=>B.followingBodyId),c=S(B=>B.selectBody),d=S(B=>B.cameraMode),f=S(B=>B.currentSystemId),p=S(B=>B.scriptedScenario),g=S(B=>B.tidallyDisruptedEvents),h=T.useRef(null),u=T.useRef(null),m=T.useRef(null),v=fe(r),w=T.useMemo(()=>new P(1,0,0),[]),y=T.useMemo(()=>new P(1,1,1),[]),M=T.useMemo(()=>new P,[]),k=T.useMemo(()=>new P(.95,.98,1.05),[]),z=T.useRef(-1),[b,R]=T.useState(0),j=_.useMemo(()=>g.find(B=>B.bodyId===e.id)??null,[e.id,g]),C=_.useMemo(()=>{if(!f)return null;const B=We(f)?.scenario;return B?.kind==="tidal-disruption"?B:null},[f]),x=j?j.position:{x:e.position.x,y:e.position.y,z:e.position.z},D=_.useMemo(()=>new P(x.x,x.y,x.z),[x.x,x.y,x.z]),I=_.useMemo(()=>(e.axialTilt||0)*(Math.PI/180),[e.axialTilt]),A=_.useMemo(()=>{if(e.mass>200)return"gas_giant";const B=e.name.toLowerCase();if(B.includes("sun"))return"star";if(B.includes("mercury"))return"rocky";if(B.includes("venus")||B.includes("earth"))return"terrestrial";if(B.includes("mars"))return"rocky";if(B.includes("jupiter")||B.includes("saturn")||B.includes("uranus")||B.includes("neptune"))return"gas_giant";if(B.includes("moon")||B.includes("luna"))return"rocky";if(B.includes("europa")||B.includes("enceladus")||B.includes("pluto"))return"ice";if(B.includes("io")||B.includes("volcano"))return"molten";const Q=Math.sqrt(e.position.x**2+e.position.z**2);return Q<15?"molten":Q>800&&e.mass<100?"ice":e.mass<.2?"rocky":"terrestrial"},[e.mass,e.position.x,e.position.z,e.name]);G(()=>{m.current&&e.rotationSpeed&&(m.current.rotation.y=e.rotationSpeed*n*2300);const B=m.current?.material,Q=p.phaseStartedAt===null?0:Math.max(0,performance.now()-p.phaseStartedAt),he=p.kind==="tidal-disruption"&&p.targetBodyId===e.id&&!!C;if(u.current)if(he&&C){const V=Bt(p.phase,p.metricValue,Q,C.disruptionDurationMs),F=j?j.bodyRadius/Math.max(e.radius,.001):1,ne=F*(1+1.35*V),ge=F*Math.max(.72,1-.28*V),Ae=S.getState().bodies,Te=p.primaryBodyId?Ae.find(ve=>ve.id===p.primaryBodyId):null;if(u.current.scale.set(ne,ge,ge),Te){const ve=Te.position.clone().sub(D);ve.lengthSq()>1e-4&&(ve.normalize(),u.current.quaternion.setFromUnitVectors(w,ve))}}else u.current.scale.copy(y),u.current.quaternion.identity();if(B&&"color"in B&&"emissive"in B&&"emissiveIntensity"in B){const V=B,F=new P(parseInt(e.color.slice(1,3),16)/255,parseInt(e.color.slice(3,5),16)/255,parseInt(e.color.slice(5,7),16)/255);if(he&&C){const ne=Bt(p.phase,p.metricValue,Q,C.disruptionDurationMs);M.copy(F).lerp(k,ne*.55),V.color.setRGB(M.x,M.y,M.z),V.emissive.setRGB(M.x,M.y,M.z),V.emissiveIntensity=2+ne*2.5}else V.color.setRGB(F.x,F.y,F.z),V.emissive.setRGB(F.x,F.y,F.z),V.emissiveIntensity=e.isStar||e.isCompactObject?2:0}if(p.kind==="tidal-disruption"&&p.primaryBodyId===e.id&&!!C&&C){let V=0;p.phase==="debris-capture"?V=Math.max(0,Math.min(1,Q/C.disruptionDurationMs)):(p.phase==="aftermath"||p.phase==="complete")&&(V=1);const F=Math.round(V*6);F!==z.current&&(z.current=F,R(V))}else(z.current!==0||b!==0)&&(z.current=0,R(0))});const W=d==="surface_lock",N=W&&a===e.id,L=e.id===l||e.id===a,Y=!N&&(L||i<=v.maxVisibleLabels||e.isStar&&i<=v.maxVisibleStarLabels),E=!N&&!j&&(L||i<=v.maxTrailedBodies),[H,oe]=T.useState(!1);T.useEffect(()=>{if(!E){oe(!1);return}const B=setTimeout(()=>{oe(!0)},600);return()=>clearTimeout(B)},[E]);const K=_.useMemo(()=>{if(!e.hasAccretionDisk||!e.accretionDiskConfig||p.kind!=="tidal-disruption"||p.primaryBodyId!==e.id||b<=0)return e.accretionDiskConfig;const B=e.accretionDiskConfig.particleCount??2400,Q=Math.max(B,4200);return{...e.accretionDiskConfig,outerRadius:e.accretionDiskConfig.outerRadius+(20-e.accretionDiskConfig.outerRadius)*b,rotationSpeed:e.accretionDiskConfig.rotationSpeed+(2.75-e.accretionDiskConfig.rotationSpeed)*b,particleCount:Math.round((B+(Q-B)*b)/200)*200}},[e.accretionDiskConfig,e.hasAccretionDisk,e.id,b,p.kind,p.primaryBodyId]),J=B=>{W||(B.stopPropagation(),c(e.id))},re=s&&!!e.texturePath;return o.jsxs(o.Fragment,{children:[o.jsxs("group",{ref:h,position:D,onClick:J,children:[o.jsxs("group",{rotation:[0,0,I],children:[o.jsx("group",{ref:u,children:re?o.jsx(wt,{ref:m,args:[e.radius,32,32],children:o.jsx(T.Suspense,{fallback:o.jsx("meshStandardMaterial",{color:e.color}),children:o.jsx(As,{body:e})})}):e.isStar||e.isCompactObject?o.jsx(wt,{ref:m,args:[e.radius,32,32],children:o.jsx("meshStandardMaterial",{color:e.color,emissive:e.color,emissiveIntensity:2})}):o.jsx(Is,{radius:e.radius,color:e.color,type:A,rotationSpeed:e.rotationSpeed})}),t&&!N&&o.jsx(ft,{points:[[0,-e.radius*1.5,0],[0,e.radius*1.5,0]],color:"white",lineWidth:1,opacity:.5,transparent:!0,dashed:!0,dashScale:2,gapSize:1})]}),Y&&o.jsx($o,{position:[0,e.radius+1.5,0],center:!0,zIndexRange:[1e3,0],style:{color:"white",fontSize:"14px",fontFamily:"system-ui, sans-serif",textShadow:"0 0 4px black, 0 0 2px black",whiteSpace:"nowrap",pointerEvents:"none",userSelect:"none"},children:e.name})]}),E&&H&&o.jsx(Ts,{position:D,color:e.color}),e.hasAccretionDisk&&K&&o.jsx(_s,{position:x,innerRadius:e.radius*K.innerRadius,outerRadius:e.radius*K.outerRadius,rotationSpeed:K.rotationSpeed,particleCount:K.particleCount,tilt:K.tilt}),e.hasJets&&o.jsx(ks,{position:x,length:e.radius*15,baseWidth:e.radius*2,speed:1.5})]})},Ns=()=>{const e=S(t=>t.updateBodies),s=S(t=>t.simulationState);G(()=>{s==="running"&&e()})},Us=1200,Fs=1,Ls=10,Os=e=>e>=10?50:e>=5?80:e>=2?100:e>=1?150:200,Gs=({points:e,color:s})=>{const t=_.useMemo(()=>{if(e.length<4)return e;try{return new sr(e,!1,"catmullrom",.5).getPoints(Math.min(e.length*3,360))}catch{return e}},[e]);return t.length<2?null:o.jsx(ft,{points:t,color:s,lineWidth:1.5,opacity:.4,transparent:!0})},Ws=()=>{const e=S(c=>c.bodies.length),s=S(c=>c.simulationState),t=S(c=>c.timeScale),n=S(c=>c.useRealisticDistances),[r,i]=T.useState([]),l=T.useRef(null),a=T.useRef(!1);return T.useEffect(()=>{i([])},[n]),T.useEffect(()=>{if(typeof window>"u")return;try{l.current=new Worker(new URL("/orbit_simulator/assets/predictionWorker--Ei3DlKx.js",import.meta.url),{type:"module"})}catch{console.warn("Prediction worker not available, using main thread fallback"),l.current=null;return}const c=f=>{if(f.data.type==="result"){a.current=!1;const p=f.data.paths.map(g=>({id:g.id,points:g.points.map(h=>new P(h[0],h[1],h[2])),color:g.color}));i(p)}},d=l.current;if(d)return d.addEventListener("message",c),()=>{a.current=!1,d.removeEventListener("message",c),d.terminate(),l.current===d&&(l.current=null)}},[]),T.useEffect(()=>{if(s==="paused")return;const c=Os(t),d=setInterval(()=>{const f=S.getState(),p=f.bodies;if(p.length===0)return;const g=l.current,h=Mo(f.timeScale,f.useRealisticDistances)*Fs;if(g&&!a.current){a.current=!0;const u=p.map(m=>({id:m.id,position:{x:m.position.x,y:m.position.y,z:m.position.z},velocity:{x:m.velocity.x,y:m.velocity.y,z:m.velocity.z},mass:m.mass,radius:m.radius,color:m.color}));g.postMessage({type:"predict",bodies:u,steps:Us,dt:h,saveFrequency:Ls})}},c);return()=>{clearInterval(d),a.current=!1}},[s,t,e]),o.jsx("group",{children:r.map(c=>o.jsx(Gs,{points:c.points,color:c.color},c.id))})},Vs=()=>{const e=S(a=>a.simulationTime),s=S(a=>a.zenMode),t=S(a=>a.useRealisticDistances);let r=e*94.88;t&&(r/=8);const i=Math.floor(r/365.25),l=Math.floor(r%365.25);return s?null:o.jsxs("div",{className:"date-display",style:{position:"absolute",bottom:"160px",left:"20px",width:"200px",pointerEvents:"none",zIndex:900,display:"flex",flexDirection:"column",gap:"2px"},children:[o.jsx("div",{className:"mission-time-label",style:{color:"rgba(255, 255, 255, 0.6)",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"4px",fontFamily:"Inter, sans-serif"},children:"MISSION TIME"}),o.jsxs("div",{className:"mission-time-value",style:{color:"#fff",fontSize:"1.5rem",fontFamily:"Inter, sans-serif",fontWeight:300,fontVariantNumeric:"tabular-nums"},children:[l," ",o.jsx("span",{style:{fontSize:"0.9rem",color:"rgba(255,255,255,0.5)"},children:"DAYS"})]}),o.jsxs("div",{className:"mission-time-years",style:{color:"rgba(255, 255, 255, 0.5)",fontSize:"0.9rem",fontFamily:"Inter, sans-serif"},children:["(",i," YEARS)"]})]})},_e=100,Ot=300,Gt=5,Hs=[[51,26367],[26367,65382],[65382,16776960],[16776960,16724736]],qs=()=>{const e=S(g=>g.bodies),s=S(g=>g.showGravityField),t=S(g=>g.useRealisticDistances),n=_.useRef(null),r=_.useRef(0),i=(_e+1)*(_e+1),l=_.useRef(new Float32Array(i)),a=_.useMemo(()=>Hs.map(([g,h])=>[new U(g),new U(h)]),[]),c=_.useMemo(()=>new U,[]),d=t?Ot*4:Ot,f=e.length>24?Gt*2:Gt,p=_.useMemo(()=>{const g=new ht(d*2,d*2,_e,_e);g.rotateX(-Math.PI/2);const h=new Float32Array((_e+1)*(_e+1)*3);return g.setAttribute("color",new $(h,3)),g},[d]);return G(()=>{if(!s||!n.current||(r.current++,r.current%f!==0))return;const g=n.current.geometry,h=g.attributes.position.array,u=g.attributes.color.array,m=l.current;let v=1/0,w=-1/0;for(let z=0;z<i;z++){const b=z*3,R=h[b],j=h[b+2];let C=0;for(const x of e){const D=R-x.position.x,I=j-x.position.z,A=Math.sqrt(D*D+I*I)+.5;C+=x.mass/A}m[z]=C,C<v&&(v=C),C>w&&(w=C)}const y=Math.log(v+1),k=Math.log(w+1)-y||1;for(let z=0;z<i;z++){const R=(Math.log(m[z]+1)-y)/k,j=Math.min(Math.max(R,0),1),C=Math.min(Math.floor(j*a.length),a.length-1),x=C/a.length,D=(j-x)*a.length;c.lerpColors(a[C][0],a[C][1],D),u[z*3]=c.r,u[z*3+1]=c.g,u[z*3+2]=c.b}g.attributes.color.needsUpdate=!0},-1),s?o.jsx("mesh",{ref:n,geometry:p,position:[0,-2,0],children:o.jsx("meshBasicMaterial",{vertexColors:!0,transparent:!0,opacity:.3,side:me,depthWrite:!1})}):null},To=e=>{const s=e/ze.SOLAR_MASS;return Math.pow(Math.max(s,.001),ze.MASS_LUMINOSITY_EXPONENT)},$s=(e,s)=>{const t=To(e.mass),n=Math.sqrt(t);return{inner:n*ze.HZ_INNER_AU*s,outer:n*ze.HZ_OUTER_AU*s}},Zs=(e,s,t)=>{let n=0;for(const r of t){const i=e-r.position.x,l=s-r.position.z,a=i*i+l*l+.01,c=To(r.mass);n+=c/a}return n},Ys=(e,s=1)=>{const t=e/s,n=1/ze.HZ_INNER_AU**2,r=1/ze.HZ_OUTER_AU**2;return t>n?2:t<r?0:1},Ce=100,Ks=5,Ee={COLD:new U(17578),HABITABLE:new U(2271812),HOT:new U(11149858),TRANSPARENT:new U(0)},Xs=()=>{const e=S(d=>d.bodies),s=S(d=>d.showHabitableZone),t=S(d=>d.useRealisticDistances),n=_.useRef(null),r=_.useRef(0),i=_.useMemo(()=>e.filter(d=>d.isStar),[e]),l=i.length>1,a=_.useMemo(()=>{if(i.length===0)return 1e3;const d=Math.max(...i.map(p=>Math.sqrt(p.position.x**2+p.position.z**2))),f=Math.max(d*3,100);return t?f*4:f},[i,t]),c=_.useMemo(()=>{const d=new ht(a*2,a*2,Ce,Ce);d.rotateX(-Math.PI/2);const f=new Float32Array((Ce+1)*(Ce+1)*3),p=new Float32Array((Ce+1)*(Ce+1));return d.setAttribute("color",new $(f,3)),d.setAttribute("alpha",new $(p,1)),d},[a]);return G(()=>{if(!s||!n.current||i.length<2||(r.current++,r.current%Ks!==0))return;const d=n.current.geometry,f=d.attributes.position.array,p=d.attributes.color.array,g=t?be.REALISTIC.AU_UNIT:be.COMPRESSED.AU_UNIT,h=1/(g*g);for(let u=0;u<f.length;u+=3){const m=f[u],v=f[u+2],w=u/3,y=Zs(m,v,i),M=Ys(y,h);let k;switch(M){case 0:k=Ee.COLD;break;case 1:k=Ee.HABITABLE;break;case 2:k=Ee.HOT;break;default:k=Ee.COLD}p[w*3]=k.r,p[w*3+1]=k.g,p[w*3+2]=k.b}d.attributes.color.needsUpdate=!0}),!s||!l?null:o.jsx("mesh",{ref:n,geometry:c,position:[0,-1.5,0],children:o.jsx("meshBasicMaterial",{vertexColors:!0,transparent:!0,opacity:.3,side:me,depthWrite:!1})})},Wt={vertexShader:`
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
    `},Eo=({position:e,startTime:s,duration:t,maxRadius:n,color:r,asymmetry:i=0,directionBias:l={x:0,y:1,z:0},onComplete:a})=>{const c=_.useRef(null),d=_.useRef(null),f=_.useRef(!1),p=_.useMemo(()=>({progress:{value:0},opacity:{value:1},color:{value:new U(r)},ringWidth:{value:.15},asymmetry:{value:i},directionBias:{value:new P(l.x,l.y,l.z)},centerPosition:{value:new P(e.x,e.y,e.z)}}),[r,i,l,e]);return G(()=>{if(!d.current||f.current)return;const g=performance.now()-s,h=Math.min(g/t,1);if(h>=1&&!f.current){f.current=!0,a?.();return}const u=1-Math.pow(1-h,2);d.current.uniforms.progress.value=u;const m=.6;if(h>m){const v=(h-m)/(1-m);d.current.uniforms.opacity.value=1-v}if(d.current.uniforms.ringWidth.value=.2*(1-h*.5),c.current){const v=n*u*2;c.current.scale.set(v,v,1)}}),o.jsxs("mesh",{ref:c,position:[e.x,e.y+.1,e.z],rotation:[-Math.PI/2,0,0],children:[o.jsx("planeGeometry",{args:[1,1,1,1]}),o.jsx("shaderMaterial",{ref:d,uniforms:p,vertexShader:Wt.vertexShader,fragmentShader:Wt.fragmentShader,transparent:!0,depthWrite:!1,blending:Z,side:me})]})},Vt={vertexShader:`
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
    `},Js=({position:e,radius:s,startTime:t,duration:n,intensity:r=1,onComplete:i})=>{const l=_.useRef(null),a=_.useRef(null),c=_.useRef(!1),d=_.useMemo(()=>({time:{value:0},progress:{value:0},intensity:{value:r},hotColor:{value:new U("#ff4400")},coolColor:{value:new U("#440000")}}),[r]);return G(({clock:f})=>{if(!a.current||c.current)return;const p=performance.now()-t,g=p>0?p:0,h=Math.min(g/n,1);if(h>=1&&!c.current){c.current=!0,i?.();return}if(a.current.uniforms.time.value=f.elapsedTime,a.current.uniforms.progress.value=h,l.current){const u=1+.1*Math.sin(f.elapsedTime*3)*(1-h),m=s*1.15*(1+(1-h)*.1);l.current.scale.setScalar(m*u),l.current.position.set(e.x,e.y,e.z)}}),o.jsxs("mesh",{ref:l,position:[e.x,e.y,e.z],children:[o.jsx("sphereGeometry",{args:[1,32,32]}),o.jsx("shaderMaterial",{ref:a,uniforms:d,vertexShader:Vt.vertexShader,fragmentShader:Vt.fragmentShader,transparent:!0,depthWrite:!1,blending:Z,side:ro})]})},Me=e=>{const s=Math.sin(e*12.9898)*43758.5453;return s-Math.floor(s)},Ht={vertexShader:`
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
    `},Qs=({position:e,startTime:s,duration:t,size:n,color:r,particleCount:i,onComplete:l})=>{const a=_.useRef(null),c=_.useRef(null),d=_.useRef(null),f=_.useRef(!1),p=_.useMemo(()=>{const h=new qe,u=new Float32Array(i*3),m=new Float32Array(i*3),v=new Float32Array(i),w=new Float32Array(i),y=[],M=[],k=[],z=new U(r),b=new U("#fff3d6"),R=n*.17+i*.013+e.x*.11+e.y*.07+e.z*.05;for(let j=0;j<i;j++){u[j*3]=e.x,u[j*3+1]=e.y,u[j*3+2]=e.z;const C=Me(R+j*1.17)*Math.PI*2,x=Math.acos(2*Me(R+j*2.31)-1),D=n*(.5+Me(R+j*3.07)*1.9);y.push(new P(Math.sin(x)*Math.cos(C)*D,Math.sin(x)*Math.sin(C)*D,Math.cos(x)*D));const I=z.clone().lerp(b,Me(R+j*4.41)*.55);M.push(I),m[j*3]=I.r,m[j*3+1]=I.g,m[j*3+2]=I.b;const A=n*(.18+Me(R+j*5.63)*.3);v[j]=A,k.push(A),w[j]=.4+Me(R+j*6.91)*.6}return h.setAttribute("position",new $(u,3)),h.setAttribute("color",new $(m,3)),h.setAttribute("size",new $(v,1)),h.setAttribute("alphaSeed",new $(w,1)),h.userData.velocities=y,h.userData.baseColors=M,h.userData.initialSizes=k,h},[r,i,e.x,e.y,e.z,n]),g=_.useMemo(()=>({opacity:{value:1}}),[]);return G(()=>{if(f.current)return;const h=performance.now()-s,u=Math.min(h/t,1);if(u>=1){f.current=!0,l?.();return}if(c.current){const m=Math.min(u/.32,1),v=n*(1.6+m*2.2);c.current.scale.setScalar(v);const w=c.current.material;w.opacity=(1-m)*.95}if(a.current&&d.current){const m=a.current.geometry,v=m.attributes.position.array,w=m.attributes.size.array,y=m.attributes.color.array,M=m.userData.velocities,k=m.userData.baseColors,z=m.userData.initialSizes;if(!v||!w||!y||!M||!k||!z)return;const b=bt.FRAME_TIME,R=.985,j=-.02*n,C=Math.pow(1-u,1.15);for(let x=0;x<i;x++){v[x*3]+=M[x].x*b,v[x*3+1]+=M[x].y*b+j*b,v[x*3+2]+=M[x].z*b,M[x].multiplyScalar(R),w[x]=Math.max(z[x]*(1-u*.7),n*.03);const D=k[x];y[x*3]=D.r*(.7+C*.5),y[x*3+1]=D.g*(.6+C*.55),y[x*3+2]=D.b*(.55+C*.45)}d.current.uniforms.opacity.value=C,m.attributes.position.needsUpdate=!0,m.attributes.size.needsUpdate=!0,m.attributes.color.needsUpdate=!0}}),o.jsxs("group",{children:[o.jsxs("mesh",{ref:c,position:[e.x,e.y,e.z],children:[o.jsx("sphereGeometry",{args:[1,16,16]}),o.jsx("meshBasicMaterial",{color:"#ffffff",transparent:!0,opacity:1,depthWrite:!1,blending:Z})]}),o.jsx("points",{ref:a,geometry:p,children:o.jsx("shaderMaterial",{ref:d,uniforms:g,vertexShader:Ht.vertexShader,fragmentShader:Ht.fragmentShader,transparent:!0,vertexColors:!0,depthWrite:!1,blending:Z})})]})},ke=bt.MAX_DEBRIS_PARTICLES,ei=()=>{const e=O(p=>p.debrisClouds),s=O(p=>p.removeExpiredDebris),t=_.useRef(null),n=_.useRef(0),r=_.useMemo(()=>new so,[]),i=_.useMemo(()=>new U,[]),l=_.useMemo(()=>new U,[]),a=_.useMemo(()=>new U,[]),c=_.useMemo(()=>{const p=new ir(1,0),g=p.attributes.position;for(let h=0;h<g.count;h++){const u=g.getX(h),m=g.getY(h),v=g.getZ(h),w=.7+Math.random()*.6;g.setXYZ(h,u*w,m*w,v*w)}return p.computeVertexNormals(),p},[]),d=_.useMemo(()=>new nr({roughness:.6,metalness:.3,flatShading:!0,emissive:new U("#ff6600"),emissiveIntensity:0,transparent:!0,opacity:1}),[]),f=_.useMemo(()=>e.flatMap(p=>p.particles).slice(0,ke),[e]);return G((p,g)=>{if(!t.current)return;const h=performance.now();h-n.current>2e3&&(s(),n.current=h);const u=O.getState().debrisClouds;let m=0;for(const v of u){for(const w of v.particles){if(m>=ke)break;const y=(h-w.createdAt)/w.lifetime;if(y>=1)continue;w.position.x+=w.velocity.x*g,w.position.y+=w.velocity.y*g,w.position.z+=w.velocity.z*g,w.velocity.x*=.998,w.velocity.y*=.998,w.velocity.z*=.998,w.rotation.x+=w.rotationSpeed.x*g,w.rotation.y+=w.rotationSpeed.y*g,w.rotation.z+=w.rotationSpeed.z*g,r.position.set(w.position.x,w.position.y,w.position.z),r.rotation.set(w.rotation.x,w.rotation.y,w.rotation.z);const M=y<.3?1+Math.sin(y*30)*.1:1,k=w.size*(1-y*.3)*M;r.scale.setScalar(Math.max(k,.01)),r.updateMatrix(),t.current.setMatrixAt(m,r.matrix),i.set(w.color);const z=Math.pow(1-y,2)*3;l.setHSL(.05+y*.15,1-y*.3,.5+z*.2),a.copy(i).lerp(l,Math.min(z*.3,1));const b=y<.8?1:Math.pow((1-y)/.2,2);a.multiplyScalar(b),t.current.setColorAt(m,a),m++}if(m>=ke)break}for(let v=m;v<ke;v++)r.scale.setScalar(0),r.updateMatrix(),t.current.setMatrixAt(v,r.matrix);t.current.instanceMatrix.needsUpdate=!0,t.current.instanceColor&&(t.current.instanceColor.needsUpdate=!0),t.current.count=m}),_.useEffect(()=>{if(t.current&&!t.current.instanceColor){const p=new Float32Array(ke*3);t.current.instanceColor=new nt(p,3)}},[]),f.length===0?null:o.jsx("instancedMesh",{ref:t,args:[c,d,ke],frustumCulled:!1})},qt={vertexShader:`
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
    `},ti=({position:e,startTime:s,duration:t,delayMs:n,maxRadius:r,color:i,biasDirection:l,thickness:a,opacity:c})=>{const d=_.useRef(null),f=_.useRef(null),p=_.useMemo(()=>({progress:{value:0},color:{value:new U(i)},opacity:{value:0},thickness:{value:a},asymmetry:{value:.18},biasDirection:{value:new P(l.x,l.y,l.z)}}),[l.x,l.y,l.z,i,a]);return G(()=>{if(!d.current||!f.current)return;const g=performance.now()-s-n;if(g<=0){d.current.visible=!1;return}const h=Math.max(1200,t-n),u=Math.min(g/h,1),m=1-Math.pow(1-u,2.2),v=c*Math.pow(1-u,1.2);d.current.visible=v>.01,d.current.scale.setScalar(Math.max(1,r*m)),f.current.uniforms.progress.value=m,f.current.uniforms.opacity.value=v}),o.jsxs("mesh",{ref:d,position:[e.x,e.y,e.z],visible:!1,children:[o.jsx("sphereGeometry",{args:[1,32,32]}),o.jsx("shaderMaterial",{ref:f,uniforms:p,vertexShader:qt.vertexShader,fragmentShader:qt.fragmentShader,transparent:!0,depthWrite:!1,blending:Z,side:gt})]})},$t={vertexShader:`
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
    `},Zt={vertexShader:`
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
    `},Yt=["#dbe8ff","#ffffff","#ffbe8b","#ff874f"],oi=({position:e,startTime:s,duration:t,maxRadius:n,color:r,intensity:i,coreRadius:l,haloRadius:a,shellCount:c,biasDirection:d,onComplete:f})=>{const p=_.useRef(null),g=_.useRef(null),h=_.useRef(null),u=_.useRef(null),m=_.useRef(null),v=_.useRef(!1),w=_.useMemo(()=>({progress:{value:0},intensity:{value:i},baseColor:{value:new U(r)},opacity:{value:1}}),[r,i]),y=_.useMemo(()=>({progress:{value:0},opacity:{value:.7},color:{value:new U(r)}}),[r]);return G(()=>{if(v.current)return;const M=performance.now()-s,k=Math.min(M/t,1);if(k>=1){v.current=!0,f?.();return}const z=k<.16?1-k*.7:.88,b=k<.35?1:1+(k-.35)*1.9,R=k>.72?1-(k-.72)/.28:1;if(p.current&&h.current){const j=l*z*b;p.current.scale.setScalar(Math.max(.001,j)),h.current.uniforms.progress.value=k,h.current.uniforms.opacity.value=R}if(g.current&&u.current){const j=1.15+Math.pow(k,.7)*4.2;g.current.scale.setScalar(a*j),u.current.uniforms.progress.value=k,u.current.uniforms.opacity.value=(.72+Math.sin(k*18)*.08)*R}if(m.current){const j=k<.35?i*(80+k*280):i*200*Math.pow(1-Math.max(0,k-.35)/.65,1.4);m.current.intensity=j}}),o.jsxs("group",{position:[e.x,e.y,e.z],children:[o.jsx("pointLight",{ref:m,color:r,intensity:0,distance:n*2.4,decay:1.8}),o.jsxs("mesh",{ref:g,children:[o.jsx("sphereGeometry",{args:[1,32,32]}),o.jsx("shaderMaterial",{ref:u,uniforms:y,vertexShader:Zt.vertexShader,fragmentShader:Zt.fragmentShader,transparent:!0,depthWrite:!1,blending:Z,side:gt})]}),o.jsxs("mesh",{ref:p,children:[o.jsx("sphereGeometry",{args:[1,24,24]}),o.jsx("shaderMaterial",{ref:h,uniforms:w,vertexShader:$t.vertexShader,fragmentShader:$t.fragmentShader,transparent:!0,depthWrite:!1,blending:Z,side:ro})]}),Array.from({length:c}).map((M,k)=>o.jsx(ti,{position:e,startTime:s,duration:t,delayMs:2400+k*950,maxRadius:n*(.45+k*.28),color:Yt[k%Yt.length],biasDirection:d,thickness:.28-k*.04,opacity:.45-k*.07},k))]})},Kt={vertexShader:`
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
    `},ri=({position:e,startTime:s,duration:t,rayCount:n,maxLength:r,color:i,spread:l,pulseSpeed:a,onComplete:c})=>{const d=_.useRef(null),f=_.useRef(null),p=_.useRef(!1),g=_.useRef(new so),h=_.useRef(new P),u=_.useMemo(()=>new ht(1,1),[]),m=_.useMemo(()=>new De({uniforms:{opacity:{value:1},pulseTime:{value:0},color:{value:new U(i)}},vertexShader:Kt.vertexShader,fragmentShader:Kt.fragmentShader,transparent:!0,depthWrite:!1,blending:Z,side:me}),[i]);return T.useEffect(()=>{if(!f.current)return;const v=new Float32Array(n),w=new Float32Array(n);for(let y=0;y<n;y++)v[y]=Math.random(),w[y]=0;f.current.geometry.setAttribute("instanceSeed",new nt(v,1)),f.current.geometry.setAttribute("instanceProgress",new nt(w,1))},[n]),G(()=>{if(!f.current||p.current)return;const v=performance.now()-s,w=Math.min(v/t,1);if(w>=1){p.current=!0,c?.();return}const y=f.current,M=y.geometry.getAttribute("instanceProgress"),k=y.geometry.getAttribute("instanceSeed"),z=g.current,b=y.material;for(let R=0;R<n;R++){const j=k.getX(R),C=j*.18,x=Math.max(0,Math.min(1,(w-C)/(1-C))),D=1-Math.pow(1-x,2.5),I=R/n*Math.PI*2+j*l,A=r*(.5+j*.75)*D,W=r*(.025+j*.04*l),N=(w*.35+j)*.18;z.position.set(0,0,0),z.rotation.set(0,0,I+N),h.current.set(W,A,1),z.scale.copy(h.current),z.position.x=Math.cos(I)*A*.1,z.position.y=Math.sin(I)*A*.1,z.updateMatrix(),y.setMatrixAt(R,z.matrix),M.setX(R,D)}M.needsUpdate=!0,y.instanceMatrix.needsUpdate=!0,b.uniforms.opacity.value=w>.72?1-(w-.72)/.28:1,b.uniforms.pulseTime.value=w*a*Math.PI*2,d.current&&(d.current.rotation.z+=.0018)}),o.jsx("group",{ref:d,position:[e.x,e.y,e.z],children:o.jsx("instancedMesh",{ref:f,args:[u,m,n],frustumCulled:!1})})},si=({startTime:e,duration:s,intensity:t,falloff:n="exponential",onComplete:r})=>{const{camera:i}=Se(),l=_.useRef(!1),a=_.useRef(new P),c=_.useRef(e*.013);return _.useEffect(()=>{const d=a;return()=>{i.position.sub(d.current),d.current.set(0,0,0)}},[i]),G((d,f)=>{if(l.current)return;const p=performance.now()-e,g=Math.min(p/s,1);if(i.position.sub(a.current),g>=1){l.current=!0,a.current.set(0,0,0),r?.();return}c.current+=f*8;const h=n==="exponential"?t*Math.pow(1-g,2.8):t*(1-g),u=a.current;u.set(Math.sin(c.current*1.7)*h*.5+Math.cos(c.current*3.1)*h*.2,Math.cos(c.current*2.3)*h*.45+Math.sin(c.current*4.7)*h*.15,Math.sin(c.current*2.9)*h*.35),i.position.add(u)}),null},Ne={vertexShader:`
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
    `},ii=({position:e,startTime:s,duration:t,length:n,axis:r,width:i,coreIntensity:l,onComplete:a})=>{const c=_.useRef(null),d=_.useRef(null),f=_.useRef(!1),p=_.useMemo(()=>({progress:{value:0},opacity:{value:1},coreIntensity:{value:l}}),[l]),g=_.useMemo(()=>{const h=new P(r.x,r.y,r.z).normalize();return new io().setFromUnitVectors(new P(0,1,0),h)},[r.x,r.y,r.z]);return G(()=>{if(f.current)return;const h=performance.now()-s,u=Math.min(h/t,1);if(u>=1){f.current=!0,a?.();return}const m=u<.45?u/.45:1,v=u>.72?1-(u-.72)/.28:1;[c.current,d.current].forEach(w=>{if(!w)return;const y=w.material;y.uniforms.progress.value=m,y.uniforms.opacity.value=v})}),o.jsxs("group",{position:[e.x,e.y,e.z],quaternion:g,children:[o.jsxs("mesh",{ref:c,position:[0,n/2,0],children:[o.jsx("planeGeometry",{args:[i,n]}),o.jsx("shaderMaterial",{uniforms:p,vertexShader:Ne.vertexShader,fragmentShader:Ne.fragmentShader,transparent:!0,depthWrite:!1,blending:Z,side:me})]}),o.jsxs("mesh",{ref:d,position:[0,-n/2,0],rotation:[0,0,Math.PI],children:[o.jsx("planeGeometry",{args:[i,n]}),o.jsx("shaderMaterial",{uniforms:p,vertexShader:Ne.vertexShader,fragmentShader:Ne.fragmentShader,transparent:!0,depthWrite:!1,blending:Z,side:me})]})]})},ni=()=>{const e=O(m=>m.shockwaves),s=O(m=>m.heatGlows),t=O(m=>m.explosions),n=O(m=>m.supernovas),r=O(m=>m.radialRays),i=O(m=>m.cameraShakes),l=O(m=>m.gammaRayBursts),a=O(m=>m.removeShockwave),c=O(m=>m.removeHeatGlow),d=O(m=>m.removeExplosion),f=O(m=>m.removeSupernova),p=O(m=>m.removeRadialRays),g=O(m=>m.removeCameraShake),h=O(m=>m.removeGammaRayBurst),u=O(m=>m.removeExpiredEffects);return G(()=>{}),_.useEffect(()=>{const m=setInterval(()=>{u()},2e3);return()=>clearInterval(m)},[u]),o.jsxs("group",{name:"effects-layer",children:[e.map(m=>o.jsx(Eo,{position:m.position,startTime:m.startTime,duration:m.duration,maxRadius:m.maxRadius,color:m.color,asymmetry:m.asymmetry,directionBias:m.directionBias,onComplete:()=>a(m.id)},m.id)),s.map(m=>o.jsx(Js,{position:m.position,radius:m.radius,startTime:m.startTime,duration:m.duration,intensity:m.intensity,onComplete:()=>c(m.id)},m.id)),t.map(m=>o.jsx(Qs,{position:m.position,startTime:m.startTime,duration:m.duration,size:m.size,color:m.color,particleCount:m.particleCount,onComplete:()=>d(m.id)},m.id)),n.map(m=>o.jsx(oi,{position:m.position,startTime:m.startTime,duration:m.duration,maxRadius:m.maxRadius,color:m.color,intensity:m.intensity,coreRadius:m.coreRadius,haloRadius:m.haloRadius,shellCount:m.shellCount,biasDirection:m.biasDirection,onComplete:()=>f(m.id)},m.id)),r.map(m=>o.jsx(ri,{position:m.position,startTime:m.startTime,duration:m.duration,rayCount:m.rayCount,maxLength:m.maxLength,color:m.color,spread:m.spread,pulseSpeed:m.pulseSpeed,onComplete:()=>p(m.id)},m.id)),i.map(m=>o.jsx(si,{startTime:m.startTime,duration:m.duration,intensity:m.intensity,falloff:m.falloff,onComplete:()=>g(m.id)},m.id)),l.map(m=>o.jsx(ii,{position:m.position,startTime:m.startTime,duration:m.duration,length:m.length,axis:m.axis,width:m.width,coreIntensity:m.coreIntensity,onComplete:()=>h(m.id)},m.id)),o.jsx(ei,{})]})},ai=new Ge(.5,.5),li=(e,s,t,n)=>{const r=e.position.distanceTo(s),i=n.width,l=n.height;if(t<=0||i<=0||l<=0)return{screenUV:ai.clone(),screenRadius:0,distance:r,visible:!1};const a=s.clone().project(e),c=new Ge((a.x+1)/2,(a.y+1)/2);if(!(a.z>=-1&&a.z<=1&&c.x>=0&&c.x<=1&&c.y>=0&&c.y<=1))return{screenUV:c,screenRadius:0,distance:r,visible:!1};const f=new P(1,0,0).applyQuaternion(e.quaternion).normalize(),g=s.clone().add(f.multiplyScalar(t)).project(e),h=new Ge((g.x+1)/2,(g.y+1)/2),u=i/l,m=Math.min(.3,Math.hypot((h.x-c.x)*u,h.y-c.y));return{screenUV:c,screenRadius:Number.isFinite(m)?m:0,distance:r,visible:Number.isFinite(m)&&m>0}},ci=`
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
`;class di extends Yo{constructor({blackHoleScreen:s=new Ge(.5,.5),lensStrength:t=1,schwarzschildRadius:n=.05,aspectRatio:r=1,cameraNear:i=.1,cameraFar:l=1e3,blackHoleDistance:a=1e3}={}){super("GravitationalLensEffect",ci,{attributes:Ko.DEPTH,uniforms:new Map([["blackHoleScreen",new xe(s)],["lensStrength",new xe(t)],["schwarzschildRadius",new xe(n)],["aspectRatio",new xe(r)],["cameraNear",new xe(i)],["cameraFar",new xe(l)],["blackHoleDistance",new xe(a)]])})}update(s,t,n){}}const No=_.forwardRef(({blackHolePosition:e,schwarzschildRadius:s,strength:t=1,camera:n,enabled:r=!0,viewportSize:i},l)=>{const a=n,c=a.near??.1,d=a.far??1e3,f=_.useMemo(()=>new di({lensStrength:t,cameraNear:c,cameraFar:d}),[t,c,d]);return G(()=>{if(!n)return;const p=f.uniforms.get("lensStrength"),g=f.uniforms.get("schwarzschildRadius");p.value=r?t:0;const h=n;if(h.near!==void 0&&(f.uniforms.get("cameraNear").value=h.near),h.far!==void 0&&(f.uniforms.get("cameraFar").value=h.far),!r||!(n instanceof ar)){p.value=0,g.value=0;return}n.updateMatrixWorld(),n.updateProjectionMatrix();const u=li(n,e,s,i);f.uniforms.get("blackHoleScreen").value=u.screenUV,g.value=u.visible?u.screenRadius:0,f.uniforms.get("aspectRatio").value=i.width/i.height,f.uniforms.get("blackHoleDistance").value=u.distance,p.value=u.visible?t:0}),_.useImperativeHandle(l,()=>f,[f]),o.jsx("primitive",{object:f})});No.displayName="GravitationalLensEffect";const ui=`
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
`,pi=`
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
        vec3 finalColor = mix(vColor, vec3(1.0), core * 0.45);
        gl_FragColor = vec4(finalColor, alpha);
    }
`,mi=({position:e,primaryPosition:s,bodyRadius:t,bodyColor:n,primaryMass:r,startTime:i,duration:l=5e3,onComplete:a})=>{const c=_.useRef(null),d=_.useRef(null),f=_.useRef(null),p=_.useRef(null),g=_.useRef(!1),h=S(k=>k.qualityLevel),u=Math.min(bt.MAX_TIDAL_PARTICLES,fe(h).maxTidalParticles),m=_.useMemo(()=>new P,[]),v=_.useMemo(()=>new P,[]),w=_.useMemo(()=>new P(0,1,0),[]),{geometry:y,uniforms:M}=_.useMemo(()=>{const k=new qe,z=new Float32Array(u*3),b=new Float32Array(u*3),R=new Float32Array(u),j=new Float32Array(u),C=[],x=[],D=[],I=[],A=new Uint8Array(u),W=new P(e.x,e.y,e.z),N=new P(s.x,s.y,s.z),L=new U(n),Y=new U("#edf6ff"),E=new U("#ffd9c0"),H=new P().subVectors(N,W),oe=Math.max(H.length(),t*2);H.normalize();const K=new P().crossVectors(H,Math.abs(H.y)>.85?new P(1,0,0):w).normalize(),J=new P().crossVectors(H,K).normalize(),re=ye.G,B=Math.sqrt(2*re*r/oe),Q=Math.sqrt(re*r/oe),he=Math.min(3.2,Math.max(.35,2*re*r*t/Math.pow(oe,3))),de=Math.min(t*18,Math.max(t*5.5,B*he*.9)),V=Math.min(t*10,Math.max(t*2.2,Q*.42));for(let F=0;F<u;F++){const ne=Math.random()*Math.PI*2,ge=K.clone().multiplyScalar(Math.cos(ne)).add(J.clone().multiplyScalar(Math.sin(ne))).normalize(),Ae=new P().crossVectors(H,ge).normalize(),Te=(Math.random()-.5)*t*3.3,ve=t*(.16+Math.random()*.62),Oo=(Math.random()-.5)*t*.2,Go=H.clone().multiplyScalar(Te).add(ge.clone().multiplyScalar(ve)).add(J.clone().multiplyScalar(Oo)),Ye=W.clone().add(Go),Wo=Math.random()<.7,Vo=.72+Math.random()*.56;if(z[F*3]=Ye.x,z[F*3+1]=Ye.y,z[F*3+2]=Ye.z,Wo){const Re=H.clone().multiplyScalar(de*Vo),Ho=ge.clone().multiplyScalar(V*(.7+Math.random()*.55));C.push(Re.add(Ho)),x.push(Ae.clone().multiplyScalar(t*(.75+Math.random()*.45))),A[F]=1,D.push(L.clone().lerp(Y,.45+Math.random()*.3)),I.push(t*(.032+Math.random()*.028))}else{const Re=H.clone().multiplyScalar(-de*(.35+Math.random()*.28));Re.add(ge.clone().multiplyScalar(V*(.55+Math.random()*.35))),Re.add(J.clone().multiplyScalar(t*(.9+Math.random()*1.4))),C.push(Re),x.push(Ae.clone().multiplyScalar(t*(.18+Math.random()*.22))),A[F]=0,D.push(L.clone().lerp(E,.28+Math.random()*.24)),I.push(t*(.026+Math.random()*.024))}const Ke=D[F];b[F*3]=Ke.r,b[F*3+1]=Ke.g,b[F*3+2]=Ke.b,R[F]=I[F],j[F]=.4+Math.random()*.6}return k.setAttribute("position",new $(z,3)),k.setAttribute("color",new $(b,3)),k.setAttribute("size",new $(R,1)),k.setAttribute("alphaSeed",new $(j,1)),k.userData.velocities=C,k.userData.twistVectors=x,k.userData.baseColors=D,k.userData.baseSizes=I,k.userData.captureFlags=A,{geometry:k,uniforms:{opacity:{value:1}}}},[u,n,t,w,e.x,e.y,e.z,r,s.x,s.y,s.z]);return G((k,z)=>{if(!c.current||!p.current||g.current)return;const b=performance.now()-i,R=Math.min(b/l,1);if(R>=1){g.current=!0,a?.();return}const j=Math.min(z,.033),C=y.attributes.position.array,x=y.attributes.color.array,D=y.attributes.size.array,I=y.userData.velocities,A=y.userData.twistVectors,W=y.userData.baseColors,N=y.userData.baseSizes,L=y.userData.captureFlags,Y=R<=.35?1:Math.max(0,1-(R-.35)/.65*1.8);for(let E=0;E<u;E++){m.set(C[E*3],C[E*3+1],C[E*3+2]),v.subVectors(s,m);const H=Math.max(v.length(),t*.45);v.divideScalar(H),L[E]===1?(I[E].addScaledVector(v,t*8.5*j),I[E].addScaledVector(A[E],t*2.2*j*(1-R*.55)),A[E].applyAxisAngle(v,.45*j),I[E].multiplyScalar(.992)):(I[E].addScaledVector(v,-t*1.6*j),I[E].addScaledVector(A[E],t*.9*j),A[E].applyAxisAngle(v,-.12*j),I[E].multiplyScalar(.996)),C[E*3]+=I[E].x*j,C[E*3+1]+=I[E].y*j,C[E*3+2]+=I[E].z*j;const oe=L[E]===1?Math.max(.28,.92-R*.55):Math.max(.36,.95-R*.3);D[E]=Math.max(N[E]*oe,t*.012);const K=W[E],J=L[E]===1?.82+Y*.5:.72+(1-R)*.25;x[E*3]=Math.min(1,K.r*J),x[E*3+1]=Math.min(1,K.g*J),x[E*3+2]=Math.min(1,K.b*(J+.08))}if(p.current.uniforms.opacity.value=.92-R*.38,y.attributes.position.needsUpdate=!0,y.attributes.color.needsUpdate=!0,y.attributes.size.needsUpdate=!0,d.current){const E=t*(1.1+(1-R)*.55);d.current.scale.setScalar(E);const H=d.current.material;H.opacity=.55*Y}if(f.current){const E=t*(2.3+R*1.1);f.current.scale.setScalar(E);const H=f.current.material;H.opacity=.18*Math.max(0,Y*.75)}}),o.jsxs("group",{position:[e.x,e.y,e.z],children:[o.jsxs("mesh",{ref:f,children:[o.jsx("sphereGeometry",{args:[1,24,24]}),o.jsx("meshBasicMaterial",{color:"#9fd4ff",transparent:!0,opacity:.18,depthWrite:!1,blending:Z})]}),o.jsxs("mesh",{ref:d,children:[o.jsx("sphereGeometry",{args:[1,24,24]}),o.jsx("meshBasicMaterial",{color:"#eef8ff",transparent:!0,opacity:.55,depthWrite:!1,blending:Z})]}),o.jsx("points",{ref:c,geometry:y,children:o.jsx("shaderMaterial",{ref:p,uniforms:M,vertexShader:ui,fragmentShader:pi,transparent:!0,vertexColors:!0,depthWrite:!1,blending:Z})})]})},Xt={vertexShader:`
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
    `},fi=()=>{const e=_.useRef(null),s=_.useRef(null),t=S(i=>i.qualityLevel);G(({clock:i,camera:l})=>{e.current&&(e.current.uniforms.time.value=i.getElapsedTime()*.5),s.current&&s.current.position.copy(l.position)});const n=fe(t),r=_.useMemo(()=>{const i=Math.random()*100,l=Math.random(),a=new U().setHSL(l,.6,.02),c=new U().setHSL((l+.1)%1,.5,.15),d=new U().setHSL((l+.5)%1,.8,.2),f=new U().setHSL((l+.05)%1,1,.3);return{time:{value:0},seed:{value:i},fbmOctaves:{value:n.starfieldFBMOctaves},uColorDeep:{value:a},uColorMist:{value:c},uColorGlow:{value:d},uColorCore:{value:f}}},[n.starfieldFBMOctaves]);return o.jsxs("mesh",{ref:s,frustumCulled:!1,children:[o.jsx("sphereGeometry",{args:[n.starfieldRadius,n.starfieldSegments[0],n.starfieldSegments[1]]}),o.jsx("shaderMaterial",{ref:e,uniforms:r,vertexShader:Xt.vertexShader,fragmentShader:Xt.fragmentShader,side:gt,depthWrite:!1})]})};function te(e,s,t,n,r={}){const{duration:i=.8,ease:l="power2.inOut",onComplete:a,delay:c=0,dynamicTarget:d}=r,f={x:e.position.x,y:e.position.y,z:e.position.z},p={x:s.target.x,y:s.target.y,z:s.target.z},g=lr.timeline({delay:c,onComplete:a});return g.to(f,{x:t.x,y:t.y,z:t.z,duration:i,ease:l,onUpdate:()=>{e.position.set(f.x,f.y,f.z)}},0),g.to(p,{x:n.x,y:n.y,z:n.z,duration:i,ease:l,onUpdate:()=>{if(d){const h=d();s.target.copy(h)}else s.target.set(p.x,p.y,p.z);s.update()}},0),g}function hi(e,s,t=5){const n=new P(1,.8,1).normalize(),r=Math.max(s*t,10);return{position:e.clone().add(n.multiplyScalar(r)),lookAt:e.clone()}}function Ue(e,s,t,n,r={}){const{position:i,lookAt:l}=hi(t,n);return te(e,s,i,l,r)}function rt(e,s,t=new P(100,80,100),n=new P(0,0,0),r={}){return te(e,s,t,n,{duration:1,ease:"power3.out",...r})}function gi(e,s,t,n={}){const r=e.position.clone(),i=s.target.clone(),l=r.clone().sub(i),a=l.length()*t,c=i.clone().add(l.normalize().multiplyScalar(a));return te(e,s,c,i,{duration:.6,ease:"power2.out",...n})}const vi=({collisionPoint:e,currentCameraPosition:s,impactRadius:t,focusPosition:n})=>{const r=n?.clone()??e.clone(),i=s.clone().sub(e);i.lengthSq()<=1e-4&&i.set(1,.55,1),i.normalize();const l=Math.max(s.distanceTo(e),.001),a=Math.min(Math.max(Math.max(t,1)*9.5,14),70),c=Math.max(8,Math.min(l,a));return{cameraPosition:e.clone().add(i.multiplyScalar(c)),lookAt:r,distance:c}},xi={en:{app_title:"ORBIT SIMULATOR",app_subtitle:"Interactive N-Body Gravity System",controls_title:"CONTROLS",simulation_title:"SIMULATION",open_controls:"Open Controls",zen_mode:"Zen Mode",camera_mode:"Camera Mode",pause:"PAUSE",resume:"RESUME",reset:"Reset Simulation",load_solar:"Load Solar System",tab_controls:"Controls",tab_bodies:"Bodies",tab_inspector:"Inspector",preset_mode:"Preset",custom_mode:"Custom",create_body:"Create Body",search_placeholder:"Search bodies...",filter_all:"All",filter_star:"Star",filter_planet:"Planet",filter_black_hole:"Black Hole",duplicate:"Duplicate",no_bodies_found:"No bodies found",select_body_msg:"Select a body from the Bodies tab or click on an object in the view to inspect its properties.",show_prediction:"Show Orbit Prediction",show_grid:"Show Grid & Axes",show_realistic:"Show Realistic Textures",show_habitable:"Show Habitable Zone",show_gravitational_lens:"Show Gravitational Lens",show_hill_sphere:"Show Hill Sphere",show_gravity_field:"Show Gravity Field",show_lagrange_points:"Show Lagrange Points",show_realistic_distances:"Realistic Orbit Distances",camera_follow:"Camera Follow",free_camera:"Free Camera (None)",stop_following:"Stop Following",camera_mode_free:"Free Look",camera_mode_sun:"Fixed View (Orbit)",camera_mode_surface:"Fixed View (Surface)",new_body_title:"NEW CELESTIAL BODY",mass:"Mass",radius:"Radius",velocity:"Velocity",position:"Position",color:"Color",add_body:"Add Body",add_random:"Add Random Body",distance_sun:"Distance to Sun",orbital_speed:"Orbital Speed",rotation_speed:"Rotation Speed",tour_welcome:"Welcome to Orbit Simulator!",tour_intro:"Experience the beauty of N-Body physics and celestial mechanics. Let's take a quick tour!",tour_panel_title:"Control Panel",tour_panel_content:"Here you can control the simulation speed, toggle visual aids, and manage celestial bodies.",tour_sim_title:"Simulation Controls",tour_sim_content:"Pause, Resume, or Reset the entire simulation from here.",tour_cam_title:"Camera Focus",tour_cam_content:"Select a planet to follow it automatically.",tour_scene_title:"Interactive Scene",tour_scene_content:"Right-click to Pan. Left-click to Rotate. Scroll to Zoom. Click a planet to inspect.",bodies_list:"BODIES",remove:"Remove",name:"Name",cancel:"Cancel",create:"Create",help_title:"Help & Information",version:"Version",controls_header:"Controls",changelog_header:"Changelog",ctrl_pan:"Pan",ctrl_pan_desc:"Right Click + Drag",ctrl_rotate:"Rotate",ctrl_rotate_desc:"Left Click + Drag",ctrl_zoom:"Zoom",ctrl_zoom_desc:"Mouse Wheel",ctrl_select:"Select Body",ctrl_select_desc:"Click on planet",cl_surface_view:"Surface View Overhaul (FPS Style)",cl_orbit_view:"Renamed to Orbit Fixed View",cl_perf:"Performance Improvements",cl_v0_2_1_title:"v0.2.1 - Physics & View Update",cl_item_surface:"Surface View Refinement (Orbit Locked, Tangent View)",cl_item_perf:"Performance View (FPS, Physics Time, Energy)",cl_item_physics:"Physics Engine (Collision in GPU/Worker)",show_multithreading:"Multithreading (Experimental)",show_gpu:"GPU Acceleration (Beta)",show_performance:"Show Performance View",perf_stats:"Simulation Stats",perf_fps:"FPS",perf_mode:"Mode",perf_bodies:"Bodies",perf_physics:"Physics Time",perf_energy:"Total Energy",perf_error:"Error (Drift)",perf_kinetic:"Kinetic",perf_potential:"Potential",calculating:"Calculating...",cl_v0_3_0_title:"v0.3.0 - Energy & Hybrid Engine",cl_item_energy:"Energy Monitoring (Kinetic, Potential, Drift)",cl_item_hybrid:"Hybrid Engine (Optimized CPU/Worker/GPU switching)",cl_item_cleanup:"Resource Management (Reduced Memory Leaks)",cl_v0_4_0_title:"v0.4.0 - UI Polish & Zen Mode",cl_item_compact:"Compact Controls (Unified width, collapsed view)",cl_item_zen:"Zen Mode (Hide UI, Logo, Grid for immersion)",cl_item_ui:"UI Refinement (Cleaner layout, Consistent visual style)",cl_item_gallery:"Star System Gallery (Visual selector for presets)",star_system_gallery:"Star System Gallery",gallery_title:"Star System Gallery",gallery_select_mode:"Select Mode",gallery_close:"Close",stable_era:"Stable Era",chaotic_era:"Chaotic Era",time_scale:"Time Scale",habitable_zone_multi_star:"Multi-Star Habitable Zone",hz_cold:"Too Cold",hz_habitable:"Habitable",hz_hot:"Too Hot",delete_title:"Delete Body",delete_message:'Are you sure you want to delete "{name}"? This action cannot be undone.',delete_confirm:"Delete",delete_cancel:"Cancel",supernova_button:"Trigger Supernova",supernova_modal_title:"Trigger Supernova",supernova_modal_message:'Trigger a supernova explosion for "{name}"? The star will collapse into a {remnant}.',supernova_modal_confirm:"Trigger Supernova",supernova_modal_cancel:"Cancel",supernova_toast_triggered:"Supernova initiated for {name}.",supernova_overlay_kicker:"破局イベント",supernova_phase_intro:"Locking on to the supergiant",supernova_phase_countdown:"Core collapse imminent",supernova_phase_breakout:"Shock breakout",supernova_phase_ejecta:"Ejecta shell expansion",supernova_phase_remnant:"Remnant formation",supernova_phase_complete:"Sequence complete",supernova_remnant_black_hole:"A black hole remnant has formed.",supernova_remnant_neutron_star:"A neutron star remnant has formed.",supernova_remnant_none:"The progenitor star was completely disrupted.",supernova_action_replay:"Replay",supernova_action_inspect:"Inspect Remnant",supernova_action_free_camera:"Free Camera",supernova_remnant_label_black_hole:"black hole",supernova_remnant_label_neutron_star:"neutron star",scenario_overlay_kicker:"Catastrophic Event",scenario_metric_distance_ratio:"Limit Ratio",scenario_action_replay:"Replay",scenario_action_inspect:"Inspect Outcome",scenario_action_free_camera:"Free Camera",scenario_supernova_phase_intro:"Locking on to the supergiant",scenario_supernova_phase_countdown:"Core collapse imminent",scenario_supernova_phase_breakout:"Shock breakout",scenario_supernova_phase_ejecta:"Ejecta shell expansion",scenario_supernova_phase_remnant:"Remnant formation",scenario_supernova_phase_complete:"Sequence complete",scenario_supernova_outcome_black_hole:"A black hole remnant has formed.",scenario_supernova_outcome_neutron_star:"A neutron star remnant has formed.",scenario_supernova_outcome_none:"The progenitor star was completely disrupted.",scenario_tidal_phase_intro:"Locking on to the doomed star",scenario_tidal_phase_approach:"Tidal approach underway",scenario_tidal_phase_spaghettification:"Spaghettification underway",scenario_tidal_phase_breach:"Stellar core shearing apart",scenario_tidal_phase_capture:"Twin debris streams feeding the singularity",scenario_tidal_phase_aftermath:"Accretion flare flooding the disk",scenario_tidal_phase_complete:"Sequence complete",scenario_tidal_outcome_captured:"The black hole has captured the disrupted star.",scenario_tidal_outcome_none:"The debris plume is dispersing."},ja:{app_title:"ORBIT SIMULATOR",app_subtitle:"天体軌道シミュレーター",controls_title:"コントロールパネル",simulation_title:"シミュレーション",open_controls:"コントロールパネルを開く",zen_mode:"Zenモード",camera_mode:"カメラモード切替",pause:"一時停止",resume:"再開",reset:"リセット",load_solar:"太陽系に移動",tab_controls:"コントロール",tab_bodies:"天体一覧",tab_inspector:"詳細",preset_mode:"プリセット",custom_mode:"カスタム",create_body:"天体を作成",search_placeholder:"名前で検索...",filter_all:"全て",filter_star:"恒星",filter_planet:"惑星",filter_black_hole:"ブラックホール",duplicate:"複製",no_bodies_found:"天体が見つかりません",select_body_msg:"「天体一覧」タブから選択するか、画面上の天体をクリックして詳細を表示してください。",show_prediction:"軌道予測線を表示",show_grid:"グリッドを表示",show_realistic:"リアルなテクスチャを表示",show_habitable:"ハビタブルゾーンを表示",show_gravitational_lens:"重力レンズを表示",show_hill_sphere:"ヒル球を表示",show_gravity_field:"重力場を表示",show_lagrange_points:"ラグランジュ点を表示",show_realistic_distances:"軌道距離をリアル寄りにする",camera_follow:"カメラ追従",free_camera:"追従なし",stop_following:"追従を解除",camera_mode_free:"フリー視点",camera_mode_sun:"公転固定視点",camera_mode_surface:"地表視点",new_body_title:"新規天体作成",mass:"質量",radius:"半径",velocity:"速度",position:"位置",color:"色",add_body:"天体を追加",add_random:"ランダムな天体を追加",distance_sun:"太陽からの距離",orbital_speed:"公転速度",rotation_speed:"自転速度",tour_welcome:"Orbit Simulatorへようこそ！",tour_intro:"軌道シミュレーションと天体力学の美しさを体験してください。簡単なツアーにご案内します！",tour_panel_title:"コントロールパネル",tour_panel_content:"ここではシミュレーション速度の調整、グリッド表示の切り替え、天体の管理ができます。",tour_sim_title:"シミュレーション操作",tour_sim_content:"シミュレーションの一時停止、再開、リセットがここから行えます。",tour_cam_title:"カメラフォーカス",tour_cam_content:"惑星を選択すると、自動的にカメラが追従します。",tour_scene_title:"インタラクティブな操作",tour_scene_content:"右ドラッグで移動、左ドラッグで回転、ホイールでズーム。惑星をクリックで詳細表示。",bodies_list:"天体リスト",remove:"削除",name:"名前",cancel:"キャンセル",create:"作成",help_title:"ヘルプと情報",version:"バージョン",controls_header:"操作方法",changelog_header:"更新履歴",ctrl_pan:"視点移動 (Pan)",ctrl_pan_desc:"右クリック + ドラッグ",ctrl_rotate:"回転 (Rotate)",ctrl_rotate_desc:"左クリック + ドラッグ",ctrl_zoom:"ズーム (Zoom)",ctrl_zoom_desc:"マウスホイール",ctrl_select:"天体選択",ctrl_select_desc:"惑星をクリック",cl_surface_view:"地表視点の刷新 (FPSスタイル)",cl_orbit_view:"公転固定視点への名称変更",cl_perf:"パフォーマンス改善",cl_v0_2_1_title:"v0.2.1 - 物理演算と視点の強化",cl_item_surface:"地表視点の改善 (公転固定、進行方向への整列、UX向上)",cl_item_perf:"パフォーマンスビュー (FPS, 計算時間, 総エネルギー)",cl_item_physics:"物理エンジンの強化 (GPU/Workerでの衝突判定)",show_multithreading:"マルチスレッド計算 (実験的)",show_gpu:"GPUアクセラレーション (ベータ)",show_performance:"パフォーマンス情報を表示",perf_stats:"シミュレーション統計",perf_fps:"FPS",perf_mode:"計算モード",perf_bodies:"天体数",perf_physics:"計算時間",perf_energy:"総エネルギー",perf_error:"保存誤差",perf_kinetic:"運動エネルギー",perf_potential:"位置エネルギー",calculating:"計算中...",cl_v0_3_0_title:"v0.3.0 - エネルギー監視とハイブリッドエンジン",cl_item_energy:"エネルギー監視 (運動・位置エネルギー、誤差率)",cl_item_hybrid:"ハイブリッドエンジン (CPU/Worker/GPU の最適化と切替)",cl_item_cleanup:"リソース管理の改善 (メモリリーク低減)",cl_v0_4_0_title:"v0.4.0 - UI改善とZenモード",cl_item_compact:"コンパクトコントロール (幅統一・折りたたみ表示)",cl_item_zen:"Zenモード (UI・ロゴ・グリッド非表示による没入感)",cl_item_ui:"UI調整 (レイアウトの整理・視覚スタイルの統一)",cl_item_gallery:"恒星系ギャラリー (プリセットの視覚的選択機能)",star_system_gallery:"恒星系ギャラリー",gallery_title:"恒星系ギャラリー",gallery_select_mode:"モード選択",gallery_load:"読み込み",gallery_close:"閉じる",stable_era:"安定期",chaotic_era:"乱紀",time_scale:"時間スケール",habitable_zone_multi_star:"連星系ハビタブルゾーン",hz_cold:"寒冷域",hz_habitable:"ハビタブル",hz_hot:"高温域",delete_title:"天体の削除",delete_message:'"{name}" を削除してもよろしいですか？この操作は取り消せません。',delete_confirm:"削除",delete_cancel:"キャンセル",supernova_button:"超新星を起こす",supernova_modal_title:"超新星爆発を起こす",supernova_modal_message:'"{name}" を超新星爆発させますか？恒星は {remnant} へ変化します。',supernova_modal_confirm:"超新星を起こす",supernova_modal_cancel:"キャンセル",supernova_toast_triggered:"{name} で超新星爆発が始まりました。",supernova_overlay_kicker:"Catastrophic Event",supernova_phase_intro:"超巨星へフォーカス中",supernova_phase_countdown:"核崩壊まであとわずか",supernova_phase_breakout:"ショックブレイクアウト",supernova_phase_ejecta:"放出殻が膨張中",supernova_phase_remnant:"残骸を形成中",supernova_phase_complete:"シーケンス完了",supernova_remnant_black_hole:"ブラックホール残骸が形成されました。",supernova_remnant_neutron_star:"中性子星残骸が形成されました。",supernova_remnant_none:"前駆星は完全に消失しました。",supernova_action_replay:"リプレイ",supernova_action_inspect:"残骸を見る",supernova_action_free_camera:"フリーカメラ",supernova_remnant_label_black_hole:"ブラックホール",supernova_remnant_label_neutron_star:"中性子星",scenario_overlay_kicker:"破局イベント",scenario_metric_distance_ratio:"限界距離比",scenario_action_replay:"リプレイ",scenario_action_inspect:"結果を見る",scenario_action_free_camera:"フリーカメラ",scenario_supernova_phase_intro:"超巨星へフォーカス中",scenario_supernova_phase_countdown:"核崩壊まであとわずか",scenario_supernova_phase_breakout:"ショックブレイクアウト",scenario_supernova_phase_ejecta:"放出殻が膨張中",scenario_supernova_phase_remnant:"残骸を形成中",scenario_supernova_phase_complete:"シーケンス完了",scenario_supernova_outcome_black_hole:"ブラックホール残骸が形成された。",scenario_supernova_outcome_neutron_star:"中性子星残骸が形成された。",scenario_supernova_outcome_none:"母星は完全に破壊された。",scenario_tidal_phase_intro:"破壊される恒星へフォーカス中",scenario_tidal_phase_approach:"潮汐破壊の接近中",scenario_tidal_phase_spaghettification:"スパゲッティ化が始まっている",scenario_tidal_phase_breach:"恒星コアが引き裂かれている",scenario_tidal_phase_capture:"二股の破片流が特異点へ落ち込む",scenario_tidal_phase_aftermath:"降着フレアが円盤を染め上げる",scenario_tidal_phase_complete:"シーケンス完了",scenario_tidal_outcome_captured:"ブラックホールが破壊された恒星を捕獲した。",scenario_tidal_outcome_none:"デブリの尾が拡散している。"}};let Ve=navigator.language.startsWith("ja")?"ja":"en";const pt=new Set,yi=e=>xi[Ve][e]||e,bi=e=>{Ve=e,pt.forEach(s=>s())},Si=e=>(pt.add(e),()=>pt.delete(e)),ie=()=>(_.useSyncExternalStore(Si,()=>Ve),{t:yi,lang:Ve,setLanguage:bi}),wi=()=>{const e=S(a=>a.zenMode),s=_.useRef(null),t=_.useRef(0),n=_.useRef(performance.now()),r=_.useRef(0),{t:i,lang:l}=ie();return _.useEffect(()=>{if(e)return;let a;const c=()=>{const d=performance.now();r.current++;const f=d-n.current;if(f>=500&&(t.current=Math.round(r.current*1e3/f),r.current=0,n.current=d),s.current&&!e){const{physicsDuration:p,bodyCount:g,mode:h,energy:u}=X,m=t.current,v=Math.abs(u.drift),w=v<1e-4?"#44ff44":v<.01?"#ffff44":"#ff4444",y=(u.drift*100).toFixed(4)+"%",M=u.total.toExponential(4),k=X.cameraPosition||[0,0,0],z=`[${Math.round(k[0])}, ${Math.round(k[1])}, ${Math.round(k[2])}]`;s.current.innerHTML=`
                    <div style="font-weight: bold; margin-bottom: 4px;">${i("perf_stats")}</div>
                    <div style="display: flex; justify-content: space-between; gap: 12px;">
                        <span>${i("perf_fps")}:</span> <span style="color: ${m<30?"#ff4444":"#44ff44"}">${m}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Cam:</span> <span style="font-family: monospace; color: #aaaaff;">${z}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${i("perf_mode")}:</span> <span style="color: #44aaff">${h}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${i("perf_bodies")}:</span> <span>${g}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${i("perf_physics")}:</span> <span>${p.toFixed(1)}ms</span>
                    </div>
                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 4px 0;" />
                    <div style="display: flex; justify-content: space-between;">
                        <span>${i("perf_energy")}:</span> <span style="font-family: monospace; font-size: 0.9em;">${M}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${i("perf_error")}:</span> <span style="font-family: monospace; font-size: 0.9em; color: ${w}">${y}</span>
                    </div>
                    <div style="font-size: 0.85em; opacity: 0.7; margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
                       <div style="display: flex; justify-content: space-between;"><span>${i("perf_kinetic")}:</span> <span>${u.kinetic.toExponential(2)}</span></div>
                       <div style="display: flex; justify-content: space-between;"><span>${i("perf_potential")}:</span> <span>${u.potential.toExponential(2)}</span></div>
                    </div>
                `}a=requestAnimationFrame(c)};return c(),()=>{cancelAnimationFrame(a)}},[i,l,e]),e?null:o.jsx("div",{ref:s,style:{position:"absolute",bottom:"250px",left:"10px",background:"rgba(20, 30, 40, 0.1)",backdropFilter:"blur(4px)",padding:"12px",borderRadius:"8px",color:"#e0e0e0",fontFamily:"Inter, system-ui, sans-serif",fontSize:"12px",border:"1px solid rgba(255, 255, 255, 0.1)",width:"220px",boxShadow:"0 4px 12px rgba(0, 0, 0, 0.3)",pointerEvents:"none",zIndex:1e3,userSelect:"none"}})},Oe=(e,s)=>{const t=e.filter(a=>s.includes(a.id));if(t.length===0)return null;const n=t.reduce((a,c)=>a.add(c.position),new P(0,0,0)).multiplyScalar(1/t.length),r=t.reduce((a,c)=>Math.max(a,c.radius),1),i=e.reduce((a,c)=>Math.max(a,n.distanceTo(c.position)),r*12),l=Math.max(i*1.7,r*18);return{cameraPosition:n.clone().add(new P(l*.85,l*.55,l)),lookAt:n}},_i=(e,s)=>{const t=new P(e.position.x,e.position.y,e.position.z),n=e.hasAccretionDisk&&e.accretionDiskConfig?e.radius*e.accretionDiskConfig.outerRadius:e.radius,r=e.hasJets?e.radius*15:e.radius,i=Math.max(e.radius,n,r),l=Math.max(i*2.35,s*.58,78),a=new P(.72,.24,.92).normalize();return{cameraPosition:t.clone().add(a.multiplyScalar(l)),lookAt:t}},Jt=(e,s,t)=>{const n=new P(e.position.x,e.position.y,e.position.z),r=new P(s.position.x,s.position.y,s.position.z),i=n.clone().sub(r),l=Math.max(i.length(),e.radius+s.radius*2);if(i.lengthSq()<=1e-4)return Oe([e,s],[e.id,s.id]);i.normalize();const a=Math.abs(i.y)>.82?new P(0,0,1):new P(0,1,0),c=new P().crossVectors(i,a).normalize(),d=new P().crossVectors(c,i).normalize(),f=r.clone().lerp(n,.44+t*.28),p=e.hasAccretionDisk&&e.accretionDiskConfig?e.radius*e.accretionDiskConfig.outerRadius:e.radius*6.5,g=Math.max(l*.9,s.radius*4.2),h=Math.max(p,g),u=Math.max(h*(1.72-t*.45),l*(1.48-t*.18),34);return{cameraPosition:f.clone().add(c.multiplyScalar(u*.62)).add(d.multiplyScalar(u*.22)).add(i.clone().multiplyScalar(-u*(.24-t*.05))),lookAt:f.clone().add(i.clone().multiplyScalar(l*.14))}},Ci=()=>{const e=S(u=>u.bodies),s=S(u=>u.currentSystemId),t=S(u=>u.scriptedScenario),n=S(u=>u.setFollowingBody),r=S(u=>u.setCameraMode),i=S(u=>u.advanceScriptedScenario),l=S(u=>u.completeScriptedScenario),a=S(u=>u.triggerSupernova),c=S(u=>u.triggerScriptedTidalDisruption),d=S(u=>u.finalizeScriptedTidalDisruption),{camera:f,controls:p}=Se(),g=_.useMemo(()=>s?We(s)?.scenario??null:null,[s]),h=T.useRef("idle");return G(()=>{if(!t.active||!t.kind||!g)return;const u=hs(t,g,e,performance.now());u.nextPhase==="complete"?l(t.outcomeBodyId,{...u.updates,focusBodyId:t.outcomeBodyId}):u.nextPhase?i(u.nextPhase,u.updates):u.updates&&i(t.phase,u.updates);for(const m of u.effects)switch(m){case"trigger-supernova":t.primaryBodyId&&a(t.primaryBodyId);break;case"trigger-tidal-disruption":t.kind==="tidal-disruption"&&t.primaryBodyId&&t.targetBodyId&&g.kind==="tidal-disruption"&&c(t.primaryBodyId,t.targetBodyId,g.disruptionDurationMs);break;case"finalize-tidal-disruption":t.primaryBodyId&&t.targetBodyId&&d(t.primaryBodyId,t.targetBodyId);break}}),T.useEffect(()=>{if(!p||!t.active||!t.kind){h.current="idle";return}const u=p,m=t.primaryBodyId?e.find(x=>x.id===t.primaryBodyId):null,v=t.targetBodyId?e.find(x=>x.id===t.targetBodyId):null,w=t.focusBodyId?e.find(x=>x.id===t.focusBodyId):null,y=t.outcomeBodyId?e.find(x=>x.id===t.outcomeBodyId):null,M=Oe(e,[t.focusBodyId,t.targetBodyId,t.primaryBodyId].filter(Boolean)),k=Oe(e,e.map(x=>x.id)),z=Oe(e,[t.primaryBodyId,t.targetBodyId].filter(Boolean)),b=m&&v?Jt(m,v,.08):null,R=m&&v?Jt(m,v,.24):null,j=t.kind==="tidal-disruption"&&t.phase==="approach"&&(t.metricValue??1/0)<=cs,C=t.kind==="tidal-disruption"?`${t.kind}:${t.phase}:${j?"wide":"track"}`:`${t.kind}:${t.phase}`;if(h.current!==C){if(h.current=C,t.kind==="supernova"){switch(t.phase){case"intro":w&&(n(w.id),r("sun_lock"),Ue(f,u,w.position,w.radius,{duration:1,ease:"power3.out"}));break;case"countdown":w&&(n(w.id),r("sun_lock"),Ue(f,u,w.position,w.radius,{duration:1,ease:"power2.inOut"}),gi(f,u,.8,{duration:1.2,ease:"power2.out"}));break;case"shock-breakout":case"ejecta":M&&(n(w?.id??null),r("sun_lock"),te(f,u,M.cameraPosition,M.lookAt,{duration:1.3,ease:"power3.out"}));break;case"remnant":y?(n(y.id),r("sun_lock"),Ue(f,u,y.position,y.radius,{duration:1.25,ease:"power3.out"})):M&&(n(null),r("free"),rt(f,u,M.cameraPosition,M.lookAt,{duration:1.4,ease:"power3.out"}));break;case"complete":!y&&M&&(n(null),r("free"),rt(f,u,M.cameraPosition,M.lookAt,{duration:1.2,ease:"power2.out"}));break}return}switch(t.phase){case"intro":k&&(n(null),r("free"),te(f,u,k.cameraPosition,k.lookAt,{duration:1.25,ease:"power3.out"}));break;case"approach":j&&b?(n(null),r("free"),te(f,u,b.cameraPosition,b.lookAt,{duration:1.1,ease:"power3.out"})):v&&(n(v.id),r("sun_lock"),Ue(f,u,v.position,v.radius,{duration:.95,ease:"power2.out"}));break;case"breach":b&&(n(null),r("free"),te(f,u,b.cameraPosition,b.lookAt,{duration:1.3,ease:"power3.out"}));break;case"debris-capture":R?(n(null),r("free"),te(f,u,R.cameraPosition,R.lookAt,{duration:1.2,ease:"power3.out"})):z&&(n(null),r("free"),te(f,u,z.cameraPosition,z.lookAt,{duration:1.2,ease:"power3.out"}));break;case"aftermath":case"complete":if(y??m){const x=y??m;if(x){const D=_i(x,f.position.distanceTo(x.position));n(null),r("free"),te(f,u,D.cameraPosition,D.lookAt,{duration:1.15,ease:"power3.out"})}}else z&&(n(null),r("free"),rt(f,u,z.cameraPosition,z.lookAt,{duration:1.1,ease:"power2.out"}));break}}},[i,e,f,l,p,d,t.active,t.focusBodyId,t.kind,t.outcomeBodyId,t.phase,t.metricValue,t.primaryBodyId,t.targetBodyId,r,n,c,a]),null},Qt=e=>{const s=e.filter(t=>t.isStar);if(s.length!==0)return s.reduce((t,n)=>n.mass>t.mass?n:t,s[0])},Mi=()=>S(s=>s.showPrediction)?o.jsx(Ws,{}):null,ki=()=>{const e=S(g=>g.bodies),s=S(g=>g.followingBodyId),t=S(g=>g.cameraMode),n=S(g=>g.simulationTime),r=S(g=>g.useRealisticDistances),i=S(g=>g.scriptedScenario.active),{camera:l,controls:a}=Se(),c=T.useRef(null),d=T.useRef(0),f=T.useRef(!0),p=T.useRef("free");return T.useEffect(()=>{if(f.current=!0,i){p.current=t;return}if(s&&a){const g=S.getState().bodies.find(h=>h.id===s);if(g){const h=new P(g.position.x,g.position.y,g.position.z),u=a;if(t!==p.current||f.current)if(t==="surface_lock"){const m=Qt(S.getState().bodies);let v=new P(0,0,-1),w=new P(1,0,0);if(m){const b=new P(m.position.x,m.position.y,m.position.z).clone().sub(h).normalize();w=b.clone().negate(),v=b.clone().cross(new P(0,1,0)).normalize()}else{const z=new P(g.velocity.x,g.velocity.y,g.velocity.z);z.lengthSq()>1e-4&&(v=z.normalize())}const y=w.multiplyScalar(g.radius*1.05),M=h.clone().add(y),k=M.clone().add(v.multiplyScalar(100));te(l,u,M,k,{duration:1,ease:"power2.inOut"})}else{const v=l.position.clone().sub(h).normalize();v.lengthSq()<.001&&v.set(1,.8,1).normalize();const w=Math.max(g.radius*5,10),y=h.clone().add(v.multiplyScalar(w));te(l,u,y,h,{duration:.8,ease:"power2.inOut",dynamicTarget:()=>{const M=S.getState().bodies.find(k=>k.id===s);return M?new P(M.position.x,M.position.y,M.position.z):h}})}}}p.current=t},[s,t,a,l,i]),T.useEffect(()=>{c.current=null},[r]),G(g=>{if(X.cameraPosition=[g.camera.position.x,g.camera.position.y,g.camera.position.z],!s)return;const h=e.find(m=>m.id===s),u=Qt(e);if(h&&g.controls){const m=g.controls,v=new P(h.position.x,h.position.y,h.position.z);if(f.current||!c.current){c.current=v.clone(),d.current=n,f.current=!1,m.target.copy(v),m.update();return}if(t==="free"){const w=v.clone().sub(c.current);g.camera.position.add(w),m.target.add(w)}else if(t==="sun_lock"||t==="surface_lock")if(u){const w=new P(u.position.x,u.position.y,u.position.z),y=c.current.clone().sub(w),M=v.clone().sub(w);if(y.lengthSq()>1e-4&&M.lengthSq()>1e-4){y.normalize(),M.normalize();const k=new io().setFromUnitVectors(y,M),z=g.camera.position.clone().sub(c.current);z.applyQuaternion(k),g.camera.position.copy(v.clone().add(z));const b=m.target.clone().sub(c.current);b.applyQuaternion(k),m.target.copy(v.clone().add(b))}else{const k=v.clone().sub(c.current);g.camera.position.add(k),m.target.add(k)}}else{const w=v.clone().sub(c.current);g.camera.position.add(w),m.target.add(w)}m.update(),c.current.copy(v),d.current=n}}),null},ji=()=>{const{camera:e,controls:s}=Se();return T.useEffect(()=>{const t=r=>{const i=r,{factor:l}=i.detail;if(e.position.multiplyScalar(l),s){const a=s;a.target.multiplyScalar(l),a.update()}e.far=i.detail.realistic?1e5:5e4,e.updateProjectionMatrix()},n=r=>{const i=r,{camera:l}=i.detail;if(e.position.set(l.position[0],l.position[1],l.position[2]),s){const a=s;a.target.set(l.target[0],l.target[1],l.target[2]),a.update()}};return window.addEventListener("distanceScaleChanged",t),window.addEventListener("starSystemChanged",n),()=>{window.removeEventListener("distanceScaleChanged",t),window.removeEventListener("starSystemChanged",n)}},[e,s]),null},Pi=()=>{const e=S(a=>a.bodies),s=S(a=>a.collisionEvents),t=S(a=>a.cameraMode),n=S(a=>a.scriptedScenario.active),{camera:r,controls:i}=Se(),l=T.useRef(null);return T.useEffect(()=>{if(!i||n||t!=="free"||s.length===0)return;const a=s[s.length-1];if(l.current===a.id)return;l.current=a.id;const c=a.focusBodyId?e.find(h=>h.id===a.focusBodyId)??null:null,d=new P(a.position.x,a.position.y,a.position.z),f=c?c.position.clone():null,p=vi({collisionPoint:d,currentCameraPosition:r.position.clone(),impactRadius:a.impactRadius??1,focusPosition:f});te(r,i,p.cameraPosition,p.lookAt,{duration:.45,ease:"power2.out",dynamicTarget:a.focusBodyId?()=>S.getState().bodies.find(u=>u.id===a.focusBodyId)?.position.clone()??p.lookAt.clone():void 0})},[e,r,t,s,i,n]),null},zi=()=>{const e=S(a=>a.bodies),{camera:s,size:t}=Se(),n=_.useMemo(()=>e.filter(a=>a.isCompactObject),[e]);if(!(n.length>0))return null;const i=n[0],l=new P(i.position.x,i.position.y,i.position.z);return o.jsxs(or,{enableNormalPass:!1,multisampling:0,children:[o.jsx(No,{blackHolePosition:l,schwarzschildRadius:i.radius,strength:1.5,camera:s,enabled:!0,viewportSize:t}),o.jsx(rr,{brightness:-.2,contrast:.1})]},"gravitational-lens-composer")},Ri=()=>{Ns();const e=S(h=>h.bodies),s=S(h=>h.showHabitableZone),t=S(h=>h.useRealisticDistances),n=S(h=>h.tidallyDisruptedEvents),r=S(h=>h.removeTidalDisruptionEvent),i=S(h=>h.collisionEvents),l=S(h=>h.removeCollisionEvent),a=_.useMemo(()=>e.filter(h=>h.isStar),[e]),c=a.length===1,d=a.length>1,f=c?a[0]:void 0,p=t?be.REALISTIC.AU_UNIT:be.COMPRESSED.AU_UNIT,g=_.useMemo(()=>f?$s(f,p):null,[f,p]);return o.jsxs(o.Fragment,{children:[o.jsx(ki,{}),o.jsx(Pi,{}),o.jsx(Ci,{}),o.jsx("ambientLight",{intensity:.2}),o.jsx("pointLight",{position:[0,0,0],intensity:2,decay:0,distance:1e3}),s&&g&&f&&c&&o.jsxs("mesh",{position:[f.position.x,f.position.y,f.position.z],rotation:[-Math.PI/2,0,0],children:[o.jsx("ringGeometry",{args:[g.inner,g.outer,64]}),o.jsx("meshBasicMaterial",{color:"#22aa44",opacity:.15,transparent:!0,side:me,depthWrite:!1})]}),s&&d&&o.jsx(Xs,{}),n.map(h=>{const u=e.find(M=>M.id===h.primaryId),m=u?u.position:new P(h.primaryPosition.x,h.primaryPosition.y,h.primaryPosition.z),v=u?u.mass:1e3,w=h.bodyRadius,y=h.bodyColor;return o.jsx(mi,{position:new P(h.position.x,h.position.y,h.position.z),primaryPosition:new P(m.x,m.y,m.z),bodyRadius:w,bodyColor:y,primaryMass:v,startTime:h.startTime,duration:h.duration,onComplete:()=>r(h.bodyId)},h.bodyId+"_"+h.startTime)}),i.map(h=>o.jsx(Eo,{position:new P(h.position.x,h.position.y,h.position.z),startTime:h.startTime,duration:2e3,maxRadius:50,color:h.color,onComplete:()=>l(h.id)},h.id)),e.map(h=>o.jsx(Es,{body:h},h.id)),o.jsx(Mi,{}),o.jsx(qs,{}),o.jsx(ni,{})]})},Di=()=>{const e=S(d=>d.showGrid),s=S(d=>d.zenMode),t=S(d=>d.useRealisticDistances),n=S(d=>d.bodies),r=_.useMemo(()=>n.some(d=>d.isCompactObject),[n]),i=t?{fadeDistance:5e3,sectionSize:200,cellSize:50}:{fadeDistance:2e3,sectionSize:50,cellSize:10},l=r?"#aaaaaa":"#555555",a=r?"#888888":"#333333",c=e&&!s;return o.jsx("group",{visible:c,children:o.jsx(tr,{infiniteGrid:!0,fadeDistance:i.fadeDistance,sectionColor:l,cellColor:a,sectionSize:i.sectionSize,cellSize:i.cellSize,side:2})})},Ii=()=>{const e=S(p=>p.zenMode),s=S(p=>p.cameraMode),t=S(p=>p.useRealisticDistances),n=S(p=>p.qualityLevel),[r,i]=T.useState(null),l=s==="surface_lock",a=t?2e5:5e4,c=fe(n),d=typeof window<"u"?Math.min(window.devicePixelRatio*c.pixelRatioMultiplier,2):1,f=T.useCallback(p=>{console.error("WebGL initialization error:",p);const g=p instanceof Error?p.message:"WebGL failed to initialize";i(g)},[]);return r?o.jsxs("div",{style:{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0a0a0a",color:"white",padding:"20px",boxSizing:"border-box"},children:[o.jsx("h2",{style:{fontSize:"1.5rem",marginBottom:"1rem"},children:"⚠️ WebGL Error"}),o.jsx("p",{style:{opacity:.7,textAlign:"center",maxWidth:"500px"},children:"Your device or browser doesn't support WebGL, which is required for 3D rendering."}),o.jsxs("p",{style:{opacity:.5,fontSize:"0.9rem",marginTop:"1rem"},children:["Error: ",r]}),o.jsx("button",{onClick:()=>window.location.reload(),style:{marginTop:"2rem",padding:"12px 24px",background:"#3b82f6",color:"white",border:"none",borderRadius:"8px",cursor:"pointer"},children:"Retry"})]}):o.jsxs(Xo,{camera:{position:[0,25,50],fov:45,near:.1,far:a},dpr:d,onCreated:({gl:p})=>{try{if(!p||!p.getContext)throw new Error("WebGL context not available");console.log("WebGL context created successfully")}catch(g){f(g)}},children:[o.jsx("color",{attach:"background",args:["#000000"]}),o.jsx(fi,{}),o.jsx(Ri,{}),o.jsx(ji,{}),o.jsx(Jo,{makeDefault:!0,enablePan:!0,minDistance:.001,maxDistance:1e5,enableZoom:!l,enableDamping:!0,dampingFactor:.1,zoomSpeed:1.5,panSpeed:1.2,rotateSpeed:.8}),o.jsx(Di,{}),!e&&o.jsx(Qo,{alignment:"bottom-left",margin:[100,100],children:o.jsx(er,{axisColors:["#ff3653","#0adb50","#2c8fdf"],labelColor:"black"})}),o.jsx(zi,{})]})},Bi=()=>o.jsxs("div",{style:{position:"relative",width:"100%",height:"100%"},children:[o.jsx(T.Suspense,{fallback:o.jsx("div",{style:{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0a0a0a",color:"white"},children:"Loading..."}),children:o.jsx(Ii,{})}),o.jsx(Vs,{}),S(e=>e.showPerformance)&&o.jsx(wi,{})]}),Ai=({activeTab:e,onChange:s})=>{const t=S(a=>a.bodies),n=S(a=>a.selectedBodyId),r=S(a=>a.userMode),{t:i}=ie(),l=r==="beginner";return o.jsxs("div",{className:"tab-navigation",role:"tablist","aria-label":"Simulation control tabs",children:[o.jsxs("button",{role:"tab","aria-selected":e==="controls","aria-controls":"controls-panel",id:"controls-tab",onClick:()=>s("controls"),className:`tab-btn ${e==="controls"?"active":""}`,tabIndex:e==="controls"?0:-1,children:[o.jsx(vt,{size:18,"aria-hidden":"true"}),o.jsx("span",{children:i("tab_controls")})]}),o.jsxs("button",{role:"tab","aria-selected":e==="bodies","aria-controls":"bodies-panel",id:"bodies-tab",onClick:()=>s("bodies"),className:`tab-btn ${e==="bodies"?"active":""}`,tabIndex:e==="bodies"?0:-1,children:[o.jsx($e,{size:18,"aria-hidden":"true"}),o.jsx("span",{children:i("tab_bodies")}),o.jsx("span",{className:"badge","aria-label":`${t.length} bodies`,children:t.length})]}),!l&&o.jsxs("button",{role:"tab","aria-selected":e==="inspector","aria-controls":"inspector-panel",id:"inspector-tab",onClick:()=>s("inspector"),className:`tab-btn ${e==="inspector"?"active":""}`,disabled:!n,title:i(n?"tab_inspector":"select_body_msg"),tabIndex:e==="inspector"?0:-1,"aria-disabled":!n,children:[o.jsx(ao,{size:18,"aria-hidden":"true"}),o.jsx("span",{children:i("tab_inspector")})]})]})},Ti=()=>{const{t:e}=ie(),s=S(c=>c.addBody),[t,n]=_.useState("preset"),[r,i]=_.useState({name:"New Planet",mass:1,radius:.5,color:"#ffffff",position:{x:10,y:0,z:0},velocity:{x:0,y:0,z:2}}),l=c=>{const d=(Math.random()-.5)*50;let p={position:new P(d,0,(Math.random()-.5)*50),velocity:new P(0,0,0),name:`New ${c}`};switch(c){case"Star":p={...p,type:"star",mass:1e4,radius:20,color:"#ffaa00",name:"New Star"};break;case"Planet":p={...p,type:"planet",mass:1,radius:1,color:"#3388ff",name:"New Planet"};break;case"Gas Giant":p={...p,type:"planet",mass:300,radius:10,color:"#dcb159",name:"Gas Giant"};break;case"Black Hole":p={...p,type:"black_hole",mass:5e4,radius:2,color:"#000000",name:"Black Hole",isCompactObject:!0};break}s(p)},a=()=>{s({name:r.name,mass:r.mass,radius:r.radius,color:r.color,position:new P(r.position.x,r.position.y,r.position.z),velocity:new P(r.velocity.x,r.velocity.y,r.velocity.z)})};return o.jsxs("div",{style:{marginTop:"20px",borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:"15px"},children:[o.jsx("h3",{style:{fontSize:"14px",marginBottom:"10px",color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.05em"},children:e("add_body")}),o.jsxs("div",{style:{display:"flex",marginBottom:"15px",background:"rgba(0,0,0,0.3)",borderRadius:"6px",padding:"2px"},children:[o.jsx("button",{onClick:()=>n("preset"),style:{flex:1,padding:"6px",borderRadius:"4px",background:t==="preset"?"rgba(255,255,255,0.1)":"transparent",color:t==="preset"?"white":"rgba(255,255,255,0.4)",border:"none",cursor:"pointer",transition:"all 0.2s"},children:e("preset_mode")}),o.jsx("button",{onClick:()=>n("custom"),style:{flex:1,padding:"6px",borderRadius:"4px",background:t==="custom"?"rgba(255,255,255,0.1)":"transparent",color:t==="custom"?"white":"rgba(255,255,255,0.4)",border:"none",cursor:"pointer",transition:"all 0.2s"},children:e("custom_mode")})]}),t==="preset"?o.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"},children:[{type:"Star",icon:xt,color:"#facc15"},{type:"Planet",icon:$e,color:"#60a5fa"},{type:"Gas Giant",icon:cr,color:"#fdba74"},{type:"Black Hole",icon:Ie,color:"#c084fc"}].map(c=>o.jsxs("button",{onClick:()=>l(c.type),style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",padding:"12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"white",cursor:"pointer",transition:"all 0.2s"},onMouseOver:d=>d.currentTarget.style.background="rgba(255,255,255,0.1)",onMouseOut:d=>d.currentTarget.style.background="rgba(255,255,255,0.05)",children:[o.jsx(c.icon,{size:24,color:c.color}),o.jsx("span",{style:{fontSize:"12px"},children:c.type})]},c.type))}):o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[o.jsx("input",{type:"text",value:r.name,onChange:c=>i({...r,name:c.target.value}),placeholder:e("name"),className:"lab-input",style:{width:"100%",padding:"8px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"4px",color:"white"}}),o.jsxs("div",{style:{display:"flex",gap:"8px"},children:[o.jsxs("div",{style:{flex:1},children:[o.jsx("label",{style:{fontSize:"10px",color:"#888",display:"block",marginBottom:"2px"},children:e("mass")}),o.jsx("input",{type:"number",value:r.mass,onChange:c=>i({...r,mass:parseFloat(c.target.value)}),style:{width:"100%",padding:"6px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"4px",color:"white"}})]}),o.jsxs("div",{style:{flex:1},children:[o.jsx("label",{style:{fontSize:"10px",color:"#888",display:"block",marginBottom:"2px"},children:e("radius")}),o.jsx("input",{type:"number",value:r.radius,onChange:c=>i({...r,radius:parseFloat(c.target.value)}),style:{width:"100%",padding:"6px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"4px",color:"white"}})]})]}),o.jsx("button",{onClick:a,style:{width:"100%",padding:"10px",marginTop:"5px",background:"#3b82f6",border:"none",borderRadius:"6px",color:"white",fontWeight:600,cursor:"pointer"},children:e("create_body")})]})]})},He=({isOpen:e,title:s,message:t,onConfirm:n,onCancel:r,danger:i=!1,confirmText:l="Confirm",cancelText:a="Cancel"})=>e?o.jsx("div",{className:"confirm-modal-overlay",children:o.jsxs("div",{className:"confirm-modal-content",children:[o.jsx("h3",{className:"confirm-modal-title",children:s}),o.jsx("p",{className:"confirm-modal-message",children:t}),o.jsxs("div",{className:"confirm-modal-actions",children:[o.jsx("button",{onClick:r,className:"confirm-btn-secondary",children:a}),o.jsx("button",{onClick:n,className:i?"confirm-btn-danger":"confirm-btn-primary",children:l})]})]})}):null,Uo=_.createContext(void 0),Fo=()=>{const e=_.useContext(Uo);if(!e)throw new Error("useToast must be used within a ToastProvider");return e},Ei={en:{controls:{title:"Controls",description:"Control simulation speed, camera mode, and visualization options.",tips:["Use the time scale slider to speed up or slow down the simulation","Switch between different camera modes for various viewing perspectives","Toggle prediction lines to see future orbital paths","Enable habitable zone visualization for star systems","Adjust gravity heatmap to visualize gravitational field strength"]},bodies:{title:"Bodies",description:"View all celestial bodies, search, filter, and manage them.",tips:["Use the search bar to quickly find specific bodies by name","Filter by type: All, Star, Planet, or Black Hole","Click a body to select it and view details in the Inspector","Hold Ctrl/Cmd or Shift while clicking to select multiple bodies","Use the duplicate button to create a copy of a body","Delete individual bodies or use bulk delete for multiple selections"]},inspector:{title:"Inspector",description:"Edit properties of the selected body including mass, radius, and vectors.",tips:["Modify physical properties like mass, radius, and color","Adjust position and velocity vectors in 3D space","Use sliders for quick adjustments or input exact values","Mass is displayed in solar masses (M☉)","Position and velocity are in simulation units","Changes take effect immediately in the simulation"]}},ja:{controls:{title:"コントロール",description:"シミュレーション速度、カメラモード、可視化オプションを制御します。",tips:["タイムスケールスライダーでシミュレーションの速度を調整できます","様々な視点で観察するために異なるカメラモードを切り替えられます","予測ラインを切り替えて未来の軌道経路を表示できます","恒星系のハビタブルゾーン可視化を有効にできます","重力ヒートマップで重力場の強度を視覚化できます"]},bodies:{title:"天体",description:"すべての天体を表示、検索、フィルタリング、管理します。",tips:["検索バーで名前から特定の天体を素早く見つけられます","タイプでフィルタリング: すべて、恒星、惑星、ブラックホール","天体をクリックして選択し、インスペクターで詳細を表示できます","Ctrl/CmdまたはShiftを押しながらクリックすると複数の天体を選択できます","複製ボタンで天体のコピーを作成できます","個別に削除するか、複数選択して一括削除できます"]},inspector:{title:"インスペクター",description:"選択した天体の質量、半径、ベクトルなどのプロパティを編集します。",tips:["質量、半径、色などの物理プロパティを変更できます","3D空間での位置と速度ベクトルを調整できます","スライダーで素早く調整するか、正確な値を入力できます","質量は太陽質量（M☉）で表示されます","位置と速度はシミュレーション単位で表示されます","変更はシミュレーションに即座に反映されます"]}}},St=({topic:e})=>{const[s,t]=_.useState(!1),{lang:n}=ie(),r=n||"en",i=Ei[r][e];return s?o.jsx("div",{className:"context-help-modal-overlay",onClick:()=>t(!1),children:o.jsxs("div",{className:"context-help-modal",onClick:l=>l.stopPropagation(),children:[o.jsxs("div",{className:"context-help-header",children:[o.jsx("h3",{children:i.title}),o.jsx("button",{onClick:()=>t(!1),className:"context-help-close","aria-label":r==="ja"?"ヘルプを閉じる":"Close help",children:o.jsx(Ze,{size:18})})]}),o.jsxs("div",{className:"context-help-body",children:[o.jsx("p",{className:"context-help-description",children:i.description}),o.jsxs("div",{className:"context-help-tips",children:[o.jsx("h4",{children:r==="ja"?"ヒント:":"Tips:"}),o.jsx("ul",{children:i.tips.map((l,a)=>o.jsx("li",{children:l},a))})]})]})]})}):o.jsx("button",{onClick:()=>t(!0),className:"context-help-button",title:r==="ja"?"ヘルプを表示":"Show help","aria-label":`${r==="ja"?"ヘルプ":"Help"}: ${i.title}`,children:o.jsx(yt,{size:16})})},je=e=>e.type?e.type:e.isStar?"star":e.isCompactObject?"black_hole":"planet",Ni=()=>{const{t:e}=ie(),{showToast:s}=Fo(),t=S(C=>C.bodies),n=S(C=>C.selectedBodyId),r=S(C=>C.selectBody),i=S(C=>C.removeBody),l=S(C=>C.duplicateBody),[a,c]=_.useState(""),[d,f]=_.useState("all"),[p,g]=_.useState(new Set),[h,u]=_.useState(!1),[m,v]=_.useState(null),[w,y]=_.useState(!1),M=t.find(C=>C.id===m),k=_.useMemo(()=>t.filter(C=>{const x=C.name.toLowerCase().includes(a.toLowerCase()),D=je(C);return x&&(d==="all"||(d==="black_hole"?D==="black_hole":D===d)||d==="planet"&&D==="asteroid")}),[t,a,d]),z=_.useMemo(()=>({all:t.length,star:t.filter(C=>je(C)==="star").length,planet:t.filter(C=>{const x=je(C);return x==="planet"||x==="asteroid"}).length,black_hole:t.filter(C=>je(C)==="black_hole").length}),[t]),b=C=>{const x=je(C);return x==="star"?o.jsx(xt,{size:16,color:"#fbbf24"}):x==="black_hole"?o.jsx(Ie,{size:16,color:"#c084fc"}):x==="planet"?o.jsx($e,{size:16,color:"#60a5fa"}):o.jsx(pr,{size:16,color:"#9ca3af"})},R=(C,x)=>{x.shiftKey||x.ctrlKey||x.metaKey?(u(!0),g(D=>{const I=new Set(D);return I.has(C)?I.delete(C):I.add(C),I})):(h&&p.size>0&&(g(new Set),u(!1)),r(C))},j=()=>{p.forEach(C=>i(C)),s(`${p.size} bodies deleted`,"success"),g(new Set),u(!1),y(!1)};return o.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:[h&&p.size>0&&o.jsxs("div",{style:{padding:"12px 20px",background:"rgba(96, 165, 250, 0.15)",borderBottom:"1px solid rgba(96, 165, 250, 0.3)",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[o.jsxs("div",{style:{fontSize:"0.9rem",color:"#60a5fa"},children:[p.size," ",p.size===1?"body":"bodies"," selected"]}),o.jsxs("div",{style:{display:"flex",gap:"8px"},children:[o.jsx("button",{onClick:()=>{g(new Set),u(!1)},style:{background:"rgba(255, 255, 255, 0.1)",border:"1px solid rgba(255, 255, 255, 0.2)",color:"white",padding:"6px 12px",borderRadius:"4px",cursor:"pointer",fontSize:"0.85rem"},children:"Cancel"}),o.jsxs("button",{onClick:()=>y(!0),style:{background:"rgba(239, 68, 68, 0.2)",border:"1px solid rgba(239, 68, 68, 0.4)",color:"#ef4444",padding:"6px 12px",borderRadius:"4px",cursor:"pointer",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"4px"},children:[o.jsx(at,{size:14}),"Delete ",p.size]})]})]}),o.jsxs("div",{style:{padding:"0 20px 10px",background:"rgba(0,0,0,0.2)",borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[o.jsx("div",{style:{display:"flex",justifyContent:"flex-end",paddingTop:"8px",paddingBottom:"4px"},children:o.jsx(St,{topic:"bodies"})}),o.jsxs("div",{className:"lab-search",style:{marginTop:"6px",display:"flex",alignItems:"center",background:"rgba(255,255,255,0.05)",borderRadius:"6px",padding:"4px 8px"},children:[o.jsx(dr,{size:14,color:"#aaa"}),o.jsx("input",{type:"text",placeholder:e("search_placeholder"),value:a,onChange:C=>c(C.target.value),style:{border:"none",background:"transparent",color:"white",marginLeft:"8px",flex:1,outline:"none",fontSize:"13px"}})]}),o.jsx("div",{style:{display:"flex",gap:"4px",marginTop:"8px",overflowX:"auto",paddingBottom:"4px"},className:"custom-scrollbar",children:["all","star","planet","black_hole"].map(C=>{const x=z[C];return o.jsxs("button",{onClick:()=>f(C),style:{border:"none",background:d===C?"rgba(96, 165, 250, 0.2)":"transparent",color:d===C?"#60a5fa":"#888",fontSize:"11px",padding:"8px 12px",borderRadius:"12px",cursor:"pointer",whiteSpace:"nowrap",textTransform:"capitalize",transition:"all 0.2s",display:"flex",alignItems:"center",gap:"4px",minHeight:"36px"},children:[o.jsx("span",{children:e(`filter_${C}`)}),o.jsx("span",{style:{fontSize:"10px",opacity:.7,fontWeight:600,background:d===C?"rgba(96, 165, 250, 0.2)":"rgba(255, 255, 255, 0.1)",padding:"1px 5px",borderRadius:"8px",minWidth:"18px",textAlign:"center"},children:x})]},C)})})]}),o.jsxs("div",{className:"custom-scrollbar",style:{flex:1,overflowY:"auto",padding:"10px 20px"},children:[k.map(C=>{const x=n===C.id,D=p.has(C.id),I=x||D;return o.jsxs("div",{onClick:A=>R(C.id,A),className:`lab-list-item ${I?"selected":""}`,style:{display:"flex",alignItems:"center",gap:"10px",padding:"8px",marginBottom:"4px",borderRadius:"6px",cursor:"pointer",background:I?"rgba(96, 165, 250, 0.1)":"transparent",border:`1px solid ${I?"rgba(96, 165, 250, 0.3)":"transparent"}`,transition:"all 0.2s",position:"relative"},children:[o.jsx("div",{style:{flexShrink:0},children:b(C)}),o.jsxs("div",{style:{flex:1,minWidth:0},children:[o.jsx("div",{style:{fontSize:"0.9rem",fontWeight:n===C.id?600:400,color:n===C.id?"white":"#ddd"},className:"truncate",children:C.name}),o.jsx("div",{style:{fontSize:"0.75rem",color:"#666",textTransform:"capitalize"},children:e(`filter_${je(C)}`)})]}),o.jsxs("div",{style:{display:"flex",gap:"4px",opacity:I?1:.5},children:[D&&o.jsx("div",{style:{position:"absolute",top:"8px",left:"8px",width:"6px",height:"6px",borderRadius:"50%",background:"#60a5fa"}}),o.jsx("button",{onClick:A=>{A.stopPropagation(),l(C.id),s(`${C.name} duplicated`,"success")},style:{background:"transparent",border:"none",color:"#aaa",cursor:"pointer",padding:"4px"},title:e("duplicate"),children:o.jsx(ur,{size:14})}),o.jsx("button",{onClick:A=>{A.stopPropagation(),v(C.id)},style:{background:"transparent",border:"none",color:"#aaa",cursor:"pointer",padding:"4px"},title:e("remove"),children:o.jsx(at,{size:14})})]})]},C.id)}),k.length===0&&o.jsx("div",{style:{textAlign:"center",color:"#6b7280",padding:"2rem 0",fontSize:"0.875rem"},children:e("no_bodies_found")})]}),o.jsx(He,{isOpen:!!m,title:e("delete_title"),message:e("delete_message").replace("{name}",M?.name||""),onConfirm:()=>{m&&(i(m),s(`${M?.name} deleted`,"success")),v(null)},onCancel:()=>v(null),danger:!0,confirmText:e("delete_confirm"),cancelText:e("delete_cancel")}),o.jsx(He,{isOpen:w,title:"Delete Multiple Bodies",message:`Are you sure you want to delete ${p.size} ${p.size===1?"body":"bodies"}? This action cannot be undone.`,onConfirm:j,onCancel:()=>y(!1),danger:!0,confirmText:"Delete All",cancelText:"Cancel"})]})},eo=({label:e,value:s,onChange:t,onCommit:n})=>{const[r,i]=_.useState({x:s.x,y:s.y,z:s.z}),[l,a]=_.useState({x:s.x,y:s.y,z:s.z});if(s.x!==l.x||s.y!==l.y||s.z!==l.z){const f={x:s.x,y:s.y,z:s.z};a(f),i(f)}const c=(f,p)=>{const g=parseFloat(p),h={...r,[f]:isNaN(g)?r[f]:g};i(h)},d=()=>{const f=new P(r.x,r.y,r.z);f.equals(s)||(n&&n(s.clone(),f),t(f))};return o.jsxs("div",{className:"lab-field",children:[o.jsx("label",{className:"lab-label",style:{textTransform:"uppercase",letterSpacing:"0.05em"},children:e}),o.jsx("div",{className:"lab-vector-grid",children:["x","y","z"].map(f=>o.jsxs("div",{className:"lab-vector-field",children:[o.jsx("span",{className:"lab-vector-label",children:f}),o.jsx("input",{type:"number",value:r[f],onChange:p=>c(f,p.target.value),onBlur:d,onKeyDown:p=>p.key==="Enter"&&d(),className:"lab-vector-input"})]},f))})]})},to=({value:e,onChange:s,onCommit:t,min:n,max:r,className:i,style:l,placeholder:a})=>{const[c,d]=_.useState(e.toString()),[f,p]=_.useState(null),[g,h]=_.useState(null),[u,m]=_.useState(e);e!==u&&(m(e),d(e.toString()),p(null));const v=M=>{const k=M.target.value;d(k);const z=parseFloat(k);if(!(k===""||k==="-")){if(isNaN(z)){p("Invalid number");return}if(n!==void 0&&z<n){p(`Min: ${n}`);return}if(r!==void 0&&z>r){p(`Max: ${r}`);return}p(null),s(z)}},w=()=>{h(e)},y=()=>{f||c===""||c==="-"?(d(e.toString()),p(null)):t&&g!==null&&t(g,parseFloat(c)),h(null)};return o.jsxs("div",{style:{position:"relative",width:"100%"},children:[o.jsx("input",{type:"text",value:c,onChange:v,onFocus:w,onBlur:y,className:i,style:{...l,borderColor:f?"#ef4444":l?.borderColor},placeholder:a}),f&&o.jsx("div",{style:{position:"absolute",right:0,top:"-18px",fontSize:"0.7rem",color:"#ef4444",background:"rgba(0,0,0,0.8)",padding:"1px 4px",borderRadius:"2px",zIndex:10},children:f})]})},Ui=({body:e})=>{const s=S(x=>x.updateBody),t=S(x=>x.selectBody),n=S(x=>x.removeBody),r=S(x=>x.setFollowingBody),i=S(x=>x.followingBodyId),l=S(x=>x.pushHistoryAction),a=S(x=>x.triggerSupernova),c=S(x=>x.supernovaEvents),d=S(x=>x.scriptedScenario),f=S(x=>x.bodies),{t:p}=ie(),{showToast:g}=Fo(),[h,u]=_.useState(!0),[m,v]=_.useState(!1),[w,y]=_.useState(!1),M=f.find(x=>x.name==="Sun"),k=c.some(x=>x.starId===e.id),z=d.active&&(d.primaryBodyId===e.id||d.targetBodyId===e.id),b=k||z,R=e.mass>2e5?p("supernova_remnant_label_black_hole"):p("supernova_remnant_label_neutron_star"),j=M&&e.id!==M.id?e.position.distanceTo(M.position).toFixed(1):"0.0",C=e.velocity.length().toFixed(3);return o.jsxs("div",{className:"inspector-content",style:{padding:"0 20px 20px"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"},children:[o.jsxs("h3",{style:{margin:0,fontSize:"18px",fontWeight:600,display:"flex",alignItems:"center",gap:"8px",color:"white"},children:[o.jsx(vt,{size:16,color:"#60a5fa"}),e.name]}),o.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[o.jsx(St,{topic:"inspector"}),o.jsx("button",{onClick:()=>t(null),style:{background:"transparent",border:"none",color:"rgba(255, 255, 255, 0.5)",cursor:"pointer",padding:"4px"},title:"Close inspector",children:o.jsx(Ze,{size:20})})]})]}),o.jsxs("div",{style:{display:"grid",gap:"10px",fontSize:"14px"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[o.jsxs("span",{style:{color:"#888"},children:[p("distance_sun"),":"]}),o.jsxs("span",{children:[j," AU"]})]}),o.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[o.jsxs("span",{style:{color:"#888"},children:[p("orbital_speed"),":"]}),o.jsxs("span",{children:[C," km/s"]})]}),o.jsx("hr",{style:{borderColor:"rgba(255,255,255,0.1)",width:"100%",margin:"10px 0"}}),o.jsxs("div",{style:{marginBottom:"5px"},children:[o.jsx("label",{style:{display:"block",color:"#888",marginBottom:"5px"},children:"Name"}),o.jsx("input",{type:"text",value:e.name,onChange:x=>s(e.id,{name:x.target.value}),onFocus:x=>{x.target.dataset.startValue=x.target.value},onBlur:x=>{const D=x.target.dataset.startValue;D!==void 0&&D!==x.target.value&&l({type:"UPDATE",id:e.id,previous:{name:D},current:{name:x.target.value}})},className:"lab-input",style:{width:"100%",boxSizing:"border-box",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",padding:"6px",borderRadius:"4px",color:"white"}})]}),o.jsxs("div",{style:{marginBottom:"5px"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[o.jsxs("label",{style:{display:"block",color:"#888",marginBottom:"5px"},children:[p("mass")," ",o.jsx("span",{style:{fontSize:"0.8em",color:"#666"},children:"(M☉)"})]}),o.jsxs("span",{style:{fontSize:"10px",color:"#666"},children:["10^",Math.log10(e.mass).toFixed(1)]})]}),o.jsx("input",{type:"range",min:"-2",max:"6",step:"0.1",value:Math.log10(e.mass>0?e.mass:1),onChange:x=>s(e.id,{mass:Math.pow(10,parseFloat(x.target.value))}),onPointerDown:x=>{x.target.dataset.startMass=e.mass.toString()},onPointerUp:x=>{const D=parseFloat(x.target.dataset.startMass||"0");!isNaN(D)&&D!==e.mass&&l({type:"UPDATE",id:e.id,previous:{mass:D},current:{mass:e.mass}})},className:"lab-range",style:{marginBottom:"5px",width:"100%"}}),o.jsx(to,{value:e.mass,onChange:x=>s(e.id,{mass:x}),onCommit:(x,D)=>{x!==D&&l({type:"UPDATE",id:e.id,previous:{mass:x},current:{mass:D}})},min:1e-4,step:.1,style:{width:"100%",boxSizing:"border-box",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",padding:"6px",borderRadius:"4px",color:"white"}})]}),o.jsxs("div",{style:{marginBottom:"5px"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[o.jsxs("label",{style:{display:"block",color:"#888",marginBottom:"5px"},children:["Radius ",o.jsx("span",{style:{fontSize:"0.8em",color:"#666"},children:"(R⊕)"})]}),o.jsx("span",{style:{fontSize:"10px",color:"#666"},children:e.radius.toFixed(1)})]}),o.jsx("input",{type:"range",min:"0.1",max:"100",step:"0.1",value:e.radius,onChange:x=>s(e.id,{radius:parseFloat(x.target.value)}),onPointerDown:x=>{x.target.dataset.startRadius=e.radius.toString()},onPointerUp:x=>{const D=parseFloat(x.target.dataset.startRadius||"0");!isNaN(D)&&D!==e.radius&&l({type:"UPDATE",id:e.id,previous:{radius:D},current:{radius:e.radius}})},className:"lab-range",style:{width:"100%"}})]}),o.jsxs("div",{style:{marginBottom:"5px"},children:[o.jsx("div",{style:{display:"flex",justifyContent:"space-between"},children:o.jsx("label",{style:{display:"block",color:"#888",marginBottom:"5px"},children:p("rotation_speed")})}),o.jsx("input",{type:"range",min:"0",max:"10",step:"0.1",value:e.rotationSpeed||1,onChange:x=>s(e.id,{rotationSpeed:parseFloat(x.target.value)}),onPointerDown:x=>{x.target.dataset.startSpeed=(e.rotationSpeed||1).toString()},onPointerUp:x=>{const D=parseFloat(x.target.dataset.startSpeed||"0"),I=e.rotationSpeed||1;!isNaN(D)&&D!==I&&l({type:"UPDATE",id:e.id,previous:{rotationSpeed:D},current:{rotationSpeed:I}})},className:"lab-range",style:{marginBottom:"5px",width:"100%"}}),o.jsx(to,{value:e.rotationSpeed||1,onChange:x=>s(e.id,{rotationSpeed:x}),onCommit:(x,D)=>{x!==D&&l({type:"UPDATE",id:e.id,previous:{rotationSpeed:x},current:{rotationSpeed:D}})},min:0,step:.1,style:{width:"100%",boxSizing:"border-box",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",padding:"6px",borderRadius:"4px",color:"white"}})]}),o.jsxs("div",{style:{marginBottom:"5px"},children:[o.jsx("label",{style:{display:"block",color:"#888",marginBottom:"5px"},children:p("color")}),o.jsxs("div",{style:{display:"flex",gap:"8px"},children:[o.jsx("input",{type:"color",value:e.color,onChange:x=>s(e.id,{color:x.target.value}),onFocus:x=>{x.target.dataset.startColor=e.color},onBlur:x=>{const D=x.target.dataset.startColor;D&&D!==e.color&&l({type:"UPDATE",id:e.id,previous:{color:D},current:{color:e.color}})},style:{width:"40px",height:"36px",border:"none",borderRadius:"4px",padding:0,cursor:"pointer",background:"transparent"}}),o.jsx("input",{type:"text",value:e.color,onChange:x=>s(e.id,{color:x.target.value}),onFocus:x=>{x.target.dataset.startColor=e.color},onBlur:x=>{const D=x.target.dataset.startColor;D&&D!==e.color&&l({type:"UPDATE",id:e.id,previous:{color:D},current:{color:e.color}})},style:{flex:1,background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.2)",padding:"6px",borderRadius:"4px",color:"white"}})]})]}),o.jsx("hr",{style:{borderColor:"rgba(255,255,255,0.1)",width:"100%",margin:"10px 0"}}),o.jsxs("button",{onClick:()=>u(!h),style:{background:"transparent",border:"none",color:"#60a5fa",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"5px 0",cursor:"pointer",fontSize:"12px",fontWeight:600,letterSpacing:"1px"},children:["VECTORS & PHYSICS",h?o.jsx(lo,{size:14}):o.jsx(co,{size:14})]}),e.isStar&&o.jsxs("div",{style:{marginTop:"10px"},children:[o.jsx(eo,{label:"Position",value:e.position,onChange:x=>s(e.id,{position:x}),onCommit:(x,D)=>{x.equals(D)||l({type:"UPDATE",id:e.id,previous:{position:x},current:{position:D}})}}),o.jsx("div",{style:{height:"10px"}}),o.jsx(eo,{label:"Velocity",value:e.velocity,onChange:x=>s(e.id,{velocity:x}),onCommit:(x,D)=>{x.equals(D)||l({type:"UPDATE",id:e.id,previous:{velocity:x},current:{velocity:D}})}})]}),o.jsxs("div",{style:{marginTop:"10px",display:"flex",gap:"8px"},children:[o.jsx("button",{onClick:()=>r(i===e.id?null:e.id),style:{flex:1,padding:"8px",background:i===e.id?"rgba(34, 170, 255, 0.3)":"rgba(255, 255, 255, 0.1)",border:`1px solid ${i===e.id?"#22aaff":"rgba(255, 255, 255, 0.2)"} `,borderRadius:"6px",color:"white",cursor:"pointer",transition:"all 0.2s",fontWeight:500,fontSize:"0.9rem"},children:i===e.id?p("stop_following"):p("camera_follow")}),!e.isFixed&&o.jsx("button",{onClick:()=>v(!0),style:{padding:"8px",background:"rgba(255, 64, 80, 0.2)",border:"1px solid rgba(255, 64, 80, 0.4)",borderRadius:"6px",color:"#ff4050",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},title:p("remove"),children:o.jsx(at,{size:16})})]}),e.isStar&&e.mass>1e5&&o.jsx("div",{style:{marginTop:"8px"},children:o.jsxs("button",{onClick:()=>y(!0),disabled:b,style:{width:"100%",padding:"10px",background:b?"linear-gradient(135deg, rgba(120, 120, 120, 0.15), rgba(80, 80, 80, 0.12))":"linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(147, 51, 234, 0.2))",border:b?"1px solid rgba(255, 255, 255, 0.14)":"1px solid rgba(239, 68, 68, 0.4)",borderRadius:"6px",color:b?"rgba(255,255,255,0.5)":"#ef4444",cursor:b?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",fontWeight:600,fontSize:"0.95rem",transition:"all 0.2s"},onMouseEnter:x=>{b||(x.currentTarget.style.background="linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(147, 51, 234, 0.3))",x.currentTarget.style.borderColor="rgba(239, 68, 68, 0.6)")},onMouseLeave:x=>{b||(x.currentTarget.style.background="linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(147, 51, 234, 0.2))",x.currentTarget.style.borderColor="rgba(239, 68, 68, 0.4)")},children:[o.jsx(Ie,{size:18}),p("supernova_button")]})})]}),o.jsx(He,{isOpen:m,title:p("delete_title"),message:p("delete_message").replace("{name}",e.name),onConfirm:()=>{n(e.id),g(`${e.name} deleted`,"success"),t(null),v(!1)},onCancel:()=>v(!1),danger:!0,confirmText:p("delete_confirm"),cancelText:p("delete_cancel")}),o.jsx(He,{isOpen:w,title:`⭐ ${p("supernova_modal_title")}`,message:p("supernova_modal_message").replace("{name}",e.name).replace("{remnant}",R),onConfirm:()=>{a(e.id),g(p("supernova_toast_triggered").replace("{name}",e.name),"success"),y(!1)},onCancel:()=>y(!1),danger:!0,confirmText:p("supernova_modal_confirm"),cancelText:p("supernova_modal_cancel")})]})},Fi=()=>{const{t:e}=ie(),s=S(r=>r.selectedBodyId),n=S(r=>r.bodies).find(r=>r.id===s);return n?o.jsx(Ui,{body:n}):o.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:"#6b7280",textAlign:"center",padding:"20px"},children:[o.jsx($e,{size:48,style:{marginBottom:"15px",opacity:.5}}),o.jsx("p",{style:{fontSize:"0.9rem"},children:e("select_body_msg")})]})},Li=e=>{switch(e){case"classic":return o.jsx(xt,{color:"#fcd34d"});case"multi-star":return o.jsx(_t,{color:"#60a5fa",fill:"#60a5fa",fillOpacity:.2});case"choreography":return o.jsx(mr,{color:"#a78bfa"});case"catastrophic":return o.jsx(lt,{color:"#ef4444"});default:return o.jsx(_t,{color:"#94a3b8"})}},Lo=({isOpen:e,onClose:s})=>{const t=S(y=>y.loadStarSystem),n=S(y=>y.currentSystemId),r=S(y=>y.currentSystemMode),[i,l]=_.useState({}),[a,c]=_.useState(null),[d,f]=_.useState(!1),[p,g]=_.useState(typeof window<"u"&&window.innerWidth<768),h=typeof navigator<"u"&&navigator.language.startsWith("ja");T.useEffect(()=>{const y=()=>g(window.innerWidth<768);return window.addEventListener("resize",y),()=>window.removeEventListener("resize",y)},[]),T.useEffect(()=>{e&&n&&r&&l(y=>({...y,[n]:r}))},[e,n,r]);const u=()=>{f(!0),setTimeout(()=>{f(!1),s()},300)};if(!e)return null;const m=y=>{const M=i[y];t(y,M),s()},v=(y,M)=>{l(k=>({...k,[y]:M}))},w=o.jsxs("div",{style:{position:"fixed",top:p?"auto":"10px",left:p?"8px":"auto",bottom:p?"8px":"auto",right:p?"8px":"10px",width:p?"calc(100% - 16px)":"900px",height:p?"auto":"calc(100vh - 20px)",maxHeight:p?"50vh":"800px",minHeight:p?"240px":"auto",background:"rgba(20, 20, 30, 0.92)",backdropFilter:"blur(16px)",border:"1px solid rgba(255, 255, 255, 0.15)",borderRadius:p?"12px":"8px",display:"flex",flexDirection:"column",boxShadow:p?"0 -4px 20px rgba(0, 0, 0, 0.5)":"0 8px 32px rgba(0, 0, 0, 0.4)",overflow:"hidden",zIndex:2e3,transition:"all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",transform:d?p?"translateY(calc(100% + 16px))":"translateX(calc(100% + 20px))":p?"translateY(0)":"translateX(0)",opacity:d?0:1,animation:d?"none":p?"slideUpIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)":"slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"},children:[o.jsxs("div",{style:{padding:p?"12px 16px":"16px 24px",borderBottom:"1px solid rgba(255, 255, 255, 0.08)",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(0,0,0,0.1)",flexShrink:0,minHeight:p?"56px":"64px"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[o.jsx(uo,{size:p?18:20,color:"#3b82f6"}),o.jsx("h2",{style:{margin:0,color:"white",fontSize:p?"1rem":"1.1rem",fontWeight:600,letterSpacing:"0.02em"},children:h?"恒星系ギャラリー":"Star System Gallery"})]}),o.jsx("button",{onClick:u,style:{background:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.12)",borderRadius:"8px",color:"rgba(255, 255, 255, 0.6)",cursor:"pointer",fontSize:p?"20px":"24px",lineHeight:1,width:p?"32px":"36px",height:p?"32px":"36px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",fontWeight:300},onMouseEnter:y=>{y.currentTarget.style.background="rgba(255, 255, 255, 0.15)",y.currentTarget.style.color="rgba(255, 255, 255, 0.9)",y.currentTarget.style.borderColor="rgba(255, 255, 255, 0.2)"},onMouseLeave:y=>{y.currentTarget.style.background="rgba(255, 255, 255, 0.08)",y.currentTarget.style.color="rgba(255, 255, 255, 0.6)",y.currentTarget.style.borderColor="rgba(255, 255, 255, 0.12)"},children:"×"})]}),o.jsx("div",{style:{padding:p?"12px":"14px",overflowY:"auto",display:"grid",gridTemplateColumns:p?"1fr":"repeat(auto-fill, minmax(220px, 1fr))",gridAutoRows:"1fr",gap:"10px",flex:1},children:Ro.map(y=>{const M=n===y.id,k=a===y.id,z=i[y.id]||(y.modes?.[0]?.id??void 0),b=M&&y.modes&&z!==r,R=M&&(!y.modes||z===r);return o.jsxs("div",{onMouseEnter:()=>c(y.id),onMouseLeave:()=>c(null),style:{background:M?"linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 58, 138, 0.2) 100%)":"rgba(255, 255, 255, 0.03)",border:M?"1px solid rgba(59, 130, 246, 0.5)":k?"1px solid rgba(255, 255, 255, 0.2)":"1px solid rgba(255, 255, 255, 0.08)",borderRadius:"8px",padding:"12px",cursor:"default",transition:"all 0.2s ease",transform:k?"translateY(-2px)":"none",boxShadow:k?"0 10px 25px -5px rgba(0, 0, 0, 0.3)":"none",display:"flex",flexDirection:"column",height:"100%"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:p?"8px":"10px"},children:[o.jsx("div",{style:{width:p?"32px":"36px",height:p?"32px":"36px",borderRadius:"7px",background:M?"rgba(59, 130, 246, 0.2)":"rgba(255, 255, 255, 0.05)",display:"flex",justifyContent:"center",alignItems:"center",border:"1px solid rgba(255, 255, 255, 0.05)",flexShrink:0},children:T.cloneElement(Li(y.category),{size:p?18:20})}),o.jsxs("div",{style:{flex:1,minWidth:0},children:[o.jsx("h3",{style:{margin:"0 0 2px 0",color:"white",fontSize:p?"0.85rem":"0.9rem",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:h?y.nameJa:y.name}),o.jsx("span",{style:{fontSize:p?"0.6rem":"0.65rem",color:M?"#60a5fa":"#64748b",fontWeight:500},children:y.category.toUpperCase()})]})]}),o.jsx("p",{style:{margin:p?"0 0 8px 0":"0 0 10px 0",color:"#94a3b8",fontSize:p?"0.7rem":"0.75rem",lineHeight:1.4,flex:1,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",textOverflow:"ellipsis"},children:h?y.descriptionJa:y.description}),y.modes&&o.jsxs("div",{style:{marginBottom:p?"8px":"10px"},children:[o.jsx("label",{style:{display:"block",fontSize:p?"0.6rem":"0.65rem",color:"#64748b",marginBottom:p?"5px":"6px",fontWeight:600},children:h?"モード選択":"SELECT MODE"}),o.jsx("div",{style:{display:"flex",background:"rgba(0, 0, 0, 0.3)",borderRadius:"5px",padding:"2px",gap:"2px"},children:y.modes.map(j=>{const C=z===j.id;return o.jsx("button",{onClick:x=>{x.stopPropagation(),v(y.id,j.id)},style:{flex:1,padding:p?"4px 3px":"5px 4px",fontSize:p?"0.6rem":"0.65rem",fontWeight:500,background:C?"rgba(55, 65, 81, 0.8)":"transparent",color:C?"white":"#94a3b8",border:"none",borderRadius:"4px",cursor:"pointer",transition:"all 0.2s",borderBottom:C?"2px solid #3b82f6":"2px solid transparent"},children:h?j.nameJa:j.name},j.id)})})]}),o.jsx("button",{onClick:j=>{j.stopPropagation(),m(y.id)},disabled:R,style:{width:"100%",padding:p?"7px":"8px",background:R?"rgba(16, 185, 129, 0.1)":b?"#3b82f6":"white",color:R?"#10b981":b?"white":"black",border:R?"1px solid rgba(16, 185, 129, 0.3)":"none",borderRadius:"6px",cursor:R?"default":"pointer",fontWeight:600,fontSize:p?"0.75rem":"0.8rem",transition:"all 0.2s",display:"flex",justifyContent:"center",alignItems:"center",gap:p?"5px":"6px"},onMouseEnter:j=>{R||(j.currentTarget.style.background=b?"#2563eb":"#e2e8f0")},onMouseLeave:j=>{R||(j.currentTarget.style.background=b?"#3b82f6":"white")},children:R?o.jsxs(o.Fragment,{children:[o.jsx(po,{size:p?13:14}),h?"読み込み済み":"Active"]}):b?o.jsxs(o.Fragment,{children:[o.jsx(lt,{size:p?13:14}),h?"モード切替":"Switch Mode"]}):o.jsxs(o.Fragment,{children:[o.jsx(lt,{size:p?13:14}),h?"シミュレーション開始":"Launch Simulation"]})})]},y.id)})})]});return mt.createPortal(w,document.body)};if(typeof document<"u"){const e="gallery-modal-animations";if(!document.getElementById(e)&&!document.getElementById("help-modal-animations")){const s=document.createElement("style");s.id=e,s.textContent=`
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
        `,document.head.appendChild(s)}}const ce=T.forwardRef(({variant:e="secondary",size:s="md",leftIcon:t,rightIcon:n,iconOnly:r=!1,fullWidth:i=!1,loading:l=!1,disabled:a,className:c="",children:d,style:f,...p},g)=>{const h=["btn",`btn-${e}`,s!=="md"&&`btn-${s}`,r&&"btn-icon",i&&"btn-full",c].filter(Boolean).join(" "),u=s==="sm"?14:s==="lg"?20:16;return o.jsxs("button",{ref:g,className:h,disabled:a||l,style:f,...p,children:[l&&o.jsx("span",{className:"btn-spinner","aria-hidden":"true",style:{display:"inline-block",animation:"spin 1s linear infinite"},children:"⟳"}),!l&&t&&o.jsx(t,{size:u,"aria-hidden":"true"}),!r&&d,!l&&n&&o.jsx(n,{size:u,"aria-hidden":"true"})]})});ce.displayName="Button";if(typeof document<"u"){const e=document.createElement("style");e.textContent=`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,document.head.appendChild(e)}const st=({title:e,defaultOpen:s=!0,icon:t,children:n,className:r="",onToggle:i})=>{const[l,a]=_.useState(s),c=()=>{const d=!l;a(d),i?.(d)};return o.jsxs("div",{className:`accordion ${r}`,children:[o.jsxs("button",{className:"accordion-header",onClick:c,"aria-expanded":l,type:"button",children:[o.jsxs("span",{className:"accordion-title",children:[t&&o.jsx(t,{size:16,className:"accordion-icon","aria-hidden":"true"}),e]}),o.jsx("span",{className:"accordion-toggle","aria-hidden":"true",children:l?o.jsx(lo,{size:16}):o.jsx(co,{size:16})})]}),l&&o.jsx("div",{className:"accordion-content",children:n})]})},it=({items:e,label:s})=>o.jsxs("div",{className:"checkbox-group",children:[s&&o.jsx("div",{className:"checkbox-group-label",children:s}),o.jsx("div",{className:"checkbox-group-items",children:e.map(t=>o.jsxs("label",{className:`checkbox-wrapper ${t.disabled?"disabled":""}`,children:[o.jsx("input",{type:"checkbox",checked:t.checked,onChange:n=>t.onChange(n.target.checked),disabled:t.disabled}),o.jsx("span",{className:"checkbox-label",children:t.label}),t.warning&&o.jsx("span",{title:"High performance cost",style:{marginLeft:"auto",display:"flex",alignItems:"center"},children:o.jsx(mo,{size:14,className:"checkbox-icon-warning",style:{color:"var(--color-warning)"}})}),t.badge&&o.jsxs("span",{className:`badge badge-${t.badgeType||"primary"} badge-sm`,style:{marginLeft:"auto"},children:[t.badgeType==="success"&&o.jsx(Ie,{size:10,fill:"currentColor"}),t.badge]})]},t.id))})]}),Oi=({content:e,children:s,position:t="top",delay:n=300,disabled:r=!1})=>{const[i,l]=_.useState(!1),[a,c]=_.useState({x:0,y:0}),d=_.useRef(null),f=_.useRef(null),p=()=>{r||(d.current=window.setTimeout(()=>{if(f.current){const h=f.current.getBoundingClientRect();c({x:h.left+h.width/2,y:h.top+h.height/2}),l(!0)}},n))},g=()=>{d.current&&(clearTimeout(d.current),d.current=null),l(!1)};return _.useEffect(()=>()=>{d.current&&clearTimeout(d.current)},[]),o.jsxs(o.Fragment,{children:[o.jsx("div",{ref:f,onMouseEnter:p,onMouseLeave:g,style:{display:"inline-block"},children:s}),i&&!r&&o.jsxs("div",{className:`tooltip tooltip-${t}`,style:{left:`${a.x}px`,top:`${a.y}px`},children:[o.jsx("div",{className:"tooltip-content",children:e}),o.jsx("div",{className:"tooltip-arrow"})]})]})},Gi=()=>{const e=S(b=>b.simulationState),s=S(b=>b.timeScale),t=S(b=>b.setSimulationState),n=S(b=>b.setTimeScale),r=S(b=>b.reset),i=S(b=>b.followingBodyId),l=S(b=>b.cameraMode),a=S(b=>b.setCameraMode),c=S(b=>b.undo),d=S(b=>b.redo),f=S(b=>b.historyIndex),p=S(b=>b.history),g=S(b=>b.userMode),h=S(b=>b.setUserMode),{t:u}=ie(),[m,v]=_.useState(!1),w=g==="beginner",y=()=>{t(e==="running"?"paused":"running")},M=[{id:"grid",label:u("show_grid"),checked:S(b=>b.showGrid),onChange:()=>S.getState().toggleGrid()},{id:"prediction",label:u("show_prediction"),checked:S(b=>b.showPrediction),onChange:()=>S.getState().togglePrediction(),warning:!0},{id:"realistic",label:u("show_realistic"),checked:S(b=>b.showRealisticVisuals),onChange:()=>S.getState().toggleRealisticVisuals()}],k=[{id:"gravity",label:u("show_gravity_field"),checked:S(b=>b.showGravityField),onChange:()=>S.getState().toggleGravityField()},{id:"habitable",label:u("show_habitable"),checked:S(b=>b.showHabitableZone),onChange:()=>S.getState().toggleHabitableZone()},{id:"realistic_distances",label:u("show_realistic_distances"),checked:S(b=>b.useRealisticDistances),onChange:()=>S.getState().toggleRealisticDistances()}],z=[{id:"multithreading",label:u("show_multithreading"),checked:S(b=>b.useMultithreading),onChange:()=>S.getState().toggleMultithreading(),disabled:!S.getState().isWorkerSupported,badge:S.getState().isWorkerSupported?"Available":"N/A",badgeType:S.getState().isWorkerSupported?"success":void 0},{id:"gpu",label:u("show_gpu"),checked:S(b=>b.useGPU),onChange:()=>S.getState().toggleGPU(),disabled:!S(b=>b.isGPUSupported),badge:S(b=>b.isGPUSupported)?"Available":"N/A",badgeType:S(b=>b.isGPUSupported)?"success":void 0},{id:"performance",label:u("show_performance"),checked:S(b=>b.showPerformance),onChange:()=>S.getState().togglePerformance()}];return o.jsxs("div",{className:"simulation-controls",children:[o.jsx("div",{className:"section-header",children:o.jsx(St,{topic:"controls"})}),o.jsx("div",{className:"section",style:{marginBottom:"12px"},children:o.jsx(Oi,{content:w?"上級者モードに切り替え（全機能表示）":"初心者モードに切り替え（基本機能のみ）",children:o.jsx(ce,{variant:"ghost",leftIcon:w?fr:hr,onClick:()=>h(w?"advanced":"beginner"),fullWidth:!0,size:"sm",children:w?"上級者モード":"初心者モード"})})}),o.jsxs("div",{className:"section",children:[o.jsxs("div",{className:"flex gap-sm",children:[o.jsx(ce,{variant:e==="running"?"danger":"success",leftIcon:e==="running"?fo:ho,onClick:y,fullWidth:!0,children:u(e==="running"?"pause":"resume")}),o.jsx(ce,{variant:"secondary",leftIcon:go,onClick:r,iconOnly:!0,title:u("reset")})]}),o.jsxs("div",{className:"flex gap-sm",style:{marginTop:"8px"},children:[o.jsx(ce,{variant:"ghost",leftIcon:gr,onClick:c,disabled:f<=0,fullWidth:!0,size:"sm",title:"Undo (Ctrl+Z)",children:"Undo"}),o.jsx(ce,{variant:"ghost",leftIcon:vr,onClick:d,disabled:f>=p.length,fullWidth:!0,size:"sm",title:"Redo (Ctrl+Shift+Z)",children:"Redo"})]}),o.jsx(ce,{variant:"secondary",leftIcon:xr,onClick:()=>v(!0),fullWidth:!0,style:{marginTop:"8px"},children:u("star_system_gallery")}),o.jsxs("div",{style:{marginTop:"12px"},children:[o.jsxs("label",{className:"text-sm text-secondary",children:[u("time_scale"),": ",s.toFixed(1),"x"]}),o.jsx("input",{type:"range",min:"0.1",max:"5.0",step:"0.1",value:s,onChange:b=>n(parseFloat(b.target.value)),style:{width:"100%",cursor:"pointer",accentColor:"var(--color-primary-500)",marginTop:"4px"}})]})]}),o.jsx(st,{title:"表示設定",icon:ao,defaultOpen:!0,children:o.jsx(it,{items:M})}),!w&&o.jsx(st,{title:"詳細設定",icon:vt,defaultOpen:!1,children:o.jsx(it,{items:k})}),!w&&o.jsx(st,{title:"パフォーマンス",icon:Ie,defaultOpen:!1,children:o.jsx(it,{items:z})}),o.jsxs("div",{className:"section",style:{marginTop:"12px"},children:[o.jsx("div",{className:"section-title",style:{marginBottom:"8px"},children:"カメラモード"}),o.jsx("div",{className:"flex gap-xs",style:{flexWrap:"wrap"},children:[{id:"free",label:u("camera_mode_free")},{id:"sun_lock",label:u("camera_mode_sun")},{id:"surface_lock",label:u("camera_mode_surface")}].map(b=>o.jsx("button",{onClick:()=>i&&a(b.id),disabled:!i&&b.id!=="free",style:{flex:"1 0 80px",padding:"6px 8px",fontSize:"0.75rem",background:l===b.id?"var(--color-primary-500)":"rgba(255,255,255,0.1)",color:"white",border:l===b.id?"1px solid var(--color-primary-400)":"1px solid var(--color-border)",borderRadius:"var(--radius-sm)",cursor:i?"pointer":"not-allowed",opacity:!i&&b.id!=="free"?.5:1,transition:"all 0.2s",textAlign:"center",fontWeight:l===b.id?600:400},title:b.label,children:b.label},b.id))})]}),o.jsx(Lo,{isOpen:m,onClose:()=>v(!1)})]})},Wi=()=>o.jsxs("div",{role:"tabpanel",id:"controls-panel","aria-labelledby":"controls-tab",style:{padding:"20px"},children:[o.jsx(Gi,{}),o.jsx(Ti,{})]}),Vi=({activeTab:e})=>o.jsxs("div",{className:"tab-content custom-scrollbar",children:[e==="controls"&&o.jsx(Wi,{}),e==="bodies"&&o.jsx("div",{role:"tabpanel",id:"bodies-panel","aria-labelledby":"bodies-tab",children:o.jsx(Ni,{})}),e==="inspector"&&o.jsx("div",{role:"tabpanel",id:"inspector-panel","aria-labelledby":"inspector-tab",children:o.jsx(Fi,{})})]}),Hi="0.6.0",qi={version:Hi},$i=({isOpen:e,onClose:s})=>{const{t}=ie(),[n,r]=T.useState("controls"),[i,l]=T.useState(!1),[a,c]=T.useState(window.innerWidth<768);T.useEffect(()=>{const f=()=>c(window.innerWidth<768);return window.addEventListener("resize",f),()=>window.removeEventListener("resize",f)},[]);const d=()=>{l(!0),setTimeout(()=>{l(!1),s()},300)};return e?mt.createPortal(o.jsxs("div",{style:{position:"fixed",top:a?"auto":"10px",left:a?"8px":"auto",bottom:a?"8px":"auto",right:a?"8px":"10px",width:a?"calc(100% - 16px)":"700px",height:a?"auto":"calc(100vh - 20px)",maxHeight:a?"50vh":"800px",minHeight:a?"240px":"auto",background:"rgba(20, 20, 30, 0.92)",backdropFilter:"blur(16px)",border:"1px solid rgba(255, 255, 255, 0.15)",borderRadius:a?"12px":"8px",display:"flex",flexDirection:"column",boxShadow:a?"0 -4px 20px rgba(0, 0, 0, 0.5)":"0 8px 32px rgba(0, 0, 0, 0.4)",color:"white",overflow:"hidden",zIndex:2e3,transition:"all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",transform:i?a?"translateY(calc(100% + 16px))":"translateX(calc(100% + 20px))":a?"translateY(0)":"translateX(0)",opacity:i?0:1,animation:i?"none":a?"slideUpIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)":"slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"},children:[o.jsxs("div",{style:{padding:a?"12px 16px":"16px 24px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,0.1)",flexShrink:0,minHeight:a?"56px":"64px"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[o.jsx(yt,{size:a?18:20,color:"#3b82f6"}),o.jsx("h2",{style:{margin:0,fontSize:a?"1rem":"1.1rem",fontWeight:600,letterSpacing:"0.02em"},children:t("help_title")})]}),o.jsx("button",{onClick:d,style:{background:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.12)",borderRadius:"8px",color:"rgba(255, 255, 255, 0.6)",cursor:"pointer",fontSize:a?"20px":"24px",lineHeight:1,width:a?"32px":"36px",height:a?"32px":"36px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",fontWeight:300},onMouseEnter:f=>{f.currentTarget.style.background="rgba(255, 255, 255, 0.15)",f.currentTarget.style.color="rgba(255, 255, 255, 0.9)",f.currentTarget.style.borderColor="rgba(255, 255, 255, 0.2)"},onMouseLeave:f=>{f.currentTarget.style.background="rgba(255, 255, 255, 0.08)",f.currentTarget.style.color="rgba(255, 255, 255, 0.6)",f.currentTarget.style.borderColor="rgba(255, 255, 255, 0.12)"},children:"×"})]}),o.jsxs("div",{style:{display:"flex",flex:1,minHeight:0,flexDirection:a?"column":"row"},children:[o.jsxs("div",{style:{width:a?"100%":"200px",minWidth:a?"100%":"200px",borderRight:a?"none":"1px solid rgba(255,255,255,0.1)",borderBottom:a?"1px solid rgba(255,255,255,0.1)":"none",background:"rgba(0,0,0,0.15)",padding:a?"0":"12px 0",display:"flex",flexDirection:a?"row":"column",flexShrink:0,overflowX:a?"auto":"hidden"},children:[o.jsx(oo,{active:n==="controls",onClick:()=>r("controls"),icon:o.jsx(Ct,{size:16}),label:t("controls_header"),isMobile:a}),o.jsx(oo,{active:n==="changelog",onClick:()=>r("changelog"),icon:o.jsx(yr,{size:16}),label:t("changelog_header"),isMobile:a}),!a&&o.jsx("div",{style:{flex:1}})," ",o.jsx("div",{style:{padding:a?"0 12px 12px":"12px",borderTop:a?"none":"1px solid rgba(255,255,255,0.05)",display:a?"flex":"block",alignItems:"center",marginLeft:a?"auto":0},children:o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",fontSize:a?"0.7rem":"0.75rem",color:"#64748b",background:"rgba(255,255,255,0.04)",padding:a?"6px 10px":"8px 12px",borderRadius:"6px",justifyContent:"center"},children:[o.jsx(vo,{size:a?12:14}),o.jsxs("span",{style:{fontFamily:"var(--font-mono)"},children:["v",qi.version]})]})})]}),o.jsxs("div",{style:{flex:1,padding:a?"16px":"24px",overflowY:"auto"},children:[n==="controls"&&o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"20px"},children:[o.jsxs("div",{children:[o.jsx("h3",{style:{margin:"0 0 12px 0",fontSize:"0.85rem",color:"#64748b",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase"},children:"カメラ操作"}),o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[o.jsx(Fe,{icon:o.jsx(br,{size:18}),label:t("ctrl_rotate"),desc:t("ctrl_rotate_desc")}),o.jsx(Fe,{icon:o.jsx(Sr,{size:18}),label:t("ctrl_pan"),desc:t("ctrl_pan_desc")}),o.jsx(Fe,{icon:o.jsx(wr,{size:18}),label:t("ctrl_zoom"),desc:t("ctrl_zoom_desc")}),o.jsx(Fe,{icon:o.jsx(Ct,{size:18}),label:t("ctrl_select"),desc:t("ctrl_select_desc")})]})]}),o.jsxs("div",{children:[o.jsx("h3",{style:{margin:"0 0 12px 0",fontSize:"0.85rem",color:"#64748b",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase"},children:"キーボードショートカット"}),o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[o.jsx(Pe,{shortcut:"Alt + 1",desc:"コントロールタブに切り替え"}),o.jsx(Pe,{shortcut:"Alt + 2",desc:"天体リストタブに切り替え"}),o.jsx(Pe,{shortcut:"Alt + 3",desc:"インスペクタータブに切り替え"}),o.jsx(Pe,{shortcut:"Alt + F",desc:"天体検索にフォーカス"}),o.jsx(Pe,{shortcut:"Ctrl + Z",desc:"元に戻す (Undo)"}),o.jsx(Pe,{shortcut:"Ctrl + Shift + Z",desc:"やり直す (Redo)"})]})]})]}),n==="changelog"&&o.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"20px"},children:Yi(t).map((f,p)=>o.jsxs("div",{children:[o.jsxs("h4",{style:{margin:"0 0 8px 0",fontSize:"0.9rem",color:f.isCurrent?"#10b981":"#64748b",display:"flex",alignItems:"center",gap:"8px"},children:[f.title||`v${f.version}`,f.isCurrent&&o.jsx("span",{style:{fontSize:"0.7rem",color:"#94a3b8",fontWeight:"normal"},children:"Current"})]}),o.jsx("div",{style:{background:"rgba(255,255,255,0.02)",borderRadius:"8px",padding:"16px",border:"1px solid rgba(255,255,255,0.05)",opacity:p>2?.7:1},children:o.jsx("ul",{style:{paddingLeft:"20px",margin:0,color:"#e2e8f0",lineHeight:1.8,fontSize:"0.9rem"},children:f.changes.map((g,h)=>o.jsxs("li",{style:{marginBottom:h===f.changes.length-1?0:"8px"},children:[o.jsx(Zi,{type:g.type}),g.content]},h))})})]},f.version))})]})]})]}),document.body):null},oo=({active:e,onClick:s,icon:t,label:n,isMobile:r})=>o.jsxs("button",{onClick:s,style:{display:"flex",alignItems:"center",gap:r?"6px":"10px",padding:r?"10px 12px":"10px 20px",width:r?"auto":"100%",flex:r?1:"none",justifyContent:r?"center":"flex-start",background:e?"rgba(59, 130, 246, 0.12)":"transparent",border:"none",borderLeft:!r&&e?"3px solid #3b82f6":"3px solid transparent",borderBottom:r&&e?"2px solid #3b82f6":"2px solid transparent",color:e?"#3b82f6":"#94a3b8",cursor:"pointer",fontSize:r?"0.8rem":"0.9rem",transition:"all 0.2s",whiteSpace:"nowrap",fontWeight:e?600:400},onMouseEnter:i=>{e||(i.currentTarget.style.background="rgba(255, 255, 255, 0.05)")},onMouseLeave:i=>{e||(i.currentTarget.style.background="transparent")},children:[t,n]}),Fe=({icon:e,label:s,desc:t})=>o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"16px",padding:"12px 16px",background:"rgba(255,255,255,0.02)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.03)",transition:"background 0.2s"},onMouseEnter:n=>n.currentTarget.style.background="rgba(255,255,255,0.05)",onMouseLeave:n=>n.currentTarget.style.background="rgba(255,255,255,0.02)",children:[o.jsx("div",{style:{color:"#3b82f6",opacity:.9},children:e}),o.jsxs("div",{style:{flex:1},children:[o.jsx("div",{style:{fontWeight:500,fontSize:"0.9rem",color:"#f1f5f9"},children:s}),o.jsx("div",{style:{fontSize:"0.8rem",color:"#94a3b8"},children:t})]})]}),Pe=({shortcut:e,desc:s})=>o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",background:"rgba(255,255,255,0.02)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.03)",transition:"background 0.2s"},onMouseEnter:t=>t.currentTarget.style.background="rgba(255,255,255,0.05)",onMouseLeave:t=>t.currentTarget.style.background="rgba(255,255,255,0.02)",children:[o.jsx("div",{style:{fontSize:"0.85rem",color:"#94a3b8"},children:s}),o.jsx("div",{style:{fontFamily:"var(--font-mono)",fontSize:"0.8rem",color:"#3b82f6",background:"rgba(59, 130, 246, 0.1)",padding:"4px 10px",borderRadius:"4px",border:"1px solid rgba(59, 130, 246, 0.2)",whiteSpace:"nowrap"},children:e})]}),Zi=({type:e})=>{if(e==="none")return null;let s="#94a3b8",t="Other";switch(e){case"new":s="#10b981",t="新機能";break;case"improve":s="#3b82f6",t="改善";break;case"fix":s="#a855f7",t="修正";break;case"remove":s="#ef4444",t="削除";break;case"tech":s="#f59e0b",t="技術";break}return o.jsx("span",{style:{color:s,fontWeight:"bold",fontSize:"0.75rem",border:`1px solid ${s}4d`,padding:"1px 4px",borderRadius:"4px",marginRight:"8px"},children:t})};if(typeof document<"u"){const e="help-modal-animations";if(!document.getElementById(e)){const s=document.createElement("style");s.id=e,s.textContent=`
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
        `,document.head.appendChild(s)}}const Yi=e=>[{version:"0.6.0",isCurrent:!0,changes:[{type:"improve",content:"統合サイドパネルによるUI刷新（タブ切替式・ラボモード統合）"},{type:"new",content:"惑星テクスチャのプロシージャル生成と星空のまたたき表現"},{type:"improve",content:"スムーズなカメラ切り替えアニメーションの追加"},{type:"fix",content:"リアル距離モード切替時のカメラドリフト修正"},{type:"improve",content:"重力レンズ効果の品質向上（深度対応）"}]},{version:"0.5.0",changes:[{type:"new",content:"天体衝突エフェクト（爆発・衝撃波・破片・熱輝）"},{type:"new",content:"ブラックホール連星プリセットの追加"},{type:"new",content:"ハビタブルゾーンの動的計算と表示"}]},{version:"0.4.1",changes:[{type:"improve",content:"リアル距離モードの時間進行速度調整 (8倍速)"},{type:"new",content:"重力場を表示する機能"},{type:"fix",content:"グリッド表示切り替え時のエラー修正"}]},{version:"0.4.0",title:e("cl_v0_4_0_title"),changes:[{type:"improve",content:e("cl_item_compact")},{type:"new",content:e("cl_item_zen")},{type:"tech",content:e("cl_item_ui")},{type:"new",content:e("cl_item_gallery")}]},{version:"0.3.0",title:e("cl_v0_3_0_title"),changes:[{type:"improve",content:e("cl_item_energy")},{type:"new",content:e("cl_item_hybrid")},{type:"tech",content:e("cl_item_cleanup")}]},{version:"0.2.1",title:e("cl_v0_2_1_title"),changes:[{type:"improve",content:e("cl_item_surface")},{type:"new",content:e("cl_item_perf")},{type:"tech",content:e("cl_item_physics")}]},{version:"0.2.0",changes:[{type:"improve",content:"惑星自転の精密化 (地球を基準とした1日1回転の正確な同期)"},{type:"new",content:"シミュレーション日付の表示 (経過日数・年数)"},{type:"fix",content:"カメラ初期位置と距離感の再調整・初期状態の同期修正"},{type:"tech",content:"WebGPU安定性の向上 (バッファ競合回避による安全性確保)"}]},{version:"0.1.0",changes:[{type:"new",content:"地表視点モード・軌道固定視点モード"},{type:"none",content:"パフォーマンス最適化 (Barnes-Hut, WebWorker, WebGPU準備)"},{type:"none",content:"UI改善 (ヘルプモーダル・操作ガイド)"}]}],Ki=({onOpenPanel:e,onSwitchToBodiesTab:s})=>{const t=S(C=>C.simulationState),n=S(C=>C.setSimulationState),r=S(C=>C.reset),i=S(C=>C.cameraMode),l=S(C=>C.setCameraMode),a=S(C=>C.toggleZenMode),c=S(C=>C.followingBodyId),d=S(C=>C.setFollowingBody),f=S(C=>C.bodies),p=S(C=>C.zenMode),[g,h]=T.useState(!1),[u,m]=T.useState(!1),[v,w]=T.useState(!1),{t:y}=ie();T.useEffect(()=>{const C=()=>w(window.innerWidth<=768);return C(),window.addEventListener("resize",C),()=>window.removeEventListener("resize",C)},[]);const k=v?f:f.slice(0,10),z=!v&&f.length>10,b=()=>{n(t==="running"?"paused":"running")},R=()=>{c&&l(i==="free"?"sun_lock":i==="sun_lock"?"surface_lock":"free")},j=()=>{s(),e()};return p?o.jsx("div",{className:"compact-controls-container zen-mode-container",style:{pointerEvents:"auto"},children:o.jsx("div",{className:"compact-toolbar",children:o.jsxs("button",{onClick:a,className:"compact-button",style:{color:"#aaddff"},title:"Exit Zen Mode",children:[o.jsx(_r,{size:18}),o.jsx("span",{className:"button-label",children:"Exit"})]})})}):o.jsxs("div",{className:"compact-controls-container",children:[o.jsxs("div",{className:"compact-toolbar",children:[o.jsxs("button",{onClick:e,className:"compact-button",title:y("open_controls"),children:[o.jsx(Cr,{size:20}),o.jsx("span",{className:"button-label",children:"Menu"})]}),o.jsxs("button",{onClick:()=>m(!0),className:"compact-button",title:y("help_title"),children:[o.jsx(yt,{size:20}),o.jsx("span",{className:"button-label",children:"Help"})]}),o.jsx("div",{className:"compact-divider"}),o.jsxs("button",{onClick:b,className:"compact-button",style:{color:t==="running"?"#ff4050":"#00ce7c"},title:y(t==="running"?"pause":"resume"),children:[t==="running"?o.jsx(fo,{size:20}):o.jsx(ho,{size:20}),o.jsx("span",{className:"button-label",children:t==="running"?"Pause":"Play"})]}),o.jsxs("button",{onClick:r,className:"compact-button",title:y("reset"),children:[o.jsx(go,{size:18}),o.jsx("span",{className:"button-label",children:"Reset"})]}),o.jsxs("button",{onClick:()=>h(!0),className:"compact-button",style:{color:"#44aaff"},title:y("star_system_gallery"),children:[o.jsx(uo,{size:20}),o.jsx("span",{className:"button-label",children:"Gallery"})]}),o.jsxs("button",{onClick:R,disabled:!c,className:"compact-button",style:{color:i==="free"?"white":"#3b82f6",cursor:c?"pointer":"not-allowed",opacity:c?1:.3},title:y("camera_mode"),children:[o.jsx(Mr,{size:20}),o.jsx("span",{className:"button-label",children:"Camera"})]}),o.jsx("div",{className:"compact-divider"}),o.jsxs("button",{onClick:a,className:"compact-button",style:{color:"#aaddff"},title:"Zen Mode",children:[o.jsx(kr,{size:18}),o.jsx("span",{className:"button-label",children:"Zen"})]}),o.jsx("div",{className:"compact-divider"}),o.jsxs("div",{className:v?"body-switcher-scrollable":"",children:[o.jsxs("button",{className:`compact-button body-button ${c?"":"active"}`,onClick:()=>d(null),title:"フリーカメラ",children:[o.jsx("span",{className:"body-indicator",style:{background:"#666"},children:o.jsx("span",{className:"body-name-short",children:"Fr"})}),o.jsx("span",{className:"button-label",children:"Free"})]}),k.map(C=>{const x=C.name.length>=2?C.name.charAt(0).toUpperCase()+C.name.charAt(1).toLowerCase():C.name.toUpperCase();return o.jsxs("button",{className:`compact-button body-button ${c===C.id?"active":""}`,onClick:()=>d(C.id),title:C.name,children:[o.jsx("span",{className:"body-indicator",style:{background:C.color,boxShadow:`0 0 8px ${C.color}`},children:o.jsx("span",{className:"body-name-short",children:x})}),o.jsx("span",{className:"button-label",children:C.name})]},C.id)})]}),z&&o.jsxs("button",{className:"compact-button more-button",onClick:j,title:`${f.length-10}個の天体を表示`,children:[o.jsx(jr,{size:16}),o.jsx("span",{className:"button-label",children:"More"})]})]}),o.jsx(Lo,{isOpen:g,onClose:()=>h(!1)}),o.jsx($i,{isOpen:u,onClose:()=>m(!1)})]})},Xi=({defaultTab:e="controls"})=>{const[s,t]=_.useState(e),[n,r]=_.useState(!0),i=S(a=>a.zenMode),l=S(a=>a.selectedBodyId);return _.useEffect(()=>{l&&(t("inspector"),n||r(!0))},[l]),_.useEffect(()=>{const a=c=>{const d=document.activeElement,f=d?.tagName==="INPUT"||d?.tagName==="TEXTAREA";if(c.altKey&&(c.key==="1"&&(t("controls"),c.preventDefault()),c.key==="2"&&(t("bodies"),c.preventDefault()),c.key==="3"&&(t("inspector"),c.preventDefault()),c.key==="f"&&(t("bodies"),c.preventDefault(),setTimeout(()=>{const p=document.querySelector(".lab-search input");p&&p.focus()},50))),!f&&(c.ctrlKey||c.metaKey)){const p=S.getState();c.key==="z"&&!c.shiftKey&&(p.undo(),c.preventDefault()),c.key==="z"&&c.shiftKey&&(p.redo(),c.preventDefault())}};return window.addEventListener("keydown",a),()=>window.removeEventListener("keydown",a)},[]),o.jsxs(o.Fragment,{children:[(!n||i)&&o.jsx(Ki,{onOpenPanel:()=>r(!0),onSwitchToBodiesTab:()=>t("bodies")}),o.jsxs("div",{className:`unified-side-panel ${!n||i?"collapsed":""}`,children:[o.jsx("div",{className:"panel-header",children:o.jsx("button",{className:"close-button",onClick:()=>r(!1),title:"パネルを閉じる",children:"×"})}),o.jsx(Ai,{activeTab:s,onChange:t}),o.jsx(Vi,{activeTab:s})]})]})},Le=[{title:"Orbit Simulatorへようこそ",description:"惑星軌道シミュレーターで、重力と天体の動きを体験しましょう。基本的な使い方をご紹介します。"},{title:"カメラ操作",description:"マウスドラッグで視点を回転、ホイールでズーム。天体をクリックして追跡モードに切り替えられます。"},{title:"シミュレーション制御",description:"コントロールパネルで再生/一時停止、時間スケール調整、表示設定の変更ができます。"},{title:"天体の追加と恒星系ギャラリー切り替え",description:"コントロールパネルの天体追加ボタンをクリックして新しい天体を追加できます。また、恒星系ギャラリーボタンを押して好きな世界を表示できます。"},{title:"モード選択",description:"初心者モードでは基本機能のみ表示、上級者モードでは全機能にアクセスできます。いつでも切り替え可能です。"}],Ji=()=>{const e=S(u=>u.hasSeenOnboarding),s=S(u=>u.setHasSeenOnboarding),t=S(u=>u.setUserMode),n=S(u=>u.setSimulationState),[r,i]=_.useState(0),[l,a]=_.useState("beginner");if(T.useEffect(()=>{e||n("paused")},[e,n]),e)return null;const c=r===0,d=r===Le.length-1,f=()=>{d?(t(l),s(!0),n("running")):i(u=>u+1)},p=()=>{c||i(u=>u-1)},g=()=>{t("beginner"),s(!0),n("running")},h=Le[r];return o.jsx("div",{className:"onboarding-backdrop",children:o.jsxs("div",{className:"onboarding-modal",children:[o.jsxs("div",{className:"onboarding-header",children:[o.jsxs("div",{className:"onboarding-logo",children:[o.jsx(Pr,{size:24}),o.jsx("span",{children:"Orbit Simulator"})]}),o.jsx("button",{className:"onboarding-close",onClick:g,title:"スキップ",children:o.jsx(Ze,{size:20})})]}),o.jsxs("div",{className:"onboarding-content",children:[o.jsx("div",{className:"onboarding-step-indicator",children:Le.map((u,m)=>o.jsx("div",{className:`onboarding-dot ${m===r?"active":""} ${m<r?"completed":""}`},m))}),o.jsx("h2",{className:"onboarding-title",children:h.title}),o.jsx("p",{className:"onboarding-description",children:h.description}),d&&o.jsxs("div",{className:"onboarding-mode-selection",children:[o.jsxs("button",{className:`mode-card ${l==="beginner"?"selected":""}`,onClick:()=>a("beginner"),children:[o.jsxs("div",{className:"mode-card-header",children:[o.jsx("div",{className:"mode-card-icon",children:"🌱"}),o.jsx("h3",{children:"初心者モード"})]}),o.jsx("p",{children:"基本的な機能のみ表示し、シンプルな操作で始められます"}),o.jsx("div",{className:"mode-card-badge",children:"おすすめ"})]}),o.jsxs("button",{className:`mode-card ${l==="advanced"?"selected":""}`,onClick:()=>a("advanced"),children:[o.jsxs("div",{className:"mode-card-header",children:[o.jsx("div",{className:"mode-card-icon",children:"🚀"}),o.jsx("h3",{children:"上級者モード"})]}),o.jsx("p",{children:"全ての機能と詳細設定にアクセスできます"})]})]})]}),o.jsxs("div",{className:"onboarding-footer",children:[o.jsx(ce,{variant:"ghost",onClick:p,leftIcon:zr,disabled:c,children:"戻る"}),o.jsxs("div",{className:"onboarding-progress",children:[r+1," / ",Le.length]}),o.jsx(ce,{variant:"primary",onClick:f,rightIcon:d?void 0:Rr,children:d?"始める":"次へ"})]})]})})},Qi=({children:e})=>{const[s,t]=_.useState([]),n=_.useCallback((i,l="info")=>{const a=Math.random().toString(36).substring(2,9);t(c=>[...c,{id:a,message:i,type:l}]),setTimeout(()=>{t(c=>c.filter(d=>d.id!==a))},3e3)},[]),r=_.useCallback(i=>{t(l=>l.filter(a=>a.id!==i))},[]);return o.jsxs(Uo.Provider,{value:{showToast:n},children:[e,mt.createPortal(o.jsx("div",{style:{position:"fixed",bottom:"24px",right:"24px",display:"flex",flexDirection:"column",gap:"8px",zIndex:9999,pointerEvents:"none"},children:s.map(i=>o.jsxs("div",{style:{pointerEvents:"auto",background:"rgba(20, 20, 30, 0.9)",backdropFilter:"blur(12px)",border:`1px solid ${i.type==="success"?"rgba(16, 185, 129, 0.3)":i.type==="error"?"rgba(239, 68, 68, 0.3)":"rgba(59, 130, 246, 0.3)"}`,borderRadius:"8px",padding:"12px 16px",minWidth:"300px",boxShadow:"0 4px 12px rgba(0, 0, 0, 0.3)",display:"flex",alignItems:"center",gap:"12px",color:"white",fontSize:"0.9rem",animation:"slideIn 0.3s ease-out forwards",transform:"translateX(0)",opacity:1},children:[o.jsxs("div",{style:{color:i.type==="success"?"#10b981":i.type==="error"?"#ef4444":"#3b82f6",display:"flex",alignItems:"center"},children:[i.type==="success"&&o.jsx(po,{size:18}),i.type==="error"&&o.jsx(mo,{size:18}),i.type==="info"&&o.jsx(vo,{size:18})]}),o.jsx("span",{style:{flex:1},children:i.message}),o.jsx("button",{onClick:()=>r(i.id),style:{background:"transparent",border:"none",color:"rgba(255, 255, 255, 0.4)",cursor:"pointer",padding:"4px",display:"flex",alignItems:"center"},children:o.jsx(Ze,{size:14})})]},i.id))}),document.body),o.jsx("style",{children:`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `})]})};class en extends _.Component{constructor(s){super(s),this.state={hasError:!1,error:null}}static getDerivedStateFromError(s){return{hasError:!0,error:s}}componentDidCatch(s,t){console.error("ErrorBoundary caught an error:",s,t)}render(){return this.state.hasError?this.props.fallback?this.props.fallback:o.jsxs("div",{style:{width:"100vw",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0a0a0a",color:"white",fontFamily:"Inter, sans-serif",padding:"20px",boxSizing:"border-box"},children:[o.jsx("h1",{style:{fontSize:"2rem",marginBottom:"1rem"},children:"⚠️ Something went wrong"}),o.jsx("p",{style:{fontSize:"1rem",opacity:.7,textAlign:"center",maxWidth:"600px"},children:"The orbit simulator encountered an error. This might be due to:"}),o.jsxs("ul",{style:{textAlign:"left",opacity:.7,marginTop:"1rem"},children:[o.jsx("li",{children:"WebGL not being supported on your device"}),o.jsx("li",{children:"Insufficient memory or GPU resources"}),o.jsx("li",{children:"A rendering error with visual effects"})]}),o.jsxs("div",{style:{marginTop:"2rem",padding:"1rem",background:"rgba(255,255,255,0.1)",borderRadius:"8px",maxWidth:"800px",overflow:"auto",fontSize:"0.9rem",fontFamily:"monospace"},children:[o.jsx("strong",{children:"Error details:"}),o.jsx("pre",{style:{margin:"0.5rem 0",whiteSpace:"pre-wrap"},children:this.state.error?.message||"Unknown error"})]}),o.jsx("button",{onClick:()=>window.location.reload(),style:{marginTop:"2rem",padding:"12px 24px",background:"#3b82f6",color:"white",border:"none",borderRadius:"8px",fontSize:"1rem",cursor:"pointer",fontWeight:600},children:"Reload Page"})]}):this.props.children}}const tn=(e,s,t)=>{if(e==="tidal-disruption")switch(s){case"intro":return"scenario_tidal_phase_intro";case"approach":return ds(t)?"scenario_tidal_phase_spaghettification":"scenario_tidal_phase_approach";case"breach":return"scenario_tidal_phase_breach";case"debris-capture":return"scenario_tidal_phase_capture";case"aftermath":return"scenario_tidal_phase_aftermath";case"complete":return"scenario_tidal_phase_complete";default:return"scenario_tidal_phase_intro"}switch(s){case"intro":return"scenario_supernova_phase_intro";case"countdown":return"scenario_supernova_phase_countdown";case"shock-breakout":return"scenario_supernova_phase_breakout";case"ejecta":return"scenario_supernova_phase_ejecta";case"remnant":return"scenario_supernova_phase_remnant";case"complete":return"scenario_supernova_phase_complete";default:return"scenario_supernova_phase_intro"}},on=(e,s)=>e==="tidal-disruption"?s?"scenario_tidal_outcome_captured":"scenario_tidal_outcome_none":s?s.type==="black_hole"?"scenario_supernova_outcome_black_hole":s.isCompactObject?"scenario_supernova_outcome_neutron_star":"scenario_supernova_outcome_none":"scenario_supernova_outcome_none",rn=()=>{const e=S(u=>u.scriptedScenario),s=S(u=>u.bodies),t=S(u=>u.currentSystemId),n=S(u=>u.currentSystemMode),r=S(u=>u.loadStarSystem),i=S(u=>u.selectBody),l=S(u=>u.setFollowingBody),a=S(u=>u.setCameraMode),c=S(u=>u.clearScriptedScenario),{t:d}=ie(),f=_.useMemo(()=>e.metricKind!=="countdown"||e.phase!=="countdown"?null:Math.max(1,Math.ceil(e.countdownRemainingMs/1e3)),[e.countdownRemainingMs,e.metricKind,e.phase]),p=_.useMemo(()=>e.metricKind!=="distance-ratio"||e.metricValue===null?null:e.metricValue.toFixed(2),[e.metricKind,e.metricValue]),g=e.outcomeBodyId?s.find(u=>u.id===e.outcomeBodyId)??null:null;if(!e.active)return null;const h=e.phase==="complete"&&!!g;return o.jsx("div",{style:{position:"absolute",inset:0,pointerEvents:"none",display:"flex",justifyContent:"center",alignItems:"flex-start",paddingTop:"32px"},children:o.jsxs("div",{style:{minWidth:"280px",maxWidth:"min(520px, calc(100vw - 48px))",padding:"18px 22px",borderRadius:"18px",background:"linear-gradient(180deg, rgba(5, 10, 20, 0.82), rgba(10, 18, 34, 0.68))",border:"1px solid rgba(186, 211, 255, 0.22)",boxShadow:"0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(122, 165, 255, 0.08)",backdropFilter:"blur(14px)",color:"white",textAlign:"center",pointerEvents:"auto"},children:[o.jsx("div",{style:{fontSize:"0.72rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#9fb9ff",marginBottom:"8px"},children:d("scenario_overlay_kicker")}),o.jsx("div",{style:{fontSize:"1.35rem",fontWeight:600,letterSpacing:"-0.02em"},children:d(tn(e.kind,e.phase,e.metricValue))}),f!==null&&o.jsxs("div",{style:{marginTop:"12px",fontSize:"3rem",fontWeight:700,lineHeight:1,color:"#f8fbff",textShadow:"0 0 18px rgba(186, 221, 255, 0.45)"},children:["T-",f]}),p!==null&&o.jsxs("div",{style:{marginTop:"14px",display:"grid",gap:"4px"},children:[o.jsx("div",{style:{fontSize:"0.78rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#9fb9ff"},children:d("scenario_metric_distance_ratio")}),o.jsxs("div",{style:{fontSize:"2.4rem",fontWeight:700,lineHeight:1,color:"#f8fbff",textShadow:"0 0 18px rgba(186, 221, 255, 0.25)"},children:[p,"x"]})]}),e.phase==="complete"&&o.jsx("div",{style:{marginTop:"12px",fontSize:"0.95rem",color:"#d7e0f7"},children:d(on(e.kind,g))}),e.phase==="complete"&&o.jsxs("div",{style:{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginTop:"18px"},children:[o.jsx("button",{onClick:()=>{t&&r(t,n??void 0)},style:{padding:"10px 16px",borderRadius:"999px",border:"1px solid rgba(173, 196, 255, 0.35)",background:"rgba(104, 138, 255, 0.18)",color:"white",cursor:"pointer"},children:d("scenario_action_replay")}),h&&o.jsx("button",{onClick:()=>{g&&(i(g.id),l(g.id),a("sun_lock"),c())},style:{padding:"10px 16px",borderRadius:"999px",border:"1px solid rgba(255, 255, 255, 0.18)",background:"rgba(255, 255, 255, 0.08)",color:"white",cursor:"pointer"},children:d("scenario_action_inspect")}),o.jsx("button",{onClick:()=>{l(null),a("free"),c()},style:{padding:"10px 16px",borderRadius:"999px",border:"1px solid rgba(255, 255, 255, 0.14)",background:"transparent",color:"#dce7ff",cursor:"pointer"},children:d("scenario_action_free_camera")})]})]})})};function sn(){const{t:e}=ie(),s=S(h=>h.simulationState),t=S(h=>h.setSimulationState),n=S(h=>h.bodies),r=S(h=>h.followingBodyId),i=S(h=>h.setFollowingBody),l=S(h=>h.setCameraMode),a=S(h=>h.followingBodyId?h.bodies.find(u=>u.id===h.followingBodyId)?.name:null),[c,d]=_.useState(null),[f,p]=_.useState(0),g=S(h=>h.checkGPUSupport);return _.useEffect(()=>(g(),()=>{S.getState().cleanup()}),[g]),_.useEffect(()=>{},[]),_.useEffect(()=>{if(a){d(a),p(1);const h=setTimeout(()=>{p(0)},2e3);return()=>clearTimeout(h)}else p(0)},[a]),_.useEffect(()=>{const h=u=>{const m=document.activeElement?.tagName.toLowerCase();if(!(m==="input"||m==="textarea")){if(u.code==="Space"&&(u.preventDefault(),t(s==="running"?"paused":"running")),u.ctrlKey&&!u.shiftKey&&u.code==="KeyZ"&&(u.preventDefault(),S.getState().undo()),(u.ctrlKey&&u.code==="KeyY"||u.ctrlKey&&u.shiftKey&&u.code==="KeyZ")&&(u.preventDefault(),S.getState().redo()),u.shiftKey)u.code==="Digit1"&&l("free"),u.code==="Digit2"&&r&&l("sun_lock"),u.code==="Digit3"&&r&&l("surface_lock");else if(u.code.startsWith("Digit")&&!u.ctrlKey&&!u.altKey&&!u.metaKey){const v=Number(u.code.replace("Digit",""));if(!isNaN(v)&&v>=1&&v<=9){const w=v-1;if(w>=0&&w<n.length){const y=n[w];r===y.id?i(null):(i(y.id),S.getState().selectedBodyId&&S.getState().selectBody(y.id))}}}}};return window.addEventListener("keydown",h),()=>window.removeEventListener("keydown",h)},[s,t,n,r,i,l]),o.jsx(en,{children:o.jsx(Qi,{children:o.jsxs("div",{style:{width:"100vw",height:"100vh",overflow:"hidden",position:"relative"},children:[o.jsx(Bi,{}),o.jsx(rn,{}),o.jsxs("div",{className:"app-header",style:{position:"absolute",top:20,left:20,color:"white",fontFamily:"'Inter', sans-serif",pointerEvents:"none",textShadow:"0 2px 4px rgba(0,0,0,0.5)",opacity:S(h=>h.zenMode)?0:1,transition:"opacity 0.5s ease-in-out"},children:[o.jsx("h1",{style:{margin:0,fontWeight:300,fontSize:"2rem",letterSpacing:"-0.02em"},children:e("app_title")}),o.jsx("p",{style:{margin:0,opacity:.7,fontSize:"0.9rem"},children:e("app_subtitle")}),o.jsx("div",{style:{marginTop:"10px",fontSize:"2.5rem",fontWeight:300,opacity:f,transition:"opacity 0.5s ease-in-out",color:"#3b82f6",textShadow:"0 0 10px rgba(59, 130, 246, 0.5)",letterSpacing:"-0.02em"},children:c})]}),o.jsx(Xi,{}),o.jsx(Ji,{})]})})})}qo.createRoot(document.getElementById("root")).render(o.jsx(_.StrictMode,{children:o.jsx(sn,{})}));
