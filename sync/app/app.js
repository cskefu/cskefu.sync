'use strict';

require('dotenv').config()
const Koa = require('koa');
const app = new Koa();
const path = require('path');
const cors = require('koa2-cors');
const port = process.env["NODE_PORT"] || 8201;
const bodyParser = require('koa-bodyparser');
const router = require("./routers/index");

app.use(
    cors({
        origin: function (ctx) {
            return '*';
        },
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
        maxAge: 5,
        credentials: true,
        allowMethods: ['GET', 'POST', 'DELETE', 'PUT'],
        allowHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'X-Requested-With',
            'X-CSRFToken',
        ],
    }),
);

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(bodyParser({ jsonLimit: "100mb" }));
app.use(router.routes());
app.use(router.allowedMethods());


let figlet = `
  ..|'''.|  .|'''.|  '||'  |'          '||''''|           .|'''.|                            
.|'     '   ||..  '   || .'      ....   ||  .   ... ...   ||..  '  .... ... .. ...     ....  
||           ''|||.   ||'|.    .|...||  ||''|    ||  ||    ''|||.   '|.  |   ||  ||  .|   '' 
'|.      . .     '||  ||  ||   ||       ||       ||  ||  .     '||   '|.|    ||  ||  ||      
 ''|....'  |'....|'  .||.  ||.  '|...' .||.      '|..'|. |'....|'     '|    .||. ||.  '|...' 
                                                                   .. |                      
                                                                    ''                       
 `

const httpServer = app.listen(port, function () {
    console.log(`
    ${figlet}
=============== Powered by CSKeFu ============
--- https://github.com/cskefu/cskefu.sync ----
Deliver Contact Center in Cloud and OpenSource Era.
___________________________________________________
`);
    console.log('Server listening on port', port);
});
