const AdmZip = require('adm-zip')
const archiver = require('archiver');
const argv = require('yargs').argv
const fs = require('fs-extra')
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const sharp = require('sharp');

const tempDirectory = `${__dirname}/temp/`
const outDir = 'out/'
const path = argv.path
const images = []

// scan path for zips
// unpack zips to __dirname/temp
// scan __dirname/temp for nested paths
// convert jpgs to wepb in place
// pack all wepbs into newZip
// move new zip to path

fs.readdir(path, (err, files) => {
	files.forEach(file => {
		const regex = new RegExp(/(.*)\.cbz/)
		const zipFile = file.match(regex)
		if (zipFile) {
			unzip(file)
		}
	});
	const tempDirectories = fs.readdirSync(tempDirectory)
	tempDirectories.forEach(dir => convertJPGStoWEBP(dir))
})

const convertJPGStoWEBP = (dir) => {
	let tempPath = `${tempDirectory}${dir}`
	const content = fs.readdirSync(tempPath)
	if (fs.lstatSync(tempPath + "/" + content[0]).isDirectory()) {
		tempPath += `/${fs.readdirSync(tempPath)[0]}`
	}
	const files = fs.readdirSync(tempPath)
	imagemin([`${tempPath}/*.jpg`], tempPath, {
		use: [
			imageminWebp({
				quality: 80
			})
		]
	}).then(() => {
		console.log("done with ", dir)
		zip(tempPath, dir)
	})
}


const unzip = (file) => {
	new AdmZip(`${path}/${file}`).extractAllTo(__dirname + "/temp/" + file)
}

const zip = (folder, filename) => {

	var output = fs.createWriteStream(outDir + filename + '.zip');
	var archive = archiver('zip');
	archive.pipe(output);

	archive.on('warning', function (err) {
		if (err.code === 'ENOENT') {
			// log warning
		} else {
			// throw error
			throw err;
		}
	});

	archive.on('error', function (err) {
		throw err;
	});

	output.on('close', function () {
		console.log('final size: ', bytesToSize(archive.pointer()));
		console.log(filename, 'has been converted.');
		cleanUp(folder, filename)
	});

	fs.readdirSync(folder)
		.filter(item => item.includes('webp'))
		.forEach(file => archive.append(fs.createReadStream(folder + "/" + file), {
			name: file
		}))

	archive.finalize(function (err, written) {
		if (err) {
			throw err;
		}
	});
}

const cleanUp = (folder, filename) => {
	fs.remove(folder)
		.catch(err => {
			console.error(err)
		})
}

// thanks to William Oliveira for this nice helper function
function bytesToSize(bytes) {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
	if (bytes === 0) return 'n/a'
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
	if (i === 0) return `${bytes} ${sizes[i]})`
	return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
}