const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');


describe('TEST API CALLS', () => {

    beforeAll(async () => {
    
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    })

    describe("GET /v1/launches", () => {
        
        test("It should return 200 for all launches", async () => {
            const response = await request(app)
                .get("/v1/launches")
                .expect("Content-Type", /json/)
                .expect(200);
        });
    });

    describe("POST /v1/launches", () => {
        const completeLaunchData = {
            mission: "Enterprise exploration",
            rocket: "ZTM IS1",
            target: "Kepler-442 b",
            launchDate: "January 7, 2028",
        };

        const launchDataWithoutDate = {
            mission: "Enterprise exploration",
            rocket: "ZTM IS1",
            target: "Kepler-442 b",
        };

        const launchDataWithInvalidDate = {
            mission: "Enterprise exploration",
            rocket: "ZTM IS1",
            target: "Kepler-442 b",
            launchDate: "zoot",
        };

        test("It should return 201 for creating a new launch", async () => {
            const response = await request(app)
                .post("/v1/launches")
                .send(completeLaunchData)
                .expect("Content-Type", /json/)
                .expect(201);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();

            expect(responseDate).toEqual(requestDate);
            expect(response.body).toMatchObject(launchDataWithoutDate);
        });

        test("It should catch missing launch properties", async () => {
            const response = await request(app)
                .post("/v1/launches")
                .send(launchDataWithoutDate)
                .expect("Content-Type", /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: "Missing required launch property",
            });
        });

        test("It should check for invalid dates", async () => {
            const response = await request(app)
                .post("/v1/launches")
                .send(launchDataWithInvalidDate)
                .expect("Content-Type", /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: "Invalid launch date",
            });
        });
    });

})


