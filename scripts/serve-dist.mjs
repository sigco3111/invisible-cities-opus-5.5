// Dependency-free local static server. Run from the project root after pnpm build.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const port = Number(process.env.PORT || 5199);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.woff':'font/woff','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  let path=resolve(root,'.'+decodeURIComponent(url.pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
  if((await stat(path)).isDirectory()) path=resolve(path,'index.html');
  const data=await readFile(path);
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'}).end(data);
 }catch{res.writeHead(404).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Local atlas: http://127.0.0.1:${port}/#zaira`));
