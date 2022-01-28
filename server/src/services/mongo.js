const mongoose = require('mongoose');

//Connect to Mongo Atlas with URL 
const MONGO_URL = "mongodb+srv://tamarah:arsenalfc2@cluster0.6eiap.mongodb.net/nasa?retryWrites=true&w=majority";

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
    mongoDisconnect
}