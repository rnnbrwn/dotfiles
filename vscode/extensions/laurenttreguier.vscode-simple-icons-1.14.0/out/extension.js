(()=>{"use strict";var e={959:function(e,o,t){var n=this&&this.__awaiter||function(e,o,t,n){return new(t||(t=Promise))((function(i,r){function s(e){try{a(n.next(e))}catch(e){r(e)}}function c(e){try{a(n.throw(e))}catch(e){r(e)}}function a(e){var o;e.done?i(e.value):(o=e.value,o instanceof t?o:new t((function(e){e(o)}))).then(s,c)}a((n=n.apply(e,o||[])).next())}))};Object.defineProperty(o,"__esModule",{value:!0}),o.deactivate=o.activate=void 0;const i=t(747),r=t(622),s=t(549),c=/#[0-9A-F]{6}(?![0-9A-F])/gi;function a(e){return n(this,void 0,void 0,(function*(){-1!==[yield l(e),yield u("folder",e),yield u("file",e)].indexOf(!0)&&(yield s.window.showInformationMessage("The window must be reloaded for changes to take effet","Reload").then((e=>e?s.commands.executeCommand("workbench.action.reloadWindow"):null)))}))}function l(e){return n(this,void 0,void 0,(function*(){const o=["simple","minimalistic"].map((e=>e+"-icons.json"));let t=!1;for(const i of o)yield d(e,i,(e=>n(this,void 0,void 0,(function*(){let o=JSON.parse(e);const n=s.workspace.getConfiguration("simpleIcons").get("hideArrows",!1);return o.hidesExplorerArrows===n?null:(t=!0,o.hidesExplorerArrows=n,JSON.stringify(o,null,4))}))));return t}))}function u(e,o){return n(this,void 0,void 0,(function*(){const t=`simple.${e}.color`;let i=s.workspace.getConfiguration("simpleIcons").get(t,null);const a=o.globalState.get(t);if(i){if(!i.match(c))return yield s.window.showWarningMessage(`Icon color for '${e}' not in hex format, color not changed`),!1}else{if(!a)return!1;i=a,yield o.globalState.update(t,void 0)}const l=("folder"==e?[e,e+".expanded"]:[e]).map((e=>r.join("icons","simple-icons",e)+".svg"));let u=!1;for(const e of l)yield d(o,e,(e=>n(this,void 0,void 0,(function*(){const n=e.match(c)[0];return n===i?null:(u=!0,i!==a&&(yield o.globalState.update(t,n)),e.replace(c,i))}))));return u}))}function d(e,o,t){return n(this,void 0,void 0,(function*(){const n=e.asAbsolutePath(o),r=yield new Promise((e=>i.readFile(n,((o,t)=>e(t.toString()))))),s=yield t(r);if(s)return yield new Promise((e=>i.writeFile(n,s,(o=>e()))))}))}o.activate=function(e){return n(this,void 0,void 0,(function*(){return e.subscriptions.push(s.workspace.onDidChangeConfiguration((()=>a(e)))),yield a(e)}))},o.deactivate=function(){return n(this,void 0,void 0,(function*(){}))}},747:e=>{e.exports=require("fs")},622:e=>{e.exports=require("path")},549:e=>{e.exports=require("vscode")}},o={},t=function t(n){var i=o[n];if(void 0!==i)return i.exports;var r=o[n]={exports:{}};return e[n].call(r.exports,r,r.exports,t),r.exports}(959);module.exports=t})();
//# sourceMappingURL=extension.js.map