module.exports=function(e){var t={};function n(o){if(t[o])return t[o].exports;var i=t[o]={i:o,l:!1,exports:{}};return e[o].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(o,i,function(t){return e[t]}.bind(null,i));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";var o=this&&this.__awaiter||function(e,t,n,o){return new(n||(n=Promise))((function(i,r){function u(e){try{l(o.next(e))}catch(e){r(e)}}function c(e){try{l(o.throw(e))}catch(e){r(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(u,c)}l((o=o.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.deactivate=t.activate=void 0;const i=n(1),r=n(2),u=n(3),c=/#[0-9A-F]{6}(?![0-9A-F])/gi;function l(e){return o(this,void 0,void 0,(function*(){-1!==[yield s(e),yield a("folder",e),yield a("file",e)].indexOf(!0)&&(yield u.window.showInformationMessage("The window must be reloaded for changes to take effet","Reload").then(e=>e?u.commands.executeCommand("workbench.action.reloadWindow"):null))}))}function s(e){return o(this,void 0,void 0,(function*(){const t=["simple","minimalistic"].map(e=>e+"-icons.json");let n=!1;for(const i of t)yield d(e,i,e=>o(this,void 0,void 0,(function*(){let t=JSON.parse(e);const o=u.workspace.getConfiguration("simpleIcons").get("hideArrows",!1);return t.hidesExplorerArrows===o?null:(n=!0,t.hidesExplorerArrows=o,JSON.stringify(t,null,4))})));return n}))}function a(e,t){return o(this,void 0,void 0,(function*(){const n=`simple.${e}.color`;let i=u.workspace.getConfiguration("simpleIcons").get(n,null);const l=t.globalState.get(n);if(i){if(!i.match(c))return yield u.window.showWarningMessage(`Icon color for '${e}' not in hex format, color not changed`),!1}else{if(!l)return!1;i=l,yield t.globalState.update(n,void 0)}const s=("folder"==e?[e,e+".expanded"]:[e]).map(e=>r.join("icons","simple-icons",e)+".svg");let a=!1;for(const e of s)yield d(t,e,e=>o(this,void 0,void 0,(function*(){const o=e.match(c)[0];return o===i?null:(a=!0,i!==l&&(yield t.globalState.update(n,o)),e.replace(c,i))})));return a}))}function d(e,t,n){return o(this,void 0,void 0,(function*(){const o=e.asAbsolutePath(t),r=yield new Promise(e=>i.readFile(o,(t,n)=>e(n.toString()))),u=yield n(r);if(u)return yield new Promise(e=>i.writeFile(o,u,t=>e()))}))}t.activate=function(e){return o(this,void 0,void 0,(function*(){return e.subscriptions.push(u.workspace.onDidChangeConfiguration(()=>l(e))),yield l(e)}))},t.deactivate=function(){return o(this,void 0,void 0,(function*(){}))}},function(e,t){e.exports=require("fs")},function(e,t){e.exports=require("path")},function(e,t){e.exports=require("vscode")}]);
//# sourceMappingURL=extension.js.map