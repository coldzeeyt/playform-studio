const {app,BrowserWindow}=require('electron');
const {createGameServer}=require('./server.cjs');
let server,window;
app.whenReady().then(async()=>{server=await createGameServer(__dirname);const address=server.address();window=new BrowserWindow({width:1280,height:800,minWidth:640,minHeight:400,backgroundColor:'#141622',title:require('./game-project.json').name,autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});window.webContents.setWindowOpenHandler(({url})=>{if(/^https?:\/\//.test(url))require('electron').shell.openExternal(url);return{action:'deny'}});window.loadURL(`http://127.0.0.1:${address.port}/`)});
app.on('window-all-closed',()=>app.quit());app.on('before-quit',()=>server?.close());
