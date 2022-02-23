

const mongoose = require("mongoose");

//Connect to Mongo Atlas with URL
const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once("open", () => {
	console.log("Mongodb connection is ready");
});

mongoose.connection.on("error", (error) => {
	console.error(error);
});

async function mongoConnect() {
	await mongoose.connect(MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
}

async function mongoDisconnect() {
	await mongoose.disconnect();
}

module.exports = {
	mongoConnect,
	mongoDisconnect,
};
