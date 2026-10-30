/* Hero background. Plays assets/hero.mp4 if you add one (your own licensed clip);
   otherwise renders a live, original cinematic scene: cool skyline, out-of-focus rails and lights, slow camera drift. */
(() => {
  'use strict';
  const canvas = document.getElementById('hero-gl'), video = document.getElementById('hero-video');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uScroll;
float h11(float n){return fract(sin(n*12.9898)*43758.5453);}
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*vn(p);p*=2.02;a*=.5;}return v;}
float band(float y,float c,float hw,float soft){return smoothstep(hw+soft,max(hw-soft,0.),abs(y-c));}
float layer(vec2 uv,float cols,float seed,float base,float hmax,float soft,out float win){
  float x=uv.x*cols;float id=floor(x);
  float hh=base+hmax*pow(h11(id+seed),1.7);
  float m=smoothstep(hh+soft,hh-soft,uv.y);
  vec2 wc=vec2(x*5.,uv.y*90.);
  win=step(.72,h21(floor(wc)+seed))*step(.25,fract(wc.x))*step(.3,fract(wc.y))*m;
  return m;}
void main(){
  vec2 frag=gl_FragCoord.xy;vec2 uv=frag/uRes;float asp=uRes.x/uRes.y;float t=uTime;
  vec2 cam=vec2(sin(t*.17)*.012+(uMouse.x-.5)*.035,cos(t*.13)*.006+(uMouse.y-.5)*.02);
  vec3 skyTop=vec3(.70,.78,.84),skyHor=vec3(.52,.64,.74);
  vec3 col=mix(skyHor,skyTop,smoothstep(.25,1.,uv.y+cam.y*2.));
  col+=(fbm(vec2(uv.x*asp*2.+t*.02,uv.y*3.))-.5)*.10;
  vec3 haze=vec3(.58,.69,.79);float w;
  float m=layer(vec2(uv.x*asp+cam.x*.6,uv.y),9.,3.,.34,.22,.004,w);col=mix(col,mix(haze,vec3(.30,.40,.50),.35),m*.85);
  m=layer(vec2(uv.x*asp+cam.x*1.1+.3,uv.y),14.,11.,.28,.26,.003,w);col=mix(col,vec3(.20,.29,.38),m);col+=vec3(1.,.9,.6)*w*.5;
  float tc=asp*.46+cam.x*1.4;float dx=abs(uv.x*asp-tc);
  float bw=mix(.030,.007,smoothstep(.22,.64,uv.y));
  float body=smoothstep(bw+.002,bw-.002,dx)*step(uv.y,.64)*step(.2,uv.y);
  float ant=smoothstep(.003,.001,dx)*step(.64,uv.y)*step(uv.y,.86);
  col=mix(col,vec3(.13,.21,.30),body);col=mix(col,vec3(.10,.16,.22),ant);
  col+=vec3(1.,.25,.15)*smoothstep(.014,.002,length(vec2(dx,uv.y-.865)))*(.5+.5*sin(t*3.));
  m=layer(vec2(uv.x*asp+cam.x*1.8+.7,uv.y),7.,23.,.22,.20,.003,w);col=mix(col,vec3(.10,.16,.22),m);col+=vec3(1.,.82,.5)*w*.6;
  col=mix(col,haze*1.04,exp(-pow((uv.y-.3)*5.,2.))*.32);
  float fb=.012+.010*sin(t*.35);
  float rail=band(uv.y+(uv.x-.5)*.04,.115,.055,fb+.012);
  vec3 railC=mix(vec3(.05,.07,.08),vec3(.30,.35,.38),smoothstep(-.02,.06,uv.y-.1)*.8);
  float cab1=band(uv.y-(uv.x-.5)*.09,.25,.006,fb)*.8;
  float cab2=band(uv.y-(uv.x-.5)*.07,.287,.004,fb)*.7;
  col=mix(col,vec3(.05,.07,.09),cab1);col=mix(col,vec3(.05,.07,.09),cab2);
  col=mix(col,railC,rail);
  float px=fract(t*.032)*1.5-.25;
  float post=smoothstep(.07,.02,abs(uv.x-px))*smoothstep(.78,.52,uv.y);
  col=mix(col,vec3(.04,.05,.06),post*.85);
  for(int i=0;i<10;i++){float fi=float(i);
    vec2 c=vec2(fract(h11(fi)*7.+t*(.008+.02*h11(fi+3.))),.12+.78*h11(fi+9.));c.x*=asp;
    float r=.03+.05*h11(fi+5.);float d=length(vec2(uv.x*asp,uv.y)-c);
    col+=vec3(.9,.95,1.)*smoothstep(r,r*.7,d)*.10*h11(fi+1.);
    col+=vec3(1.,.82,.55)*smoothstep(r*1.08,r*.97,d)*(1.-smoothstep(r*.97,r*.82,d))*.05;}
  col=pow(col,vec3(1.08));col*=.80;col*=vec3(.95,1.,1.05);
  col=mix(vec3(dot(col,vec3(.33))),col,.88);
  float vg=smoothstep(1.2,.3,length((uv-.5)*vec2(asp*.8,1.)));col*=mix(.5,1.,vg);
  col+=(h21(frag+fract(t)*91.)-.5)*.055;
  col*=1.-clamp(uScroll,0.,1.)*.75;
  gl_FragColor=vec4(col,1.);}`;

  let running = false, visible = true;
  function useVideo() {
    video.hidden = false; canvas.hidden = true;
    video.poster = 'assets/hero-poster.jpg'; video.muted = true; video.loop = true;
    video.addEventListener('canplay', () => video.play().catch(() => {}), { once: true });
    video.src = 'assets/hero.mp4'; video.load();
    document.body.classList.add('has-video');
  }
  /* is there a clip you added? */
  fetch('assets/hero.mp4', { method: 'HEAD' }).then(r => { if (r.ok && +(r.headers.get('content-length') || 1) > 1000) useVideo(); }).catch(() => {});

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) { canvas.style.background = 'linear-gradient(#b4c6d4,#42586a)'; return; }
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); canvas.style.background = 'linear-gradient(#b4c6d4,#42586a)'; return; }
  gl.useProgram(prog); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n), uRes = U('uRes'), uTime = U('uTime'), uMouse = U('uMouse'), uScroll = U('uScroll');
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }; let scroll = 0;
  function resize() {
    const k = Math.min(devicePixelRatio || 1, 1.5) * 0.65;
    canvas.width = Math.max(2, Math.floor(innerWidth * k)); canvas.height = Math.max(2, Math.floor(innerHeight * k)); gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize(); addEventListener('resize', () => { resize(); draw(performance.now()); });
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight; });
  addEventListener('scroll', () => { scroll = scrollY / innerHeight; visible = scroll < 1.3; }, { passive: true });
  function draw(now) {
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
    gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform1f(uTime, reduce ? 3 : now / 1000); gl.uniform2f(uMouse, mouse.x, mouse.y); gl.uniform1f(uScroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) { if (visible && !canvas.hidden) draw(now); if (!reduce) requestAnimationFrame(loop); }
  draw(performance.now()); requestAnimationFrame(loop);
})();
