const axios = require('axios');
const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');


let defaultFlightNumber = 100;

const spacexUrl = "https://api.spacexdata.com/v4/launches/query";

// Get launches from spacex api and save in our database
async function populateLaunches() {
    console.log("Downloading launch data");
    const response = await axios.post(spacexUrl, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1,
                    },
                },

                {
                    path: "payloads",
                    select: {
                        customers: 1,
                    },
                },
            ],
        },
    });

    if (response.status != 200) {
        console.log('Problem downloading launch data');
         
        throw new Error('Launch data download failed');
    }
    
		const launchDocs = response.data.docs;

		for (const launchDoc of launchDocs) {
			const payloads = launchDoc["payloads"];
			const customers = payloads.flatMap((payload) => {
				return payload["customers"];
			});

			const launch = {
				flightNumber: launchDoc["flight_number"],
				mission: launchDoc["name"],
				rocket: launchDoc["rocket"]["name"],
				launchDate: launchDoc["date_local"],
				target: "Kepler-442 b",
				customers,
				upcoming: launchDoc["upcoming"],
				success: launchDoc["success"],
			};

			console.log(`${launch.flightNumber}, ${launch.mission}`);
             await saveLaunch(launch);
		}

  
    
}

// Export function to load our spacex data into our database before server beings to listen
async function loadLaunchData() {
    

    const firstLaunch = await findLaunch({
        flightNumber: 1,
        mission: 'FalconSat',
        rocket: "Falcon 1"
    });

    if (firstLaunch) {
        console.log('Launch data already loaded');
    } else {
        await populateLaunches();
    }

    
}

async function getAllLaunches(skip, limit) {
    return await launchesDatabase.find({},
        { '_id': 0, '__v': 0 })
        .sort({flightNumber: 1})
        .skip(skip)
        .limit(limit);
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    });
}

async function getLatestFlightNumber() {
    
    const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber')

    if (!latestLaunch) {
        return defaultFlightNumber;
    }

    return latestLaunch.flightNumber;
}

async function saveLaunch(launch) {

    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}


// save new launch from our launch page on frontend
async function scheduleNewLaunch(launch) {

    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error("No matching planet found");
    }


    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        upcoming: true,
        success: true,
        customers: ['Zero To Mastery', 'NASA']
    });

    await saveLaunch(newLaunch);
}


async function abortLaunchById(launchId) {

    const aborted =  await launchesDatabase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false,

    });

    return aborted.acknowledged === true && aborted.modifiedCount === 1;
    

}


module.exports = {
	existsLaunchWithId,
	getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
    loadLaunchData
};