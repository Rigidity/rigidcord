const fs = require('fs-extra');
const path = require('path');

const res = module.exports = {};

res.exists = file => fs.existsSync(file);
res.read = file => fs.readFileSync(file, "utf-8");
res.write = (file, text) => fs.writeFileSync(file, text, "utf-8");
res.create = file => fs.ensureFileSync(file);
res.delete = file => fs.removeSync(file);
res.load = file => fs.readJsonSync(file);
res.save = (file, data) => fs.writeJsonSync(file, data);
res.move = (src, dest) => fs.moveSync(src, dest);
res.empty = dir => fs.emptyDirSync(dir);
res.copy = (src, dest) => fs.copySync(src, dest);
res.ensure = dir => fs.ensureDirSync(dir);
res.append = (file, text) => fs.writeFileSync(file, fs.readFileSync(file, "utf-8") + text, "utf-8");
res.edit = (file, handler) => {
	const data = fs.readJsonSync(file);
	const res = handler(data);
	fs.writeJsonSync(file, data);
	return res;
};
res.list = dir => fs.readdirSync(dir);
res.base = file => path.basename(file);
res.dir = file => path.dirname(file);
res.path = (...items) => path.join(...items);
res.ext = file => path.extname(file);
res.name = file => path.basename(file, path.extname(file));
res.file = path => {
	try {
		const stat = fs.lstatSync(path);
		return stat.isDirectory();
	} catch {
		return false;
	}
};
res.folder = path => {
	try {
		const stat = fs.lstatSync(path);
		return !stat.isDirectory();
	} catch {
		return false;
	}
};