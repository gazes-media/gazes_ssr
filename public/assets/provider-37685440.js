var d=Object.defineProperty;var s=(i,e,t)=>e in i?d(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var r=(i,e,t)=>(s(i,typeof e!="symbol"?e+"":e,t),t);import{H as o}from"./provider-2765c2c9.js";import"./index-4449efdd.js";class P extends o{constructor(){super(...arguments);r(this,"$$PROVIDER_TYPE","AUDIO")}get type(){return"audio"}setup(t){super.setup(t),this.type==="audio"&&t.delegate.R("provider-setup",{detail:this})}get audio(){return this.k}}export{P as AudioProvider};