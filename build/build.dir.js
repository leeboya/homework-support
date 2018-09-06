const fs = require('fs');
const readline = require('readline');
const {
	exec
} = require('child_process');
const dirPath = "./styl"

fs.readdir(dirPath, function (err, ary) {
	if (err) throw err;
	const dirs = ary.filter(function (pathname) {
		return fs.statSync(dirPath + "/" + pathname).isDirectory()
	});
	dirs.unshift("");

	//创建readline接口实例
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	const list = dirs.map(function (filename, i) {
		return `${i}:${dirPath}/${filename}`
	}).join('\n');

	// question方法
	rl.question(`\n\n\n选择一个目录:\n${list}\n输入数字:`, function (answer) {
		var filename = dirs[answer];
		if (typeof filename === "string") {
			buildStylus(`${dirPath}/${filename}`)
			rl.close();
		}
	})
})

function travelOne(dir, callback) {
	dir += "/";
	callback(dir);

	fs.readdir(dir, function (file, files) {
		if (files && files.length) {
			files.forEach(function (file, i) {
				const pathname = dir + file;

				if (fs.statSync(pathname).isDirectory()) {
					travelOne(pathname, callback);
				}
			})
		}
	});
}

function buildStylus(startPath) {
	travelOne(startPath, function (dir) {
		console.log(`child_process ${new Array(30).join('-')} ${dir}`);
		var ls = exec(`stylus -w ${dir.replace('./styl', 'styl')} -o ${dir.replace('./styl', 'css')}`, (error,
			stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
		});
		ls.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});

		ls.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});

		ls.on('close', (code) => {
			console.log(`子进程退出码：${code}`);
		});
	})
}
