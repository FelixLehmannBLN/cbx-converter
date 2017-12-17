const fs = require('fs')
const argv = require('yargs').argv
const AdmZip = require('adm-zip')
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');


const path = argv.path

// scan path for zips
// unpack zips to __dirname/temp
// scan __dirname/temp for nested paths
// convert jpgs to wepb in place
// pack all wepbs into newZip
// move new zip to path

fs.readdir(path, (err, files) => {
  files.forEach(file => {
		// unzip(file);
		const regex = new RegExp(/(.*)\.cbz/)
		const zipFile = file.match(regex)
		if(zipFile) {
			console.log(unzip(file));
		}
  });
})

const unzip = (file) => {
	const zip = new AdmZip(`${path}/${file}`);
	const fileNameRegEx = new RegExp(/(.*)\.jpg/)
	const zipEntries = zip.getEntries(); // an array of ZipEntry records
	const newZip = new AdmZip();
	// converToWebp(zipEntries);
	// const shortName = zipEntries[0].entryName.match(fileNameRegEx)[1]

	zipEntries.forEach(entry => converToWebp(zip.readFile(entry)))

	zipEntries.forEach(entry => {
		newZip.addFile(
			`${entry.entryName}.wepb`,
			converToWebp(zip.readFile(entry))
		)
	})

	// zip.extractAllTo(`${path}/temp`, false)
	// console.log(zipEntries[0].entryName)
	// console.log(zipEntries[0].rawEntryName.toString())
	// console.log(zipEntries[0].extra.toString())
	// console.log(zipEntries[0].name)
	// console.log(converToWebp(zipEntries[0].entryName, shortName))
}

const converToWebp = (entry) => {
	// console.log('entry', __dirname)
	imagemin.buffer(entry, {
		use: [
			imageminWebp({quality: 80})
		]
	}).then((outBuffer) => {
		console.log('Images optimized');
		console.log('Outbuffer', outBuffer);
		return outBuffer
	});
}



