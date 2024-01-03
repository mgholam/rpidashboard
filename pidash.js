var http = require('http');
var fs = require('fs');

const { execSync } = require('child_process');
var index = fs.readFileSync('index.html').toString();
var skeleton = fs.readFileSync('skeleton.css');

function sysinfo(){
    //  11:15:25 up 2 days, 16 min,  0 users,  load average: 0.16, 0.03, 0.01
    var uptime = execSync('/usr/bin/uptime').toString().trim();
    // 35800
    var temp = execSync('/bin/sh -c "cat /sys/class/thermal/thermal_zone0/temp"').toString();
    temp = Number(temp)/1000;
    // [ key : value \n]^n
    var cpuinfo = execSync('/bin/sh -c "cat /proc/cpuinfo"').toString();
    var disks = execSync('/bin/df -h').toString();
    var memory = execSync('/usr/bin/free -h').toString();

    var ss = uptime.split("  ");
    var o = {
        uptime : ss[0].replace(",","")+ " " + ss[1].replace(",",""),
        users : ss[2].replace(",",""),
        load : ss[3],
        temp,
        cpuinfo,
        disks,
        memory
    };
    return JSON.stringify(o);
}

var server = http.createServer(function (req, res) {
    try {
        if(req.url == '/'){
            res.writeHead(200, { 'Content-Type': 'text/html' });
            var o = index.replace("//d=", "d=" + sysinfo());
            res.write(o);
            res.end();
            return;
        }
        if(req.url == '/skeleton.css'){
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.write(skeleton);
            res.end();
            return;
        }
        if (req.url == '/exec/sysinfo') {
            var o = sysinfo();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(o);
            res.end();
            return;
        }
    } catch (e) {
        console.log(e)
    }
});

var port = 5432;
server.listen(port);

console.log(`rename web server at port ${port} is running..`)
